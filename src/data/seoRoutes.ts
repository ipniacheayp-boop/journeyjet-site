// SEO Route Data - 100 High-Traffic US Flight Routes
// Based on real US travel demand patterns

export interface SEORoute {
  slug: string;
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  popularAirlines: string[];
  avgPrice: number;
  flightDuration: string;
  bestMonth: string;
}

export const seoFlightRoutes: SEORoute[] = [
  // Top 100 US Flight Routes by Search Volume
  { slug: "cheap-flights-from-new-york-to-los-angeles", origin: "New York", originCode: "JFK", destination: "Los Angeles", destinationCode: "LAX", popularAirlines: ["JetBlue", "Delta", "American Airlines", "United"], avgPrice: 199, flightDuration: "5h 30m", bestMonth: "September" },
  { slug: "cheap-flights-from-los-angeles-to-new-york", origin: "Los Angeles", originCode: "LAX", destination: "New York", destinationCode: "JFK", popularAirlines: ["Delta", "American Airlines", "United", "Alaska"], avgPrice: 189, flightDuration: "5h 15m", bestMonth: "October" },
  { slug: "cheap-flights-from-chicago-to-miami", origin: "Chicago", originCode: "ORD", destination: "Miami", destinationCode: "MIA", popularAirlines: ["American Airlines", "United", "Spirit", "Frontier"], avgPrice: 149, flightDuration: "3h 20m", bestMonth: "November" },
  { slug: "cheap-flights-from-dallas-to-las-vegas", origin: "Dallas", originCode: "DFW", destination: "Las Vegas", destinationCode: "LAS", popularAirlines: ["Southwest", "American Airlines", "Spirit", "Frontier"], avgPrice: 89, flightDuration: "3h 10m", bestMonth: "January" },
  { slug: "cheap-flights-from-san-francisco-to-seattle", origin: "San Francisco", originCode: "SFO", destination: "Seattle", destinationCode: "SEA", popularAirlines: ["Alaska Airlines", "United", "Delta", "Southwest"], avgPrice: 79, flightDuration: "2h 10m", bestMonth: "May" },
  { slug: "cheap-flights-from-boston-to-orlando", origin: "Boston", originCode: "BOS", destination: "Orlando", destinationCode: "MCO", popularAirlines: ["JetBlue", "Delta", "Spirit", "Southwest"], avgPrice: 129, flightDuration: "3h 15m", bestMonth: "February" },
  { slug: "cheap-flights-from-atlanta-to-new-york", origin: "Atlanta", originCode: "ATL", destination: "New York", destinationCode: "JFK", popularAirlines: ["Delta", "JetBlue", "Spirit", "Frontier"], avgPrice: 99, flightDuration: "2h 20m", bestMonth: "March" },
  { slug: "cheap-flights-from-denver-to-phoenix", origin: "Denver", originCode: "DEN", destination: "Phoenix", destinationCode: "PHX", popularAirlines: ["Southwest", "United", "Frontier", "American Airlines"], avgPrice: 69, flightDuration: "1h 55m", bestMonth: "April" },
  { slug: "cheap-flights-from-houston-to-new-york", origin: "Houston", originCode: "IAH", destination: "New York", destinationCode: "JFK", popularAirlines: ["United", "JetBlue", "Spirit", "Delta"], avgPrice: 159, flightDuration: "3h 45m", bestMonth: "September" },
  { slug: "cheap-flights-from-miami-to-new-york", origin: "Miami", originCode: "MIA", destination: "New York", destinationCode: "JFK", popularAirlines: ["American Airlines", "Delta", "JetBlue", "Spirit"], avgPrice: 119, flightDuration: "3h 10m", bestMonth: "October" },
  { slug: "cheap-flights-from-las-vegas-to-los-angeles", origin: "Las Vegas", originCode: "LAS", destination: "Los Angeles", destinationCode: "LAX", popularAirlines: ["Southwest", "Spirit", "Frontier", "Delta"], avgPrice: 49, flightDuration: "1h 15m", bestMonth: "December" },
  { slug: "cheap-flights-from-seattle-to-los-angeles", origin: "Seattle", originCode: "SEA", destination: "Los Angeles", destinationCode: "LAX", popularAirlines: ["Alaska Airlines", "Delta", "Southwest", "United"], avgPrice: 89, flightDuration: "2h 45m", bestMonth: "January" },
  { slug: "cheap-flights-from-phoenix-to-denver", origin: "Phoenix", originCode: "PHX", destination: "Denver", destinationCode: "DEN", popularAirlines: ["Southwest", "Frontier", "American Airlines", "United"], avgPrice: 79, flightDuration: "2h 00m", bestMonth: "March" },
  { slug: "cheap-flights-from-orlando-to-new-york", origin: "Orlando", originCode: "MCO", destination: "New York", destinationCode: "JFK", popularAirlines: ["JetBlue", "Delta", "Spirit", "Frontier"], avgPrice: 99, flightDuration: "2h 50m", bestMonth: "April" },
  { slug: "cheap-flights-from-new-york-to-miami", origin: "New York", originCode: "JFK", destination: "Miami", destinationCode: "MIA", popularAirlines: ["American Airlines", "Delta", "JetBlue", "Spirit"], avgPrice: 129, flightDuration: "3h 15m", bestMonth: "November" },
  { slug: "cheap-flights-from-chicago-to-los-angeles", origin: "Chicago", originCode: "ORD", destination: "Los Angeles", destinationCode: "LAX", popularAirlines: ["American Airlines", "United", "Spirit", "Delta"], avgPrice: 139, flightDuration: "4h 10m", bestMonth: "September" },
  { slug: "cheap-flights-from-new-york-to-san-francisco", origin: "New York", originCode: "JFK", destination: "San Francisco", destinationCode: "SFO", popularAirlines: ["JetBlue", "Delta", "United", "American Airlines"], avgPrice: 209, flightDuration: "6h 00m", bestMonth: "October" },
  { slug: "cheap-flights-from-dallas-to-new-york", origin: "Dallas", originCode: "DFW", destination: "New York", destinationCode: "JFK", popularAirlines: ["American Airlines", "Delta", "JetBlue", "Spirit"], avgPrice: 169, flightDuration: "3h 50m", bestMonth: "March" },
  { slug: "cheap-flights-from-atlanta-to-los-angeles", origin: "Atlanta", originCode: "ATL", destination: "Los Angeles", destinationCode: "LAX", popularAirlines: ["Delta", "Spirit", "Southwest", "American Airlines"], avgPrice: 159, flightDuration: "4h 20m", bestMonth: "January" },
  { slug: "cheap-flights-from-boston-to-miami", origin: "Boston", originCode: "BOS", destination: "Miami", destinationCode: "MIA", popularAirlines: ["JetBlue", "American Airlines", "Spirit", "Delta"], avgPrice: 139, flightDuration: "3h 30m", bestMonth: "December" },
  { slug: "cheap-flights-from-phoenix-to-las-vegas", origin: "Phoenix", originCode: "PHX", destination: "Las Vegas", destinationCode: "LAS", popularAirlines: ["Southwest", "Frontier", "Spirit", "American Airlines"], avgPrice: 49, flightDuration: "1h 10m", bestMonth: "February" },
  { slug: "cheap-flights-from-denver-to-las-vegas", origin: "Denver", originCode: "DEN", destination: "Las Vegas", destinationCode: "LAS", popularAirlines: ["Southwest", "Frontier", "Spirit", "United"], avgPrice: 59, flightDuration: "2h 00m", bestMonth: "January" },
  { slug: "cheap-flights-from-seattle-to-san-francisco", origin: "Seattle", originCode: "SEA", destination: "San Francisco", destinationCode: "SFO", popularAirlines: ["Alaska Airlines", "United", "Delta", "Southwest"], avgPrice: 79, flightDuration: "2h 00m", bestMonth: "May" },
  { slug: "cheap-flights-from-houston-to-las-vegas", origin: "Houston", originCode: "IAH", destination: "Las Vegas", destinationCode: "LAS", popularAirlines: ["Southwest", "United", "Spirit", "Frontier"], avgPrice: 99, flightDuration: "3h 20m", bestMonth: "September" },
  { slug: "cheap-flights-from-chicago-to-new-york", origin: "Chicago", originCode: "ORD", destination: "New York", destinationCode: "JFK", popularAirlines: ["American Airlines", "United", "Delta", "JetBlue"], avgPrice: 109, flightDuration: "2h 20m", bestMonth: "October" },
  { slug: "cheap-flights-from-new-york-to-orlando", origin: "New York", originCode: "JFK", destination: "Orlando", destinationCode: "MCO", popularAirlines: ["JetBlue", "Delta", "Spirit", "Frontier"], avgPrice: 89, flightDuration: "2h 50m", bestMonth: "February" },
  { slug: "cheap-flights-from-los-angeles-to-san-francisco", origin: "Los Angeles", originCode: "LAX", destination: "San Francisco", destinationCode: "SFO", popularAirlines: ["Southwest", "United", "Delta", "Alaska"], avgPrice: 59, flightDuration: "1h 25m", bestMonth: "April" },
  { slug: "cheap-flights-from-atlanta-to-miami", origin: "Atlanta", originCode: "ATL", destination: "Miami", destinationCode: "MIA", popularAirlines: ["Delta", "American Airlines", "Spirit", "Frontier"], avgPrice: 89, flightDuration: "2h 10m", bestMonth: "November" },
  { slug: "cheap-flights-from-san-francisco-to-los-angeles", origin: "San Francisco", originCode: "SFO", destination: "Los Angeles", destinationCode: "LAX", popularAirlines: ["Southwest", "United", "Delta", "Alaska"], avgPrice: 59, flightDuration: "1h 20m", bestMonth: "May" },
  { slug: "cheap-flights-from-new-york-to-chicago", origin: "New York", originCode: "JFK", destination: "Chicago", destinationCode: "ORD", popularAirlines: ["American Airlines", "United", "Delta", "JetBlue"], avgPrice: 99, flightDuration: "2h 25m", bestMonth: "September" },
  { slug: "cheap-flights-from-los-angeles-to-seattle", origin: "Los Angeles", originCode: "LAX", destination: "Seattle", destinationCode: "SEA", popularAirlines: ["Alaska Airlines", "Delta", "Southwest", "United"], avgPrice: 99, flightDuration: "2h 50m", bestMonth: "June" },
  { slug: "cheap-flights-from-miami-to-los-angeles", origin: "Miami", originCode: "MIA", destination: "Los Angeles", destinationCode: "LAX", popularAirlines: ["American Airlines", "Delta", "United", "Spirit"], avgPrice: 179, flightDuration: "5h 30m", bestMonth: "October" },
  { slug: "cheap-flights-from-dallas-to-miami", origin: "Dallas", originCode: "DFW", destination: "Miami", destinationCode: "MIA", popularAirlines: ["American Airlines", "Spirit", "Frontier", "Southwest"], avgPrice: 119, flightDuration: "3h 00m", bestMonth: "December" },
  { slug: "cheap-flights-from-denver-to-los-angeles", origin: "Denver", originCode: "DEN", destination: "Los Angeles", destinationCode: "LAX", popularAirlines: ["Southwest", "United", "Frontier", "Spirit"], avgPrice: 89, flightDuration: "2h 30m", bestMonth: "January" },
  { slug: "cheap-flights-from-boston-to-los-angeles", origin: "Boston", originCode: "BOS", destination: "Los Angeles", destinationCode: "LAX", popularAirlines: ["JetBlue", "Delta", "American Airlines", "United"], avgPrice: 199, flightDuration: "6h 00m", bestMonth: "September" },
  { slug: "cheap-flights-from-phoenix-to-los-angeles", origin: "Phoenix", originCode: "PHX", destination: "Los Angeles", destinationCode: "LAX", popularAirlines: ["Southwest", "American Airlines", "Spirit", "Frontier"], avgPrice: 59, flightDuration: "1h 20m", bestMonth: "March" },
  { slug: "cheap-flights-from-houston-to-miami", origin: "Houston", originCode: "IAH", destination: "Miami", destinationCode: "MIA", popularAirlines: ["United", "American Airlines", "Spirit", "Frontier"], avgPrice: 129, flightDuration: "2h 45m", bestMonth: "November" },
  { slug: "cheap-flights-from-atlanta-to-orlando", origin: "Atlanta", originCode: "ATL", destination: "Orlando", destinationCode: "MCO", popularAirlines: ["Delta", "Southwest", "Spirit", "Frontier"], avgPrice: 69, flightDuration: "1h 30m", bestMonth: "February" },
  { slug: "cheap-flights-from-new-york-to-boston", origin: "New York", originCode: "JFK", destination: "Boston", destinationCode: "BOS", popularAirlines: ["JetBlue", "Delta", "American Airlines", "United"], avgPrice: 79, flightDuration: "1h 20m", bestMonth: "April" },
  { slug: "cheap-flights-from-seattle-to-las-vegas", origin: "Seattle", originCode: "SEA", destination: "Las Vegas", destinationCode: "LAS", popularAirlines: ["Alaska Airlines", "Southwest", "Spirit", "Frontier"], avgPrice: 79, flightDuration: "2h 40m", bestMonth: "January" },
  { slug: "cheap-flights-from-los-angeles-to-phoenix", origin: "Los Angeles", originCode: "LAX", destination: "Phoenix", destinationCode: "PHX", popularAirlines: ["Southwest", "American Airlines", "Spirit", "Frontier"], avgPrice: 49, flightDuration: "1h 15m", bestMonth: "March" },
  { slug: "cheap-flights-from-chicago-to-las-vegas", origin: "Chicago", originCode: "ORD", destination: "Las Vegas", destinationCode: "LAS", popularAirlines: ["Southwest", "Spirit", "Frontier", "United"], avgPrice: 99, flightDuration: "3h 50m", bestMonth: "December" },
  { slug: "cheap-flights-from-new-york-to-las-vegas", origin: "New York", originCode: "JFK", destination: "Las Vegas", destinationCode: "LAS", popularAirlines: ["JetBlue", "Delta", "Spirit", "Frontier"], avgPrice: 149, flightDuration: "5h 20m", bestMonth: "January" },
  { slug: "cheap-flights-from-dallas-to-los-angeles", origin: "Dallas", originCode: "DFW", destination: "Los Angeles", destinationCode: "LAX", popularAirlines: ["American Airlines", "Southwest", "Spirit", "Delta"], avgPrice: 119, flightDuration: "3h 20m", bestMonth: "September" },
  { slug: "cheap-flights-from-san-francisco-to-las-vegas", origin: "San Francisco", originCode: "SFO", destination: "Las Vegas", destinationCode: "LAS", popularAirlines: ["Southwest", "Spirit", "Frontier", "United"], avgPrice: 59, flightDuration: "1h 30m", bestMonth: "February" },
  { slug: "cheap-flights-from-orlando-to-los-angeles", origin: "Orlando", originCode: "MCO", destination: "Los Angeles", destinationCode: "LAX", popularAirlines: ["JetBlue", "Spirit", "Frontier", "Delta"], avgPrice: 149, flightDuration: "5h 15m", bestMonth: "October" },
  { slug: "cheap-flights-from-houston-to-los-angeles", origin: "Houston", originCode: "IAH", destination: "Los Angeles", destinationCode: "LAX", popularAirlines: ["United", "Southwest", "Spirit", "American Airlines"], avgPrice: 119, flightDuration: "3h 30m", bestMonth: "September" },
  { slug: "cheap-flights-from-atlanta-to-las-vegas", origin: "Atlanta", originCode: "ATL", destination: "Las Vegas", destinationCode: "LAS", popularAirlines: ["Delta", "Spirit", "Frontier", "Southwest"], avgPrice: 129, flightDuration: "4h 10m", bestMonth: "January" },
  { slug: "cheap-flights-from-boston-to-las-vegas", origin: "Boston", originCode: "BOS", destination: "Las Vegas", destinationCode: "LAS", popularAirlines: ["JetBlue", "Spirit", "Frontier", "Delta"], avgPrice: 159, flightDuration: "5h 40m", bestMonth: "December" },
  { slug: "cheap-flights-from-denver-to-seattle", origin: "Denver", originCode: "DEN", destination: "Seattle", destinationCode: "SEA", popularAirlines: ["Southwest", "United", "Frontier", "Alaska"], avgPrice: 89, flightDuration: "2h 45m", bestMonth: "May" },
  { slug: "cheap-flights-from-miami-to-chicago", origin: "Miami", originCode: "MIA", destination: "Chicago", destinationCode: "ORD", popularAirlines: ["American Airlines", "United", "Spirit", "Delta"], avgPrice: 139, flightDuration: "3h 25m", bestMonth: "October" },
  { slug: "cheap-flights-from-phoenix-to-seattle", origin: "Phoenix", originCode: "PHX", destination: "Seattle", destinationCode: "SEA", popularAirlines: ["Alaska Airlines", "Southwest", "American Airlines", "Delta"], avgPrice: 99, flightDuration: "3h 00m", bestMonth: "June" },
  { slug: "cheap-flights-from-new-york-to-denver", origin: "New York", originCode: "JFK", destination: "Denver", destinationCode: "DEN", popularAirlines: ["JetBlue", "United", "Delta", "Frontier"], avgPrice: 149, flightDuration: "4h 30m", bestMonth: "September" },
  { slug: "cheap-flights-from-los-angeles-to-denver", origin: "Los Angeles", originCode: "LAX", destination: "Denver", destinationCode: "DEN", popularAirlines: ["Southwest", "United", "Frontier", "Spirit"], avgPrice: 79, flightDuration: "2h 25m", bestMonth: "January" },
  { slug: "cheap-flights-from-chicago-to-atlanta", origin: "Chicago", originCode: "ORD", destination: "Atlanta", destinationCode: "ATL", popularAirlines: ["Delta", "United", "American Airlines", "Spirit"], avgPrice: 89, flightDuration: "2h 00m", bestMonth: "March" },
  { slug: "cheap-flights-from-seattle-to-denver", origin: "Seattle", originCode: "SEA", destination: "Denver", destinationCode: "DEN", popularAirlines: ["Alaska Airlines", "Southwest", "United", "Frontier"], avgPrice: 99, flightDuration: "2h 50m", bestMonth: "April" },
  { slug: "cheap-flights-from-dallas-to-chicago", origin: "Dallas", originCode: "DFW", destination: "Chicago", destinationCode: "ORD", popularAirlines: ["American Airlines", "United", "Spirit", "Southwest"], avgPrice: 99, flightDuration: "2h 30m", bestMonth: "October" },
  { slug: "cheap-flights-from-new-york-to-atlanta", origin: "New York", originCode: "JFK", destination: "Atlanta", destinationCode: "ATL", popularAirlines: ["Delta", "JetBlue", "Spirit", "Frontier"], avgPrice: 109, flightDuration: "2h 25m", bestMonth: "November" },
  { slug: "cheap-flights-from-los-angeles-to-chicago", origin: "Los Angeles", originCode: "LAX", destination: "Chicago", destinationCode: "ORD", popularAirlines: ["American Airlines", "United", "Spirit", "Delta"], avgPrice: 129, flightDuration: "4h 05m", bestMonth: "September" },
  { slug: "cheap-flights-from-houston-to-denver", origin: "Houston", originCode: "IAH", destination: "Denver", destinationCode: "DEN", popularAirlines: ["United", "Southwest", "Frontier", "Spirit"], avgPrice: 89, flightDuration: "2h 40m", bestMonth: "January" },
  { slug: "cheap-flights-from-phoenix-to-san-francisco", origin: "Phoenix", originCode: "PHX", destination: "San Francisco", destinationCode: "SFO", popularAirlines: ["Southwest", "American Airlines", "United", "Alaska"], avgPrice: 79, flightDuration: "1h 55m", bestMonth: "May" },
  { slug: "cheap-flights-from-atlanta-to-dallas", origin: "Atlanta", originCode: "ATL", destination: "Dallas", destinationCode: "DFW", popularAirlines: ["Delta", "American Airlines", "Spirit", "Southwest"], avgPrice: 99, flightDuration: "2h 20m", bestMonth: "March" },
  { slug: "cheap-flights-from-miami-to-atlanta", origin: "Miami", originCode: "MIA", destination: "Atlanta", destinationCode: "ATL", popularAirlines: ["Delta", "American Airlines", "Spirit", "Frontier"], avgPrice: 79, flightDuration: "2h 05m", bestMonth: "October" },
  { slug: "cheap-flights-from-denver-to-chicago", origin: "Denver", originCode: "DEN", destination: "Chicago", destinationCode: "ORD", popularAirlines: ["United", "Southwest", "Frontier", "Spirit"], avgPrice: 89, flightDuration: "2h 35m", bestMonth: "September" },
  { slug: "cheap-flights-from-san-francisco-to-denver", origin: "San Francisco", originCode: "SFO", destination: "Denver", destinationCode: "DEN", popularAirlines: ["United", "Southwest", "Frontier", "Spirit"], avgPrice: 89, flightDuration: "2h 25m", bestMonth: "January" },
  { slug: "cheap-flights-from-new-york-to-dallas", origin: "New York", originCode: "JFK", destination: "Dallas", destinationCode: "DFW", popularAirlines: ["American Airlines", "Delta", "JetBlue", "Spirit"], avgPrice: 159, flightDuration: "3h 55m", bestMonth: "October" },
  { slug: "cheap-flights-from-los-angeles-to-atlanta", origin: "Los Angeles", originCode: "LAX", destination: "Atlanta", destinationCode: "ATL", popularAirlines: ["Delta", "Spirit", "Southwest", "American Airlines"], avgPrice: 149, flightDuration: "4h 15m", bestMonth: "November" },
  { slug: "cheap-flights-from-boston-to-chicago", origin: "Boston", originCode: "BOS", destination: "Chicago", destinationCode: "ORD", popularAirlines: ["JetBlue", "American Airlines", "United", "Spirit"], avgPrice: 99, flightDuration: "2h 50m", bestMonth: "September" },
  { slug: "cheap-flights-from-seattle-to-phoenix", origin: "Seattle", originCode: "SEA", destination: "Phoenix", destinationCode: "PHX", popularAirlines: ["Alaska Airlines", "Southwest", "American Airlines", "Delta"], avgPrice: 89, flightDuration: "2h 55m", bestMonth: "December" },
  { slug: "cheap-flights-from-chicago-to-denver", origin: "Chicago", originCode: "ORD", destination: "Denver", destinationCode: "DEN", popularAirlines: ["United", "Southwest", "Frontier", "Spirit"], avgPrice: 79, flightDuration: "2h 45m", bestMonth: "January" },
  { slug: "cheap-flights-from-dallas-to-atlanta", origin: "Dallas", originCode: "DFW", destination: "Atlanta", destinationCode: "ATL", popularAirlines: ["American Airlines", "Delta", "Spirit", "Southwest"], avgPrice: 89, flightDuration: "2h 15m", bestMonth: "March" },
  { slug: "cheap-flights-from-new-york-to-phoenix", origin: "New York", originCode: "JFK", destination: "Phoenix", destinationCode: "PHX", popularAirlines: ["JetBlue", "American Airlines", "Delta", "Spirit"], avgPrice: 179, flightDuration: "5h 15m", bestMonth: "December" },
  { slug: "cheap-flights-from-houston-to-atlanta", origin: "Houston", originCode: "IAH", destination: "Atlanta", destinationCode: "ATL", popularAirlines: ["United", "Delta", "Spirit", "Southwest"], avgPrice: 89, flightDuration: "1h 55m", bestMonth: "October" },
  { slug: "cheap-flights-from-los-angeles-to-dallas", origin: "Los Angeles", originCode: "LAX", destination: "Dallas", destinationCode: "DFW", popularAirlines: ["American Airlines", "Southwest", "Spirit", "Delta"], avgPrice: 109, flightDuration: "3h 15m", bestMonth: "September" },
  { slug: "cheap-flights-from-miami-to-dallas", origin: "Miami", originCode: "MIA", destination: "Dallas", destinationCode: "DFW", popularAirlines: ["American Airlines", "Spirit", "Frontier", "Southwest"], avgPrice: 109, flightDuration: "3h 05m", bestMonth: "November" },
  { slug: "cheap-flights-from-san-francisco-to-phoenix", origin: "San Francisco", originCode: "SFO", destination: "Phoenix", destinationCode: "PHX", popularAirlines: ["Southwest", "American Airlines", "United", "Alaska"], avgPrice: 69, flightDuration: "1h 50m", bestMonth: "March" },
  { slug: "cheap-flights-from-new-york-to-houston", origin: "New York", originCode: "JFK", destination: "Houston", destinationCode: "IAH", popularAirlines: ["United", "JetBlue", "Spirit", "Delta"], avgPrice: 149, flightDuration: "3h 50m", bestMonth: "October" },
  { slug: "cheap-flights-from-denver-to-dallas", origin: "Denver", originCode: "DEN", destination: "Dallas", destinationCode: "DFW", popularAirlines: ["Southwest", "Frontier", "American Airlines", "United"], avgPrice: 79, flightDuration: "2h 20m", bestMonth: "March" },
  { slug: "cheap-flights-from-atlanta-to-boston", origin: "Atlanta", originCode: "ATL", destination: "Boston", destinationCode: "BOS", popularAirlines: ["Delta", "JetBlue", "Spirit", "Frontier"], avgPrice: 119, flightDuration: "2h 40m", bestMonth: "April" },
  { slug: "cheap-flights-from-phoenix-to-chicago", origin: "Phoenix", originCode: "PHX", destination: "Chicago", destinationCode: "ORD", popularAirlines: ["Southwest", "American Airlines", "United", "Spirit"], avgPrice: 109, flightDuration: "3h 25m", bestMonth: "September" },
  { slug: "cheap-flights-from-seattle-to-chicago", origin: "Seattle", originCode: "SEA", destination: "Chicago", destinationCode: "ORD", popularAirlines: ["Alaska Airlines", "United", "Delta", "American Airlines"], avgPrice: 129, flightDuration: "4h 10m", bestMonth: "October" },
  { slug: "cheap-flights-from-las-vegas-to-san-francisco", origin: "Las Vegas", originCode: "LAS", destination: "San Francisco", destinationCode: "SFO", popularAirlines: ["Southwest", "Spirit", "Frontier", "United"], avgPrice: 49, flightDuration: "1h 25m", bestMonth: "May" },
  { slug: "cheap-flights-from-los-angeles-to-miami", origin: "Los Angeles", originCode: "LAX", destination: "Miami", destinationCode: "MIA", popularAirlines: ["American Airlines", "Delta", "United", "Spirit"], avgPrice: 169, flightDuration: "5h 25m", bestMonth: "November" },
  { slug: "cheap-flights-from-chicago-to-boston", origin: "Chicago", originCode: "ORD", destination: "Boston", destinationCode: "BOS", popularAirlines: ["American Airlines", "United", "JetBlue", "Spirit"], avgPrice: 89, flightDuration: "2h 45m", bestMonth: "April" },
  { slug: "cheap-flights-from-las-vegas-to-seattle", origin: "Las Vegas", originCode: "LAS", destination: "Seattle", destinationCode: "SEA", popularAirlines: ["Alaska Airlines", "Southwest", "Spirit", "Frontier"], avgPrice: 69, flightDuration: "2h 35m", bestMonth: "June" },
  { slug: "cheap-flights-from-dallas-to-denver", origin: "Dallas", originCode: "DFW", destination: "Denver", destinationCode: "DEN", popularAirlines: ["Southwest", "Frontier", "American Airlines", "United"], avgPrice: 69, flightDuration: "2h 15m", bestMonth: "January" },
  { slug: "cheap-flights-from-new-york-to-seattle", origin: "New York", originCode: "JFK", destination: "Seattle", destinationCode: "SEA", popularAirlines: ["JetBlue", "Delta", "Alaska Airlines", "United"], avgPrice: 199, flightDuration: "5h 45m", bestMonth: "June" },
  { slug: "cheap-flights-from-houston-to-chicago", origin: "Houston", originCode: "IAH", destination: "Chicago", destinationCode: "ORD", popularAirlines: ["United", "American Airlines", "Spirit", "Southwest"], avgPrice: 109, flightDuration: "2h 40m", bestMonth: "September" },
  { slug: "cheap-flights-from-san-francisco-to-chicago", origin: "San Francisco", originCode: "SFO", destination: "Chicago", destinationCode: "ORD", popularAirlines: ["United", "American Airlines", "Spirit", "Delta"], avgPrice: 139, flightDuration: "4h 15m", bestMonth: "October" },
  { slug: "cheap-flights-from-atlanta-to-denver", origin: "Atlanta", originCode: "ATL", destination: "Denver", destinationCode: "DEN", popularAirlines: ["Delta", "Southwest", "Frontier", "United"], avgPrice: 119, flightDuration: "3h 30m", bestMonth: "January" },
  { slug: "cheap-flights-from-miami-to-boston", origin: "Miami", originCode: "MIA", destination: "Boston", destinationCode: "BOS", popularAirlines: ["JetBlue", "American Airlines", "Spirit", "Delta"], avgPrice: 129, flightDuration: "3h 25m", bestMonth: "April" },
  { slug: "cheap-flights-from-phoenix-to-dallas", origin: "Phoenix", originCode: "PHX", destination: "Dallas", destinationCode: "DFW", popularAirlines: ["Southwest", "American Airlines", "Spirit", "Frontier"], avgPrice: 79, flightDuration: "2h 30m", bestMonth: "March" },
  { slug: "cheap-flights-from-las-vegas-to-phoenix", origin: "Las Vegas", originCode: "LAS", destination: "Phoenix", destinationCode: "PHX", popularAirlines: ["Southwest", "Frontier", "Spirit", "American Airlines"], avgPrice: 39, flightDuration: "1h 05m", bestMonth: "December" },
  { slug: "cheap-flights-from-orlando-to-atlanta", origin: "Orlando", originCode: "MCO", destination: "Atlanta", destinationCode: "ATL", popularAirlines: ["Delta", "Southwest", "Spirit", "Frontier"], avgPrice: 59, flightDuration: "1h 25m", bestMonth: "October" },
  { slug: "cheap-flights-from-denver-to-san-francisco", origin: "Denver", originCode: "DEN", destination: "San Francisco", destinationCode: "SFO", popularAirlines: ["United", "Southwest", "Frontier", "Spirit"], avgPrice: 79, flightDuration: "2h 30m", bestMonth: "May" },
  { slug: "cheap-flights-from-boston-to-atlanta", origin: "Boston", originCode: "BOS", destination: "Atlanta", destinationCode: "ATL", popularAirlines: ["Delta", "JetBlue", "Spirit", "Frontier"], avgPrice: 109, flightDuration: "2h 35m", bestMonth: "March" },
  { slug: "cheap-flights-from-seattle-to-dallas", origin: "Seattle", originCode: "SEA", destination: "Dallas", destinationCode: "DFW", popularAirlines: ["Alaska Airlines", "American Airlines", "Delta", "Southwest"], avgPrice: 139, flightDuration: "3h 45m", bestMonth: "September" },
  { slug: "cheap-flights-from-las-vegas-to-denver", origin: "Las Vegas", originCode: "LAS", destination: "Denver", destinationCode: "DEN", popularAirlines: ["Southwest", "Frontier", "Spirit", "United"], avgPrice: 49, flightDuration: "1h 55m", bestMonth: "January" },
  { slug: "cheap-flights-from-chicago-to-orlando", origin: "Chicago", originCode: "ORD", destination: "Orlando", destinationCode: "MCO", popularAirlines: ["Spirit", "Frontier", "Southwest", "United"], avgPrice: 89, flightDuration: "2h 55m", bestMonth: "February" },
  { slug: "cheap-flights-from-dallas-to-orlando", origin: "Dallas", originCode: "DFW", destination: "Orlando", destinationCode: "MCO", popularAirlines: ["American Airlines", "Spirit", "Frontier", "Southwest"], avgPrice: 99, flightDuration: "2h 45m", bestMonth: "February" },
  { slug: "cheap-flights-from-san-francisco-to-new-york", origin: "San Francisco", originCode: "SFO", destination: "New York", destinationCode: "JFK", popularAirlines: ["JetBlue", "Delta", "United", "American Airlines"], avgPrice: 199, flightDuration: "5h 30m", bestMonth: "September" },
];

