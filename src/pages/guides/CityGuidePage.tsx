import { useParams, Link, Navigate } from "react-router-dom";
import {
  MapPin, Calendar, TrendingDown, Building2, Navigation, Lightbulb,
  Plane, Hotel, Car, ArrowRight, Sparkles, Clock,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import TouristDestinationSchema from "@/components/seo/TouristDestinationSchema";
import RelatedLinks from "@/components/seo/RelatedLinks";
import FaqSection from "@/components/FaqSection";
import { buildCityGuide, getCityGuide } from "@/data/travelGuides";

/** Minimal **bold** markdown → JSX for generated tip strings. */
const renderTip = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="text-foreground">{part.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
};

const CityGuidePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const dest = getCityGuide(slug);

  if (!dest) {
    return <Navigate to="/travel-guides" replace />;
  }

  const guide = buildCityGuide(dest);
  const { content, countryMeta } = guide;
  const canonical = `https://tripile.com/travel-guide/${dest.slug}`;
  const title = `${dest.city} Travel Guide ${new Date().getFullYear()} — Things to Do, Best Time to Visit | Tripile`;
  const description = `Plan your trip to ${dest.city} with our complete travel guide: top things to do, where to stay, best time to visit, getting around, and cheap flights starting from your city.`;

  const breadcrumbs = [
    { name: "Home", url: "https://tripile.com/" },
    { name: "Travel Guides", url: "https://tripile.com/travel-guides" },
    { name: `${countryMeta.name}`, url: `https://tripile.com/travel-guide/country/${countryMeta.slug}` },
    { name: `${dest.city} Guide`, url: canonical },
  ];

  return (
    <>
      <Header />
      <SEOHead title={title} description={description} keywords={guide.keywords} canonicalUrl={canonical} ogType="article" />
      <BreadcrumbSchema items={breadcrumbs} />
      <TouristDestinationSchema
        name={dest.city}
        description={description}
        url={canonical}
        country={dest.country}
        attractions={content.bestPlaces.map((p) => p.name)}
      />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary/10 to-background border-b">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <nav className="text-xs text-muted-foreground mb-3 flex flex-wrap items-center gap-1.5" aria-label="Breadcrumb">
              <Link to="/travel-guides" className="hover:text-primary">Travel Guides</Link>
              <span aria-hidden="true">/</span>
              <Link to={`/travel-guide/country/${countryMeta.slug}`} className="hover:text-primary">{countryMeta.name}</Link>
              <span aria-hidden="true">/</span>
              <span className="text-foreground font-medium">{dest.city}</span>
            </nav>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1 mb-3">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {countryMeta.name}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              {dest.city} Travel Guide
            </h1>
            <p className="text-muted-foreground max-w-3xl leading-relaxed">{guide.intro}</p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Button asChild>
                <Link to={`/flights-to/${dest.slug}`}>
                  <Plane className="h-4 w-4 mr-1.5" aria-hidden="true" /> Cheap flights to {dest.city}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to={`/cheap-hotels-in/${dest.slug}`}>
                  <Hotel className="h-4 w-4 mr-1.5" aria-hidden="true" /> Hotels in {dest.city}
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
          {/* Quick facts */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
            <Card><CardContent className="p-4">
              <Calendar className="h-5 w-5 text-primary mb-2" aria-hidden="true" />
              <p className="text-xs text-muted-foreground">Best time to visit</p>
              <p className="text-sm font-semibold text-foreground">{content.bestTimeToVisit.split(".")[0]}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <TrendingDown className="h-5 w-5 text-primary mb-2" aria-hidden="true" />
              <p className="text-xs text-muted-foreground">Cheapest month to fly</p>
              <p className="text-sm font-semibold text-foreground">{content.cheapestMonth}</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <Plane className="h-5 w-5 text-primary mb-2" aria-hidden="true" />
              <p className="text-xs text-muted-foreground">Main airport</p>
              <p className="text-sm font-semibold text-foreground">{dest.iataCode}</p>
            </CardContent></Card>
          </div>

          {/* Things to do */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" /> Top things to do in {dest.city}
            </h2>
            <div className="grid gap-3">
              {content.bestPlaces.map((place) => (
                <Card key={place.name}>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground">{place.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{place.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Where to stay */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" aria-hidden="true" /> Where to stay in {dest.city}
            </h2>
            <p className="text-muted-foreground leading-relaxed">{guide.whereToStay}</p>
          </section>

          {/* Getting around */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" aria-hidden="true" /> Getting around {dest.city}
            </h2>
            <p className="text-muted-foreground leading-relaxed">{guide.gettingAround}</p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link to={`/cheap-car-rentals-in-${dest.slug}`}>
                <Car className="h-4 w-4 mr-1.5" aria-hidden="true" /> Compare car rentals in {dest.city}
              </Link>
            </Button>
          </section>

          {/* Best time + budget tips */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" aria-hidden="true" /> Best time to visit {dest.city}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-5">{content.bestTimeToVisit}</p>
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" aria-hidden="true" /> Money-saving travel tips
            </h3>
            <ul className="space-y-2.5">
              {content.travelTips.slice(0, 5).map((tip, i) => (
                <li key={i} className="text-sm text-muted-foreground leading-relaxed flex gap-2">
                  <span className="text-primary mt-1" aria-hidden="true">•</span>
                  <span>{renderTip(tip)}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* FAQ (visible accordion + FAQPage schema) */}
          <FaqSection
            faqs={guide.faqs}
            title={`${dest.city} travel FAQ`}
            subtitle={`Common questions about visiting ${dest.city}`}
            className="mb-10"
          />

          {/* Internal linking */}
          <RelatedLinks
            title={`Explore more of ${countryMeta.name}`}
            description="Keep planning with related guides and travel deals."
            links={guide.related}
          />

          {/* CTA */}
          <Card className="mt-8 bg-primary/5 border-primary/20">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-foreground">Ready to visit {dest.city}?</p>
                <p className="text-sm text-muted-foreground">Compare flights, hotels and cars in one search.</p>
              </div>
              <Button asChild>
                <Link to={`/flights-to/${dest.slug}`}>
                  Find deals <ArrowRight className="h-4 w-4 ml-1.5" aria-hidden="true" />
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

export default CityGuidePage;
