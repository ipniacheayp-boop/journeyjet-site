import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import SearchWidget from "@/components/SearchWidget";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import IntentGuideSection from "@/components/seo/IntentGuideSection";
import { indiaUsaGuide, lastMinuteGuide, type IntentGuide } from "@/data/flightIntentGuides";

interface PageConfig {
  path: string;
  title: string;
  description: string;
  parent: { name: string; path: string };
  guide: IntentGuide;
}

const PAGES: Record<"last-minute" | "india-usa", PageConfig> = {
  "last-minute": {
    path: "/last-minute-flight-deals",
    title: "Last-Minute Flight Deals — How to Find Cheaper Late Fares | Tripile",
    description:
      "How to find last-minute flight deals: compare live fares with flexible dates and nearby airports, check baggage and change terms, and book before seats sell out.",
    parent: { name: "Deals", path: "/deals" },
    guide: lastMinuteGuide,
  },
  "india-usa": {
    path: "/cheap-flights-india-to-usa",
    title: "Cheap Flights from India to USA — Airports, Routes & Tips | Tripile",
    description:
      "Guide to cheap flights from India to the USA: main airports, nonstop vs one-stop routes, what affects fares, visa and passport notes, and live fare comparison.",
    parent: { name: "Flights", path: "/flights" },
    guide: indiaUsaGuide,
  },
};

const FlightIntentGuidePage = ({ page }: { page: keyof typeof PAGES }) => {
  const cfg = PAGES[page];
  const url = `https://tripile.com${cfg.path}`;
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SEOHead title={cfg.title} description={cfg.description} canonicalUrl={url} ogType="article" />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://tripile.com/" },
          { name: cfg.parent.name, url: `https://tripile.com${cfg.parent.path}` },
          { name: cfg.guide.heading, url },
        ]}
      />
      <Header />
      <main className="flex-1 pt-16 md:pt-[104px]">
        <div className="container mx-auto px-4 pt-8 max-w-4xl">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-3">
            <Link to="/" className="hover:underline">Home</Link> /{" "}
            <Link to={cfg.parent.path} className="hover:underline">{cfg.parent.name}</Link> /{" "}
            <span className="text-foreground">{cfg.guide.heading}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold mb-6">{cfg.guide.heading}</h1>
          <SearchWidget defaultTab="flights" />
        </div>
        <IntentGuideSection guide={cfg.guide} showHeading={false} />
      </main>
      <Footer />
    </div>
  );
};

export default FlightIntentGuidePage;
