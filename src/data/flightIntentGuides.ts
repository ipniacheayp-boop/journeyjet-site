/**
 * Search-intent guidance blocks for Tripile flight/deal pages.
 * Rules: no invented prices, savings, ratings, traveler counts or availability.
 * Every price statement points at live search results.
 */
export interface IntentSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}
export interface IntentFaq {
  question: string;
  answer: string;
}
export interface IntentLink {
  href: string;
  label: string;
}
export interface IntentGuide {
  heading: string;
  /** Short direct answer shown first, easy to quote. */
  answer: string;
  sections: IntentSection[];
  faqs?: IntentFaq[];
  links: IntentLink[];
}

export const flightsHubGuide: IntentGuide = {
  heading: "How Tripile compares airline prices",
  answer:
    "Tripile searches live fares for your exact route and dates, then lists the available offers from different airlines side by side so you can compare price, stops, flight times and baggage before you book. The price shown on a result is the price carried to checkout.",
  sections: [
    {
      heading: "What to compare besides the fare",
      paragraphs: [
        "The cheapest headline fare is not always the cheapest trip. Before choosing a flight, check what the fare actually includes.",
      ],
      bullets: [
        "Checked and carry-on baggage allowance — basic fares often exclude a checked bag.",
        "Change and cancellation conditions shown on the fare.",
        "Number of stops and total travel time, including layovers.",
        "Departure and arrival airports — some cities have more than one.",
        "Departure times, which are shown in each airport's local time.",
      ],
    },
    {
      heading: "How to find cheaper flights",
      paragraphs: [
        "Fares move with demand. Searching a few alternatives usually reveals a lower price than a single search.",
      ],
      bullets: [
        "Try dates a day or two either side of your plan — midweek departures are often cheaper.",
        "Compare nearby airports at either end of the trip.",
        "Compare one-way and round-trip options for your route.",
        "Book once you see a fare that works; live fares can change or sell out.",
      ],
    },
  ],
  faqs: [
    {
      question: "How can I compare airline prices on Tripile?",
      answer:
        "Enter your route, dates and passengers in the flight search. Tripile returns the live offers available for that search and lets you sort and filter them by price, stops and departure time so the airlines can be compared on one screen.",
    },
    {
      question: "Are Tripile flight prices live?",
      answer:
        "Yes. Flight prices come from a live search for the dates you enter, and the fare you select is re-checked before payment. Tripile does not show fixed or estimated fares in search results.",
    },
    {
      question: "Do flight prices include baggage?",
      answer:
        "It depends on the fare. Each offer shows its baggage allowance where the airline provides it, so check it before comparing two fares.",
    },
  ],
  links: [
    { href: "/deals", label: "Browse current flight deals" },
    { href: "/last-minute-flight-deals", label: "Last-minute flight deals guide" },
    { href: "/cheap-flights-india-to-usa", label: "Cheap flights from India to the USA" },
    { href: "/hotels", label: "Compare hotel prices" },
    { href: "/travel-guides", label: "Destination travel guides" },
  ],
};

export const dealsGuide: IntentGuide = {
  heading: "How Tripile flight deals work",
  answer:
    "Deals on this page are real offers returned by live flight searches on popular routes. Each card shows the actual airline, dates and price of an offer, and opens that exact offer at checkout. When an offer expires it is removed rather than shown with an old price.",
  sections: [
    {
      heading: "Getting the most from a flight deal",
      paragraphs: [],
      bullets: [
        "Check the travel dates and baggage allowance on the offer before booking.",
        "Deals are live and can sell out — if a fare changes, Tripile shows the updated price before you pay.",
        "Not seeing your route? Search it directly; the lowest available fare appears first.",
        "Eligible coupon codes can be applied at checkout.",
      ],
    },
  ],
  links: [
    { href: "/flights", label: "Search and compare flights" },
    { href: "/last-minute-flight-deals", label: "How to find last-minute flight deals" },
    { href: "/coupons", label: "Tripile coupon codes" },
  ],
};

export const homeGuide: IntentGuide = {
  heading: "Compare flight and hotel prices on Tripile",
  answer:
    "Tripile lets you search live flight fares and hotel rates for the same trip. Flights and hotels are booked separately, so you can compare each part on its own and combine the options that suit your dates and budget.",
  sections: [
    {
      heading: "A simple way to price a trip",
      paragraphs: [],
      bullets: [
        "Search flights first and note the dates with the best fares.",
        "Search hotels for those dates and compare the full-stay total, taxes included.",
        "Check baggage, cancellation and change terms before booking either part.",
        "Look at the deals page for live fares on popular routes.",
      ],
    },
  ],
  links: [
    { href: "/flights", label: "Compare cheap flights" },
    { href: "/hotels", label: "Compare hotel prices" },
    { href: "/deals", label: "Live flight deals" },
    { href: "/last-minute-flight-deals", label: "Last-minute flight deals" },
    { href: "/cheap-flights-india-to-usa", label: "India to USA flights guide" },
  ],
};

