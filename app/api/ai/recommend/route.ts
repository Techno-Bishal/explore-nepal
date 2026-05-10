export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkRateLimit, sanitizeInput } from "@/lib/security";

export async function POST(request: Request) {
  try {
    // Rate limit: 10 recommendations per minute
    const clientKey = request.headers?.get("x-forwarded-for") || "anon";
    const rl = checkRateLimit(`recommend:${clientKey}`, 10, 60000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const rawMood = body?.mood;
    const rawBudget = body?.budget;
    const rawDifficulty = body?.difficulty;
    const rawSeason = body?.season;

    // Sanitize inputs
    const mood = typeof rawMood === "string" ? sanitizeInput(rawMood).slice(0, 100) : undefined;
    const budget = typeof rawBudget === "string" ? sanitizeInput(rawBudget).slice(0, 50) : undefined;
    const difficulty = typeof rawDifficulty === "string" ? sanitizeInput(rawDifficulty).slice(0, 50) : undefined;
    const season = typeof rawSeason === "string" ? sanitizeInput(rawSeason).slice(0, 50) : undefined;

    // Build filter based on preferences
    const where: any = {};
    if (budget) where.budgetLevel = budget;
    if (difficulty) where.difficultyLevel = difficulty;
    if (season) where.bestSeason = { contains: season, mode: "insensitive" };

    const destinations = await prisma.destination.findMany({
      where,
      include: { categories: { include: { category: true } } },
      take: 6,
      orderBy: { isFeatured: "desc" },
    });

    // If mood provided, use LLM to rank/explain
    if (mood && destinations?.length) {
      const destNames = destinations.map((d: any) => d?.name).join(", ");
      const response = await fetch("https://apps.abacus.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.ABACUSAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-5.4-mini",
          messages: [
            { role: "system", content: "You are a Nepal travel expert. Given destinations and a mood, explain why each is perfect for that mood. Respond in JSON." },
            { role: "user", content: `Mood: ${mood}\nDestinations: ${destNames}\n\nFor each destination, provide a short (1-2 sentence) explanation of why it matches this mood. Respond with raw JSON only: {"recommendations": [{"name": "...", "reason": "..."}]}` },
          ],
          max_tokens: 1000,
          response_format: { type: "json_object" },
        }),
      });

      if (response?.ok) {
        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content ?? "{}";
        try {
          const parsed = JSON.parse(content);
          const reasons = parsed?.recommendations ?? [];
          const enriched = destinations.map((d: any) => {
            const match = reasons.find((r: any) => r?.name?.toLowerCase()?.includes(d?.name?.toLowerCase()));
            return { ...d, aiReason: match?.reason ?? null };
          });
          return NextResponse.json({ destinations: enriched });
        } catch {
          // Fall through to non-AI response
        }
      }
    }

    return NextResponse.json({ destinations });
  } catch (error: any) {
    console.error("AI recommend error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
