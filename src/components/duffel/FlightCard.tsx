import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Briefcase, Clock, Luggage, Plane } from "lucide-react";
import AirlineLogo from "@/components/duffel/AirlineLogo";
import type { DuffelOffer } from "@/types/duffel";
import { formatDateShort, formatMoney } from "@/lib/duffelUtils";
import {
  mapDuffelOfferToFlight,
  type NormalizedSegment,
  type NormalizedSlice,
} from "@/lib/duffelMapper";

interface Props {
  offer: DuffelOffer;
  onSelect: (offer: DuffelOffer) => void;
  onViewDetails?: (offer: DuffelOffer) => void;
  badge?: string | null;
}

function SegmentRow({ segment }: { segment: NormalizedSegment }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
        <div className="flex items-center gap-3 sm:w-56 min-w-0">
          <AirlineLogo airline={segment.airline} className="w-10 h-10" />
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{segment.airline.name || "Airline"}</p>
            <p className="text-xs text-muted-foreground truncate">
              {[segment.airline.code, segment.flightNumber].filter(Boolean).join(" · ") || "—"}
            </p>
            {segment.operatingAirline?.name && (
              <p className="text-[11px] text-muted-foreground truncate">
                Operated by {segment.operatingAirline.name}
              </p>
            )}
          </div>
        </div>

        <div className="flex-1 flex items-center gap-3">
          <div className="text-left min-w-0">
            {segment.departure.time && (
              <p className="text-lg font-semibold leading-tight">{segment.departure.time}</p>
            )}
            {segment.departure.iata && (
              <p className="text-xs font-medium">{segment.departure.iata}</p>
            )}
            {segment.departure.city && (
              <p className="text-xs text-muted-foreground truncate max-w-[9rem]">
                {segment.departure.city}
              </p>
            )}
            {segment.departure.airport && (
              <p className="text-[11px] text-muted-foreground truncate max-w-[10rem]">
                {segment.departure.airport}
                {segment.departure.terminal ? ` · T${segment.departure.terminal}` : ""}
              </p>
            )}
          </div>

          <div className="flex-1 text-center px-1">
            {segment.duration && (
              <p className="text-xs text-muted-foreground">{segment.duration}</p>
            )}
            <div className="relative h-px bg-border my-1.5">
              <Plane className="w-3 h-3 text-primary absolute -top-1.5 right-0" aria-hidden="true" />
            </div>
            {segment.aircraft && (
              <p className="text-[11px] text-muted-foreground truncate">{segment.aircraft}</p>
            )}
          </div>

          <div className="text-right min-w-0">
            {segment.arrival.time && (
              <p className="text-lg font-semibold leading-tight">{segment.arrival.time}</p>
            )}
            {segment.arrival.iata && <p className="text-xs font-medium">{segment.arrival.iata}</p>}
            {segment.arrival.city && (
              <p className="text-xs text-muted-foreground truncate max-w-[9rem] ml-auto">
                {segment.arrival.city}
              </p>
            )}
            {segment.arrival.airport && (
              <p className="text-[11px] text-muted-foreground truncate max-w-[10rem] ml-auto">
                {segment.arrival.airport}
                {segment.arrival.terminal ? ` · T${segment.arrival.terminal}` : ""}
              </p>
            )}
          </div>
        </div>
      </div>

      {segment.technicalStops.map((stop, i) => (
        <p key={i} className="text-[11px] text-muted-foreground">
          Technical stop in {stop.label}
          {stop.duration ? ` · ${stop.duration}` : ""}
        </p>
      ))}

      {segment.layoverAfter && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" aria-hidden="true" />
          {segment.layoverAfter.label}
          {segment.layoverAfter.place ? ` in ${segment.layoverAfter.place}` : ""}
        </div>
      )}
    </div>
  );
}

