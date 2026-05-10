export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params?.slug ?? "";
    const destination = await prisma.destination.findUnique({
      where: { slug },
      include: {
        categories: {
          include: { category: true },
        },
        _count: {
          select: { favorites: true },
        },
      },
    });

    if (!destination) {
      return NextResponse.json({ error: "Destination not found" }, { status: 404 });
    }

    return NextResponse.json({ destination });
  } catch (error: any) {
    console.error("Destination fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch destination" }, { status: 500 });
  }
}
