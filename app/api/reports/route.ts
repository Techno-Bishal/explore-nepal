export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkRateLimit, sanitizeInput } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Rate limit: 5 reports per 10 minutes
    const rl = checkRateLimit(`report:${userId}`, 5, 10 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many reports. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    const { contentType, contentId, reason, details } = body;

    if (!contentType || !contentId || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const validTypes = ["review", "comment", "travel_post", "user"];
    if (!validTypes.includes(contentType)) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    }

    // Check for duplicate report
    const existing = await prisma.contentReport.findFirst({
      where: { reporterId: userId, contentType, contentId },
    });
    if (existing) {
      return NextResponse.json({ error: "You have already reported this content" }, { status: 409 });
    }

    const report = await prisma.contentReport.create({
      data: {
        reporterId: userId,
        contentType: sanitizeInput(contentType),
        contentId: sanitizeInput(contentId),
        reason: sanitizeInput(reason),
        details: details ? sanitizeInput(details).slice(0, 500) : null,
      },
    });

    return NextResponse.json({ report: { id: report.id } });
  } catch (error: any) {
    console.error("Report POST error:", error);
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "admin" && role !== "moderator") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "pending";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const [reports, total] = await Promise.all([
      prisma.contentReport.findMany({
        where: { status },
        include: { reporter: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contentReport.count({ where: { status } }),
    ]);

    return NextResponse.json({ reports, total, totalPages: Math.ceil(total / limit) });
  } catch (error: any) {
    console.error("Reports GET error:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
