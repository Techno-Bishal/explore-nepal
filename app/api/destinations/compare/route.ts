export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slugs = searchParams.get("slugs")?.split(",").filter(Boolean) || [];

    if (slugs.length < 2 || slugs.length > 3) {
      return NextResponse.json({ error: "Provide 2-3 destination slugs" }, { status: 400 });
    }

    const destinations = await prisma.destination.findMany({
      where: { slug: { in: slugs } },
      include: {
        categories: { include: { category: true } },
        reviews: { select: { rating: true } },
        _count: { select: { favorites: true, visitedBy: true } },
      },
    });

    const result = destinations.map(d => {
      const avgRating = d.reviews.length > 0
        ? (d.reviews.reduce((sum, r) => sum + r.rating, 0) / d.reviews.length).toFixed(1)
        : "No reviews";

      return {
        id: d.id,
        name: d.name,
        slug: d.slug,
        location: d.location,
        imageUrl: d.imageUrl,
        altitude: d.altitude,
        difficultyLevel: d.difficultyLevel,
        budgetLevel: d.budgetLevel,
        budgetEstimateLow: d.budgetEstimateLow,
        budgetEstimateMid: d.budgetEstimateMid,
        budgetEstimateHigh: d.budgetEstimateHigh,
        bestSeason: d.bestSeason,
        travelDuration: d.travelDuration,
        adventureLevel: d.adventureLevel,
        familyFriendly: d.familyFriendly,
        networkAvailability: d.networkAvailability,
        crowdLevel: d.crowdLevel,
        categories: d.categories.map(c => c.category.name),
        avgRating,
        reviewCount: d.reviews.length,
        favoriteCount: d._count.favorites,
        visitedCount: d._count.visitedBy,
        highlights: d.highlights,
        weatherInfo: d.weatherInfo,
        altitudeWarning: d.altitudeWarning,
      };
    });

    return NextResponse.json({ destinations: result });
  } catch (error) {
    console.error("Error comparing destinations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