export const lastMinuteGuide: IntentGuide = {
  heading: "How to find last-minute flight deals",
  answer:
    "Last-minute fares are usually higher than fares booked weeks ahead, but cheaper seats still appear. The best way to find them is to search live fares with flexible dates and airports, compare nonstop and one-stop options, and book as soon as a fare fits — late seats can sell out quickly.",
  sections: [
    {
      heading: "Are last-minute flights cheaper?",
      paragraphs: [
        "Usually not. Airlines tend to raise fares as the departure date approaches and seats fill up. Lower prices can still show up on less popular days, times or routes, so checking a live search is the only reliable way to know what is available for your trip.",
      ],
    },
    {
      heading: "Tips for booking a flight at short notice",
      paragraphs: [],
      bullets: [
        "Be flexible by a day: compare departures the day before and after.",
        "Try early-morning, late-night and midweek flights.",
        "Check nearby airports at both ends of the journey.",
        "Compare one-stop itineraries — they are sometimes cheaper than nonstop.",
        "Travel with carry-on only if the cheapest fare excludes checked bags.",
        "Read the change and cancellation terms; short-notice plans often change.",
      ],
    },
    {
      heading: "Before you book a last-minute international flight",
      paragraphs: [
        "Make sure your passport is valid and check the visa or entry rules for your destination and any transit country — these cannot usually be arranged in a few days. Tripile asks for passport details only when the itinerary is international.",
      ],
    },
  ],
  faqs: [
    {
      question: "How can I find last-minute flight deals?",
      answer:
        "Search your route on Tripile with flexible dates and nearby airports, sort by price, and compare nonstop with one-stop options. The live results show the lowest fares currently available.",
    },
    {
      question: "Is it cheaper to book flights last minute?",
      answer:
        "Generally no — fares tend to rise close to departure. Cheaper seats do sometimes appear on less busy days and times, which a live search will show.",
    },
    {
      question: "Can I book a flight for today or tomorrow on Tripile?",
      answer:
        "If airlines still have seats on sale for your route, they appear in the live search results and can be booked. Availability close to departure is limited and changes quickly.",
    },
  ],
  links: [
    { href: "/flights", label: "Search live flight fares" },
    { href: "/deals", label: "Current flight deals" },
    { href: "/coupons", label: "Coupon codes" },
    { href: "/flight-status", label: "Check flight status" },
    { href: "/webcheck-in", label: "Airline web check-in" },
  ],
};

export const indiaUsaGuide: IntentGuide = {
  heading: "Cheap flights from India to the USA",
  answer:
    "To find a cheaper flight from India to the USA, compare live fares across several Indian departure airports and US arrival airports, be flexible by a few days, and weigh one-stop routes against nonstop ones. Tripile shows the live fares for your exact dates — enter your route above to compare.",
  sections: [
    {
      heading: "Main departure and arrival airports",
      paragraphs: [
        "Most India–USA journeys start from a major international airport such as Delhi (DEL), Mumbai (BOM), Bengaluru (BLR), Hyderabad (HYD), Chennai (MAA) or Kolkata (CCU), and arrive at US gateways such as New York (JFK, EWR), San Francisco (SFO), Chicago (ORD), Washington (IAD), Dallas (DFW), Houston (IAH), Atlanta (ATL) or Los Angeles (LAX).",
        "If you live between two Indian cities, or your US destination has more than one airport, search each combination — the difference in fare can be significant.",
      ],
    },
    {
      heading: "Nonstop or one-stop?",
      paragraphs: [
        "Nonstop services are offered on some routes, mainly from Delhi, Mumbai, Bengaluru and Hyderabad. Many travelers connect through hubs in the Middle East, Europe or Asia. One-stop itineraries are often cheaper and offer more departure choices, but add travel time and may require a transit visa depending on your nationality and the connecting country.",
      ],
    },
    {
      heading: "What affects India–USA fares",
      paragraphs: [],
      bullets: [
        "Season: summer holidays, the Diwali period and December–January are typically the busiest.",
        "Day of the week and departure time.",
        "How far ahead you book.",
        "Cabin and fare type, including baggage allowance — long-haul economy fares differ in checked-bag rules.",
        "Change and cancellation conditions.",
      ],
    },
    {
      heading: "Documents you will need",
      paragraphs: [
        "International travel requires a valid passport, and most Indian citizens need a US visa before travel. Check the latest requirements with the US Embassy and confirm any transit visa rules for your connection point before booking. Tripile asks for passport details during checkout for international itineraries.",
      ],
    },
  ],
  faqs: [
    {
      question: "How can I find cheap flights from India to the USA?",
      answer:
        "Compare several Indian departure airports and US arrival airports, shift your dates by a few days, and compare one-stop with nonstop options. Tripile's live search shows the lowest available fares for each combination.",
    },
    {
      question: "Are there nonstop flights from India to the USA?",
      answer:
        "Yes, on some routes — mainly from Delhi, Mumbai, Bengaluru and Hyderabad to major US gateways. Search your route to see which nonstop and connecting flights are currently on sale.",
    },
    {
      question: "Do I need a transit visa for a one-stop flight to the USA?",
      answer:
        "It depends on your nationality and the connecting country. Check the transit rules for your connection airport before booking.",
    },
  ],
  links: [
    { href: "/flights", label: "Compare flight prices" },
    { href: "/flights-to/new-york", label: "Flights to New York" },
    { href: "/flights-to/san-francisco", label: "Flights to San Francisco" },
    { href: "/cheap-hotels-in/new-york", label: "Hotels in New York" },
    { href: "/travel-guide/country/united-states", label: "United States travel guide" },
  ],
};
