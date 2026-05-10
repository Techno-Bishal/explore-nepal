export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const comment = await prisma.comment.findUnique({ where: { id: params?.id ?? "" } });
    if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const userRole = (session.user as any)?.role;
    if (comment.userId !== session.user.id && userRole !== "admin" && userRole !== "moderator") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.comment.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Comment delete error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
