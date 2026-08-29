import { invokeSupabaseFunction } from "@/lib/invokeSupabaseFunction";

/**
 * Deals are produced by the `duffel-deals` Edge Function, which shops real
 * Duffel offer requests server-side. Every field here originates from Duffel —
 * nothing is synthesised on the client.
 */
export interface DuffelDeal {
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
}

export interface DuffelDealsResult {
  deals: DuffelDeal[];
  fromCache: boolean;
  fetchedAt?: number;
}

const DEALS_TIMEOUT_MS = 40_000;

const OFFER_ID = /^off_[A-Za-z0-9_-]{5,120}$/;

/** Drop anything that is not a complete, bookable, unexpired Duffel offer. */
export function usableDeal(deal: DuffelDeal): boolean {
  if (!deal || !OFFER_ID.test(deal.offerId)) return false;
  if (!Number.isFinite(deal.price) || deal.price <= 0) return false;
  if (!deal.currency) return false;
  if (deal.expiresAt) {
    const ts = Date.parse(deal.expiresAt);
    if (Number.isFinite(ts) && ts <= Date.now()) return false;
  }
  return true;
}

export async function fetchDuffelDeals(
  options: { refresh?: boolean; signal?: AbortSignal } = {},
): Promise<DuffelDealsResult> {
  const { data, error } = await invokeSupabaseFunction<{
    deals?: DuffelDeal[];
    fromCache?: boolean;
    fetchedAt?: number;
    error?: string;
  }>("duffel-deals", { refresh: options.refresh === true }, { signal: options.signal, timeoutMs: DEALS_TIMEOUT_MS });

  if (error) {
    if (error === "aborted") return { deals: [], fromCache: false };
    throw new Error(
      error.includes("timed out")
        ? "Loading flight deals took too long. Please try again."
        : "Unable to load flight deals right now.",
    );
  }

  const deals = (Array.isArray(data?.deals) ? data.deals : []).filter(usableDeal);

  if (deals.length === 0) {
    throw new Error(data?.error || "No flight deals available right now.");
  }

  return { deals, fromCache: Boolean(data?.fromCache), fetchedAt: data?.fetchedAt };
}