function SliceBlock({ slice, showLabel }: { slice: NormalizedSlice; showLabel: boolean }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {showLabel ? `${slice.label} · ` : ""}
          {formatDateShort(slice.departureDateIso)}
          {slice.originIata && slice.destinationIata
            ? ` · ${slice.originIata} → ${slice.destinationIata}`
            : ""}
        </p>
        <p className="text-xs text-muted-foreground">
          {[slice.duration, slice.stopsLabel].filter(Boolean).join(" · ")}
        </p>
      </div>

      {slice.segments.map((segment) => (
        <SegmentRow key={segment.id} segment={segment} />
      ))}
    </div>
  );
}

export default function FlightCard({ offer, onSelect, onViewDetails, badge }: Props) {
  const flight = mapDuffelOfferToFlight(offer);
  const { baggage } = flight;

  return (
    <Card className="border-border hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-stretch gap-4">
          <div className="flex-1 space-y-4 min-w-0">
            {badge && (
              <Badge className="bg-success text-success-foreground text-[10px]">{badge}</Badge>
            )}

            {flight.slices.map((slice, i) => (
              <div key={slice.id} className="space-y-3">
                {i > 0 && <Separator />}
                <SliceBlock slice={slice} showLabel={flight.slices.length > 1} />
              </div>
            ))}

            <div className="flex flex-wrap items-center gap-1.5">
              {flight.cabin && (
                <Badge variant="outline" className="text-xs">
                  {flight.cabin}
                </Badge>
              )}
              {flight.fareBrand && (
                <Badge variant="secondary" className="text-xs">
                  {flight.fareBrand}
                </Badge>
              )}
              {baggage.available ? (
                <>
                  <Badge variant="outline" className="text-xs gap-1">
                    <Luggage className="w-3 h-3" aria-hidden="true" />
                    {baggage.checked > 0
                      ? `${baggage.checked} checked bag${baggage.checked > 1 ? "s" : ""}`
                      : "No checked bag"}
                  </Badge>
                  <Badge variant="outline" className="text-xs gap-1">
                    <Briefcase className="w-3 h-3" aria-hidden="true" />
                    {baggage.carryOn > 0
                      ? `${baggage.carryOn} carry-on`
                      : "No carry-on included"}
                  </Badge>
                </>
              ) : (
                <Badge variant="outline" className="text-xs">
                  Baggage information unavailable
                </Badge>
              )}
              {flight.amenities.map((a) => (
                <Badge key={a} variant="outline" className="text-xs">
                  {a}
                </Badge>
              ))}
              {flight.conditions.refundable != null && (
                <Badge variant="outline" className="text-xs">
                  {flight.conditions.refundable ? "Refundable" : "Non-refundable"}
                </Badge>
              )}
              {flight.conditions.changeable != null && (
                <Badge variant="outline" className="text-xs">
                  {flight.conditions.changeable ? "Changes allowed" : "No changes"}
                </Badge>
              )}
            </div>
          </div>

          <div className="lg:w-48 lg:border-l lg:pl-4 flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-stretch justify-between gap-3">
            <div className="lg:text-right">
              {flight.priceAmount ? (
                <p className="text-2xl font-bold text-primary">
                  {formatMoney(flight.priceAmount, flight.currency)}
                </p>
              ) : null}
              <p className="text-xs text-muted-foreground">
                total{flight.currency ? ` · ${flight.currency}` : ""} ·{" "}
                {flight.passengerCount} passenger{flight.passengerCount > 1 ? "s" : ""}
              </p>
              {flight.taxAmount && (
                <p className="text-[11px] text-muted-foreground">
                  incl. taxes {formatMoney(flight.taxAmount, flight.taxCurrency)}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2 w-full">
              {onViewDetails && (
                <Button
                  variant="outline"
                  onClick={() => onViewDetails(offer)}
                  aria-label={`View full details for ${flight.airline.name || "this flight"}`}
                >
                  View details
                </Button>
              )}
              <Button
                onClick={() => onSelect(offer)}
                aria-label={`Select flight for ${formatMoney(flight.priceAmount, flight.currency)}`}
              >
                Select Flight <ArrowRight className="w-4 h-4 ml-1" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
