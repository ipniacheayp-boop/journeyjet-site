import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Clock, Loader2, Plane } from "lucide-react";
import type { DuffelOffer } from "@/types/duffel";
import { getDuffelOffer } from "@/services/duffelFlights";
import {
  cabinLabel,
  conditionLabel,
  formatDateShort,
  formatDuration,
  formatMinutes,
  formatMoney,
  formatTime,
  layoverMinutes,
  segmentCarrier,
  segmentFlightNumber,
  stopsLabel,
} from "@/lib/duffelUtils";

interface Props {
  offer: DuffelOffer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue?: (offer: DuffelOffer) => void;
}

export default function FlightDetailsDialog({ offer, open, onOpenChange, onContinue }: Props) {
  const [detailed, setDetailed] = useState<DuffelOffer | null>(offer);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDetailed(offer);
    setError(null);
    if (!open || !offer?.id) return;

    let cancelled = false;
    setLoading(true);
    // Re-fetch the offer so prices/conditions shown here are the live ones.
    getDuffelOffer(offer.id).then((res) => {
      if (cancelled) return;
      setLoading(false);
      if (res.offer) setDetailed(res.offer);
      if (res.error) setError(res.error);
    });

    return () => {
      cancelled = true;
    };
  }, [offer, open]);

  const data = detailed || offer;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review your flight</DialogTitle>
          <DialogDescription>
            Full itinerary, baggage and fare conditions for this fare.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!data ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {loading && (
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" /> Confirming latest price…
              </p>
            )}

            {(data.slices || []).map((slice, sIdx) => (
              <section key={slice.id || sIdx} className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    {slice.origin?.iata_code} <ArrowRight className="w-4 h-4" /> {slice.destination?.iata_code}
                    <span className="text-sm font-normal text-muted-foreground">
                      {formatDateShort(slice.segments?.[0]?.departing_at)}
                    </span>
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" /> {formatDuration(slice.duration)} · {stopsLabel(slice)}
                  </div>
                </div>

                {(slice.segments || []).map((segment, i) => {
                  const carrier = segmentCarrier(segment);
                  const layover = layoverMinutes(slice, i);
                  return (
                    <div key={segment.id || i} className="space-y-2">
                      <div className="rounded-xl border border-border p-3 sm:p-4">
                        <div className="flex items-center gap-3 mb-3">
                          {carrier?.logo_symbol_url ? (
                            <img
                              src={carrier.logo_symbol_url}
                              alt={carrier?.name ? `${carrier.name} logo` : "Airline logo"}
                              className="w-7 h-7 object-contain"
                              loading="lazy"
                            />
                          ) : (
                            <Plane className="w-5 h-5 text-primary" aria-hidden="true" />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{carrier?.name || "Airline"}</p>
                            <p className="text-xs text-muted-foreground">
                              {[segmentFlightNumber(segment), segment.aircraft].filter(Boolean).join(" · ")}
                            </p>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="font-semibold">{formatTime(segment.departing_at)}</p>
                            <p className="text-xs text-muted-foreground">
                              {segment.origin?.iata_code} · {segment.origin?.city_name || segment.origin?.name}
                              {segment.origin_terminal ? ` · Terminal ${segment.origin_terminal}` : ""}
                            </p>
                          </div>
                          <div className="text-xs text-muted-foreground sm:text-center">
                            {formatDuration(segment.duration)}
                          </div>
                          <div className="sm:text-right">
                            <p className="font-semibold">{formatTime(segment.arriving_at)}</p>
                            <p className="text-xs text-muted-foreground">
                              {segment.destination?.iata_code} ·{" "}
                              {segment.destination?.city_name || segment.destination?.name}
                              {segment.destination_terminal
                                ? ` · Terminal ${segment.destination_terminal}`
                                : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {segment.cabin_class && (
                            <Badge variant="outline" className="text-xs">
                              {cabinLabel(segment.cabin_class)}
                            </Badge>
                          )}
                          {segment.cabin_class_marketing_name && (
                            <Badge variant="secondary" className="text-xs">
                              {segment.cabin_class_marketing_name}
                            </Badge>
                          )}
                          {(segment.baggages || []).map((b, bi) => (
                            <Badge key={bi} variant="outline" className="text-xs">
                              {b.quantity} × {b.type === "carry_on" ? "carry-on" : "checked"}
                            </Badge>
                          ))}
                          {segment.amenities?.wifi && (
                            <Badge variant="outline" className="text-xs">Wi-Fi</Badge>
                          )}
                          {segment.amenities?.power && (
                            <Badge variant="outline" className="text-xs">Power</Badge>
                          )}
                        </div>

                        {(segment.stops || []).map((stop, si) => (
                          <p key={si} className="text-xs text-muted-foreground mt-2">
                            Technical stop at {stop.airport?.iata_code || stop.airport?.name} ·{" "}
                            {formatDuration(stop.duration)}
                          </p>
                        ))}
                      </div>

                      {layover > 0 && (
                        <p className="text-xs text-muted-foreground pl-1">
                          {formatMinutes(layover)} layover in{" "}
                          {segment.destination?.city_name || segment.destination?.iata_code}
                        </p>
                      )}
                    </div>
                  );
                })}

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>{conditionLabel(slice.conditions?.refund_before_departure, "Refund")}</p>
                  <p>{conditionLabel(slice.conditions?.change_before_departure, "Change")}</p>
                </div>
              </section>
            ))}

            <Separator />

            <div className="space-y-1 text-xs text-muted-foreground">
              <p>{conditionLabel(data.conditions?.refund_before_departure, "Refund")}</p>
              <p>{conditionLabel(data.conditions?.change_before_departure, "Change")}</p>
              {data.expires_at && <p>Fare held until {new Date(data.expires_at).toLocaleString()}</p>}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-muted/50 p-4">
              <div>
                <p className="text-2xl font-bold text-primary">
                  {formatMoney(data.total_amount, data.total_currency)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Total for {data.passengers?.length || 1} passenger
                  {(data.passengers?.length || 1) > 1 ? "s" : ""}
                  {data.tax_amount ? ` · incl. taxes ${formatMoney(data.tax_amount, data.total_currency)}` : ""}
                </p>
              </div>
              <Button
                onClick={() => data && onContinue?.(data)}
                disabled={!onContinue || loading}
                aria-label="Continue to passenger details"
              >
                Continue to passenger details
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
