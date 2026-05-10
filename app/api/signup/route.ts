export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { checkRateLimit, isValidEmail, validatePassword, sanitizeInput } = await import("@/lib/security");

    const body = await request.json();
    const { email, password, name } = body ?? {};

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Rate limit: 5 signups per 30 minutes per IP-ish (email-based)
    const rl = checkRateLimit(`signup:${email}`, 5, 30 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }

    // Email validation
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    // Password strength validation
    const pwCheck = validatePassword(password);
    if (!pwCheck.valid) {
      return NextResponse.json({ error: pwCheck.message }, { status: 400 });
    }

    // Name validation
    if (name && (typeof name !== "string" || name.length > 100)) {
      return NextResponse.json({ error: "Name must be under 100 characters" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name ? sanitizeInput(name.trim()) : "",
        hashedPassword,
        role: "user",
      },
    });

    return NextResponse.json({
      id: user?.id,
      email: user?.email,
      name: user?.name,
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
