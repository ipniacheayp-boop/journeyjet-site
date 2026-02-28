import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchWidget from "@/components/SearchWidget";
import DealsGrid from "@/components/flights/DealsGrid";
import PriceCharts from "@/components/flights/PriceCharts";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import FAQSchema from "@/components/seo/FAQSchema";
import { getDestinationBySlug, popularDestinations, airlinesData } from "@/data/destinationsData";
import { getDestinationContent } from "@/data/destinationContent";
import { useDestinationFlights } from "@/hooks/useDestinationFlights";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plane, AlertCircle, ChevronRight, MapPin, Building2,
  Calendar, Lightbulb, Route, Star, HelpCircle,
} from "lucide-react";
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

  const content = getDestinationContent(
    destination?.city || cityName,
    destCode,
    destination?.country || ""
  );

  // Get related destinations (same type, excluding current)
  const relatedDestinations = popularDestinations
    .filter((d) => d.slug !== slug)
    .slice(0, 24);

  // Popular airlines for this route
  const popularAirlines = airlinesData.filter((a) => a.popular).slice(0, 6);

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

      <FAQSchema
        faqs={content.faq.map((f) => ({
          question: f.question,
          answer: f.answer,
        }))}
      />

      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pt-24 pb-10">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-sm text-white/60 mb-6">
            <Link to="/" className="hover:text-white transition-colors">Chyeap</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/sitemap" className="hover:text-white transition-colors">Flights</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white/90">Flights to {cityName}</span>
          </nav>

          <p className="text-white/70 text-sm mb-1">Search, Compare &amp; Save Up to 60%</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-6">
            Cheapest Flights to {cityName}
            {cheapestPrice && (
              <span className="text-amber-400"> Starting from ${cheapestPrice.toFixed(0)}</span>
            )}
          </h1>

          <div className="bg-background rounded-2xl p-4 shadow-lg text-foreground">
            <SearchWidget defaultTab="flights" />
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 pb-20 max-w-6xl">

        {/* Feature Highlights */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-8 border-b border-border">
          {[
            { icon: "💰", title: "Cheap Flight Deals", desc: "Fly for less. What you see is what you pay, zero hidden cost!" },
            { icon: "✈️", title: "Tailored Flight Options", desc: "Customize every aspect of your journey to match your preferences." },
            { icon: "✅", title: "Trusted and Free", desc: "Chyeap is free to use with zero hidden charges or surprises." },
            { icon: "🌍", title: "Connecting the World", desc: "Trusted by millions of travelers. Partnered with 30+ global airlines." },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <h3 className="font-semibold text-sm text-foreground">{item.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Flight Results */}
        <section className="py-8">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Plane className="w-5 h-5 text-primary" />
            Cheap Flight Deals to {cityName}
          </h2>

          {loading && (
            <div className="space-y-4">
              <Skeleton className="h-5 w-48" />
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          )}

          {!loading && !destCode && (
            <div className="text-center py-12">
              <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                We don't have a mapped airport code for "{cityName}" yet. Try searching from the{" "}
                <Link to="/sitemap" className="text-primary hover:underline">sitemap</Link>.
              </p>
            </div>
          )}

          {!loading && error && destCode && (
            <div className="text-center py-12">
              <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-2">{error}</p>
            </div>
          )}

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
              <DealsGrid flights={flights} title="" />
            </>
          )}
        </section>

        {/* Book flights content + city image */}
        <section className="py-8 border-t border-border">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                Book Flights to {cityName} at the Best Price
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {content.description}
              </p>

              <h2 className="text-2xl font-bold text-foreground mb-3">
                Why Visit {cityName}?
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {content.whyVisit}
              </p>
            </div>
            <div className="lg:col-span-2">
              <div className="rounded-2xl overflow-hidden shadow-lg h-full min-h-[250px]">
                <img
                  src={`https://source.unsplash.com/600x400/?${encodeURIComponent(cityName + ' city skyline')}`}
                  alt={`${cityName} cityscape`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Price Trend Charts */}
        <PriceCharts
          cityName={cityName}
          dayData={content.priceByDay}
          monthData={content.priceByMonth}
          cheapestDay={content.cheapestDay}
          cheapestMonth={content.cheapestMonth}
          expensiveMonth={content.expensiveMonth}
        />

        {/* How to Find Cheap Flights */}
        <section className="py-8 border-t border-border">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            How to Find Cheap Flights to {cityName}?
          </h2>
          <p className="text-muted-foreground mb-4">
            Getting a great deal on airfare doesn't have to be hard. Here are some smart tips:
          </p>
          <ul className="space-y-3 max-w-3xl">
            {content.travelTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-0.5">•</span>
                <span dangerouslySetInnerHTML={{ __html: tip.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') }} />
              </li>
            ))}
          </ul>
        </section>

        {/* Major Airports */}
        <section className="py-8 border-t border-border">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Major Airports in {cityName}
          </h2>
          <p className="text-muted-foreground mb-4 text-sm">
            When booking, it helps to know the different airports in {cityName}:
          </p>
          <ul className="space-y-2 max-w-2xl">
            {content.airports.map((airport) => (
              <li key={airport.code} className="text-sm text-muted-foreground">
                <strong className="text-foreground">{airport.name} ({airport.code})</strong> – {airport.note}
              </li>
            ))}
          </ul>
        </section>

        {/* Popular Flight Routes */}
        <section className="py-8 border-t border-border">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Route className="w-5 h-5 text-primary" />
            Popular Flight Routes from {cityName}
          </h2>
          <ul className="space-y-2 max-w-xl">
            {content.popularRoutes.map((route) => (
              <li key={route.slug}>
                <Link
                  to={`/flights-to-${route.slug}`}
                  className="text-sm text-primary hover:underline transition-colors"
                >
                  Flights from {cityName} to {route.from}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Best Places to Stay */}
        <section className="py-8 border-t border-border">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Best Places to Visit in {cityName}
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            Planning your next trip with a flight to {cityName}? Here are the top areas to explore:
          </p>
          <ul className="space-y-3 max-w-3xl">
            {content.bestPlaces.map((place) => (
              <li key={place.name} className="text-sm text-muted-foreground">
                <strong className="text-foreground">{place.name}:</strong> {place.description}
              </li>
            ))}
          </ul>
        </section>

        {/* Airlines */}
        <section className="py-8 border-t border-border">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Plane className="w-5 h-5 text-primary" />
            Airlines Offering the Best {cityName} Flight Deals
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            Several top airlines frequently offer discounted fares to {cityName}. These include:
          </p>
          <ul className="space-y-2 max-w-xl">
            {popularAirlines.map((airline) => (
              <li key={airline.slug}>
                <Link
                  to={`/airlines/${airline.slug}`}
                  className="text-sm text-primary hover:underline transition-colors"
                >
                  {airline.name} Flights to {cityName}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            Each offers a variety of services depending on your budget — from basic economy to first class.
          </p>
        </section>

        {/* Why Book with Chyeap */}
        <section className="py-8 border-t border-border">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Why Book with Chyeap?
          </h2>
          <p className="text-muted-foreground text-sm mb-3">
            Here's why travelers trust <strong className="text-foreground">Chyeap</strong> for booking flights to {cityName}:
          </p>
          <ul className="space-y-1.5 max-w-xl">
            {[
              "Real-time fare comparison",
              "User-friendly interface",
              "No hidden fees",
              "Flight alerts for your preferred dates",
              "Exclusive offers from top airlines",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-primary">•</span> {item}
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground mt-4">
            If you're ready to explore {cityName} without breaking the bank, start your journey now. With a little planning and the right tools, finding cheap flights to {cityName} is totally doable.
          </p>
          <p className="text-sm font-semibold text-primary mt-3">
            Compare, book, and save on flights to {cityName} today — only at Chyeap!
          </p>
        </section>

        {/* FAQ */}
        <section className="py-8 border-t border-border">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="max-w-2xl">
            {content.faq.map((item, i) => (
              <AccordionItem key={i} value={`q${i}`}>
                <AccordionTrigger className="text-sm text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Related Destinations */}
        <section className="py-8 border-t border-border">
          <h2 className="text-2xl font-bold text-foreground mb-5">
            Related Popular Destinations
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-1">
            {relatedDestinations.map((dest) => (
              <Link
                key={dest.slug}
                to={`/flights-to-${dest.slug}`}
                className="group flex items-center gap-2 py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-primary/50 group-hover:text-primary shrink-0 transition-colors" />
                <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                  Flights to {dest.city}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
