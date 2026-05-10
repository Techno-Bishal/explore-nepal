export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canModerateContent } from "@/lib/security";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (!canModerateContent(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, role: true, image: true,
          isBlocked: true, createdAt: true, explorerLevel: true, totalPoints: true,
          _count: { select: { reviews: true, travelPosts: true, comments: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({ users, total, totalPages: Math.ceil(total / limit) });
  } catch (error: any) {
    console.error("Admin users GET error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentRole = (session.user as any).role;
    if (currentRole !== "admin") {
      return NextResponse.json({ error: "Only admins can modify users" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, action, role } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: "userId and action required" }, { status: 400 });
    }

    // Prevent self-modification
    if (userId === (session.user as any).id) {
      return NextResponse.json({ error: "Cannot modify your own account" }, { status: 400 });
    }

    let updateData: any = {};

    switch (action) {
      case "block":
        updateData = { isBlocked: true };
        break;
      case "unblock":
        updateData = { isBlocked: false };
        break;
      case "change_role":
        if (!role || !["user", "moderator", "admin"].includes(role)) {
          return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }
        updateData = { role };
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, isBlocked: true },
    });

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Admin users PATCH error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
