import { invokeSupabaseFunction } from "@/lib/invokeSupabaseFunction";
import type { DuffelOffer, DuffelSearchRequest, DuffelSearchResponse } from "@/types/duffel";

/**
 * All Duffel traffic goes through Edge Functions — the Duffel API key lives only
 * in backend environment variables and is never shipped to the browser.
 */
export async function searchDuffelFlights(
  payload: DuffelSearchRequest,
): Promise<{ offers: DuffelOffer[]; error: string | null }> {
  const { data, error } = await invokeSupabaseFunction<DuffelSearchResponse>(
    "duffel-flights-search",
    payload,
  );

  if (error) {
    return {
      offers: [],
      error: "We couldn't reach the flight search service. Please check your connection and try again.",
    };
  }

  if (data?.error) return { offers: [], error: data.error };

  return { offers: Array.isArray(data?.offers) ? data.offers : [], error: null };
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
