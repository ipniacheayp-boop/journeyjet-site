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

    const { query, type } = await req.json();
    if (!query) throw new Error("Search query is required");

    // type: "airport", "airline", or "city"
    const endpoint = type === "airline" 
      ? "airlineDatabase" 
      : type === "city" 
        ? "cityDatabase" 
        : "airportDatabase";

    const params = new URLSearchParams({ key: apiKey, codeIataAirport: query.toUpperCase() });
    
    // For airline, use different param
    if (type === "airline") {
      params.delete("codeIataAirport");
      params.set("codeIataAirline", query.toUpperCase());
    }
    if (type === "city") {
      params.delete("codeIataAirport");
      params.set("codeIataCity", query.toUpperCase());
    }

    const url = `https://aviation-edge.com/v2/public/${endpoint}?${params.toString()}`;
    console.log("Fetching autocomplete:", url.replace(apiKey, "***"));

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
    console.error("Autocomplete error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
