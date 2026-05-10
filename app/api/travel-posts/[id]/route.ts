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
    const post = await prisma.travelPost.findUnique({ where: { id: params.id } });
    if (!post || post.userId !== userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }
    const body = await req.json();
    const updated = await prisma.travelPost.update({
      where: { id: params.id },
      data: {
        title: body.title || undefined,
        content: body.content || undefined,
        imageUrls: body.imageUrls || undefined,
        destinationId: body.destinationId !== undefined ? body.destinationId : undefined,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        destination: { select: { id: true, name: true, slug: true } },
      },
    });
    return NextResponse.json({ post: updated });
  } catch (e: any) {
    console.error("Travel post PUT error:", e);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
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
    const post = await prisma.travelPost.findUnique({ where: { id: params.id } });
    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (post.userId !== userId && role !== "admin" && role !== "moderator") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }
    await prisma.travelPost.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Travel post DELETE error:", e);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
