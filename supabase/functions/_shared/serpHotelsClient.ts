import { parseSerpHotels, type SerpHotelRate } from "./hotelRates.ts";

export interface SerpHotelsQuery {
  q: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children?: number;
  childrenAges?: number[];
  currency?: string;
}

const CACHE_TTL_MS = 15 * 60 * 1000;
const cache = new Map<string, { at: number; rates: SerpHotelRate[] }>();

/**
 * Fetch real Google Hotels rates via SerpApi. Returns [] on failure — callers
 * must then show "price unavailable", never a generated price.
 * `fresh` bypasses the cache (used right before booking).
 */
export async function fetchSerpHotelRates(params: SerpHotelsQuery, opts: { fresh?: boolean } = {}): Promise<{ rates: SerpHotelRate[]; fetchedAt: string; cached: boolean; error?: string }> {
  const apiKey = Deno.env.get("SERPAPI_KEY") || Deno.env.get("SERP_API_KEY");
  const currency = (params.currency || "USD").toUpperCase();
  if (!apiKey) return { rates: [], fetchedAt: new Date().toISOString(), cached: false, error: "SERPAPI_KEY not configured" };

  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google_hotels");
  url.searchParams.set("q", params.q);
  url.searchParams.set("check_in_date", params.checkInDate);
  url.searchParams.set("check_out_date", params.checkOutDate);
  url.searchParams.set("adults", String(Math.max(1, params.adults || 1)));
  if (params.children && params.children > 0) {
    url.searchParams.set("children", String(params.children));
    if (params.childrenAges?.length) url.searchParams.set("children_ages", params.childrenAges.join(","));
  }
  url.searchParams.set("currency", currency);
  url.searchParams.set("hl", "en");
  url.searchParams.set("gl", "us");

  const cacheKey = url.toString();
  const hit = cache.get(cacheKey);
  if (!opts.fresh && hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return { rates: hit.rates, fetchedAt: new Date(hit.at).toISOString(), cached: true };
  }

  url.searchParams.set("api_key", apiKey);
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 15000);
    const res = await fetch(url.toString(), { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) {
      console.error("[serp-hotels] HTTP", res.status);
      return { rates: [], fetchedAt: new Date().toISOString(), cached: false, error: `SerpApi HTTP ${res.status}` };
    }
    const json = await res.json();
    const rates = parseSerpHotels(json, currency);
    const at = Date.now();
    cache.set(cacheKey, { at, rates });
    if (cache.size > 200) cache.delete(cache.keys().next().value as string);
    return { rates, fetchedAt: new Date(at).toISOString(), cached: false };
  } catch (e) {
    console.error("[serp-hotels] fetch failed", e instanceof Error ? e.message : e);
    return { rates: [], fetchedAt: new Date().toISOString(), cached: false, error: "SerpApi request failed" };
  }
}
