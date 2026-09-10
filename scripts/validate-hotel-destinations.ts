// Validates the hotel destination catalog. Runs in predev/prebuild so the build FAILS
// loudly on duplicate slugs, missing data, malformed URLs or changed frozen slugs.

import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import {
  hotelDestinations,
  indexableHotelDestinations,
  hotelDestinationPath,
  hotelDestinationCanonical,
  FROZEN_SLUGS,
  slugifyDestination,
} from "../src/data/hotelDestinations";

const errors: string[] = [];

// 1. Duplicate slugs / canonical URLs
const slugSeen = new Map<string, number>();
const canonicalSeen = new Map<string, number>();
for (const d of hotelDestinations) {
  slugSeen.set(d.slug, (slugSeen.get(d.slug) ?? 0) + 1);
  const canonical = hotelDestinationCanonical(d.slug);
  canonicalSeen.set(canonical, (canonicalSeen.get(canonical) ?? 0) + 1);
}
[...slugSeen.entries()].filter(([, n]) => n > 1).forEach(([s]) => errors.push(`Duplicate slug: ${s}`));
[...canonicalSeen.entries()].filter(([, n]) => n > 1).forEach(([u]) => errors.push(`Duplicate canonical URL: ${u}`));

// 2. Required fields + malformed URLs
for (const d of hotelDestinations) {
  if (!d.name?.trim()) errors.push(`Missing city name for slug "${d.slug}"`);
  if (!d.country?.trim()) errors.push(`Missing country for "${d.name || d.slug}"`);
  if (!d.countryCode || !/^[A-Z]{2}$/.test(d.countryCode)) errors.push(`Invalid countryCode for "${d.name}": ${d.countryCode}`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(d.slug)) errors.push(`Malformed slug: "${d.slug}"`);
  if (!/^https:\/\/[a-z.]+\/cheap-hotels-in\/[a-z0-9-]+$/.test(hotelDestinationCanonical(d.slug)))
    errors.push(`Malformed canonical URL for "${d.slug}"`);
  if (d.slug !== slugifyDestination(d.slug)) errors.push(`Slug is not normalized: "${d.slug}"`);
}

// 3. Frozen slugs must all still exist, unchanged
for (const frozen of FROZEN_SLUGS) {
  if (!hotelDestinations.some((d) => d.slug === frozen)) errors.push(`FROZEN slug missing from catalog: ${frozen}`);
}

// 4. Every indexable destination must be sitemap-eligible and routable
for (const d of indexableHotelDestinations) {
  if (!d.isIndexable) errors.push(`Non-indexable destination in indexable list: ${d.slug}`);
  if (hotelDestinationPath(d.slug) !== `/cheap-hotels-in/${d.slug}`) errors.push(`Bad route path for ${d.slug}`);
}

// 5. Sitemap parity (when sitemap-hotels.xml has already been generated)
const sitemapPath = resolve("public/sitemap-hotels.xml");
if (existsSync(sitemapPath)) {
  const xml = readFileSync(sitemapPath, "utf8");
  const locs = new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
  for (const d of indexableHotelDestinations) {
    if (!locs.has(hotelDestinationCanonical(d.slug)))
      errors.push(`Indexable destination missing from sitemap-hotels.xml: ${d.slug}`);
  }
  for (const loc of locs) {
    if (!loc.includes("/cheap-hotels-in/")) continue;
    const slug = loc.split("/cheap-hotels-in/")[1];
    if (!indexableHotelDestinations.some((d) => d.slug === slug))
      errors.push(`Sitemap URL has no matching indexable route: ${loc}`);
  }
}

if (errors.length) {
  console.error(`\nHotel destination catalog validation FAILED (${errors.length} error(s)):`);
  errors.forEach((e) => console.error(` - ${e}`));
  process.exit(1);
}

console.log(
  `hotel destinations validated: ${hotelDestinations.length} total, ${indexableHotelDestinations.length} indexable, ${FROZEN_SLUGS.size} frozen slugs preserved, 0 duplicates`,
);
