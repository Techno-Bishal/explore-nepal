export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const destinationId = searchParams.get("destinationId");
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: any = {};
    if (destinationId) where.destinationId = destinationId;
    if (userId) where.userId = userId;
    where.isApproved = true;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, image: true } },
          destination: { select: { id: true, name: true, slug: true, imageUrl: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    const avgRating = destinationId
      ? await prisma.review.aggregate({
          where: { destinationId, isApproved: true },
          _avg: { rating: true },
          _count: { rating: true },
        })
      : null;

    return NextResponse.json({
      reviews,
      total,
      avgRating: avgRating?._avg?.rating ?? 0,
      reviewCount: avgRating?._count?.rating ?? 0,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e: any) {
    console.error("Reviews GET error:", e);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    // Rate limit: 5 reviews per hour
    const { checkRateLimit, containsBlockedContent, sanitizeHtml } = await import("@/lib/security");
    const rl = checkRateLimit(`review:${userId}`, 5, 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "You're posting too fast. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    const { destinationId, rating, title, content, imageUrls } = body;

    if (!destinationId || !title || !content || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Input validation
    if (typeof title !== "string" || title.trim().length < 3 || title.length > 200) {
      return NextResponse.json({ error: "Title must be 3-200 characters" }, { status: 400 });
    }
    if (typeof content !== "string" || content.trim().length < 10 || content.length > 5000) {
      return NextResponse.json({ error: "Review must be 10-5000 characters" }, { status: 400 });
    }

    // Spam check
    const spamCheck = containsBlockedContent(title + " " + content);
    if (spamCheck.blocked) {
      return NextResponse.json({ error: spamCheck.reason }, { status: 400 });
    }

    // Duplicate review prevention
    const existingReview = await prisma.review.findFirst({
      where: { userId, destinationId },
    });
    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this destination. Edit your existing review instead." }, { status: 409 });
    }

    const review = await prisma.review.create({
      data: {
        userId,
        destinationId,
        rating: Math.min(5, Math.max(1, parseInt(rating))),
        title: sanitizeHtml(title.trim()),
        content: sanitizeHtml(content.trim()),
        imageUrls: imageUrls || [],
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ review });
  } catch (e: any) {
    console.error("Review POST error:", e);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}
