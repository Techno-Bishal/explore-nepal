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

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const destinations = await prisma.destination.findMany({
      include: {
        categories: { include: { category: true } },
        _count: { select: { favorites: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ destinations: destinations ?? [] });
  } catch (error: any) {
    console.error("Admin destinations error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const slug = (body?.name ?? "")
      ?.toLowerCase?.()
      ?.replace?.(/[^a-z0-9]+/g, "-")
      ?.replace?.(/^-+|-+$/g, "") ?? "";

    const destination = await prisma.destination.create({
      data: {
        name: body?.name ?? "",
        slug,
        location: body?.location ?? "",
        shortDescription: body?.shortDescription ?? "",
        longDescription: body?.longDescription ?? "",
        imageUrl: body?.imageUrl ?? "",
        latitude: parseFloat(body?.latitude ?? "0") || 0,
        longitude: parseFloat(body?.longitude ?? "0") || 0,
        altitude: parseInt(body?.altitude ?? "0", 10) || 0,
        difficultyLevel: body?.difficultyLevel ?? "easy",
        budgetLevel: body?.budgetLevel ?? "moderate",
        budgetDetails: body?.budgetDetails ?? null,
        bestSeason: body?.bestSeason ?? "",
        travelDuration: body?.travelDuration ?? "",
        adventureLevel: parseInt(body?.adventureLevel ?? "5", 10) || 5,
        familyFriendly: body?.familyFriendly ?? true,
        isFeatured: body?.isFeatured ?? false,
        isTrending: body?.isTrending ?? false,
        travelTips: body?.travelTips ?? [],
        safetyTips: body?.safetyTips ?? [],
        packingSuggestions: body?.packingSuggestions ?? [],
        localCultureInfo: body?.localCultureInfo ?? null,
        transportDetails: body?.transportDetails ?? null,
        nearbyAttractions: body?.nearbyAttractions ?? [],
      },
    });

    if (body?.categoryIds && Array.isArray(body.categoryIds)) {
      for (const catId of body.categoryIds) {
        await prisma.destinationCategory.create({
          data: { destinationId: destination?.id ?? "", categoryId: catId },
        });
      }
    }

    return NextResponse.json({ destination });
  } catch (error: any) {
    console.error("Admin create destination error:", error);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
