export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const SYSTEM_PROMPT = `You are an expert AI Travel Assistant for Nepal — friendly, knowledgeable, and passionate about helping travelers discover the beauty of Nepal.

You have deep knowledge of:
- All destinations across Nepal: mountains, cities, lakes, temples, trekking routes, hidden gems
- Local culture, traditions, festivals, and cuisine
- Budget planning and travel logistics
- Best seasons, weather patterns, and difficulty levels
- Safety tips, packing lists, and transportation options
- Adventure activities, spiritual experiences, and nature exploration

When recommending destinations, always provide:
1. Name and brief description
2. Why it matches the user's request
3. Best time to visit
4. Difficulty/budget level
5. A travel tip

Always respond in a warm, conversational tone. Format responses with markdown for readability.
When the user asks for recommendations, suggest 3-5 specific destinations.
If asked about itineraries, provide day-by-day plans.
If asked about mood-based trips (romantic, peaceful, adventure), curate personalized suggestions.

IMPORTANT: Only recommend real places in Nepal. Be accurate with facts like altitude, distances, and cultural information.`;

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Rate limit: 20 chat messages per 5 minutes
    const { checkRateLimit } = await import("@/lib/security");
    const userKey = session?.user?.id || request.headers?.get("x-forwarded-for") || "anon";
    const rl = checkRateLimit(`ai-chat:${userKey}`, 20, 5 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many messages. Please wait a moment." }, { status: 429 });
    }

    const body = await request.json();
    const { messages = [], sessionId } = body ?? {};

    if (!messages?.length) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    // Validate message content length
    const lastMessage = messages[messages.length - 1];
    if (typeof lastMessage?.content === "string" && lastMessage.content.length > 5000) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 });
    }

    // Build message array with system prompt
    const apiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m: any) => ({ role: m?.role ?? "user", content: m?.content ?? "" })),
    ];

    const response = await fetch("https://apps.abacus.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-5.4-mini",
        messages: apiMessages,
        stream: true,
        max_tokens: 2000,
      }),
    });

    if (!response?.ok) {
      const errText = await response?.text?.().catch(() => "Unknown error");
      console.error("LLM API error:", errText);
      return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        try {
          while (true) {
            const { done, value } = await reader!.read();
            if (done) break;
            const chunk = decoder.decode(value);
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("AI chat error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
