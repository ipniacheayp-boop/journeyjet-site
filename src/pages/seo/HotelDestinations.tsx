import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Building2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import {
  groupedIndexableDestinations,
  indexableHotelDestinations,
  hotelDestinationPath,
  SITE_ORIGIN,
} from "@/data/hotelDestinations";

const HotelDestinations = () => {
  const groups = groupedIndexableDestinations();
  const total = indexableHotelDestinations.length;

  const title = `Hotel Destinations Directory | ${total} Cities Worldwide | Tripile`;
  const description = `Browse hotel destinations on Tripile. Explore ${total} cities across ${groups.length} countries and compare hotels in each destination.`;
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
          { name: "Hotel Destinations", url: canonical },
        ]}
      />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-primary/10 rounded-full p-2.5">
              <Building2 className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Hotel Destinations
            </h1>
          </div>
          <p className="text-muted-foreground mb-10 max-w-2xl">
            Browse every hotel destination available on Tripile, organised by country and
            region. Select a city to search live hotel availability for your dates.
          </p>

          <div className="space-y-12">
            {groups.map((group) => (
              <section key={group.country} aria-labelledby={`country-${group.countryCode}`}>
                <h2
                  id={`country-${group.countryCode}`}
                  className="text-xl font-semibold text-foreground mb-5 pb-2 border-b"
                >
                  {group.country}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                  {group.regions.map((region) => (
                    <div key={`${group.country}-${region.region}`}>
                      <h3 className="text-sm font-semibold text-foreground mb-2">
                        {region.region}
                      </h3>
                      <ul className="space-y-1">
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
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default HotelDestinations;