// Hotel city pages
export interface SEOHotelCity {
  slug: string;
  city: string;
  state: string;
  avgPrice: number;
  topAreas: string[];
}

export const seoHotelCities: SEOHotelCity[] = [
  { slug: "cheap-hotels-in-new-york", city: "New York", state: "NY", avgPrice: 189, topAreas: ["Times Square", "Midtown", "Downtown Manhattan", "Brooklyn"] },
  { slug: "cheap-hotels-in-los-angeles", city: "Los Angeles", state: "CA", avgPrice: 149, topAreas: ["Hollywood", "Santa Monica", "Downtown LA", "Beverly Hills"] },
  { slug: "cheap-hotels-in-chicago", city: "Chicago", state: "IL", avgPrice: 129, topAreas: ["Magnificent Mile", "Downtown", "River North", "Wicker Park"] },
  { slug: "cheap-hotels-in-miami", city: "Miami", state: "FL", avgPrice: 139, topAreas: ["South Beach", "Downtown", "Brickell", "Coral Gables"] },
  { slug: "cheap-hotels-in-san-francisco", city: "San Francisco", state: "CA", avgPrice: 169, topAreas: ["Union Square", "Fisherman's Wharf", "SOMA", "Financial District"] },
  { slug: "cheap-hotels-in-las-vegas", city: "Las Vegas", state: "NV", avgPrice: 79, topAreas: ["The Strip", "Downtown", "Fremont Street", "Henderson"] },
  { slug: "cheap-hotels-in-orlando", city: "Orlando", state: "FL", avgPrice: 99, topAreas: ["International Drive", "Disney Area", "Universal Area", "Downtown"] },
  { slug: "cheap-hotels-in-atlanta", city: "Atlanta", state: "GA", avgPrice: 119, topAreas: ["Downtown", "Buckhead", "Midtown", "Airport"] },
  { slug: "cheap-hotels-in-dallas", city: "Dallas", state: "TX", avgPrice: 109, topAreas: ["Downtown", "Uptown", "Deep Ellum", "Design District"] },
  { slug: "cheap-hotels-in-denver", city: "Denver", state: "CO", avgPrice: 129, topAreas: ["LoDo", "RiNo", "Cherry Creek", "Downtown"] },
  { slug: "cheap-hotels-in-seattle", city: "Seattle", state: "WA", avgPrice: 139, topAreas: ["Downtown", "Capitol Hill", "Pike Place", "South Lake Union"] },
  { slug: "cheap-hotels-in-boston", city: "Boston", state: "MA", avgPrice: 179, topAreas: ["Back Bay", "Downtown", "Cambridge", "Seaport"] },
  { slug: "cheap-hotels-in-houston", city: "Houston", state: "TX", avgPrice: 99, topAreas: ["Downtown", "Galleria", "Medical Center", "Montrose"] },
  { slug: "cheap-hotels-in-phoenix", city: "Phoenix", state: "AZ", avgPrice: 109, topAreas: ["Downtown", "Scottsdale", "Tempe", "Airport"] },
  { slug: "cheap-hotels-in-nashville", city: "Nashville", state: "TN", avgPrice: 139, topAreas: ["Broadway", "The Gulch", "Downtown", "Music Row"] },
  { slug: "cheap-hotels-in-san-diego", city: "San Diego", state: "CA", avgPrice: 149, topAreas: ["Gaslamp", "La Jolla", "Downtown", "Coronado"] },
  { slug: "cheap-hotels-in-tampa", city: "Tampa", state: "FL", avgPrice: 119, topAreas: ["Downtown", "Ybor City", "Westshore", "Airport"] },
  { slug: "cheap-hotels-in-portland", city: "Portland", state: "OR", avgPrice: 129, topAreas: ["Pearl District", "Downtown", "Nob Hill", "Airport"] },
  { slug: "cheap-hotels-in-minneapolis", city: "Minneapolis", state: "MN", avgPrice: 119, topAreas: ["Downtown", "Uptown", "Northeast", "Airport"] },
  { slug: "cheap-hotels-in-detroit", city: "Detroit", state: "MI", avgPrice: 109, topAreas: ["Downtown", "Midtown", "Corktown", "Airport"] },
  { slug: "cheap-hotels-in-philadelphia", city: "Philadelphia", state: "PA", avgPrice: 139, topAreas: ["Center City", "Old City", "University City", "Airport"] },
  { slug: "cheap-hotels-in-charlotte", city: "Charlotte", state: "NC", avgPrice: 119, topAreas: ["Uptown", "South End", "Airport", "NoDa"] },
  { slug: "cheap-hotels-in-salt-lake-city", city: "Salt Lake City", state: "UT", avgPrice: 109, topAreas: ["Downtown", "Sugar House", "Airport", "Sandy"] },
  { slug: "cheap-hotels-in-honolulu", city: "Honolulu", state: "HI", avgPrice: 189, topAreas: ["Waikiki", "Downtown", "Ala Moana", "Airport"] },
  { slug: "cheap-hotels-in-fort-lauderdale", city: "Fort Lauderdale", state: "FL", avgPrice: 129, topAreas: ["Beach", "Las Olas", "Downtown", "Airport"] },
  { slug: "cheap-hotels-in-washington-dc", city: "Washington DC", state: "DC", avgPrice: 169, topAreas: ["Downtown", "Georgetown", "Capitol Hill", "Dupont"] },
  { slug: "cheap-hotels-in-baltimore", city: "Baltimore", state: "MD", avgPrice: 119, topAreas: ["Inner Harbor", "Fells Point", "Downtown", "Airport"] },
  { slug: "cheap-hotels-in-austin", city: "Austin", state: "TX", avgPrice: 149, topAreas: ["Downtown", "South Congress", "East Austin", "Domain"] },
  { slug: "cheap-hotels-in-raleigh", city: "Raleigh", state: "NC", avgPrice: 109, topAreas: ["Downtown", "North Hills", "Cary", "Airport"] },
  { slug: "cheap-hotels-in-new-orleans", city: "New Orleans", state: "LA", avgPrice: 139, topAreas: ["French Quarter", "Garden District", "Warehouse District", "Downtown"] },
  { slug: "cheap-hotels-in-london", city: "London", state: "UK", avgPrice: 159, topAreas: ["Westminster", "Covent Garden", "Shoreditch", "Heathrow"] },
  { slug: "cheap-hotels-in-paris", city: "Paris", state: "France", avgPrice: 149, topAreas: ["Le Marais", "Saint-Germain", "Montmartre", "La Défense"] },
  { slug: "cheap-hotels-in-tokyo", city: "Tokyo", state: "Japan", avgPrice: 119, topAreas: ["Shinjuku", "Shibuya", "Ginza", "Asakusa"] },
  { slug: "cheap-hotels-in-dubai", city: "Dubai", state: "UAE", avgPrice: 129, topAreas: ["Downtown", "Marina", "JBR", "Deira"] },
  { slug: "cheap-hotels-in-cancun", city: "Cancun", state: "Mexico", avgPrice: 99, topAreas: ["Hotel Zone", "Downtown", "Isla Mujeres ferry", "Airport"] },
  { slug: "cheap-hotels-in-barcelona", city: "Barcelona", state: "Spain", avgPrice: 119, topAreas: ["Gothic Quarter", "Eixample", "Gràcia", "Beachfront"] },
  { slug: "cheap-hotels-in-rome", city: "Rome", state: "Italy", avgPrice: 129, topAreas: ["Historic Center", "Trastevere", "Vatican area", "Termini"] },
  { slug: "cheap-hotels-in-amsterdam", city: "Amsterdam", state: "Netherlands", avgPrice: 139, topAreas: ["Centrum", "Jordaan", "De Pijp", "Museum Quarter"] },
  { slug: "cheap-hotels-in-bangkok", city: "Bangkok", state: "Thailand", avgPrice: 59, topAreas: ["Sukhumvit", "Silom", "Old Town", "Riverside"] },
  { slug: "cheap-hotels-in-toronto", city: "Toronto", state: "Canada", avgPrice: 129, topAreas: ["Downtown", "Yorkville", "Distillery", "Airport"] },
  { slug: "cheap-hotels-in-sydney", city: "Sydney", state: "Australia", avgPrice: 149, topAreas: ["CBD", "Darling Harbour", "Bondi", "Airport"] },
  { slug: "cheap-hotels-in-frankfurt", city: "Frankfurt", state: "Germany", avgPrice: 119, topAreas: ["Innenstadt", "Sachsenhausen", "Airport", "Westend"] },
  { slug: "cheap-hotels-in-singapore", city: "Singapore", state: "Singapore", avgPrice: 139, topAreas: ["Marina Bay", "Orchard", "Chinatown", "Sentosa"] },
  { slug: "cheap-hotels-in-istanbul", city: "Istanbul", state: "Turkey", avgPrice: 89, topAreas: ["Sultanahmet", "Beyoğlu", "Kadıköy", "Airport"] },
  { slug: "cheap-hotels-in-seoul", city: "Seoul", state: "South Korea", avgPrice: 99, topAreas: ["Gangnam", "Myeongdong", "Hongdae", "Itaewon"] },
  { slug: "cheap-hotels-in-mumbai", city: "Mumbai", state: "India", avgPrice: 79, topAreas: ["Colaba", "Bandra", "Andheri", "Airport"] },
  { slug: "cheap-hotels-in-delhi", city: "Delhi", state: "India", avgPrice: 69, topAreas: ["Connaught Place", "Karol Bagh", "Aerocity", "Old Delhi"] },
  { slug: "cheap-hotels-in-cape-town", city: "Cape Town", state: "South Africa", avgPrice: 89, topAreas: ["V&A Waterfront", "City Bowl", "Camps Bay", "Airport"] },
  { slug: "cheap-hotels-in-athens", city: "Athens", state: "Greece", avgPrice: 99, topAreas: ["Plaka", "Syntagma", "Kolonaki", "Airport"] },
  { slug: "cheap-hotels-in-lisbon", city: "Lisbon", state: "Portugal", avgPrice: 109, topAreas: ["Baixa", "Alfama", "Belém", "Chiado"] },
];

