export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [visitedCount, wishlistCount, reviewCount, postCount, badgeCount, user] = await Promise.all([
      prisma.visitedPlace.count({ where: { userId: session.user.id } }),
      prisma.wishlistItem.count({ where: { userId: session.user.id } }),
      prisma.review.count({ where: { userId: session.user.id } }),
      prisma.travelPost.count({ where: { userId: session.user.id } }),
      prisma.userBadge.count({ where: { userId: session.user.id } }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { travelPersonality: true, explorerLevel: true, totalPoints: true },
      }),
    ]);

    const totalDestinations = await prisma.destination.count();

    return NextResponse.json({
      visitedCount,
      wishlistCount,
      reviewCount,
      postCount,
      badgeCount,
      totalDestinations,
      explorerLevel: user?.explorerLevel || 1,
      totalPoints: user?.totalPoints || 0,
      travelPersonality: user?.travelPersonality,
      explorationPercentage: Math.round((visitedCount / totalDestinations) * 100),
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
