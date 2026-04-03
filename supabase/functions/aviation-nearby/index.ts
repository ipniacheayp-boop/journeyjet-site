import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("AVIATION_EDGE_API_KEY");
    if (!apiKey) throw new Error("AVIATION_EDGE_API_KEY is not configured");

    const { lat, lng, distance } = await req.json();
    if (lat === undefined || lng === undefined) throw new Error("Latitude and longitude are required");

    const params = new URLSearchParams({
      key: apiKey,
      lat: String(lat),
      lng: String(lng),
      distance: String(distance || 200),
    });

    const url = `https://aviation-edge.com/v2/public/nearby?${params.toString()}`;
    console.log("Fetching nearby:", url.replace(apiKey, "***"));

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) throw new Error(`API error [${response.status}]: ${JSON.stringify(data)}`);
    if (data.error) return new Response(JSON.stringify({ results: [], message: data.error }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

    const results = Array.isArray(data) ? data : [data];
    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Nearby error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
