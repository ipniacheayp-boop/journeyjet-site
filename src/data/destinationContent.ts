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
  priceByDay: { day: string; price: number }[];
  priceByMonth: { month: string; price: number }[];
  cheapestDay: string;
  cheapestMonth: string;
  expensiveMonth: string;
}

// Seeded pseudo-random for consistent per-city prices
function seededRandom(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return () => {
    hash = (hash * 16807) % 2147483647;
    return (hash & 0x7fffffff) / 0x7fffffff;
  };
}

function generateDayPrices(city: string, base: number): { day: string; price: number }[] {
  const rand = seededRandom(city + "day");
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days.map((day) => ({
    day,
    price: Math.round(base + (rand() * 60 - 30)),
  }));
}

function generateMonthPrices(city: string, base: number): { month: string; price: number }[] {
  const rand = seededRandom(city + "month");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  // Create a curve: cheap in winter, expensive in summer
  const seasonMultiplier = [0.85, 0.88, 0.95, 1.1, 1.25, 1.35, 1.38, 1.3, 1.05, 0.95, 0.88, 0.82];
  return months.map((month, i) => ({
    month,
    price: Math.round(base * seasonMultiplier[i] + (rand() * 30 - 15)),
  }));
}

function getBasePrice(country: string): number {
  const prices: Record<string, number> = {
    US: 320, UK: 450, France: 480, Japan: 650, UAE: 550,
    Mexico: 350, Spain: 470, Italy: 490, Netherlands: 460,
    Thailand: 580, Canada: 280, Australia: 750, Germany: 440,
    Singapore: 620, Turkey: 500, "South Korea": 640,
    India: 520, "South Africa": 700, Greece: 490, Portugal: 460,
  };
  return prices[country] || 400;
}

// Generic fallback content generator
export function getDestinationContent(city: string, iataCode: string, country: string): DestinationContent {
  const isUS = country === "US";
  const base = getBasePrice(country);
  const dayPrices = generateDayPrices(city, base);
  const monthPrices = generateMonthPrices(city, base);

  const cheapestDayEntry = dayPrices.reduce((min, d) => d.price < min.price ? d : min, dayPrices[0]);
  const cheapestMonthEntry = monthPrices.reduce((min, m) => m.price < min.price ? m : min, monthPrices[0]);
  const expensiveMonthEntry = monthPrices.reduce((max, m) => m.price > max.price ? m : max, monthPrices[0]);

  const fullDayNames: Record<string, string> = {
    Sun: "Sunday", Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday",
    Thu: "Thursday", Fri: "Friday", Sat: "Saturday",
  };
  const fullMonthNames: Record<string, string> = {
    Jan: "January", Feb: "February", Mar: "March", Apr: "April",
    May: "May", Jun: "June", Jul: "July", Aug: "August",
    Sep: "September", Oct: "October", Nov: "November", Dec: "December",
  };

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
      `**Be Flexible with Your Travel Dates:** Flights to ${city} can be significantly cheaper if you fly on **${fullDayNames[cheapestDayEntry.day] || "Tuesdays"} or Wednesdays**. Also, flying during the off-peak seasons, such as **${fullMonthNames[cheapestMonthEntry.month]} to March** or **September**, usually brings lower prices.`,
      `**Try searching for cheap round-trip flights to ${city} in off-season months for the best value!**`,
      `**Use Flight Comparison Tools:** Platforms like **Chyeap** make it easy to compare ticket prices from top airlines in seconds. You can filter by Departure city, Preferred airline, Layover options, Flight duration.`,
      `**Set Fare Alerts:** Don't want to miss out on price drops? **Set up a fare alert** so you get notified the moment cheap ${city} tickets become available.`,
      `**Consider Nearby Airports:** Sometimes flying into a nearby airport can save you significantly on airfare.`,
      `**Book in Advance:** For the best fares to ${city}, try booking ${isUS ? '1-3 months' : '2-5 months'} before your travel date.`,
    ],

    popularRoutes: isUS
      ? [
          { from: "Los Angeles", slug: "los-angeles" },
          { from: "San Francisco", slug: "san-francisco" },
          { from: "Las Vegas", slug: "las-vegas" },
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

    bestTimeToVisit: `The best time to book flights to ${city} depends on your preferences. ${isUS ? 'Spring (March-May) and Fall (September-November) typically offer pleasant weather and lower fares.' : 'Shoulder seasons often provide the best combination of good weather and affordable flights.'} For the cheapest flights, consider traveling mid-week and during off-peak months. Historically, ${fullMonthNames[cheapestMonthEntry.month]} and February tend to have the lowest average fares.`,

    priceByDay: dayPrices,
    priceByMonth: monthPrices,
    cheapestDay: fullDayNames[cheapestDayEntry.day] || "Monday",
    cheapestMonth: fullMonthNames[cheapestMonthEntry.month] || "December",
    expensiveMonth: fullMonthNames[expensiveMonthEntry.month] || "May",

    faq: [
      {
        question: `What is the cheapest month to fly to ${city}?`,
        answer: `The cheapest months for flights to ${city} are typically ${fullMonthNames[cheapestMonthEntry.month]} and February. Prices can be 20-40% lower compared to peak travel periods like ${fullMonthNames[expensiveMonthEntry.month]}. Use Chyeap to track prices and set fare alerts.`,
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
