// ============================================================================
// Travel Collections — themed, curated destination lists (beach, honeymoon,
// adventure, luxury, budget, family, city break, food, islands, mountains,
// heritage, weekend getaways).
//
// Closes the "curated collections / themed guides / package intent" content gap
// with a small number of genuinely useful hub pages instead of hundreds of thin
// pages. Every destination referenced here already has live flight, hotel and
// car-rental pages — no invented places, no invented prices.
// ============================================================================

import { popularDestinations, type Destination } from "./destinationsData";
import type { FaqItem, RelatedLink } from "./travelGuides";

export interface CollectionEntry {
  /** Destination slug — must exist in popularDestinations. */
  slug: string;
  /** Why this destination belongs in the collection. */
  note: string;
}

export interface TravelCollection {
  slug: string;
  name: string;
  h1: string;
  tagline: string;
  intro: string;
  /** Who the collection suits best. */
  bestFor: string;
  /** What a trip in this style typically looks like. */
  whatToExpect: string;
  /** How to plan and bundle the trip on Tripile. */
  planningTips: string[];
  entries: CollectionEntry[];
}

export const travelCollections: TravelCollection[] = [
  {
    slug: "beach-vacations",
    name: "Beach Vacations",
    h1: "Best Beach Vacation Destinations",
    tagline: "Sand, sun and easy flights — beach trips that work year-round.",
    intro:
      "A beach vacation is the easiest trip to plan well: pick a coastline with reliable weather for your dates, stay close enough to walk to the sand, and keep the itinerary light. This collection brings together beach destinations that combine strong flight connections with a wide choice of coastal hotels, so you can compare real prices for your own dates rather than guessing.",
    bestFor: "couples, families and anyone who wants short transfers and a swimmable coastline",
    whatToExpect:
      "Most beach trips run 4–7 nights, with mornings on the water, afternoons in the shade and evenings out for seafood. Hotels closest to the beach carry a premium, so compare a few blocks inland before booking.",
    planningTips: [
      "Search flexible dates — beach fares swing hardest between school holidays and shoulder season.",
      "Check the rainy or hurricane season for your destination before locking in non-refundable rates.",
      "Compare beachfront hotels against properties two or three streets back; the walk is often short and the saving real.",
      "Add a rental car only if you plan day trips — many beach towns are walkable.",
    ],
    entries: [
      { slug: "cancun", note: "Caribbean sand, warm water most of the year and a huge range of beachfront hotels." },
      { slug: "honolulu", note: "Waikiki's calm swimming beaches plus volcanoes, hikes and island day trips." },
      { slug: "miami", note: "Ocean Drive beaches paired with nightlife, Cuban food and easy year-round flights." },
      { slug: "san-diego", note: "Mild weather nearly every month, long surf beaches and a family-friendly pace." },
      { slug: "fort-lauderdale", note: "Quieter Florida beaches, canal cruises and a cheaper base than Miami Beach." },
      { slug: "tampa", note: "Gulf-side sand with calmer, warmer water and quick drives to St. Pete and Clearwater." },
      { slug: "barcelona", note: "City beaches within reach of Gaudí architecture, tapas bars and Costa Brava day trips." },
      { slug: "lisbon", note: "Atlantic surf beaches a short train ride from a historic capital." },
    ],
  },
  {
    slug: "island-getaways",
    name: "Island Getaways",
    h1: "Best Island Getaways & Island-Hopping Gateways",
    tagline: "Fly into the hub, then hop to the islands.",
    intro:
      "Most island trips start on the mainland or at a major island hub, so the cheapest way to plan one is to book the long flight to the gateway city and arrange the short island hop separately. These destinations are the gateways that open up the world's best island regions, and each has its own hotel and flight page on Tripile.",
    bestFor: "travelers combining a city stopover with beach or island time",
    whatToExpect:
      "Expect two stages: a long-haul flight into the gateway, then a ferry or short regional flight. Build in a night at the gateway city in each direction so a delay never costs you the island connection.",
    planningTips: [
      "Book the long flight and the island hop with a buffer of at least one night in each direction.",
      "Compare hotels at the gateway city for arrival and departure nights — they are usually cheaper than resort rates.",
      "Ferry schedules shrink outside high season; check them before you fix your dates.",
      "Pack light: regional island flights often have stricter baggage limits than the long-haul carrier.",
    ],
    entries: [
      { slug: "athens", note: "The gateway to the Greek islands, with ferries and short flights to Santorini, Mykonos and Crete." },
      { slug: "bangkok", note: "The hub for Thailand's islands — Phuket, Krabi and Koh Samui are all short flights away." },
      { slug: "honolulu", note: "Oahu's base for inter-island flights to Maui, Kauai and the Big Island." },
      { slug: "singapore", note: "A spotless stopover city with fast links to Indonesian and Malaysian islands." },
      { slug: "cancun", note: "Ferries to Isla Mujeres and Cozumel plus the whole Riviera Maya coast." },
      { slug: "lisbon", note: "Direct flights to Madeira and the Azores for Atlantic island hiking and coastline." },
    ],
  },
  {
    slug: "honeymoon-and-romantic-getaways",
    name: "Honeymoon & Romantic Getaways",
    h1: "Best Honeymoon & Romantic Getaway Destinations",
    tagline: "Slow mornings, long dinners and views worth the flight.",
    intro:
      "A honeymoon or romantic break rewards fewer stops and better hotels. Pick one or two bases, book a room with a view you will actually use, and leave space for unplanned evenings. These destinations combine atmosphere with easy logistics, so the trip stays relaxed from the first flight to the last night.",
    bestFor: "honeymoons, anniversaries and couples' escapes",
    whatToExpect:
      "Plan 7–10 nights across no more than two bases. Many hotels offer honeymoon extras when you note the occasion in your booking request — ask before you arrive, not after.",
    planningTips: [
      "Travel in shoulder season: the same hotels cost less and the landmarks are far quieter.",
      "Book a refundable rate if your dates sit close to a wedding — plans move.",
      "Split long trips between a city and a coast rather than changing hotels every two nights.",
      "Compare flights with one connection against non-stops; the saving often funds a better room.",
    ],
    entries: [
      { slug: "paris", note: "Riverside walks, neighbourhood bistros and day trips to Champagne or Versailles." },
      { slug: "rome", note: "Open-air history, late dinners in Trastevere and easy trains to Tuscany or the Amalfi Coast." },
      { slug: "honolulu", note: "Beach mornings, volcano hikes and sunset dinners without leaving the country." },
      { slug: "cancun", note: "Adults-only coastal resorts, cenote swims and Mayan ruins within a morning's drive." },
      { slug: "lisbon", note: "Tiled streets, seafood and Sintra's palaces — Europe's best-value romantic city." },
      { slug: "athens", note: "Acropolis views at dinner, then a ferry to a quieter island for the second week." },
      { slug: "barcelona", note: "Architecture, beach and food within one walkable city." },
    ],
  },
  {
    slug: "adventure-and-outdoors",
    name: "Adventure & Outdoors",
    h1: "Best Adventure & Outdoor Travel Destinations",
    tagline: "Trailheads, rivers and national parks within reach of a major airport.",
    intro:
      "Adventure trips live or die on logistics: how far the trailhead is from the airport, whether you need a car, and how the weather behaves in your window. These destinations put serious hiking, climbing, rafting and wildlife within a short drive of a well-connected airport, so more of your days are spent outside.",
    bestFor: "hikers, climbers, skiers, paddlers and national-park road trippers",
    whatToExpect:
      "Most outdoor trips need a rental car and an early start. Altitude, snowmelt and wildfire season all shift what is open, so check park and trail conditions the week before you fly.",
    planningTips: [
      "Book the rental car as early as the flight — mountain and park-gateway fleets sell out first.",
      "Allow an acclimatisation day at high-altitude bases before a hard hike.",
      "Check park permit and shuttle systems; several popular trails now require timed entry.",
      "Fly mid-week: gateway airports for outdoor regions are busiest on Friday and Sunday.",
    ],
    entries: [
      { slug: "denver", note: "Rocky Mountain trailheads, fourteeners and ski resorts within two hours of the airport." },
      { slug: "salt-lake-city", note: "The shortest airport-to-slopes transfer in the US, plus red-rock parks to the south." },
      { slug: "seattle", note: "Base for Rainier, the Olympic peninsula and North Cascades hiking." },
      { slug: "portland", note: "Columbia River Gorge waterfalls, Mount Hood and the Oregon coast." },
      { slug: "cape-town", note: "Table Mountain hikes, shark and whale coastlines and wine-country cycling." },
      { slug: "sydney", note: "Blue Mountains bushwalks, coastal trails and world-class diving up the coast." },
    ],
  },
  {
    slug: "mountains-and-ski",
    name: "Mountains & Ski",
    h1: "Best Mountain & Ski Trip Destinations",
    tagline: "Snow in winter, alpine hiking the rest of the year.",
    intro:
      "Mountain destinations work twice a year: powder in winter, wildflowers and hiking in summer. The trick is picking a gateway airport with a short, reliable transfer to the slopes, because a long mountain drive after a delayed flight ruins a short trip. These gateways all sit close to serious terrain.",
    bestFor: "skiers, snowboarders and summer alpine hikers",
    whatToExpect:
      "Ski weeks work best Sunday to Sunday, when lift queues and lodging rates both dip. Summer visits are cheaper and quieter, with lifts running for hikers and bikers at many resorts.",
    planningTips: [
      "Fly in a day before your first ski day to absorb weather delays.",
      "Compare resort lodging against a valley-town hotel plus a rental car or shuttle.",
      "Check whether your airline carries ski bags free before paying for equipment rental.",
      "For summer trips, confirm which lifts and mountain roads are actually open in your month.",
    ],
    entries: [
      { slug: "salt-lake-city", note: "Multiple resorts within an hour, and some of the driest snow anywhere." },
      { slug: "denver", note: "The gateway to Colorado's resort corridor and high-alpine summer hiking." },
      { slug: "seattle", note: "Cascade volcanoes, glacier hikes and nearby ski areas." },
      { slug: "frankfurt", note: "Fast rail links to the German Alps, Black Forest and on to Austria and Switzerland." },
      { slug: "toronto", note: "Eastern Canadian skiing plus access to Ontario and Quebec mountain country." },
      { slug: "delhi", note: "The gateway to Himalayan hill stations, trekking valleys and mountain rail routes." },
    ],
  },
  {
    slug: "luxury-escapes",
    name: "Luxury Escapes",
    h1: "Best Luxury Travel Destinations",
    tagline: "Premium cabins, landmark hotels and service that earns the price.",
    intro:
      "Luxury travel is about density of quality: fewer moves, better rooms, shorter queues. These destinations deliver flagship hotels, fine dining and premium airline service on the routes that serve them. Compare premium-economy, business and first-class fares for your dates on Tripile — the gap between cabins varies enormously by route and season.",
    bestFor: "special occasions, premium-cabin travel and city-plus-resort itineraries",
    whatToExpect:
      "Expect a real difference between weekday business demand and weekend leisure pricing. Landmark hotels release their best suites months ahead, so book the room before the flight when a specific property matters.",
    planningTips: [
      "Price premium cabins on flexible dates — the same seat swings widely week to week.",
      "Book refundable hotel rates for peak dates, then re-check closer to travel.",
      "Combine a city stay with a resort second leg rather than moving hotels repeatedly.",
      "Confirm airport transfer, lounge and late-checkout details in writing before you fly.",
    ],
    entries: [
      { slug: "dubai", note: "Flagship hotels, desert resorts and some of the best premium-cabin service in the sky." },
      { slug: "paris", note: "Palace hotels, Michelin dining and shopping within one walkable centre." },
      { slug: "tokyo", note: "Skyline suites, obsessive service and the densest fine-dining scene anywhere." },
      { slug: "singapore", note: "Landmark hotels, rooftop pools and a flawless airport to arrive through." },
      { slug: "new-york", note: "Central Park suites, Broadway and dining that never runs out of options." },
      { slug: "london", note: "Historic five-star hotels, private clubs and world-class theatre and galleries." },
    ],
  },
  {
    slug: "budget-destinations",
    name: "Budget Destinations",
    h1: "Best Budget Travel Destinations",
    tagline: "Places where your daily spend goes furthest.",
    intro:
      "Budget travel is less about cheap flights than cheap days. A slightly pricier flight to a low-cost destination usually beats a bargain fare somewhere expensive, because food, transport and hotels dominate the total. These destinations keep daily costs low while still delivering big-ticket sights, and you can check live flight and hotel prices for your own dates on each one's page.",
    bestFor: "long trips, first-time backpackers and anyone stretching a fixed budget",
    whatToExpect:
      "Plan longer stays in fewer places — every move costs money. Street food, local transport and guesthouses are where the real savings sit, not in the flight.",
    planningTips: [
      "Compare the total trip cost, not just the fare: cheap days beat a cheap flight.",
      "Travel in shoulder season for lower hotel rates and thinner crowds.",
      "Stay a week or more per base to unlock weekly hotel and apartment rates.",
      "Book flights mid-week and avoid local festival dates, when rates spike.",
    ],
    entries: [
      { slug: "bangkok", note: "World-class street food, cheap transport and temples that cost next to nothing." },
      { slug: "mumbai", note: "Huge city energy, low daily costs and coastal day trips." },
      { slug: "delhi", note: "The base for India's Golden Triangle, with inexpensive rail links onward." },
      { slug: "istanbul", note: "Two continents, endless mosques and bazaars, and very affordable eating out." },
      { slug: "lisbon", note: "Western Europe's best value capital — trams, seafood and nearby beaches." },
      { slug: "athens", note: "Ancient sites plus cheap ferries to the islands out of high season." },
      { slug: "cancun", note: "Free public beaches, cheap collectivo transport and value beyond the resort strip." },
    ],
  },
  {
    slug: "family-friendly-destinations",
    name: "Family-Friendly Destinations",
    h1: "Best Family Vacation Destinations",
    tagline: "Short transfers, big attractions and hotels built for kids.",
    intro:
      "Family trips work when travel days are short and the attractions are close. These destinations pair non-stop flight options with family hotels, pools and attractions that suit a wide age range, so nobody spends the holiday in traffic. Compare family rooms and flight times for your dates before you commit.",
    bestFor: "families with children of any age, and multi-generation trips",
    whatToExpect:
      "Book the earliest or latest flights only if your children travel well. Plan one major attraction per day, and choose a hotel with a pool for the afternoon reset.",
    planningTips: [
      "Filter for non-stop flights first — connections are where family travel days unravel.",
      "Check the hotel's family-room occupancy limits before booking; they vary by country.",
      "Buy attraction tickets ahead for timed entry, then build the day around them.",
      "A rental car often beats taxis once you are travelling four or more.",
    ],
    entries: [
      { slug: "orlando", note: "The world's densest cluster of theme parks, with hotels built around them." },
      { slug: "san-diego", note: "Zoo, beaches, mild weather and an easy pace for younger children." },
      { slug: "tampa", note: "Theme parks plus calm Gulf beaches within a short drive." },
      { slug: "toronto", note: "Waterfront, science and aquarium attractions, and Niagara Falls as a day trip." },
      { slug: "singapore", note: "Safe, spotless and packed with family attractions on one small island." },
      { slug: "london", note: "Free world-class museums, parks and a transport system kids enjoy using." },
    ],
  },
  {
    slug: "city-breaks",
    name: "City Breaks",
    h1: "Best City Break Destinations",
    tagline: "Three or four nights, one walkable centre.",
    intro:
      "A city break is the highest-value trip you can take: short flights, no rental car and everything within walking or transit distance. These cities reward a long weekend — pick a central hotel, choose two or three anchors per day, and leave the rest to wandering.",
    bestFor: "long weekends, first-time visitors and culture-focused trips",
    whatToExpect:
      "Three to four nights covers a city's highlights. Staying central costs more per night but saves both transit time and taxi fares, which usually balances out.",
    planningTips: [
      "Fly out Thursday evening and back Monday morning for the cheapest long-weekend fares.",
      "Book a hotel within walking distance of a metro or subway line.",
      "Pre-book the one attraction with real queues; skip passes for the rest.",
      "Skip the rental car — city parking almost always costs more than transit.",
    ],
    entries: [
      { slug: "new-york", note: "Museums, neighbourhoods and theatre in one relentlessly walkable city." },
      { slug: "london", note: "Free museums, historic landmarks and day trips by fast train." },
      { slug: "paris", note: "Art, food and riverside walking within a compact centre." },
      { slug: "amsterdam", note: "Canals, Van Gogh and Rijksmuseum — and easiest explored by bike." },
      { slug: "chicago", note: "Architecture cruises, lakefront and a food scene that rivals the coasts." },
      { slug: "boston", note: "Colonial history, college neighbourhoods and short walks between them." },
      { slug: "philadelphia", note: "Founding-era landmarks, murals and outstanding market food." },
    ],
  },
  {
    slug: "food-and-culinary-travel",
    name: "Food & Culinary Travel",
    h1: "Best Food & Culinary Travel Destinations",
    tagline: "Trips planned around markets, street stalls and long dinners.",
    intro:
      "Food travel changes how you plan: you book around markets and opening days rather than monuments. These destinations reward a food-first itinerary, from street stalls to tasting menus, and each has plenty of central hotels so you can walk home after a long dinner.",
    bestFor: "food tours, market crawls and tasting-menu trips",
    whatToExpect:
      "Markets peak early; the best street food often appears after dark. Reserve any standout restaurant weeks ahead, and keep one meal a day unplanned.",
    planningTips: [
      "Stay central so late dinners don't need a taxi.",
      "Check market days — many close Sunday or Monday.",
      "Book a guided food walk for your first evening; it maps the city fast.",
      "Reserve tasting menus before booking the flight if a specific restaurant is the point of the trip.",
    ],
    entries: [
      { slug: "bangkok", note: "Street food at every hour, plus canal markets and a strong fine-dining scene." },
      { slug: "tokyo", note: "More top-rated restaurants than any other city, from standing sushi bars up." },
      { slug: "rome", note: "Neighbourhood trattorias, Testaccio market and Roman pasta done properly." },
      { slug: "new-orleans", note: "Creole and Cajun cooking, po'boys and a live-music soundtrack." },
      { slug: "istanbul", note: "Kebabs, mezze, Bosphorus fish sandwiches and the spice bazaar." },
      { slug: "mumbai", note: "Street chaat, Parsi cafés and coastal seafood in one city." },
      { slug: "seoul", note: "Barbecue, market stalls and late-night fried chicken and stews." },
    ],
  },
  {
    slug: "cultural-and-heritage-sites",
    name: "Cultural & Heritage Sites",
    h1: "Best Cultural & UNESCO Heritage Destinations",
    tagline: "Ancient sites, world museums and living historic centres.",
    intro:
      "Heritage travel needs a little more homework: opening hours, timed entry and how long each site really takes. These destinations put UNESCO-listed sites and major museums within reach of a central hotel, so you can see them early, beat the heat and the crowds, and still have afternoons free.",
    bestFor: "history, architecture and museum-led trips",
    whatToExpect:
      "Book the headline site for the first entry slot of the day. Many sites close one day a week and cut hours in winter, so confirm before you fix your dates.",
    planningTips: [
      "Buy timed-entry tickets for major sites as soon as your dates are fixed.",
      "Visit the biggest site first thing in the morning, then smaller ones after lunch.",
      "Check the weekly closing day for each museum before planning your days.",
      "A licensed local guide for the main site usually pays for itself in context.",
    ],
    entries: [
      { slug: "rome", note: "The Colosseum, Forum and Vatican museums inside one historic centre." },
      { slug: "athens", note: "The Acropolis, the Agora and the Acropolis Museum within walking distance." },
      { slug: "delhi", note: "Mughal forts and tombs, plus the Taj Mahal as a day trip by fast train." },
      { slug: "istanbul", note: "Hagia Sophia, the Blue Mosque and Topkapi Palace in one district." },
      { slug: "london", note: "The British Museum, Tower of London and Westminster, mostly free to enter." },
      { slug: "cancun", note: "Chichén Itzá, Tulum and Coba — Mayan heritage within day-trip range." },
      { slug: "tokyo", note: "Shrines and temples beside the world's largest metropolis." },
    ],
  },
  {
    slug: "weekend-getaways",
    name: "Weekend Getaways",
    h1: "Best Weekend Getaway Destinations",
    tagline: "Two or three nights, minimal planning, maximum change of scene.",
    intro:
      "A weekend getaway works best where the airport is close to the action and you need nothing booked but a hotel. These destinations are built for short trips: compact centres, plenty of non-stop flights and enough to do that two nights feel worth it.",
    bestFor: "two- to three-night trips, birthdays and short resets",
    whatToExpect:
      "Fly out Friday evening and back Sunday night or Monday morning. One booked plan per day is plenty — the rest of a weekend should stay loose.",
    planningTips: [
      "Look at Friday-evening and Monday-morning flights; they cost less than Saturday departures.",
      "Choose a hotel you can reach from the airport in under 45 minutes.",
      "Travel carry-on only — two nights never needs a checked bag.",
      "Book one anchor (a show, dinner or tour) and leave the rest unplanned.",
    ],
    entries: [
      { slug: "las-vegas", note: "Shows, dining and desert day trips, with cheap flights from most of the US." },
      { slug: "nashville", note: "Live music every night of the week and a walkable downtown." },
      { slug: "new-orleans", note: "Food, jazz and the French Quarter — perfect for two nights." },
      { slug: "austin", note: "Music venues, food trucks and swimming holes in one compact city." },
      { slug: "san-diego", note: "Beaches, breweries and mild weather all year." },
      { slug: "miami", note: "Beach plus nightlife with short flights from the eastern US." },
    ],
  },
];

