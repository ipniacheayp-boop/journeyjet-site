// ============================================================================
// Country season data — powers the "Best Time to Visit {Country}" guide pages.
//
// Closes the "best time to visit / seasonal travel guide" content gap. Content
// is factual, seasonal guidance only: no prices are stated anywhere, because
// real fares come from live search.
// ============================================================================

export interface CountrySeasons {
  /** Matches CountryMeta.key */
  key: string;
  peak: string;
  shoulder: string;
  low: string;
  weather: string;
  events: string;
  packing: string;
}

const SEASONS: CountrySeasons[] = [
  {
    key: "US",
    peak: "June–August and the weeks around Thanksgiving and Christmas",
    shoulder: "April–May and September–October",
    low: "January–early March, outside ski regions",
    weather:
      "The US spans every climate: summers are hot and humid in the south and east, mild in the Pacific Northwest, and dry in the southwest. Winter brings snow across the north and Rockies while Florida, southern California and Hawaii stay warm.",
    events:
      "Spring break (March), Independence Day (4 July), Thanksgiving (late November) and Christmas week all push flights and hotels to their highest levels.",
    packing:
      "Layers for spring and autumn, sun protection for desert and coastal summer, and a proper coat for northern winters.",
  },
  {
    key: "UK",
    peak: "July–August",
    shoulder: "May–June and September",
    low: "November–February, excluding Christmas week",
    weather:
      "Mild and changeable year-round. Summer days are long and rarely very hot; winter is grey and damp rather than freezing, with short daylight hours.",
    events:
      "Summer festivals, Wimbledon in July and the Edinburgh festivals in August fill hotels. Christmas markets lift December demand in major cities.",
    packing: "A waterproof layer in every season, plus an umbrella you don't mind losing.",
  },
  {
    key: "France",
    peak: "July–August",
    shoulder: "April–June and September–October",
    low: "November–March, outside the Alps and Christmas",
    weather:
      "Warm, dry summers in the south and on the Riviera; milder, wetter summers in the north. Spring and autumn are comfortable for sightseeing, and the Alps hold snow from December to April.",
    events:
      "Paris empties and the coast fills in August. The Tour de France (July) and wine harvests (September) affect regional availability.",
    packing: "Light layers and walking shoes for cities; warm kit for alpine trips.",
  },
  {
    key: "Japan",
    peak: "late March–early April (cherry blossom) and October–November (autumn leaves)",
    shoulder: "May–June and September",
    low: "January–February, plus the humid heart of summer",
    weather:
      "Four distinct seasons. Spring is mild with blossom, June brings the rainy season, July–August are hot and humid, and autumn is clear and comfortable. Winters are cold in the north with heavy snow.",
    events:
      "Cherry-blossom weeks, Golden Week (late April–early May) and Obon (mid-August) are the busiest domestic travel periods — book far ahead.",
    packing: "Comfortable shoes, a light rain layer for June, and warm layers for northern winters.",
  },
  {
    key: "UAE",
    peak: "November–March",
    shoulder: "April and October",
    low: "June–September",
    weather:
      "Desert climate. Winter days are warm and dry — ideal for beaches and the desert. Summer is extremely hot and humid, so activity moves indoors.",
    events:
      "Shopping festivals and sporting events cluster in winter. Ramadan shifts each year and changes restaurant and attraction hours.",
    packing: "Light clothing plus a layer for air-conditioned interiors; modest dress for mosques.",
  },
  {
    key: "Mexico",
    peak: "December–April",
    shoulder: "May and November",
    low: "June–October (rainy and hurricane season on the Caribbean coast)",
    weather:
      "The Caribbean and Pacific coasts are warm year-round, with the dry season running December to April. Central highlands, including Mexico City, stay temperate with afternoon rain in summer.",
    events:
      "Día de Muertos (early November), Semana Santa (Easter week) and Christmas fill coastal resorts and highland cities.",
    packing: "Beachwear plus rain cover in summer, and a jacket for cool highland evenings.",
  },
  {
    key: "Spain",
    peak: "July–August",
    shoulder: "April–June and September–October",
    low: "November–March, away from the Canary Islands",
    weather:
      "Hot, dry inland summers and warmer, humid coasts. Spring and autumn are the best sightseeing windows; southern Spain stays mild through winter.",
    events:
      "Semana Santa, Las Fallas (March), San Fermín (July) and August holidays drive up prices in the cities that host them.",
    packing: "Sun protection and light layers; a jacket for northern Spain outside summer.",
  },
  {
    key: "Italy",
    peak: "June–August",
    shoulder: "April–May and September–October",
    low: "November–March, outside Christmas and the Dolomites",
    weather:
      "Hot, dry summers in the south and on the coasts, cooler and wetter in the north. Spring and autumn suit city sightseeing; the Alps and Dolomites hold snow from December to March.",
    events:
      "August sees many family-run businesses close as Italians take their own holidays. Easter, Venice Carnival (February) and harvest season are busy regionally.",
    packing: "Walking shoes for cobbles, shoulder cover for churches, and sun protection in summer.",
  },
  {
    key: "Netherlands",
    peak: "April–May (tulip season) and July–August",
    shoulder: "June and September",
    low: "November–February",
    weather:
      "Mild maritime climate with rain in every month. Summers are pleasant rather than hot; winters are cold, grey and windy with short days.",
    events:
      "King's Day (27 April) and tulip season fill Amsterdam fast. Christmas markets lift December demand.",
    packing: "Windproof rain layer, plus anything comfortable for cycling.",
  },
  {
    key: "Thailand",
    peak: "November–February (cool, dry season)",
    shoulder: "March–May, hot but quieter",
    low: "June–October (southwest monsoon)",
    weather:
      "Tropical. The cool dry season is the most comfortable, March–May is very hot, and the monsoon brings heavy but often short afternoon downpours. The Gulf and Andaman coasts have opposite rain patterns, so one is usually dry.",
    events:
      "Songkran (mid-April) and Loy Krathong (November) are the biggest festivals and the busiest domestic travel weeks.",
    packing: "Light breathable clothing, rain layer, and modest cover for temples.",
  },
  {
    key: "Canada",
    peak: "July–August and the ski season from December–March",
    shoulder: "May–June and September–October",
    low: "April and November (shoulder between seasons)",
    weather:
      "Warm summers with long daylight hours, and cold snowy winters across most of the country. Coastal British Columbia is milder and wetter than the interior.",
    events:
      "Summer festivals, Calgary Stampede (July) and autumn colour in Quebec and Ontario drive regional demand.",
    packing: "Insect repellent for summer wilderness, and serious winter layers from December.",
  },
  {
    key: "Australia",
    peak: "December–February (southern summer) and school holidays",
    shoulder: "September–November and March–May",
    low: "June–August in the south; the tropical north is at its best then",
    weather:
      "Seasons are reversed from the northern hemisphere. Southern cities have warm summers and cool winters; the tropical north has a dry winter season and a wet, humid summer.",
    events:
      "Christmas and January are the busiest domestic weeks. Major sporting events cluster in January and the southern autumn.",
    packing: "Strong sun protection all year, plus a warm layer for southern winters.",
  },
  {
    key: "Germany",
    peak: "June–August and December (Christmas markets)",
    shoulder: "May and September–October",
    low: "January–March, outside the Alps",
    weather:
      "Warm summers, crisp autumns and cold winters with snow in the south and east. Rain is possible in any month.",
    events:
      "Oktoberfest (late September–early October) transforms Munich pricing, and Christmas markets fill city hotels through December.",
    packing: "Layers and a rain jacket; proper winter kit from November.",
  },
  {
    key: "Singapore",
    peak: "December–January and June–July school holidays",
    shoulder: "February–April",
    low: "October–November (wetter)",
    weather:
      "Hot and humid year-round with daily chances of a short, heavy downpour. There is no cool season — only wetter and slightly drier months.",
    events:
      "Chinese New Year, the Grand Prix (September) and major conferences push hotel rates up sharply.",
    packing: "Light clothing, a compact umbrella and a layer for aggressive air conditioning.",
  },
  {
    key: "Turkey",
    peak: "June–August on the coast",
    shoulder: "April–May and September–November",
    low: "December–March, outside ski areas",
    weather:
      "Hot, dry Mediterranean and Aegean summers, cooler and wetter in Istanbul and the north, and cold winters on the central plateau and in Cappadocia.",
    events:
      "Ramadan and the following Eid holidays shift annually and affect opening hours and domestic travel demand.",
    packing: "Sun protection for the coast, modest cover for mosques, and warm layers for Cappadocia mornings.",
  },
  {
    key: "South Korea",
    peak: "April (blossom) and October (autumn colour)",
    shoulder: "May–June and September",
    low: "December–February",
    weather:
      "Four clear seasons: mild blossom-filled spring, a humid summer monsoon in July, crisp clear autumn, and a cold dry winter with ski conditions inland.",
    events:
      "Chuseok (autumn) and Lunar New Year are the busiest domestic travel periods, when many businesses close.",
    packing: "Comfortable walking shoes, a rain layer for July, and a warm coat in winter.",
  },
  {
    key: "India",
    peak: "October–March",
    shoulder: "April and September",
    low: "June–September (monsoon) and the hottest weeks of May",
    weather:
      "The cool, dry months from October to March suit almost the whole country. April–June is very hot across the north, and the southwest monsoon brings heavy rain from June to September — which is when Himalayan hill stations are at their greenest.",
    events:
      "Diwali (autumn) and Holi (spring) are the biggest festivals and the busiest travel weeks; book flights and hotels well ahead.",
    packing: "Light cottons, modest cover for temples, and warm layers for northern winter mornings.",
  },
  {
    key: "South Africa",
    peak: "December–February (summer and coastal holidays)",
    shoulder: "March–April and September–November",
    low: "June–August, which is prime safari season inland",
    weather:
      "Seasons are reversed from the northern hemisphere. Cape Town summers are dry and windy; the winter months are cooler and wetter on the coast but ideal for game viewing, when bush is thin and animals gather at water.",
    events:
      "South African school holidays in December and January fill coastal towns. Whale season runs roughly June to November.",
    packing: "Neutral clothing and binoculars for safari, plus warm layers for early-morning game drives.",
  },
  {
    key: "Greece",
    peak: "July–August",
    shoulder: "May–June and September–October",
    low: "November–March, when many island services pause",
    weather:
      "Hot, dry summers with reliable sunshine, and mild damp winters. Island ferry networks run at full frequency only from late spring to early autumn.",
    events:
      "Greek Orthodox Easter and August holidays are the busiest weeks for island travel.",
    packing: "Sun protection, swimwear and shoes that handle stone steps and ferry docks.",
  },
  {
    key: "Portugal",
    peak: "July–August",
    shoulder: "April–June and September–October",
    low: "November–March, milder in the Algarve and Madeira",
    weather:
      "Warm, dry summers along the Atlantic coast with cooling sea breezes, and mild winters with rain. The Algarve and Madeira stay pleasant well outside summer.",
    events:
      "Lisbon's June festivals and August holidays are the busiest weeks; surf season peaks in autumn and winter.",
    packing: "Layers for coastal wind, sun protection, and a light rain jacket outside summer.",
  },
];

const byKey = new Map(SEASONS.map((s) => [s.key, s]));

export function getCountrySeasons(key: string, bestTime: string, name: string): CountrySeasons {
  return (
    byKey.get(key) ?? {
      key,
      peak: "the local high season",
      shoulder: bestTime,
      low: "the quietest months either side of high season",
      weather: `Conditions in ${name} vary by region and altitude. Travel in ${bestTime} for the most reliable weather.`,
      events: `Public holidays and major festivals in ${name} lift flight and hotel demand — check local dates before fixing yours.`,
      packing: "Pack layers and a light rain jacket, and check the forecast a few days before you fly.",
    }
  );
}
