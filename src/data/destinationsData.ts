// Popular destinations with IATA codes for dynamic flight pages
export interface Destination {
  city: string;
  slug: string;
  iataCode: string;
  country: string;
  type: "domestic" | "international";
}

export const popularDestinations: Destination[] = [
  // Top Domestic
  { city: "New York", slug: "new-york", iataCode: "JFK", country: "US", type: "domestic" },
  { city: "Los Angeles", slug: "los-angeles", iataCode: "LAX", country: "US", type: "domestic" },
  { city: "Chicago", slug: "chicago", iataCode: "ORD", country: "US", type: "domestic" },
  { city: "Miami", slug: "miami", iataCode: "MIA", country: "US", type: "domestic" },
  { city: "San Francisco", slug: "san-francisco", iataCode: "SFO", country: "US", type: "domestic" },
  { city: "Las Vegas", slug: "las-vegas", iataCode: "LAS", country: "US", type: "domestic" },
  { city: "Orlando", slug: "orlando", iataCode: "MCO", country: "US", type: "domestic" },
  { city: "Atlanta", slug: "atlanta", iataCode: "ATL", country: "US", type: "domestic" },
  { city: "Dallas", slug: "dallas", iataCode: "DFW", country: "US", type: "domestic" },
  { city: "Denver", slug: "denver", iataCode: "DEN", country: "US", type: "domestic" },
  { city: "Seattle", slug: "seattle", iataCode: "SEA", country: "US", type: "domestic" },
  { city: "Boston", slug: "boston", iataCode: "BOS", country: "US", type: "domestic" },
  { city: "Houston", slug: "houston", iataCode: "IAH", country: "US", type: "domestic" },
  { city: "Phoenix", slug: "phoenix", iataCode: "PHX", country: "US", type: "domestic" },
  { city: "Nashville", slug: "nashville", iataCode: "BNA", country: "US", type: "domestic" },
  { city: "San Diego", slug: "san-diego", iataCode: "SAN", country: "US", type: "domestic" },
  { city: "Tampa", slug: "tampa", iataCode: "TPA", country: "US", type: "domestic" },
  { city: "Portland", slug: "portland", iataCode: "PDX", country: "US", type: "domestic" },
  { city: "Minneapolis", slug: "minneapolis", iataCode: "MSP", country: "US", type: "domestic" },
  { city: "Detroit", slug: "detroit", iataCode: "DTW", country: "US", type: "domestic" },
  { city: "Philadelphia", slug: "philadelphia", iataCode: "PHL", country: "US", type: "domestic" },
  { city: "Charlotte", slug: "charlotte", iataCode: "CLT", country: "US", type: "domestic" },
  { city: "Salt Lake City", slug: "salt-lake-city", iataCode: "SLC", country: "US", type: "domestic" },
  { city: "Honolulu", slug: "honolulu", iataCode: "HNL", country: "US", type: "domestic" },
  { city: "Fort Lauderdale", slug: "fort-lauderdale", iataCode: "FLL", country: "US", type: "domestic" },
  { city: "Washington DC", slug: "washington-dc", iataCode: "IAD", country: "US", type: "domestic" },
  { city: "Baltimore", slug: "baltimore", iataCode: "BWI", country: "US", type: "domestic" },
  { city: "Austin", slug: "austin", iataCode: "AUS", country: "US", type: "domestic" },
  { city: "Raleigh", slug: "raleigh", iataCode: "RDU", country: "US", type: "domestic" },
  { city: "New Orleans", slug: "new-orleans", iataCode: "MSY", country: "US", type: "domestic" },

  // Top International
  { city: "London", slug: "london", iataCode: "LHR", country: "UK", type: "international" },
  { city: "Paris", slug: "paris", iataCode: "CDG", country: "France", type: "international" },
  { city: "Tokyo", slug: "tokyo", iataCode: "NRT", country: "Japan", type: "international" },
  { city: "Dubai", slug: "dubai", iataCode: "DXB", country: "UAE", type: "international" },
  { city: "Cancun", slug: "cancun", iataCode: "CUN", country: "Mexico", type: "international" },
  { city: "Barcelona", slug: "barcelona", iataCode: "BCN", country: "Spain", type: "international" },
  { city: "Rome", slug: "rome", iataCode: "FCO", country: "Italy", type: "international" },
  { city: "Amsterdam", slug: "amsterdam", iataCode: "AMS", country: "Netherlands", type: "international" },
  { city: "Bangkok", slug: "bangkok", iataCode: "BKK", country: "Thailand", type: "international" },
  { city: "Toronto", slug: "toronto", iataCode: "YYZ", country: "Canada", type: "international" },
  { city: "Sydney", slug: "sydney", iataCode: "SYD", country: "Australia", type: "international" },
  { city: "Frankfurt", slug: "frankfurt", iataCode: "FRA", country: "Germany", type: "international" },
  { city: "Singapore", slug: "singapore", iataCode: "SIN", country: "Singapore", type: "international" },
  { city: "Istanbul", slug: "istanbul", iataCode: "IST", country: "Turkey", type: "international" },
  { city: "Seoul", slug: "seoul", iataCode: "ICN", country: "South Korea", type: "international" },
  { city: "Mumbai", slug: "mumbai", iataCode: "BOM", country: "India", type: "international" },
  { city: "Delhi", slug: "delhi", iataCode: "DEL", country: "India", type: "international" },
  { city: "Cape Town", slug: "cape-town", iataCode: "CPT", country: "South Africa", type: "international" },
  { city: "Athens", slug: "athens", iataCode: "ATH", country: "Greece", type: "international" },
  { city: "Lisbon", slug: "lisbon", iataCode: "LIS", country: "Portugal", type: "international" },
];

