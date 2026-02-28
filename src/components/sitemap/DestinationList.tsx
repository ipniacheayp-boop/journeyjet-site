import { Link } from "react-router-dom";
import { Destination } from "@/data/destinationsData";
import { MapPin } from "lucide-react";

interface DestinationListProps {
  destinations: Destination[];
}

const DestinationList = ({ destinations }: DestinationListProps) => (
  <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-2">
    {destinations.map((dest) => (
      <li key={dest.slug}>
        <Link
          to={`/flights-to/${dest.slug}`}
          className="group flex items-center gap-2 text-sm text-muted-foreground py-1 transition-colors hover:text-primary"
        >
          <MapPin className="w-3.5 h-3.5 text-primary/60 group-hover:text-primary shrink-0 transition-colors" />
          <span className="group-hover:translate-x-0.5 transition-transform duration-200">
            Cheap Flights to {dest.city}
          </span>
        </Link>
      </li>
    ))}
  </ul>
);

export default DestinationList;
