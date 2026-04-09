import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchWidget from "@/components/SearchWidget";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import FAQSchema from "@/components/seo/FAQSchema";
import { Shield, Clock, TrendingDown, HelpCircle, Plane, MapPin } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const CityFlightPage = () => {
  const { from, to } = useParams();

  const formatCity = (slug: string = "") =>
    slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const fromCity = formatCity(from);
  const toCity = formatCity(to);
  const title = `Cheap Flights from ${fromCity} to ${toCity} – Best Deals | Tripile.com`;
  const desc = `Buy cheap flights from ${fromCity} to ${toCity}. Compare 500+ airlines, read reviews, get price alerts & book with our Price Match Guarantee. Best ${fromCity} to ${toCity} flight deals on Tripile.com.`;

  const faqs = [
    { question: `What is the cheapest flight from ${fromCity} to ${toCity}?`, answer: `Flight prices vary by season. Use Tripile.com to compare fares across 500+ airlines and find the cheapest option for your travel dates.` },
    { question: `How far in advance should I book ${fromCity} to ${toCity} flights?`, answer: `For the best prices, book 2-3 weeks ahead for domestic routes or 1-2 months for international. Midweek departures are typically 20-30% cheaper.` },
    { question: `Which airlines fly from ${fromCity} to ${toCity}?`, answer: `Multiple airlines operate this route. Tripile.com compares all available carriers to show you the best fares and schedules.` },
    { question: `Does Tripile.com offer a price guarantee on ${fromCity} to ${toCity} flights?`, answer: `Yes! Our Price Match Guarantee means if you find a cheaper fare within 24 hours of booking, we'll match it plus give you an extra 10% off.` },
  ];

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://tripile.com/" },
      { "@type": "ListItem", position: 2, name: "Flights", item: "https://tripile.com/deals" },
      { "@type": "ListItem", position: 3, name: `${fromCity} to ${toCity}` },
    ],
  };

  const relatedRoutes = [
    { from: "new-york", to: "los-angeles" },
    { from: "chicago", to: "miami" },
    { from: "san-francisco", to: "seattle" },
    { from: "dallas", to: "denver" },
    { from: "boston", to: "orlando" },
    { from: "atlanta", to: "las-vegas" },
  ].filter(r => !(r.from === from && r.to === to)).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <meta name="keywords" content={`${fromCity} to ${toCity} flights, cheap flights ${fromCity} ${toCity}, buy ${toCity} flights, ${fromCity} ${toCity} flight deals, ${toCity} flight reviews`} />
        <link rel="canonical" href={`https://tripile.com/flights/${from}-to-${to}`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={`https://tripile.com/flights/${from}-to-${to}`} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbs)}</script>
      </Helmet>

      <FAQSchema faqs={faqs} />

      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link to="/deals" className="hover:text-foreground">Flights</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{fromCity} to {toCity}</span>
          </nav>

          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Cheap Flights from {fromCity} to {toCity}
          </h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl">
            Compare prices across 500+ airlines and find the best deals for your trip from {fromCity} to {toCity}. Book today with our Price Match Guarantee and save up to 46%.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {[
              { icon: Shield, label: "Price Match Guarantee", desc: "Find it cheaper? We'll match + 10% off" },
              { icon: Clock, label: "24/7 Support", desc: "Expert help whenever you need it" },
              { icon: TrendingDown, label: "Best Price Alerts", desc: "Get notified when prices drop" },
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

          {/* SEO Content Section */}
          <section className="prose dark:prose-invert max-w-none mb-12">
            <h2>Tips for Finding Cheap {fromCity} to {toCity} Flights</h2>
            <p>
              Looking to buy the best {fromCity} to {toCity} flight deal? Tripile.com compares fares across hundreds of airlines to bring you the lowest prices available. Whether you're planning a last-minute trip or booking well in advance, here's how to save:
            </p>
            <ul>
              <li><strong>Book 2-3 weeks in advance</strong> for domestic routes or 1-2 months for international flights</li>
              <li><strong>Be flexible with dates</strong> — midweek flights are often 20-30% cheaper than weekends</li>
              <li><strong>Set up price alerts</strong> to get notified when fares drop for this route</li>
              <li><strong>Consider nearby airports</strong> for potentially lower fares</li>
              <li><strong>Use our Price Match Guarantee</strong> — find it cheaper elsewhere and we'll match the price</li>
            </ul>

            <h2>Why Book {fromCity} to {toCity} Flights on Tripile.com?</h2>
            <p>
              Tripile.com is trusted by over 2 million travelers to find the cheapest flight deals. We search 500+ airlines simultaneously, show transparent pricing with zero hidden fees, and back every booking with our Price Match Guarantee and 24/7 expert support.
            </p>
          </section>

          {/* FAQ Section */}
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

          {/* Internal Links - Related Routes */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Plane className="w-5 h-5 text-primary" />
              Popular Flight Routes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {relatedRoutes.map(r => (
                <Link
                  key={`${r.from}-${r.to}`}
                  to={`/flights/${r.from}-to-${r.to}`}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/50 transition-all group"
                >
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm text-foreground group-hover:text-primary font-medium">
                    {formatCity(r.from)} to {formatCity(r.to)}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CityFlightPage;
