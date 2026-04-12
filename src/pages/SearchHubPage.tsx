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
      "Search and compare cheap flights across the USA on Tripile.com. Compare 500+ airlines, flexible dates, and transparent fares.",
    canonical: "https://tripile.com/flights",
  },
  "/hotels": {
    defaultTab: "hotels",
    title: "Find Cheap Hotels | Tripile.com — US & International Stays",
    description:
      "Find hotel deals and compare rates for your next trip. Book stays across the USA with Tripile.com.",
    canonical: "https://tripile.com/hotels",
  },
  "/car-rentals": {
    defaultTab: "cars",
    title: "Cheap Car Rentals | Tripile.com — Compare Rates",
    description:
      "Compare car rental rates and book vehicles for your trip. Pick-up and drop-off options across the USA on Tripile.com.",
    canonical: "https://tripile.com/car-rentals",
  },
};

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
