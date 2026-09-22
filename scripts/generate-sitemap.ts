// Generates public sitemap files from canonical application data sources.
// Runs via predev / prebuild hooks. Never invents routes — every URL is
// derived from a page that already exists in App.tsx + its backing catalog.

import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { popularDestinations, airlinesData } from "../src/data/destinationsData";
import { seoFlightRoutes } from "../src/data/seoRoutes";
import {
  indexableHotelPaths,
  hotelCountryHubs,
  getHotelDestinationBySlug,
} from "../src/data/hotelDestinations";
import { airportLandingPages } from "../src/data/airportLandingData";
import { blogPosts } from "../src/data/blogPosts";
import { cruiseDestinations } from "../src/data/cruiseDestinations";
import { cityGuides, getCountryGuides } from "../src/data/travelGuides";
import { travelCollections } from "../src/data/travelCollections";
import { dealSlugs } from "../src/data/dealSlugs";
import { hotelPlaces, hotelPlacePath } from "../src/data/hotelPlaceCatalog";
import { flightRouteCatalog } from "../src/data/flightRouteCatalog";

const BASE_URL = "https://tripile.com";
const PUBLIC = resolve("public");

interface Entry {
  path: string;
  changefreq?: string;
  priority?: string;
  lastmod?: string;
}

// ---------------------------------------------------------------------------
// Catalogs that already have real, indexable pages
// ---------------------------------------------------------------------------

const hubPaths = new Set<string>([
  "/hotels",
  "/hotel-destinations",
  ...hotelCountryHubs().flatMap((h) => [h.path, ...h.regions.map((r) => r.path)]),
]);

const hotelHubEntries: Entry[] = indexableHotelPaths()
  .filter((path) => hubPaths.has(path) && path !== "/hotels")
  .map((path) => ({ path, changefreq: "weekly", priority: "0.8" }));

const hotelCityEntries: Entry[] = indexableHotelPaths()
  .filter((path) => path !== "/hotels" && !hubPaths.has(path))
  .map((path) => ({ path, changefreq: "weekly", priority: "0.85" }));

/** Individual hotel pages — only when the city landing page also exists. */
const hotelPlaceEntries: Entry[] = hotelPlaces
  .filter((h) => !!getHotelDestinationBySlug(h.citySlug))
  .map((h) => ({ path: hotelPlacePath(h), changefreq: "weekly", priority: "0.7" }));

/** Validated Duffel city-pair pages. Round-trip variants are not routed. */
const cityPairEntries: Entry[] = flightRouteCatalog.map((r) => ({
  path: `/flights/${r.slug}`,
  changefreq: "weekly",
  priority: "0.8",
}));

const core: Entry[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/flights", changefreq: "daily", priority: "0.95" },
  { path: "/hotels", changefreq: "daily", priority: "0.95" },
  { path: "/car-rentals", changefreq: "daily", priority: "0.9" },
  { path: "/deals", changefreq: "daily", priority: "0.9" },
  { path: "/coupons", changefreq: "weekly", priority: "0.8" },
  { path: "/cruise-deals", changefreq: "weekly", priority: "0.75" },
  { path: "/explore", changefreq: "weekly", priority: "0.85" },
  { path: "/trip-planner", changefreq: "weekly", priority: "0.75" },
  { path: "/flight-status", changefreq: "daily", priority: "0.75" },
  { path: "/flight-tracker", changefreq: "daily", priority: "0.75" },
  { path: "/webcheck-in", changefreq: "monthly", priority: "0.65" },
  { path: "/destinations-checklist", changefreq: "monthly", priority: "0.6" },
  { path: "/reviews", changefreq: "weekly", priority: "0.8" },
  { path: "/blog", changefreq: "weekly", priority: "0.8" },
  { path: "/about", changefreq: "monthly", priority: "0.7" },
  { path: "/support", changefreq: "monthly", priority: "0.6" },
  { path: "/careers", changefreq: "monthly", priority: "0.5" },
  { path: "/sitemap", changefreq: "weekly", priority: "0.5" },
  { path: "/taxes-fees", changefreq: "monthly", priority: "0.5" },
  { path: "/price-match", changefreq: "monthly", priority: "0.55" },
  { path: "/refund-policy", changefreq: "monthly", priority: "0.4" },
  { path: "/terms", changefreq: "monthly", priority: "0.4" },
  { path: "/privacy", changefreq: "monthly", priority: "0.4" },
];

const dealEntries: Entry[] = dealSlugs.map((slug) => ({
  path: `/deals/${slug}`,
  changefreq: "weekly",
  priority: "0.75",
}));

const blogEntries: Entry[] = blogPosts.map((post) => ({
  path: `/blog/${post.slug}`,
  changefreq: "monthly",
  priority: "0.7",
}));

const cruiseEntries: Entry[] = cruiseDestinations.map((d) => ({
  path: `/cruises/${d.slug}`,
  changefreq: "weekly",
  priority: "0.8",
}));

const flightsToEntries: Entry[] = popularDestinations.map((d) => ({
  path: `/flights-to/${d.slug}`,
  changefreq: "weekly",
  priority: "0.85",
}));

const carRentalEntries: Entry[] = popularDestinations.map((d) => ({
  path: `/cheap-car-rentals-in-${d.slug}`,
  changefreq: "weekly",
  priority: "0.75",
}));

const seoRouteEntries: Entry[] = seoFlightRoutes.map((r) => ({
  path: `/${r.slug}`,
  changefreq: "weekly",
  priority: "0.8",
}));

const airlineEntries: Entry[] = airlinesData.map((a) => ({
  path: `/airlines/${a.slug}`,
  changefreq: "monthly",
  priority: a.popular ? "0.75" : "0.65",
}));

