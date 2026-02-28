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

// Import destination images
import citySkyline from "@/assets/destinations/city-skyline-1.jpg";
import beachTropical from "@/assets/destinations/beach-tropical-2.jpg";
import europeHistoric from "@/assets/destinations/europe-historic-3.jpg";
import asianCity from "@/assets/destinations/asian-city-4.jpg";
import mountain from "@/assets/destinations/mountain-5.jpg";
import desertCity from "@/assets/destinations/desert-city-6.jpg";

const destinationImages = [citySkyline, beachTropical, europeHistoric, asianCity, mountain, desertCity];

// Map regions to image indices for better matching
const regionImageMap: Record<string, number> = {
  US: 0, UK: 2, France: 2, Italy: 2, Spain: 2, Germany: 2, Netherlands: 2, Greece: 2, Portugal: 2, Ireland: 2, Switzerland: 2, Austria: 2,
  Japan: 3, China: 3, "South Korea": 3, Singapore: 3, Thailand: 3, India: 3, Vietnam: 3, Philippines: 3, Indonesia: 3, Malaysia: 3,
  UAE: 5, Turkey: 5, Egypt: 5, Qatar: 5, "Saudi Arabia": 5, Morocco: 5, Jordan: 5,
  Mexico: 1, Brazil: 1, Colombia: 1, "Costa Rica": 1, Jamaica: 1, "Dominican Republic": 1, Peru: 4,
  Canada: 4, Iceland: 4, Norway: 4, "New Zealand": 4, Australia: 1,
};

function getDestinationImage(country: string, slug: string): string {
  if (country && regionImageMap[country] !== undefined) {
    return destinationImages[regionImageMap[country]];
  }
  // Hash the slug for consistent assignment
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) % destinationImages.length;
  return destinationImages[Math.abs(hash) % destinationImages.length];
}

