import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Plane, Hotel, Search } from "lucide-react";
import { popularDestinations } from "@/data/destinationsData";
import { seoHotelCities, hotelListingPath } from "@/data/seoRoutes";

const CITY_SLUGS = ["los-angeles", "las-vegas", "miami", "orlando", "phoenix"];

const flightImages: Record<string, string> = {
  "los-angeles": "https://images.unsplash.com/photo-1534190239941-6229bb994a98?auto=format&fit=crop&w=600&q=80",
  "las-vegas": "https://images.unsplash.com/photo-1581351721015-39a7d0770703?auto=format&fit=crop&w=600&q=80",
  miami: "https://images.unsplash.com/photo-1533104816931-20fa69124498?auto=format&fit=crop&w=600&q=80",
  orlando: "https://images.unsplash.com/photo-1597466599360-3bb977743178?auto=format&fit=crop&w=600&q=80",
  phoenix: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=600&q=80",
};

const hotelImages: Record<string, string> = {
  "cheap-hotels-in-los-angeles": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
  "cheap-hotels-in-las-vegas": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
  "cheap-hotels-in-miami": "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80",
  "cheap-hotels-in-orlando": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=600&q=80",
  "cheap-hotels-in-phoenix": "https://images.unsplash.com/photo-1618773928121-c94142e2f0b0?auto=format&fit=crop&w=600&q=80",
};

const flightFromPrices: Record<string, number> = {
  "los-angeles": 89,
  "las-vegas": 49,
  miami: 99,
  orlando: 79,
  phoenix: 69,
};

const flightDestinations = popularDestinations.filter((d) => CITY_SLUGS.includes(d.slug));
const hotelDestinations = seoHotelCities.filter((h) =>
  CITY_SLUGS.some((s) => h.slug === `cheap-hotels-in-${s}`),
);

const FlightsHotelsSearch = () => {
  return (
    <section
      aria-labelledby="flights-hotels-search-heading"
      className="py-16 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900/50"
    >
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">
            Flights &amp; Hotels USA
          </p>
          <h2 id="flights-hotels-search-heading" className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
            Search Flights &amp; Hotels Across America
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Compare fares from 500+ airlines and find hotel deals in every major US city — all in one search.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Link
              to="/flights"
              title="Search cheap flights USA — Tripile"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
            >
              <Search className="w-4 h-4" aria-hidden="true" />
              Search Flights
            </Link>
            <Link
              to="/hotels"
              title="Search cheap hotels USA — Tripile"
              className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 border-2 border-primary text-primary font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-primary/5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
            >
              <Search className="w-4 h-4" aria-hidden="true" />
              Search Hotels
            </Link>
          </div>
        </div>

        {/* Flights row */}
        <div className="mb-12">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Plane className="w-4 h-4 text-primary" aria-hidden="true" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Popular Flight Destinations</h3>
            </div>
            <Link
              to="/flights"
              title="Search all flights on Tripile"
              className="text-sm font-semibold text-primary hover:text-primary/80 inline-flex items-center gap-1 transition-colors"
            >
              All flights <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {flightDestinations.map((dest, index) => (
              <motion.article
                key={dest.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: index * 0.06, duration: 0.35 }}
              >
                <Link
                  to={`/flights-to/${dest.slug}`}
                  title={`Cheap flights to ${dest.city} — compare fares on Tripile`}
                  className="flight-search-card group block h-full bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={flightImages[dest.slug]}
                      alt={`Cheap flights to ${dest.city}, USA — book on Tripile`}
                      loading="lazy"
                      decoding="async"
                      width={600}
                      height={320}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <span className="flight-icon-fly flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white shadow-md">
                        <Plane className="w-4 h-4" aria-hidden="true" />
                      </span>
                      <span className="text-white font-bold text-xs">
                        From ${flightFromPrices[dest.slug] ?? 99}
                      </span>
                    </div>
                  </div>
                  <div className="p-3.5">
                    <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                      Flights to {dest.city}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">500+ airlines compared</p>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>

        {/* Hotels row */}
        <div>
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Hotel className="w-4 h-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
              </div>
              <h3 className="font-bold text-lg text-foreground">Top Hotel Destinations</h3>
            </div>
            <Link
              to="/hotels"
              title="Search all hotels on Tripile"
              className="text-sm font-semibold text-primary hover:text-primary/80 inline-flex items-center gap-1 transition-colors"
            >
              All hotels <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {hotelDestinations.map((city, index) => (
              <motion.article
                key={city.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: index * 0.06, duration: 0.35 }}
              >
                <Link
                  to={hotelListingPath(city.slug)}
                  title={`Cheap hotels in ${city.city}, ${city.state} — from $${city.avgPrice}/night on Tripile`}
                  className="hotel-search-card group block h-full bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={hotelImages[city.slug]}
                      alt={`Cheap hotels in ${city.city}, ${city.state} — compare rates on Tripile`}
                      loading="lazy"
                      decoding="async"
                      width={600}
                      height={320}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <span className="hotel-icon-pop flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white shadow-md">
                        <Hotel className="w-4 h-4" aria-hidden="true" />
                      </span>
                      <span className="text-white font-bold text-xs">From ${city.avgPrice}/night</span>
                    </div>
                  </div>
                  <div className="p-3.5">
                    <h4 className="font-bold text-sm text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      Hotels in {city.city}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                      {city.topAreas.slice(0, 2).join(" · ")}
                    </p>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlightsHotelsSearch;
