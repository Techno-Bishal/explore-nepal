export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkRateLimit, isValidEmail } from "@/lib/security";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    // Rate limit: 3 requests per 15 minutes
    const rl = checkRateLimit(`forgot:${email}`, 3, 15 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    // Always return success to prevent email enumeration
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpiry },
      });

      // In production, send email with reset link. For now, log it.
      console.log(`Password reset token for ${email}: ${resetToken}`);
      console.log(`Reset URL: ${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`);
    }

    return NextResponse.json({
      message: "If an account exists with this email, you will receive a password reset link.",
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
