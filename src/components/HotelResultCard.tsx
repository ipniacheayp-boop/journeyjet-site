import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useFxSmartSave } from "@/hooks/useFxSmartSave";
import FxSmartSaveBadge from "@/components/FxSmartSaveBadge";
import { Hotel as HotelIcon, MapPin } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface HotelResultCardProps {
  hotel: any;
  onBook: (hotel: any) => void;
}

export function HotelResultCard({ hotel, onBook }: HotelResultCardProps) {
  const offer = hotel.offers?.[0] || hotel;
  const price = parseFloat(offer.price?.total || "0");
  const currency = offer.price?.currency || "USD";

  // FX-SmartSave calculation
  const { data: fxData, showBadge } = useFxSmartSave({
    productType: 'hotel',
    prices: [
      { currency: 'USD', amount: price },
      { currency: 'EUR', amount: price * 0.92 },
      { currency: 'GBP', amount: price * 0.79 },
    ],
    destination: hotel.hotel?.cityCode,
    enabled: price > 0,
  });

  return (
    <Card className="hover:shadow-lg transition-shadow animate-fade-in">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <HotelIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{hotel.hotel?.name || "Hotel"}</CardTitle>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {hotel.hotel?.cityCode || "N/A"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
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
          {offer.room && (
            <div className="text-sm">
              <span className="font-medium">Room: </span>
              {offer.room.description?.text || offer.room.typeEstimated?.category || "Standard"}
            </div>
          )}
          {offer.policies && (
            <div className="text-sm text-muted-foreground">
              Cancellation: {offer.policies.cancellation?.type || "Check policy"}
            </div>
          )}
          
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
          
          <Button onClick={() => onBook(hotel)} className="w-full">
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default HotelResultCard;