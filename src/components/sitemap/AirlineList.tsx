import { useState } from "react";
import { Link } from "react-router-dom";
import { Plane, ChevronDown, ChevronUp } from "lucide-react";
import { airlinesData } from "@/data/destinationsData";

const INITIAL_COUNT = 16;

const AirlineList = () => {
  const [showAll, setShowAll] = useState(false);
  const sorted = [...airlinesData].sort((a, b) => a.name.localeCompare(b.name));
  const visible = showAll ? sorted : sorted.slice(0, INITIAL_COUNT);

  return (
    <div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-1">
        {visible.map((airline) => (
          <li key={airline.slug}>
            <Link
              to={`/airlines/${airline.slug}`}
              className="group flex items-center gap-2.5 text-sm text-muted-foreground py-2 px-1 rounded-md transition-colors hover:text-primary hover:bg-primary/5"
            >
              <Plane className="w-3.5 h-3.5 text-primary/60 group-hover:text-primary shrink-0 transition-colors" />
              <span className="transition-colors group-hover:underline underline-offset-2">
                {airline.name}
              </span>
              {airline.popular && (
                <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full leading-none">
                  Popular
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>

      {sorted.length > INITIAL_COUNT && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {showAll ? (
            <>Show Less <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>View All {sorted.length} Airlines <ChevronDown className="w-4 h-4" /></>
          )}
        </button>
      )}
    </div>
  );
};

export default AirlineList;
