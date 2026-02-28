import { useState } from "react";
import { Link } from "react-router-dom";
import { popularDestinations, Destination } from "@/data/destinationsData";
import { MapPin, ChevronDown, Plane, Globe } from "lucide-react";

const DestinationGrid = () => {
  const [showAll, setShowAll] = useState(false);

  const domestic = popularDestinations.filter((d) => d.type === "domestic");
  const international = popularDestinations.filter((d) => d.type === "international");

  const visibleDomestic = showAll ? domestic : domestic.slice(0, 15);
  const visibleIntl = showAll ? international : international.slice(0, 12);
  const hasMore = !showAll && (domestic.length > 15 || international.length > 12);

  return (
    <div className="space-y-10 mb-12">
      {/* Domestic */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
            <Plane className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Domestic Destinations</h2>
            <p className="text-xs text-muted-foreground">{domestic.length} US cities</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-1">
          {visibleDomestic.map((dest) => (
            <DestItem key={dest.slug} dest={dest} />
          ))}
        </div>
      </section>

      {/* International */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
            <Globe className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">International Destinations</h2>
            <p className="text-xs text-muted-foreground">{international.length} global cities</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-1">
          {visibleIntl.map((dest) => (
            <DestItem key={dest.slug} dest={dest} />
          ))}
        </div>
      </section>

      {/* View More */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowAll(true)}
            className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-primary/20 text-primary text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm hover:shadow-md"
          >
            View All Destinations
            <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
};

const DestItem = ({ dest }: { dest: Destination }) => (
  <Link
    to={`/flights-to-${dest.slug}`}
    className="group flex items-center gap-2.5 py-2 text-sm text-muted-foreground transition-colors duration-200 hover:text-primary"
  >
    <MapPin className="w-3.5 h-3.5 text-primary/50 group-hover:text-primary shrink-0 transition-colors" />
    <span className="group-hover:translate-x-0.5 transition-transform duration-200 story-link">
      Cheap Flights to {dest.city}
    </span>
  </Link>
);

export default DestinationGrid;
