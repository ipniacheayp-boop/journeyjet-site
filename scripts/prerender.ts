// ============================================================================
// Build-time prerender / static-content injection.
//
// Tripile is a client-side React SPA, so the raw HTML a crawler receives before
// executing JavaScript is an almost-empty shell (near-zero text-to-HTML ratio)
// and every route shares the same index.html title/description.
//
// This post-build step writes a physical `dist/<route>/index.html` for every
// public route with:
//   • a unique <title>
//   • a unique <meta name="description"> (marked data-prerendered)
//   • canonical + Open Graph + Twitter tags (marked data-prerendered)
//   • a route-specific <article id="seo-static-content"> block of real text
//
// The SPA hydrates on top: `src/main.tsx` removes the static article AND every
// [data-prerendered] head tag on mount, so react-helmet owns the live DOM and
// there are never duplicate tags at runtime. Crawlers that read raw HTML get
// unique, content-rich pages; users get the full React app.
// ============================================================================

import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { popularDestinations, airlinesData } from "../src/data/destinationsData";
import { seoFlightRoutes, seoHotelCities } from "../src/data/seoRoutes";
import { airportLandingPages } from "../src/data/airportLandingData";
import { blogPosts } from "../src/data/blogPosts";
import { cruiseDestinations } from "../src/data/cruiseDestinations";
import {
  cityGuides,
  getCountryGuides,
  buildCityGuide,
  buildCountryGuide,
} from "../src/data/travelGuides";
import { dealSlugs } from "../src/data/dealSlugs";

const SITE_ORIGIN = "https://tripile.com";
const DIST = resolve("dist");
const OG_IMAGE = `${SITE_ORIGIN}/og-image.png`;

interface Block {
  heading?: string;
  paragraphs: string[];
}
interface LinkItem {
  href: string;
  label: string;
}
interface Page {
  path: string; // e.g. "/about" ("/" for home)
  title: string;
  description: string;
  h1: string;
  blocks: Block[];
  links: LinkItem[];
}