const STORED_HOTEL_SLUG_PREFIX = "cheap-hotels-in-";

/** Match `/cheap-hotels-in/:slug` (e.g. `new-york`) to stored SEO slugs (`cheap-hotels-in-new-york`). */
export function findHotelCityByRouteParam(routeSlug: string | undefined): SEOHotelCity | undefined {
  if (!routeSlug) return undefined;
  return seoHotelCities.find(
    (c) => c.slug === routeSlug || c.slug === `${STORED_HOTEL_SLUG_PREFIX}${routeSlug}`
  );
}

/** Client path for stored slug — React Router needs `/cheap-hotels-in/:city`, not one hyphenated segment. */
export function hotelListingPath(storedSlug: string): string {
  const segment = storedSlug.startsWith(STORED_HOTEL_SLUG_PREFIX)
    ? storedSlug.slice(STORED_HOTEL_SLUG_PREFIX.length)
    : storedSlug;
  return `/cheap-hotels-in/${segment}`;
}

export function hotelListingCanonicalUrl(storedSlug: string): string {
  return `https://tripile.com${hotelListingPath(storedSlug)}`;
}

// Car rental cities
export interface SEOCarCity {
  slug: string;
  city: string;
  state: string;
  avgPrice: number;
  topProviders: string[];
}

