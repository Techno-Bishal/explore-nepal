export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { profilePrivacy } = body;

    if (!profilePrivacy || !["public", "private", "friends_only"].includes(profilePrivacy)) {
      return NextResponse.json({ error: "Invalid privacy setting" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: (session.user as any).id },
      data: { profilePrivacy },
      select: { profilePrivacy: true },
    });

    return NextResponse.json({ profilePrivacy: user.profilePrivacy });
  } catch (error: any) {
    console.error("Privacy update error:", error);
    return NextResponse.json({ error: "Failed to update privacy" }, { status: 500 });
  }
}
