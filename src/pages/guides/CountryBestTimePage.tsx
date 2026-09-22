import { useParams, Link, Navigate } from "react-router-dom";
import { Calendar, Sun, CloudRain, PartyPopper, Luggage, Plane } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import RelatedLinks from "@/components/seo/RelatedLinks";
import FaqSection from "@/components/FaqSection";
import { getCountryGuide, getCitiesForCountry } from "@/data/travelGuides";
import { getCountrySeasons } from "@/data/countrySeasons";

const CountryBestTimePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const meta = getCountryGuide(slug);

  if (!meta) {
    return <Navigate to="/travel-guides" replace />;
  }

  const seasons = getCountrySeasons(meta.key, meta.bestTime, meta.name);
  const cities = getCitiesForCountry(meta.key);
  const canonical = `https://tripile.com/travel-guide/country/${meta.slug}/best-time-to-visit`;
  const title = `Best Time to Visit ${meta.name} — Season by Season Guide | Tripile`;
  const description =
    `When is the best time to visit ${meta.name}? Compare peak, shoulder and low season, weather, festivals and what to pack — then check live flight prices for your dates.`.slice(
      0,
      160,
    );

  const breadcrumbs = [
    { name: "Home", url: "https://tripile.com/" },
    { name: "Travel Guides", url: "https://tripile.com/travel-guides" },
    { name: `${meta.name} Guide`, url: `https://tripile.com/travel-guide/country/${meta.slug}` },
    { name: `Best Time to Visit ${meta.name}`, url: canonical },
  ];

  const faqs = [
    {
      question: `When is the best time to visit ${meta.name}?`,
      answer: `The best overall time to visit ${meta.name} is ${meta.bestTime}. ${seasons.weather}`,
    },
    {
      question: `What is the cheapest time to visit ${meta.name}?`,
      answer: `Travel in low season — ${seasons.low} — or in shoulder season (${seasons.shoulder}) for lower flight and hotel prices than the ${seasons.peak} peak. Search flexible dates on Tripile to see the live difference for your route.`,
    },
    {
      question: `What months should I avoid in ${meta.name}?`,
      answer: `Avoid ${seasons.peak} if crowds and prices matter most to you. ${seasons.events}`,
    },
    {
      question: `What is the weather like in ${meta.name}?`,
      answer: seasons.weather,
    },
    {
      question: `What should I pack for ${meta.name}?`,
      answer: seasons.packing,
    },
  ];

  const related = [
    { label: `${meta.name} Travel Guide`, href: `/travel-guide/country/${meta.slug}`, sublabel: "Country overview" },
    ...cities.slice(0, 5).map((c) => ({
      label: `${c.city} Travel Guide`,
      href: `/travel-guide/${c.slug}`,
      sublabel: meta.name,
    })),
    { label: "Travel collections", href: "/travel-collections", sublabel: "Trip ideas by style" },
    { label: "All travel guides", href: "/travel-guides", sublabel: "Cities & countries" },
  ].slice(0, 9);

  const facts = [
    { icon: Sun, label: "Peak season", value: seasons.peak },
    { icon: Calendar, label: "Shoulder season", value: seasons.shoulder },
    { icon: CloudRain, label: "Low season", value: seasons.low },
    { icon: PartyPopper, label: "Best overall", value: meta.bestTime },
  ];

  return (
    <>
      <Header />
      <SEOHead
        title={title}
        description={description}
        keywords={[
          `best time to visit ${meta.name}`,
          `when to visit ${meta.name}`,
          `${meta.name} weather by month`,
          `cheapest time to visit ${meta.name}`,
          `${meta.name} peak season`,
        ].join(", ")}
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
              <Link to={`/travel-guide/country/${meta.slug}`} className="hover:text-primary">{meta.name}</Link>
              <span aria-hidden="true">/</span>
              <span className="text-foreground font-medium">Best time to visit</span>
            </nav>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Best Time to Visit {meta.name}</h1>
            <p className="text-muted-foreground max-w-3xl leading-relaxed">
              The best time to visit {meta.name} is generally {meta.bestTime}. This season-by-season guide breaks down
              peak, shoulder and low season, what the weather actually does, which festivals fill hotels, and what to
              pack — so you can pick dates that match both your plans and your budget.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
            {facts.map(({ icon: Icon, label, value }) => (
              <Card key={label}>
                <CardContent className="p-4">
                  <Icon className="h-5 w-5 text-primary mb-2" aria-hidden="true" />
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-semibold text-foreground">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-3">What the weather is like in {meta.name}</h2>
            <p className="text-muted-foreground leading-relaxed">{seasons.weather}</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Peak, shoulder and low season in {meta.name}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              <strong className="text-foreground">Peak season ({seasons.peak})</strong> brings the most reliable
              conditions and the highest flight and hotel demand.{" "}
              <strong className="text-foreground">Shoulder season ({seasons.shoulder})</strong> is the sweet spot:
              similar weather, thinner crowds and noticeably better availability.{" "}
              <strong className="text-foreground">Low season ({seasons.low})</strong> is cheapest, with the trade-off of
              less predictable weather or reduced opening hours at some attractions.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Prices move with that demand rather than with the calendar alone, so the only way to know what your dates
              cost is to compare them. Search {meta.name} flights with flexible dates on Tripile to see the live
              difference between peak and shoulder weeks.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
              <PartyPopper className="h-5 w-5 text-primary" aria-hidden="true" /> Festivals and holidays to plan around
            </h2>
            <p className="text-muted-foreground leading-relaxed">{seasons.events}</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
              <Luggage className="h-5 w-5 text-primary" aria-hidden="true" /> What to pack for {meta.name}
            </h2>
            <p className="text-muted-foreground leading-relaxed">{seasons.packing}</p>
          </section>

          {cities.length > 0 && (
            <section className="mb-10">
              <h2 className="text-2xl font-bold text-foreground mb-3">Where to go in {meta.name}</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Popular bases include {cities.slice(0, 6).map((c) => c.city).join(", ")}. Each city guide covers the top
                things to do, where to stay and the cheapest months to fly.
              </p>
            </section>
          )}

          <FaqSection
            faqs={faqs}
            title={`Best time to visit ${meta.name}: FAQ`}
            subtitle="Seasons, weather, crowds and costs"
            className="mb-10"
          />

          <RelatedLinks
            title="Keep planning your trip"
            description={`City guides and related pages for ${meta.name}.`}
            links={related}
          />

          <Card className="mt-8 bg-primary/5 border-primary/20">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-foreground">Compare {meta.name} flights by date</p>
                <p className="text-sm text-muted-foreground">See live prices for peak, shoulder and low season.</p>
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

export default CountryBestTimePage;
