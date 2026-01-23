import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

// Force clear cached token
function invalidateToken(): void {
  cachedToken = null;
  console.log("🔄 Token cache invalidated");
}

const getAmadeusToken = async (forceRefresh = false): Promise<string> => {
  if (forceRefresh) {
    invalidateToken();
  }
  
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const apiKey = Deno.env.get('AMADEUS_API_KEY');
  const apiSecret = Deno.env.get('AMADEUS_API_SECRET');

  if (!apiKey || !apiSecret) {
    throw new Error('Amadeus API credentials not configured');
  }

  console.log(`🔑 Authenticating with Amadeus (${USE_PROD_APIS ? "PRODUCTION" : "TEST"} mode)`);
  console.log("✓ Amadeus credentials loaded successfully");

  const response = await fetch(`${AMADEUS_BASE_URL}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${encodeURIComponent(apiKey)}&client_secret=${encodeURIComponent(apiSecret)}`,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ Amadeus auth error:", response.status, errorText);
    invalidateToken();
    throw new Error('Failed to authenticate with Amadeus API');
  }

  const data = await response.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (25 * 60 * 1000), // 25 minutes
  };

  console.log("✅ New Amadeus OAuth token generated successfully");

  return cachedToken.token;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate credentials exist
    const credentialCheck = validateCredentials();
    if (!credentialCheck.valid) {
      console.error("❌ Credential validation failed:", credentialCheck.error);
      return new Response(
        JSON.stringify({ 
          error: "Flight search temporarily unavailable. Authentication misconfigured.",
          code: "AUTH_MISCONFIGURED"
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔧 Using Amadeus ${USE_PROD_APIS ? "PRODUCTION" : "TEST"} API: ${AMADEUS_BASE_URL}`);

    const { flightOffer } = await req.json();

    if (!flightOffer) {
      throw new Error('Flight offer is required');
    }

    console.log('[PRICE-VALIDATE] Validating flight offer');

    let token = await getAmadeusToken();

    let priceResponse = await fetch(`${AMADEUS_BASE_URL}/v1/shopping/flight-offers/pricing`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          type: 'flight-offers-pricing',
          flightOffers: [flightOffer],
        },
      }),
    });

    // Handle 401 - token might be stale, try to refresh once
    if (priceResponse.status === 401) {
      console.warn("⚠️ Got 401, refreshing token and retrying...");
      token = await getAmadeusToken(true);
      
      priceResponse = await fetch(`${AMADEUS_BASE_URL}/v1/shopping/flight-offers/pricing`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            type: 'flight-offers-pricing',
            flightOffers: [flightOffer],
          },
        }),
      });
    }

    if (!priceResponse.ok) {
      const errorData = await priceResponse.json();
      console.error('[PRICE-VALIDATE] Amadeus error:', errorData);
      throw new Error(errorData.errors?.[0]?.detail || 'Price validation failed');
    }

    const priceData = await priceResponse.json();
    const validatedOffer = priceData.data?.flightOffers?.[0];

    if (!validatedOffer) {
      throw new Error('No validated offer returned');
    }

    console.log('[PRICE-VALIDATE] ✓ Price validated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        data: validatedOffer,
        priceChanged: validatedOffer.price.total !== flightOffer.price.total,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[PRICE-VALIDATE] Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
