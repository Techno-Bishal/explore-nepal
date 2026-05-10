export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Increment session version to invalidate all JWT tokens
    await prisma.user.update({
      where: { id: userId },
      data: { sessionVersion: { increment: 1 } },
    });

    // Delete all DB sessions
    await prisma.session.deleteMany({ where: { userId } });

    return NextResponse.json({ message: "All sessions have been invalidated. Please sign in again." });
  } catch (error: any) {
    console.error("Logout all error:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
