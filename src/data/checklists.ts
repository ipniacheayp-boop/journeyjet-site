export interface ChecklistItem {
  id: string;
  name: string;
}

export interface ChecklistCategory {
  title: string;
  items: ChecklistItem[];
}

export interface Checklist {
  id: string;
  title: string;
  description: string;
  image: string;
  categories: ChecklistCategory[];
}

export const checklistsData: Checklist[] = [
  {
    id: "world-100-guide",
    title: "Top 100 Places To Visit in The World",
    description: "Ultimate travel guide covering must-visit destinations worldwide.",
    image: "https://images.unsplash.com/photo-1454372182658-c712e4c5a1db?auto=format&fit=crop&q=80&w=1200",
    categories: [
      {
        title: "Islands & Tropical Destinations",
        items: [
          { id: "world1", name: "Tahiti & Moorea, French Polynesia" },
          { id: "world2", name: "Bora Bora" },
          { id: "world3", name: "Seychelles" },
          { id: "world4", name: "Madagascar" },
          { id: "world5", name: "Mauritius & Reunion Island" },
          { id: "world6", name: "Zanzibar, Tanzania" },
        ],
      },
      {
        title: "Africa Highlights",
        items: [
          { id: "world7", name: "Cape Town, South Africa" },
          { id: "world8", name: "Drakensberg Mountains" },
          { id: "world9", name: "Okavango Delta, Botswana" },
          { id: "world10", name: "Victoria Falls (Zambia/Zimbabwe)" },
          { id: "world11", name: "Namibia Desert" },
          { id: "world12", name: "Serengeti National Park, Tanzania" },
          { id: "world13", name: "Mount Kilimanjaro" },
          { id: "world14", name: "Amboseli National Park, Kenya" },
          { id: "world15", name: "Simien Mountains, Ethiopia" },
        ],
      },
      {
        title: "Europe & Nature",
        items: [
          { id: "world16", name: "Faroe Islands" },
          { id: "world17", name: "Iceland" },
          { id: "world18", name: "Lofoten Islands, Norway" },
          { id: "world19", name: "Swiss Alps" },
          { id: "world20", name: "Dolomites, Italy" },
          { id: "world21", name: "Santorini, Greece" },
        ],
      },
      {
        title: "Asia & Middle East",
        items: [
          { id: "world22", name: "Petra, Jordan" },
          { id: "world23", name: "Wadi Rum, Jordan" },
          { id: "world24", name: "Pyramids of Giza, Egypt" },
          { id: "world25", name: "Dubai, UAE" },
        ],
      },
      {
        title: "Australia & Oceania",
        items: [
          { id: "world26", name: "Tasmania" },
          { id: "world27", name: "Lord Howe Island" },
          { id: "world28", name: "Ball's Pyramid" },
          { id: "world29", name: "Milford Sound, New Zealand" },
          { id: "world30", name: "Mount Cook, New Zealand" },
        ],
      },
      {
        title: "Americas",
        items: [
          { id: "world31", name: "Patagonia (Chile/Argentina)" },
          { id: "world32", name: "Machu Picchu, Peru" },
          { id: "world33", name: "Amazon Rainforest" },
          { id: "world34", name: "Grand Canyon, USA" },
          { id: "world35", name: "Yosemite National Park, USA" },
          { id: "world36", name: "Banff National Park, Canada" },
        ],
      },
    ],
  },
  {
    id: "earth-100",
    title: "Top 100 Places To Visit On Earth",
    description: "Comprehensive destination checklist inspired by global travel content.",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=1200",
    categories: [
      {
        title: "Africa",
        items: [
          { id: "earth1", name: "Cape Town, South Africa" },
          { id: "earth2", name: "Drakensberg Mountains" },
          { id: "earth3", name: "Okavango Delta, Botswana" },
          { id: "earth4", name: "Victoria Falls" },
          { id: "earth5", name: "Namibia Desert" },
          { id: "earth6", name: "Serengeti National Park" },
          { id: "earth7", name: "Mount Kilimanjaro" },
          { id: "earth8", name: "Zanzibar" },
          { id: "earth9", name: "Amboseli National Park" },
          { id: "earth10", name: "Simien Mountains" },
          { id: "earth11", name: "Seychelles" },
          { id: "earth12", name: "Madagascar" },
          { id: "earth13", name: "Mauritius & Reunion Island" },
        ],
      },
      {
        title: "Middle East & Asia",
        items: [
          { id: "earth14", name: "Pyramids of Giza" },
          { id: "earth15", name: "Petra & Wadi Rum" },
          { id: "earth16", name: "Dubai, UAE" },
          { id: "earth17", name: "Nepal (Himalayas)" },
          { id: "earth18", name: "Pakistan (Northern Areas)" },
          { id: "earth19", name: "Sri Lanka" },
          { id: "earth20", name: "India (Taj Mahal, Varanasi, Ladakh)" },
          { id: "earth21", name: "Maldives" },
          { id: "earth22", name: "Bagan, Myanmar" },
          { id: "earth23", name: "Angkor Wat, Cambodia" },
          { id: "earth24", name: "Ha Long Bay, Vietnam" },
          { id: "earth25", name: "Phi Phi Islands, Thailand" },
          { id: "earth26", name: "Khao Sok National Park" },
          { id: "earth27", name: "Palawan, Philippines" },
          { id: "earth28", name: "Bali & Mount Bromo" },
          { id: "earth29", name: "Komodo Islands" },
          { id: "earth30", name: "Raja Ampat" },
        ],
      },
      {
        title: "Australia & Oceania",
        items: [
          { id: "earth31", name: "Whitehaven Beach" },
          { id: "earth32", name: "Great Barrier Reef" },
          { id: "earth33", name: "Daintree Rainforest" },
          { id: "earth34", name: "Australian Outback" },
          { id: "earth35", name: "New Zealand" },
          { id: "earth36", name: "Bora Bora & Moorea" },
          { id: "earth37", name: "Rarotonga" },
          { id: "earth38", name: "Isle of Pines" },
        ],
      },
      {
        title: "Americas",
        items: [
          { id: "earth39", name: "Saint Lucia" },
          { id: "earth40", name: "Martinique" },
          { id: "earth41", name: "Guadeloupe" },
          { id: "earth42", name: "Belize" },
          { id: "earth43", name: "Tikal, Guatemala" },
          { id: "earth44", name: "Teotihuacan, Mexico" },
          { id: "earth45", name: "Angel Falls, Venezuela" },
          { id: "earth46", name: "Kaieteur Falls, Guyana" },
          { id: "earth47", name: "Lençóis Maranhenses, Brazil" },
          { id: "earth48", name: "Rio de Janeiro" },
          { id: "earth49", name: "Iguazu Falls" },
          { id: "earth50", name: "Patagonia" },
          { id: "earth51", name: "Easter Island" },
          { id: "earth52", name: "Machu Picchu" },
          { id: "earth53", name: "Uyuni Salt Flats" },
          { id: "earth54", name: "Galapagos Islands" },
        ],
      },
      {
        title: "USA & Canada",
        items: [
          { id: "earth55", name: "Hawaii (Kauai, Oahu)" },
          { id: "earth56", name: "Yosemite National Park" },
          { id: "earth57", name: "Big Sur" },
          { id: "earth58", name: "Oregon Coast" },
          { id: "earth59", name: "Yellowstone National Park" },
          { id: "earth60", name: "Grand Canyon" },
          { id: "earth61", name: "Moab, Utah" },
          { id: "earth62", name: "Alaska" },
          { id: "earth63", name: "British Columbia" },
          { id: "earth64", name: "Banff National Park" },
        ],
      },
      {
        title: "Europe & Asia Highlights",
        items: [
          { id: "earth65", name: "Japan" },
          { id: "earth66", name: "Zhangjiajie, China" },
          { id: "earth67", name: "Great Wall of China" },
          { id: "earth68", name: "Cappadocia, Turkey" },
          { id: "earth69", name: "Amalfi Coast, Italy" },
          { id: "earth70", name: "Rome, Italy" },
          { id: "earth71", name: "Tuscany, Italy" },
          { id: "earth72", name: "Dolomites, Italy" },
          { id: "earth73", name: "Swiss Alps" },
          { id: "earth74", name: "Paris, France" },
          { id: "earth75", name: "Iceland" },
          { id: "earth76", name: "Faroe Islands" },
        ],
      },
    ],
  },
  {
    id: "see-before-you-die",
    title: "100 Places to See Before You Die",
    description: "Bucket-list destinations every traveler dreams of visiting.",
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1200",
    categories: [
      {
        title: "Global Must-Sees",
        items: [
          { id: "die1", name: "Grand Canyon, USA" },
          { id: "die2", name: "Great Barrier Reef, Australia" },
          { id: "die3", name: "Machu Picchu, Peru" },
          { id: "die4", name: "Petra, Jordan" },
          { id: "die5", name: "Taj Mahal, India" },
          { id: "die6", name: "Pyramids of Giza, Egypt" },
          { id: "die7", name: "Colosseum, Italy" },
          { id: "die8", name: "Eiffel Tower, France" },
          { id: "die9", name: "Santorini, Greece" },
          { id: "die10", name: "Venice, Italy" },
          { id: "die11", name: "Maldives" },
          { id: "die12", name: "Bora Bora" },
          { id: "die13", name: "Bali, Indonesia" },
          { id: "die14", name: "Swiss Alps" },
          { id: "die15", name: "Northern Lights" },
          { id: "die16", name: "Banff National Park, Canada" },
          { id: "die17", name: "Yosemite National Park, USA" },
          { id: "die18", name: "Amazon Rainforest" },
          { id: "die19", name: "Antarctica" },
          { id: "die20", name: "Mount Everest" },
          { id: "die21", name: "Serengeti National Park" },
          { id: "die22", name: "Dubai, UAE" },
          { id: "die23", name: "New York City, USA" },
          { id: "die24", name: "London, UK" },
          { id: "die25", name: "Paris, France" },
          { id: "die26", name: "Tokyo, Japan" },
          { id: "die27", name: "Singapore" },
          { id: "die28", name: "Cape Town, South Africa" },
          { id: "die29", name: "Rio de Janeiro, Brazil" },
          { id: "die30", name: "Istanbul, Turkey" },
        ],
      },
    ],
  },
  {
    id: "top-usa",
    title: "Top Places To Visit in the USA",
    description: "Popular destinations across major cities, parks, and landscapes in the USA.",
    image: "https://images.unsplash.com/photo-1474433188271-d3f339f41911?auto=format&fit=crop&q=80&w=1200",
    categories: [
      {
        title: "Major Cities",
        items: [
          { id: "usa1", name: "New York City" },
          { id: "usa2", name: "Los Angeles" },
          { id: "usa3", name: "San Francisco" },
          { id: "usa4", name: "Las Vegas" },
          { id: "usa5", name: "Chicago" },
          { id: "usa6", name: "Miami" },
        ],
      },
      {
        title: "National Parks",
        items: [
          { id: "usa7", name: "Grand Canyon" },
          { id: "usa8", name: "Yellowstone" },
          { id: "usa9", name: "Yosemite" },
          { id: "usa10", name: "Zion National Park" },
          { id: "usa11", name: "Bryce Canyon" },
          { id: "usa12", name: "Rocky Mountain National Park" },
        ],
      },
      {
        title: "Coastal & Scenic",
        items: [
          { id: "usa13", name: "Hawaii" },
          { id: "usa14", name: "Florida Keys" },
          { id: "usa15", name: "Big Sur" },
          { id: "usa16", name: "Santa Monica" },
          { id: "usa17", name: "Cape Cod" },
        ],
      },
      {
        title: "Unique Landscapes",
        items: [
          { id: "usa18", name: "Monument Valley" },
          { id: "usa19", name: "Antelope Canyon" },
          { id: "usa20", name: "Horseshoe Bend" },
          { id: "usa21", name: "Death Valley" },
        ],
      },
    ],
  },
  {
    id: "top-2026",
    title: "Top 10 Places To Visit in 2026",
    description: "Trending destinations for travel in 2026.",
    image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=1200",
    categories: [
      {
        title: "Trending Destinations",
        items: [
          { id: "trend1", name: "Sardinia, Italy" },
          { id: "trend2", name: "Oulu, Finland" },
          { id: "trend3", name: "Udaipur, India" },
          { id: "trend4", name: "Tasmania, Australia" },
          { id: "trend5", name: "Mexico City, Mexico" },
          { id: "trend6", name: "Cape Town, South Africa" },
          { id: "trend7", name: "Tokyo, Japan" },
          { id: "trend8", name: "Lisbon, Portugal" },
          { id: "trend9", name: "Bali, Indonesia" },
          { id: "trend10", name: "Iceland" },
        ],
      },
    ],
  },
  {
    id: "all-197",
    title: "I Traveled All 197 Countries",
    description: "Insights from a traveler who explored every country in the world.",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=1200",
    categories: [
      {
        title: "Travel Experience & Learnings",
        items: [
          { id: "197_1", name: "Visited all 197 countries" },
          { id: "197_2", name: "Explored diverse cultures worldwide" },
          { id: "197_3", name: "Experienced both developed and remote regions" },
        ],
      },
      {
        title: "People & Culture",
        items: [
          { id: "197_4", name: "Interacted with locals globally" },
          { id: "197_5", name: "Learned different traditions and lifestyles" },
          { id: "197_6", name: "Observed cultural similarities" },
        ],
      },
      {
        title: "Travel Experience",
        items: [
          { id: "197_7", name: "Faced travel challenges (visa, safety, logistics)" },
          { id: "197_8", name: "Managed long-term travel planning" },
          { id: "197_9", name: "Built career through travel content" },
        ],
      },
    ],
  },
];
