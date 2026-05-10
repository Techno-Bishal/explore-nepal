export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "admin" && role !== "moderator") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { status } = body;

    if (!status || !["reviewed", "resolved", "dismissed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const report = await prisma.contentReport.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json({ report });
  } catch (error: any) {
    console.error("Report PATCH error:", error);
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
  }
}
