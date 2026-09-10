import { useParams, Link, Navigate } from "react-router-dom";
import { Globe2, Calendar, Utensils, Coins, MapPin, Plane, ArrowRight, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import TouristDestinationSchema from "@/components/seo/TouristDestinationSchema";
import RelatedLinks from "@/components/seo/RelatedLinks";
import FaqSection from "@/components/FaqSection";
import { buildCountryGuide, getCountryGuide } from "@/data/travelGuides";

const CountryGuidePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const meta = getCountryGuide(slug);

  if (!meta) {
    return <Navigate to="/travel-guides" replace />;
  }

  const guide = buildCountryGuide(meta);
  const canonical = `https://tripile.com/travel-guide/country/${meta.slug}`;
  const title = `${meta.name} Travel Guide ${new Date().getFullYear()} — Best Places, Tips & Cheap Flights | Tripile`;
  const description = `The complete ${meta.name} travel guide: best cities to visit, when to go, what to eat, currency tips and how to find cheap flights. Plan your ${meta.name} trip with Tripile.`;

  const breadcrumbs = [
    { name: "Home", url: "https://tripile.com/" },
    { name: "Travel Guides", url: "https://tripile.com/travel-guides" },
    { name: `${meta.name} Guide`, url: canonical },
  ];

  return (
    <>
      <Header />
      <SEOHead title={title} description={description} keywords={guide.keywords} canonicalUrl={canonical} ogType="article" />
      <BreadcrumbSchema items={breadcrumbs} />
      <TouristDestinationSchema
        name={meta.name}
        description={description}
        url={canonical}
        country={meta.key}
        attractions={guide.cities.slice(0, 8).map((c) => c.city)}
      />

      <main className="min-h-screen bg-background">
        <section className="bg-gradient-to-b from-primary/10 to-background border-b">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <nav className="text-xs text-muted-foreground mb-3 flex flex-wrap items-center gap-1.5" aria-label="Breadcrumb">
              <Link to="/travel-guides" className="hover:text-primary">Travel Guides</Link>
              <span aria-hidden="true">/</span>
              <span className="text-foreground font-medium">{meta.name}</span>
            </nav>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1 mb-3">
              <Globe2 className="h-3.5 w-3.5" aria-hidden="true" /> Country Guide
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{meta.name} Travel Guide</h1>
            <p className="text-muted-foreground max-w-3xl leading-relaxed">{guide.intro}</p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
          {/* Quick facts */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
            <Card><CardContent className="p-4">
              <Calendar className="h-5 w-5 text-primary mb-2" aria-hidden="true" />
              <p className="text-xs text-muted-foreground">Best time</p>
              <p className="text-sm font-semibold text-foreground">{meta.bestTime}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <Coins className="h-5 w-5 text-primary mb-2" aria-hidden="true" />
              <p className="text-xs text-muted-foreground">Currency</p>
              <p className="text-sm font-semibold text-foreground">{meta.currency}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <Globe2 className="h-5 w-5 text-primary mb-2" aria-hidden="true" />
              <p className="text-xs text-muted-foreground">Language</p>
              <p className="text-sm font-semibold text-foreground">{meta.language}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <Utensils className="h-5 w-5 text-primary mb-2" aria-hidden="true" />
              <p className="text-xs text-muted-foreground">Must-try food</p>
              <p className="text-sm font-semibold text-foreground">{meta.cuisine.split(",")[0]}</p>
            </CardContent></Card>
          </div>

          {/* Cities to visit */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" aria-hidden="true" /> Best places to visit in {meta.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {guide.cities.slice(0, 12).map((c) => (
                <Card key={c.slug}>
                  <Link
                    to={`/travel-guide/${c.slug}`}
                    title={`${c.city} travel guide`}
                    className="group flex items-center justify-between gap-3 p-4 hover:bg-accent/60 rounded-lg transition-colors"
                  >
                    <span>
                      <span className="block font-semibold text-foreground group-hover:text-primary transition-colors">{c.city}</span>
                      <span className="block text-xs text-muted-foreground">{c.city} travel guide · {c.iataCode}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
                  </Link>
                </Card>
              ))}
            </div>
          </section>

          {/* Known for */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" /> What is {meta.name} known for?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {meta.name} is famous for {meta.knownFor}. Food lovers should make time for {meta.cuisine}. The best time to
              visit is generally {meta.bestTime}, when weather and prices align — book flights in shoulder season on
              Tripile to save the most.
            </p>
          </section>

          {/* FAQ */}
          <FaqSection
            faqs={guide.faqs}
            title={`${meta.name} travel FAQ`}
            subtitle={`Common questions about traveling to ${meta.name}`}
            className="mb-10"
          />

          {/* Internal linking */}
          <RelatedLinks
            title="More travel guides"
            description="Plan multi-stop trips with related city and country guides."
            links={guide.related}
          />

          {/* CTA */}
          <Card className="mt-8 bg-primary/5 border-primary/20">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-foreground">Plan your {meta.name} trip</p>
                <p className="text-sm text-muted-foreground">Compare cheap flights, hotels and cars in one search.</p>
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

export default CountryGuidePage;
