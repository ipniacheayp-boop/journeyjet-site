// Cross-sitemap SEO validation. Complements validate-hotel-destinations.ts.
// Reports totals, per-file counts, duplicates, invalid URLs, redirects,
// missing routes, noindex targets, canonical mismatches, and frozen slugs.

import { existsSync, readdirSync, readFileSync } from "fs";
import { resolve } from "path";
import { popularDestinations, airlinesData } from "../src/data/destinationsData";
import { seoFlightRoutes } from "../src/data/seoRoutes";
import {
  hotelDestinations,
  indexableHotelDestinations,
  hotelDestinationCanonical,
  hotelDestinationPath,
  hotelCountryHubs,
  FROZEN_SLUGS,
  slugifyDestination,
} from "../src/data/hotelDestinations";
import { airportLandingPages } from "../src/data/airportLandingData";
import { blogPosts } from "../src/data/blogPosts";
import { cruiseDestinations } from "../src/data/cruiseDestinations";
import { cityGuides, getCountryGuides } from "../src/data/travelGuides";
import { dealSlugs } from "../src/data/dealSlugs";
import { hotelPlaces, hotelPlacePath } from "../src/data/hotelPlaceCatalog";
import { flightRouteCatalog } from "../src/data/flightRouteCatalog";

const ROOT = resolve(".");
const PUBLIC = resolve(ROOT, "public");
const HOST = "https://tripile.com";

const errors: string[] = [];
const warnings: string[] = [];

