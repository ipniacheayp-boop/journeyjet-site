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
import { ArrowRight, Clock, Loader2 } from "lucide-react";
import AirlineLogo from "@/components/duffel/AirlineLogo";
import type { DuffelOffer } from "@/types/duffel";
import { getDuffelOffer } from "@/services/duffelFlights";
import { formatDateShort, formatMoney } from "@/lib/duffelUtils";
import { mapDuffelOfferToFlight } from "@/lib/duffelMapper";

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
  const flight = data ? mapDuffelOfferToFlight(data) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review your flight</DialogTitle>
          <DialogDescription>
            Full itinerary, baggage, amenities and fare conditions for this fare.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!flight ? (
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

            <div className="flex items-center gap-3">
              <AirlineLogo airline={flight.airline} className="w-11 h-11" />
              <div className="min-w-0">
                <p className="font-semibold truncate">{flight.airline.name || "Airline"}</p>
                <p className="text-xs text-muted-foreground">
                  {[flight.airline.code, flight.flightNumber, flight.duration]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            </div>

            {flight.slices.map((slice) => (
              <section key={slice.id} className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    {slice.originIata} <ArrowRight className="w-4 h-4" /> {slice.destinationIata}
                    <span className="text-sm font-normal text-muted-foreground">
                      {formatDateShort(slice.departureDateIso)}
                    </span>
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />{" "}
                    {[slice.duration, slice.stopsLabel].filter(Boolean).join(" · ")}
                  </div>
                </div>

                {slice.segments.map((segment) => (
                  <div key={segment.id} className="space-y-2">
                    <div className="rounded-xl border border-border p-3 sm:p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <AirlineLogo airline={segment.airline} className="w-8 h-8" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">
                            {segment.airline.name || "Airline"}
                            {segment.airline.code ? ` · ${segment.airline.code}` : ""}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {[segment.flightNumber, segment.aircraft].filter(Boolean).join(" · ")}
                          </p>
                          {segment.operatingAirline?.name && (
                            <p className="text-[11px] text-muted-foreground">
                              Operated by {segment.operatingAirline.name}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-3 text-sm">
                        <div>
                          {segment.departure.time && (
                            <p className="font-semibold">{segment.departure.time}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {[segment.departure.iata, segment.departure.city, segment.departure.airport]
                              .filter(Boolean)
                              .join(" · ")}
                            {segment.departure.terminal ? ` · Terminal ${segment.departure.terminal}` : ""}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground sm:text-center">
                          {segment.duration || ""}
                        </div>
                        <div className="sm:text-right">
                          {segment.arrival.time && (
                            <p className="font-semibold">{segment.arrival.time}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {[segment.arrival.iata, segment.arrival.city, segment.arrival.airport]
                              .filter(Boolean)
                              .join(" · ")}
                            {segment.arrival.terminal ? ` · Terminal ${segment.arrival.terminal}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {segment.cabin && (
                          <Badge variant="outline" className="text-xs">
                            {segment.cabin}
                          </Badge>
                        )}
                        {slice.fareBrand && (
                          <Badge variant="secondary" className="text-xs">
                            {slice.fareBrand}
                          </Badge>
                        )}
                        {segment.baggage.available ? (
                          <>
                            {segment.baggage.checked > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {segment.baggage.checked} checked
                              </Badge>
                            )}
                            {segment.baggage.carryOn > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {segment.baggage.carryOn} carry-on
                              </Badge>
                            )}
                          </>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Baggage information unavailable
                          </Badge>
                        )}
                        {segment.amenities.map((a) => (
                          <Badge key={a} variant="outline" className="text-xs">
                            {a}
                          </Badge>
                        ))}
                      </div>

                      {segment.technicalStops.map((stop, si) => (
                        <p key={si} className="text-xs text-muted-foreground mt-2">
                          Technical stop at {stop.label}
                          {stop.duration ? ` · ${stop.duration}` : ""}
                        </p>
                      ))}
                    </div>

                    {segment.layoverAfter && (
                      <p className="text-xs text-muted-foreground pl-1">
                        {segment.layoverAfter.label}
                        {segment.layoverAfter.place ? ` in ${segment.layoverAfter.place}` : ""}
                      </p>
                    )}
                  </div>
                ))}

                {(slice.conditions.refund || slice.conditions.change) && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    {slice.conditions.refund && <p>{slice.conditions.refund}</p>}
                    {slice.conditions.change && <p>{slice.conditions.change}</p>}
                  </div>
                )}
              </section>
            ))}

            <Separator />

            <div className="space-y-1 text-xs text-muted-foreground">
              {flight.conditions.refundable != null && (
                <p>{flight.conditions.refundable ? "Refundable before departure" : "Non-refundable"}</p>
              )}
              {flight.conditions.changeable != null && (
                <p>{flight.conditions.changeable ? "Changes allowed before departure" : "No changes allowed"}</p>
              )}
              {flight.expiresAt && <p>Fare held until {new Date(flight.expiresAt).toLocaleString()}</p>}
              {flight.paymentRequiredBy && (
                <p>Payment required by {new Date(flight.paymentRequiredBy).toLocaleString()}</p>
              )}
              {flight.priceGuaranteeExpiresAt && (
                <p>
                  Price guaranteed until {new Date(flight.priceGuaranteeExpiresAt).toLocaleString()}
                </p>
              )}
              {flight.identityDocumentsRequired && <p>Passport details required at booking.</p>}
            </div>

            <div className="rounded-xl bg-muted/50 p-4 space-y-3">
              <div className="space-y-1 text-sm">
                {flight.baseAmount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base fare</span>
                    <span>{formatMoney(flight.baseAmount, flight.baseCurrency)}</span>
                  </div>
                )}
                {flight.taxAmount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxes &amp; fees</span>
                    <span>{formatMoney(flight.taxAmount, flight.taxCurrency)}</span>
                  </div>
                )}
                {flight.priceAmount && (
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatMoney(flight.priceAmount, flight.currency)}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  {flight.priceAmount && (
                    <p className="text-2xl font-bold text-primary">
                      {formatMoney(flight.priceAmount, flight.currency)}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Total for {flight.passengerCount} passenger
                    {flight.passengerCount > 1 ? "s" : ""}
                    {flight.currency ? ` · ${flight.currency}` : ""}
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
