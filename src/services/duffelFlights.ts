import { invokeSupabaseFunction } from "@/lib/invokeSupabaseFunction";
import {
  flightSearchKey,
  getCachedFlightSearch,
  getInflightFlightSearch,
  setCachedFlightSearch,
  trackInflightFlightSearch,
  type FlightSearchResult,
} from "@/lib/flightSearchCache";
import { markFlightSearch } from "@/lib/flightSearchPerf";
import type { DuffelOffer, DuffelSearchRequest, DuffelSearchResponse } from "@/types/duffel";

const SEARCH_TIMEOUT_MS = 45_000;

/**
 * All Duffel traffic goes through Edge Functions — the Duffel API key lives only
 * in backend environment variables and is never shipped to the browser.
 */
export async function searchDuffelFlights(
  payload: DuffelSearchRequest,
  options: { signal?: AbortSignal; skipCache?: boolean } = {},
): Promise<FlightSearchResult> {
  const key = flightSearchKey(payload);

  if (!options.skipCache) {
    const cached = getCachedFlightSearch(key);
    if (cached) {
      markFlightSearch("request_started");
      markFlightSearch("response_received");
      return cached;
    }

    // One user search == one active request: reuse an identical in-flight call.
    const pending = getInflightFlightSearch(key);
    if (pending) return pending;
  }

  const request = (async (): Promise<FlightSearchResult> => {
    markFlightSearch("request_started");

    const { data, error } = await invokeSupabaseFunction<DuffelSearchResponse>(
      "duffel-flights-search",
      payload,
      { signal: options.signal, timeoutMs: SEARCH_TIMEOUT_MS },
    );

    markFlightSearch("response_received");

    if (error) {
      if (error === "aborted") return { offers: [], error: null };
      return {
        offers: [],
        error:
          error.includes("timed out")
            ? "The flight search took too long to respond. Please try again."
            : "We couldn't reach the flight search service. Please check your connection and try again.",
      };
    }

    if (data?.error) return { offers: [], error: data.error };

    const offers: DuffelOffer[] = Array.isArray(data?.offers) ? data.offers : [];
    const result: FlightSearchResult = { offers, error: null };
    setCachedFlightSearch(key, result);
    return result;
  })();

  if (!options.skipCache) trackInflightFlightSearch(key, request);

  return request;
}

export async function getDuffelOffer(
  offerId: string,
): Promise<{ offer: DuffelOffer | null; error: string | null; expired?: boolean }> {
  const { data, error } = await invokeSupabaseFunction<{
    offer?: DuffelOffer;
    error?: string;
    expired?: boolean;
  }>("duffel-offer-get", { offerId });

  if (error) return { offer: null, error: "We couldn't load this flight right now. Please try again." };
  if (data?.error) return { offer: null, error: data.error, expired: data.expired };

  return { offer: data?.offer ?? null, error: null };
}
