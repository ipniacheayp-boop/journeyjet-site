import { useParams, Link, Navigate } from "react-router-dom";
import { Layers, MapPin, ArrowRight, Plane, Lightbulb, Users } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import RelatedLinks from "@/components/seo/RelatedLinks";
import FaqSection from "@/components/FaqSection";
import { buildTravelCollection, getTravelCollection } from "@/data/travelCollections";

const TravelCollectionPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const collection = getTravelCollection(slug);

  if (!collection) {
    return <Navigate to="/travel-collections" replace />;
  }

  const view = buildTravelCollection(collection);
  const canonical = `https://tripile.com/travel-collections/${collection.slug}`;
  const title = `${collection.h1} — Where to Go & How to Plan It | Tripile`;
  const description =
    `${collection.h1}: ${view.destinations.length} destinations worth comparing, what to expect, when to go and how to build your own flight + hotel package on Tripile.`.slice(
      0,
      160,
    );

  const breadcrumbs = [
    { name: "Home", url: "https://tripile.com/" },
    { name: "Travel Guides", url: "https://tripile.com/travel-guides" },
    { name: "Travel Collections", url: "https://tripile.com/travel-collections" },
    { name: collection.name, url: canonical },
  ];

  return (
    <>
      <Header />
      <SEOHead
        title={title}
        description={description}
        keywords={view.keywords}
        canonicalUrl={canonical}
        ogType="article"
      />
      <BreadcrumbSchema items={breadcrumbs} />

      <main className="min-h-screen bg-background">
        <section className="bg-gradient-to-b from-primary/10 to-background border-b">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <nav className="text-xs text-muted-foreground mb-3 flex flex-wrap items-center gap-1.5" aria-label="Breadcrumb">
              <Link to="/travel-guides" className="hover:text-primary">Travel Guides</Link>
              <span aria-hidden="true">/</span>
              <Link to="/travel-collections" className="hover:text-primary">Collections</Link>
              <span aria-hidden="true">/</span>
              <span className="text-foreground font-medium">{collection.name}</span>
            </nav>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1 mb-3">
              <Layers className="h-3.5 w-3.5" aria-hidden="true" /> Travel Collection
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{collection.h1}</h1>
            <p className="text-muted-foreground max-w-3xl leading-relaxed">{collection.intro}</p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
          {/* Who it suits */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" aria-hidden="true" /> Who this collection suits
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              This collection is best for {collection.bestFor}. {collection.whatToExpect}
            </p>
          </section>

          {/* Destinations */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" aria-hidden="true" /> {collection.name}: destinations to compare
            </h2>
            <div className="space-y-3">
              {view.destinations.map(({ dest, note }) => (
                <Card key={dest.slug}>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground">{dest.city}</h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{note}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm">
                      <Link to={`/travel-guide/${dest.slug}`} className="text-primary hover:underline inline-flex items-center gap-1">
                        {dest.city} travel guide <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                      <Link to={`/flights-to/${dest.slug}`} className="text-primary hover:underline">
                        Flights to {dest.city}
                      </Link>
                      <Link to={`/cheap-hotels-in/${dest.slug}`} className="text-primary hover:underline">
                        Hotels in {dest.city}
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Planning tips */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" aria-hidden="true" /> How to plan and price this trip
            </h2>
            <ul className="space-y-2.5">
              {collection.planningTips.map((tip) => (
                <li key={tip} className="text-muted-foreground leading-relaxed flex gap-2.5">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" aria-hidden="true" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Tripile does not sell fixed packages. Search flights for your dates first, then add a hotel in the same
              destination and a rental car if the itinerary needs one — each with its own live price and cancellation
              terms before you pay.
            </p>
          </section>

          <FaqSection
            faqs={view.faqs}
            title={`${collection.name} questions, answered`}
            subtitle="Planning, timing and booking this style of trip"
            className="mb-10"
          />

          <RelatedLinks
            title="Related guides and collections"
            description="Keep planning with destination guides and other trip styles."
            links={view.related}
          />

          <Card className="mt-8 bg-primary/5 border-primary/20">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-foreground">Price your {collection.name.toLowerCase()} trip</p>
                <p className="text-sm text-muted-foreground">Compare live flights, hotels and cars for your dates.</p>
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

export default TravelCollectionPage;
