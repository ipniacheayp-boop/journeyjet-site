import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("AVIATION_EDGE_API_KEY");
    if (!apiKey) throw new Error("AVIATION_EDGE_API_KEY is not configured");

    const { iataCode, type } = await req.json();
    if (!iataCode) throw new Error("Airport IATA code is required");

    const params = new URLSearchParams({ key: apiKey, iataCode: iataCode.toUpperCase() });
    if (type) params.set("type", type); // "departure" or "arrival"

    const url = `https://aviation-edge.com/v2/public/timetable?${params.toString()}`;
    console.log("Fetching schedules:", url.replace(apiKey, "***"));

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) throw new Error(`API error [${response.status}]: ${JSON.stringify(data)}`);
    if (data.error) return new Response(JSON.stringify({ schedules: [], message: data.error }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

    const schedules = Array.isArray(data) ? data : [data];
    return new Response(JSON.stringify({ schedules }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Schedules error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