const airportEntries: Entry[] = airportLandingPages.map((ap) => ({
  path: `/airport/${ap.slug}`,
  changefreq: "monthly",
  priority: "0.6",
}));

const countryGuideEntries: Entry[] = getCountryGuides().map((c) => ({
  path: `/travel-guide/country/${c.slug}`,
  changefreq: "weekly",
  priority: "0.8",
}));

const cityGuideEntries: Entry[] = cityGuides.map((c) => ({
  path: `/travel-guide/${c.slug}`,
  changefreq: "weekly",
  priority: "0.75",
}));

const travelGuideHub: Entry[] = [
  { path: "/travel-guides", changefreq: "weekly", priority: "0.85" },
  { path: "/travel-collections", changefreq: "weekly", priority: "0.8" },
];

const bestTimeEntries: Entry[] = getCountryGuides().map((c) => ({
  path: `/travel-guide/country/${c.slug}/best-time-to-visit`,
  changefreq: "monthly",
  priority: "0.75",
}));

const collectionEntries: Entry[] = travelCollections.map((c) => ({
  path: `/travel-collections/${c.slug}`,
  changefreq: "weekly",
  priority: "0.75",
}));

// Note: /search-results, /account, /my-bookings, /booking/:id, /auth/*,
// /flights/search, /reviews/analytics, /reviews/site and /admin/* are
// intentionally excluded. They are private, auth-gated, duplicate, or
// transient search/result pages and are blocked in public/robots.txt.

// ---------------------------------------------------------------------------
// Sitemap files (split by intent so the index stays scalable)
// ---------------------------------------------------------------------------

const sitemaps: { file: string; entries: Entry[] }[] = [
  {
    file: "sitemap.xml",
    entries: [...core, ...dealEntries, ...blogEntries],
  },
  {
    file: "sitemap-hotels.xml",
    entries: hotelCityEntries,
  },
  {
    file: "sitemap-destinations.xml",
    entries: [
      ...hotelHubEntries,
      ...flightsToEntries,
      ...travelGuideHub,
      ...countryGuideEntries,
      ...bestTimeEntries,
      ...collectionEntries,
      ...cityGuideEntries,
      ...carRentalEntries,
    ],
  },
  {
    file: "sitemap-flights.xml",
    entries: [...seoRouteEntries, ...airlineEntries, ...airportEntries, ...cityPairEntries],
  },
  {
    file: "sitemap-cruises.xml",
    entries: cruiseEntries,
  },
  {
    file: "sitemap-hotel-places.xml",
    entries: hotelPlaceEntries,
  },
];

function dedupe(list: Entry[]): Entry[] {
  const seen = new Set<string>();
  return list.filter((e) => (seen.has(e.path) ? false : (seen.add(e.path), true)));
}

function renderUrlset(list: Entry[]): string {
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...list.map((e) =>
      [
        `  <url>`,
        `    <loc>${BASE_URL}${e.path}</loc>`,
        e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
        e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
        e.priority ? `    <priority>${e.priority}</priority>` : null,
        `  </url>`,
      ]
        .filter(Boolean)
        .join("\n"),
    ),
    `</urlset>`,
    ``,
  ].join("\n");
}

function locsFromFile(file: string): string[] {
  const p = resolve(PUBLIC, file);
  if (!existsSync(p)) return [];
  return [...readFileSync(p, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

// Snapshot previously published page URLs so we never drop an indexed loc.
const previouslyPublished = new Set<string>(
  readdirSync(PUBLIC)
    .filter((f) => f.startsWith("sitemap") && f.endsWith(".xml") && f !== "sitemap-index.xml")
    .flatMap(locsFromFile),
);

const written: { file: string; count: number; paths: string[] }[] = [];
const allPaths = new Set<string>();
const crossFileDupes: string[] = [];

for (const { file, entries } of sitemaps) {
  const unique = dedupe(entries);
  for (const e of unique) {
    if (allPaths.has(e.path)) crossFileDupes.push(e.path);
    allPaths.add(e.path);
  }
  writeFileSync(resolve(PUBLIC, file), renderUrlset(unique));
  written.push({ file, count: unique.length, paths: unique.map((e) => e.path) });
  console.log(`${file} written (${unique.length} entries)`);
}

const indexFiles = written.map((w) => w.file);
const sitemapIndex = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
  ...indexFiles.map((f) => `  <sitemap><loc>${BASE_URL}/${f}</loc></sitemap>`),
  `</sitemapindex>`,
  ``,
].join("\n");
writeFileSync(resolve(PUBLIC, "sitemap-index.xml"), sitemapIndex);
console.log(`sitemap-index.xml written (${indexFiles.length} sitemaps)`);

if (crossFileDupes.length) {
  console.error(`Duplicate URLs across sitemaps: ${crossFileDupes.join(", ")}`);
  process.exit(1);
}

const dropped = [...previouslyPublished].filter((loc) => {
  const path = loc.startsWith(BASE_URL) ? loc.slice(BASE_URL.length) || "/" : loc;
  return !allPaths.has(path);
});
if (dropped.length) {
  console.error(`Refusing to drop previously published sitemap URLs (${dropped.length}):`);
  dropped.slice(0, 20).forEach((u) => console.error(` - ${u}`));
  process.exit(1);
}

console.log(
  [
    `total unique page URLs: ${allPaths.size}`,
    `preserved existing URLs: ${previouslyPublished.size}/${previouslyPublished.size}`,
    `hotel city pages: ${hotelCityEntries.length}`,
    `hotel place pages: ${hotelPlaceEntries.length}`,
    `city-pair flight pages: ${cityPairEntries.length}`,
  ].join(" | "),
);
