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

    const result = await prisma.travelPersonalityResult.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { travelPersonality: true, explorerLevel: true, totalPoints: true },
    });

    return NextResponse.json({ personality: result, stats: user });
  } catch (error) {
    console.error("Error fetching personality:", error);
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
    const { personality, personalityIcon, description, traits, answers } = body;

    const result = await prisma.travelPersonalityResult.create({
      data: {
        userId: session.user.id,
        personality,
        personalityIcon,
        description,
        traits,
        answers: JSON.stringify(answers),
      },
    });

    // Update user's travel personality
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        travelPersonality: personality,
        totalPoints: { increment: 50 },
      },
    });

    // Award badge for completing quiz
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId: session.user.id, badgeId: "personality-discovered" } },
      update: {},
      create: {
        userId: session.user.id,
        badgeId: "personality-discovered",
        badgeName: "Self-Discovery",
        badgeIcon: "🧭",
        badgeDesc: "Completed the travel personality quiz",
        category: "milestone",
      },
    });

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error saving personality:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
