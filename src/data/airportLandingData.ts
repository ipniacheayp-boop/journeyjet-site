// Airport Landing Page Data
// Easy to populate from CSV/JSON for bulk generation

export interface AirportLandingData {
  // Primary identifiers
  slug: string; // URL slug: "abilene-tx-abi"
  cityName: string; // "Abilene"
  stateName: string; // "Texas"
  stateCode: string; // "TX"
  airportCode: string; // "ABI"
  airportName: string; // "Abilene Regional Airport"
  
  // Pricing & Routes
  samplePrice: number; // Starting price in USD
  sampleRoute: string; // "Dallas (DFW)"
  popularDestinations: Array<{
    city: string;
    code: string;
    price: number;
  }>;
  
  // Content
  destinationImage: string; // Hero image URL
  description: string; // SEO description
  highlights: string[]; // Key selling points
  
  // Airlines & Stats
  popularAirlines: string[];
  averageFlightTime: string; // To major hub
  nearbyAirports: Array<{
    name: string;
    code: string;
    distance: string;
  }>;
  
  // FAQs
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  
  // Meta
  region: 'domestic' | 'international';
  timezone: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Sample data - can be bulk imported from CSV/JSON
export const airportLandingPages: AirportLandingData[] = [
  {
    slug: "abilene-tx-abi",
    cityName: "Abilene",
    stateName: "Texas",
    stateCode: "TX",
    airportCode: "ABI",
    airportName: "Abilene Regional Airport",
    samplePrice: 149,
    sampleRoute: "Dallas (DFW)",
    popularDestinations: [
      { city: "Dallas", code: "DFW", price: 149 },
      { city: "Houston", code: "IAH", price: 189 },
      { city: "Denver", code: "DEN", price: 229 },
      { city: "Los Angeles", code: "LAX", price: 299 },
      { city: "Chicago", code: "ORD", price: 279 },
      { city: "New York", code: "JFK", price: 349 },
    ],
    destinationImage: "/deal-nyc.jpg",
    description: "Find cheap flights from Abilene Regional Airport (ABI). Compare prices, airlines, and book your next trip from Abilene, Texas at the lowest fares.",
    highlights: [
      "Direct flights to Dallas/Fort Worth",
      "Convenient regional airport with easy parking",
      "Multiple daily departures to major hubs",
      "Competitive fares on American Eagle",
    ],
    popularAirlines: ["American Eagle", "United Express"],
    averageFlightTime: "1h 10m",
    nearbyAirports: [
      { name: "Dallas/Fort Worth International", code: "DFW", distance: "180 miles" },
      { name: "Midland International", code: "MAF", distance: "150 miles" },
      { name: "Lubbock Preston Smith", code: "LBB", distance: "165 miles" },
    ],
    faqs: [
      {
        question: "What airlines fly out of Abilene Regional Airport?",
        answer: "Abilene Regional Airport (ABI) is primarily served by American Eagle, offering connections through Dallas/Fort Worth (DFW) to destinations worldwide.",
      },
      {
        question: "How far is Abilene airport from downtown?",
        answer: "Abilene Regional Airport is located approximately 6 miles southeast of downtown Abilene, about a 15-minute drive.",
      },
      {
        question: "What is the cheapest month to fly from Abilene?",
        answer: "Generally, January through March offer the lowest fares from Abilene, with prices often 20-30% lower than peak summer months.",
      },
      {
        question: "Does Abilene airport have direct flights?",
        answer: "Yes, Abilene Regional Airport offers direct flights to Dallas/Fort Worth International Airport (DFW), with multiple daily departures.",
      },
    ],
    region: "domestic",
    timezone: "America/Chicago",
    coordinates: { lat: 32.4113, lng: -99.6819 },
  },
  {
    slug: "albany-ny-alb",
    cityName: "Albany",
    stateName: "New York",
    stateCode: "NY",
    airportCode: "ALB",
    airportName: "Albany International Airport",
    samplePrice: 129,
    sampleRoute: "Chicago (ORD)",
    popularDestinations: [
      { city: "Chicago", code: "ORD", price: 129 },
      { city: "Orlando", code: "MCO", price: 159 },
      { city: "Fort Lauderdale", code: "FLL", price: 149 },
      { city: "Atlanta", code: "ATL", price: 169 },
      { city: "Charlotte", code: "CLT", price: 139 },
      { city: "Detroit", code: "DTW", price: 119 },
    ],
    destinationImage: "/deal-nyc.jpg",
    description: "Book cheap flights from Albany International Airport (ALB). Compare airline prices and find the best deals on flights from Albany, New York.",
    highlights: [
      "Major airlines including Southwest, Delta, United",
      "Direct flights to 20+ destinations",
      "Convenient Capital Region location",
      "Free parking available",
    ],
    popularAirlines: ["Southwest", "Delta", "United", "American", "JetBlue"],
    averageFlightTime: "2h 15m",
    nearbyAirports: [
      { name: "JFK International", code: "JFK", distance: "150 miles" },
      { name: "Newark Liberty", code: "EWR", distance: "160 miles" },
      { name: "Burlington International", code: "BTV", distance: "95 miles" },
    ],
    faqs: [
      {
        question: "What airlines fly from Albany International Airport?",
        answer: "Albany Airport is served by major carriers including Southwest, Delta, United, American, JetBlue, Frontier, and Allegiant Air.",
      },
      {
        question: "What are the most popular destinations from Albany?",
        answer: "Popular destinations include Orlando, Fort Lauderdale, Chicago, Atlanta, Charlotte, and various Florida beach destinations.",
      },
      {
        question: "Is parking free at Albany Airport?",
        answer: "Albany Airport offers multiple parking options including economy lots with competitive rates. The first 30 minutes in the short-term lot are free.",
      },
      {
        question: "How early should I arrive at Albany Airport?",
        answer: "For domestic flights, arrive 2 hours before departure. For international connections, arrive 3 hours early.",
      },
    ],
    region: "domestic",
    timezone: "America/New_York",
    coordinates: { lat: 42.7483, lng: -73.8017 },
  },
  {
    slug: "albuquerque-nm-abq",
    cityName: "Albuquerque",
    stateName: "New Mexico",
    stateCode: "NM",
    airportCode: "ABQ",
    airportName: "Albuquerque International Sunport",
    samplePrice: 99,
    sampleRoute: "Phoenix (PHX)",
    popularDestinations: [
      { city: "Phoenix", code: "PHX", price: 99 },
      { city: "Denver", code: "DEN", price: 119 },
      { city: "Dallas", code: "DFW", price: 139 },
      { city: "Las Vegas", code: "LAS", price: 129 },
      { city: "Los Angeles", code: "LAX", price: 149 },
      { city: "Seattle", code: "SEA", price: 189 },
    ],
    destinationImage: "/deal-beach.jpg",
    description: "Discover cheap flights from Albuquerque International Sunport (ABQ). Find low fares on flights from Albuquerque, New Mexico to top destinations.",
    highlights: [
      "Southwest Airlines hub with frequent flights",
      "Direct service to 25+ cities",
      "Beautiful Southwestern architecture",
      "Quick security lines",
    ],
    popularAirlines: ["Southwest", "American", "United", "Delta", "Frontier"],
    averageFlightTime: "1h 45m",
    nearbyAirports: [
      { name: "Santa Fe Regional", code: "SAF", distance: "60 miles" },
      { name: "El Paso International", code: "ELP", distance: "270 miles" },
      { name: "Phoenix Sky Harbor", code: "PHX", distance: "450 miles" },
    ],
    faqs: [
      {
        question: "Why is it called the Sunport?",
        answer: "The nickname 'Sunport' reflects Albuquerque's sunny climate and the airport's role as a major transportation gateway in the Southwest.",
      },
      {
        question: "Which airlines have the most flights from Albuquerque?",
        answer: "Southwest Airlines operates the most flights from ABQ, followed by American Airlines, United, and Delta.",
      },
      {
        question: "What is the cheapest destination from Albuquerque?",
        answer: "Phoenix (PHX) and Denver (DEN) typically offer the lowest fares from Albuquerque, often under $100 one-way.",
      },
      {
        question: "Does Albuquerque airport have international flights?",
        answer: "While ABQ primarily serves domestic destinations, you can connect to international flights through major hubs like Dallas, Denver, or Los Angeles.",
      },
    ],
    region: "domestic",
    timezone: "America/Denver",
    coordinates: { lat: 35.0402, lng: -106.6090 },
  },
];

// Utility function to generate slug from city and airport code
export const generateAirportSlug = (
  cityName: string,
  stateCode: string,
  airportCode: string
): string => {
  return `${cityName.toLowerCase().replace(/\s+/g, '-')}-${stateCode.toLowerCase()}-${airportCode.toLowerCase()}`;
};

// Utility to import from CSV/JSON format
export const importAirportsFromJSON = (
  jsonData: Array<{
    city: string;
    state: string;
    stateCode: string;
    airportCode: string;
    airportName: string;
    samplePrice?: number;
    sampleRoute?: string;
    image?: string;
  }>
): Partial<AirportLandingData>[] => {
  return jsonData.map((airport) => ({
    slug: generateAirportSlug(airport.city, airport.stateCode, airport.airportCode),
    cityName: airport.city,
    stateName: airport.state,
    stateCode: airport.stateCode,
    airportCode: airport.airportCode,
    airportName: airport.airportName,
    samplePrice: airport.samplePrice || 199,
    sampleRoute: airport.sampleRoute || "Major Hub",
    destinationImage: airport.image || "/deal-nyc.jpg",
    description: `Find cheap flights from ${airport.airportName} (${airport.airportCode}). Compare prices and book affordable flights from ${airport.city}, ${airport.state}.`,
    highlights: [
      `Flights from ${airport.city}`,
      "Compare airline prices",
      "Best fare guarantee",
      "24/7 customer support",
    ],
    popularAirlines: ["American", "Delta", "United", "Southwest"],
    region: "domestic" as const,
  }));
};

// Get all airport landing page slugs for sitemap
export const getAllAirportSlugs = (): string[] => {
  return airportLandingPages.map((a) => `/cheap-flights-from-${a.slug}`);
};

// Find airport by slug
export const findAirportBySlug = (
  slug: string
): AirportLandingData | undefined => {
  return airportLandingPages.find((a) => a.slug === slug);
};
