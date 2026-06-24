import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Globe2, MapPin, Compass } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { cityGuides, getCountryGuides } from "@/data/travelGuides";

const TravelGuidesHub = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);

  const countries = useMemo(() => getCountryGuides(), []);

  const q = query.trim().toLowerCase();
  const filteredCountries = useMemo(
    () => (q ? countries.filter((c) => c.name.toLowerCase().includes(q)) : countries),
    [countries, q]
  );
  const filteredCities = useMemo(
    () => (q ? cityGuides.filter((c) => c.city.toLowerCase().includes(q)) : cityGuides),
    [q]
  );

  const onSearch = (value: string) => {
    setQuery(value);
    if (value.trim()) setSearchParams({ q: value.trim() }, { replace: true });
    else setSearchParams({}, { replace: true });
  };

  const canonical = "https://tripile.com/travel-guides";
  const breadcrumbs = [
    { name: "Home", url: "https://tripile.com/" },
    { name: "Travel Guides", url: canonical },
  ];

  return (
    <>
      <Header />
      <SEOHead
        title="Travel Guides — City & Country Guides, Things to Do & Best Time to Visit | Tripile"
        description="Browse Tripile's free travel guides for top cities and countries worldwide. Find things to do, the best time to visit, where to stay and cheap flights for every destination."
        keywords="travel guides, city guides, country travel guides, things to do, best time to visit, cheap flights destinations"
        canonicalUrl={canonical}
      />
      <BreadcrumbSchema items={breadcrumbs} />

      <main className="min-h-screen bg-background">
        <section className="bg-gradient-to-b from-primary/10 to-background border-b">
          <div className="container mx-auto px-4 py-10 md:py-14 text-center">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1 mb-3">
              <Compass className="h-3.5 w-3.5" aria-hidden="true" /> Travel Guides
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Travel Guides for Every Destination</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover the best things to do, where to stay, the cheapest months to fly and insider tips for {cityGuides.length}+
              cities across {countries.length} countries.
            </p>
            <div className="max-w-md mx-auto mt-6 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                type="search"
                value={query}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search a city or country…"
                aria-label="Search travel guides"
                className="pl-9 bg-background"
              />
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Country guides */}
          {filteredCountries.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-primary" aria-hidden="true" /> Country guides
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredCountries.map((c) => (
                  <Card key={c.slug}>
                    <Link
                      to={`/travel-guide/country/${c.slug}`}
                      title={`${c.name} travel guide`}
                      className="block p-4 hover:bg-accent/60 rounded-lg transition-colors group"
                    >
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{c.name}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.tagline}</p>
                    </Link>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* City guides */}
          {filteredCities.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" aria-hidden="true" /> City guides
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {filteredCities.map((c) => (
                  <Card key={c.slug}>
                    <Link
                      to={`/travel-guide/${c.slug}`}
                      title={`${c.city} travel guide`}
                      className="block p-3 hover:bg-accent/60 rounded-lg transition-colors group"
                    >
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">{c.city}</p>
                      <p className="text-xs text-muted-foreground">{c.iataCode}</p>
                    </Link>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {filteredCountries.length === 0 && filteredCities.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              No guides match “{query}”. Try another city or country.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default TravelGuidesHub;
