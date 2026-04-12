import { Helmet } from "react-helmet";
import { Link, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchWidget from "@/components/SearchWidget";
import { Plane, Hotel, Car } from "lucide-react";

const HUB_CONFIG: Record<
  string,
  { defaultTab: "flights" | "hotels" | "cars"; title: string; description: string; canonical: string }
> = {
  "/flights": {
    defaultTab: "flights",
    title: "Search Cheap Flights | Tripile.com — Compare 500+ Airlines",
    description:
      "Search and compare cheap flights across the USA on Tripile.com. Compare 500+ airlines, flexible dates, transparent fares, and 24/7 support when plans change.",
    canonical: "https://tripile.com/flights",
  },
  "/hotels": {
    defaultTab: "hotels",
    title: "Find Cheap Hotels | Tripile.com — US & International Stays",
    description:
      "Find hotel deals and compare nightly rates for US cities and international destinations. Filter by neighborhood, star rating, and amenities on Tripile.com.",
    canonical: "https://tripile.com/hotels",
  },
  "/car-rentals": {
    defaultTab: "cars",
    title: "Cheap Car Rentals | Tripile.com — Compare Rates",
    description:
      "Compare car rental rates from major brands. Choose pick-up and drop-off locations, dates, and vehicle class—built for US road trips and airport pickups on Tripile.com.",
    canonical: "https://tripile.com/car-rentals",
  },
};

/** Unique long-form copy per hub (300+ words) for indexing — not duplicated across routes. */
function HubSeoArticle({ tabKey }: { tabKey: "flights" | "hotels" | "cars" }) {
  if (tabKey === "flights") {
    return (
      <article
        className="mt-12 prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground"
        aria-labelledby="hub-flights-guide"
      >
        <h2 id="hub-flights-guide" className="text-foreground font-display text-xl md:text-2xl font-bold not-prose">
          Book smarter flights on Tripile.com
        </h2>
        <p>
          Searching for airfare should feel straightforward—not like decoding a spreadsheet. Tripile’s flight hub is built
          for travelers who want to compare carriers, cabin classes, and schedules side by side, then move forward with
          confidence. Whether you are booking a quick domestic hop, a coast-to-coast itinerary, or an international
          departure from a major US gateway, you can start from this page with a clean URL that search engines can crawl:
          no fragile hash navigation, just a dedicated entry point for flight search.
        </p>
        <p>
          Flexibility matters. Midweek departures, alternate airports, and slightly shifted return dates can change the
          total price dramatically. Use Tripile to explore options transparently: we focus on surfacing fares clearly so
          you can weigh convenience versus cost. If your plans change, our support team is available around the clock to
          help you understand typical change rules and timelines—because real travel is rarely perfectly predictable.
        </p>
        <p>
          Beyond the booking moment, Tripile also helps you stay informed. Check{" "}
          <Link to="/flight-status" className="text-primary font-medium hover:underline">
            live flight status
          </Link>{" "}
          before you head to the airport, and browse{" "}
          <Link to="/deals" className="text-primary font-medium hover:underline">
            featured travel deals
          </Link>{" "}
          when you want inspiration or seasonal savings. Pair flights with{" "}
          <Link to="/hotels" className="text-primary font-medium hover:underline">
            hotel stays
          </Link>{" "}
          and{" "}
          <Link to="/car-rentals" className="text-primary font-medium hover:underline">
            car rentals
          </Link>{" "}
          when you need a complete trip—ground transportation and lodging are often where itineraries succeed or stumble,
          and Tripile is designed to keep those decisions in one workflow.
        </p>
        <p>
          Finally, remember that the best “deal” is the one that fits your schedule, baggage needs, and comfort
          preferences—not only the lowest number on the screen. Compare, shortlist, and book when you are ready. If you
          want human help choosing between close options, contact Tripile support and we will walk you through the
          trade-offs in plain language.
        </p>
      </article>
    );
  }
  if (tabKey === "hotels") {
    return (
      <article
        className="mt-12 prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground"
        aria-labelledby="hub-hotels-guide"
      >
        <h2 id="hub-hotels-guide" className="text-foreground font-display text-xl md:text-2xl font-bold not-prose">
          Find the right hotel—not just the cheapest nightly rate
        </h2>
        <p>
          Hotels are more than a place to sleep: they anchor your daily routine on the road. Tripile’s hotel hub helps
          you compare properties using the factors travelers actually care about—neighborhood, distance to meetings or
          attractions, guest reviews, and total stay price. Start your search here with a stable, crawlable URL that
          points directly to hotel tools rather than a generic homepage with query parameters.
        </p>
        <p>
          Business travelers often optimize for airport access and reliable Wi‑Fi, while families may prioritize space,
          breakfast options, and flexible cancellation windows. Leisure travelers might care about walkability and local
          dining. Whatever your profile, the goal is the same: reduce surprises. Tripile focuses on clarity so you can
          compare apples-to-apples and pick a stay that matches how you actually travel.
        </p>
        <p>
          Pairing lodging with transportation is where trips get easier. After you choose dates, consider whether you need{" "}
          <Link to="/car-rentals" className="text-primary font-medium hover:underline">
            a rental car
          </Link>{" "}
          for suburban or scenic routes, or whether public transit fits better. If you are flying in, confirm timing with{" "}
          <Link to="/flight-status" className="text-primary font-medium hover:underline">
            flight status
          </Link>{" "}
          before you commit to tight connections. For package-style savings, browse{" "}
          <Link to="/deals" className="text-primary font-medium hover:underline">
            Tripile deals
          </Link>{" "}
          to spot seasonal promotions. You can always return to{" "}
          <Link to="/flights" className="text-primary font-medium hover:underline">
            flight search
          </Link>{" "}
          if you want to adjust arrival cities to unlock better hotel rates.
        </p>
        <p>
          When you need help interpreting policies—like resort fees, prepaid rates, or late check-in—Tripile support can
          explain what matters most for your itinerary. Our goal is simple: help you book a stay you will be happy to
          return to after a long day of meetings, theme parks, or sightseeing.
        </p>
      </article>
    );
  }
  return (
    <article
      className="mt-12 prose prose-sm md:prose-base dark:prose-invert max-w-none text-muted-foreground"
      aria-labelledby="hub-cars-guide"
    >
      <h2 id="hub-cars-guide" className="text-foreground font-display text-xl md:text-2xl font-bold not-prose">
        Compare car rentals for airport pickups and road trips
      </h2>
      <p>
        A rental car can be the most flexible part of your itinerary—if the pick-up and drop-off logistics are right.
        Tripile’s car rental hub helps you compare options across major brands while keeping dates, locations, and
        vehicle class in view. This page uses a dedicated route so search engines can index a clear “car rentals” entry
        point instead of relying on fragmented homepage parameters.
      </p>
      <p>
        Airport pickups are popular for a reason: you land, you grab keys, and you go. But city-center pick-ups can
        sometimes offer better rates for multi-day urban trips. Think about toll roads, parking costs, and total drive
        time—not only the daily rate. If you are unsure which structure fits your route, start with your flight arrival
        and work backward from real-world timing constraints.
      </p>
      <p>
        Tripile is built for multi-leg travel. Pair rentals with{" "}
        <Link to="/flights" className="text-primary font-medium hover:underline">
          flights
        </Link>{" "}
        and{" "}
        <Link to="/hotels" className="text-primary font-medium hover:underline">
          hotels
        </Link>{" "}
        when you want a coherent plan, and use{" "}
        <Link to="/flight-status" className="text-primary font-medium hover:underline">
          flight status
        </Link>{" "}
        to avoid unnecessary rental extensions caused by delays. Looking for inspiration or seasonal discounts? Visit{" "}
        <Link to="/deals" className="text-primary font-medium hover:underline">
          Tripile deals
        </Link>{" "}
        to explore timely offers that may align with your dates.
      </p>
      <p>
        Insurance coverage, fuel policies, and one-way fees vary by supplier and location. If you want a second opinion
        before you commit, Tripile’s support team can help you understand common scenarios in plain language—so you can
        drive away focused on the trip ahead, not the fine print you might have missed.
      </p>
    </article>
  );
}

/**
 * SEO-friendly hubs for flight / hotel / car search (no hash-based URLs).
 */
const SearchHubPage = () => {
  const { pathname } = useLocation();
  const config = HUB_CONFIG[pathname] ?? HUB_CONFIG["/flights"];
  const tabKey = config.defaultTab;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>{config.title}</title>
        <meta name="description" content={config.description} />
        <link rel="canonical" href={config.canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={config.canonical} />
        <meta property="og:title" content={config.title} />
        <meta property="og:description" content={config.description} />
        <meta property="og:image" content="https://tripile.com/og-image.png" />
        <meta property="og:image:secure_url" content="https://tripile.com/og-image.png" />
        <meta property="og:site_name" content="Tripile.com" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@tripile" />
        <meta name="twitter:creator" content="@tripile" />
        <meta name="twitter:title" content={config.title} />
        <meta name="twitter:description" content={config.description} />
        <meta name="twitter:image" content="https://tripile.com/og-image.png" />
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
      </Helmet>

      <Header />

      <main id="main-content" className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <header className="text-center mb-10">
            {tabKey === "flights" && (
              <Plane className="w-10 h-10 text-primary mx-auto mb-3" aria-hidden />
            )}
            {tabKey === "hotels" && (
              <Hotel className="w-10 h-10 text-primary mx-auto mb-3" aria-hidden />
            )}
            {tabKey === "cars" && <Car className="w-10 h-10 text-primary mx-auto mb-3" aria-hidden />}
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              {tabKey === "flights" && "Search cheap flights"}
              {tabKey === "hotels" && "Find hotel deals"}
              {tabKey === "cars" && "Compare car rentals"}
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
              Book with Tripile — transparent pricing, 24/7 support, and deals across flights, hotels, and cars.
            </p>
          </header>

          <div
            id="search-widget"
            className="bg-card text-card-foreground rounded-2xl shadow-xl border border-border p-3 md:p-4 relative"
          >
            <SearchWidget key={pathname} defaultTab={tabKey} />
          </div>

          <HubSeoArticle tabKey={tabKey} />

          <nav className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm" aria-label="Related search hubs">
            <Link to="/flights" className="text-primary font-medium hover:underline" title="Search flights on Tripile">
              Flights
            </Link>
            <Link to="/hotels" className="text-primary font-medium hover:underline" title="Search hotels on Tripile">
              Hotels
            </Link>
            <Link to="/car-rentals" className="text-primary font-medium hover:underline" title="Compare car rentals on Tripile">
              Car rentals
            </Link>
            <Link to="/deals" className="text-primary font-medium hover:underline" title="Travel deals on Tripile">
              Deals
            </Link>
            <Link to="/flight-status" className="text-primary font-medium hover:underline" title="Check flight status">
              Flight status
            </Link>
            <Link to="/privacy" className="text-primary font-medium hover:underline" title="Tripile privacy policy">
              Privacy policy
            </Link>
          </nav>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchHubPage;
