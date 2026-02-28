import { useState } from "react";
import { Link } from "react-router-dom";
import { popularDestinations } from "@/data/destinationsData";
import { MapPin, ChevronDown, Globe2 } from "lucide-react";

const INITIAL_COUNT = 28;

const DestinationGrid = () => {
  const [showAll, setShowAll] = useState(false);

  // Sort alphabetically
  const sorted = [...popularDestinations].sort((a, b) =>
    a.city.localeCompare(b.city)
  );

  const visible = showAll ? sorted : sorted.slice(0, INITIAL_COUNT);
  const remaining = sorted.length - INITIAL_COUNT;

  return (
    <section className="mb-14">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
          <Globe2 className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            Popular Flight Destinations
          </h2>
          <p className="text-sm text-muted-foreground">
            {popularDestinations.length} destinations worldwide
          </p>
        </div>
      </div>

      {/* Unified Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-0.5">
        {visible.map((dest) => (
          <Link
            key={dest.slug}
            to={`/flights-to/${dest.slug}`}
            className="group relative flex items-center gap-3 py-3 px-2 rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent"
          >
            {/* Animated pin icon */}
            <div className="relative shrink-0">
              <MapPin className="w-4 h-4 text-primary/40 group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
              {/* Pulse ring on hover */}
              <span className="absolute inset-0 rounded-full bg-primary/10 scale-0 group-hover:scale-[2.5] transition-transform duration-500 opacity-0 group-hover:opacity-100" />
            </div>

            {/* City link */}
            <span className="text-sm text-foreground/80 group-hover:text-primary transition-colors duration-300 relative">
              Cheap Flights to {dest.city}
              {/* Underline animation */}
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-primary/60 group-hover:w-full transition-all duration-400 ease-out" />
            </span>

            {/* Country badge on hover */}
            <span className="ml-auto text-[10px] font-medium text-muted-foreground/0 group-hover:text-muted-foreground transition-all duration-300 shrink-0">
              {dest.country === "US" ? "🇺🇸" : dest.type === "international" ? "🌍" : ""} {dest.iataCode}
            </span>
          </Link>
        ))}
      </div>

      {/* View More Button */}
      {!showAll && remaining > 0 && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setShowAll(true)}
            className="group inline-flex items-center gap-2 px-8 py-3 rounded-full border-2 border-primary/20 text-primary text-sm font-semibold hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all duration-400"
          >
            View All {sorted.length} Destinations
            <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-300" />
          </button>
        </div>
      )}

      {showAll && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setShowAll(false)}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Show Less
          </button>
        </div>
      )}
    </section>
  );
};

export default DestinationGrid;
