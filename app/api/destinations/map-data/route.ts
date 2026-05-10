export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const destinations = await prisma.destination.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        location: true,
        latitude: true,
        longitude: true,
        altitude: true,
        imageUrl: true,
        shortDescription: true,
        difficultyLevel: true,
        budgetLevel: true,
        isTrending: true,
        isFeatured: true,
        categories: { include: { category: { select: { name: true, slug: true } } } },
        _count: { select: { favorites: true, visitedBy: true, reviews: true } },
      },
      orderBy: { name: "asc" },
    });

    // Group by region (based on district/location)
    const regionMap: Record<string, string> = {
      "Kathmandu District": "bagmati",
      "Bhaktapur District": "bagmati",
      "Kavrepalanchok District": "bagmati",
      "Kaski District": "gandaki",
      "Tanahun District": "gandaki",
      "Lamjung District": "gandaki",
      "Manang District": "gandaki",
      "Mustang District": "gandaki",
      "Solu-Khumbu District": "province1",
      "Taplejung District": "province1",
      "Ilam District": "province1",
      "Sunsari District": "province1",
      "Khotang District": "province1",
      "Chitwan District": "bagmati",
      "Rupandehi District": "lumbini",
      "Palpa District": "lumbini",
      "Mugu District": "karnali",
      "Rasuwa District": "bagmati",
      "Dhanusha District": "madhesh",
      "Dolakha District": "bagmati",
      "Bajura District": "sudurpashchim",
      "Bardia District": "lumbini",
      "Lalitpur District": "bagmati",
      "Annapurna Conservation Area": "gandaki",
      "Far-Western Nepal": "sudurpashchim",
    };

    const enriched = destinations.map(d => ({
      ...d,
      region: regionMap[d.location] || "bagmati",
      categories: d.categories.map(c => c.category),
    }));

    return NextResponse.json({ destinations: enriched });
  } catch (error) {
    console.error("Error fetching map data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
