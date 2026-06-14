export interface CruiseFAQ {
  question: string;
  answer: string;
}

export interface CruiseDestination {
  slug: string;
  name: string;
  /** <title> — kept under 60 chars where possible */
  seoTitle: string;
  /** meta description — kept under 160 chars */
  metaDescription: string;
  keywords: string;
  h1: string;
  tagline: string;
  heroImage: string;
  /** Intro/body paragraphs rendered as keyword-rich content */
  intro: string[];
  highlights: { title: string; description: string }[];
  bestTimeToGo: string;
  popularPorts: string[];
  faqs: CruiseFAQ[];
}

export const cruiseDestinations: CruiseDestination[] = [
  {
    slug: "caribbean-cruises",
    name: "Caribbean Cruises",
    seoTitle: "Caribbean Cruises 2026 | Cheap Caribbean Cruise Deals",
    metaDescription:
      "Book cheap Caribbean cruise deals for 2026. Compare Eastern, Western & Southern Caribbean itineraries with free perks, onboard credit and the best low prices.",
    keywords:
      "caribbean cruises, cheap caribbean cruise, eastern caribbean cruise, western caribbean cruise, caribbean cruise deals 2026, bahamas cruise",
    h1: "Caribbean Cruises: Sun, Sea & Unforgettable Island Escapes",
    tagline: "Eastern, Western & Southern Caribbean itineraries from major cruise lines",
    heroImage:
      "https://images.unsplash.com/photo-1559599746-8823b38544c6?w=1200&h=600&fit=crop",
    intro: [
      "Caribbean cruises remain the most popular way to experience the turquoise waters, white-sand beaches and vibrant island culture of the West Indies. With dozens of departures from Florida, Texas and Puerto Rico, a Caribbean cruise lets you visit several islands in a single trip without unpacking more than once.",
      "Whether you dream of snorkeling coral reefs in the Bahamas, exploring Mayan ruins in Mexico, or relaxing on the pink-sand beaches of the Eastern Caribbean, Tripile helps you compare the best Caribbean cruise deals across Royal Caribbean, Carnival, Norwegian, Celebrity and Princess.",
      "Our travel experts secure exclusive perks such as free gratuities, onboard credit and reduced fares for second guests, so you sail for less while enjoying world-class dining, entertainment and amenities.",
    ],
    highlights: [
      { title: "Eastern Caribbean", description: "St. Thomas, St. Maarten and the Bahamas — perfect for first-time cruisers and beach lovers." },
      { title: "Western Caribbean", description: "Cozumel, Grand Cayman and Roatán — ideal for snorkeling, diving and Mayan history." },
      { title: "Southern Caribbean", description: "Aruba, Bonaire and Barbados — longer sailings with sunnier, drier weather year-round." },
    ],
    bestTimeToGo:
      "The Caribbean cruise season runs year-round, but the best weather is from December to April. For the lowest prices, sail in the early fall shoulder season.",
    popularPorts: ["Miami", "Fort Lauderdale", "Port Canaveral", "Galveston", "San Juan"],
    faqs: [
      { question: "How much does a Caribbean cruise cost?", answer: "Caribbean cruises start from around $180 per person for a short 3–4 night sailing, with 7-night cruises typically ranging from $400 to $900 per person depending on cabin type, cruise line and season." },
      { question: "What is the best month for a Caribbean cruise?", answer: "December through April offers the best weather with low humidity and minimal rain. Hurricane season (August–October) brings the lowest fares but a higher chance of itinerary changes." },
      { question: "Which Caribbean cruise is best for first-timers?", answer: "A 7-night Eastern Caribbean cruise is ideal for first-time cruisers, combining popular islands, calm seas and plenty of onboard activities." },
      { question: "Do I need a passport for a Caribbean cruise?", answer: "Closed-loop cruises that start and end at the same U.S. port allow travel with a birth certificate and government ID, but a valid passport is strongly recommended for all international sailings." },
    ],
  },
  {
    slug: "mediterranean-cruises",
    name: "Mediterranean Cruises",
    seoTitle: "Mediterranean Cruises 2026 | Best Med Cruise Deals",
    metaDescription:
      "Explore the best Mediterranean cruise deals for 2026. Visit Italy, Greece, Spain & France on Western and Eastern Med itineraries with exclusive savings and perks.",
    keywords:
      "mediterranean cruises, mediterranean cruise deals, greek isles cruise, western mediterranean cruise, italy cruise, europe cruise 2026",
    h1: "Mediterranean Cruises: History, Culture & Coastal Beauty",
    tagline: "Sail Italy, Greece, Spain and France on iconic Mediterranean itineraries",
    heroImage:
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1200&h=600&fit=crop",
    intro: [
      "A Mediterranean cruise is the most rewarding way to experience the icons of Europe — from the ruins of Rome and the art of Florence to the whitewashed cliffs of Santorini and the beaches of Barcelona. In a single voyage you can wake up in a new country each morning and step ashore minutes from world heritage sites.",
      "Western Mediterranean cruises focus on Italy, France and Spain, while Eastern Mediterranean and Greek Isles itineraries showcase Greece, Croatia and Turkey. Tripile compares Mediterranean cruise deals across the top cruise lines so you find the right itinerary at the best price.",
      "Book with Tripile to unlock onboard credit, free gratuities and exclusive cabin upgrades on premium Mediterranean sailings, plus expert guidance on shore excursions and the best ports for your interests.",
    ],
    highlights: [
      { title: "Western Mediterranean", description: "Rome, Florence, Barcelona and the French Riviera — art, cuisine and coastline." },
      { title: "Greek Isles", description: "Santorini, Mykonos and Athens — sun-soaked islands and ancient history." },
      { title: "Eastern Mediterranean", description: "Croatia, Montenegro and Turkey — dramatic coastlines and rich culture." },
    ],
    bestTimeToGo:
      "Mediterranean cruise season runs April to November. May, June and September offer warm weather with fewer crowds and better prices than the July–August peak.",
    popularPorts: ["Barcelona", "Rome (Civitavecchia)", "Venice", "Athens (Piraeus)", "Marseille"],
    faqs: [
      { question: "When is the best time to take a Mediterranean cruise?", answer: "Late spring (May–June) and early fall (September–October) offer the best balance of warm weather, smaller crowds and lower fares compared with the July–August peak season." },
      { question: "How long are Mediterranean cruises?", answer: "Most Mediterranean cruises run 7 to 12 nights, though longer 14-night repositioning and grand voyages are available for travelers who want to see more ports." },
      { question: "Do I need a visa for a Mediterranean cruise?", answer: "U.S. citizens generally do not need a visa for short stays in EU Schengen countries, but a passport valid for at least six months beyond your travel dates is required." },
      { question: "Which is better: Western or Eastern Mediterranean?", answer: "Choose Western Mediterranean for Italy, France and Spain; choose Eastern Mediterranean or the Greek Isles for Greece, Croatia and ancient history. Both are excellent first-time options." },
    ],
  },
  {
    slug: "alaska-cruises",
    name: "Alaska Cruises",
    seoTitle: "Alaska Cruises 2026 | Cheap Alaska Cruise Deals",
    metaDescription:
      "Find the best Alaska cruise deals for 2026. Sail the Inside Passage and Glacier Bay to see glaciers, whales and wildlife with exclusive savings on top cruise lines.",
    keywords:
      "alaska cruises, alaska cruise deals, inside passage cruise, glacier bay cruise, alaska cruise 2026, hubbard glacier cruise",
    h1: "Alaska Cruises: Glaciers, Wildlife & Wilderness",
    tagline: "Cruise the Inside Passage and Glacier Bay on unforgettable Alaska sailings",
    heroImage:
      "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1200&h=600&fit=crop",
    intro: [
      "An Alaska cruise delivers some of the most spectacular scenery on Earth — towering tidewater glaciers, breaching humpback whales, and rugged coastal towns rich in Gold Rush and Native heritage. Cruising is the easiest and most comfortable way to reach Alaska's remote Inside Passage and glacier-carved fjords.",
      "Choose a round-trip Inside Passage cruise from Seattle or Vancouver, or a one-way Glacier route through the Gulf of Alaska that visits Hubbard Glacier and Glacier Bay National Park. Tripile compares Alaska cruise deals across Royal Caribbean, Princess, Holland America, Norwegian and Celebrity.",
      "Pair your sailing with a land-based cruisetour to Denali National Park for the ultimate Alaska adventure, and let our experts add value with onboard credit, free gratuities and balcony upgrades to make the most of the scenery.",
    ],
    highlights: [
      { title: "Inside Passage", description: "Juneau, Skagway and Ketchikan — sheltered waters, glaciers and wildlife." },
      { title: "Glacier Bay & Hubbard", description: "Witness calving glaciers from the comfort of your balcony or deck." },
      { title: "Denali Cruisetours", description: "Combine your cruise with a rail and lodge journey into Denali National Park." },
    ],
    bestTimeToGo:
      "Alaska cruise season runs May to September. June and July offer the warmest, longest days, while May and September deliver lower prices and excellent wildlife viewing.",
    popularPorts: ["Seattle", "Vancouver", "Juneau", "Skagway", "Ketchikan"],
    faqs: [
      { question: "What is the best month to cruise Alaska?", answer: "June and July offer the warmest weather and longest daylight hours. May and September are quieter and cheaper, with strong wildlife sightings and the chance to see the northern lights in late September." },
      { question: "How much does an Alaska cruise cost?", answer: "A 7-night Alaska cruise typically costs between $400 and $1,200 per person depending on cabin type, cruise line and how far in advance you book. Balcony cabins are popular for glacier viewing." },
      { question: "Inside Passage or Glacier route — which is better?", answer: "The round-trip Inside Passage is convenient and slightly cheaper, while the one-way Glacier route through the Gulf of Alaska adds Hubbard Glacier and is ideal if you want to combine the cruise with a Denali land tour." },
      { question: "What should I pack for an Alaska cruise?", answer: "Pack layers, a waterproof jacket, comfortable walking shoes and binoculars. Temperatures range from the 40s to 60s°F, and weather can change quickly even in summer." },
    ],
  },
  {
    slug: "luxury-cruises",
    name: "Luxury Cruises",
    seoTitle: "Luxury Cruises 2026 | All-Inclusive Luxury Cruise Deals",
    metaDescription:
      "Discover all-inclusive luxury cruise deals for 2026. Sail in spacious suites with personal butlers, fine dining and curated shore experiences on the world's best ships.",
    keywords:
      "luxury cruises, all-inclusive cruise, luxury cruise deals, premium cruise lines, suite cruise, world cruise 2026",
    h1: "Luxury Cruises: All-Inclusive Voyages in Effortless Style",
    tagline: "Spacious suites, fine dining and curated experiences on the world's finest ships",
    heroImage:
      "https://images.unsplash.com/photo-1599640842225-85d111c60e6b?w=1200&h=600&fit=crop",
    intro: [
      "Luxury cruises redefine what a vacation at sea can be. With all-inclusive fares, spacious suites, personal butlers and a high crew-to-guest ratio, every detail is handled so you can focus entirely on the experience. Gourmet dining, premium beverages, gratuities and many shore excursions are typically included in the fare.",
      "From intimate boutique ships that reach hidden harbors to grand vessels with the most refined amenities at sea, a luxury cruise offers an elevated way to explore the Mediterranean, Caribbean, Alaska and beyond. Tripile partners with the leading premium and ultra-luxury cruise lines to bring you exclusive savings.",
      "Book your luxury cruise through Tripile to access reduced deposits, complimentary upgrades and onboard credit, with personal support from a dedicated travel expert from booking to bon voyage.",
    ],
    highlights: [
      { title: "All-Inclusive Fares", description: "Dining, drinks, gratuities and select excursions bundled into one transparent price." },
      { title: "Spacious Suites", description: "Verandah suites and penthouses with butler service and premium amenities." },
      { title: "Curated Experiences", description: "Smaller ships, immersive itineraries and personalized service throughout your voyage." },
    ],
    bestTimeToGo:
      "Luxury cruises sail year-round across the globe. Book 9–12 months ahead for the best suite availability and early-booking savings on flagship itineraries.",
    popularPorts: ["Monte Carlo", "Venice", "Barcelona", "Miami", "Singapore"],
    faqs: [
      { question: "What is included in a luxury all-inclusive cruise?", answer: "Luxury cruise fares typically include gourmet dining, premium beverages, gratuities, Wi-Fi and many shore excursions. Some lines also include round-trip airfare and pre-cruise hotel stays." },
      { question: "How much does a luxury cruise cost?", answer: "Luxury cruises generally start around $4,000–$6,000 per person for a week-long all-inclusive sailing, with ultra-luxury suites and world cruises costing significantly more." },
      { question: "Are luxury cruises worth the price?", answer: "For travelers who value space, personalized service, included extras and immersive itineraries, luxury cruises often deliver excellent value once you factor in everything bundled into the fare." },
      { question: "How far in advance should I book a luxury cruise?", answer: "Book 9–12 months ahead to secure the best suites and early-booking incentives. Popular world cruises and holiday sailings can sell out more than a year in advance." },
    ],
  },
  {
    slug: "family-cruises",
    name: "Family Cruises",
    seoTitle: "Family Cruises 2026 | Best Family Cruise Deals & Kids Sail Free",
    metaDescription:
      "Plan the perfect family cruise for 2026. Compare family-friendly cruise deals with kids clubs, water parks and Kids Sail Free offers on top cruise lines.",
    keywords:
      "family cruises, family cruise deals, kids sail free, best family cruise, cruise with kids, family friendly cruise 2026",
    h1: "Family Cruises: Adventure & Relaxation for Every Age",
    tagline: "Kids clubs, water parks and Kids Sail Free deals on family-friendly ships",
    heroImage:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=600&fit=crop",
    intro: [
      "Family cruises are the ultimate stress-free vacation — one fare covers accommodation, meals, entertainment and transportation between destinations, so parents relax while kids stay endlessly entertained. Modern family ships feature water parks, surf simulators, rock walls, Broadway-style shows and supervised kids clubs for every age group.",
      "From short 3–4 night Bahamas getaways perfect for first-time family cruisers to week-long Caribbean and Alaska adventures, Tripile helps you find family cruise deals that fit your budget. Look for Kids Sail Free promotions and connecting staterooms designed for families.",
      "Book your family cruise with Tripile to take advantage of onboard credit, free gratuities and exclusive family savings, plus expert help choosing the right ship, itinerary and cabin for your crew.",
    ],
    highlights: [
      { title: "Kids & Teen Clubs", description: "Age-appropriate supervised programs that give parents time to relax." },
      { title: "Onboard Thrills", description: "Water slides, pools, mini-golf, arcades and family entertainment all included." },
      { title: "Kids Sail Free Deals", description: "Seasonal promotions where children sail free or at a reduced fare." },
    ],
    bestTimeToGo:
      "School holidays and summer are peak family cruise times. For lower prices, sail during shoulder seasons or choose a short Bahamas cruise over a long weekend.",
    popularPorts: ["Orlando (Port Canaveral)", "Miami", "Galveston", "Seattle", "Los Angeles"],
    faqs: [
      { question: "What is the best cruise for families with young kids?", answer: "Short 3–5 night Caribbean and Bahamas cruises on ships with large kids clubs, water parks and pools are ideal for families with young children, offering plenty to do without long days at sea." },
      { question: "Do kids really sail free on cruises?", answer: "Many cruise lines run Kids Sail Free promotions where the third and fourth guests in a cabin (often children) pay only taxes and fees. Availability is limited, so book early when these deals appear." },
      { question: "What age is best to take kids on a cruise?", answer: "Most kids clubs start at age 3 (potty-trained), but cruises suit all ages. Families with babies should look for ships with nursery services and shorter itineraries." },
      { question: "How much does a family cruise cost?", answer: "A 7-night Caribbean family cruise typically costs $400–$800 per person, with Kids Sail Free deals and connecting cabins helping reduce the total cost for larger families." },
    ],
  },
];

export const getCruiseDestination = (slug: string): CruiseDestination | undefined =>
  cruiseDestinations.find((d) => d.slug === slug);
