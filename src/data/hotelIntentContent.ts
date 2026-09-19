/**
 * Destination-adaptive informational content for the hotel city template
 * (`/cheap-hotels-in/{slug}`).
 *
 * Search Console shows these pages picking up informational queries such as
 * "how much are hotels in paris", "how much is a hotel in paris for a week",
 * "what is the cheapest hotel in new york" and "how to find cheap hotels in nyc".
 * The sections below answer that intent while adapting to each destination.
 *
 * IMPORTANT: no nightly rates or totals are ever invented here. Every price
 * statement points the reader at live Tripile hotel search results.
 */

export interface HotelIntentSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface HotelIntentFaq {
  question: string;
  answer: string;
}

export interface HotelIntentContent {
  sections: HotelIntentSection[];
  faqs: HotelIntentFaq[];
}

export interface HotelIntentInput {
  /** City / destination display name, e.g. "Paris". */
  name: string;
  /** Longer label including region and country, e.g. "Paris, France". */
  regionLabel: string;
  /** Country name, when known. */
  country?: string;
  /** Editorial neighbourhoods, when the destination has them. */
  topAreas?: string[];
  /** Common short form used in search, e.g. "NYC" for New York. */
  alias?: string;
}

/** Short forms people actually search for, so copy reads naturally. */
const ALIASES: Record<string, string> = {
  "new york": "NYC",
  "los angeles": "LA",
  "las vegas": "Vegas",
  "san francisco": "SF",
};

export function hotelDestinationAlias(name: string): string | undefined {
  return ALIASES[name.trim().toLowerCase()];
}

