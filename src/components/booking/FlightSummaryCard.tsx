import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, Clock, Calendar, MapPin } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface FlightSummaryCardProps {
  offer: any;
}

const FlightSummaryCard = ({ offer }: FlightSummaryCardProps) => {
  const itinerary = offer?.itineraries?.[0];
  const segments = itinerary?.segments || [];
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];
  const price = parseFloat(offer?.price?.total || offer?.price?.grandTotal || "0");
  const currency = offer?.price?.currency || "USD";
  const duration = itinerary?.duration || "";
  const cabin = offer?.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || "ECONOMY";
  const stops = segments.length - 1;

  const formatDuration = (d: string) => d.replace("PT", "").replace("H", "h ").replace("M", "m");

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <Card className="bg-card border-border overflow-hidden">
      <div className="bg-primary/5 border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Plane className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">Flight Summary</span>
        </div>
        <Badge variant="outline" className="text-xs">{cabin}</Badge>
      </div>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Route */}
          <div className="flex items-center gap-4 flex-1">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{firstSegment?.departure?.iataCode}</p>
              <p className="text-xs text-muted-foreground">{formatTime(firstSegment?.departure?.at)}</p>
            </div>
            <div className="flex-1 flex flex-col items-center gap-1 min-w-[120px]">
              <p className="text-xs text-muted-foreground">{formatDuration(duration)}</p>
              <div className="w-full flex items-center gap-1">
                <div className="h-px flex-1 bg-border" />
                <Plane className="w-3 h-3 text-primary rotate-90" />
                <div className="h-px flex-1 bg-border" />
              </div>
              <p className="text-xs text-muted-foreground">
                {stops === 0 ? "Non-stop" : `${stops} Stop${stops > 1 ? "s" : ""}`}
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{lastSegment?.arrival?.iataCode}</p>
              <p className="text-xs text-muted-foreground">{formatTime(lastSegment?.arrival?.at)}</p>
            </div>
          </div>

          {/* Date & Price */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(firstSegment?.departure?.at)}
            </div>
            <p className="text-2xl font-bold text-primary">{formatCurrency(price, currency)}</p>
            <p className="text-xs text-muted-foreground">per person</p>
          </div>
        </div>

        {/* Carrier */}
        <div className="mt-4 pt-3 border-t border-border flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-3.5 h-3.5" />
          <span>
            {firstSegment?.carrierCode} {firstSegment?.number}
            {segments.length > 1 && ` + ${segments.length - 1} more segment${segments.length > 2 ? "s" : ""}`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlightSummaryCard;
