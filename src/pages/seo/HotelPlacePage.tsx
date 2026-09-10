import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchWidget from "@/components/SearchWidget";
import NotFound from "@/pages/NotFound";
import {
  getHotelPlace,
  hotelPlacesForCity,
  hotelPlacePath,
} from "@/data/hotelPlaceCatalog";
import { getHotelDestinationBySlug, hotelDestinationPath } from "@/data/hotelDestinations";
import { MapPin, Star, Globe, Building2, Hotel } from "lucide-react";

const SITE_ORIGIN = "https://tripile.com";

/**
 * Hotel detail landing page backed ONLY by real Google Places data
 * (src/data/hotelPlaceCatalog.ts, harvested through the existing hotels-search
 * Edge Function). Nothing here is invented: no prices, no room types, no
 * amenities, no fake reviews. Live availability and pricing stay in the search
 * flow, which is unchanged.
 */
const HotelPlacePage = () => {
  const { citySlug, hotelSlug } = useParams();
  const hotel = getHotelPlace(citySlug, hotelSlug);

  // Unknown hotel → real 404 (no soft 404, no thin auto-generated page).
  if (!hotel) return <NotFound />;

  const destination = getHotelDestinationBySlug(hotel.citySlug);
  const cityPath = destination ? hotelDestinationPath(destination.slug) : "/hotel-destinations";
  const canonical = `${SITE_ORIGIN}${hotelPlacePath(hotel)}`;
  const title = `${hotel.name}, ${hotel.cityName} — Rates & Availability | Tripile`.slice(0, 64);
  const description = `${hotel.name} in ${hotel.cityName}${
    hotel.rating ? ` is rated ${hotel.rating}/5 by ${hotel.reviewCount?.toLocaleString()} Google reviewers` : ""
  }. See the location, check live availability and compare rates on Tripile.`.slice(0, 158);

  const nearby = hotelPlacesForCity(hotel.citySlug)
    .filter((h) => h.placeId !== hotel.placeId)
    .slice(0, 6);

  const hotelSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: hotel.name,
    url: canonical,
    address: { "@type": "PostalAddress", streetAddress: hotel.address },
    ...(hotel.latitude != null && hotel.longitude != null
      ? { geo: { "@type": "GeoCoordinates", latitude: hotel.latitude, longitude: hotel.longitude } }
      : {}),
    ...(hotel.rating && hotel.reviewCount
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: hotel.rating,
            reviewCount: hotel.reviewCount,
            bestRating: 5,
          },
        }
      : {}),
    ...(hotel.googleMapsUri ? { hasMap: hotel.googleMapsUri } : {}),
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_ORIGIN}/` },
      { "@type": "ListItem", position: 2, name: "Hotels", item: `${SITE_ORIGIN}/hotels` },
      { "@type": "ListItem", position: 3, name: `${hotel.cityName} Hotels`, item: `${SITE_ORIGIN}${cityPath}` },
      { "@type": "ListItem", position: 4, name: hotel.name },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={`${SITE_ORIGIN}/og-image.png`} />
        <meta property="og:site_name" content="Tripile.com" />
        <meta property="og:locale" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={`${SITE_ORIGIN}/og-image.png`} />
        <script type="application/ld+json">{JSON.stringify(hotelSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbs)}</script>
      </Helmet>

      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link to="/hotels" className="hover:text-foreground">Hotels</Link>
            <span>/</span>
            <Link to={cityPath} className="hover:text-foreground">{hotel.cityName} Hotels</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{hotel.name}</span>
          </nav>

          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            {hotel.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" aria-hidden="true" />
              {hotel.address}
            </span>
            {hotel.rating && hotel.reviewCount ? (
              <span className="inline-flex items-center gap-1.5">
                <Star className="w-4 h-4 text-primary" aria-hidden="true" />
                {hotel.rating}/5 from {hotel.reviewCount.toLocaleString()} Google reviews
              </span>
            ) : null}
            {hotel.category ? (
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-primary" aria-hidden="true" />
                {hotel.category}
              </span>
            ) : null}
          </div>

          <p className="text-muted-foreground text-lg mb-8 max-w-3xl">
            {hotel.name} is located at {hotel.address}, in {hotel.cityName}. Enter your dates below to
            check live availability and compare current rates — prices and room availability are
            always pulled live at search time, so nothing on this page is a stale quote.
          </p>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm mb-12">
            <SearchWidget defaultTab="hotels" />
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Location & Neighbourhood
            </h2>
            <p className="text-muted-foreground max-w-3xl">
              The hotel's full address is {hotel.address}.
              {hotel.latitude != null && hotel.longitude != null
                ? ` Its coordinates are ${hotel.latitude.toFixed(4)}, ${hotel.longitude.toFixed(4)}.`
                : ""}{" "}
              For directions, transit options and street view, open the location on Google Maps.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              {hotel.googleMapsUri ? (
                <a
                  href={hotel.googleMapsUri}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                  View {hotel.name} on Google Maps
                </a>
              ) : null}
              {hotel.websiteUri ? (
                <a
                  href={hotel.websiteUri}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <Globe className="w-4 h-4" aria-hidden="true" />
                  Official website
                </a>
              ) : null}
            </div>
          </section>

          {nearby.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Hotel className="w-5 h-5 text-primary" aria-hidden="true" />
                Other Hotels in {hotel.cityName}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {nearby.map((h) => (
                  <Link
                    key={h.placeId}
                    to={hotelPlacePath(h)}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/50 transition-all group"
                  >
                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                    <span>
                      <span className="block text-sm font-medium text-foreground group-hover:text-primary">
                        {h.name}
                      </span>
                      {h.rating ? (
                        <span className="block text-xs text-muted-foreground">
                          {h.rating}/5 · {h.reviewCount?.toLocaleString()} reviews
                        </span>
                      ) : null}
                    </span>
                  </Link>
                ))}
              </div>
              <Link to={cityPath} className="inline-block mt-4 text-sm font-medium text-primary hover:underline">
                See all hotels in {hotel.cityName}
              </Link>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HotelPlacePage;
