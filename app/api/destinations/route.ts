export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request?.url ?? "http://localhost:3000");
    const category = searchParams?.get("category") ?? "";
    const difficulty = searchParams?.get("difficulty") ?? "";
    const budget = searchParams?.get("budget") ?? "";
    const season = searchParams?.get("season") ?? "";
    const familyFriendly = searchParams?.get("familyFriendly") ?? "";
    const featured = searchParams?.get("featured") ?? "";
    const trending = searchParams?.get("trending") ?? "";
    const sortBy = searchParams?.get("sortBy") ?? "name";
    const rawPage = parseInt(searchParams?.get("page") ?? "1", 10);
    const rawLimit = parseInt(searchParams?.get("limit") ?? "12", 10);
    const page = Math.max(1, Math.min(rawPage || 1, 100));
    const limit = Math.max(1, Math.min(rawLimit || 12, 50));

    const where: any = {};

    if (category) {
      where.categories = {
        some: {
          category: { slug: category },
        },
      };
    }
    if (difficulty) {
      where.difficultyLevel = difficulty;
    }
    if (budget) {
      where.budgetLevel = budget;
    }
    if (season) {
      where.bestSeason = { contains: season, mode: "insensitive" };
    }
    if (familyFriendly === "true") {
      where.familyFriendly = true;
    }
    if (featured === "true") {
      where.isFeatured = true;
    }
    if (trending === "true") {
      where.isTrending = true;
    }

    const orderBy: any = sortBy === "altitude" ? { altitude: "desc" } :
      sortBy === "adventure" ? { adventureLevel: "desc" } :
      sortBy === "newest" ? { createdAt: "desc" } :
      { name: "asc" };

    const [destinations, total] = await Promise.all([
      prisma.destination.findMany({
        where,
        include: {
          categories: {
            include: { category: true },
          },
        },
        orderBy,
        skip: ((page ?? 1) - 1) * (limit ?? 12),
        take: limit ?? 12,
      }),
      prisma.destination.count({ where }),
    ]);

    return NextResponse.json({
      destinations: destinations ?? [],
      total: total ?? 0,
      page: page ?? 1,
      totalPages: Math.ceil((total ?? 0) / (limit ?? 12)),
    });
  } catch (error: any) {
    console.error("Destinations fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch destinations" }, { status: 500 });
  }
}
