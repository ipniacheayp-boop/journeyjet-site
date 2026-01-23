import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, x-client-info, apikey, content-type",
};

// In-memory cache for Amadeus access token (cleared on each deploy)
let cachedToken: { token: string; expiresAt: number } | null = null;

// Determine which API endpoint to use based on environment
const USE_PROD_APIS = Deno.env.get("USE_PROD_APIS") === "true";
const AMADEUS_BASE_URL = USE_PROD_APIS ? "https://api.amadeus.com" : "https://test.api.amadeus.com";

// Validate credentials exist and are not empty
function validateCredentials(): { valid: boolean; error?: string } {
  const apiKey = Deno.env.get("AMADEUS_API_KEY");
  const apiSecret = Deno.env.get("AMADEUS_API_SECRET");

  if (!apiKey || apiKey.trim() === "") {
    return { valid: false, error: "AMADEUS_API_KEY is missing or empty" };
  }
  if (!apiSecret || apiSecret.trim() === "") {
    return { valid: false, error: "AMADEUS_API_SECRET is missing or empty" };
  }
  
  return { valid: true };
}

// Validate environment configuration
function validateEnvironment(): { valid: boolean; warning?: string } {
  const useProdApis = Deno.env.get("USE_PROD_APIS");
  
  if (useProdApis !== "true" && useProdApis !== "false") {
    return { 
      valid: true, 
      warning: `USE_PROD_APIS not explicitly set (value: "${useProdApis}"), defaulting to TEST environment` 
    };
  }
  
  return { valid: true };
}

// Force clear cached token (call on 401 errors)
function invalidateToken(): void {
  cachedToken = null;
  console.log("🔄 Token cache invalidated");
}

async function getAmadeusToken(forceRefresh = false): Promise<string> {
  // Force refresh if requested or if token is expired
  if (forceRefresh) {
    invalidateToken();
  }
  
  // Check if we have a valid cached token
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const apiKey = Deno.env.get("AMADEUS_API_KEY");
  const apiSecret = Deno.env.get("AMADEUS_API_SECRET");

  // This should never happen due to validateCredentials, but double-check
  if (!apiKey || !apiSecret) {
    throw new Error("Amadeus API credentials not configured");
  }

  console.log(`🔑 Authenticating with Amadeus (${USE_PROD_APIS ? "PRODUCTION" : "TEST"} mode)`);
  console.log("✓ Amadeus credentials loaded successfully");
  
  const authResponse = await fetch(`${AMADEUS_BASE_URL}/v1/security/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=client_credentials&client_id=${encodeURIComponent(apiKey)}&client_secret=${encodeURIComponent(apiSecret)}`,
  });

  if (!authResponse.ok) {
    const errorText = await authResponse.text();
    console.error("❌ Amadeus auth error:", authResponse.status, errorText);
    
    // If auth fails, ensure we don't cache anything
    invalidateToken();
    
    throw new Error(`Failed to authenticate with Amadeus API: ${authResponse.status}`);
  }

  const authData = await authResponse.json();

  // Cache token for 25 minutes (tokens expire in 30 min, give 5 min buffer)
  cachedToken = {
    token: authData.access_token,
    expiresAt: Date.now() + 25 * 60 * 1000,
  };

  console.log("✅ New Amadeus OAuth token generated successfully");
  
  return authData.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Step 1: Validate credentials exist
    const credentialCheck = validateCredentials();
    if (!credentialCheck.valid) {
      console.error("❌ Credential validation failed:", credentialCheck.error);
      return new Response(
        JSON.stringify({ 
          error: "Flight search temporarily unavailable. Authentication misconfigured.",
          code: "AUTH_MISCONFIGURED"
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Validate environment configuration
    const envCheck = validateEnvironment();
    if (envCheck.warning) {
      console.warn("⚠️", envCheck.warning);
    }

    console.log(`🔧 Using Amadeus ${USE_PROD_APIS ? "PRODUCTION" : "TEST"} API: ${AMADEUS_BASE_URL}`);

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

    // Get token (will fetch new one if needed)
    let token = await getAmadeusToken();
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

    let flightResponse = await fetch(`${AMADEUS_BASE_URL}/v2/shopping/flight-offers?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Handle 401 - token might be stale, try to refresh once
    if (flightResponse.status === 401) {
      console.warn("⚠️ Got 401, refreshing token and retrying...");
      token = await getAmadeusToken(true); // Force refresh
      
      flightResponse = await fetch(`${AMADEUS_BASE_URL}/v2/shopping/flight-offers?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

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
