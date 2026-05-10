export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generatePresignedUploadUrl } from "@/lib/s3";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { validateUpload, sanitizeFileName, checkRateLimit } = await import("@/lib/security");

    const userId = (session.user as any).id;
    // Rate limit: 20 uploads per hour
    const rl = checkRateLimit(`upload:${userId}`, 20, 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Upload limit reached. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    const { fileName, contentType, isPublic, fileSize } = body;
    if (!fileName || !contentType) {
      return NextResponse.json({ error: "Missing fileName or contentType" }, { status: 400 });
    }

    // Validate file type and size
    const uploadCheck = validateUpload(contentType, fileSize);
    if (!uploadCheck.valid) {
      return NextResponse.json({ error: uploadCheck.message }, { status: 400 });
    }

    // Sanitize file name to prevent path traversal
    const safeName = sanitizeFileName(fileName);

    const result = await generatePresignedUploadUrl(safeName, contentType, isPublic ?? true);
    return NextResponse.json(result);
  } catch (e: any) {
    console.error("Presigned URL error:", e);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}
