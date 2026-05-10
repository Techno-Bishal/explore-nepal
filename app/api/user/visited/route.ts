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

    const visited = await prisma.visitedPlace.findMany({
      where: { userId: session.user.id },
      include: {
        destination: {
          select: {
            id: true, name: true, slug: true, imageUrl: true,
            location: true, difficultyLevel: true, altitude: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ visited });
  } catch (error) {
    console.error("Error fetching visited places:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { destinationId, visitedDate, notes, rating } = body;

    const visited = await prisma.visitedPlace.upsert({
      where: { userId_destinationId: { userId: session.user.id, destinationId } },
      update: { visitedDate: visitedDate ? new Date(visitedDate) : undefined, notes, rating },
      create: {
        userId: session.user.id,
        destinationId,
        visitedDate: visitedDate ? new Date(visitedDate) : undefined,
        notes,
        rating,
      },
    });

    // Update user points
    await prisma.user.update({
      where: { id: session.user.id },
      data: { totalPoints: { increment: 25 } },
    });

    // Check for milestone badges
    const visitedCount = await prisma.visitedPlace.count({ where: { userId: session.user.id } });
    const badgeMilestones = [
      { count: 1, id: "first-steps", name: "First Steps", icon: "👣", desc: "Marked your first visited destination" },
      { count: 5, id: "explorer-5", name: "Explorer", icon: "🗺️", desc: "Visited 5 destinations in Nepal" },
      { count: 10, id: "adventurer-10", name: "Adventurer", icon: "⛰️", desc: "Visited 10 destinations in Nepal" },
      { count: 20, id: "pathfinder-20", name: "Pathfinder", icon: "🏔️", desc: "Visited 20 destinations in Nepal" },
      { count: 30, id: "nepal-master-30", name: "Nepal Master", icon: "👑", desc: "Visited 30 destinations in Nepal" },
    ];

    for (const milestone of badgeMilestones) {
      if (visitedCount >= milestone.count) {
        await prisma.userBadge.upsert({
          where: { userId_badgeId: { userId: session.user.id, badgeId: milestone.id } },
          update: {},
          create: {
            userId: session.user.id,
            badgeId: milestone.id,
            badgeName: milestone.name,
            badgeIcon: milestone.icon,
            badgeDesc: milestone.desc,
            category: "exploration",
          },
        });
      }
    }

    // Update explorer level
    const newLevel = Math.min(10, Math.floor(visitedCount / 3) + 1);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { explorerLevel: newLevel },
    });

    return NextResponse.json({ visited, visitedCount });
  } catch (error) {
    console.error("Error marking visited:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const destinationId = searchParams.get("destinationId");
    if (!destinationId) {
      return NextResponse.json({ error: "destinationId required" }, { status: 400 });
    }

    await prisma.visitedPlace.deleteMany({
      where: { userId: session.user.id, destinationId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing visited:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
