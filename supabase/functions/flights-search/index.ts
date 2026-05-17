/// <reference path="./deno-shim.d.ts" />
// @ts-expect-error TS2307 — Supabase Edge Functions run on Deno, not Vite.
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

const ALLOWED_CABINS = new Set([
  "ECONOMY",
  "PREMIUM_ECONOMY",
  "BUSINESS",
  "FIRST",
]);

const CABIN_TO_SERPAPI: Record<string, number> = {
  ECONOMY: 1,
  PREMIUM_ECONOMY: 2,
  BUSINESS: 3,
  FIRST: 4,
};

// ---------------- SerpAPI (primary) ----------------

interface SerpFlightSegment {
  departure_airport?: { id?: string; name?: string; time?: string };
  arrival_airport?: { id?: string; name?: string; time?: string };
  duration?: number;
  airline?: string;
  airline_logo?: string;
  flight_number?: string;
  airplane?: string;
  travel_class?: string;
}

interface SerpFlightOption {
  flights?: SerpFlightSegment[];
  layovers?: Array<{ duration?: number; name?: string; id?: string }>;
  total_duration?: number;
  price?: number;
  type?: string;
  airline_logo?: string;
  departure_token?: string;
  booking_token?: string;
}

function minutesToISODuration(mins?: number): string {
  if (!mins || mins <= 0) return "PT0M";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `PT${h ? `${h}H` : ""}${m ? `${m}M` : ""}` || "PT0M";
}

function toAmadeusTime(t?: string): string {
  // SerpAPI returns "2024-12-25 18:30" — convert to "2024-12-25T18:30:00"
  if (!t) return "";
  return t.replace(" ", "T") + (t.length === 16 ? ":00" : "");
}

function serpToAmadeusOffer(
  opt: SerpFlightOption,
  index: number,
  adults: number,
  currency: string,
): { offer: any; carriers: Record<string, string> } {
  const carriers: Record<string, string> = {};
  const segments = (opt.flights || []).map((seg, i) => {
    const carrierCode = (seg.flight_number || "").split(" ")[0] || "XX";
    const flightNum = (seg.flight_number || "").split(" ")[1] || String(i);
    if (seg.airline) carriers[carrierCode] = seg.airline;
    return {
      departure: {
        iataCode: seg.departure_airport?.id || "",
        at: toAmadeusTime(seg.departure_airport?.time),
      },
      arrival: {
        iataCode: seg.arrival_airport?.id || "",
        at: toAmadeusTime(seg.arrival_airport?.time),
      },
      carrierCode,
      number: flightNum,
      aircraft: { code: seg.airplane || "" },
      duration: minutesToISODuration(seg.duration),
      id: `${index}-${i}`,
      numberOfStops: 0,
      blacklistedInEU: false,
    };
  });

  const total = opt.price ?? 0;
  return {
    offer: {
      type: "flight-offer",
      id: String(index + 1),
      source: "GDS",
      instantTicketingRequired: false,
      nonHomogeneous: false,
      oneWay: false,
      lastTicketingDate: new Date(Date.now() + 86400000)
        .toISOString()
        .slice(0, 10),
      numberOfBookableSeats: 9,
      itineraries: [
        {
          duration: minutesToISODuration(opt.total_duration),
          segments,
        },
      ],
      price: {
        currency,
        total: String(total),
        base: String(total),
        fees: [{ amount: "0.00", type: "SUPPLIER" }],
        grandTotal: String(total),
      },
      pricingOptions: {
        fareType: ["PUBLISHED"],
        includedCheckedBagsOnly: false,
      },
      validatingAirlineCodes: Object.keys(carriers).slice(0, 1),
      travelerPricings: Array.from({ length: adults }, (_, i) => ({
        travelerId: String(i + 1),
        fareOption: "STANDARD",
        travelerType: "ADULT",
        price: {
          currency,
          total: String((total / adults).toFixed(2)),
          base: String((total / adults).toFixed(2)),
        },
        fareDetailsBySegment: segments.map((s) => ({
          segmentId: s.id,
          cabin: opt.flights?.[0]?.travel_class?.toUpperCase().replace(/ /g, "_") || "ECONOMY",
          fareBasis: "PUBLISHED",
          class: "Y",
          includedCheckedBags: { quantity: 0 },
        })),
      })),
      bookingToken: opt.booking_token || opt.departure_token || null,
    },
    carriers,
  };
}

