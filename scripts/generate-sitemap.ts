// Generates public/sitemap.xml from canonical data sources.
// Runs via predev / prebuild hooks.

import { writeFileSync } from "fs";
import { resolve } from "path";
import { popularDestinations, airlinesData } from "../src/data/destinationsData";
import { seoFlightRoutes } from "../src/data/seoRoutes";
import { indexableHotelPaths, hotelCountryHubs } from "../src/data/hotelDestinations";
import { airportLandingPages } from "../src/data/airportLandingData";
import { blogPosts } from "../src/data/blogPosts";
import { cruiseDestinations } from "../src/data/cruiseDestinations";
import { cityGuides, getCountryGuides } from "../src/data/travelGuides";
import { dealSlugs } from "../src/data/dealSlugs";

const BASE_URL = "https://tripile.com";

interface Entry {
  path: string;
  changefreq?: string;
  priority?: string;
  lastmod?: string;
}

const entries: Entry[] = [];

// Core pages
const core: Entry[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/flights", changefreq: "daily", priority: "0.95" },
  { path: "/hotels", changefreq: "daily", priority: "0.95" },
  { path: "/car-rentals", changefreq: "daily", priority: "0.9" },
  { path: "/deals", changefreq: "daily", priority: "0.9" },
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
entries.push(...core);

// Note: /search-results, /account, /my-bookings, /booking/:id and /auth/* are
// intentionally excluded from the sitemap. They are private, auth-gated, or
// transient flow pages and are blocked from crawling in public/robots.txt, so
// listing them here would send conflicting index signals.



// Published deal detail pages (DealDetail — /deals/:id)
dealSlugs.forEach((slug) =>
  entries.push({ path: `/deals/${slug}`, changefreq: "weekly", priority: "0.75" })
);

// Blog posts (sourced dynamically from blog data so the sitemap stays in sync)
blogPosts.forEach((post) =>
  entries.push({ path: `/blog/${post.slug}`, changefreq: "monthly", priority: "0.7" })
);

// Cruise destination landing pages (CruiseDestinationPage — /cruises/:slug)
cruiseDestinations.forEach((d) =>
  entries.push({ path: `/cruises/${d.slug}`, changefreq: "weekly", priority: "0.8" })
);

// Flights to destination (FlightsToDestination — /flights-to/:slug)
popularDestinations.forEach((d) =>
  entries.push({ path: `/flights-to/${d.slug}`, changefreq: "weekly", priority: "0.85" })
);

// Hotel hub hierarchy + destination landing pages.
// `indexableHotelPaths()` is the SAME source the hub navigation and the prerenderer
// use, so sitemap URLs and internal links can never drift apart.
const hubPaths = new Set<string>([
  "/hotels",
  "/hotel-destinations",
  ...hotelCountryHubs().flatMap((h) => [h.path, ...h.regions.map((r) => r.path)]),
]);
const hotelEntries: Entry[] = indexableHotelPaths()
  .filter((path) => path !== "/hotels") // already listed in core pages
  .map((path) => ({
    path,
    changefreq: "weekly",
    priority: hubPaths.has(path) ? "0.8" : "0.85",
  }));
entries.push(...hotelEntries);

// Car rental city landing pages (CarRentalCityPage — /cheap-car-rentals-in-:slug)
popularDestinations.forEach((d) =>
  entries.push({
    path: `/cheap-car-rentals-in-${d.slug}`,
    changefreq: "weekly",
    priority: "0.75",
  })
);

// City-pair flight route pages (FlightRoutePage — /cheap-flights-from-:slug)
seoFlightRoutes.forEach((r) =>
  entries.push({ path: `/${r.slug}`, changefreq: "weekly", priority: "0.8" })
);

// Airline landing pages
airlinesData.forEach((a) =>
  entries.push({
    path: `/airlines/${a.slug}`,
    changefreq: "monthly",
    priority: a.popular ? "0.75" : "0.65",
  })
);

// Airport landing pages
airportLandingPages.forEach((ap) =>
  entries.push({ path: `/airport/${ap.slug}`, changefreq: "monthly", priority: "0.6" })
);

// Travel guides hub
entries.push({ path: "/travel-guides", changefreq: "weekly", priority: "0.85" });

// Country travel guides (CountryGuidePage — /travel-guide/country/:slug)
getCountryGuides().forEach((c) =>
  entries.push({ path: `/travel-guide/country/${c.slug}`, changefreq: "weekly", priority: "0.8" })
);

// City travel guides (CityGuidePage — /travel-guide/:slug)
cityGuides.forEach((c) =>
  entries.push({ path: `/travel-guide/${c.slug}`, changefreq: "weekly", priority: "0.75" })
);

// De-dupe by path
const seen = new Set<string>();
const unique = entries.filter((e) => (seen.has(e.path) ? false : (seen.add(e.path), true)));

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
        .join("\n")
    ),
    `</urlset>`,
    ``,
  ].join("\n");
}

writeFileSync(resolve("public/sitemap.xml"), renderUrlset(unique));
console.log(`sitemap.xml written (${unique.length} entries)`);

// Dedicated hotel destination sitemap, generated from the destination catalog.
const hotelSitemapEntries: Entry[] = hotelEntries;
writeFileSync(resolve("public/sitemap-hotels.xml"), renderUrlset(hotelSitemapEntries));
console.log(`sitemap-hotels.xml written (${hotelSitemapEntries.length} entries)`);

// Sitemap index so crawlers can discover both files from one entry point.
const sitemapIndex = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
  `  <sitemap><loc>${BASE_URL}/sitemap.xml</loc></sitemap>`,
  `  <sitemap><loc>${BASE_URL}/sitemap-hotels.xml</loc></sitemap>`,
  `</sitemapindex>`,
  ``,
].join("\n");
writeFileSync(resolve("public/sitemap-index.xml"), sitemapIndex);
console.log("sitemap-index.xml written (2 sitemaps)");