function locsFromXml(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

const urlsetFiles = readdirSync(PUBLIC)
  .filter((f) => f.startsWith("sitemap") && f.endsWith(".xml") && f !== "sitemap-index.xml")
  .sort();

const perFile = new Map<string, string[]>();
for (const file of urlsetFiles) {
  const xml = readFileSync(resolve(PUBLIC, file), "utf8");
  perFile.set(file, locsFromXml(xml));
}

const allLocs = [...perFile.values()].flat();
const allPaths = allLocs.map((loc) => (loc.startsWith(HOST) ? loc.slice(HOST.length) || "/" : loc));

// 1. Per-file + total counts
console.log("URLs per sitemap:");
for (const [file, locs] of perFile) {
  console.log(`  ${file}: ${locs.length}`);
}
console.log(`  total (raw): ${allLocs.length}`);

// 2. Duplicate URLs (within a file and across files)
const locCounts = new Map<string, number>();
for (const loc of allLocs) locCounts.set(loc, (locCounts.get(loc) ?? 0) + 1);
const duplicateUrls = [...locCounts.entries()].filter(([, n]) => n > 1).map(([u]) => u);
duplicateUrls.forEach((u) => errors.push(`Duplicate URL across sitemaps: ${u}`));

// 3. Duplicate slugs (last path segment) that map to different paths of the same type
const hotelSlugs = allPaths
  .filter((p) => p.startsWith("/cheap-hotels-in/"))
  .map((p) => p.split("/cheap-hotels-in/")[1]);
const hotelSlugSeen = new Map<string, number>();
for (const s of hotelSlugs) hotelSlugSeen.set(s, (hotelSlugSeen.get(s) ?? 0) + 1);
[...hotelSlugSeen.entries()]
  .filter(([, n]) => n > 1)
  .forEach(([s]) => errors.push(`Duplicate hotel slug in sitemap: ${s}`));

// 4. Invalid URLs
const pathSeen = new Set<string>();
for (const loc of allLocs) {
  if (!loc.startsWith(`${HOST}/`) && loc !== `${HOST}/`) {
    errors.push(`Non-canonical host: ${loc}`);
    continue;
  }
  const path = loc === `${HOST}/` ? "/" : loc.slice(HOST.length);
  if (path !== "/" && path.endsWith("/")) errors.push(`Trailing slash: ${loc}`);
  if (/\/\//.test(path)) errors.push(`Double slash: ${loc}`);
  if (/[?#]/.test(path)) errors.push(`Query/fragment in sitemap URL: ${loc}`);
  if (!/^\/[A-Za-z0-9/_-]*$/.test(path) && path !== "/") errors.push(`Malformed path: ${loc}`);
  pathSeen.add(path);
}

// 5. Redirects declared in App.tsx must never appear
const appTsx = readFileSync(resolve(ROOT, "src/App.tsx"), "utf8");
const redirectPaths = new Set(
  [...appTsx.matchAll(/<Route\s+path="([^"]+)"\s+element=\{<Navigate/g)].map((m) => m[1]),
);
for (const path of pathSeen) {
  if (redirectPaths.has(path)) errors.push(`Sitemap URL redirects: ${path}`);
}

// 6. Known private / noindex / thin-search paths must never appear
const excludedPrefixes = [
  "/admin",
  "/agent",
  "/auth/",
  "/account",
  "/my-bookings",
  "/search-results",
  "/booking/",
  "/booking-confirmation",
  "/payment",
  "/login",
  "/user/login",
  "/flights/search",
  "/flight/checkout",
  "/error",
];
const excludedExact = new Set([
  "/reviews/site",
  "/reviews/analytics",
  "/reviews/site/",
  "/lander",
  "/landing",
  "/flight-deals",
  "/hotel-deals",
]);
for (const path of pathSeen) {
  if (excludedExact.has(path) || excludedPrefixes.some((p) => path === p || path.startsWith(p + "/") || (p.endsWith("/") && path.startsWith(p)))) {
    errors.push(`Excluded / noindex path listed in sitemap: ${path}`);
  }
}

// 7. Missing routes — every catalog-backed page must be present
const required = new Map<string, string>([
  ...dealSlugs.map((s) => [`/deals/${s}`, `deal ${s}`] as const),
  ...blogPosts.map((p) => [`/blog/${p.slug}`, `blog ${p.slug}`] as const),
  ...cruiseDestinations.map((d) => [`/cruises/${d.slug}`, `cruise ${d.slug}`] as const),
  ...popularDestinations.map((d) => [`/flights-to/${d.slug}`, `flights-to ${d.slug}`] as const),
  ...popularDestinations.map((d) => [`/cheap-car-rentals-in-${d.slug}`, `car rental ${d.slug}`] as const),
  ...seoFlightRoutes.map((r) => [`/${r.slug}`, `flight route ${r.slug}`] as const),
  ...airlinesData.map((a) => [`/airlines/${a.slug}`, `airline ${a.slug}`] as const),
  ...airportLandingPages.map((a) => [`/airport/${a.slug}`, `airport ${a.slug}`] as const),
  ...cityGuides.map((c) => [`/travel-guide/${c.slug}`, `city guide ${c.slug}`] as const),
  ...getCountryGuides().map((c) => [`/travel-guide/country/${c.slug}`, `country guide ${c.slug}`] as const),
  ...indexableHotelDestinations.map((d) => [hotelDestinationPath(d.slug), `hotel city ${d.slug}`] as const),
  ...flightRouteCatalog.map((r) => [`/flights/${r.slug}`, `city-pair ${r.slug}`] as const),
  ...hotelPlaces
    .filter((h) => indexableHotelDestinations.some((d) => d.slug === h.citySlug))
    .map((h) => [hotelPlacePath(h), `hotel place ${h.slug}`] as const),
]);
required.set("/travel-guides", "travel guides hub");
required.set("/hotel-destinations", "hotel destinations hub");
for (const hub of hotelCountryHubs()) {
  required.set(hub.path, `hotel country hub ${hub.countrySlug}`);
  for (const region of hub.regions) required.set(region.path, `hotel region hub ${region.regionSlug}`);
}

const missingRoutes: string[] = [];
for (const [path, label] of required) {
  if (!pathSeen.has(path)) {
    missingRoutes.push(path);
    errors.push(`Missing sitemap URL for ${label}: ${path}`);
  }
}

// 8. Sitemap URLs with no matching indexable route
const knownPrefixes = [
  "/",
  "/flights",
  "/hotels",
  "/car-rentals",
  "/deals",
  "/coupons",
  "/cruise-deals",
  "/cruises/",
  "/explore",
  "/trip-planner",
  "/flight-status",
  "/flight-tracker",
  "/webcheck-in",
  "/destinations-checklist",
  "/reviews",
  "/blog",
  "/about",
  "/support",
  "/careers",
  "/sitemap",
  "/taxes-fees",
  "/price-match",
  "/refund-policy",
  "/terms",
  "/privacy",
  "/travel-guides",
  "/travel-guide/",
  "/flights-to/",
  "/cheap-car-rentals-in-",
  "/cheap-flights-from-",
  "/cheap-hotels-in/",
  "/hotel-destinations",
  "/hotel/",
  "/airlines/",
  "/airport/",
];
for (const path of pathSeen) {
  const ok =
    path === "/" ||
    knownPrefixes.some((p) => (p.endsWith("/") || p.endsWith("-") ? path.startsWith(p) : path === p || path.startsWith(p + "/")));
  if (!ok) errors.push(`Sitemap URL has no matching public route pattern: ${path}`);
}

// City-pair URLs must be in the validated catalog (no combinatorial explosion)
for (const path of pathSeen) {
  if (!path.startsWith("/flights/") || path === "/flights") continue;
  const slug = path.slice("/flights/".length);
  if (slug.includes("/")) {
    errors.push(`Unrouted flight path in sitemap: ${path}`);
    continue;
  }
  if (!flightRouteCatalog.some((r) => r.slug === slug)) {
    errors.push(`City-pair sitemap URL is not in the validated catalog: ${path}`);
  }
}

// Hotel place URLs must resolve to a real Places-backed hotel whose city is indexable
for (const path of pathSeen) {
  if (!path.startsWith("/hotel/")) continue;
  const parts = path.split("/").filter(Boolean);
  if (parts.length !== 3) {
    errors.push(`Malformed hotel place path: ${path}`);
    continue;
  }
  const [, citySlug, hotelSlug] = parts;
  const place = hotelPlaces.find((h) => h.citySlug === citySlug && h.slug === hotelSlug);
  if (!place) errors.push(`Sitemap hotel place has no catalog entry: ${path}`);
  else if (!indexableHotelDestinations.some((d) => d.slug === citySlug)) {
    errors.push(`Hotel place city is not an indexable destination: ${path}`);
  }
}

// 9. Canonical mismatches for hotel city pages
const hotelSitemap = perFile.get("sitemap-hotels.xml") ?? [];
for (const d of indexableHotelDestinations) {
  const canonical = hotelDestinationCanonical(d.slug);
  if (!hotelSitemap.includes(canonical)) {
    errors.push(`Indexable hotel destination missing from sitemap-hotels.xml: ${d.slug}`);
  }
}
for (const loc of hotelSitemap) {
  if (!loc.includes("/cheap-hotels-in/")) {
    errors.push(`Non-city URL in sitemap-hotels.xml: ${loc}`);
    continue;
  }
  const slug = loc.split("/cheap-hotels-in/")[1];
  if (!indexableHotelDestinations.some((d) => d.slug === slug)) {
    errors.push(`sitemap-hotels.xml URL has no matching indexable route: ${loc}`);
  }
  if (loc !== hotelDestinationCanonical(slug)) {
    errors.push(`Canonical mismatch for hotel slug ${slug}: ${loc}`);
  }
}

// 10. Frozen slugs must still exist, unchanged
for (const frozen of FROZEN_SLUGS) {
  if (!hotelDestinations.some((d) => d.slug === frozen)) {
    errors.push(`FROZEN slug missing from catalog: ${frozen}`);
  }
  if (frozen !== slugifyDestination(frozen) && !hotelDestinations.some((d) => d.slug === frozen)) {
    errors.push(`FROZEN slug was rewritten: ${frozen}`);
  }
  const expected = `${HOST}/cheap-hotels-in/${frozen}`;
  if (!hotelSitemap.includes(expected)) {
    errors.push(`FROZEN slug missing from sitemap-hotels.xml: ${frozen}`);
  }
}

// 11. robots.txt must reference the sitemap index
const robots = existsSync(resolve(PUBLIC, "robots.txt"))
  ? readFileSync(resolve(PUBLIC, "robots.txt"), "utf8")
  : "";
const sitemapDirectives = [...robots.matchAll(/^Sitemap:\s*(\S+)/gim)].map((m) => m[1]);
if (!sitemapDirectives.includes(`${HOST}/sitemap-index.xml`)) {
  errors.push("robots.txt does not reference https://tripile.com/sitemap-index.xml");
}

// 12. Sitemap index must list every urlset file
const indexPath = resolve(PUBLIC, "sitemap-index.xml");
if (!existsSync(indexPath)) {
  errors.push("sitemap-index.xml is missing");
} else {
  const indexLocs = locsFromXml(readFileSync(indexPath, "utf8"));
  for (const file of urlsetFiles) {
    if (!indexLocs.includes(`${HOST}/${file}`)) {
      errors.push(`sitemap-index.xml is missing ${file}`);
    }
  }
}

// 13. Google limits
const GOOGLE_URL_LIMIT = 50_000;
for (const [file, locs] of perFile) {
  if (locs.length > GOOGLE_URL_LIMIT) errors.push(`${file} exceeds Google's ${GOOGLE_URL_LIMIT} URL limit`);
}

if (warnings.length) {
  console.warn(`\nWarnings (${warnings.length}):`);
  warnings.forEach((w) => console.warn(` - ${w}`));
}

if (errors.length) {
  console.error(`\nSitemap validation FAILED (${errors.length} error(s)):`);
  errors.forEach((e) => console.error(` - ${e}`));
  process.exit(1);
}

const uniqueCount = new Set(allLocs).size;
console.log(
  [
    `sitemaps validated: ${urlsetFiles.length} files`,
    `${uniqueCount} unique URLs`,
    `${duplicateUrls.length} duplicate URLs`,
    `${missingRoutes.length} missing routes`,
    `${FROZEN_SLUGS.size} frozen slugs preserved`,
    `0 invalid / redirect / noindex entries`,
  ].join(" | "),
);
