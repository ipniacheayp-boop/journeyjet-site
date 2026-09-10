import type { DuffelOffer } from "@/types/duffel";

/**
 * Domestic vs international detection for the passenger-details form.
 *
 * The verdict comes only from the airport country codes on the selected itinerary
 * (Duffel `iata_country_code` on every slice/segment place) — never from the URL,
 * the search form, or a hardcoded destination list.
 *
 * If any airport is missing its country we fall back to "international", which keeps
 * the stricter passport flow rather than silently dropping required documents.
 */
export interface ItineraryScope {
  isDomestic: boolean;
  /** Single country code when the whole trip stays inside one country. */
  countryCode: string | null;
  /** False when a country code was missing anywhere on the itinerary. */
  resolved: boolean;
}

const code = (value: string | null | undefined) =>
  typeof value === "string" && /^[A-Za-z]{2}$/.test(value.trim()) ? value.trim().toUpperCase() : null;

export function getItineraryScope(offer: DuffelOffer | null | undefined): ItineraryScope {
  if (!offer || !Array.isArray(offer.slices) || offer.slices.length === 0) {
    return { isDomestic: false, countryCode: null, resolved: false };
  }

  const countries = new Set<string>();
  let missing = false;

  for (const slice of offer.slices) {
    for (const place of [slice.origin, slice.destination]) {
      const c = code(place?.iata_country_code);
      if (c) countries.add(c);
      else missing = true;
    }
    for (const segment of slice.segments ?? []) {
      for (const place of [segment.origin, segment.destination]) {
        const c = code(place?.iata_country_code);
        if (c) countries.add(c);
        else missing = true;
      }
      // A technical stop in another country still makes the trip international.
      for (const stop of segment.stops ?? []) {
        const c = code(stop.airport?.iata_country_code);
        if (c) countries.add(c);
      }
    }
  }

  if (missing || countries.size === 0) {
    return { isDomestic: false, countryCode: null, resolved: false };
  }

  const isDomestic = countries.size === 1;
  return { isDomestic, countryCode: isDomestic ? [...countries][0] : null, resolved: true };
}
