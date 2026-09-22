import { Link } from "react-router-dom";
import { Layers, ArrowRight, Plane } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import FaqSection from "@/components/FaqSection";
import { travelCollections, collectionDestinations } from "@/data/travelCollections";

const canonical = "https://tripile.com/travel-collections";

const faqs = [
  {
    question: "What is a travel collection?",
    answer:
      "A travel collection is a curated group of destinations that suit one style of trip — beach, honeymoon, adventure, budget, family and so on. Each collection explains what to expect, how to plan it and links to live flight and hotel prices for every destination in it.",
  },
  {
    question: "Can I book a package from a collection?",
    answer:
      "Yes — you build it yourself on Tripile. Search flights for your dates, add a hotel in the same destination and a rental car if you need one. You see each element's live price and cancellation terms before checkout instead of paying for a fixed bundle.",
  },
  {
    question: "How do I choose between collections?",
    answer:
      "Start with the pace you want. City breaks and weekend getaways suit two to four nights, beach and island trips suit a week, and adventure or heritage trips reward a longer itinerary with a rental car.",
  },
  {
    question: "When is the best time to book?",
    answer:
      "Shoulder season — the weeks either side of peak — usually offers the best combination of weather, crowds and price. Search with flexible dates and compare mid-week departures against weekend ones.",
  },
];

const TravelCollectionsHub = () => {
  const breadcrumbs = [
    { name: "Home", url: "https://tripile.com/" },
    { name: "Travel Guides", url: "https://tripile.com/travel-guides" },
    { name: "Travel Collections", url: canonical },
  ];

  return (
    <>
      <Header />
      <SEOHead
        title="Travel Collections — Beach, Honeymoon, Adventure, Budget & Luxury Trip Ideas | Tripile"
        description="Browse curated Tripile travel collections by trip style: beach vacations, island getaways, honeymoons, adventure, ski, luxury, budget, family, city breaks, food and heritage trips."
        keywords="travel collections, trip ideas by theme, beach vacation destinations, honeymoon destinations, adventure travel, budget travel destinations, luxury travel, family vacations, weekend getaways"
        canonicalUrl={canonical}
      />
      <BreadcrumbSchema items={breadcrumbs} />

      <main className="min-h-screen bg-background">
        <section className="bg-gradient-to-b from-primary/10 to-background border-b">
          <div className="container mx-auto px-4 py-10 md:py-14 text-center">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1 mb-3">
              <Layers className="h-3.5 w-3.5" aria-hidden="true" /> Travel Collections
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Travel Collections by Trip Style</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Not sure where to go? Start from the kind of trip you want. Each collection covers who it suits, what to
              expect, how to plan it and the destinations worth comparing — with live flight and hotel prices for your
              own dates.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {travelCollections.map((c) => {
              const dests = collectionDestinations(c);
              return (
                <Card key={c.slug}>
                  <Link
                    to={`/travel-collections/${c.slug}`}
                    title={`${c.name} — destinations and planning guide`}
                    className="group block p-5 rounded-lg hover:bg-accent/60 transition-colors h-full"
                  >
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-center justify-between gap-2">
                      {c.name}
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
                    </p>
                    <p className="text-sm text-muted-foreground mt-1.5">{c.tagline}</p>
                    <p className="text-xs text-muted-foreground mt-3">
                      {dests.length} destinations · {dests.slice(0, 3).map((d) => d.dest.city).join(", ")}
                    </p>
                  </Link>
                </Card>
              );
            })}
          </div>

          <section className="mt-12 max-w-3xl">
            <h2 className="text-2xl font-bold text-foreground mb-3">How to build your own travel package</h2>
            <p className="text-muted-foreground leading-relaxed">
              Tripile does not sell fixed bundles. You choose the flight, the hotel and the car separately, see the live
              price and cancellation terms for each, and keep control of every part of the trip. Start with flights,
              because they set your dates; add a hotel in the same destination; then add a rental car only if your
              itinerary needs one. That way you never pay for an element of a package you would not have chosen.
            </p>
          </section>

          <FaqSection
            faqs={faqs}
            title="Travel collection questions, answered"
            subtitle="How to use these collections to plan your trip"
            className="mt-10"
          />

          <Card className="mt-8 bg-primary/5 border-primary/20">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-foreground">Ready to price your trip?</p>
                <p className="text-sm text-muted-foreground">Compare live flight, hotel and car prices for your dates.</p>
              </div>
              <Button asChild>
                <Link to="/flights">
                  <Plane className="h-4 w-4 mr-1.5" aria-hidden="true" /> Search flights
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default TravelCollectionsHub;
