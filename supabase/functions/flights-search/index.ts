/// <reference path="./deno-shim.d.ts" />
// @ts-expect-error TS2307 — Supabase Edge Functions run on Deno, not Vite.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CABIN_TO_SERPAPI: Record<string, number> = {
  ECONOMY: 1,
  PREMIUM_ECONOMY: 2,
  BUSINESS: 3,
  FIRST: 4,
};

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
  if (!t) return "";
  return t.replace(" ", "T") + (t.length === 16 ? ":00" : "");
}

function serpToOffer(
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
      lastTicketingDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      numberOfBookableSeats: 9,
      itineraries: [{ duration: minutesToISODuration(opt.total_duration), segments }],
      price: {
        currency,
        total: String(total),
        base: String(total),
        fees: [{ amount: "0.00", type: "SUPPLIER" }],
        grandTotal: String(total),
      },
      pricingOptions: { fareType: ["PUBLISHED"], includedCheckedBagsOnly: false },
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

async function searchSerpApi(params: any) {
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
    sp.set("type", "1");
  } else {
    sp.set("type", "2");
  }
  sp.set("adults", String(params.adults));
  sp.set("currency", String(params.currencyCode || "USD"));
  sp.set("hl", "en");
  sp.set("gl", "us");
  if (params.travelClass && CABIN_TO_SERPAPI[String(params.travelClass).toUpperCase()]) {
    sp.set("travel_class", String(CABIN_TO_SERPAPI[String(params.travelClass).toUpperCase()]));
  }
  if (params.nonStop === true || params.nonStop === "true") sp.set("stops", "1");

  console.log(`🔎 SerpAPI: ${params.originLocationCode}→${params.destinationLocationCode} ${params.departureDate}`);
  const res = await fetch(`https://serpapi.com/search.json?${sp.toString()}`);
  if (!res.ok) {
    const txt = await res.text();
    return { error: `SerpAPI failed (${res.status}): ${txt.slice(0, 300)}` };
  }
  const json = await res.json();
  if (json.error) return { error: String(json.error) };

  const best: SerpFlightOption[] = json.best_flights || [];
  const other: SerpFlightOption[] = json.other_flights || [];
  const allOptions = [...best, ...other].slice(0, params.max || 50);

  const currency = params.currencyCode || "USD";
  const allCarriers: Record<string, string> = {};
  const offers = allOptions.map((opt, i) => {
    const { offer, carriers } = serpToOffer(opt, i, params.adults, currency);
    Object.assign(allCarriers, carriers);
    return offer;
  });

  console.log(`✅ SerpAPI returned ${offers.length} offers`);
  return { data: offers, dictionaries: { carriers: allCarriers } };
}

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

    if (!Deno.env.get("SERPAPI_KEY")) {
      return new Response(
        JSON.stringify({ error: "Flight search not configured", code: "SERPAPI_MISSING" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const result = await searchSerpApi(body);
    if ("error" in result) {
      return new Response(
        JSON.stringify({ error: result.error, data: [] }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        data: result.data,
        dictionaries: result.dictionaries,
        meta: { provider: "serpapi-google-flights", count: result.data.length },
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