function titleCase(s: string) {
  return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Color palette for section accents
const sectionColors = [
  "from-blue-500/10 to-cyan-500/10",
  "from-amber-500/10 to-orange-500/10",
  "from-emerald-500/10 to-teal-500/10",
  "from-purple-500/10 to-pink-500/10",
  "from-rose-500/10 to-red-500/10",
];

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

  const relatedDestinations = popularDestinations
    .filter((d) => d.slug !== slug)
    .slice(0, 24);

  const popularAirlines = airlinesData.filter((a) => a.popular).slice(0, 6);
  const cityImage = getDestinationImage(destination?.country || "", slug || "");

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={`https://chyeap.lovable.app/flights-to/${slug}`} />
      </Helmet>

      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chyeap.lovable.app/" },
          { name: "Sitemap", url: "https://chyeap.lovable.app/sitemap" },
          { name: `Flights to ${cityName}`, url: `https://chyeap.lovable.app/flights-to/${slug}` },
        ]}
      />

      <FAQSchema
        faqs={content.faq.map((f) => ({
          question: f.question,
          answer: f.answer,
        }))}
      />

      <Header />

      {/* Hero Section with gradient */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white pt-24 pb-10 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
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
        {/* Feature Highlights - colorful cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-8 border-b border-border">
          {[
            { icon: "💰", title: "Cheap Flight Deals", desc: "Fly for less. What you see is what you pay, zero hidden cost!", color: "from-emerald-500/15 to-green-500/5 hover:from-emerald-500/25 hover:to-green-500/10" },
            { icon: "✈️", title: "Tailored Flight Options", desc: "Customize every aspect of your journey to match your preferences.", color: "from-blue-500/15 to-cyan-500/5 hover:from-blue-500/25 hover:to-cyan-500/10" },
            { icon: "✅", title: "Trusted and Free", desc: "Chyeap is free to use with zero hidden charges or surprises.", color: "from-amber-500/15 to-orange-500/5 hover:from-amber-500/25 hover:to-orange-500/10" },
            { icon: "🌍", title: "Connecting the World", desc: "Trusted by millions of travelers. Partnered with 30+ global airlines.", color: "from-purple-500/15 to-pink-500/5 hover:from-purple-500/25 hover:to-pink-500/10" },
          ].map((item) => (
            <div
              key={item.title}
              className={`flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br ${item.color} border border-transparent hover:border-primary/20 hover:shadow-md transition-all duration-300 cursor-default group`}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
              <div>
                <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
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
                <Star className="w-5 h-5 text-amber-500" />
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
              <div className="rounded-2xl overflow-hidden shadow-lg h-full min-h-[250px] group cursor-pointer relative">
                <img
                  src={cityImage}
                  alt={`${cityName} cityscape`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-lg font-bold">{cityName}</p>
                    <p className="text-sm text-white/80">{destination?.country || ""}</p>
                  </div>
                </div>
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
        <section className={`py-8 border-t border-border rounded-xl`}>
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            How to Find Cheap Flights to {cityName}?
          </h2>
          <p className="text-muted-foreground mb-4">
            Getting a great deal on airfare doesn't have to be hard. Here are some smart tips:
          </p>
          <ul className="space-y-3 max-w-3xl">
            {content.travelTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground p-3 rounded-lg hover:bg-gradient-to-r hover:from-amber-500/5 hover:to-transparent transition-all duration-200 group">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 text-xs font-bold shrink-0 group-hover:bg-amber-500/30 transition-colors">{i + 1}</span>
                <span dangerouslySetInnerHTML={{ __html: tip.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') }} />
              </li>
            ))}
          </ul>
        </section>

        {/* Major Airports */}
        <section className="py-8 border-t border-border">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            Major Airports in {cityName}
          </h2>
          <p className="text-muted-foreground mb-4 text-sm">
            When booking, it helps to know the different airports in {cityName}:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
            {content.airports.map((airport) => (
              <div key={airport.code} className="flex items-start gap-3 p-4 rounded-xl border border-border hover:border-blue-500/30 hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-transparent transition-all duration-200 group">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500/15 text-blue-600 font-bold text-xs shrink-0 group-hover:bg-blue-500/25 transition-colors">
                  {airport.code}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{airport.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{airport.note}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Flight Routes */}
        <section className="py-8 border-t border-border">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Route className="w-5 h-5 text-emerald-500" />
            Popular Flight Routes from {cityName}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl">
            {content.popularRoutes.map((route) => (
              <Link
                key={route.slug}
                to={`/flights-to/${route.slug}`}
                className="flex items-center gap-2 p-3 rounded-lg text-sm text-muted-foreground hover:text-primary hover:bg-gradient-to-r hover:from-emerald-500/5 hover:to-transparent transition-all duration-200 group"
              >
                <Plane className="w-3.5 h-3.5 text-emerald-500/50 group-hover:text-emerald-500 transition-colors shrink-0" />
                <span className="group-hover:translate-x-0.5 transition-transform">
                  Flights from {cityName} to {route.from}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Best Places to Visit */}
        <section className="py-8 border-t border-border">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-rose-500" />
            Best Places to Visit in {cityName}
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            Planning your next trip with a flight to {cityName}? Here are the top areas to explore:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl">
            {content.bestPlaces.map((place, i) => (
              <div key={place.name} className="p-4 rounded-xl border border-border hover:border-rose-500/30 hover:shadow-md hover:bg-gradient-to-br hover:from-rose-500/5 hover:to-transparent transition-all duration-300 group">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-500/15 text-rose-500 text-xs font-bold group-hover:bg-rose-500/25 transition-colors">{i + 1}</span>
                  <h4 className="font-semibold text-sm text-foreground group-hover:text-rose-600 transition-colors">{place.name}</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pl-9">{place.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Airlines */}
        <section className="py-8 border-t border-border">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Plane className="w-5 h-5 text-purple-500" />
            Airlines Offering the Best {cityName} Flight Deals
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            Several top airlines frequently offer discounted fares to {cityName}. These include:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-w-3xl">
            {popularAirlines.map((airline) => (
              <Link
                key={airline.slug}
                to={`/airlines/${airline.slug}`}
                className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-purple-500/30 hover:bg-gradient-to-r hover:from-purple-500/5 hover:to-transparent transition-all duration-200 group"
              >
                <div className="w-8 h-8 rounded-full bg-purple-500/15 flex items-center justify-center group-hover:bg-purple-500/25 transition-colors">
                  <Plane className="w-4 h-4 text-purple-500" />
                </div>
                <span className="text-sm text-foreground group-hover:text-purple-600 transition-colors font-medium">
                  {airline.name}
                </span>
              </Link>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Each offers a variety of services depending on your budget — from basic economy to first class.
          </p>
        </section>

        {/* Why Book with Chyeap */}
        <section className="py-8 border-t border-border">
          <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 rounded-2xl p-6 md:p-8 border border-primary/10">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Why Book with Chyeap?
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              Here's why travelers trust <strong className="text-foreground">Chyeap</strong> for booking flights to {cityName}:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
              {[
                { text: "Real-time fare comparison", icon: "🔍" },
                { text: "User-friendly interface", icon: "💻" },
                { text: "No hidden fees", icon: "💎" },
                { text: "Flight alerts for your preferred dates", icon: "🔔" },
                { text: "Exclusive offers from top airlines", icon: "⭐" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-colors group">
                  <span className="text-lg group-hover:scale-110 transition-transform">{item.icon}</span>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{item.text}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-5">
              If you're ready to explore {cityName} without breaking the bank, start your journey now.
            </p>
            <p className="text-sm font-semibold text-primary mt-2">
              Compare, book, and save on flights to {cityName} today — only at Chyeap!
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-8 border-t border-border">
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-500" />
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="max-w-2xl">
            {content.faq.map((item, i) => (
              <AccordionItem key={i} value={`q${i}`} className="border-border hover:bg-muted/30 rounded-lg transition-colors px-2">
                <AccordionTrigger className="text-sm text-left hover:text-primary transition-colors">
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
                to={`/flights-to/${dest.slug}`}
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
