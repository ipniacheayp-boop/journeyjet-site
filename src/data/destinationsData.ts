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

// Legacy compat
export const airlines = airlinesData.map(a => a.name);

export function getAirlineBySlug(slug: string): AirlineInfo | undefined {
  return airlinesData.find(a => a.slug === slug);
}

export function getDestinationBySlug(slug: string): Destination | undefined {
  return popularDestinations.find(d => d.slug === slug);
}
