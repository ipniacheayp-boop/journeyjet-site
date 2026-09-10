import type { DuffelOffer, DuffelSearchRequest } from "@/types/duffel";

/**
 * Short-lived client cache + in-flight de-duplication for flight searches.
 *
 * Only search *listings* are cached. Prices are always revalidated server-side
 * (duffel-offer-get / order create) before payment, so checkout never uses a
 * cached fare.
 */

const TTL_MS = 2 * 60 * 1000; // 2 minutes — well inside Duffel offer expiry
const MAX_ENTRIES = 20;

export type FlightSearchResult = { offers: DuffelOffer[]; error: string | null };

type Entry = { at: number; result: FlightSearchResult };

const cache = new Map<string, Entry>();
const inflight = new Map<string, Promise<FlightSearchResult>>();

export function flightSearchKey(payload: DuffelSearchRequest): string {
  const legs = Array.isArray(payload.slices) && payload.slices.length
    ? payload.slices.map((s) => `${s.origin}>${s.destination}@${s.departureDate}`).join("|")
    : `${payload.origin}>${payload.destination}@${payload.departureDate}`;

  return [
    legs,
    payload.returnDate || "-",
    payload.adults ?? 1,
    payload.children ?? 0,
    payload.infants ?? 0,
    payload.cabinClass || "economy",
  ].join("::");
}

export function getCachedFlightSearch(key: string): FlightSearchResult | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > TTL_MS) {
    cache.delete(key);
    return null;
  }
  return hit.result;
}

export function setCachedFlightSearch(key: string, result: FlightSearchResult) {
  // Never cache failures — the next attempt should hit the API again.
  if (result.error || result.offers.length === 0) return;
  // Never retain an offer past its own Duffel expiry. Expired offers are also
  // removed from a cached result before it reaches the UI.
  const now = Date.now();
  const validOffers = result.offers.filter((offer) => {
    if (!offer.expires_at) return true;
    const expiry = Date.parse(offer.expires_at);
    return Number.isFinite(expiry) && expiry > now + 5_000;
  });
  if (validOffers.length === 0) return;
  cache.set(key, { at: now, result: { ...result, offers: validOffers } });
  if (cache.size > MAX_ENTRIES) {
    const oldest = cache.keys().next().value as string | undefined;
    if (oldest) cache.delete(oldest);
  }
}

export function getInflightFlightSearch(key: string) {
  return inflight.get(key) ?? null;
}

export function trackInflightFlightSearch(key: string, promise: Promise<FlightSearchResult>) {
  inflight.set(key, promise);
  void promise.finally(() => {
    if (inflight.get(key) === promise) inflight.delete(key);
  });
}

export function clearFlightSearchCache() {
  cache.clear();
}