export interface AirlineInfo {
  name: string;
  slug: string;
  code: string;
  country: string;
  popular?: boolean;
}

export const airlinesData: AirlineInfo[] = [
  { name: "Air Canada", slug: "air-canada", code: "AC", country: "Canada" },
  { name: "Air France", slug: "air-france", code: "AF", country: "France" },
  { name: "Air India", slug: "air-india", code: "AI", country: "India" },
  { name: "Alaska Airlines", slug: "alaska-airlines", code: "AS", country: "US", popular: true },
  { name: "Allegiant Air", slug: "allegiant-air", code: "G4", country: "US" },
  { name: "American Airlines", slug: "american-airlines", code: "AA", country: "US", popular: true },
  { name: "ANA", slug: "ana", code: "NH", country: "Japan" },
  { name: "Breeze Airways", slug: "breeze-airways", code: "MX", country: "US" },
  { name: "British Airways", slug: "british-airways", code: "BA", country: "UK", popular: true },
  { name: "Cathay Pacific", slug: "cathay-pacific", code: "CX", country: "Hong Kong" },
  { name: "Delta Air Lines", slug: "delta-air-lines", code: "DL", country: "US", popular: true },
  { name: "EasyJet", slug: "easyjet", code: "U2", country: "UK" },
  { name: "Emirates", slug: "emirates", code: "EK", country: "UAE", popular: true },
  { name: "Etihad Airways", slug: "etihad-airways", code: "EY", country: "UAE" },
  { name: "Frontier Airlines", slug: "frontier-airlines", code: "F9", country: "US" },
  { name: "Hawaiian Airlines", slug: "hawaiian-airlines", code: "HA", country: "US" },
  { name: "Iberia", slug: "iberia", code: "IB", country: "Spain" },
  { name: "Japan Airlines", slug: "japan-airlines", code: "JL", country: "Japan" },
  { name: "JetBlue Airways", slug: "jetblue-airways", code: "B6", country: "US", popular: true },
  { name: "KLM", slug: "klm", code: "KL", country: "Netherlands" },
  { name: "Korean Air", slug: "korean-air", code: "KE", country: "South Korea" },
  { name: "LATAM Airlines", slug: "latam-airlines", code: "LA", country: "Chile" },
  { name: "Lufthansa", slug: "lufthansa", code: "LH", country: "Germany", popular: true },
  { name: "Qatar Airways", slug: "qatar-airways", code: "QR", country: "Qatar", popular: true },
  { name: "Ryanair", slug: "ryanair", code: "FR", country: "Ireland" },
  { name: "Singapore Airlines", slug: "singapore-airlines", code: "SQ", country: "Singapore", popular: true },
  { name: "Southwest Airlines", slug: "southwest-airlines", code: "WN", country: "US", popular: true },
  { name: "Spirit Airlines", slug: "spirit-airlines", code: "NK", country: "US" },
  { name: "Sun Country Airlines", slug: "sun-country-airlines", code: "SY", country: "US" },
  { name: "Thai Airways", slug: "thai-airways", code: "TG", country: "Thailand" },
  { name: "Turkish Airlines", slug: "turkish-airlines", code: "TK", country: "Turkey", popular: true },
  { name: "United Airlines", slug: "united-airlines", code: "UA", country: "US", popular: true },
  { name: "WestJet", slug: "westjet", code: "WS", country: "Canada" },
];

