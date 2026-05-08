import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const USE_PROD_APIS = Deno.env.get("USE_PROD_APIS") === "true";
const AMADEUS_BASE_URL = USE_PROD_APIS
  ? "https://api.amadeus.com"
  : "https://test.api.amadeus.com";

let cachedToken: { token: string; expiresAt: number } | null = null;

function invalidateToken(): void {
  cachedToken = null;
}

async function getAmadeusToken(forceRefresh = false): Promise<string> {
  if (forceRefresh) invalidateToken();
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const apiKey = Deno.env.get("AMADEUS_API_KEY");
  const apiSecret = Deno.env.get("AMADEUS_API_SECRET");
  if (!apiKey || !apiSecret) {
    throw new Error("AMADEUS_API_KEY / AMADEUS_API_SECRET not configured");
  }

  const authResponse = await fetch(
    `${AMADEUS_BASE_URL}/v1/security/oauth2/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=client_credentials&client_id=${encodeURIComponent(
        apiKey,
      )}&client_secret=${encodeURIComponent(apiSecret)}`,
    },
  );

  if (!authResponse.ok) {
    const errText = await authResponse.text();
    invalidateToken();
    throw new Error(`Amadeus auth failed (${authResponse.status}): ${errText}`);
  }

  const authData = await authResponse.json();
  cachedToken = {
    token: authData.access_token,
    expiresAt: Date.now() + 25 * 60 * 1000,
  };
  return authData.access_token;
}

const ALLOWED_CABINS = new Set([
  "ECONOMY",
  "PREMIUM_ECONOMY",
  "BUSINESS",
  "FIRST",
]);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("AMADEUS_API_KEY");
    const apiSecret = Deno.env.get("AMADEUS_API_SECRET");
    if (!apiKey || !apiSecret) {
      return new Response(
        JSON.stringify({
          error: "Flight search temporarily unavailable. Authentication misconfigured.",
          code: "AUTH_MISCONFIGURED",
        }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      returnDate,
      adults,
      travelClass,
      currencyCode,
      nonStop,
      max,
    } = body || {};

    if (!originLocationCode || !destinationLocationCode || !departureDate || !adults) {
      return new Response(
        JSON.stringify({
          error: "Missing required parameters",
          hint: "originLocationCode, destinationLocationCode, departureDate and adults are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const params = new URLSearchParams();
    params.set("originLocationCode", String(originLocationCode).toUpperCase());
    params.set(
      "destinationLocationCode",
      String(destinationLocationCode).toUpperCase(),
    );
    params.set("departureDate", String(departureDate));
    if (returnDate) params.set("returnDate", String(returnDate));
    params.set("adults", String(adults));
    if (travelClass && ALLOWED_CABINS.has(String(travelClass).toUpperCase())) {
      params.set("travelClass", String(travelClass).toUpperCase());
    }
    params.set("currencyCode", String(currencyCode || "USD"));
    params.set("max", String(Math.min(Math.max(Number(max) || 50, 1), 250)));
    if (nonStop === true || nonStop === "true") {
      params.set("nonStop", "true");
    }

    console.log(
      `🔧 Amadeus flight search (${USE_PROD_APIS ? "PROD" : "TEST"}): ${params.toString()}`,
    );

    let token = await getAmadeusToken();

    const doFetch = (authToken: string) =>
      fetch(`${AMADEUS_BASE_URL}/v2/shopping/flight-offers?${params.toString()}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: "application/json",
        },
      });

    let res = await doFetch(token);
    if (res.status === 401) {
      token = await getAmadeusToken(true);
      res = await doFetch(token);
    }

    if (res.status === 429) {
      const errText = await res.text();
      return new Response(
        JSON.stringify({
          error: "Quota limit exceeded",
          details: errText,
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!res.ok) {
      const errText = await res.text();
      console.error("❌ Amadeus flight search failed:", res.status, errText);

      // Try to surface Amadeus-style {errors:[{detail,code,...}]} more nicely
      let parsed: any = null;
      try {
        parsed = JSON.parse(errText);
      } catch {
        // ignore
      }
      const detail =
        parsed?.errors?.[0]?.detail ||
        parsed?.errors?.[0]?.title ||
        errText ||
        "Failed to fetch flight offers";

      return new Response(
        JSON.stringify({
          error: "Failed to fetch flight offers",
          details: detail,
          status: res.status,
        }),
        {
          status: res.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const json = await res.json();
    const offers = Array.isArray(json?.data) ? json.data : [];

    console.log(`✅ Amadeus returned ${offers.length} flight offers`);

    return new Response(
      JSON.stringify({
        data: offers,
        dictionaries: json?.dictionaries || {},
        meta: {
          ...(json?.meta || {}),
          environment: USE_PROD_APIS ? "amadeus-prod" : "amadeus-test",
          provider: "amadeus",
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("❌ Error in flights-search:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
