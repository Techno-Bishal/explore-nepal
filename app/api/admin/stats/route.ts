export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    if (!session?.user || (role !== "admin" && role !== "moderator")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [totalDestinations, totalUsers, totalFavorites, totalCategories, featuredCount, trendingCount, totalReviews, totalPosts] = await Promise.all([
      prisma.destination.count(),
      prisma.user.count(),
      prisma.favorite.count(),
      prisma.category.count(),
      prisma.destination.count({ where: { isFeatured: true } }),
      prisma.destination.count({ where: { isTrending: true } }),
      prisma.review.count(),
      prisma.travelPost.count(),
    ]);

    return NextResponse.json({
      stats: {
        totalDestinations: totalDestinations ?? 0,
        totalUsers: totalUsers ?? 0,
        totalFavorites: totalFavorites ?? 0,
        totalCategories: totalCategories ?? 0,
        featuredCount: featuredCount ?? 0,
        trendingCount: trendingCount ?? 0,
        totalReviews: totalReviews ?? 0,
        totalPosts: totalPosts ?? 0,
      },
    });
  } catch (error: any) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
