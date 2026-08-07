import { useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Building2, MapPin, ArrowRight, Shield, Wifi, Car, Coffee, Search } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import FAQSchema from "@/components/seo/FAQSchema";
import { seoHotelCities } from "@/data/seoRoutes";
import {
  getHotelDestinationBySlug,
  hotelDestinationCanonical,
  destinationSearchQuery,
  destinationRegionLabel,
  destinationShortLabel,
  indexableHotelDestinations,
  nearbyDestinations,
  hotelHubTrailFor,
  hotelHubSiblings,
  hotelDestinationPath,
  SITE_ORIGIN,
} from "@/data/hotelDestinations";
import { relatedLinksForDestination } from "@/data/seoLinkGraph";

function isoDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

const HotelCityPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const destination = getHotelDestinationBySlug(slug);

  const [checkIn, setCheckIn] = useState(isoDate(14));
  const [checkOut, setCheckOut] = useState(isoDate(16));
  const [guests, setGuests] = useState("2");
  const [rooms, setRooms] = useState("1");

  /** Legacy editorial content (neighbourhoods) for destinations that already had it. */
  const legacy = useMemo(
    () => seoHotelCities.find((c) => c.slug === `cheap-hotels-in-${slug}`),
    [slug],
  );

  const related = useMemo(
    () => (destination ? hotelHubSiblings(destination, 8) : []),
    [destination],
  );

  /** Parent hubs: Home → Hotels → Country → Region → this city. */
  const trail = useMemo(() => (destination ? hotelHubTrailFor(destination) : {}), [destination]);

  /** Contextual links, only to pages that actually exist for this destination. */
  const contextualLinks = useMemo(
    () => (destination ? relatedLinksForDestination(destination) : []),
    [destination],
  );

  if (!destination) {
    return (
      <>
        <Helmet>
          <title>Hotel Destination Not Found | Tripile</title>
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Hotel destination not found</h1>
          <Link to="/hotel-destinations" className="text-primary hover:underline">
            Browse all hotel destinations
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const shortLabel = destinationShortLabel(destination);
  const regionLabel = destinationRegionLabel(destination);
  const searchQuery = destinationSearchQuery(destination);
  const canonicalUrl = hotelDestinationCanonical(destination.slug);

  const pageTitle = `Cheap Hotels in ${shortLabel} | Compare Hotel Deals | Tripile`;
  const pageDescription = `Search and compare hotels in ${regionLabel}. Explore accommodation options and find hotels for your ${destination.name} trip with Tripile.`;

  const runSearch = () => {
    const params = new URLSearchParams({
      type: "hotel",
      cityCode: searchQuery,
      city: destination.name,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      adults: guests,
      roomQuantity: rooms,
    });
    if (destination.placeId) params.set("placeId", destination.placeId);
    if (destination.latitude != null && destination.longitude != null) {
      params.set("lat", String(destination.latitude));
      params.set("lng", String(destination.longitude));
    }
    navigate(`/search-results?${params.toString()}`);
  };

  const faqs = [
    {
      question: `How do I find hotels in ${destination.name}?`,
      answer: `Enter your check-in and check-out dates above and select Search Hotels. Tripile searches live availability for ${regionLabel} and shows the accommodation options returned for your dates.`,
    },
    {
      question: `What areas can I stay in when visiting ${destination.name}?`,
      answer: legacy
        ? `Popular areas to stay in ${destination.name} include ${legacy.topAreas.join(", ")}. Each neighbourhood offers different attractions and price points.`
        : `${destination.name} has a range of central and outlying neighbourhoods. Run a search above to see the areas where properties are currently available for your dates.`,
    },
    {
      question: `Are hotel prices in ${destination.name} shown live?`,
      answer: `Yes. Tripile does not publish fixed nightly rates on this page — all rates and availability come from live search results for the dates you select.`,
    },
  ];

  const breadcrumbs = [
    { name: "Home", url: `${SITE_ORIGIN}/` },
    { name: "Hotels", url: `${SITE_ORIGIN}/hotels` },
    ...(trail.country ? [{ name: trail.country.country, url: `${SITE_ORIGIN}${trail.country.path}` }] : []),
    ...(trail.region ? [{ name: trail.region.region, url: `${SITE_ORIGIN}${trail.region.path}` }] : []),
    { name: destination.name, url: canonicalUrl },
  ];

  return (
    <>
      <Header />

      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
      </Helmet>

      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema faqs={faqs} />

      <main className="pt-20">
        <nav aria-label="Breadcrumb" className="container mx-auto px-4 py-4">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link to="/" className="hover:text-primary">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link to="/hotels" className="hover:text-primary">
                Hotels
              </Link>
            </li>
            {trail.country && (
              <>
                <li aria-hidden="true">/</li>
                <li>
                  <Link to={trail.country.path} className="hover:text-primary">
                    {trail.country.country}
                  </Link>
                </li>
              </>
            )}
            {trail.region && (
              <>
                <li aria-hidden="true">/</li>
                <li>
                  <Link to={trail.region.path} className="hover:text-primary">
                    {trail.region.region}
                  </Link>
                </li>
              </>
            )}
            <li aria-hidden="true">/</li>
            <li className="text-foreground font-medium">{destination.name}</li>
          </ol>
        </nav>

        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-primary/10 rounded-full p-3">
                  <Building2 className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Cheap Hotels in {regionLabel}
              </h1>

              <p className="text-lg text-muted-foreground mb-8">
                Search and compare hotels in {regionLabel}. Choose your dates and see live
                availability for your {destination.name} trip.
              </p>

              <Card className="text-left">
                <CardContent className="p-4 md:p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="hotel-destination">Destination</Label>
                      <Input
                        id="hotel-destination"
                        value={searchQuery}
                        readOnly
                        aria-label={`Hotel destination: ${searchQuery}`}
                        className="bg-background"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="hotel-checkin">Check-in</Label>
                        <Input
                          id="hotel-checkin"
                          type="date"
                          value={checkIn}
                          min={isoDate(0)}
                          onChange={(e) => setCheckIn(e.target.value)}
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="hotel-checkout">Check-out</Label>
                        <Input
                          id="hotel-checkout"
                          type="date"
                          value={checkOut}
                          min={checkIn}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className="bg-background"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-1.5">
                      <Label htmlFor="hotel-guests-count">Guests</Label>
                      <Input
                        id="hotel-guests-count"
                        type="number"
                        min="1"
                        max="9"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="hotel-rooms-count">Rooms</Label>
                      <Input
                        id="hotel-rooms-count"
                        type="number"
                        min="1"
                        max="5"
                        value={rooms}
                        onChange={(e) => setRooms(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                    <Button
                      size="lg"
                      className="gap-2 w-full"
                      onClick={runSearch}
                      aria-label={`Search hotels in ${regionLabel}`}
                    >
                      <Search className="h-4 w-4" aria-hidden="true" /> Search Hotels
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                About Hotels in {destination.name}
              </h2>

              <p className="text-muted-foreground leading-relaxed mb-6">
                Looking for hotels in {regionLabel}? Tripile searches live accommodation
                availability so you can compare the options returned for your travel dates —
                from budget stays to full-service hotels — without guesswork about rates.
              </p>

              {legacy && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    Popular Areas to Stay in {destination.name}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {legacy.topAreas.map((area) => (
                      <div
                        key={area}
                        className="flex items-center gap-2 p-3 bg-secondary/30 rounded-lg"
                      >
                        <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                        <span className="text-sm font-medium text-foreground">{area}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Common Hotel Amenities
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                    <Wifi className="h-5 w-5 text-primary" aria-hidden="true" />
                    <span className="text-sm text-foreground">Free WiFi</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                    <Car className="h-5 w-5 text-primary" aria-hidden="true" />
                    <span className="text-sm text-foreground">Parking</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                    <Coffee className="h-5 w-5 text-primary" aria-hidden="true" />
                    <span className="text-sm text-foreground">Breakfast</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
                    <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
                    <span className="text-sm text-foreground">24/7 Security</span>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Frequently Asked Questions
                </h2>
                <dl className="space-y-4">
                  {faqs.map((faq) => (
                    <div key={faq.question} className="p-4 bg-card border rounded-lg">
                      <dt className="font-semibold text-foreground mb-1">{faq.question}</dt>
                      <dd className="text-sm text-muted-foreground">{faq.answer}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {contextualLinks.length > 0 && (
                <div className="mt-10">
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    Plan the rest of your {destination.name} trip
                  </h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {contextualLinks.map((l) => (
                      <li key={l.href}>
                        <Link
                          to={l.href}
                          className="text-sm text-muted-foreground hover:text-primary"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {related.length > 0 && (
                <div className="mt-10">
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    More Hotel Destinations in {trail.region?.region ?? destination.country}
                  </h2>
                  <ul className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {related.map((d) => (
                      <li key={d.slug}>
                        <Link
                          to={hotelDestinationPath(d.slug)}
                          className="text-sm text-muted-foreground hover:text-primary"
                        >
                          Hotels in {d.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={trail.region?.path ?? trail.country?.path ?? "/hotel-destinations"}
                    className="inline-flex items-center gap-2 mt-6 text-primary hover:underline"
                  >
                    {trail.region
                      ? `All hotels in ${trail.region.region}`
                      : trail.country
                        ? `All hotels in ${trail.country.country}`
                        : "View all hotel destinations"}{" "}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default HotelCityPage;
