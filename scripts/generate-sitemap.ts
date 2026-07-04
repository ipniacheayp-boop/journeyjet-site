// Generates public/sitemap.xml from canonical data sources.
// Runs via predev / prebuild hooks.

import { writeFileSync } from "fs";
import { resolve } from "path";
import { popularDestinations, airlinesData } from "../src/data/destinationsData";
import { seoFlightRoutes, seoHotelCities } from "../src/data/seoRoutes";
import { airportLandingPages } from "../src/data/airportLandingData";
import { blogPosts } from "../src/data/blogPosts";
import { cruiseDestinations } from "../src/data/cruiseDestinations";
import { cityGuides, getCountryGuides } from "../src/data/travelGuides";
import { dealSlugs } from "../src/data/dealSlugs";

const BASE_URL = "https://tripile.com";
const today = new Date().toISOString().slice(0, 10);

interface Entry {
  path: string;
  changefreq?: string;
  priority?: string;
  lastmod?: string;
}

const entries: Entry[] = [];

// Core pages
const core: Entry[] = [
  { path: "/", changefreq: "daily", priority: "1.0", lastmod: today },
  { path: "/flights", changefreq: "daily", priority: "0.95", lastmod: today },
  { path: "/hotels", changefreq: "daily", priority: "0.95", lastmod: today },
  { path: "/car-rentals", changefreq: "daily", priority: "0.9", lastmod: today },
  { path: "/deals", changefreq: "daily", priority: "0.9", lastmod: today },
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

// Search results hub
entries.push({ path: "/search-results", changefreq: "daily", priority: "0.7", lastmod: today });

// Auth-protected user pages (included for completeness)
entries.push({ path: "/account", changefreq: "monthly", priority: "0.5", lastmod: today });
entries.push({ path: "/my-bookings", changefreq: "weekly", priority: "0.6", lastmod: today });

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

// Hotel city landing pages (HotelCityPage — /cheap-hotels-in/:slug)
// Strip stored prefix to match React Router segment.
seoHotelCities.forEach((h) => {
  const seg = h.slug.replace(/^cheap-hotels-in-/, "");
  entries.push({ path: `/cheap-hotels-in/${seg}`, changefreq: "weekly", priority: "0.85" });
});

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
entries.push({ path: "/travel-guides", changefreq: "weekly", priority: "0.85", lastmod: today });

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

const xml = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
  ...unique.map((e) =>
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

writeFileSync(resolve("public/sitemap.xml"), xml);
console.log(`sitemap.xml written (${unique.length} entries)`);
