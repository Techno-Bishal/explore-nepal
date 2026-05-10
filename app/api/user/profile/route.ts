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
    const userId = (session.user as any).id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, image: true,
        bio: true, travelStyle: true, location: true, role: true, createdAt: true,
        profilePrivacy: true, lastLoginAt: true,
        _count: { select: { favorites: true, reviews: true, travelPosts: true } },
      },
    });
    return NextResponse.json({ user });
  } catch (e: any) {
    console.error("Profile GET error:", e);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const body = await req.json();
    const { name, bio, travelStyle, location, image } = body;

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (bio !== undefined) data.bio = bio;
    if (travelStyle !== undefined) data.travelStyle = travelStyle;
    if (location !== undefined) data.location = location;
    if (image !== undefined) data.image = image;

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true, name: true, email: true, image: true,
        bio: true, travelStyle: true, location: true, role: true,
      },
    });
    return NextResponse.json({ user });
  } catch (e: any) {
    console.error("Profile PUT error:", e);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
