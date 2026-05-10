export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Rate limit: 5 trip plans per hour
    const { checkRateLimit } = await import("@/lib/security");
    const userKey = session?.user?.id || request.headers?.get("x-forwarded-for") || "anon";
    const rl = checkRateLimit(`trip-plan:${userKey}`, 5, 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many trip plan requests. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const { duration, budget, interests, travelStyle, startCity, groupSize } = body;

    // Validate inputs
    if (duration && (typeof duration !== "number" || duration < 1 || duration > 60)) {
      return NextResponse.json({ error: "Duration must be between 1 and 60 days" }, { status: 400 });
    }

    // Fetch destinations matching preferences
    const destinations = await prisma.destination.findMany({
      select: {
        name: true, slug: true, location: true, altitude: true,
        difficultyLevel: true, budgetLevel: true, bestSeason: true,
        travelDuration: true, shortDescription: true, highlights: true,
        budgetEstimateLow: true, budgetEstimateMid: true, budgetEstimateHigh: true,
        emergencyContacts: true, altitudeWarning: true, categories: { include: { category: true } },
      },
    });

    const destSummary = destinations.map(d =>
      `${d.name} (${d.location}, ${d.altitude}m, ${d.difficultyLevel}, budget:${d.budgetLevel}, ${d.bestSeason}) - ${d.shortDescription}. Budget: NPR ${d.budgetEstimateLow}-${d.budgetEstimateHigh}/day. Categories: ${d.categories.map(c => c.category.name).join(", ")}${d.altitudeWarning ? ` ⚠️ ${d.altitudeWarning}` : ""}`
    ).join("\n");

    const userPersonality = session?.user?.id ? (
      await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { travelPersonality: true },
      })
    )?.travelPersonality : null;

    const systemPrompt = `You are an expert Nepal travel planner. Create a detailed, personalized trip itinerary.

Available destinations in Nepal:
${destSummary}

${userPersonality ? `The traveler's personality type is: ${userPersonality}. Tailor recommendations accordingly.` : ""}

IMPORTANT RULES:
- Provide day-by-day itinerary with specific destinations from the list above
- Include realistic travel times between locations
- Provide budget estimates in NPR (Nepalese Rupees)
- Include safety tips and altitude warnings where relevant
- Suggest accommodation types matching the budget
- Include local food recommendations
- Add emergency contacts for each area
- Format response as structured JSON with this exact schema:
{
  "tripName": "string",
  "totalDays": number,
  "estimatedBudget": { "low": number, "mid": number, "high": number },
  "days": [{ "day": number, "location": "string", "slug": "string", "activities": ["string"], "accommodation": "string", "meals": ["string"], "travelTip": "string", "estimatedCost": number }],
  "packingList": ["string"],
  "safetyTips": ["string"],
  "bestTimeToGo": "string"
}`;

    const userMessage = `Plan a ${duration}-day trip to Nepal.
Budget level: ${budget}
Interests: ${interests?.join(", ") || "general sightseeing"}
Travel style: ${travelStyle || "balanced"}
Starting city: ${startCity || "Kathmandu"}
Group size: ${groupSize || 1} person(s)`;

    const apiKey = process.env.ABACUSAI_API_KEY;
    const response = await fetch("https://api.abacus.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-5.4-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Try to parse JSON from the response
    let tripPlan;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      tripPlan = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      tripPlan = null;
    }

    // Award badge for first trip plan
    if (session?.user?.id) {
      await prisma.userBadge.upsert({
        where: { userId_badgeId: { userId: session.user.id, badgeId: "trip-planner" } },
        update: {},
        create: {
          userId: session.user.id,
          badgeId: "trip-planner",
          badgeName: "Trip Planner",
          badgeIcon: "📋",
          badgeDesc: "Generated your first AI trip plan",
          category: "milestone",
        },
      });

      await prisma.user.update({
        where: { id: session.user.id },
        data: { totalPoints: { increment: 30 } },
      });
    }

    return NextResponse.json({
      tripPlan,
      rawContent: tripPlan ? undefined : content,
    });
  } catch (error) {
    console.error("Error generating trip plan:", error);
    return NextResponse.json({ error: "Failed to generate trip plan" }, { status: 500 });
  }
}
