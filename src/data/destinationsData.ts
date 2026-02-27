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

export const airlines = [
  "American Airlines", "Delta Air Lines", "United Airlines", "Southwest Airlines",
  "JetBlue Airways", "Alaska Airlines", "Spirit Airlines", "Frontier Airlines",
  "Hawaiian Airlines", "Allegiant Air", "Sun Country Airlines", "Breeze Airways",
  "British Airways", "Lufthansa", "Air France", "Emirates",
  "Qatar Airways", "Singapore Airlines", "Cathay Pacific", "Japan Airlines",
  "ANA", "Turkish Airlines", "KLM", "Iberia",
  "Air Canada", "WestJet", "Ryanair", "EasyJet",
  "Etihad Airways", "Thai Airways", "Korean Air", "LATAM Airlines",
];

export function getDestinationBySlug(slug: string): Destination | undefined {
  return popularDestinations.find(d => d.slug === slug);
}