async function searchSerpApi(params: {
  originLocationCode: string;
  destinationLocationCode: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  travelClass?: string;
  currencyCode?: string;
  nonStop?: boolean | string;
  max?: number;
}): Promise<{ data: any[]; dictionaries: any } | { error: string; status?: number }> {
  const SERPAPI_KEY = Deno.env.get("SERPAPI_KEY");
  if (!SERPAPI_KEY) return { error: "SERPAPI_KEY missing" };

  const sp = new URLSearchParams();
  sp.set("engine", "google_flights");
  sp.set("api_key", SERPAPI_KEY);
  sp.set("departure_id", String(params.originLocationCode).toUpperCase());
  sp.set("arrival_id", String(params.destinationLocationCode).toUpperCase());
  sp.set("outbound_date", String(params.departureDate));
  if (params.returnDate) {
    sp.set("return_date", String(params.returnDate));
    sp.set("type", "1"); // round trip
  } else {
    sp.set("type", "2"); // one-way
  }
  sp.set("adults", String(params.adults));
  sp.set("currency", String(params.currencyCode || "USD"));
  sp.set("hl", "en");
  sp.set("gl", "us");
  if (params.travelClass && CABIN_TO_SERPAPI[String(params.travelClass).toUpperCase()]) {
    sp.set("travel_class", String(CABIN_TO_SERPAPI[String(params.travelClass).toUpperCase()]));
  }
  if (params.nonStop === true || params.nonStop === "true") {
    sp.set("stops", "1");
  }

  const url = `https://serpapi.com/search.json?${sp.toString()}`;
  console.log(`🔎 SerpAPI Google Flights: ${params.originLocationCode}→${params.destinationLocationCode} ${params.departureDate}`);

  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text();
    console.error("❌ SerpAPI error:", res.status, txt.slice(0, 500));
    return { error: `SerpAPI failed: ${txt.slice(0, 300)}`, status: res.status };
  }

  const json = await res.json();
  if (json.error) {
    return { error: String(json.error) };
  }

  const best: SerpFlightOption[] = json.best_flights || [];
  const other: SerpFlightOption[] = json.other_flights || [];
  const allOptions = [...best, ...other].slice(0, params.max || 50);

  const currency = params.currencyCode || "USD";
  const allCarriers: Record<string, string> = {};
  const offers = allOptions.map((opt, i) => {
    const { offer, carriers } = serpToAmadeusOffer(opt, i, params.adults, currency);
    Object.assign(allCarriers, carriers);
    return offer;
  });

  console.log(`✅ SerpAPI returned ${offers.length} flight offers`);
  return {
    data: offers,
    dictionaries: { carriers: allCarriers },
  };
}

// ---------------- Amadeus (fallback) ----------------

let cachedToken: { token: string; expiresAt: number } | null = null;
function invalidateToken(): void {
  cachedToken = null;
}

async function getAmadeusToken(forceRefresh = false): Promise<string> {
  if (forceRefresh) invalidateToken();
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token;

  const apiKey = Deno.env.get("AMADEUS_API_KEY");
  const apiSecret = Deno.env.get("AMADEUS_API_SECRET");
  if (!apiKey || !apiSecret) throw new Error("AMADEUS not configured");

  const r = await fetch(`${AMADEUS_BASE_URL}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=client_credentials&client_id=${encodeURIComponent(apiKey)}&client_secret=${encodeURIComponent(apiSecret)}`,
  });
  if (!r.ok) {
    invalidateToken();
    throw new Error(`Amadeus auth failed (${r.status}): ${await r.text()}`);
  }
  const d = await r.json();
  cachedToken = { token: d.access_token, expiresAt: Date.now() + 25 * 60 * 1000 };
  return d.access_token;
}

async function searchAmadeus(body: any) {
  const params = new URLSearchParams();
  params.set("originLocationCode", String(body.originLocationCode).toUpperCase());
  params.set("destinationLocationCode", String(body.destinationLocationCode).toUpperCase());
  params.set("departureDate", String(body.departureDate));
  if (body.returnDate) params.set("returnDate", String(body.returnDate));
  params.set("adults", String(body.adults));
  if (body.travelClass && ALLOWED_CABINS.has(String(body.travelClass).toUpperCase())) {
    params.set("travelClass", String(body.travelClass).toUpperCase());
  }
  params.set("currencyCode", String(body.currencyCode || "USD"));
  params.set("max", String(Math.min(Math.max(Number(body.max) || 50, 1), 250)));
  if (body.nonStop === true || body.nonStop === "true") params.set("nonStop", "true");

  let token = await getAmadeusToken();
  const doFetch = (t: string) =>
    fetch(`${AMADEUS_BASE_URL}/v2/shopping/flight-offers?${params.toString()}`, {
      headers: { Authorization: `Bearer ${t}`, Accept: "application/json" },
    });
  let res = await doFetch(token);
  if (res.status === 401) {
    token = await getAmadeusToken(true);
    res = await doFetch(token);
  }
  if (!res.ok) {
    throw new Error(`Amadeus ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const json = await res.json();
  return {
    data: Array.isArray(json?.data) ? json.data : [],
    dictionaries: json?.dictionaries || {},
  };
}

// ---------------- Handler ----------------

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const { originLocationCode, destinationLocationCode, departureDate, adults } = body || {};

    if (!originLocationCode || !destinationLocationCode || !departureDate || !adults) {
      return new Response(
        JSON.stringify({
          error: "Missing required parameters",
          hint: "originLocationCode, destinationLocationCode, departureDate and adults are required",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Primary: SerpAPI
    const SERPAPI_KEY = Deno.env.get("SERPAPI_KEY");
    if (SERPAPI_KEY) {
      try {
        const result = await searchSerpApi(body);
        if (!("error" in result) && result.data.length > 0) {
          return new Response(
            JSON.stringify({
              data: result.data,
              dictionaries: result.dictionaries,
              meta: { provider: "serpapi-google-flights", count: result.data.length },
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
        console.warn("⚠️ SerpAPI returned no results or errored, falling back to Amadeus", "error" in result ? result.error : "");
      } catch (e) {
        console.error("⚠️ SerpAPI threw, falling back:", e);
      }
    }

    // Fallback: Amadeus
    const amadeus = await searchAmadeus(body);
    return new Response(
      JSON.stringify({
        data: amadeus.data,
        dictionaries: amadeus.dictionaries,
        meta: {
          provider: "amadeus",
          environment: USE_PROD_APIS ? "amadeus-prod" : "amadeus-test",
          count: amadeus.data.length,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("❌ flights-search error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
