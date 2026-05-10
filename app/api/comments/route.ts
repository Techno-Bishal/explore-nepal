export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const destinationId = searchParams.get("destinationId") ?? "";
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");

    if (!destinationId) {
      return NextResponse.json({ error: "destinationId required" }, { status: 400 });
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { destinationId, parentId: null },
        include: {
          user: { select: { id: true, name: true, image: true } },
          replies: {
            include: { user: { select: { id: true, name: true, image: true } } },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.comment.count({ where: { destinationId, parentId: null } }),
    ]);

    return NextResponse.json({ comments: comments ?? [], total });
  } catch (error: any) {
    console.error("Comments fetch error:", error);
    return NextResponse.json({ comments: [], total: 0 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Rate limit: 15 comments per 10 minutes
    const { checkRateLimit, containsBlockedContent, sanitizeHtml } = await import("@/lib/security");
    const rl = checkRateLimit(`comment:${session.user.id}`, 15, 10 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "You're commenting too fast. Please slow down." }, { status: 429 });
    }

    const body = await request.json();
    const { content, destinationId, parentId } = body ?? {};

    if (!content?.trim() || !destinationId) {
      return NextResponse.json({ error: "Content and destinationId required" }, { status: 400 });
    }

    if (content.trim().length > 2000) {
      return NextResponse.json({ error: "Comment must be under 2000 characters" }, { status: 400 });
    }

    // Spam check
    const spamCheck = containsBlockedContent(content);
    if (spamCheck.blocked) {
      return NextResponse.json({ error: spamCheck.reason }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        content: sanitizeHtml(content.trim()),
        destinationId,
        userId: session.user.id,
        parentId: parentId ?? null,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        replies: { include: { user: { select: { id: true, name: true, image: true } } } },
      },
    });

    return NextResponse.json({ comment });
  } catch (error: any) {
    console.error("Comment create error:", error);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
