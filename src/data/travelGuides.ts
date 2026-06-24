// ============================================================================
// Travel Guides content engine — powers programmatic City & Country guide pages
// Long-tail, informational intent ("things to do in X", "X travel guide",
// "best time to visit X") that complements the commercial flight/hotel pages.
// All content is generated deterministically from canonical data sources so
// hundreds of unique, indexable pages stay in sync with zero manual upkeep.
// ============================================================================

import { popularDestinations, type Destination } from "./destinationsData";
import { getDestinationContent, type DestinationContent } from "./destinationContent";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface RelatedLink {
  label: string;
  href: string;
  sublabel?: string;
}

export interface CountryMeta {
  /** URL slug, e.g. "united-states" */
  slug: string;
  /** Display name, e.g. "United States" */
  name: string;
  /** Key matching destinationsData.country, e.g. "US" */
  key: string;
  currency: string;
  language: string;
  bestTime: string;
  knownFor: string;
  cuisine: string;
  tagline: string;
}

// ---------------------------------------------------------------------------
// Country metadata (display + content). Keys map to destinationsData.country.
// ---------------------------------------------------------------------------
export const COUNTRY_META: CountryMeta[] = [
  { key: "US", slug: "united-states", name: "United States", currency: "US Dollar (USD)", language: "English", bestTime: "April–June & September–October", knownFor: "national parks, vibrant cities, road trips and coast-to-coast diversity", cuisine: "BBQ, burgers, soul food, Tex-Mex and regional seafood", tagline: "From Manhattan skylines to Pacific beaches, the USA packs every kind of trip into one country." },
  { key: "UK", slug: "united-kingdom", name: "United Kingdom", currency: "Pound Sterling (GBP)", language: "English", bestTime: "May–September", knownFor: "royal history, countryside, pubs and world-class museums", cuisine: "fish & chips, Sunday roast, afternoon tea and curry", tagline: "Centuries of history, green countryside and buzzing cities sit a short train ride apart." },
  { key: "France", slug: "france", name: "France", currency: "Euro (EUR)", language: "French", bestTime: "April–June & September–October", knownFor: "art, wine regions, alpine slopes and Riviera beaches", cuisine: "croissants, cheese, wine and fine dining", tagline: "Romance, gastronomy and art define a country that rewards slow travel." },
  { key: "Japan", slug: "japan", name: "Japan", currency: "Japanese Yen (JPY)", language: "Japanese", bestTime: "March–May (cherry blossom) & October–November", knownFor: "temples, bullet trains, cherry blossoms and neon cities", cuisine: "sushi, ramen, tempura and street food", tagline: "Ancient temples and hyper-modern cities coexist in one of the world's safest destinations." },
  { key: "UAE", slug: "united-arab-emirates", name: "United Arab Emirates", currency: "UAE Dirham (AED)", language: "Arabic & English", bestTime: "November–March", knownFor: "futuristic skylines, desert safaris and luxury shopping", cuisine: "shawarma, hummus, grilled meats and global fine dining", tagline: "Record-breaking skyscrapers meet golden desert dunes and year-round sunshine." },
  { key: "Mexico", slug: "mexico", name: "Mexico", currency: "Mexican Peso (MXN)", language: "Spanish", bestTime: "December–April", knownFor: "Caribbean beaches, Mayan ruins and lively culture", cuisine: "tacos, mole, ceviche and mezcal", tagline: "Turquoise coastlines, ancient pyramids and some of the world's best food." },
  { key: "Spain", slug: "spain", name: "Spain", currency: "Euro (EUR)", language: "Spanish", bestTime: "April–June & September–October", knownFor: "tapas, beaches, flamenco and Gaudí architecture", cuisine: "paella, tapas, jamón and sangria", tagline: "Sun-soaked plazas, late-night dining and a different vibe in every region." },
  { key: "Italy", slug: "italy", name: "Italy", currency: "Euro (EUR)", language: "Italian", bestTime: "April–June & September–October", knownFor: "Roman ruins, Renaissance art, coastline and cuisine", cuisine: "pasta, pizza, gelato and espresso", tagline: "Open-air history, legendary food and dramatic coastlines from north to south." },
  { key: "Netherlands", slug: "netherlands", name: "Netherlands", currency: "Euro (EUR)", language: "Dutch & English", bestTime: "April–May (tulips) & June–August", knownFor: "canals, cycling, tulips and museums", cuisine: "stroopwafels, cheese, herring and fries", tagline: "Canal-lined cities and tulip fields that are remarkably easy to explore by bike." },
  { key: "Thailand", slug: "thailand", name: "Thailand", currency: "Thai Baht (THB)", language: "Thai", bestTime: "November–March", knownFor: "tropical islands, temples and street food", cuisine: "pad thai, green curry, mango sticky rice", tagline: "Golden temples, island beaches and legendary hospitality at great value." },
  { key: "Canada", slug: "canada", name: "Canada", currency: "Canadian Dollar (CAD)", language: "English & French", bestTime: "June–September & December–March (ski)", knownFor: "mountains, lakes, wildlife and friendly cities", cuisine: "poutine, maple syrup, salmon and butter tarts", tagline: "Vast wilderness, soaring Rockies and welcoming multicultural cities." },
  { key: "Australia", slug: "australia", name: "Australia", currency: "Australian Dollar (AUD)", language: "English", bestTime: "September–November & March–May", knownFor: "reefs, beaches, outback and laid-back cities", cuisine: "seafood, barbecue, flat whites and bush tucker", tagline: "Reef, rainforest, outback and beach cities on a continent built for road trips." },
  { key: "Germany", slug: "germany", name: "Germany", currency: "Euro (EUR)", language: "German", bestTime: "May–September & December (markets)", knownFor: "castles, beer gardens, history and Christmas markets", cuisine: "sausages, pretzels, schnitzel and beer", tagline: "Fairytale castles, world-class museums and famously efficient travel." },
  { key: "Singapore", slug: "singapore", name: "Singapore", currency: "Singapore Dollar (SGD)", language: "English", bestTime: "February–April", knownFor: "futuristic gardens, hawker food and spotless streets", cuisine: "chili crab, laksa, satay and Hainanese chicken rice", tagline: "A green, gleaming city-state with some of the best food in Asia." },
  { key: "Turkey", slug: "turkey", name: "Turkey", currency: "Turkish Lira (TRY)", language: "Turkish", bestTime: "April–June & September–November", knownFor: "Istanbul's mosques, Cappadocia and turquoise coast", cuisine: "kebabs, mezze, baklava and Turkish tea", tagline: "Where Europe meets Asia — bazaars, balloons over Cappadocia and ancient ruins." },
  { key: "South Korea", slug: "south-korea", name: "South Korea", currency: "South Korean Won (KRW)", language: "Korean", bestTime: "April–June & September–November", knownFor: "K-culture, palaces, mountains and street food", cuisine: "Korean BBQ, kimchi, bibimbap and fried chicken", tagline: "Palaces and temples beside neon nightlife, K-pop and incredible food." },
  { key: "India", slug: "india", name: "India", currency: "Indian Rupee (INR)", language: "Hindi, English & regional", bestTime: "October–March", knownFor: "the Taj Mahal, palaces, spices and vibrant festivals", cuisine: "curries, biryani, street chaat and sweets", tagline: "A feast for the senses — palaces, beaches, mountains and unforgettable food." },
  { key: "South Africa", slug: "south-africa", name: "South Africa", currency: "South African Rand (ZAR)", language: "English & multiple", bestTime: "May–September (safari)", knownFor: "safaris, wine lands, Cape Town and coastline", cuisine: "braai, biltong, bobotie and seafood", tagline: "Big-five safaris, dramatic coastlines and world-class wine within easy reach." },
  { key: "Greece", slug: "greece", name: "Greece", currency: "Euro (EUR)", language: "Greek", bestTime: "May–June & September–October", knownFor: "islands, ancient ruins and Mediterranean beaches", cuisine: "souvlaki, moussaka, feta and olive oil", tagline: "Whitewashed islands, ancient wonders and slow Mediterranean days." },
  { key: "Portugal", slug: "portugal", name: "Portugal", currency: "Euro (EUR)", language: "Portuguese", bestTime: "May–June & September–October", knownFor: "beaches, port wine, tiles and seafood", cuisine: "pastéis de nata, bacalhau, grilled sardines", tagline: "Golden Atlantic beaches, historic cities and Europe's best value coastline." },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** All city guides are derived 1:1 from popular destinations. */
export const cityGuides: Destination[] = popularDestinations;

export function getCityGuide(slug?: string): Destination | undefined {
  if (!slug) return undefined;
  return cityGuides.find((c) => c.slug === slug);
}

function fallbackCountryMeta(key: string): CountryMeta {
  return {
    key,
    slug: slugify(key),
    name: key,
    currency: "local currency",
    language: "the local language",
    bestTime: "spring and autumn",
    knownFor: "its cities, culture and cuisine",
    cuisine: "regional specialities",
    tagline: `Discover the best of ${key} with Tripile's travel guide.`,
  };
}

export function getCountryMetaByKey(key: string): CountryMeta {
  return COUNTRY_META.find((c) => c.key === key) ?? fallbackCountryMeta(key);
}

/** Country guides for every country that has at least one destination. */
export function getCountryGuides(): CountryMeta[] {
  const keys = Array.from(new Set(cityGuides.map((c) => c.country)));
  return keys
    .map((k) => getCountryMetaByKey(k))
    .sort((a, b) => getCitiesForCountry(b.key).length - getCitiesForCountry(a.key).length);
}

export function getCountryGuide(slug?: string): CountryMeta | undefined {
  if (!slug) return undefined;
  return getCountryGuides().find((c) => c.slug === slug);
}

export function getCitiesForCountry(key: string): Destination[] {
  return cityGuides.filter((c) => c.country === key);
}

// ---------------------------------------------------------------------------
// Automated FAQ generation (long-tail, question-intent keywords)
// ---------------------------------------------------------------------------
export function generateCityFaqs(dest: Destination, content: DestinationContent): FaqItem[] {
  const { city } = dest;
  return [
    {
      question: `Is ${city} worth visiting?`,
      answer: `Yes — ${content.whyVisit} Most travelers spend 3–5 days exploring ${city}, and Tripile makes it easy to bundle cheap flights and hotels for the trip.`,
    },
    {
      question: `How many days do you need in ${city}?`,
      answer: `Plan for 3 to 5 days to see the highlights of ${city} at a comfortable pace. A long weekend covers the must-see sights, while a full week lets you add day trips and hidden gems.`,
    },
    {
      question: `What is the best time to visit ${city}?`,
      answer: content.bestTimeToVisit,
    },
    {
      question: `What is the cheapest month to fly to ${city}?`,
      answer: `The cheapest month to fly to ${city} is usually ${content.cheapestMonth}, when fares run well below the ${content.expensiveMonth} peak. Set a fare alert on Tripile to catch the lowest prices.`,
    },
    {
      question: `What are the top things to do in ${city}?`,
      answer: `Don't miss ${content.bestPlaces.slice(0, 3).map((p) => p.name).join(", ")}. Each offers a different side of ${city}, from culture and history to food and nightlife.`,
    },
    {
      question: `How do you get around ${city}?`,
      answer: `${city} is best explored with a mix of public transport, walking and ride-hailing. For day trips and flexibility beyond the center, compare car rentals on Tripile before you arrive.`,
    },
  ];
}

export function generateCountryFaqs(meta: CountryMeta, cities: Destination[]): FaqItem[] {
  const topCities = cities.slice(0, 4).map((c) => c.city).join(", ");
  return [
    {
      question: `What is the best time to visit ${meta.name}?`,
      answer: `The best time to visit ${meta.name} is generally ${meta.bestTime}, when the weather is most favorable for sightseeing and prices are reasonable.`,
    },
    {
      question: `What is ${meta.name} known for?`,
      answer: `${meta.name} is known for ${meta.knownFor}. Foodies will also love the local ${meta.cuisine}.`,
    },
    {
      question: `Which cities should I visit in ${meta.name}?`,
      answer: `Popular starting points include ${topCities}. Tripile has dedicated city guides and cheap-flight pages for each so you can plan a multi-stop itinerary easily.`,
    },
    {
      question: `What currency and language are used in ${meta.name}?`,
      answer: `${meta.name} uses the ${meta.currency}, and the main language is ${meta.language}. English is widely understood in major tourist areas.`,
    },
    {
      question: `How do I find cheap flights to ${meta.name}?`,
      answer: `Use Tripile to compare fares across 500+ airlines, set price alerts, and travel in shoulder season (${meta.bestTime}) for the best value flights to ${meta.name}.`,
    },
  ];
}

// ---------------------------------------------------------------------------
// Long-tail keyword generation
// ---------------------------------------------------------------------------
export function cityKeywords(city: string): string {
  return [
    `${city} travel guide`,
    `things to do in ${city}`,
    `best time to visit ${city}`,
    `${city} vacation`,
    `where to stay in ${city}`,
    `cheap flights to ${city}`,
    `${city} itinerary`,
    `is ${city} worth visiting`,
  ].join(", ");
}

export function countryKeywords(name: string): string {
  return [
    `${name} travel guide`,
    `places to visit in ${name}`,
    `best time to visit ${name}`,
    `${name} vacation packages`,
    `${name} itinerary`,
    `cheap flights to ${name}`,
    `${name} holiday`,
  ].join(", ");
}

// ---------------------------------------------------------------------------
// Composed guide builders (page-ready view models)
// ---------------------------------------------------------------------------
export interface CityGuideView {
  dest: Destination;
  content: DestinationContent;
  countryMeta: CountryMeta;
  intro: string;
  whereToStay: string;
  gettingAround: string;
  budgetTip: string;
  faqs: FaqItem[];
  keywords: string;
  related: RelatedLink[];
}

export function buildCityGuide(dest: Destination): CityGuideView {
  const content = getDestinationContent(dest.city, dest.iataCode, dest.country);
  const countryMeta = getCountryMetaByKey(dest.country);
  const faqs = generateCityFaqs(dest, content);

  const sameCountry = getCitiesForCountry(dest.country).filter((c) => c.slug !== dest.slug);
  const related: RelatedLink[] = [
    ...sameCountry.slice(0, 5).map((c) => ({
      label: `${c.city} Travel Guide`,
      href: `/travel-guide/${c.slug}`,
      sublabel: countryMeta.name,
    })),
    { label: `Cheap Flights to ${dest.city}`, href: `/flights-to/${dest.slug}`, sublabel: "Compare fares" },
    { label: `Cheap Hotels in ${dest.city}`, href: `/cheap-hotels-in/${dest.slug}`, sublabel: "Best rates" },
    { label: `Car Rentals in ${dest.city}`, href: `/cheap-car-rentals-in-${dest.slug}`, sublabel: "Drive & explore" },
    { label: `${countryMeta.name} Travel Guide`, href: `/travel-guide/country/${countryMeta.slug}`, sublabel: "Country overview" },
  ].slice(0, 9);

  return {
    dest,
    content,
    countryMeta,
    intro: `${content.whyVisit} This ${dest.city} travel guide covers the top attractions, where to stay, how to get around, the best time to visit and how to find the cheapest flights — everything you need to plan an unforgettable trip.`,
    whereToStay: `Choose a neighborhood that matches your trip: stay central for first visits and easy sightseeing, near the waterfront or arts district for atmosphere, or close to ${content.airports[0]?.name ?? `${dest.city} airport`} for early departures. Compare hotels in ${dest.city} on Tripile to lock in the best rate for your dates.`,
    gettingAround: `${dest.city} is well connected. Walk the central districts, use public transport for longer hops, and consider a rental car for day trips beyond the city. ${content.airports[0]?.name ?? "The main airport"} (${dest.iataCode}) is the gateway for most visitors.`,
    budgetTip: content.travelTips[0] ?? `Travel mid-week and book 1–3 months ahead for the best fares to ${dest.city}.`,
    faqs,
    keywords: cityKeywords(dest.city),
    related,
  };
}

export interface CountryGuideView {
  meta: CountryMeta;
  cities: Destination[];
  intro: string;
  faqs: FaqItem[];
  keywords: string;
  related: RelatedLink[];
}

export function buildCountryGuide(meta: CountryMeta): CountryGuideView {
  const cities = getCitiesForCountry(meta.key);
  const faqs = generateCountryFaqs(meta, cities);

  const otherCountries = getCountryGuides().filter((c) => c.slug !== meta.slug);
  const related: RelatedLink[] = [
    ...cities.slice(0, 5).map((c) => ({
      label: `${c.city} Travel Guide`,
      href: `/travel-guide/${c.slug}`,
      sublabel: meta.name,
    })),
    ...otherCountries.slice(0, 4).map((c) => ({
      label: `${c.name} Travel Guide`,
      href: `/travel-guide/country/${c.slug}`,
      sublabel: "Country guide",
    })),
  ].slice(0, 9);

  return {
    meta,
    cities,
    intro: `${meta.tagline} ${meta.name} is known for ${meta.knownFor}. This ${meta.name} travel guide breaks down the best cities to visit, when to go, what to eat and how to find cheap flights so you can plan the perfect trip.`,
    faqs,
    keywords: countryKeywords(meta.name),
    related,
  };
}
