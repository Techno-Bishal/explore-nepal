export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sanitizeInput, checkRateLimit } from "@/lib/security";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request?.url ?? "http://localhost:3000");
    const rawQ = searchParams?.get("q") ?? "";

    // Sanitize and validate search input
    const q = sanitizeInput(rawQ).slice(0, 100);

    if (!q || q.length < 2) {
      return NextResponse.json({ destinations: [] });
    }

    // Rate limit search: 30 requests per minute per IP-like key
    const clientKey = request.headers?.get("x-forwarded-for") || "anon";
    const rl = checkRateLimit(`search:${clientKey}`, 30, 60000);
    if (!rl.allowed) {
      return NextResponse.json({ destinations: [] });
    }

    // Use decoded query for Prisma (sanitizeInput encodes HTML entities)
    const searchQuery = rawQ.trim().slice(0, 100);

    const destinations = await prisma.destination.findMany({
      where: {
        OR: [
          { name: { contains: searchQuery, mode: "insensitive" } },
          { location: { contains: searchQuery, mode: "insensitive" } },
          { shortDescription: { contains: searchQuery, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        location: true,
        imageUrl: true,
        shortDescription: true,
      },
      take: 8,
    });

    return NextResponse.json({ destinations: destinations ?? [] });
  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json({ destinations: [] });
  }
}
