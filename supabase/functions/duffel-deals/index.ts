/// <reference path="../flights-search/deno-shim.d.ts" />
// @ts-expect-error TS2307 — Supabase Edge Functions run on Deno, not Vite.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

/**
 * Live flight deals, sourced exclusively from Duffel.
 *
 * One offer request per configured route, all issued in parallel. For every
 * route we keep the cheapest offers and derive a reference price from the
 * other real offers Duffel returned for the same route — no synthetic
 * discounts, prices, airlines or dates are ever produced here.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=120",
    },
  });

type Route = {
  origin: string;
  originCity: string;
  destination: string;
  destCity: string;
};

// Routes we shop for deals. Cities are labels for the UI only — every price,
// airline, date and offer id below comes from Duffel.
const ROUTES: Route[] = [
  { origin: "JFK", originCity: "New York", destination: "LAX", destCity: "Los Angeles" },
  { origin: "LAX", originCity: "Los Angeles", destination: "LAS", destCity: "Las Vegas" },
  { origin: "ORD", originCity: "Chicago", destination: "MCO", destCity: "Orlando" },
  { origin: "ATL", originCity: "Atlanta", destination: "MIA", destCity: "Miami" },
  { origin: "JFK", originCity: "New York", destination: "ORD", destCity: "Chicago" },
  { origin: "LAX", originCity: "Los Angeles", destination: "SFO", destCity: "San Francisco" },
  { origin: "MIA", originCity: "Miami", destination: "JFK", destCity: "New York" },
  { origin: "LAX", originCity: "Los Angeles", destination: "HNL", destCity: "Honolulu" },
  { origin: "DFW", originCity: "Dallas", destination: "CUN", destCity: "Cancun" },
  { origin: "JFK", originCity: "New York", destination: "LHR", destCity: "London" },
  { origin: "JFK", originCity: "New York", destination: "CDG", destCity: "Paris" },
  { origin: "LAX", originCity: "Los Angeles", destination: "NRT", destCity: "Tokyo" },
];

const DEPART_IN_DAYS = 30;
const TRIP_LENGTH_DAYS = 7;
const OFFERS_PER_ROUTE = 3;

// Cached payload is reused across invocations of the same isolate.
const FRESH_MS = 10 * 60 * 1000; // serve without refetching
const STALE_MS = 45 * 60 * 1000; // serve stale while revalidating
// Never hand out an offer that is about to expire — checkout revalidates it.
const MIN_OFFER_TTL_MS = 10 * 60 * 1000;

type Deal = {
  offerId: string;
  origin: string;
  originCity: string;
  originAirport: string | null;
  destination: string;
  destCity: string;
  destAirport: string | null;
  departureDate: string;
  returnDate: string | null;
  departingAt: string | null;
  arrivingAt: string | null;
  price: number;
  currency: string;
  airline: string | null;
  airlineCode: string | null;
  airlineLogo: string | null;
  flightNumber: string | null;
  cabinClass: string | null;
  stops: number;
  segments: number;
  durationMinutes: number | null;
  expiresAt: string | null;
  referencePrice: number | null;
  savings: number | null;
  savingsPercent: number | null;
  isCheapestOnRoute: boolean;
};

type CacheEntry = { deals: Deal[]; fetchedAt: number; routesWithOffers: number };
let cache: CacheEntry | null = null;
let refreshing: Promise<CacheEntry> | null = null;

const isoDurationToMinutes = (iso?: string | null): number | null => {
  if (!iso) return null;
  const m = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?$/.exec(iso);
  if (!m) return null;
  const [, d, h, min] = m;
  return (Number(d ?? 0) * 24 + Number(h ?? 0)) * 60 + Number(min ?? 0);
};

const isoDate = (offsetDays: number): string => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

async function duffelOfferRequest(route: Route, departureDate: string, returnDate: string) {
  const key = Deno.env.get("DUFFEL_API_KEY");
  if (!key) throw new Error("missing_key");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 22_000);

  try {
    const res = await fetch(
      "https://api.duffel.com/air/offer_requests?return_offers=true&supplier_timeout=15000",
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${key}`,
          "Duffel-Version": "v2",
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          data: {
            slices: [
              { origin: route.origin, destination: route.destination, departure_date: departureDate },
              { origin: route.destination, destination: route.origin, departure_date: returnDate },
            ],
            passengers: [{ type: "adult" }],
            cabin_class: "economy",
          },
        }),
      },
    );

    if (!res.ok) {
      console.log(`duffel-deals: ${route.origin}-${route.destination} → HTTP ${res.status}`);
      return [] as Record<string, any>[];
    }

    const body = await res.json();
    const offers = body?.data?.offers;
    return Array.isArray(offers) ? offers : [];
  } catch (err) {
    console.log(
      `duffel-deals: ${route.origin}-${route.destination} failed`,
      err instanceof Error ? err.message : "unknown",
    );
    return [] as Record<string, any>[];
  } finally {
    clearTimeout(timer);
  }
}

function toDeal(
  route: Route,
  offer: Record<string, any>,
  referencePrice: number | null,
  isCheapest: boolean,
): Deal | null {
  const offerId = typeof offer?.id === "string" ? offer.id : null;
  const price = Number(offer?.total_amount);
  const currency = typeof offer?.total_currency === "string" ? offer.total_currency : null;
  const outbound = Array.isArray(offer?.slices) ? offer.slices[0] : null;
  const inbound = Array.isArray(offer?.slices) ? offer.slices[1] ?? null : null;
  const segments = Array.isArray(outbound?.segments) ? outbound.segments : [];
  const first = segments[0];

  if (!offerId || !Number.isFinite(price) || price <= 0 || !currency || !first) return null;

  const departingAt: string | null = first?.departing_at ?? null;
  const lastSegment = segments[segments.length - 1];
  const carrier = first?.marketing_carrier ?? offer?.owner ?? null;
  const paxCabin = Array.isArray(first?.passengers) ? first.passengers[0] : null;

  const departureDate = departingAt ? String(departingAt).slice(0, 10) : null;
  if (!departureDate) return null;

  const inboundFirst = Array.isArray(inbound?.segments) ? inbound.segments[0] : null;
  const returnDate = inboundFirst?.departing_at ? String(inboundFirst.departing_at).slice(0, 10) : null;

  const savings =
    referencePrice !== null && referencePrice > price ? Math.round((referencePrice - price) * 100) / 100 : null;

  return {
    offerId,
    origin: outbound?.origin?.iata_code ?? route.origin,
    originCity: outbound?.origin?.city_name ?? route.originCity,
    originAirport: outbound?.origin?.name ?? null,
    destination: outbound?.destination?.iata_code ?? route.destination,
    destCity: outbound?.destination?.city_name ?? route.destCity,
    destAirport: outbound?.destination?.name ?? null,
    departureDate,
    returnDate,
    departingAt,
    arrivingAt: lastSegment?.arriving_at ?? null,
    price: Math.round(price * 100) / 100,
    currency,
    airline: carrier?.name ?? carrier?.iata_code ?? null,
    airlineCode: carrier?.iata_code ?? null,
    airlineLogo: carrier?.logo_symbol_url ?? null,
    flightNumber:
      first?.marketing_carrier_flight_number && carrier?.iata_code
        ? `${carrier.iata_code}${first.marketing_carrier_flight_number}`
        : null,
    cabinClass: paxCabin?.cabin_class_marketing_name ?? paxCabin?.cabin_class ?? null,
    stops: Math.max(0, segments.length - 1),
    segments: segments.length,
    durationMinutes: isoDurationToMinutes(outbound?.duration),
    expiresAt: offer?.expires_at ?? null,
    referencePrice,
    savings,
    savingsPercent:
      savings !== null && referencePrice ? Math.round((savings / referencePrice) * 100) : null,
    isCheapestOnRoute: isCheapest,
  };
}

function usableOffer(offer: Record<string, any>): boolean {
  const expiry = offer?.expires_at ? Date.parse(offer.expires_at) : NaN;
  if (Number.isFinite(expiry) && expiry - Date.now() < MIN_OFFER_TTL_MS) return false;
  return Number.isFinite(Number(offer?.total_amount)) && Number(offer.total_amount) > 0;
}

function dealsForRoute(route: Route, offers: Record<string, any>[]): Deal[] {
  const usable = offers.filter(usableOffer);
  if (usable.length === 0) return [];

  const sorted = [...usable].sort((a, b) => Number(a.total_amount) - Number(b.total_amount));

  // Reference price = median of the real offers Duffel returned for this route.
  // Savings are only claimed when a genuine cheaper-than-typical fare exists.
  const prices = sorted.map((o) => Number(o.total_amount));
  const reference = prices.length >= 4 ? prices[Math.floor(prices.length / 2)] : null;

  const picked: Deal[] = [];
  const seenAirlines = new Set<string>();

  for (const offer of sorted) {
    if (picked.length >= OFFERS_PER_ROUTE) break;
    const airlineCode = offer?.owner?.iata_code ?? "";
    // Prefer variety: one deal per carrier per route before repeating.
    if (seenAirlines.has(airlineCode) && picked.length > 0) continue;
    const deal = toDeal(route, offer, reference, picked.length === 0);
    if (!deal) continue;
    seenAirlines.add(airlineCode);
    picked.push(deal);
  }

  return picked;
}

async function loadDeals(): Promise<CacheEntry> {
  const departureDate = isoDate(DEPART_IN_DAYS);
  const returnDate = isoDate(DEPART_IN_DAYS + TRIP_LENGTH_DAYS);

  // All routes are shopped concurrently — a single wave, never sequentially.
  const results = await Promise.all(
    ROUTES.map(async (route) => ({
      route,
      offers: await duffelOfferRequest(route, departureDate, returnDate),
    })),
  );

  const deals: Deal[] = [];
  let routesWithOffers = 0;
  for (const { route, offers } of results) {
    const routeDeals = dealsForRoute(route, offers);
    if (routeDeals.length > 0) routesWithOffers++;
    deals.push(...routeDeals);
  }

  deals.sort((a, b) => a.price - b.price);

  return { deals, fetchedAt: Date.now(), routesWithOffers };
}

function refresh(): Promise<CacheEntry> {
  if (!refreshing) {
    refreshing = loadDeals()
      .then((entry) => {
        if (entry.deals.length > 0) cache = entry;
        return entry;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

const stillValid = (deals: Deal[]) =>
  deals.filter((d) => {
    if (!d.expiresAt) return true;
    const ts = Date.parse(d.expiresAt);
    return !Number.isFinite(ts) || ts - Date.now() > MIN_OFFER_TTL_MS;
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (!Deno.env.get("DUFFEL_API_KEY")) {
    return json({ deals: [], error: "Flight deals are temporarily unavailable." }, 503);
  }

  try {
    const url = new URL(req.url);
    // `refresh` may arrive as a query param or in the JSON body (the client's
    // Edge Function helper always POSTs a body, never a query string).
    let bodyRefresh = false;
    if (req.method === "POST") {
      try {
        const body = await req.json();
        bodyRefresh = body?.refresh === true;
      } catch {
        bodyRefresh = false;
      }
    }
    const force = url.searchParams.get("refresh") === "true" || bodyRefresh;
    const age = cache ? Date.now() - cache.fetchedAt : Infinity;

    if (!force && cache) {
      const valid = stillValid(cache.deals);
      const enoughLeft = valid.length >= Math.max(4, Math.floor(cache.deals.length / 2));

      if (age < FRESH_MS && enoughLeft) {
        return json({ deals: valid, total: valid.length, fromCache: true, fetchedAt: cache.fetchedAt });
      }
      if (age < STALE_MS && enoughLeft) {
        // Stale-while-revalidate: answer instantly, warm the cache in background.
        refresh().catch(() => undefined);
        return json({ deals: valid, total: valid.length, fromCache: true, fetchedAt: cache.fetchedAt });
      }
    }

    const entry = await refresh();
    const valid = stillValid(entry.deals);

    if (valid.length === 0) {
      return json({ deals: [], total: 0, fromCache: false, error: "No flight deals available right now." });
    }

    return json({
      deals: valid,
      total: valid.length,
      fromCache: false,
      fetchedAt: entry.fetchedAt,
      routesWithOffers: entry.routesWithOffers,
    });
  } catch (err) {
    console.error("duffel-deals failed", err instanceof Error ? err.message : err);
    return json({ deals: [], error: "Unable to load flight deals right now." }, 502);
  }
});
