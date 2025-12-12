import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useFxSmartSave } from "@/hooks/useFxSmartSave";
import FxSmartSaveBadge from "@/components/FxSmartSaveBadge";
import { Car, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CarResultCardProps {
  car: any;
  onBook: (car: any) => void;
}

export function CarResultCard({ car, onBook }: CarResultCardProps) {
  const vehicle = car.vehicle || {};
  const price = parseFloat(car.price?.total || "0");
  const currency = car.price?.currency || "USD";
  const provider = car.provider || {};
  const vehicleName = vehicle.make && vehicle.model 
    ? `${vehicle.make} ${vehicle.model}` 
    : vehicle.category || "Car Rental";

  // FX-SmartSave calculation
  const { data: fxData, showBadge } = useFxSmartSave({
    productType: 'car',
    prices: [
      { currency: 'USD', amount: price },
      { currency: 'EUR', amount: price * 0.92 },
      { currency: 'GBP', amount: price * 0.79 },
    ],
    enabled: price > 0,
  });

  return (
    <Card className="hover:shadow-lg transition-shadow animate-fade-in">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {vehicle.imageUrl ? (
              <img 
                src={vehicle.imageUrl} 
                alt={vehicleName}
                className="w-16 h-12 object-contain rounded-lg bg-muted"
              />
            ) : (
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-primary" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{vehicleName}</CardTitle>
              <p className="text-sm text-muted-foreground">{vehicle.category || "Standard"}</p>
              {provider.name && (
                <p className="text-xs text-muted-foreground mt-1">by {provider.name}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
              <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white text-xs">
                🟢 Best Price
              </Badge>
            </div>
            <div className="text-2xl font-bold text-primary">{formatCurrency(price, currency)}</div>
            <p className="text-xs text-muted-foreground">total</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Vehicle Features */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>{vehicle.seats || 5} seats</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 text-muted-foreground">🚪</span>
              <span>{vehicle.doors || 4} doors</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 text-muted-foreground">🧳</span>
              <span>{vehicle.bags || 2} bags</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 text-muted-foreground">⚙️</span>
              <span>{vehicle.transmission || "Auto"}</span>
            </div>
          </div>

          {/* Feature badges */}
          <div className="flex flex-wrap gap-2">
            {vehicle.hasAC !== false && (
              <Badge variant="outline" className="text-xs">❄️ AC</Badge>
            )}
            {vehicle.transmission && (
              <Badge variant="outline" className="text-xs">{vehicle.transmission}</Badge>
            )}
            {vehicle.fuelType && (
              <Badge variant="outline" className="text-xs">{vehicle.fuelType}</Badge>
            )}
            {vehicle.acrissCode && (
              <Badge variant="secondary" className="text-xs">{vehicle.acrissCode}</Badge>
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
          </div>

          <Button onClick={() => onBook(car)} className="w-full">
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default CarResultCard;