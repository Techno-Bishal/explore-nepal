export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const destinationId = searchParams.get("destinationId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: any = { isPublished: true };
    if (userId) where.userId = userId;
    if (destinationId) where.destinationId = destinationId;

    const [posts, total] = await Promise.all([
      prisma.travelPost.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, image: true } },
          destination: { select: { id: true, name: true, slug: true, imageUrl: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.travelPost.count({ where }),
    ]);

    return NextResponse.json({ posts, total, totalPages: Math.ceil(total / limit) });
  } catch (e: any) {
    console.error("Travel posts GET error:", e);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    // Rate limit: 5 posts per hour
    const { checkRateLimit, containsBlockedContent, sanitizeHtml } = await import("@/lib/security");
    const rl = checkRateLimit(`post:${userId}`, 5, 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "You're posting too fast. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    const { title, content, imageUrls, destinationId } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    if (typeof title !== "string" || title.trim().length < 3 || title.length > 300) {
      return NextResponse.json({ error: "Title must be 3-300 characters" }, { status: 400 });
    }
    if (typeof content !== "string" || content.trim().length < 20 || content.length > 20000) {
      return NextResponse.json({ error: "Content must be 20-20000 characters" }, { status: 400 });
    }

    const spamCheck = containsBlockedContent(title + " " + content);
    if (spamCheck.blocked) {
      return NextResponse.json({ error: spamCheck.reason }, { status: 400 });
    }

    const post = await prisma.travelPost.create({
      data: {
        userId,
        title: sanitizeHtml(title.trim()),
        content: sanitizeHtml(content.trim()),
        imageUrls: imageUrls || [],
        destinationId: destinationId || null,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
        destination: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({ post });
  } catch (e: any) {
    console.error("Travel post POST error:", e);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
