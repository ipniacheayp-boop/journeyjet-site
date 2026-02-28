import { useState } from "react";
import { Link } from "react-router-dom";
import { popularDestinations, Destination } from "@/data/destinationsData";
import { MapPin, ChevronDown, Plane } from "lucide-react";
import { motion } from "framer-motion";

const INITIAL_COUNT = 24;

const DestinationGrid = () => {
  const [showAll, setShowAll] = useState(false);

  // Sort alphabetically by city
  const sorted = [...popularDestinations].sort((a, b) =>
    a.city.localeCompare(b.city)
  );

  const visible = showAll ? sorted : sorted.slice(0, INITIAL_COUNT);

  return (
    <section className="mb-12">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
          <Plane className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Popular Flight Destinations
          </h2>
          <p className="text-sm text-muted-foreground">
            {popularDestinations.length} destinations · Domestic &amp; International
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {visible.map((dest, i) => (
          <DestinationItem key={dest.slug} dest={dest} index={i} />
        ))}
      </div>

      {/* View More */}
      {!showAll && sorted.length > INITIAL_COUNT && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setShowAll(true)}
            className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-primary/30 text-primary text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            View All {sorted.length} Destinations
            <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      )}
    </section>
  );
};

const DestinationItem = ({ dest, index }: { dest: Destination; index: number }) => {
  const isDomestic = dest.type === "domestic";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.5) }}
    >
      <Link
        to={`/flights-to-${dest.slug}`}
        className="group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-primary/5 hover:shadow-sm"
      >
        <div className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 transition-colors duration-200 ${
          isDomestic
            ? "bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white"
            : "bg-emerald-50 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white"
        }`}>
          <MapPin className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200 block truncate">
            Cheap Flights to {dest.city}
          </span>
          <span className="text-xs text-muted-foreground">
            {dest.iataCode} · {dest.country}
          </span>
        </div>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0 ${
          isDomestic
            ? "bg-blue-50 text-blue-600"
            : "bg-emerald-50 text-emerald-600"
        }`}>
          {isDomestic ? "US" : "Intl"}
        </span>
      </Link>
    </motion.div>
  );
};

export default DestinationGrid;