const esc = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const titleCase = (slug: string): string =>
  slug
    .split("-")
    .map((w) => (w.length <= 2 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join(" ");

// Common footer links reused across pages so every static page has outbound
// internal links (helps crawl depth without being identical to content links).
const BASE_LINKS: LinkItem[] = [
  { href: "/flights", label: "Search cheap flights across the USA" },
  { href: "/hotels", label: "Compare cheap hotels" },
  { href: "/car-rentals", label: "Find car rentals" },
  { href: "/deals", label: "Browse travel deals" },
  { href: "/travel-guides", label: "Read destination travel guides" },
];

// ---------------------------------------------------------------------------
// 1) Curated core pages
// ---------------------------------------------------------------------------
const corePages: Page[] = [
  {
    path: "/",
    title: "Tripile.com – Buy Cheap Flights, Hotels & Car Rentals | Best US Travel Deals",
    description:
      "Buy cheap flights, hotels & car rentals across the USA on Tripile.com. Compare 500+ airlines, get Price Match Guarantee, and save up to 46%. Trusted by 2M+ travelers.",
    h1: "Cheap Flights, Hotels & Car Rentals USA | Tripile",
    blocks: [
      {
        paragraphs: [
          "Tripile helps travelers compare cheap flights, hotels, and rental cars in one place. Instead of switching between multiple booking websites, you can review schedules, prices, and policies together — saving time and booking with more confidence, whether it's a business trip, family vacation, weekend break, or last-minute getaway.",
        ],
      },
      {
        heading: "Why Choose Tripile",
        paragraphs: [
          "Our platform focuses on price clarity, practical filters, and real support. Find strong flight deals across 500+ airlines, then sort by timing, layovers, baggage, and fare rules. Compare cheap hotels near airports, business districts, and tourist neighborhoods, and add car rentals with clear pickup locations and cancellation terms before checkout.",
        ],
      },
      {
        heading: "Travel Deals and Booking Benefits",
        paragraphs: [
          "Tripile is built for value-focused travelers who want quality and control. Start with flights, add hotels, then include a rental car to build a full itinerary in minutes. Our deals hub features seasonal offers and limited-time promotions, with transparent totals, no hidden fees, and 24/7 assistance from search to confirmation.",
        ],
      },
    ],
    links: BASE_LINKS,
  },
  {
    path: "/flights",
    title: "Search Cheap Flights | Tripile.com",
    description:
      "Search and compare cheap flights across 500+ airlines on Tripile. Filter by price, stops, and departure time, then book domestic and international fares with confidence.",
    h1: "Search Cheap Flights Across 500+ Airlines",
    blocks: [
      {
        paragraphs: [
          "Compare cheap flights on Tripile in seconds. Enter your origin, destination, and dates to see fares from hundreds of airlines side by side, then filter by price, number of stops, cabin, baggage, and departure time to find the flight that fits your trip and budget.",
        ],
      },
      {
        heading: "Book Domestic & International Flights",
        paragraphs: [
          "From short domestic hops to long-haul international routes, Tripile surfaces transparent totals with no hidden fees. Set flexible dates to spot the cheapest days to fly, review fare rules before you pay, and check out securely with our Price Match Guarantee for extra peace of mind.",
        ],
      },
    ],
    links: [
      { href: "/flights-to/new-york", label: "Flights to New York" },
      { href: "/flights-to/los-angeles", label: "Flights to Los Angeles" },
      { href: "/flights-to/miami", label: "Flights to Miami" },
      { href: "/flight-status", label: "Check flight status" },
      { href: "/deals", label: "Latest flight deals" },
    ],
  },
  {
    path: "/hotels",
    title: "Cheap Hotels | Tripile.com — Compare Rates",
    description:
      "Compare cheap hotels across the USA on Tripile. Find great rates near airports, downtowns, and tourist areas with free-cancellation options and no hidden booking fees.",
    h1: "Compare Cheap Hotels Across the USA",
    blocks: [
      {
        paragraphs: [
          "Find and compare cheap hotels on Tripile for city breaks, business trips, and family vacations. Search by destination and dates to compare nightly rates, guest ratings, amenities, and cancellation policies, so you can book the right room near the airport, downtown, or the neighborhood you want to explore.",
        ],
      },
      {
        heading: "Book Hotels With Confidence",
        paragraphs: [
          "We highlight transparent totals with taxes shown up front and flag free-cancellation options where available. Filter by price, star rating, and location to narrow thousands of properties down to the few that match your trip, then reserve securely in a few clicks.",
        ],
      },
    ],
    links: [
      { href: "/cheap-hotels-in/new-york", label: "Cheap hotels in New York" },
      { href: "/cheap-hotels-in/los-angeles", label: "Cheap hotels in Los Angeles" },
      { href: "/cheap-hotels-in/miami", label: "Cheap hotels in Miami" },
      { href: "/flights", label: "Add flights to your trip" },
      { href: "/car-rentals", label: "Add a rental car" },
    ],
  },
  {
    path: "/car-rentals",
    title: "Cheap Car Rentals | Tripile.com — Compare Rates",
    description:
      "Compare cheap car rentals across the USA on Tripile. Find low daily rates, flexible pickup locations, and clear cancellation terms from trusted rental partners.",
    h1: "Compare Cheap Car Rentals Across the USA",
    blocks: [
      {
        paragraphs: [
          "Rent a car for less with Tripile. Compare daily rates across economy, SUV, and premium vehicles, review pickup and drop-off locations at airports and city centers, and check mileage and cancellation terms before you book — all in one place.",
        ],
      },
      {
        heading: "Drive & Explore for Less",
        paragraphs: [
          "A rental car is the easiest way to explore beyond the city and reach national parks, beaches, and small towns on your own schedule. Tripile shows transparent totals with no hidden fees, so you know exactly what you'll pay when you pick up the keys.",
        ],
      },
    ],
    links: [
      { href: "/cheap-car-rentals-in-orlando", label: "Car rentals in Orlando" },
      { href: "/cheap-car-rentals-in-las-vegas", label: "Car rentals in Las Vegas" },
      { href: "/cheap-car-rentals-in-miami", label: "Car rentals in Miami" },
      { href: "/flights", label: "Add flights" },
      { href: "/hotels", label: "Add a hotel" },
    ],
  },
  {
    path: "/deals",
    title: "Exclusive Flight Deals & Travel Offers | Tripile.com USA",
    description:
      "Discover exclusive flight deals and travel offers on Tripile. Browse limited-time fares, hotel discounts, and seasonal promotions with savings of up to 46% off market prices.",
    h1: "Exclusive Flight Deals & Travel Offers",
    blocks: [
      {
        paragraphs: [
          "Browse Tripile's hand-picked travel deals for the biggest savings on flights, hotels, and packages. Our deals hub is refreshed regularly with limited-time fares, seasonal promotions, and last-minute offers, so you can grab a great price before it's gone.",
        ],
      },
      {
        heading: "Save Up to 46% on Travel",
        paragraphs: [
          "Every deal shows a clear price, route, and travel window so you can compare quickly. Filter by destination or airline to find the offer that fits your plans, then book securely with transparent totals and no hidden fees.",
        ],
      },
    ],
    links: BASE_LINKS,
  },
  {
    path: "/cruise-deals",
    title: "Cheap Cruise Deals 2026 | Tripile.com",
    description:
      "Find cheap cruise deals for 2026 on Tripile. Compare Caribbean, Mediterranean, Alaska, and luxury sailings with onboard credit, free perks, and low deposits.",
    h1: "Cheap Cruise Deals for Every Destination",
    blocks: [
      {
        paragraphs: [
          "Set sail for less with Tripile's cruise deals. Compare itineraries across the Caribbean, Mediterranean, Alaska, and beyond from leading cruise lines, and secure exclusive perks such as onboard credit, free gratuities, and reduced fares for second guests.",
        ],
      },
      {
        heading: "Explore Popular Cruise Destinations",
        paragraphs: [
          "Whether you want turquoise island beaches, historic Mediterranean ports, or glacier views in Alaska, our cruise pages break down the best time to sail, popular departure ports, and what's included so you can book the perfect voyage.",
        ],
      },
    ],
    links: cruiseDestinations.slice(0, 6).map((c) => ({
      href: `/cruises/${c.slug}`,
      label: c.name,
    })),
  },
  {
    path: "/explore",
    title: "Explore Destinations | Tripile.com",
    description:
      "Explore top travel destinations on Tripile. Discover popular cities, beaches, and getaways with inspiration, best times to visit, and cheap flights to get you there.",
    h1: "Explore Top Travel Destinations",
    blocks: [
      {
        paragraphs: [
          "Get inspired for your next trip with Tripile's destination explorer. Browse popular cities, beach escapes, and weekend getaways, discover the best times to visit, and jump straight to cheap flights and hotels for the places that catch your eye.",
        ],
      },
    ],
    links: popularDestinations.slice(0, 6).map((d) => ({
      href: `/flights-to/${d.slug}`,
      label: `Flights to ${d.city}`,
    })),
  },
  {
    path: "/trip-planner",
    title: "Trip Planner — Plan Your Journey | Tripile.com",
    description:
      "Plan your journey with Tripile's free trip planner. Map out flights, hotels, and car rentals, estimate your budget, and build a complete itinerary in minutes.",
    h1: "Plan Your Trip From Start to Finish",
    blocks: [
      {
        paragraphs: [
          "Use Tripile's trip planner to organize every part of your journey in one place. Combine flights, hotels, and car rentals, estimate your total budget, and build a clear day-by-day itinerary so nothing gets missed before you travel.",
        ],
      },
    ],
    links: BASE_LINKS,
  },
  {
    path: "/flight-status",
    title: "Live Flight Status & Tracker | Tripile.com",
    description:
      "Check live flight status on Tripile. Track departures, arrivals, delays, and gate information by flight number or route for airlines across the USA and worldwide.",
    h1: "Check Live Flight Status",
    blocks: [
      {
        paragraphs: [
          "Track any flight in real time with Tripile. Search by flight number or route to see up-to-date departure and arrival times, delays, terminals, and gate information, so you and the people picking you up always know when to expect the plane.",
        ],
      },
    ],
    links: [
      { href: "/flight-tracker", label: "Live flight tracker map" },
      { href: "/webcheck-in", label: "Airline web check-in links" },
      ...BASE_LINKS.slice(0, 3),
    ],
  },
  {
    path: "/flight-tracker",
    title: "Live Flight Tracker Map | Tripile.com",
    description:
      "Follow flights in real time on Tripile's live flight tracker map. See aircraft positions, routes, altitude, and speed for flights across the USA and around the world.",
    h1: "Live Flight Tracker Map",
    blocks: [
      {
        paragraphs: [
          "Watch flights move across the globe with Tripile's live flight tracker. See real-time aircraft positions, routes, altitude, and speed on an interactive map, and follow a specific flight from takeoff to landing.",
        ],
      },
    ],
    links: [
      { href: "/flight-status", label: "Check flight status" },
      ...BASE_LINKS.slice(0, 3),
    ],
  },
  {
    path: "/webcheck-in",
    title: "Airline Web Check-In Links | Tripile.com",
    description:
      "Find direct airline web check-in links on Tripile. Check in online for major US and international airlines, choose seats, and get your boarding pass before you fly.",
    h1: "Airline Web Check-In Made Easy",
    blocks: [
      {
        paragraphs: [
          "Skip the airport lines by checking in online. Tripile gathers direct web check-in links for major US and international airlines in one place, so you can confirm your seat, add bags, and download your boarding pass before you leave home.",
        ],
      },
    ],
    links: [
      { href: "/flight-status", label: "Check flight status" },
      { href: "/destinations-checklist", label: "Travel checklists" },
      ...BASE_LINKS.slice(0, 3),
    ],
  },
  {
    path: "/destinations-checklist",
    title: "Travel Checklists & Packing Guides | Tripile.com",
    description:
      "Never forget an essential again with Tripile's travel checklists. Get packing lists and pre-trip to-dos for beach, city, business, and international travel.",
    h1: "Travel Checklists & Packing Guides",
    blocks: [
      {
        paragraphs: [
          "Pack smarter with Tripile's travel checklists. Use ready-made packing lists and pre-trip to-dos tailored to beach holidays, city breaks, business travel, and international trips so you leave home with everything you need and nothing you don't.",
        ],
      },
    ],
    links: BASE_LINKS,
  },
  {
    path: "/reviews",
    title: "Customer Reviews & Ratings | Tripile.com",
    description:
      "Read genuine Tripile customer reviews and ratings. See what travelers say about booking flights, hotels, and car rentals, and share your own travel experience.",
    h1: "Tripile Customer Reviews & Ratings",
    blocks: [
      {
        paragraphs: [
          "See why millions of travelers book with Tripile. Read genuine customer reviews and ratings covering flights, hotels, car rentals, and support, and share your own experience to help other travelers plan with confidence.",
        ],
      },
    ],
    links: BASE_LINKS,
  },
  {
    path: "/blog",
    title: "Travel Blog — Tips, Guides & Deals | Tripile.com",
    description:
      "Read the Tripile travel blog for expert tips, destination guides, and money-saving advice on finding cheap flights, hotels, and unforgettable trips.",
    h1: "Tripile Travel Blog",
    blocks: [
      {
        paragraphs: [
          "Travel smarter with the Tripile blog. Get expert tips on finding cheap flights, packing light, avoiding hidden fees, and choosing the best time to book, plus destination guides and inspiration for your next adventure.",
        ],
      },
    ],
    links: blogPosts.slice(0, 5).map((p) => ({
      href: `/blog/${p.slug}`,
      label: p.title,
    })),
  },
  {
    path: "/about",
    title: "About Tripile | Trusted US Travel Booking Platform",
    description:
      "Learn about Tripile, a US travel booking platform helping 2M+ travelers compare cheap flights, hotels, and car rentals with transparent pricing and 24/7 support.",
    h1: "About Tripile",
    blocks: [
      {
        paragraphs: [
          "Tripile is a US-based travel booking platform on a mission to make travel simpler, clearer, and more affordable. We bring flights, hotels, and car rentals together with transparent pricing so travelers can compare and book with confidence.",
        ],
      },
      {
        heading: "Trusted by Millions of Travelers",
        paragraphs: [
          "Operated by Trivoya Ventures LLC, Tripile combines a fast, modern booking experience with round-the-clock human support. Our Price Match Guarantee and no-hidden-fees promise mean you always know you're getting a fair deal.",
        ],
      },
    ],
    links: BASE_LINKS,
  },
  {
    path: "/support",
    title: "Customer Support & Help Center | Tripile.com",
    description:
      "Get help with your Tripile booking. Contact 24/7 customer support by phone or email for flights, hotels, car rentals, changes, refunds, and travel questions.",
    h1: "Tripile Customer Support",
    blocks: [
      {
        paragraphs: [
          "Need a hand with your trip? Tripile's support team is available 24/7 to help with bookings, changes, cancellations, refunds, and travel questions. Call 1-800-963-4330 or email Support@Tripile.com and we'll get you sorted quickly.",
        ],
      },
    ],
    links: BASE_LINKS,
  },
  {
    path: "/careers",
    title: "Careers at Tripile | Join Our Travel Team",
    description:
      "Explore careers at Tripile. Join a fast-growing US travel technology company building better ways to book flights, hotels, and car rentals for millions of travelers.",
    h1: "Careers at Tripile",
    blocks: [
      {
        paragraphs: [
          "Help shape the future of travel at Tripile. We're a fast-growing US travel technology company building better ways for millions of travelers to compare and book flights, hotels, and car rentals. Explore open roles and find your fit.",
        ],
      },
    ],
    links: BASE_LINKS,
  },
  {
    path: "/sitemap",
    title: "Site Map — Browse All Pages | Tripile.com",
    description:
      "Browse the full Tripile site map. Quickly find flights, hotels, car rentals, deals, destination guides, airline pages, and travel resources in one place.",
    h1: "Tripile Site Map",
    blocks: [
      {
        paragraphs: [
          "Find everything on Tripile from one page. Our site map links to flight, hotel, and car-rental search, travel deals, destination and airline pages, travel guides, and helpful resources so you can jump straight to what you need.",
        ],
      },
    ],
    links: BASE_LINKS,
  },
  {
    path: "/taxes-fees",
    title: "Airline Taxes, Fees & Post-Ticketing Charges | Tripile.com",
    description:
      "Understand airline taxes, fees, and post-ticketing charges on Tripile. Learn what's included in your fare, baggage costs, and change fees before you book.",
    h1: "Airline Taxes, Fees & Charges Explained",
    blocks: [
      {
        paragraphs: [
          "Know exactly what you're paying for. This guide explains the taxes and fees included in airline fares, common post-ticketing charges such as changes and baggage, and how Tripile shows transparent totals so there are no surprises at checkout.",
        ],
      },
    ],
    links: BASE_LINKS,
  },
  {
    path: "/price-match",
    title: "Price Match Guarantee | Tripile.com",
    description:
      "Book with confidence using Tripile's Price Match Guarantee. If you find a lower eligible price, we'll match it so you always get a great deal on travel.",
    h1: "Tripile Price Match Guarantee",
    blocks: [
      {
        paragraphs: [
          "Book knowing you got a great price. With Tripile's Price Match Guarantee, if you find a lower eligible price for the same flight or hotel, we'll match it. Learn how the guarantee works, what qualifies, and how to submit a claim.",
        ],
      },
    ],
    links: BASE_LINKS,
  },
  {
    path: "/refund-policy",
    title: "Refund Policy | Tripile.com",
    description:
      "Read Tripile's refund policy. Understand cancellation windows, eligibility, processing times, and how refunds work for flights, hotels, and car rentals.",
    h1: "Tripile Refund Policy",
    blocks: [
      {
        paragraphs: [
          "Understand your options if plans change. Tripile's refund policy explains cancellation windows, eligibility, processing times, and how refunds are handled for flights, hotels, and car rentals, plus how to request one from our support team.",
        ],
      },
    ],
    links: BASE_LINKS,
  },
  {
    path: "/terms",
    title: "Terms & Conditions | Tripile.com",
    description:
      "Review the Tripile terms and conditions governing use of our travel booking platform, bookings, payments, and services across flights, hotels, and car rentals.",
    h1: "Terms & Conditions",
    blocks: [
      {
        paragraphs: [
          "These terms and conditions govern your use of Tripile and the bookings you make through our platform. They cover account use, payments, cancellations, liability, and the services we provide across flights, hotels, and car rentals.",
        ],
      },
    ],
    links: BASE_LINKS,
  },
  {
    path: "/privacy",
    title: "Privacy Policy | Tripile.com",
    description:
      "Read Tripile's privacy policy to learn how we collect, use, and protect your personal information when you search and book travel on our platform.",
    h1: "Privacy Policy",
    blocks: [
      {
        paragraphs: [
          "Your privacy matters to us. This policy explains what personal information Tripile collects when you search and book travel, how we use and protect it, the choices you have, and how to contact us with any privacy questions.",
        ],
      },
    ],
    links: BASE_LINKS,
  },
  {
    path: "/travel-guides",
    title: "Travel Guides — City & Country Guides, Things to Do & Best Time to Visit | Tripile",
    description:
      "Explore Tripile's travel guides for cities and countries worldwide. Discover things to do, the best time to visit, where to stay, and how to find cheap flights.",
    h1: "Travel Guides for Cities & Countries Worldwide",
    blocks: [
      {
        paragraphs: [
          "Plan smarter with Tripile's travel guides. Each guide covers the top things to do, the best time to visit, where to stay, how to get around, and how to find cheap flights, so you can build the perfect trip to cities and countries around the world.",
        ],
      },
    ],
    links: [
      ...cityGuides.slice(0, 4).map((c) => ({
        href: `/travel-guide/${c.slug}`,
        label: `${c.city} travel guide`,
      })),
      ...getCountryGuides()
        .slice(0, 4)
        .map((c) => ({ href: `/travel-guide/country/${c.slug}`, label: `${c.name} travel guide` })),
    ],
  },
];

// ---------------------------------------------------------------------------
// 2) Programmatic pages generated from data sources
// ---------------------------------------------------------------------------
const programmaticPages: Page[] = [];

// Cruise destinations
cruiseDestinations.forEach((c) => {
  programmaticPages.push({
    path: `/cruises/${c.slug}`,
    title: c.seoTitle,
    description: c.metaDescription,
    h1: c.h1,
    blocks: [
      { paragraphs: c.intro },
      {
        heading: "Cruise Highlights",
        paragraphs: c.highlights.map((h) => `${h.title}: ${h.description}`),
      },
      { heading: "Best Time to Go", paragraphs: [c.bestTimeToGo] },
      {
        heading: "Frequently Asked Questions",
        paragraphs: c.faqs.map((f) => `${f.question} ${f.answer}`),
      },
    ],
    links: [
      { href: "/cruise-deals", label: "All cruise deals" },
      ...cruiseDestinations
        .filter((o) => o.slug !== c.slug)
        .slice(0, 4)
        .map((o) => ({ href: `/cruises/${o.slug}`, label: o.name })),
    ],
  });
});

// City travel guides
cityGuides.forEach((dest) => {
  const g = buildCityGuide(dest);
  programmaticPages.push({
    path: `/travel-guide/${dest.slug}`,
    title: `${dest.city} Travel Guide — Things to Do & Best Time to Visit | Tripile`,
    description:
      `Plan your trip with the ${dest.city} travel guide: top things to do, the best time to visit, where to stay, getting around, and cheap flights to ${dest.city}.`.slice(
        0,
        160
      ),
    h1: `${dest.city} Travel Guide`,
    blocks: [
      { paragraphs: [g.intro] },
      { heading: "Where to Stay", paragraphs: [g.whereToStay] },
      { heading: "Getting Around", paragraphs: [g.gettingAround] },
      { heading: "Budget Tip", paragraphs: [g.budgetTip] },
      {
        heading: "Frequently Asked Questions",
        paragraphs: g.faqs.map((f) => `${f.question} ${f.answer}`),
      },
    ],
    links: g.related.map((r) => ({ href: r.href, label: r.label })),
  });
});

// Country travel guides
getCountryGuides().forEach((meta) => {
  const g = buildCountryGuide(meta);
  programmaticPages.push({
    path: `/travel-guide/country/${meta.slug}`,
    title: `${meta.name} Travel Guide — Best Cities, When to Go & Cheap Flights | Tripile`,
    description:
      `${meta.name} travel guide: the best cities to visit, when to go, what to eat, and how to find cheap flights to ${meta.name}.`.slice(
        0,
        160
      ),
    h1: `${meta.name} Travel Guide`,
    blocks: [
      { paragraphs: [g.intro] },
      {
        heading: `Best Cities to Visit in ${meta.name}`,
        paragraphs: [
          `Top destinations include ${g.cities
            .slice(0, 6)
            .map((c) => c.city)
            .join(", ")}. Each offers its own mix of sights, food, and culture.`,
        ],
      },
      {
        heading: "Frequently Asked Questions",
        paragraphs: g.faqs.map((f) => `${f.question} ${f.answer}`),
      },
    ],
    links: g.related.map((r) => ({ href: r.href, label: r.label })),
  });
});

// Blog posts
blogPosts.forEach((p) => {
  programmaticPages.push({
    path: `/blog/${p.slug}`,
    title: `${p.title} | Tripile Blog`.slice(0, 65),
    description: (p.excerpt || `${p.title} — travel tips and advice from the Tripile blog.`).slice(
      0,
      160
    ),
    h1: p.title,
    blocks: [
      { paragraphs: [p.excerpt || `${p.title} — read the full article on the Tripile travel blog.`] },
      {
        paragraphs: [
          "Read the complete article on Tripile for expert travel tips, practical advice, and money-saving ideas to help you plan your next trip and book cheap flights, hotels, and car rentals.",
        ],
      },
    ],
    links: blogPosts
      .filter((o) => o.slug !== p.slug)
      .slice(0, 4)
      .map((o) => ({ href: `/blog/${o.slug}`, label: o.title })),
  });
});

// Flights-to destination pages
popularDestinations.forEach((d) => {
  programmaticPages.push({
    path: `/flights-to/${d.slug}`,
    title: `Cheap Flights to ${d.city} (${d.iataCode}) | Tripile.com`.slice(0, 65),
    description:
      `Find cheap flights to ${d.city} (${d.iataCode}) on Tripile. Compare fares across 500+ airlines, see the best time to book, and grab flight deals to ${d.city}.`.slice(
        0,
        160
      ),
    h1: `Cheap Flights to ${d.city}`,
    blocks: [
      {
        paragraphs: [
          `Compare cheap flights to ${d.city} (${d.iataCode}) on Tripile. We search fares across 500+ airlines so you can find the lowest price for your dates, filter by stops and departure time, and book domestic and international routes to ${d.city} with transparent totals and no hidden fees.`,
        ],
      },
      {
        heading: `When to Book Flights to ${d.city}`,
        paragraphs: [
          `Fares to ${d.city} change with season and demand. Book a few weeks to a couple of months ahead, travel mid-week where possible, and set flexible dates to spot the cheapest days to fly to ${d.city}.`,
        ],
      },
    ],
    links: [
      { href: `/cheap-hotels-in/${d.slug}`, label: `Hotels in ${d.city}` },
      { href: `/cheap-car-rentals-in-${d.slug}`, label: `Car rentals in ${d.city}` },
      { href: `/travel-guide/${d.slug}`, label: `${d.city} travel guide` },
      { href: "/flights", label: "Search all flights" },
    ],
  });
});

// Hotel city pages
seoHotelCities.forEach((h) => {
  const seg = h.slug.replace(/^cheap-hotels-in-/, "");
  programmaticPages.push({
    path: `/cheap-hotels-in/${seg}`,
    title: `Cheap Hotels in ${h.city}, ${h.state} | Tripile.com`.slice(0, 65),
    description:
      `Find cheap hotels in ${h.city}, ${h.state} from around $${h.avgPrice}/night on Tripile. Compare rates in ${h.topAreas
        .slice(0, 2)
        .join(" & ")} and more.`.slice(0, 160),
    h1: `Cheap Hotels in ${h.city}, ${h.state}`,
    blocks: [
      {
        paragraphs: [
          `Compare cheap hotels in ${h.city}, ${h.state} on Tripile, with rates starting around $${h.avgPrice} per night. Search by dates to compare prices, guest ratings, and cancellation policies across popular areas including ${h.topAreas.join(
            ", "
          )}.`,
        ],
      },
      {
        heading: `Best Areas to Stay in ${h.city}`,
        paragraphs: [
          `Popular neighborhoods for visitors include ${h.topAreas.join(
            ", "
          )}. Stay central for sightseeing, near transit for easy day trips, or close to the airport for early departures.`,
        ],
      },
    ],
    links: [
      { href: `/flights-to/${seg}`, label: `Flights to ${h.city}` },
      { href: `/cheap-car-rentals-in-${seg}`, label: `Car rentals in ${h.city}` },
      { href: "/hotels", label: "Search all hotels" },
    ],
  });
});

// Car rental city pages
popularDestinations.forEach((d) => {
  programmaticPages.push({
    path: `/cheap-car-rentals-in-${d.slug}`,
    title: `Cheap Car Rentals in ${d.city} | Tripile.com`.slice(0, 65),
    description:
      `Compare cheap car rentals in ${d.city} on Tripile. Find low daily rates, airport and downtown pickup, and flexible cancellation from trusted rental partners.`.slice(
        0,
        160
      ),
    h1: `Cheap Car Rentals in ${d.city}`,
    blocks: [
      {
        paragraphs: [
          `Rent a car in ${d.city} for less with Tripile. Compare daily rates across economy, SUV, and premium vehicles, choose airport or city-center pickup, and review mileage and cancellation terms before you book — with transparent totals and no hidden fees.`,
        ],
      },
    ],
    links: [
      { href: `/flights-to/${d.slug}`, label: `Flights to ${d.city}` },
      { href: `/cheap-hotels-in/${d.slug}`, label: `Hotels in ${d.city}` },
      { href: "/car-rentals", label: "Search all car rentals" },
    ],
  });
});

// City-pair flight route pages
seoFlightRoutes.forEach((r) => {
  programmaticPages.push({
    path: `/${r.slug}`,
    title: `Cheap Flights from ${r.origin} to ${r.destination} | Tripile`.slice(0, 65),
    description:
      `Find cheap flights from ${r.origin} (${r.originCode}) to ${r.destination} (${r.destinationCode}) from $${r.avgPrice}. Compare airlines and book on Tripile.`.slice(
        0,
        160
      ),
    h1: `Cheap Flights from ${r.origin} to ${r.destination}`,
    blocks: [
      {
        paragraphs: [
          `Compare cheap flights from ${r.origin} (${r.originCode}) to ${r.destination} (${r.destinationCode}) on Tripile, with fares from around $${r.avgPrice}. The route takes about ${r.flightDuration}, and ${r.bestMonth} is often the best month for low prices.`,
        ],
      },
      {
        heading: "Airlines on This Route",
        paragraphs: [
          `Popular airlines flying ${r.origin} to ${r.destination} include ${r.popularAirlines.join(
            ", "
          )}. Compare their schedules, baggage rules, and prices side by side, then book the option that fits your trip.`,
        ],
      },
    ],
    links: [
      { href: `/flights-to/${r.destination.toLowerCase().replace(/\s+/g, "-")}`, label: `All flights to ${r.destination}` },
      { href: "/flights", label: "Search all flights" },
      { href: "/deals", label: "Latest flight deals" },
    ],
  });
});

// Airline pages
airlinesData.forEach((a) => {
  programmaticPages.push({
    path: `/airlines/${a.slug}`,
    title: `${a.name} Flights & Deals | Tripile.com`.slice(0, 65),
    description:
      `Book ${a.name} flights on Tripile. Compare ${a.name} fares, routes, baggage policies, and deals, and find cheap tickets with transparent pricing.`.slice(
        0,
        160
      ),
    h1: `${a.name} Flights & Deals`,
    blocks: [
      {
        paragraphs: [
          `Find and compare ${a.name} (${a.code}) flights on Tripile. Search ${a.name} fares and routes, review baggage and fare rules, and book cheap tickets with transparent totals and no hidden fees. ${a.name} is a ${a.country}-based carrier.`,
        ],
      },
    ],
    links: [
      { href: "/flights", label: "Search all flights" },
      { href: "/webcheck-in", label: "Airline web check-in" },
      { href: "/deals", label: "Flight deals" },
    ],
  });
});

// Airport landing pages
airportLandingPages.forEach((ap) => {
  programmaticPages.push({
    path: `/airport/${ap.slug}`,
    title: `${ap.airportName} (${ap.airportCode}) Flights | Tripile.com`.slice(0, 65),
    description: (
      ap.description ||
      `Find cheap flights from ${ap.cityName}, ${ap.stateCode} (${ap.airportCode}) on Tripile. Compare airlines and fares from ${ap.airportName}.`
    ).slice(0, 160),
    h1: `Cheap Flights from ${ap.airportName} (${ap.airportCode})`,
    blocks: [
      {
        paragraphs: [
          ap.description ||
            `Compare cheap flights from ${ap.airportName} (${ap.airportCode}) in ${ap.cityName}, ${ap.stateName} on Tripile. Fares start from around $${ap.samplePrice}, with popular airlines including ${ap.popularAirlines
              .slice(0, 4)
              .join(", ")}.`,
        ],
      },
      {
        heading: "Popular Destinations",
        paragraphs: [
          `Top routes from ${ap.airportCode} include ${ap.popularDestinations
            .slice(0, 5)
            .map((d) => `${d.city} (${d.code}) from $${d.price}`)
            .join(", ")}.`,
        ],
      },
    ],
    links: [
      { href: "/flights", label: "Search all flights" },
      { href: "/flight-status", label: "Check flight status" },
      { href: "/deals", label: "Flight deals" },
    ],
  });
});

// Deal detail pages (light templated content; slugs only)
dealSlugs.forEach((slug) => {
  const name = titleCase(slug);
  programmaticPages.push({
    path: `/deals/${slug}`,
    title: `${name} Deal | Tripile.com`.slice(0, 65),
    description:
      `Grab the ${name} travel deal on Tripile. Limited-time offer with transparent pricing and no hidden fees — compare and book before it's gone.`.slice(
        0,
        160
      ),
    h1: `${name} Travel Deal`,
    blocks: [
      {
        paragraphs: [
          `Explore the ${name} travel deal on Tripile. This limited-time offer features a clear price with no hidden fees, so you can compare quickly and book with confidence. View the full details, travel window, and terms, then reserve before the deal expires.`,
        ],
      },
    ],
    links: [
      { href: "/deals", label: "See all travel deals" },
      ...BASE_LINKS.slice(0, 3),
    ],
  });
});

// ---------------------------------------------------------------------------
// 3) Render + write
// ---------------------------------------------------------------------------
const allPages = [...corePages, ...programmaticPages];

const template = readFileSync(resolve(DIST, "index.html"), "utf8");

const canonicalFor = (path: string): string =>
  path === "/" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${path}`;

function renderArticle(page: Page): string {
  const blocksHtml = page.blocks
    .map((b) => {
      const heading = b.heading ? `<h2>${esc(b.heading)}</h2>` : "";
      const paras = b.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("");
      return heading + paras;
    })
    .join("");
  const linksHtml = page.links
    .map((l) => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`)
    .join("");
  return (
    `<article id="seo-static-content" style="max-width: 900px; display:none; margin: 0 auto; padding: 20px; font-family: Inter, Arial, sans-serif; line-height: 1.6;">` +
    `<h1>${esc(page.h1)}</h1>` +
    blocksHtml +
    `<h2>Explore More on Tripile</h2><ul>${linksHtml}</ul>` +
    `</article>`
  );
}

