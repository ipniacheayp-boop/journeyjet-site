import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PROMPT = (destination: string, days: number) =>
  `You are a premium travel planner for Tripile.com (US OTA). Create a ${days}-day trip plan for ${destination}.
Respond with ONLY a valid raw JSON object matching this structure — no markdown, no backticks, no extra text:

{
  "known_for": "1-2 sentence summary",
  "popular_places": [{"name": "...", "description": "...", "best_time": "Morning/Afternoon/Evening", "category": "Nature/Culture/Food/etc"}],
  "itinerary": [{"day": 1, "title": "...", "activities": ["...", "..."]}],
  "budget_estimate": "$X - $Y/day per person USD",
  "best_time_to_visit": "Best months and why",
  "travel_tips": ["tip1", "tip2", "tip3"]
}

Include exactly ${days} days in the itinerary array.`;

async function callGroq(apiKey: string, destination: string, days: number) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: PROMPT(destination, days) }],
      temperature: 0.5,
      response_format: { type: "json_object" },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Groq API error (${res.status})`);
  }

  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty response from AI");

  try {
    return JSON.parse(text);
  } catch {
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  }
}

async function callLovableGateway(apiKey: string, destination: string, days: number) {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "user", content: PROMPT(destination, days) }],
      temperature: 0.5,
      response_format: { type: "json_object" },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `AI gateway error (${res.status})`);
  }

  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Empty response from AI");

  try {
    return JSON.parse(text);
  } catch {
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { destination, days = 3 } = await req.json();

    if (!destination || typeof destination !== "string" || !destination.trim()) {
      return new Response(JSON.stringify({ error: "Destination is required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const dayCount = Math.min(14, Math.max(1, Number(days) || 3));
    const dest = destination.trim();

    const groqKey = Deno.env.get("GROQ_API_KEY");
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");

    let plan;
    let source = "ai";

    if (groqKey) {
      plan = await callGroq(groqKey, dest, dayCount);
    } else if (lovableKey) {
      plan = await callLovableGateway(lovableKey, dest, dayCount);
    } else {
      return new Response(
        JSON.stringify({
          error: "Trip planner is temporarily unavailable. Please try again shortly or contact support.",
          code: "NO_AI_KEY",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ plan, source }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("trip-planner error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate itinerary";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
