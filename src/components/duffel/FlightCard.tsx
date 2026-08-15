import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Luggage, Plane, Power, Wifi } from "lucide-react";
import type { DuffelOffer, DuffelSlice } from "@/types/duffel";
import {
  cabinLabel,
  formatDateShort,
  formatDuration,
  formatMoney,
  formatTime,
  offerBaggage,
  segmentCarrier,
  segmentFlightNumber,
  stopsLabel,
} from "@/lib/duffelUtils";

interface Props {
  offer: DuffelOffer;
  onSelect: (offer: DuffelOffer) => void;
  badge?: string | null;
}

function SliceRow({ slice }: { slice: DuffelSlice }) {
  const segments = slice.segments || [];
  const first = segments[0];
  const last = segments[segments.length - 1];
  const carrier = first ? segmentCarrier(first) : null;
  const logo = carrier?.logo_symbol_url;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
      <div className="flex items-center gap-3 sm:w-52 min-w-0">
        {logo ? (
          <img
            src={logo}
            alt={carrier?.name ? `${carrier.name} logo` : "Airline logo"}
            className="w-8 h-8 object-contain"
            loading="lazy"
          />
        ) : (
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
            <Plane className="w-4 h-4 text-primary" aria-hidden="true" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{carrier?.name || "Airline"}</p>
          <p className="text-xs text-muted-foreground truncate">
            {segments.map((s) => segmentFlightNumber(s)).filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center gap-3">
        <div className="text-left">
          <p className="text-lg font-semibold leading-tight">{formatTime(first?.departing_at)}</p>
          <p className="text-xs font-medium">{slice.origin?.iata_code || first?.origin?.iata_code}</p>
          <p className="text-xs text-muted-foreground truncate max-w-[9rem]">
            {slice.origin?.city_name || slice.origin?.name || ""}
          </p>
        </div>

        <div className="flex-1 text-center px-1">
          <p className="text-xs text-muted-foreground">{formatDuration(slice.duration)}</p>
          <div className="relative h-px bg-border my-1.5">
            <Plane className="w-3 h-3 text-primary absolute -top-1.5 right-0" aria-hidden="true" />
          </div>
          <p className="text-xs text-muted-foreground">{stopsLabel(slice)}</p>
        </div>

        <div className="text-right">
          <p className="text-lg font-semibold leading-tight">{formatTime(last?.arriving_at)}</p>
          <p className="text-xs font-medium">
            {slice.destination?.iata_code || last?.destination?.iata_code}
          </p>
          <p className="text-xs text-muted-foreground truncate max-w-[9rem]">
            {slice.destination?.city_name || slice.destination?.name || ""}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FlightCard({ offer, onSelect, badge }: Props) {
  const bags = offerBaggage(offer);
  const firstSegment = offer.slices?.[0]?.segments?.[0];
  const cabin = cabinLabel(firstSegment?.cabin_class || "");
  const fareBrand = offer.slices?.[0]?.fare_brand_name || firstSegment?.cabin_class_marketing_name;
  const wifi = offer.slices?.some((s) => s.segments?.some((seg) => seg.amenities?.wifi));
  const power = offer.slices?.some((s) => s.segments?.some((seg) => seg.amenities?.power));
  const aircraft = firstSegment?.aircraft;
  const refundable = offer.conditions?.refund_before_departure?.allowed;
  const changeable = offer.conditions?.change_before_departure?.allowed;

  return (
    <Card className="border-border hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-stretch gap-4">
          <div className="flex-1 space-y-4">
            {badge && (
              <Badge className="bg-success text-success-foreground text-[10px]">{badge}</Badge>
            )}
            {(offer.slices || []).map((slice, i) => (
              <div key={slice.id || i} className="space-y-1">
                {(offer.slices?.length || 0) > 1 && (
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {i === 0 ? "Outbound" : i === 1 ? "Return" : `Flight ${i + 1}`} ·{" "}
                    {formatDateShort(slice.segments?.[0]?.departing_at)}
                  </p>
                )}
                <SliceRow slice={slice} />
              </div>
            ))}

            <div className="flex flex-wrap items-center gap-1.5">
              {cabin && <Badge variant="outline" className="text-xs">{cabin}</Badge>}
              {fareBrand && <Badge variant="secondary" className="text-xs">{fareBrand}</Badge>}
              <Badge variant="outline" className="text-xs gap-1">
                <Luggage className="w-3 h-3" aria-hidden="true" />
                {bags.checked > 0 ? `${bags.checked} checked bag${bags.checked > 1 ? "s" : ""}` : "No checked bag"}
              </Badge>
              <Badge variant="outline" className="text-xs gap-1">
                <Briefcase className="w-3 h-3" aria-hidden="true" />
                {bags.carryOn > 0 ? `${bags.carryOn} carry-on` : "Carry-on: check fare"}
              </Badge>
              {wifi && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Wifi className="w-3 h-3" aria-hidden="true" /> Wi-Fi
                </Badge>
              )}
              {power && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Power className="w-3 h-3" aria-hidden="true" /> Power
                </Badge>
              )}
              {aircraft && <Badge variant="outline" className="text-xs">{aircraft}</Badge>}
              {refundable != null && (
                <Badge variant="outline" className="text-xs">
                  {refundable ? "Refundable" : "Non-refundable"}
                </Badge>
              )}
              {changeable != null && (
                <Badge variant="outline" className="text-xs">
                  {changeable ? "Changes allowed" : "No changes"}
                </Badge>
              )}
            </div>
          </div>

          <div className="lg:w-44 lg:border-l lg:pl-4 flex lg:flex-col items-center lg:items-end justify-between gap-3">
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {formatMoney(offer.total_amount, offer.total_currency)}
              </p>
              <p className="text-xs text-muted-foreground">
                total{offer.total_currency ? ` · ${offer.total_currency}` : ""}
              </p>
            </div>
            <Button
              className="lg:w-full"
              onClick={() => onSelect(offer)}
              aria-label={`Select flight for ${formatMoney(offer.total_amount, offer.total_currency)}`}
            >
              Select Flight
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
