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

// Metro/city codes → comma-separated airport lists (Google Flights accepts multi-airport queries)
const METRO_TO_AIRPORTS: Record<string, string> = {
  PAR: "CDG,ORY",
  NYC: "JFK,LGA,EWR",
  LON: "LHR,LGW,STN,LTN,LCY",
  TYO: "HND,NRT",
  WAS: "IAD,DCA,BWI",
  CHI: "ORD,MDW",
  MIL: "MXP,LIN,BGY",
  ROM: "FCO,CIA",
  STO: "ARN,BMA,NYO",
  MOW: "SVO,DME,VKO",
  SEL: "ICN,GMP",
  BJS: "PEK,PKX",
  SHA: "PVG,SHA",
  OSA: "KIX,ITM",
  BUE: "EZE,AEP",
  SAO: "GRU,CGH,VCP",
  RIO: "GIG,SDU",
};

function expandCode(code: string): string {
  const up = String(code).toUpperCase();
  return METRO_TO_AIRPORTS[up] || up;
}

async function searchSerpApi(params: any) {
  const SERPAPI_KEY = Deno.env.get("SERPAPI_KEY");
  if (!SERPAPI_KEY) return { error: "SERPAPI_KEY missing" } as const;

  const sp = new URLSearchParams();
  sp.set("engine", "google_flights");
  sp.set("api_key", SERPAPI_KEY);
  sp.set("departure_id", expandCode(params.originLocationCode));
  sp.set("arrival_id", expandCode(params.destinationLocationCode));
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

  console.log(`🔎 SerpAPI: ${sp.get("departure_id")}→${sp.get("arrival_id")} ${params.departureDate}`);
  const res = await fetch(`https://serpapi.com/search.json?${sp.toString()}`);
  if (!res.ok) {
    const txt = await res.text();
    return { error: `SerpAPI failed (${res.status}): ${txt.slice(0, 300)}` } as const;
  }
  const json = await res.json();
  if (json.error) {
    const msg = String(json.error);
    const isEmpty = /hasn't returned any results|no results/i.test(msg);
    if (isEmpty) {
      return { data: [] as any[], dictionaries: { carriers: {} }, empty: true, message: msg } as const;
    }
    return { error: msg } as const;
  }

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
  return { data: offers, dictionaries: { carriers: allCarriers }, empty: offers.length === 0 } as const;
}

// ============================================================
// FlightAPI.io provider (primary)
// Docs: https://docs.flightapi.io  — key is embedded in the URL path.
// ============================================================

const CABIN_TO_FLIGHTAPI: Record<string, string> = {
  ECONOMY: "Economy",
  PREMIUM_ECONOMY: "Premium_Economy",
  BUSINESS: "Business",
  FIRST: "First",
};

function flightApiCabin(travelClass?: string): string {
  return CABIN_TO_FLIGHTAPI[String(travelClass || "ECONOMY").toUpperCase()] || "Economy";
}

interface FaPlace { id: number; display_code?: string; name?: string }
interface FaCarrier { id: number; display_code?: string; name?: string }
interface FaSegment {
  id: string;
  origin_place_id: number;
  destination_place_id: number;
  departure: string;
  arrival: string;
  duration?: number;
  marketing_flight_number?: string;
  marketing_carrier_id?: number;
}
interface FaLeg {
  id: string;
  segment_ids?: string[];
  duration?: number;
  stop_count?: number;
}
interface FaItinerary {
  id: string;
  leg_ids?: string[];
  cheapest_price?: { amount?: number };
  pricing_options?: Array<{
    price?: { amount?: number };
    items?: Array<{ url?: string }>;
  }>;
}

function flightApiToOffers(json: any, adults: number, currency: string, max: number) {
  const places: Record<number, FaPlace> = {};
  for (const p of (json.places || []) as FaPlace[]) places[p.id] = p;
  const carriers: Record<number, FaCarrier> = {};
  for (const c of (json.carriers || []) as FaCarrier[]) carriers[c.id] = c;
  const legsById: Record<string, FaLeg> = {};
  for (const l of (json.legs || []) as FaLeg[]) legsById[l.id] = l;
  const segsById: Record<string, FaSegment> = {};
  for (const s of (json.segments || []) as FaSegment[]) segsById[s.id] = s;

  const carriersDict: Record<string, string> = {};
  const itineraries: FaItinerary[] = (json.itineraries || []).slice(0, max);

  const offers = itineraries.map((it, idx) => {
    // pick cheapest pricing option
    let bestPrice = it.cheapest_price?.amount;
    let deeplink: string | null = null;
    for (const po of it.pricing_options || []) {
      const amt = po.price?.amount;
      if (amt != null && (bestPrice == null || amt < bestPrice)) bestPrice = amt;
      if (!deeplink && po.items?.[0]?.url) deeplink = po.items[0].url;
    }
    const total = Number(bestPrice ?? 0);

    const offerItineraries = (it.leg_ids || [])
      .map((legId) => legsById[legId])
      .filter(Boolean)
      .map((leg) => {
        const segments = (leg.segment_ids || [])
          .map((sid) => segsById[sid])
          .filter(Boolean)
          .map((s, i) => {
            const mc = s.marketing_carrier_id != null ? carriers[s.marketing_carrier_id] : undefined;
            const code = mc?.display_code || "XX";
            if (mc?.name) carriersDict[code] = mc.name;
            return {
              departure: { iataCode: places[s.origin_place_id]?.display_code || "", at: s.departure },
              arrival: { iataCode: places[s.destination_place_id]?.display_code || "", at: s.arrival },
              carrierCode: code,
              number: s.marketing_flight_number || String(i),
              aircraft: { code: "" },
              duration: minutesToISODuration(s.duration),
              id: `${idx}-${i}`,
              numberOfStops: 0,
              blacklistedInEU: false,
            };
          });
        return { duration: minutesToISODuration(leg.duration), segments };
      })
      .filter((i) => i.segments.length > 0);

    if (offerItineraries.length === 0) return null;

    const validating = Object.keys(carriersDict).slice(0, 1);
    return {
      type: "flight-offer",
      id: String(idx + 1),
      source: "FLIGHTAPI",
      instantTicketingRequired: false,
      nonHomogeneous: false,
      oneWay: offerItineraries.length === 1,
      lastTicketingDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
      numberOfBookableSeats: 9,
      itineraries: offerItineraries,
      price: {
        currency,
        total: String(total),
        base: String(total),
        fees: [{ amount: "0.00", type: "SUPPLIER" }],
        grandTotal: String(total),
      },
      pricingOptions: { fareType: ["PUBLISHED"], includedCheckedBagsOnly: false },
      validatingAirlineCodes: validating,
      travelerPricings: Array.from({ length: adults }, (_, i) => ({
        travelerId: String(i + 1),
        fareOption: "STANDARD",
        travelerType: "ADULT",
        price: {
          currency,
          total: String((total / adults).toFixed(2)),
          base: String((total / adults).toFixed(2)),
        },
        fareDetailsBySegment: offerItineraries[0].segments.map((s) => ({
          segmentId: s.id,
          cabin: "ECONOMY",
          fareBasis: "PUBLISHED",
          class: "Y",
          includedCheckedBags: { quantity: 0 },
        })),
      })),
      bookingToken: deeplink,
    };
  }).filter(Boolean);

  return { data: offers, dictionaries: { carriers: carriersDict }, empty: offers.length === 0 } as const;
}

