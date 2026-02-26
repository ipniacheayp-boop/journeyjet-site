import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

let cachedToken: { token: string; expiresAt: number } | null = null;
const USE_PROD_APIS = Deno.env.get("USE_PROD_APIS") === "true";
const AMADEUS_BASE_URL = USE_PROD_APIS ? "https://api.amadeus.com" : "https://test.api.amadeus.com";

async function getAmadeusToken(forceRefresh = false): Promise<string> {
  if (forceRefresh) cachedToken = null;
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token;

  const apiKey = Deno.env.get("AMADEUS_API_KEY");
  const apiSecret = Deno.env.get("AMADEUS_API_SECRET");
  if (!apiKey || !apiSecret) throw new Error("Amadeus API credentials not configured");

  const authResponse = await fetch(`${AMADEUS_BASE_URL}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=client_credentials&client_id=${encodeURIComponent(apiKey)}&client_secret=${encodeURIComponent(apiSecret)}`,
  });

  if (!authResponse.ok) {
    cachedToken = null;
    throw new Error(`Amadeus auth failed: ${authResponse.status}`);
  }

  const authData = await authResponse.json();
  cachedToken = { token: authData.access_token, expiresAt: Date.now() + 25 * 60 * 1000 };
  return authData.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchType, flightNumber, carrierCode, date, origin, destination } = await req.json();

    console.log("📥 Flight status request:", { searchType, flightNumber, carrierCode, date, origin, destination });

    if (!date) {
      return new Response(JSON.stringify({ error: "Date is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let token = await getAmadeusToken();

    let url: string;
    if (searchType === "route") {
      if (!origin || !destination) {
        return new Response(JSON.stringify({ error: "Origin and destination required for route search" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Use flight offers for route-based search and derive status
      const params = new URLSearchParams({
        originLocationCode: origin.toUpperCase(),
        destinationLocationCode: destination.toUpperCase(),
        departureDate: date,
        adults: "1",
        max: "10",
      });
      url = `${AMADEUS_BASE_URL}/v2/shopping/flight-offers?${params}`;
    } else {
      // Flight number search - use On-Demand Flight Status API
      if (!carrierCode || !flightNumber) {
        return new Response(JSON.stringify({ error: "Carrier code and flight number required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const params = new URLSearchParams({
        carrierCode: carrierCode.toUpperCase(),
        flightNumber: flightNumber,
        scheduledDepartureDate: date,
      });
      url = `${AMADEUS_BASE_URL}/v2/schedule/flights?${params}`;
    }

    console.log("🔍 Fetching:", url);

    let response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

    if (response.status === 401) {
      token = await getAmadeusToken(true);
      response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API error:", response.status, errorText);
      
      // Return mock data as fallback
      return new Response(JSON.stringify({ 
        data: null, 
        mock: true,
        message: "Live data unavailable. Showing sample data.",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    console.log("✅ Flight status results:", data.data?.length || 0);

    return new Response(JSON.stringify({ data: data.data, searchType, mock: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
