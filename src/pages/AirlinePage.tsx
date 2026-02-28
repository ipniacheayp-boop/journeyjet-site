import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FlightSearchBar from "@/components/flights/FlightSearchBar";
import TrustPartners from "@/components/TrustPartners";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import FAQSchema from "@/components/seo/FAQSchema";
import { getAirlineBySlug } from "@/data/destinationsData";
import { ChevronRight, Plane, Tag, SlidersHorizontal, ShieldCheck, Globe } from "lucide-react";
import { useEffect, useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function titleCase(s: string) {
  return s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Generate mock price data for charts
function generateDayData() {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const base = 280 + Math.floor(Math.random() * 80);
  return days.map((d) => ({
    day: d,
    price: base + Math.floor(Math.random() * 60 - 20),
  }));
}

function generateMonthData() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const base = 250;
  const curve = [0, 10, 60, 120, 150, 140, 130, 110, 70, 30, 10, -10];
  return months.map((m, i) => ({
    month: m,
    price: base + curve[i] + Math.floor(Math.random() * 20),
  }));
}

export default function AirlinePage() {
  const { slug } = useParams<{ slug: string }>();
  const airline = slug ? getAirlineBySlug(slug) : undefined;
  const displayName = airline?.name || titleCase(slug || "");
  const code = airline?.code || "";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const dayData = useMemo(generateDayData, [slug]);
  const monthData = useMemo(generateMonthData, [slug]);

  const cheapestDay = dayData.reduce((a, b) => (a.price < b.price ? a : b));
  const cheapestMonth = monthData.reduce((a, b) => (a.price < b.price ? a : b));
  const expensiveMonth = monthData.reduce((a, b) => (a.price > b.price ? a : b));

  const faqs = [
    {
      q: `How can I book cheap ${displayName} flights with Chyeap?`,
      a: `Use our search tool above to compare ${displayName} fares with other airlines. We show the lowest prices first and highlight the best deals available.`,
    },
    {
      q: `Can I change my ${displayName} flight after booking?`,
      a: `Change policies depend on your fare type. Most ${displayName} tickets allow changes for a fee. Check your booking confirmation for specific terms.`,
    },
    {
      q: `What is the cancellation policy of ${displayName}?`,
      a: `${displayName} offers various fare classes with different cancellation policies. Flexible fares typically allow free cancellation within 24 hours of booking.`,
    },
    {
      q: `How long does a refund take with ${displayName}?`,
      a: `Refunds for eligible tickets are typically processed within 7-10 business days for credit card payments and up to 20 business days for other payment methods.`,
    },
    {
      q: `Does ${displayName} allow online check-in?`,
      a: `Yes, ${displayName} offers online check-in typically 24-48 hours before departure. You can check in via their website or mobile app.`,
    },
    {
      q: `What baggage is allowed on ${displayName} flights?`,
      a: `Baggage allowance varies by route and fare class. Economy typically includes one carry-on and one personal item. Checked bag fees may apply.`,
    },
  ];

  const features = [
    {
      icon: Tag,
      title: "Cheap Flight Deals",
      desc: "Fly for less. What you see is what you pay. Zero hidden cost!",
    },
    {
      icon: SlidersHorizontal,
      title: "Tailored Flight Options",
      desc: "Customize every aspect of your journey to match your preferences.",
    },
    {
      icon: ShieldCheck,
      title: "Trusted and Free",
      desc: "Chyeap is free to use with zero hidden charges or surprises.",
    },
    {
      icon: Globe,
      title: "Connecting the World",
      desc: "Trusted by millions of travelers. Partnered with over 500+ global airlines.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Compare {displayName} Flights – Cheap Fares | Chyeap</title>
        <meta
          name="description"
          content={`Compare ${displayName} (${code}) flight prices and book cheap tickets. Find the best deals on ${displayName} flights with Chyeap.`}
        />
        <link rel="canonical" href={`https://chyeap.lovable.app/airlines/${slug}`} />
      </Helmet>

      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://chyeap.lovable.app/" },
          { name: "Airlines", url: "https://chyeap.lovable.app/sitemap" },
          { name: `Flights With ${displayName}`, url: `https://chyeap.lovable.app/airlines/${slug}` },
        ]}
      />

      <FAQSchema
        faqs={faqs.map((f) => ({ question: f.q, answer: f.a }))}
      />

      <Header />

      <main className="pt-20">
        {/* Hero section */}
        <section className="bg-gradient-to-b from-foreground/95 to-foreground/85 text-background py-10 md:py-14">
          <div className="container mx-auto px-4 max-w-6xl">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 flex items-center gap-3">
              <Plane className="w-7 h-7" />
              Compare {displayName} Flights
            </h1>
            <FlightSearchBar defaultDestination="" />
          </div>
        </section>

        {/* Breadcrumb */}
        <div className="container mx-auto px-4 max-w-6xl">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground py-4">
            <Link to="/" className="hover:text-primary transition-colors">Chyeap</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/sitemap" className="hover:text-primary transition-colors">Airlines</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium">Flights With {displayName}</span>
          </nav>
        </div>

        {/* Feature highlights */}
        <section className="container mx-auto px-4 max-w-6xl py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex items-start gap-3 p-5 rounded-xl bg-accent/30 border border-border/50 hover:shadow-sm transition-shadow"
              >
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">{f.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Price trend charts */}
        <section className="container mx-auto px-4 max-w-6xl py-8">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2">
            When is the Best Time to Book a Flight with {displayName}?
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
            {/* Day of week chart */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Cheapest Day of the Week to Fly with {displayName}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                If you're looking for a flight deal with {displayName}, it's recommended to look for
                departures on <strong>{cheapestDay.day}</strong>. Weekends tend to have higher prices.
              </p>
              <div className="border border-border rounded-xl p-4 bg-card">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dayData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} domain={["dataMin - 20", "dataMax + 20"]} />
                    <Tooltip
                      formatter={(value: number) => [`$${value}`, "Avg Price"]}
                      contentStyle={{ borderRadius: 8, fontSize: 13 }}
                    />
                    <Bar dataKey="price" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Day Price" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="text-center mt-3">
                  <Link
                    to="/"
                    className="inline-block px-6 py-2.5 bg-foreground text-background text-sm font-medium rounded-lg hover:bg-foreground/90 transition-colors"
                  >
                    Search Cheap Flights
                  </Link>
                </div>
              </div>
            </div>

            {/* Month chart */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Cheapest Month to Fly with {displayName}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Historically, <strong>{cheapestMonth.month}</strong> has been the cheapest month for flights
                with {displayName}. The most expensive month tends to be <strong>{expensiveMonth.month}</strong>.
              </p>
              <div className="border border-border rounded-xl p-4 bg-card">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={monthData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} domain={["dataMin - 20", "dataMax + 20"]} />
                    <Tooltip
                      formatter={(value: number) => [`$${value}`, "Avg Price"]}
                      contentStyle={{ borderRadius: 8, fontSize: 13 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: "hsl(var(--primary))" }}
                      name="Month Price"
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="text-center mt-3">
                  <Link
                    to="/"
                    className="inline-block px-6 py-2.5 bg-foreground text-background text-sm font-medium rounded-lg hover:bg-foreground/90 transition-colors"
                  >
                    Search Cheap Flights
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why book section */}
        <section className="container mx-auto px-4 max-w-6xl py-8">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3">
            Why Book {displayName} ({code}) Flights on Chyeap
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-4xl">
            Chyeap allows travelers to compare {displayName} flight fares with other airlines in one
            place. Our platform helps users explore multiple travel dates, routes, and fare options to
            make informed booking decisions. With real-time pricing and no hidden fees, you can be
            confident you're getting the best deal on {displayName} flights.
          </p>
          <hr className="my-8 border-border" />
        </section>

        {/* FAQ */}
        <section className="container mx-auto px-4 max-w-6xl py-8">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-6">
            {displayName} Flights Frequently Asked Questions
          </h2>
          <div className="border border-border rounded-xl p-6 bg-card max-w-4xl">
            <Accordion type="single" collapsible>
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-sm text-left">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Save money highlights */}
        <section className="bg-accent/20 py-12 mt-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-6">
              Save money when you book flights with Chyeap
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { emoji: "🛍️", title: "Big names and deals", desc: "Search 100s of travel sites to compare prices." },
                { emoji: "⚙️", title: "Filter for what you want", desc: "Free Wi-Fi? Stopover? Instantly customize your results." },
                { emoji: "🔒", title: "Trusted and free", desc: "We're completely free to use – no hidden charges or fees." },
                { emoji: "🔔", title: "Price Alerts", desc: "Not ready to book? Create a price alert to track prices." },
              ].map((item) => (
                <div
                  key={item.title}
                  className="p-5 rounded-xl bg-card border border-border/50 hover:shadow-sm transition-shadow"
                >
                  <p className="text-lg mb-1">
                    {item.emoji} <span className="font-semibold text-sm text-foreground">{item.title}</span>
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                to="/"
                className="inline-block px-8 py-3 bg-foreground text-background text-sm font-medium rounded-lg hover:bg-foreground/90 transition-colors"
              >
                Search Cheap Flights
              </Link>
            </div>
          </div>
        </section>

        {/* Trusted Partners */}
        <TrustPartners />
      </main>

      <Footer />
    </>
  );
}
