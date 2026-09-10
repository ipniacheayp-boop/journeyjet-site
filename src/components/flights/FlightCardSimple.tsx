import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plane, Calendar, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface NormalizedFlight {
  id: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  from: string;
  to: string;
  departureDate: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  currency: string;
  cabin: string;
  stops: number;
  returnDate?: string;
}

interface FlightCardSimpleProps {
  flight: NormalizedFlight;
  isCheapest?: boolean;
}

const FlightCardSimple = ({ flight, isCheapest }: FlightCardSimpleProps) => {
  const navigate = useNavigate();

  const durationFormatted = flight.duration
    .replace("PT", "")
    .replace("H", "h ")
    .replace("M", "m");

  return (
    <Card className="group hover:shadow-md transition-all duration-200 border-border/60">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: route info */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Plane className="w-5 h-5 text-primary" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-foreground">
                  {flight.from}
                </span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold text-foreground">
                  {flight.to}
                </span>
                {isCheapest && (
                  <Badge className="bg-success text-success-foreground text-[10px] px-1.5 py-0">
                    Cheapest
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {flight.airline} · {flight.flightNumber} · {flight.cabin}
              </p>
            </div>
          </div>

          {/* Center: date & duration */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(flight.departureDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {durationFormatted}
            </span>
            <Badge variant="outline" className="text-[10px]">
              {flight.stops === 0 ? "Nonstop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`}
            </Badge>
          </div>

          {/* Right: price & CTA */}
          <div className="flex items-center gap-4 sm:flex-col sm:items-end">
            <span className="text-xl font-bold text-primary">
              ${flight.price.toFixed(0)}
            </span>
            <Button
              size="sm"
              onClick={() =>
                navigate(
                  `/search-results?from=${flight.from}&to=${flight.to}&date=${flight.departureDate}`
                )
              }
            >
              Book Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlightCardSimple;