const bySlug = new Map(travelCollections.map((c) => [c.slug, c]));
const destBySlug = new Map(popularDestinations.map((d) => [d.slug, d]));

export function getTravelCollection(slug?: string): TravelCollection | undefined {
  if (!slug) return undefined;
  return bySlug.get(slug);
}

export interface CollectionDestination extends CollectionEntry {
  dest: Destination;
}

export interface TravelCollectionView {
  collection: TravelCollection;
  destinations: CollectionDestination[];
  faqs: FaqItem[];
  keywords: string;
  related: RelatedLink[];
}

/** Only destinations that really exist in the catalog are ever linked. */
export function collectionDestinations(c: TravelCollection): CollectionDestination[] {
  return c.entries
    .map((e) => {
      const dest = destBySlug.get(e.slug);
      return dest ? { ...e, dest } : undefined;
    })
    .filter((e): e is CollectionDestination => !!e);
}

export function generateCollectionFaqs(c: TravelCollection, dests: CollectionDestination[]): FaqItem[] {
  const names = dests.slice(0, 4).map((d) => d.dest.city).join(", ");
  return [
    {
      question: `What are the best ${c.name.toLowerCase()} destinations?`,
      answer: `Popular picks include ${names}. Each has its own Tripile page with live flight and hotel prices, so you can compare them for your exact dates.`,
    },
    {
      question: `How do I build a ${c.name.toLowerCase()} package on Tripile?`,
      answer: `Search flights for your dates first, then add a hotel in the same destination and a rental car if you need one. Tripile shows each element's live price and cancellation terms before checkout, so you build the package yourself instead of paying for a fixed bundle.`,
    },
    {
      question: `When is the cheapest time to book a ${c.name.toLowerCase()} trip?`,
      answer: `Shoulder season — the weeks either side of peak — is almost always the best value. Search with flexible dates and compare mid-week departures, which are usually cheaper than weekend ones.`,
    },
    {
      question: `Who are these ${c.name.toLowerCase()} ideas best suited to?`,
      answer: `This collection suits ${c.bestFor}. ${c.whatToExpect}`,
    },
  ];
}

export function buildTravelCollection(c: TravelCollection): TravelCollectionView {
  const destinations = collectionDestinations(c);
  const others = travelCollections.filter((o) => o.slug !== c.slug).slice(0, 4);

  const related: RelatedLink[] = [
    ...destinations.slice(0, 4).map((d) => ({
      label: `${d.dest.city} Travel Guide`,
      href: `/travel-guide/${d.dest.slug}`,
      sublabel: "Things to do & best time to visit",
    })),
    ...others.map((o) => ({
      label: o.name,
      href: `/travel-collections/${o.slug}`,
      sublabel: "Travel collection",
    })),
    { label: "All travel guides", href: "/travel-guides", sublabel: "Cities & countries" },
  ].slice(0, 9);

  return {
    collection: c,
    destinations,
    faqs: generateCollectionFaqs(c, destinations),
    keywords: [
      `best ${c.name.toLowerCase()}`,
      `${c.name.toLowerCase()} destinations`,
      `${c.name.toLowerCase()} packages`,
      `where to go for a ${c.name.toLowerCase().replace(/s$/, "")}`,
      "travel collections",
    ].join(", "),
    related,
  };
}
