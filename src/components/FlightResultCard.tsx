import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plane, Calendar, Clock, ExternalLink, Luggage, Wifi, Tv, Zap } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface FlightResultCardProps {
  flight: any;
  onBook: (flight: any) => void;
}

const qualityIconMap: Record<string, any> = {
  wifi: Wifi,
  entertainment: Tv,
  power: Zap,
};

export function FlightResultCard({ flight, onBook }: FlightResultCardProps) {
  const firstSegment = flight.itineraries?.[0]?.segments?.[0];
  const lastSegment = flight.itineraries?.[0]?.segments?.slice(-1)[0];
  const price = parseFloat(flight.price?.total || flight.price?.grandTotal || "0");
  const currency = flight.price?.currency || "USD";
  const duration = flight.itineraries?.[0]?.duration || "";
  const kayak = flight._kayak;

  const hasReturnLeg = (flight.itineraries?.length || 0) > 1;
  const returnFirstSeg = hasReturnLeg ? flight.itineraries[1]?.segments?.[0] : null;
  const returnLastSeg = hasReturnLeg ? flight.itineraries[1]?.segments?.slice(-1)[0] : null;
  const returnDuration = hasReturnLeg ? flight.itineraries[1]?.duration : "";

  const formatDuration = (d: string) => {
    if (!d) return "";
    return d.replace("PT", "").replace("H", "h ").replace("M", "m");
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const stopCount = (flight.itineraries?.[0]?.segments?.length || 1) - 1;

  const handleBook = () => {
    onBook(flight);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow animate-fade-in border-border">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {kayak?.providerLogo ? (
              <img src={kayak.providerLogo} alt={kayak.providerName} className="w-12 h-12 object-contain rounded" />
            ) : (
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Plane className="w-6 h-6 text-primary" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg">
                {firstSegment?.departure?.iataCode} → {lastSegment?.arrival?.iataCode}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {kayak?.providerName || firstSegment?.carrierCode}{" "}
                {firstSegment?._airlineName ? `• ${firstSegment._airlineName}` : ""}{" "}
                {firstSegment?.number ? `#${firstSegment.number}` : ""}
              </p>
            </div>
          </div>
          <div className="text-right">
            {kayak?.badges?.length > 0 && (
              <div className="flex flex-wrap gap-1 justify-end mb-1">
                {kayak.badges.map((badge: string, i: number) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {badge}
                  </Badge>
                ))}
              </div>
            )}
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(Math.ceil(price), currency)}
            </div>
            <p className="text-xs text-muted-foreground">per person</p>
            {kayak?.fareFamilyName && (
              <Badge variant="outline" className="mt-1 text-xs">{kayak.fareFamilyName}</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Outbound leg */}
          <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
            <div className="text-center">
              <p className="text-lg font-semibold">{formatTime(firstSegment?.departure?.at)}</p>
              <p className="text-xs text-muted-foreground">{firstSegment?.departure?.iataCode}</p>
              <p className="text-xs text-muted-foreground">{formatDate(firstSegment?.departure?.at)}</p>
            </div>
            <div className="flex-1 mx-4 text-center">
              <p className="text-xs text-muted-foreground">{formatDuration(duration)}</p>
              <div className="h-px bg-border my-1 relative">
                <Plane className="w-3 h-3 text-primary absolute -top-1.5 right-0" />
              </div>
              <p className="text-xs text-muted-foreground">
                {stopCount === 0 ? "Direct" : `${stopCount} stop${stopCount > 1 ? "s" : ""}`}
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">{formatTime(lastSegment?.arrival?.at)}</p>
              <p className="text-xs text-muted-foreground">{lastSegment?.arrival?.iataCode}</p>
              <p className="text-xs text-muted-foreground">{formatDate(lastSegment?.arrival?.at)}</p>
            </div>
          </div>

          {/* Return leg */}
          {hasReturnLeg && returnFirstSeg && returnLastSeg && (
            <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
              <div className="text-center">
                <p className="text-lg font-semibold">{formatTime(returnFirstSeg?.departure?.at)}</p>
                <p className="text-xs text-muted-foreground">{returnFirstSeg?.departure?.iataCode}</p>
                <p className="text-xs text-muted-foreground">{formatDate(returnFirstSeg?.departure?.at)}</p>
              </div>
              <div className="flex-1 mx-4 text-center">
                <p className="text-xs text-muted-foreground">{formatDuration(returnDuration)}</p>
                <div className="h-px bg-border my-1 relative">
                  <Plane className="w-3 h-3 text-primary absolute -top-1.5 right-0 rotate-180" />
                </div>
                <p className="text-xs text-muted-foreground">
                  {((flight.itineraries[1]?.segments?.length || 1) - 1) === 0
                    ? "Direct"
                    : `${(flight.itineraries[1]?.segments?.length || 1) - 1} stop(s)`}
                </p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">{formatTime(returnLastSeg?.arrival?.at)}</p>
                <p className="text-xs text-muted-foreground">{returnLastSeg?.arrival?.iataCode}</p>
                <p className="text-xs text-muted-foreground">{formatDate(returnLastSeg?.arrival?.at)}</p>
              </div>
            </div>
          )}

          {/* Quality items / amenities */}
          {kayak?.qualityItems?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {kayak.qualityItems.slice(0, 4).map((item: any, i: number) => {
                const Icon = qualityIconMap[item.code] || Plane;
                return (
                  <Badge key={i} variant="outline" className="text-xs gap-1">
                    <Icon className="w-3 h-3" />
                    {item.displayName}
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Cabin & fare info */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">
              {flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || "Economy"}
            </Badge>
            {kayak?.amenities?.slice(0, 3).map((a: any, i: number) => (
              <Badge key={i} variant={a.restriction === "included" ? "default" : "outline"} className="text-xs">
                {a.restriction === "included" ? "✓" : a.restriction === "fee" ? "$" : "✕"} {a.displayName}
              </Badge>
            ))}
          </div>

          {/* Booking options count */}
          {kayak?.allBookingOptions?.length > 1 && (
            <p className="text-xs text-muted-foreground">
              +{kayak.allBookingOptions.length - 1} more fare option{kayak.allBookingOptions.length > 2 ? "s" : ""} available
            </p>
          )}

          <Button onClick={handleBook} className="w-full">
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default FlightResultCard;
