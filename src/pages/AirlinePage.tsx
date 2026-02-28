import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FlightSearchBar from "@/components/flights/FlightSearchBar";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import FAQSchema from "@/components/seo/FAQSchema";
import { getAirlineBySlug } from "@/data/destinationsData";
import { ChevronRight, Plane, Tag, SlidersHorizontal, ShieldCheck, Globe, Sparkles } from "lucide-react";
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

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" as const },
  }),
};

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
      gradient: "from-orange-500/10 to-amber-500/10",
      iconColor: "text-orange-500",
      borderColor: "border-orange-200 dark:border-orange-800/30",
    },
    {
      icon: SlidersHorizontal,
      title: "Tailored Flight Options",
      desc: "Customize every aspect of your journey to match your preferences.",
      gradient: "from-blue-500/10 to-cyan-500/10",
      iconColor: "text-blue-500",
      borderColor: "border-blue-200 dark:border-blue-800/30",
    },
    {
      icon: ShieldCheck,
      title: "Trusted and Free",
      desc: "Chyeap is free to use with zero hidden charges or surprises.",
      gradient: "from-emerald-500/10 to-green-500/10",
      iconColor: "text-emerald-500",
      borderColor: "border-emerald-200 dark:border-emerald-800/30",
    },
    {
      icon: Globe,
      title: "Connecting the World",
      desc: "Trusted by millions of travelers. Partnered with over 500+ global airlines.",
      gradient: "from-purple-500/10 to-violet-500/10",
      iconColor: "text-purple-500",
      borderColor: "border-purple-200 dark:border-purple-800/30",
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

      <FAQSchema faqs={faqs.map((f) => ({ question: f.q, answer: f.a }))} />

      <Header />

      <main className="pt-20">
        {/* Hero section with gradient */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/70 text-primary-foreground py-12 md:py-16">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMCBoNjAgdjYwIEgwIFoiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCBmaWxsPSJ1cmwoI2cpIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIi8+PC9zdmc+')] opacity-40" />
          <div className="container mx-auto px-4 max-w-6xl relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 opacity-80" />
                <span className="text-sm font-medium opacity-80">Compare & Save</span>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-3">
                <Plane className="w-7 h-7" />
                Compare {displayName} Flights
              </h1>
              <p className="text-sm opacity-80 mb-6 max-w-xl">
                Search across hundreds of travel sites to find the best {displayName} ({code}) deals.
              </p>
            </motion.div>
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
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ y: -4, scale: 1.02 }}
                className={`flex items-start gap-3 p-5 rounded-xl bg-gradient-to-br ${f.gradient} border ${f.borderColor} cursor-default transition-shadow hover:shadow-lg`}
              >
                <div className={`p-2.5 rounded-lg bg-background/80 shrink-0 shadow-sm`}>
                  <f.icon className={`w-5 h-5 ${f.iconColor}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">{f.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Price trend charts */}
        <section className="container mx-auto px-4 max-w-6xl py-8">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xl md:text-2xl font-semibold text-foreground mb-2"
          >
            When is the Best Time to Book a Flight with {displayName}?
          </motion.h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
            {/* Day of week chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="font-semibold text-foreground mb-2">
                Cheapest Day of the Week to Fly with {displayName}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                It's recommended to look for departures on <strong>{cheapestDay.day}</strong>. Weekends tend to have higher prices.
              </p>
              <div className="border border-border rounded-xl p-4 bg-card hover:shadow-md transition-shadow">
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
                    className="inline-block px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 hover:shadow-md transition-all"
                  >
                    Search Cheap Flights
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Month chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="font-semibold text-foreground mb-2">
                Cheapest Month to Fly with {displayName}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Historically, <strong>{cheapestMonth.month}</strong> has been the cheapest month. The most expensive tends to be <strong>{expensiveMonth.month}</strong>.
              </p>
              <div className="border border-border rounded-xl p-4 bg-card hover:shadow-md transition-shadow">
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
                    className="inline-block px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 hover:shadow-md transition-all"
                  >
                    Search Cheap Flights
                  </Link>
                </div>
              </div>
            </motion.div>
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
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border border-border rounded-xl p-6 bg-card max-w-4xl hover:shadow-sm transition-shadow"
          >
            <Accordion type="single" collapsible>
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-sm text-left hover:text-primary transition-colors">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </section>

        {/* Save money highlights */}
        <section className="bg-gradient-to-br from-accent/40 via-accent/20 to-background py-12 mt-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-6">
              Save money when you book flights with Chyeap
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { emoji: "🛍️", title: "Big names and deals", desc: "Search 100s of travel sites to compare prices.", hoverBorder: "hover:border-orange-300" },
                { emoji: "⚙️", title: "Filter for what you want", desc: "Free Wi-Fi? Stopover? Instantly customize your results.", hoverBorder: "hover:border-blue-300" },
                { emoji: "🔒", title: "Trusted and free", desc: "We're completely free to use – no hidden charges or fees.", hoverBorder: "hover:border-emerald-300" },
                { emoji: "🔔", title: "Price Alerts", desc: "Not ready to book? Create a price alert to track prices.", hoverBorder: "hover:border-purple-300" },
              ].map((item) => (
                <motion.div
                  key={item.title}
                  whileHover={{ y: -3, scale: 1.01 }}
                  className={`p-5 rounded-xl bg-card border border-border/50 ${item.hoverBorder} hover:shadow-lg transition-all cursor-default`}
                >
                  <p className="text-lg mb-1">
                    {item.emoji} <span className="font-semibold text-sm text-foreground">{item.title}</span>
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                to="/"
                className="inline-block px-8 py-3 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                Search Cheap Flights
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
