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

    const badges = await prisma.userBadge.findMany({
      where: { userId: session.user.id },
      orderBy: { earnedAt: "desc" },
    });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { explorerLevel: true, totalPoints: true, travelPersonality: true },
    });

    // Define all possible badges for display
    const allBadges = [
      { id: "personality-discovered", name: "Self-Discovery", icon: "🧭", desc: "Complete the travel personality quiz", category: "milestone" },
      { id: "first-steps", name: "First Steps", icon: "👣", desc: "Mark your first visited destination", category: "exploration" },
      { id: "explorer-5", name: "Explorer", icon: "🗺️", desc: "Visit 5 destinations", category: "exploration" },
      { id: "adventurer-10", name: "Adventurer", icon: "⛰️", desc: "Visit 10 destinations", category: "exploration" },
      { id: "pathfinder-20", name: "Pathfinder", icon: "🏔️", desc: "Visit 20 destinations", category: "exploration" },
      { id: "nepal-master-30", name: "Nepal Master", icon: "👑", desc: "Visit 30 destinations", category: "exploration" },
      { id: "first-review", name: "Reviewer", icon: "⭐", desc: "Write your first review", category: "community" },
      { id: "storyteller", name: "Storyteller", icon: "📖", desc: "Share your first travel story", category: "community" },
      { id: "high-altitude", name: "High Altitude Hero", icon: "🦅", desc: "Visit a destination above 4,000m", category: "achievement" },
      { id: "culture-lover", name: "Culture Enthusiast", icon: "🎭", desc: "Visit 5 cultural/temple destinations", category: "achievement" },
      { id: "trip-planner", name: "Trip Planner", icon: "📋", desc: "Generate your first AI trip plan", category: "milestone" },
    ];

    const earnedIds = new Set(badges.map(b => b.badgeId));

    return NextResponse.json({
      earned: badges,
      all: allBadges.map(b => ({ ...b, earned: earnedIds.has(b.id) })),
      stats: user,
    });
  } catch (error) {
    console.error("Error fetching badges:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
