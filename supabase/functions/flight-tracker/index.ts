import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("AVIATION_EDGE_API_KEY");
    if (!apiKey) {
      throw new Error("AVIATION_EDGE_API_KEY is not configured");
    }

    const { flightNumber, airline, depIata, arrIata } = await req.json();

    const params = new URLSearchParams({ key: apiKey });
    if (flightNumber) params.set("flightIata", flightNumber.toUpperCase().replace(/\s/g, ""));
    if (airline) params.set("airlineIata", airline.toUpperCase());
    if (depIata) params.set("depIata", depIata.toUpperCase());
    if (arrIata) params.set("arrIata", arrIata.toUpperCase());

    const url = `https://aviation-edge.com/v2/public/flights?${params.toString()}`;
    console.log("Fetching flights from:", url.replace(apiKey, "***"));

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Aviation Edge API error [${response.status}]: ${JSON.stringify(data)}`);
    }

    // API returns error object when no results
    if (data.error) {
      return new Response(JSON.stringify({ flights: [], message: data.error }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Normalize to array
    const flights = Array.isArray(data) ? data : [data];

    return new Response(JSON.stringify({ flights }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Flight tracker error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
