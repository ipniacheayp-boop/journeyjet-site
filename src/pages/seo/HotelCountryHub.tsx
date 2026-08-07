import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Building2, MapPin, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import {
  getHotelCountryHub,
  hotelCountryHubs,
  hotelDestinationPath,
  SITE_ORIGIN,
} from "@/data/hotelDestinations";
import { countryGuideFor, countryGuidePath } from "@/data/seoLinkGraph";

const HotelCountryHub = () => {
  const { countrySlug } = useParams<{ countrySlug: string }>();
  const hub = getHotelCountryHub(countrySlug);

  if (!hub) {
    return (
      <>
        <Helmet>
          <title>Hotel Destinations Not Found | Tripile</title>
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <Header />
        <main className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Hotel country hub not found</h1>
          <Link to="/hotels" className="text-primary hover:underline">
            Browse hotel destinations
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const canonical = `${SITE_ORIGIN}${hub.path}`;
  const title = `Hotels in ${hub.country} | ${hub.destinationCount} Destinations | Tripile`;
  const description = `Browse hotels in ${hub.country} by region on Tripile. ${
    hub.regions.length > 0 ? `${hub.regions.length} regions and ` : ""
  }${hub.destinationCount} destinations, each with live hotel availability search.`;
  const guide = countryGuideFor(hub.country);
  const guideHref = countryGuidePath(hub.country);
  const otherHubs = hotelCountryHubs().filter((h) => h.slug !== hub.slug).slice(0, 12);

  return (
    <>
      <Header />
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
      </Helmet>

      <BreadcrumbSchema
        items={[
          { name: "Home", url: `${SITE_ORIGIN}/` },
          { name: "Hotels", url: `${SITE_ORIGIN}/hotels` },
          { name: hub.country, url: canonical },
        ]}
      />

      <main className="pt-20 pb-20">
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
            <li aria-hidden="true">/</li>
            <li className="text-foreground font-medium">{hub.country}</li>
          </ol>
        </nav>

        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-primary/10 rounded-full p-2.5">
              <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Hotels in {hub.country}
            </h1>
          </div>

          <p className="text-muted-foreground max-w-3xl">
            Tripile covers {hub.destinationCount} hotel {hub.destinationCount === 1 ? "destination" : "destinations"} in{" "}
            {hub.country}
            {hub.regions.length > 0 ? ` across ${hub.regions.length} regions` : ""}. Pick a region or city
            below to search live hotel availability for your dates — rates and room types always come from
            a live search, never from stored prices.
          </p>

          {guide && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border bg-card">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Currency</p>
                <p className="text-sm font-medium text-foreground">{guide.currency}</p>
              </div>
              <div className="p-4 rounded-xl border bg-card">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Language</p>
                <p className="text-sm font-medium text-foreground">{guide.language}</p>
              </div>
              <div className="p-4 rounded-xl border bg-card">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Best time to visit</p>
                <p className="text-sm font-medium text-foreground">{guide.bestTime}</p>
              </div>
              <div className="p-4 rounded-xl border bg-card">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Known for</p>
                <p className="text-sm font-medium text-foreground">{guide.knownFor}</p>
              </div>
            </div>
          )}

          {hub.regions.length > 0 && (
            <section className="mt-12" aria-labelledby="regions-heading">
              <h2 id="regions-heading" className="text-xl font-semibold text-foreground mb-5 pb-2 border-b">
                Hotel destinations by region
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {hub.regions.map((r) => (
                  <Link
                    key={r.slug}
                    to={r.path}
                    className="p-4 rounded-xl border bg-card hover:border-primary transition-colors"
                  >
                    <span className="flex items-center gap-2 font-medium text-foreground">
                      <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                      Hotels in {r.region}
                    </span>
                    <span className="block mt-1 text-sm text-muted-foreground">
                      {r.destinations.length} {r.destinations.length === 1 ? "city" : "cities"}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {hub.directDestinations.length > 0 && (
            <section className="mt-12" aria-labelledby="cities-heading">
              <h2 id="cities-heading" className="text-xl font-semibold text-foreground mb-5 pb-2 border-b">
                All hotel cities in {hub.country}
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-2">
                {hub.directDestinations.map((d) => (
                  <li key={d.slug}>
                    <Link
                      to={hotelDestinationPath(d.slug)}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      Cheap Hotels in {d.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-12" aria-labelledby="related-heading">
            <h2 id="related-heading" className="text-xl font-semibold text-foreground mb-5 pb-2 border-b">
              Related pages
            </h2>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {guideHref && (
                <li>
                  <Link to={guideHref} className="text-sm text-primary hover:underline">
                    {hub.country} travel guide
                  </Link>
                </li>
              )}
              <li>
                <Link to="/hotel-destinations" className="text-sm text-primary hover:underline">
                  Full hotel destination directory
                </Link>
              </li>
              <li>
                <Link to="/hotels" className="text-sm text-primary hover:underline">
                  Hotel search
                </Link>
              </li>
            </ul>

            <h3 className="text-sm font-semibold text-foreground mt-8 mb-3">Other countries</h3>
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-2">
              {otherHubs.map((h) => (
                <li key={h.slug}>
                  <Link
                    to={h.path}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Hotels in {h.country}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              to="/hotels"
              className="inline-flex items-center gap-2 mt-6 text-primary hover:underline"
            >
              Browse all hotel hubs <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default HotelCountryHub;
