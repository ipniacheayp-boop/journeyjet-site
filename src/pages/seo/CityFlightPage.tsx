import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchWidget from "@/components/SearchWidget";
import { Shield, Clock, TrendingDown } from "lucide-react";

const CityFlightPage = () => {
  const { from, to } = useParams();

  const formatCity = (slug: string = "") =>
    slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const fromCity = formatCity(from);
  const toCity = formatCity(to);
  const title = `Cheap Flights from ${fromCity} to ${toCity} | Tripile.com`;
  const desc = `Find the cheapest flights from ${fromCity} to ${toCity}. Compare 500+ airlines, get price alerts, and book with our Price Match Guarantee on Tripile.com.`;

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://tripile.com/" },
      { "@type": "ListItem", position: 2, name: "Flights", item: "https://tripile.com/deals" },
      { "@type": "ListItem", position: 3, name: `${fromCity} to ${toCity}` },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={`https://tripile.com/flights/${from}-to-${to}`} />
        <script type="application/ld+json">{JSON.stringify(breadcrumbs)}</script>
      </Helmet>
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
            Compare prices across 500+ airlines and find the best deals for your trip from {fromCity} to {toCity}.
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

          <section className="prose dark:prose-invert max-w-none">
            <h2>Tips for Finding Cheap {fromCity} to {toCity} Flights</h2>
            <ul>
              <li>Book 2-3 weeks in advance for domestic routes or 1-2 months for international flights</li>
              <li>Be flexible with your travel dates — midweek flights are often 20-30% cheaper</li>
              <li>Set up price alerts to get notified when fares drop for this route</li>
              <li>Consider nearby airports for potentially lower fares</li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CityFlightPage;