export function getHotelIntentContent(input: HotelIntentInput): HotelIntentContent {
  const { name, regionLabel, country } = input;
  const alias = input.alias ?? hotelDestinationAlias(name);
  const aliasNote = alias ? ` (often searched as hotels in ${alias})` : "";
  const areas = input.topAreas?.filter(Boolean) ?? [];
  const areaSentence =
    areas.length > 0
      ? `In ${name}, travellers most often compare stays in ${areas.slice(0, 5).join(", ")}.`
      : `${name} has both central districts and quieter outlying neighbourhoods, and the gap between them is usually where the savings are.`;

  const sections: HotelIntentSection[] = [
    {
      heading: `How much do hotels in ${name} cost?`,
      paragraphs: [
        `There is no single fixed answer${aliasNote} — what you pay in ${regionLabel} depends on your dates, how central you stay, the room type and how far ahead you book. Instead of publishing a rate that would be out of date within hours, Tripile shows the live nightly prices returned for the exact dates you enter in the search box above.`,
        `To see what hotels in ${name} cost right now, set your check-in and check-out dates, choose the number of guests and rooms, and run the search. The results are sorted so the lowest available nightly price for your dates appears first, which is the quickest way to answer "how much are hotels in ${name}" for your own trip.`,
      ],
      bullets: [
        `Compare two or three date ranges — midweek arrivals are often cheaper than weekends.`,
        `Check whether taxes and fees are included before comparing two properties.`,
        `Look at the total for the whole stay, not only the headline nightly rate.`,
      ],
    },
    {
      heading: `How much does a hotel in ${name} cost for a week?`,
      paragraphs: [
        `A seven-night stay is simply the nightly rates for those seven dates added together, so the total moves with the calendar rather than a fixed weekly price. Enter a check-in date and a check-out date seven nights later and Tripile returns the live total for that week in ${name}, including the properties that offer longer-stay rates.`,
        `Weekly totals in ${name} are usually lower when the stay avoids public holidays, major events and school breaks, and when at least a few of the nights fall midweek. Shifting a week-long trip by two or three days frequently changes the total more than switching hotels does.`,
      ],
    },
    {
      heading: `How to find cheap hotels in ${name}`,
      paragraphs: [
        `Finding a cheap hotel in ${name} is mostly a matter of comparing the right things at the right time. The steps below are what consistently brings the total down.`,
      ],
      bullets: [
        `Search flexible dates: move check-in a day or two either side and compare the totals.`,
        `Widen the area: ${areas.length > 0 ? `look just outside ${areas[0]}` : "look one district out from the centre"} and check the transport time back into ${name}.`,
        `Book the refundable option when the difference is small — it lets you rebook if prices drop.`,
        `Travel in shoulder season rather than peak months for ${name}.`,
        `Check the total for the full stay, taxes included, before deciding.`,
        `Consider aparthotels and guesthouses, which appear alongside hotels in Tripile results.`,
      ],
    },
    {
      heading: `What affects hotel prices in ${name}?`,
      paragraphs: [
        `Rates in ${regionLabel} respond to demand, and demand is easy to read once you know what drives it. The main factors are:`,
      ],
      bullets: [
        `Season and weather — peak travel months in ${country || name} cost noticeably more.`,
        `Day of the week — business districts peak midweek, leisure areas peak at weekends.`,
        `Events, conferences and holidays, which can lift prices across the whole city.`,
        `How central the property is, and how close it sits to transport links.`,
        `Room type, occupancy and whether breakfast or parking is bundled in.`,
        `How far ahead you book, and whether the rate is refundable.`,
      ],
    },
    {
      heading: `Best areas to stay in ${name}`,
      paragraphs: [
        areaSentence,
        `Central areas keep you close to the main sights and cut travel time, while neighbourhoods a short ride out usually return lower nightly rates for a similar room. Run the search above and compare a central stay against one slightly further out — the results show both, so the trade-off between price and location is easy to judge.`,
      ],
      bullets: areas.length > 0 ? areas.slice(0, 8) : undefined,
    },
    {
      heading: `How to compare hotel deals in ${name}`,
      paragraphs: [
        `A lower nightly rate is not always the cheaper stay. When you compare two ${name} hotels on Tripile, check the stay total with taxes and fees, the cancellation terms, what is included in the rate, and the real travel time to where you actually plan to spend your days.`,
        `Once a property looks right, continue to the booking steps from the search results so the price you saw is the price carried through to checkout.`,
      ],
    },
  ];

  const faqs: HotelIntentFaq[] = [
    {
      question: `How much do hotels in ${name} cost?`,
      answer: `It depends on your dates, location and room type, so Tripile shows live nightly prices rather than a fixed rate. Enter your check-in and check-out dates on this page and the search returns the current prices for hotels in ${regionLabel}, lowest available first.`,
    },
    {
      question: `What is the cheapest hotel in ${name}?`,
      answer: `The cheapest hotel in ${name} changes with availability, so there is no permanent answer. Search your dates on this page and the lowest-priced available property for that period appears in the results — that is the cheapest option you can actually book for your trip.`,
    },
    {
      question: `How much does a hotel in ${name} cost for a week?`,
      answer: `A week-long stay is the seven nightly rates added together, so enter a check-in date and a check-out date seven nights later to see the live total. Weeks that avoid holidays, big events and peak season usually come out lower.`,
    },
    {
      question: `How can I find cheap hotels in ${name}?`,
      answer: `Compare flexible dates, look one district out from the centre, travel in shoulder season, and always compare the total for the whole stay with taxes included. Tripile searches live availability for ${regionLabel} so you can test each of those changes in a few seconds.`,
    },
    {
      question: `When are hotels in ${name} usually cheaper?`,
      answer: `Outside peak season, away from major events and holidays, and on nights that fall midweek in leisure districts. Shifting your dates by a couple of days is often the single biggest saving on a ${name} stay.`,
    },
    {
      question: `Which areas have cheaper hotels in ${name}?`,
      answer:
        areas.length > 0
          ? `Rates are usually highest in the most central parts of ${name} such as ${areas[0]}, and lower in neighbourhoods a short transport ride out. Compare a central stay with one further out in the search results to see the difference for your dates.`
          : `Neighbourhoods just outside the centre of ${name} normally return lower nightly rates than the most central districts. The search results on this page show both, so you can weigh price against travel time.`,
    },
    {
      question: `Are hotel prices in ${name} shown live on Tripile?`,
      answer: `Yes. Tripile does not publish fixed nightly rates on this page — every rate and availability figure comes from a live search for the dates you select.`,
    },
  ];

  return { sections, faqs };
}
