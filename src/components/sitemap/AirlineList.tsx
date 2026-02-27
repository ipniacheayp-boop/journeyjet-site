import { airlines } from "@/data/destinationsData";
import { Plane } from "lucide-react";

const AirlineList = () => (
  <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-2">
    {airlines.map((airline) => (
      <li
        key={airline}
        className="flex items-center gap-2 text-sm text-muted-foreground py-1"
      >
        <Plane className="w-3.5 h-3.5 text-primary shrink-0" />
        <span>{airline}</span>
      </li>
    ))}
  </ul>
);

export default AirlineList;