export interface StateAirportGroup {
  state: string;
  slug: string;
  airports: Destination[];
}

export const usaStateAirports: StateAirportGroup[] = [
  {
    state: "Texas",
    slug: "texas",
    airports: [
      { city: "Dallas-Fort Worth", slug: "dallas-fort-worth", iataCode: "DFW", country: "US", type: "international" },
      { city: "Houston", slug: "houston", iataCode: "IAH", country: "US", type: "international" },
      { city: "Dallas", slug: "dallas-love-field", iataCode: "DAL", country: "US", type: "domestic" },
      { city: "Austin", slug: "austin", iataCode: "AUS", country: "US", type: "international" },
      { city: "Houston", slug: "houston-hobby", iataCode: "HOU", country: "US", type: "domestic" },
      { city: "San Antonio", slug: "san-antonio", iataCode: "SAT", country: "US", type: "international" },

      { city: "El Paso", slug: "el-paso", iataCode: "ELP", country: "US", type: "domestic" },
      { city: "Midland", slug: "midland", iataCode: "MAF", country: "US", type: "domestic" },
      { city: "Lubbock", slug: "lubbock", iataCode: "LBB", country: "US", type: "domestic" },
      { city: "McAllen", slug: "mcallen", iataCode: "MFE", country: "US", type: "domestic" },
      { city: "Amarillo", slug: "amarillo", iataCode: "AMA", country: "US", type: "domestic" },
      { city: "Corpus Christi", slug: "corpus-christi", iataCode: "CRP", country: "US", type: "domestic" },
      { city: "Harlingen", slug: "harlingen", iataCode: "HRL", country: "US", type: "domestic" },
      { city: "Killeen", slug: "killeen", iataCode: "GRK", country: "US", type: "domestic" },
      { city: "Brownsville", slug: "brownsville", iataCode: "BRO", country: "US", type: "domestic" },
      { city: "Laredo", slug: "laredo", iataCode: "LRD", country: "US", type: "domestic" },

      { city: "Abilene", slug: "abilene", iataCode: "ABI", country: "US", type: "domestic" },
      { city: "College Station", slug: "college-station", iataCode: "CLL", country: "US", type: "domestic" },
      { city: "Waco", slug: "waco", iataCode: "ACT", country: "US", type: "domestic" },
      { city: "San Angelo", slug: "san-angelo", iataCode: "SJT", country: "US", type: "domestic" },
      { city: "Tyler", slug: "tyler", iataCode: "TYR", country: "US", type: "domestic" },
      { city: "Wichita Falls", slug: "wichita-falls", iataCode: "SPS", country: "US", type: "domestic" },
      { city: "Beaumont", slug: "beaumont", iataCode: "BPT", country: "US", type: "domestic" },
      { city: "Longview", slug: "longview", iataCode: "GGG", country: "US", type: "domestic" },
      { city: "Texarkana", slug: "texarkana", iataCode: "TXK", country: "US", type: "domestic" },
    ],
  },
  {
    state: "California",
    slug: "california",
    airports: [
      { city: "Los Angeles", slug: "los-angeles", iataCode: "LAX", country: "US", type: "international" },
      { city: "San Francisco", slug: "san-francisco", iataCode: "SFO", country: "US", type: "international" },
      { city: "San Diego", slug: "san-diego", iataCode: "SAN", country: "US", type: "international" },
      { city: "San Jose", slug: "san-jose", iataCode: "SJC", country: "US", type: "international" },
      { city: "Oakland", slug: "oakland", iataCode: "OAK", country: "US", type: "domestic" },
      { city: "Sacramento", slug: "sacramento", iataCode: "SMF", country: "US", type: "domestic" },
      { city: "Orange County", slug: "orange-county", iataCode: "SNA", country: "US", type: "domestic" },
      { city: "Burbank", slug: "burbank", iataCode: "BUR", country: "US", type: "domestic" },
      { city: "Ontario", slug: "ontario", iataCode: "ONT", country: "US", type: "domestic" },
      { city: "Long Beach", slug: "long-beach", iataCode: "LGB", country: "US", type: "domestic" },
      { city: "Palm Springs", slug: "palm-springs", iataCode: "PSP", country: "US", type: "domestic" },
      { city: "Santa Barbara", slug: "santa-barbara", iataCode: "SBA", country: "US", type: "domestic" },
      { city: "Fresno", slug: "fresno", iataCode: "FAT", country: "US", type: "domestic" },
      { city: "Bakersfield", slug: "bakersfield", iataCode: "BFL", country: "US", type: "domestic" },
      { city: "Santa Rosa", slug: "santa-rosa", iataCode: "STS", country: "US", type: "domestic" },
      { city: "Monterey", slug: "monterey", iataCode: "MRY", country: "US", type: "domestic" },
      { city: "San Luis Obispo", slug: "san-luis-obispo", iataCode: "SBP", country: "US", type: "domestic" },
      { city: "Redding", slug: "redding", iataCode: "RDD", country: "US", type: "domestic" },
      { city: "Mammoth Lakes", slug: "mammoth-lakes", iataCode: "MMH", country: "US", type: "domestic" },
      { city: "Arcata", slug: "arcata", iataCode: "ACV", country: "US", type: "domestic" },
    ],
  },
  {
    state: "Florida",
    slug: "florida",
    airports: [
      { city: "Miami", slug: "miami", iataCode: "MIA", country: "US", type: "international" },
      { city: "Orlando", slug: "orlando", iataCode: "MCO", country: "US", type: "international" },
      { city: "Fort Lauderdale", slug: "fort-lauderdale", iataCode: "FLL", country: "US", type: "international" },
      { city: "Tampa", slug: "tampa", iataCode: "TPA", country: "US", type: "international" },
      { city: "Jacksonville", slug: "jacksonville", iataCode: "JAX", country: "US", type: "domestic" },
      { city: "West Palm Beach", slug: "west-palm-beach", iataCode: "PBI", country: "US", type: "domestic" },
      { city: "Fort Myers", slug: "fort-myers", iataCode: "RSW", country: "US", type: "domestic" },
      { city: "Sarasota", slug: "sarasota", iataCode: "SRQ", country: "US", type: "domestic" },
      { city: "Pensacola", slug: "pensacola", iataCode: "PNS", country: "US", type: "domestic" },
      { city: "Daytona Beach", slug: "daytona-beach", iataCode: "DAB", country: "US", type: "domestic" },
      { city: "Key West", slug: "key-west", iataCode: "EYW", country: "US", type: "domestic" },
      { city: "Tallahassee", slug: "tallahassee", iataCode: "TLH", country: "US", type: "domestic" },
      { city: "Gainesville", slug: "gainesville", iataCode: "GNV", country: "US", type: "domestic" },
      { city: "Melbourne", slug: "melbourne-fl", iataCode: "MLB", country: "US", type: "domestic" },
      { city: "Panama City", slug: "panama-city-fl", iataCode: "ECP", country: "US", type: "domestic" },
      { city: "St. Petersburg", slug: "st-petersburg", iataCode: "PIE", country: "US", type: "domestic" },
      { city: "Punta Gorda", slug: "punta-gorda", iataCode: "PGD", country: "US", type: "domestic" },
      { city: "Orlando Sanford", slug: "orlando-sanford", iataCode: "SFB", country: "US", type: "domestic" },
    ],
  },
  {
    state: "New York",
    slug: "new-york",
    airports: [
      { city: "New York JFK", slug: "new-york-jfk", iataCode: "JFK", country: "US", type: "international" },
      { city: "New York LaGuardia", slug: "new-york-lga", iataCode: "LGA", country: "US", type: "domestic" },
      { city: "Newark", slug: "newark", iataCode: "EWR", country: "US", type: "international" },
      { city: "Buffalo", slug: "buffalo", iataCode: "BUF", country: "US", type: "domestic" },
      { city: "Rochester", slug: "rochester", iataCode: "ROC", country: "US", type: "domestic" },
      { city: "Syracuse", slug: "syracuse", iataCode: "SYR", country: "US", type: "domestic" },
      { city: "Albany", slug: "albany", iataCode: "ALB", country: "US", type: "domestic" },
      { city: "Islip", slug: "islip", iataCode: "ISP", country: "US", type: "domestic" },
      { city: "White Plains", slug: "white-plains", iataCode: "HPN", country: "US", type: "domestic" },
      { city: "Newburgh", slug: "newburgh", iataCode: "SWF", country: "US", type: "domestic" },
      { city: "Ithaca", slug: "ithaca", iataCode: "ITH", country: "US", type: "domestic" },
      { city: "Binghamton", slug: "binghamton", iataCode: "BGM", country: "US", type: "domestic" },
      { city: "Elmira", slug: "elmira", iataCode: "ELM", country: "US", type: "domestic" },
      { city: "Plattsburgh", slug: "plattsburgh", iataCode: "PBG", country: "US", type: "domestic" },
      { city: "Watertown", slug: "watertown", iataCode: "ART", country: "US", type: "domestic" },
    ],
  },
  {
    state: "Illinois",
    slug: "illinois",
    airports: [
      { city: "Chicago O'Hare", slug: "chicago-ohare", iataCode: "ORD", country: "US", type: "international" },
      { city: "Chicago Midway", slug: "chicago-midway", iataCode: "MDW", country: "US", type: "domestic" },
      { city: "Rockford", slug: "rockford", iataCode: "RFD", country: "US", type: "domestic" },
      { city: "Peoria", slug: "peoria", iataCode: "PIA", country: "US", type: "domestic" },
      { city: "Springfield", slug: "springfield-il", iataCode: "SPI", country: "US", type: "domestic" },
      { city: "Champaign", slug: "champaign", iataCode: "CMI", country: "US", type: "domestic" },
      { city: "Bloomington", slug: "bloomington-il", iataCode: "BMI", country: "US", type: "domestic" },
      { city: "Moline", slug: "moline", iataCode: "MLI", country: "US", type: "domestic" },
      { city: "Belleville", slug: "belleville", iataCode: "BLV", country: "US", type: "domestic" },
      { city: "Marion", slug: "marion-il", iataCode: "MWA", country: "US", type: "domestic" },
      { city: "Decatur", slug: "decatur", iataCode: "DEC", country: "US", type: "domestic" },
      { city: "Quincy", slug: "quincy-il", iataCode: "UIN", country: "US", type: "domestic" },
    ],
  },
  {
    state: "Georgia",
    slug: "georgia",
    airports: [
      { city: "Atlanta", slug: "atlanta", iataCode: "ATL", country: "US", type: "international" },
      { city: "Savannah", slug: "savannah", iataCode: "SAV", country: "US", type: "domestic" },
      { city: "Augusta", slug: "augusta", iataCode: "AGS", country: "US", type: "domestic" },
      { city: "Columbus", slug: "columbus-ga", iataCode: "CSG", country: "US", type: "domestic" },
      { city: "Macon", slug: "macon", iataCode: "MCN", country: "US", type: "domestic" },
      { city: "Albany", slug: "albany-ga", iataCode: "ABY", country: "US", type: "domestic" },
      { city: "Brunswick", slug: "brunswick", iataCode: "BQK", country: "US", type: "domestic" },
      { city: "Valdosta", slug: "valdosta", iataCode: "VLD", country: "US", type: "domestic" },
      { city: "Athens", slug: "athens-ga", iataCode: "AHN", country: "US", type: "domestic" },
    ],
  },
  {
    state: "Washington",
    slug: "washington",
    airports: [
      { city: "Seattle-Tacoma", slug: "seattle-tacoma", iataCode: "SEA", country: "US", type: "international" },
      { city: "Spokane", slug: "spokane", iataCode: "GEG", country: "US", type: "domestic" },
      { city: "Bellingham", slug: "bellingham", iataCode: "BLI", country: "US", type: "domestic" },
      { city: "Pasco", slug: "pasco", iataCode: "PSC", country: "US", type: "domestic" },
      { city: "Wenatchee", slug: "wenatchee", iataCode: "EAT", country: "US", type: "domestic" },
      { city: "Yakima", slug: "yakima", iataCode: "YKM", country: "US", type: "domestic" },
      { city: "Walla Walla", slug: "walla-walla", iataCode: "ALW", country: "US", type: "domestic" },
      { city: "Pullman", slug: "pullman", iataCode: "PUW", country: "US", type: "domestic" },
      { city: "Friday Harbor", slug: "friday-harbor", iataCode: "FRD", country: "US", type: "domestic" },
      { city: "Port Angeles", slug: "port-angeles", iataCode: "CLM", country: "US", type: "domestic" },
    ],
  },
];

// Legacy compat
export const airlines = airlinesData.map((a) => a.name);

export function getAirlineBySlug(slug: string): AirlineInfo | undefined {
  return airlinesData.find((a) => a.slug === slug);
}

export function getDestinationBySlug(slug: string): Destination | undefined {
  // Direct slug match first
  const direct = popularDestinations.find((d) => d.slug === slug);
  if (direct) return direct;

  // Fuzzy match: try matching by country name (e.g., "india" -> Delhi)
  const normalized = slug.replace(/-/g, " ").toLowerCase();
  const byCountry = popularDestinations.find((d) => d.country.toLowerCase() === normalized);
  if (byCountry) return byCountry;

  // Try partial city name match
  return popularDestinations.find(
    (d) => d.city.toLowerCase().includes(normalized) || normalized.includes(d.city.toLowerCase()),
  );
}
