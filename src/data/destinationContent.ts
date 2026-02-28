// Rich SEO content for destination landing pages

export interface DestinationContent {
  description: string;
  whyVisit: string;
  airports: { name: string; code: string; note: string }[];
  bestPlaces: { name: string; description: string }[];
  travelTips: string[];
  popularRoutes: { from: string; slug: string }[];
  bestTimeToVisit: string;
  faq: { question: string; answer: string }[];
}

// Generic fallback content generator
export function getDestinationContent(city: string, iataCode: string, country: string): DestinationContent {
  const isUS = country === "US";

  return {
    description: `Looking for cheap flights to ${city}? You're in the right place! Whether you're traveling for business, a weekend getaway, or exploring ${city} for the first time, finding an affordable plane ticket is easier than ever with Chyeap. We compare prices across 30+ airlines to bring you the best deals.`,

    whyVisit: `${city} is one of the most popular destinations for travelers ${isUS ? 'across the United States' : 'around the world'}. With a unique blend of culture, cuisine, and attractions, ${city} offers unforgettable experiences for every type of traveler. Whether you're planning a family vacation, romantic getaway, or solo adventure, ${city} has something special waiting for you.`,

    airports: [
      { name: `${city} International Airport`, code: iataCode, note: "Primary airport serving the metropolitan area" },
    ],

    bestPlaces: [
      { name: "City Center", description: `The heart of ${city} with major attractions, restaurants, and shopping within walking distance.` },
      { name: "Historic District", description: `Explore the rich history and architecture that makes ${city} unique.` },
      { name: "Waterfront Area", description: `Beautiful views, parks, and dining options along the waterfront.` },
      { name: "Arts & Culture Quarter", description: `Museums, galleries, and theaters showcasing local and international talent.` },
      { name: "Local Markets", description: `Discover authentic local flavors, crafts, and the vibrant community spirit.` },
    ],

    travelTips: [
      `**Be Flexible with Your Travel Dates:** Flights to ${city} can be significantly cheaper if you fly on Tuesdays or Wednesdays. Flying during off-peak seasons also brings lower prices.`,
      `**Book in Advance:** For the best fares to ${city}, try booking ${isUS ? '1-3 months' : '2-5 months'} before your travel date.`,
      `**Use Flight Comparison Tools:** Platforms like Chyeap make it easy to compare ticket prices from top airlines in seconds.`,
      `**Set Fare Alerts:** Don't want to miss out on price drops? Set up a fare alert so you get notified the moment cheap ${city} tickets become available.`,
      `**Consider Nearby Airports:** Sometimes flying into a nearby airport can save you significantly on airfare.`,
      `**Try searching for cheap round-trip flights to ${city} in off-season months for the best value!**`,
    ],

    popularRoutes: isUS
      ? [
          { from: "Los Angeles", slug: "los-angeles" },
          { from: "San Francisco", slug: "san-francisco" },
          { from: "Chicago", slug: "chicago" },
          { from: "Boston", slug: "boston" },
          { from: "Dallas", slug: "dallas" },
          { from: "Seattle", slug: "seattle" },
        ]
      : [
          { from: "New York", slug: "new-york" },
          { from: "Los Angeles", slug: "los-angeles" },
          { from: "Chicago", slug: "chicago" },
          { from: "Miami", slug: "miami" },
          { from: "San Francisco", slug: "san-francisco" },
          { from: "Dallas", slug: "dallas" },
        ],

    bestTimeToVisit: `The best time to book flights to ${city} depends on your preferences. ${isUS ? 'Spring (March-May) and Fall (September-November) typically offer pleasant weather and lower fares.' : 'Shoulder seasons often provide the best combination of good weather and affordable flights.'} For the cheapest flights, consider traveling mid-week and during off-peak months. Historically, January and February tend to have the lowest average fares.`,

    faq: [
      {
        question: `What is the cheapest month to fly to ${city}?`,
        answer: `The cheapest months for flights to ${city} are typically January, February, and September. Prices can be 20-40% lower compared to peak travel periods. Use Chyeap to track prices and set fare alerts.`,
      },
      {
        question: `How far in advance should I book a flight to ${city}?`,
        answer: `For the best prices, we recommend booking ${isUS ? '1-3 months' : '2-5 months'} in advance. Last-minute deals can sometimes be found, but advance booking generally ensures better fares and more options.`,
      },
      {
        question: `Which airport in ${city} is cheapest to fly into?`,
        answer: `${city} ${iataCode} is the primary airport. Compare prices across all nearby airports on Chyeap — sometimes a slightly farther airport offers significantly cheaper fares.`,
      },
      {
        question: `Are red-eye flights to ${city} cheaper?`,
        answer: `Yes, red-eye and early morning flights to ${city} are often 10-30% cheaper than midday departures. They're a great option if you want to save money and maximize your time at the destination.`,
      },
    ],
  };
}