function renderHeadMeta(page: Page): string {
  const canonical = canonicalFor(page.path);
  const d = esc(page.description);
  const t = esc(page.title);
  return [
    `<meta name="description" content="${d}" data-prerendered="true" />`,
    `<link rel="canonical" href="${canonical}" data-prerendered="true" />`,
    `<meta property="og:title" content="${t}" data-prerendered="true" />`,
    `<meta property="og:description" content="${d}" data-prerendered="true" />`,
    `<meta property="og:url" content="${canonical}" data-prerendered="true" />`,
    `<meta name="twitter:title" content="${t}" data-prerendered="true" />`,
    `<meta name="twitter:description" content="${d}" data-prerendered="true" />`,
  ].join("\n    ");
}

function buildHtml(page: Page): string {
  let html = template;
  // Unique <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(page.title)}</title>`);
  // Inject per-route head meta right before </head>
  html = html.replace(/<\/head>/, `    ${renderHeadMeta(page)}\n  </head>`);
  // Replace the shared static article with route-specific content
  html = html.replace(
    /<article[^>]*id="seo-static-content"[\s\S]*?<\/article>/,
    renderArticle(page)
  );
  return html;
}

let written = 0;
const seen = new Set<string>();
for (const page of allPages) {
  if (seen.has(page.path)) continue;
  seen.add(page.path);

  const outPath =
    page.path === "/"
      ? resolve(DIST, "index.html")
      : resolve(DIST, page.path.replace(/^\//, ""), "index.html");

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, buildHtml(page));
  written++;
}

console.log(`prerender: wrote ${written} static route HTML files`);
