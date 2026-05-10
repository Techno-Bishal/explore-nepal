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
    const userId = (session?.user as any)?.id ?? "";
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        destination: {
          include: {
            categories: { include: { category: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ favorites: favorites ?? [] });
  } catch (error: any) {
    console.error("Favorites fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session?.user as any)?.id ?? "";
    const body = await request.json();
    const destinationId = body?.destinationId ?? "";

    const existing = await prisma.favorite.findUnique({
      where: { userId_destinationId: { userId, destinationId } },
    });
    if (existing) {
      return NextResponse.json({ message: "Already favorited" });
    }

    const fav = await prisma.favorite.create({
      data: { userId, destinationId },
    });
    return NextResponse.json({ favorite: fav });
  } catch (error: any) {
    console.error("Favorite create error:", error);
    return NextResponse.json({ error: "Failed to add favorite" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session?.user as any)?.id ?? "";
    const body = await request.json();
    const destinationId = body?.destinationId ?? "";

    await prisma.favorite.deleteMany({
      where: { userId, destinationId },
    });
    return NextResponse.json({ message: "Removed" });
  } catch (error: any) {
    console.error("Favorite delete error:", error);
    return NextResponse.json({ error: "Failed to remove favorite" }, { status: 500 });
  }
}
