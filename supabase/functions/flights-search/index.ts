import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// In-memory cache for Amadeus access token
let cachedToken: { token: string; expiresAt: number } | null = null;

// Determine which API endpoint to use based on environment
const USE_PROD_APIS = Deno.env.get("USE_PROD_APIS") === "true";
const AMADEUS_BASE_URL = USE_PROD_APIS ? "https://api.amadeus.com" : "https://test.api.amadeus.com";

console.log(`🔧 Using Amadeus ${USE_PROD_APIS ? "PRODUCTION" : "TEST"} API: ${AMADEUS_BASE_URL}`);

async function getAmadeusToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const apiKey = Deno.env.get("AMADEUS_API_KEY");
  const apiSecret = Deno.env.get("AMADEUS_API_SECRET");

  if (!apiKey || !apiSecret) {
    throw new Error("Amadeus API credentials not configured");
  }

  console.log(`🔑 Authenticating with Amadeus (${USE_PROD_APIS ? "PRODUCTION" : "TEST"} mode)`);
  const authResponse = await fetch(`${AMADEUS_BASE_URL}/v1/security/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=client_credentials&client_id=${apiKey}&client_secret=${apiSecret}`,
  });

  if (!authResponse.ok) {
    const error = await authResponse.text();
    console.error("Amadeus auth error:", error);
    throw new Error("Failed to authenticate with Amadeus API");
  }

  const authData = await authResponse.json();

  // Cache token for 30 minutes (Amadeus tokens typically expire in 30 min)
  cachedToken = {
    token: authData.access_token,
    expiresAt: Date.now() + 30 * 60 * 1000,
  };

  return authData.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { originLocationCode, destinationLocationCode, departureDate, returnDate, adults, travelClass } =
      await req.json();

    console.log("📥 Flight search request:", {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      returnDate,
      adults,
      travelClass,
    });

    if (!originLocationCode || !destinationLocationCode || !departureDate || !adults) {
      console.error("❌ Missing required parameters");
      return new Response(
        JSON.stringify({
          error:
            "Missing required parameters: originLocationCode (3-letter code), destinationLocationCode (3-letter code), departureDate, adults",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Validate IATA codes are 3 letters
    if (originLocationCode.length !== 3 || destinationLocationCode.length !== 3) {
      console.error("❌ Invalid IATA codes - must be 3 letters:", { originLocationCode, destinationLocationCode });
      return new Response(
        JSON.stringify({
          error: "Airport codes must be 3-letter IATA codes (e.g., JFK, LAX, LHR)",
          hint: `Origin: ${originLocationCode} (${originLocationCode.length} chars), Destination: ${destinationLocationCode} (${destinationLocationCode.length} chars)`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const token = await getAmadeusToken();
    console.log("✅ Amadeus token obtained");

    // Build query parameters
    const params = new URLSearchParams({
      originLocationCode: originLocationCode.toUpperCase(),
      destinationLocationCode: destinationLocationCode.toUpperCase(),
      departureDate,
      adults: adults.toString(),
      max: "50",
      currencyCode: "USD",
    });

    if (returnDate) {
      params.append("returnDate", returnDate);
    }

    if (travelClass) {
      params.append("travelClass", travelClass);
    }

    console.log("🔍 Searching flights with params:", params.toString());
    console.log(`📍 API Endpoint: ${AMADEUS_BASE_URL}/v2/shopping/flight-offers`);

    const flightResponse = await fetch(`${AMADEUS_BASE_URL}/v2/shopping/flight-offers?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("📡 Amadeus API response status:", flightResponse.status);

    if (!flightResponse.ok) {
      const error = await flightResponse.text();
      console.error("❌ Amadeus flight search error (status:", flightResponse.status, "):", error);
      return new Response(JSON.stringify({ error: "Failed to search flights", details: error }), {
        status: flightResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const flightData = await flightResponse.json();
    console.log("✅ Flight search response:", flightData.data?.length || 0, "offers found");

    // Add metadata about which environment was used
    if (flightData.meta) {
      flightData.meta.environment = USE_PROD_APIS ? "production" : "test";
    }

    // Sort flights by price (ascending) to show cheapest first
    if (flightData.data && Array.isArray(flightData.data)) {
      flightData.data.sort((a: any, b: any) => {
        const priceA = parseFloat(a.price?.total || a.price?.grandTotal || "999999");
        const priceB = parseFloat(b.price?.total || b.price?.grandTotal || "999999");
        return priceA - priceB;
      });
    }

    return new Response(JSON.stringify(flightData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error in flights-search:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
