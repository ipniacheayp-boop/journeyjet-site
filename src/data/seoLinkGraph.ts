/**
 * SEO link graph — the single place that knows which programmatic pages actually
 * exist, so internal links are never generated for routes that would 404 or
 * render a soft 404.
 *
 * Every module that builds internal links (hub pages, city landing pages, the
 * prerenderer, the sitemap generator and the audit script) resolves link targets
 * through these helpers.
 */

import { popularDestinations } from "./destinationsData";
import { airportLandingPages } from "./airportLandingData";
import { COUNTRY_META } from "./travelGuides";
import type { HotelDestination } from "./hotelDestinations";

const flightsToSlugs = new Set(popularDestinations.map((d) => d.slug));
const carRentalSlugs = new Set(popularDestinations.map((d) => d.slug));
const cityGuideSlugs = new Set(popularDestinations.map((d) => d.slug));

/** `/flights-to/{slug}` exists only for the maintained destination list. */
export function flightsToPath(slug: string): string | undefined {
  return flightsToSlugs.has(slug) ? `/flights-to/${slug}` : undefined;
}

/** `/cheap-car-rentals-in-{slug}` exists only for the maintained destination list. */
export function carRentalPath(slug: string): string | undefined {
  return carRentalSlugs.has(slug) ? `/cheap-car-rentals-in-${slug}` : undefined;
}

/** `/travel-guide/{slug}` city guide, when one exists. */
export function cityGuidePath(slug: string): string | undefined {
  return cityGuideSlugs.has(slug) ? `/travel-guide/${slug}` : undefined;
}

const countryGuideBySlug = new Map(COUNTRY_META.map((c) => [c.slug, c]));
const countryGuideByName = new Map(COUNTRY_META.map((c) => [c.name.toLowerCase(), c]));

/** `/travel-guide/country/{slug}` for a country name, when a guide exists. */
export function countryGuideFor(country: string) {
  return countryGuideByName.get(country.toLowerCase()) ?? countryGuideBySlug.get(country.toLowerCase());
}

export function countryGuidePath(country: string): string | undefined {
  const guide = countryGuideFor(country);
  return guide ? `/travel-guide/country/${guide.slug}` : undefined;
}

/** Airport landing pages grouped by US state code — real airports, real routes. */
const airportsByStateCode = new Map<string, typeof airportLandingPages>();
for (const ap of airportLandingPages) {
  const list = airportsByStateCode.get(ap.stateCode) ?? [];
  list.push(ap);
  airportsByStateCode.set(ap.stateCode, list);
}

export function airportsForStateCode(stateCode?: string) {
  if (!stateCode) return [];
  return airportsByStateCode.get(stateCode) ?? [];
}

export function airportsForCity(name: string, stateCode?: string) {
  return airportsForStateCode(stateCode).filter(
    (ap) => ap.cityName.toLowerCase() === name.toLowerCase(),
  );
}

export interface SeoLink {
  href: string;
  label: string;
}

/** Contextual links that exist for a hotel destination: flights, cars, guides, airports. */
export function relatedLinksForDestination(d: HotelDestination): SeoLink[] {
  const links: SeoLink[] = [];
  const flights = flightsToPath(d.slug);
  if (flights) links.push({ href: flights, label: `Flights to ${d.name}` });
  const cars = carRentalPath(d.slug);
  if (cars) links.push({ href: cars, label: `Car rentals in ${d.name}` });
  const guide = cityGuidePath(d.slug);
  if (guide) links.push({ href: guide, label: `${d.name} travel guide` });
  for (const ap of airportsForCity(d.name, d.stateCode).slice(0, 2)) {
    links.push({
      href: `/airport/${ap.slug}`,
      label: `${ap.airportName} (${ap.airportCode}) flights`,
    });
  }
  const country = countryGuidePath(d.country);
  if (country) links.push({ href: country, label: `${d.country} travel guide` });
  return links;
}
