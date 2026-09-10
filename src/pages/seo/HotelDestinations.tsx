import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Building2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import {
  hotelCountryHubs,
  hotelCountriesWithoutHub,
  indexableHotelDestinations,
  hotelDestinationPath,
  SITE_ORIGIN,
} from "@/data/hotelDestinations";

const HotelDestinations = () => {
  const hubs = hotelCountryHubs();
  const smallCountries = hotelCountriesWithoutHub();
  const total = indexableHotelDestinations.length;

  const title = `Hotel Destinations Directory | ${total} Cities Worldwide | Tripile`;
  const description = `Browse hotel destinations on Tripile. Explore ${total} cities across ${
    hubs.length + smallCountries.length
  } countries and compare hotels in each destination.`;
  const canonical = `${SITE_ORIGIN}/hotel-destinations`;

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
          { name: "Hotel Destinations", url: canonical },
        ]}
      />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <nav aria-label="Breadcrumb" className="mb-6">
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
              <li className="text-foreground font-medium">Hotel Destinations</li>
            </ol>
          </nav>

          <div className="flex items-center gap-3 mb-3">
            <div className="bg-primary/10 rounded-full p-2.5">
              <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Hotel Destinations
            </h1>
          </div>
          <p className="text-muted-foreground mb-10 max-w-2xl">
            Every hotel destination available on Tripile, organised by country and region. Open a
            country hub to drill down to a region, then a city, and search live hotel availability
            for your dates.
          </p>

          <div className="space-y-12">
            {hubs.map((hub) => (
              <section key={hub.slug} aria-labelledby={`country-${hub.slug}`}>
                <h2
                  id={`country-${hub.slug}`}
                  className="text-xl font-semibold text-foreground mb-5 pb-2 border-b"
                >
                  <Link to={hub.path} className="hover:text-primary">
                    Hotels in {hub.country}
                  </Link>{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({hub.destinationCount} destinations)
                  </span>
                </h2>

                {hub.regions.length > 0 && (
                  <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-2 mb-6">
                    {hub.regions.map((r) => (
                      <li key={r.slug}>
                        <Link
                          to={r.path}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          {r.region} ({r.destinations.length})
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                {hub.directDestinations.length > 0 && (
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
                )}
              </section>
            ))}

            {smallCountries.length > 0 && (
              <section aria-labelledby="more-countries">
                <h2
                  id="more-countries"
                  className="text-xl font-semibold text-foreground mb-5 pb-2 border-b"
                >
                  More destinations worldwide
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                  {smallCountries.map((c) => (
                    <div key={c.countryCode + c.country}>
                      <h3 className="text-sm font-semibold text-foreground mb-2">{c.country}</h3>
                      <ul className="space-y-1">
                        {c.destinations.map((d) => (
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
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default HotelDestinations;