export const seoCarCities: SEOCarCity[] = [
  { slug: "cheap-car-rentals-in-los-angeles", city: "Los Angeles", state: "CA", avgPrice: 35, topProviders: ["Enterprise", "Hertz", "Budget", "Avis"] },
  { slug: "cheap-car-rentals-in-las-vegas", city: "Las Vegas", state: "NV", avgPrice: 29, topProviders: ["Budget", "Enterprise", "Dollar", "Alamo"] },
  { slug: "cheap-car-rentals-in-miami", city: "Miami", state: "FL", avgPrice: 32, topProviders: ["Hertz", "Enterprise", "Avis", "National"] },
  { slug: "cheap-car-rentals-in-orlando", city: "Orlando", state: "FL", avgPrice: 28, topProviders: ["Dollar", "Alamo", "Enterprise", "Budget"] },
  { slug: "cheap-car-rentals-in-phoenix", city: "Phoenix", state: "AZ", avgPrice: 26, topProviders: ["Enterprise", "Budget", "Hertz", "Avis"] },
];

// Get all SEO route slugs for sitemap
export const getAllSEORouteSlugs = (): string[] => {
  return [
    ...seoFlightRoutes.map(r => `/${r.slug}`),
    ...seoHotelCities.map((r) => hotelListingPath(r.slug)),
    ...seoCarCities.map(r => `/${r.slug}`),
  ];
};
