import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchWidget from "@/components/SearchWidget";
import FAQSchema from "@/components/seo/FAQSchema";
import NotFound from "@/pages/NotFound";
import { Shield, Clock, TrendingDown, HelpCircle, Plane, MapPin } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getFlightRoute, relatedFlightRoutes } from "@/data/flightRouteCatalog";
import { flightsToPath } from "@/data/seoLinkGraph";

function formatDuration(minutes?: number): string {
  if (!minutes) return "";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours && mins) return `${hours}h ${mins}m`;
  if (hours) return `${hours}h`;
  return `${mins}m`;
}

const CityFlightPage = () => {
  const { from, to } = useParams();
  const slug = from && to ? `${from}-to-${to}` : undefined;
  const route = getFlightRoute(slug);

  if (!route) return <NotFound />;

  const title = `Cheap Flights from ${route.origin} to ${route.destination} – Best Deals | Tripile.com`;
  const desc = `Compare cheap flights from ${route.origin} (${route.originCode}) to ${route.destination} (${route.destinationCode}). Book with Tripile's Price Match Guarantee.`;
  const canonical = `https://tripile.com/flights/${route.slug}`;
  const duration = formatDuration(route.minDurationMinutes);
  const destFlights = flightsToPath(route.destination.toLowerCase().replace(/\s+/g, "-"));

  const faqs = [
    {
      question: `What is the cheapest flight from ${route.origin} to ${route.destination}?`,
      answer: `Fares on ${route.originCode}–${route.destinationCode} change with season and demand. Tripile compares live offers across airlines so you can see the current lowest total for your dates.`,
    },
    {
      question: `Which airlines fly from ${route.origin} to ${route.destination}?`,
      answer:
        route.airlines.length > 0
          ? `Carriers observed on this route include ${route.airlines.join(", ")}. Availability depends on the travel date you search.`
          : `Multiple airlines operate ${route.origin} to ${route.destination}. Search above to see who is flying on your dates.`,
    },
    {
      question: `How long is the flight from ${route.origin} to ${route.destination}?`,
      answer: duration
        ? `The fastest observed one-way time on this route is about ${duration}. Actual duration varies by aircraft, routing and weather.`
        : `Flight time depends on the airline and whether the itinerary is nonstop. Search above to compare durations for your dates.`,
    },
    {
      question: `Does Tripile offer a price guarantee on ${route.origin} to ${route.destination} flights?`,
      answer: `Yes. If you find a cheaper fare within 24 hours of booking, we will match it and take an extra 10% off.`,
    },
  ];

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://tripile.com/" },
      { "@type": "ListItem", position: 2, name: "Flights", item: "https://tripile.com/flights" },
      { "@type": "ListItem", position: 3, name: `${route.origin} to ${route.destination}` },
    ],
  };

  const related = relatedFlightRoutes(route, 6);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://tripile.com/og-image.png" />
        <meta property="og:site_name" content="Tripile.com" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={desc} />
        <meta name="twitter:image" content="https://tripile.com/og-image.png" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbs)}</script>
      </Helmet>

      <FAQSchema faqs={faqs} />

      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link to="/flights" className="hover:text-foreground">Flights</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{route.origin} to {route.destination}</span>
          </nav>

          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Cheap Flights from {route.origin} to {route.destination}
          </h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl">
            Compare live fares from {route.origin} ({route.originCode}) to {route.destination} ({route.destinationCode})
            {duration ? `, with the fastest observed one-way around ${duration}` : ""}.
            Book with Tripile's Price Match Guarantee.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {[
              { icon: Shield, label: "Price Match Guarantee", desc: "Find it cheaper? We'll match + 10% off" },
              { icon: Clock, label: duration ? `From ${duration}` : "24/7 Support", desc: duration ? `${route.originCode} → ${route.destinationCode}` : "Expert help whenever you need it" },
              { icon: TrendingDown, label: "Live airline fares", desc: route.airlines.length ? route.airlines.slice(0, 3).join(", ") : "Compare carriers side by side" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
                <Icon className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div id="search-widget" className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-12">
            <SearchWidget defaultTab="flights" />
          </div>

          <section className="prose dark:prose-invert max-w-none mb-12">
            <h2>Flying {route.origin} ({route.originCode}) to {route.destination} ({route.destinationCode})</h2>
            <p>
              This page covers the {route.origin} to {route.destination} route. Search results are fetched live,
              so prices and schedules always reflect the dates you enter rather than a stored quote.
              {route.roundTripAvailable
                ? " Round-trip offers have been observed on this city pair."
                : " One-way searches are the most common way to price this city pair."}
            </p>
            {route.airlines.length > 0 && (
              <>
                <h2>Airlines on this route</h2>
                <p>
                  Carriers recently observed on {route.originCode}–{route.destinationCode} include {route.airlines.join(", ")}.
                  Compare their schedules and fare rules in the search results above.
                </p>
              </>
            )}
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="max-w-2xl">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-border">
                  <AccordionTrigger className="text-sm text-left hover:text-primary transition-colors">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {(related.length > 0 || destFlights) && (
            <section className="mb-12">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Plane className="w-5 h-5 text-primary" />
                Related Flight Pages
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {destFlights && (
                  <Link
                    to={destFlights}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/50 transition-all group"
                  >
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm text-foreground group-hover:text-primary font-medium">
                      All flights to {route.destination}
                    </span>
                  </Link>
                )}
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    to={`/flights/${r.slug}`}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/50 transition-all group"
                  >
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm text-foreground group-hover:text-primary font-medium">
                      {r.origin} to {r.destination}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CityFlightPage;
