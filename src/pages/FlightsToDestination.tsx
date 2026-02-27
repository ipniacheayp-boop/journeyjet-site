import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FlightSearchBar from "@/components/flights/FlightSearchBar";
import DealsGrid from "@/components/flights/DealsGrid";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { getDestinationBySlug, popularDestinations } from "@/data/destinationsData";
import { useDestinationFlights } from "@/hooks/useDestinationFlights";
import { Skeleton } from "@/components/ui/skeleton";
import { Plane, AlertCircle, ChevronRight } from "lucide-react";
import { useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function titleCase(s: string) {
  return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function FlightsToDestination() {
  const { slug } = useParams<{ slug: string }>();
  const cityName = titleCase(slug || "");
  const destination = slug ? getDestinationBySlug(slug) : undefined;
  const destCode = destination?.iataCode || "";

  const { flights, loading, error, searchDate } = useDestinationFlights(destCode);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const cheapestPrice = flights.length
    ? Math.min(...flights.map((f) => f.price))
    : null;

  const metaTitle = cheapestPrice
    ? `Cheap Flights to ${cityName} from $${cheapestPrice.toFixed(0)} | Chyeap`
    : `Cheap Flights to ${cityName} | Chyeap`;

  const metaDescription = cheapestPrice
    ? `Find cheap flights to ${cityName} starting from $${cheapestPrice.toFixed(0)}. Compare prices across top airlines and book today.`
    : `Compare and book cheap flights to ${cityName}. Best deals across 30+ airlines.`;

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={`https://chyeap.lovable.app/flights-to-${slug}`} />
      </Helmet>

      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chyeap.lovable.app/" },
          { name: "Sitemap", url: "https://chyeap.lovable.app/sitemap" },
          { name: `Flights to ${cityName}`, url: `https://chyeap.lovable.app/flights-to-${slug}` },
        ]}
      />

      <Header />

      <main className="container mx-auto px-4 pt-24 pb-20 max-w-5xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/sitemap" className="hover:text-primary transition-colors">Sitemap</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium">Flights to {cityName}</span>
        </nav>

        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3 mb-2">
            <Plane className="w-7 h-7 text-primary" />
            Cheap Flights to {cityName}
          </h1>
          {destination && (
            <p className="text-muted-foreground">
              {destination.country} · Airport code: <strong>{destination.iataCode}</strong>
            </p>
          )}
          {!destination && (
            <p className="text-muted-foreground">
              Searching flights to {cityName}...
            </p>
          )}
        </div>

        {/* Search bar */}
        <div className="mb-8">
          <FlightSearchBar defaultDestination={cityName} />
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-5 w-48" />
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        )}

        {/* No destination code */}
        {!loading && !destCode && (
          <div className="text-center py-12">
            <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              We don't have a mapped airport code for "{cityName}" yet. Try searching from the{" "}
              <Link to="/sitemap" className="text-primary hover:underline">sitemap</Link>.
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && destCode && (
          <div className="text-center py-12">
            <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-2">{error}</p>
            <p className="text-xs text-muted-foreground">
              Showing results for: {searchDate}
            </p>
          </div>
        )}

        {/* Flights */}
        {!loading && flights.length > 0 && (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Showing flights for{" "}
              <strong>
                {new Date(searchDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </strong>{" "}
              · {flights.length} result{flights.length !== 1 ? "s" : ""}
            </p>
            <DealsGrid flights={flights} title={`Top Deals to ${cityName}`} />
          </>
        )}

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-xl font-semibold mb-4 text-foreground">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="max-w-2xl">
            <AccordionItem value="q1">
              <AccordionTrigger className="text-sm">
                When is the cheapest time to fly to {cityName}?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Prices vary by season. Generally, mid-week flights (Tuesday–Thursday) and
                off-peak months offer the lowest fares. We recommend booking 1–3 months ahead.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q2">
              <AccordionTrigger className="text-sm">
                Which airlines fly to {cityName}?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Multiple major airlines operate flights to {cityName}. Use our search tool above
                to see all available options with real-time pricing.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q3">
              <AccordionTrigger className="text-sm">
                Are prices inclusive of taxes and fees?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Yes, the prices displayed include all taxes and fees. The final booking amount
                may vary slightly due to currency conversion.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </main>

      <Footer />
    </>
  );
}
