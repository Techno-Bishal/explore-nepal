export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const review = await prisma.review.findUnique({ where: { id: params.id } });
    if (!review || review.userId !== userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }
    const body = await req.json();
    const updated = await prisma.review.update({
      where: { id: params.id },
      data: {
        rating: body.rating ? Math.min(5, Math.max(1, parseInt(body.rating))) : undefined,
        title: body.title || undefined,
        content: body.content || undefined,
        imageUrls: body.imageUrls || undefined,
      },
      include: { user: { select: { id: true, name: true, image: true } } },
    });
    return NextResponse.json({ review: updated });
  } catch (e: any) {
    console.error("Review PUT error:", e);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const role = (session.user as any).role;
    const review = await prisma.review.findUnique({ where: { id: params.id } });
    if (!review) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (review.userId !== userId && role !== "admin" && role !== "moderator") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }
    await prisma.review.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Review DELETE error:", e);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
