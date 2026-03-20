import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useFxSmartSave } from "@/hooks/useFxSmartSave";
import FxSmartSaveBadge from "@/components/FxSmartSaveBadge";
import { Car, Users, MapPin, Navigation } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CarResultCardProps {
  car: any;
  onBook: (car: any) => void;
}

export function CarResultCard({ car, onBook }: CarResultCardProps) {
  const isRideshare = car.isRideshare === true;
  const vehicle = car.vehicle || {};
  const pricing = car.pricing || {};
  const priceObj = car.price || {};

  const totalPrice = pricing.grandTotal || pricing.totalPrice || parseFloat(priceObj.total || "0");
  const currency = pricing.currency || priceObj.currency || "USD";
  const dailyRate = pricing.dailyRate || (priceObj.perDay ? parseFloat(priceObj.perDay) : null);
  const totalDays = pricing.totalDays || null;
  const taxes = pricing.taxes || null;

  const provider = car.provider || {};
  const pickup = car.pickup || car.pickUp || {};
  const dropoff = car.dropoff || car.dropOff || {};
  const isMock = car.isMockData || false;

  const vehicleName = isRideshare
    ? `Uber ${vehicle.model || 'Ride'}`
    : vehicle.make && vehicle.model
      ? `${vehicle.make} ${vehicle.model}`
      : vehicle.category || "Car Rental";

  const { data: fxData, showBadge } = useFxSmartSave({
    productType: 'car',
    prices: [
      { currency: 'USD', amount: totalPrice },
      { currency: 'EUR', amount: totalPrice * 0.92 },
      { currency: 'GBP', amount: totalPrice * 0.79 },
    ],
    enabled: totalPrice > 0 && !isRideshare,
  });

  return (
    <Card className={`hover:shadow-lg transition-shadow animate-fade-in border-border ${isRideshare ? 'border-l-4 border-l-black dark:border-l-white' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {isRideshare ? (
              <div className="w-12 h-12 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                <Navigation className="w-6 h-6 text-white dark:text-black" />
              </div>
            ) : vehicle.imageUrl ? (
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
              <p className="text-sm text-muted-foreground">
                {isRideshare ? 'Rideshare' : vehicle.category || "Standard"}
              </p>
              {provider.name && (
                <p className="text-xs text-muted-foreground mt-1">by {provider.name}</p>
              )}
            </div>
          </div>
          <div className="text-right">
            {isMock && (
              <Badge variant="outline" className="text-xs mb-1 border-amber-400 text-amber-600">
                Demo Price
              </Badge>
            )}
            {isRideshare && pricing.priceEstimate ? (
              <div className="text-2xl font-bold text-primary">{pricing.priceEstimate}</div>
            ) : (
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(totalPrice, currency)}
              </div>
            )}
            {isRideshare ? (
              <p className="text-xs text-muted-foreground">
                {pricing.lowEstimate && pricing.highEstimate
                  ? `${formatCurrency(pricing.lowEstimate, currency)} – ${formatCurrency(pricing.highEstimate, currency)}`
                  : 'estimated'}
              </p>
            ) : dailyRate && totalDays ? (
              <p className="text-xs text-muted-foreground">
                {formatCurrency(dailyRate, currency)}/day × {totalDays} days
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">total</p>
            )}
            {!isRideshare && taxes != null && taxes > 0 && (
              <p className="text-xs text-muted-foreground">
                incl. {formatCurrency(taxes, currency)} taxes
              </p>
            )}
            {isRideshare && pricing.surgeMultiplier > 1 && (
              <Badge variant="destructive" className="text-xs mt-1">
                Surge {pricing.surgeMultiplier}x
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Pickup / Dropoff info */}
          {!isRideshare && (pickup.date || pickup.locationCode) && (
            <div className="grid grid-cols-2 gap-2 text-xs bg-muted/50 rounded-lg p-2">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium">Pick-up</span>
                  <p className="text-muted-foreground">{pickup.address || pickup.locationCode}</p>
                  {pickup.date && <p className="text-muted-foreground">{pickup.date}</p>}
                </div>
              </div>
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium">Drop-off</span>
                  <p className="text-muted-foreground">{dropoff.address || dropoff.locationCode}</p>
                  {dropoff.date && <p className="text-muted-foreground">{dropoff.date}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Vehicle Features (car rentals only) */}
          {!isRideshare && (
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
          )}

          {/* Rideshare info */}
          {isRideshare && (
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{vehicle.seats || 4} seats</span>
              </div>
            </div>
          )}

          {/* Feature badges */}
          <div className="flex flex-wrap gap-2">
            {!isRideshare && (vehicle.hasAC !== false && vehicle.airConditioning !== false) && (
              <Badge variant="outline" className="text-xs">❄️ AC</Badge>
            )}
            {!isRideshare && vehicle.transmission && (
              <Badge variant="outline" className="text-xs">{vehicle.transmission}</Badge>
            )}
            {!isRideshare && vehicle.fuelType && (
              <Badge variant="outline" className="text-xs">⛽ {vehicle.fuelType}</Badge>
            )}
            {vehicle.acrissCode && (
              <Badge variant="secondary" className="text-xs">{vehicle.acrissCode}</Badge>
            )}
            {car.features?.map((f: string, i: number) => (
              <Badge key={i} variant="outline" className="text-xs text-green-700 border-green-300">
                ✓ {f}
              </Badge>
            ))}

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
            {isRideshare ? 'Request Ride' : `Book Now — ${formatCurrency(totalPrice, currency)}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default CarResultCard;