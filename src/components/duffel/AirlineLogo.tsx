import { useState } from "react";
import { Plane } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NormalizedAirline } from "@/lib/duffelMapper";

interface Props {
  airline: NormalizedAirline;
  className?: string;
}

/** Renders the Duffel carrier logo, falling back to a generic plane icon when the
 *  logo is missing or fails to load — never an empty container. */
export default function AirlineLogo({ airline, className }: Props) {
  const [failed, setFailed] = useState(false);
  const src = airline.logo || airline.logoLockup;

  if (!src || failed) {
    return (
      <div
        className={cn(
          "rounded-lg bg-primary/10 flex items-center justify-center shrink-0",
          className || "w-10 h-10",
        )}
      >
        <Plane className="w-4 h-4 text-primary" aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={airline.name || airline.code || "Airline logo"}
      onError={() => setFailed(true)}
      loading="lazy"
      className={cn("object-contain shrink-0", className || "w-10 h-10")}
    />
  );
}