async function searchFlightApi(params: any) {
  const KEY = Deno.env.get("FLIGHT_API_KEY");
  if (!KEY) return { error: "FLIGHT_API_KEY missing" } as const;

  const origin = String(params.originLocationCode).toUpperCase();
  const dest = String(params.destinationLocationCode).toUpperCase();
  const cabin = flightApiCabin(params.travelClass);
  const currency = String(params.currencyCode || "USD");
  const adults = Number(params.adults) || 1;
  const children = Number(params.children) || 0;
  const infants = Number(params.infants) || 0;

  const base = "https://api.flightapi.io";
  const url = params.returnDate
    ? `${base}/roundtrip/${KEY}/${origin}/${dest}/${params.departureDate}/${params.returnDate}/${adults}/${children}/${infants}/${cabin}/${currency}`
    : `${base}/onewaytrip/${KEY}/${origin}/${dest}/${params.departureDate}/${adults}/${children}/${infants}/${cabin}/${currency}`;

  // FlightAPI is occasionally flaky on the first call and asks to retry.
  const MAX_TRIES = 3;
  let json: any = null;
  for (let attempt = 1; attempt <= MAX_TRIES; attempt++) {
    console.log(`🔎 FlightAPI ${origin}→${dest} ${params.departureDate} (attempt ${attempt}/${MAX_TRIES})`);
    const res = await fetch(url.replace(KEY, KEY));
    const status = res.status;

    if (status === 410) {
      return { data: [] as any[], dictionaries: { carriers: {} }, empty: true, message: "No flights for this date." } as const;
    }
    if (status === 429) {
      return { error: "429 Quota limit exceeded" } as const;
    }

    let parsed: any = null;
    try {
      parsed = await res.json();
    } catch {
      parsed = null;
    }

    if (status === 200 && parsed && Array.isArray(parsed.itineraries)) {
      json = parsed;
      break;
    }

    // 400 "something went wrong, please try again" → retry
    const msg = parsed?.message || `HTTP ${status}`;
    console.warn(`⚠️ FlightAPI attempt ${attempt} failed: ${msg}`);
    if (attempt === MAX_TRIES) {
      return { error: `FlightAPI failed (${status}): ${String(msg).slice(0, 200)}` } as const;
    }
    await new Promise((r) => setTimeout(r, 1500 * attempt));
  }

  const currencyCode = String(params.currencyCode || "USD");
  const result = flightApiToOffers(json, adults, currencyCode, params.max || 50);
  console.log(`✅ FlightAPI returned ${result.data.length} offers`);
  return result;
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

    const hasFlightApi = !!Deno.env.get("FLIGHT_API_KEY");
    const hasSerp = !!Deno.env.get("SERPAPI_KEY");

    if (!hasFlightApi && !hasSerp) {
      return new Response(
        JSON.stringify({ error: "Flight search not configured", code: "PROVIDER_MISSING", data: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let result: any = null;
    let provider = "";

    // Primary provider: FlightAPI.io
    if (hasFlightApi) {
      result = await searchFlightApi(body);
      provider = "flightapi";
      if (result.error) {
        console.error("⚠️ FlightAPI error:", result.error);
        // Fall back to SerpAPI if available
        if (hasSerp) {
          console.log("↩️ Falling back to SerpAPI");
          result = await searchSerpApi(body);
          provider = "serpapi-google-flights";
        }
      }
    } else {
      result = await searchSerpApi(body);
      provider = "serpapi-google-flights";
    }

    if (result.error) {
      console.error("⚠️ Flight search error:", result.error);
      return new Response(
        JSON.stringify({ error: result.error, data: [], dictionaries: { carriers: {} } }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        data: result.data || [],
        dictionaries: result.dictionaries || { carriers: {} },
        meta: {
          provider,
          count: (result.data || []).length,
          ...(result.empty ? { empty: true, message: "No flights found for this route/date." } : {}),
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
