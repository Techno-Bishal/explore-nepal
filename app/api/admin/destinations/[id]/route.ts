export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  if (!session?.user || (role !== "admin" && role !== "moderator")) {
    return null;
  }
  return session;
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = params?.id ?? "";
    const body = await request.json();

    const destination = await prisma.destination.update({
      where: { id },
      data: {
        name: body?.name ?? undefined,
        location: body?.location ?? undefined,
        shortDescription: body?.shortDescription ?? undefined,
        longDescription: body?.longDescription ?? undefined,
        imageUrl: body?.imageUrl ?? undefined,
        latitude: body?.latitude !== undefined ? parseFloat(body.latitude) || 0 : undefined,
        longitude: body?.longitude !== undefined ? parseFloat(body.longitude) || 0 : undefined,
        altitude: body?.altitude !== undefined ? parseInt(body.altitude, 10) || 0 : undefined,
        difficultyLevel: body?.difficultyLevel ?? undefined,
        budgetLevel: body?.budgetLevel ?? undefined,
        bestSeason: body?.bestSeason ?? undefined,
        travelDuration: body?.travelDuration ?? undefined,
        adventureLevel: body?.adventureLevel !== undefined ? parseInt(body.adventureLevel, 10) || 5 : undefined,
        familyFriendly: body?.familyFriendly ?? undefined,
        isFeatured: body?.isFeatured ?? undefined,
        isTrending: body?.isTrending ?? undefined,
      },
    });

    return NextResponse.json({ destination });
  } catch (error: any) {
    console.error("Admin update error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = params?.id ?? "";
    await prisma.destination.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" });
  } catch (error: any) {
    console.error("Admin delete error:", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
