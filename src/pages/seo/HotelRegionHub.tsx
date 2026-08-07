import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Building2, Plane, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import {
  getHotelRegionHub,
  hotelDestinationPath,
  SITE_ORIGIN,
} from "@/data/hotelDestinations";
import { airportsForStateCode, relatedLinksForDestination } from "@/data/seoLinkGraph";

const HotelRegionHub = () => {
  const { countrySlug, regionSlug } = useParams<{ countrySlug: string; regionSlug: string }>();
  const hub = getHotelRegionHub(countrySlug, regionSlug);

  if (!hub) {
    return (
      <>
        <Helmet>
          <title>Hotel Region Not Found | Tripile</title>
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <Header />
        <main className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Hotel region not found</h1>
          <Link to="/hotels" className="text-primary hover:underline">
            Browse hotel destinations
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const { country, region } = hub;
  const canonical = `${SITE_ORIGIN}${region.path}`;
  const title = `Hotels in ${region.region} | ${region.destinations.length} Cities | Tripile`;
  const description = `Compare hotels in ${region.region}, ${country.country}. Browse ${region.destinations.length} cities on Tripile and search live hotel availability for your travel dates.`;

  const stateCode = region.destinations.find((d) => d.stateCode)?.stateCode;
  const airports = airportsForStateCode(stateCode).slice(0, 12);
  const siblingRegions = country.regions.filter((r) => r.slug !== region.slug).slice(0, 12);
  const contextual = region.destinations
    .slice(0, 6)
    .flatMap((d) => relatedLinksForDestination(d).slice(0, 2));

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
          { name: country.country, url: `${SITE_ORIGIN}${country.path}` },
          { name: region.region, url: canonical },
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
            <li>
              <Link to={country.path} className="hover:text-primary">
                {country.country}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-foreground font-medium">{region.region}</li>
          </ol>
        </nav>

        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-primary/10 rounded-full p-2.5">
              <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Hotels in {region.region}
            </h1>
          </div>

          <p className="text-muted-foreground max-w-3xl">
            Tripile covers {region.destinations.length}{" "}
            {region.destinations.length === 1 ? "city" : "cities"} in {region.region},{" "}
            {country.country}
            {airports.length > 0
              ? `, with ${airports.length === 1 ? "an airport page" : `${airports.length} airport pages`} for travelers flying in`
              : ""}
            . Open a city to search live hotel availability for your dates.
          </p>

          <section className="mt-10" aria-labelledby="region-cities">
            <h2 id="region-cities" className="text-xl font-semibold text-foreground mb-5 pb-2 border-b">
              Hotel cities in {region.region}
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-2">
              {region.destinations.map((d) => (
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

          {airports.length > 0 && (
            <section className="mt-12" aria-labelledby="region-airports">
              <h2 id="region-airports" className="text-xl font-semibold text-foreground mb-5 pb-2 border-b">
                Airports in {region.region}
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2">
                {airports.map((ap) => (
                  <li key={ap.slug}>
                    <Link
                      to={`/airport/${ap.slug}`}
                      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Plane className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                      {ap.airportName} ({ap.airportCode}), {ap.cityName}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {contextual.length > 0 && (
            <section className="mt-12" aria-labelledby="region-related">
              <h2 id="region-related" className="text-xl font-semibold text-foreground mb-5 pb-2 border-b">
                Plan the rest of your {region.region} trip
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2">
                {contextual.map((l) => (
                  <li key={l.href}>
                    <Link
                      to={l.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {siblingRegions.length > 0 && (
            <section className="mt-12" aria-labelledby="region-siblings">
              <h2 id="region-siblings" className="text-xl font-semibold text-foreground mb-5 pb-2 border-b">
                Other regions in {country.country}
              </h2>
              <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-2">
                {siblingRegions.map((r) => (
                  <li key={r.slug}>
                    <Link
                      to={r.path}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      Hotels in {r.region}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                to={country.path}
                className="inline-flex items-center gap-2 mt-6 text-primary hover:underline"
              >
                All hotels in {country.country}{" "}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default HotelRegionHub;
