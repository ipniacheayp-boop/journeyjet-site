import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useFxSmartSave } from "@/hooks/useFxSmartSave";
import FxSmartSaveBadge from "@/components/FxSmartSaveBadge";
import { Plane, Calendar, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface FlightResultCardProps {
  flight: any;
  onBook: (flight: any) => void;
}

export function FlightResultCard({ flight, onBook }: FlightResultCardProps) {
  const firstSegment = flight.itineraries?.[0]?.segments?.[0];
  const lastSegment = flight.itineraries?.[0]?.segments?.slice(-1)[0];
  const price = parseFloat(flight.price?.total || flight.price?.grandTotal || "0");
  const currency = flight.price?.currency || "USD";
  const duration = flight.itineraries?.[0]?.duration || "";

  // FX-SmartSave calculation
  const { data: fxData, showBadge } = useFxSmartSave({
    productType: 'flight',
    prices: [
      { currency: 'USD', amount: price },
      { currency: 'EUR', amount: price * 0.92 },
      { currency: 'GBP', amount: price * 0.79 },
    ],
    origin: firstSegment?.departure?.iataCode,
    destination: lastSegment?.arrival?.iataCode,
    travelDate: firstSegment?.departure?.at?.split('T')[0],
    enabled: price > 0,
  });

  return (
    <Card className="hover:shadow-lg transition-shadow animate-fade-in">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Plane className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {firstSegment?.departure?.iataCode} → {lastSegment?.arrival?.iataCode}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {firstSegment?.carrierCode} {firstSegment?.number}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1 flex-wrap">
              <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white">
                🟢 Lowest Price
              </Badge>
            </div>
            <div className="text-2xl font-bold text-primary">{formatCurrency(price, currency)}</div>
            <p className="text-sm text-muted-foreground">{currency}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>
              {firstSegment?.departure?.at ? new Date(firstSegment.departure.at).toLocaleString() : "N/A"}
            </span>
          </div>
          {duration && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>Duration: {duration.replace('PT', '').replace('H', 'h ').replace('M', 'm')}</span>
            </div>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">{flight.itineraries?.[0]?.segments?.length || 1} stop(s)</Badge>
            <Badge variant="outline">{flight.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || "Economy"}</Badge>
            
            {/* FX-SmartSave Badge */}
            {showBadge && fxData && (
              <TooltipProvider>
                <FxSmartSaveBadge
                  savingsUSD={fxData.savingsUSD}
                  recommendedCurrency={fxData.recommendedCurrency}
                  recommendedAmountLocal={fxData.recommendedAmountLocal}
                  recommendedAmountUSD={fxData.recommendedAmountUSD}
                  breakdown={fxData.breakdown}
                />
              </TooltipProvider>
            )}
          </div>
          <Button onClick={() => onBook(flight)} className="w-full">
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default FlightResultCard;