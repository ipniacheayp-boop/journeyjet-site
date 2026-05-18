import { Card, CardContent } from "@/components/ui/card";
import { Car, Calendar, MapPin } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CarSummaryCardProps {
  offer: any;
}

const CarSummaryCard = ({ offer }: CarSummaryCardProps) => {
  const price = parseFloat(offer?.price?.total || "0");
  const currency = offer?.price?.currency || "USD";
  const vehicle = offer?.vehicle?.description || offer?.vehicle?.category || offer?.title || "Selected Vehicle";
  const supplier = offer?.provider?.name || offer?.supplier?.name || offer?.vendor || "";
  const pickup = offer?.pickup?.location || offer?.pickUpLocation || "";
  const pickupAt = offer?.pickup?.dateTime || offer?.pickUpDate;
  const dropoffAt = offer?.dropoff?.dateTime || offer?.dropOffDate;

  const fmt = (d?: string) =>
    d ? new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "";

  return (
    <Card className="bg-card border-border overflow-hidden">
      <div className="bg-primary/5 border-b border-border px-6 py-3 flex items-center gap-2">
        <Car className="w-4 h-4 text-primary" />
        <span className="font-semibold text-sm text-foreground">Car Rental Summary</span>
      </div>
      <CardContent className="p-6 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xl font-bold text-foreground">{vehicle}</p>
            {supplier && <p className="text-sm text-muted-foreground">{supplier}</p>}
            {pickup && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> {pickup}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{formatCurrency(Math.ceil(price), currency)}</p>
            <p className="text-xs text-muted-foreground">total</p>
          </div>
        </div>
        {(pickupAt || dropoffAt) && (
          <div className="pt-3 border-t border-border flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>{fmt(pickupAt)} → {fmt(dropoffAt)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CarSummaryCard;
