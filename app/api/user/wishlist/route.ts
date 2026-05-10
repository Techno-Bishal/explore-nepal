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

    const wishlist = await prisma.wishlistItem.findMany({
      where: { userId: session.user.id },
      include: {
        destination: {
          select: {
            id: true, name: true, slug: true, imageUrl: true,
            location: true, difficultyLevel: true, budgetLevel: true,
            budgetEstimateLow: true, budgetEstimateMid: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ wishlist });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
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
    const { destinationId, priority, notes } = body;

    const item = await prisma.wishlistItem.upsert({
      where: { userId_destinationId: { userId: session.user.id, destinationId } },
      update: { priority, notes },
      create: {
        userId: session.user.id,
        destinationId,
        priority: priority || 0,
        notes,
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
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

    await prisma.wishlistItem.deleteMany({
      where: { userId: session.user.id, destinationId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
