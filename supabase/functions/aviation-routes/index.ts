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

    const { airlineIata, depIata, arrIata } = await req.json();

    const params = new URLSearchParams({ key: apiKey });
    if (airlineIata) params.set("airlineIata", airlineIata.toUpperCase());
    if (depIata) params.set("departureIata", depIata.toUpperCase());
    if (arrIata) params.set("arrivalIata", arrIata.toUpperCase());

    const url = `https://aviation-edge.com/v2/public/routes?${params.toString()}`;
    console.log("Fetching routes:", url.replace(apiKey, "***"));

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) throw new Error(`API error [${response.status}]: ${JSON.stringify(data)}`);
    if (data.error) return new Response(JSON.stringify({ routes: [], message: data.error }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

    const routes = Array.isArray(data) ? data : [data];
    return new Response(JSON.stringify({ routes }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Routes error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
