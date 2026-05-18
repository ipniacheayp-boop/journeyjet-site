import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hotel, Calendar, MapPin, BedDouble } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface HotelSummaryCardProps {
  offer: any;
}

const HotelSummaryCard = ({ offer }: HotelSummaryCardProps) => {
  const hotelOffer = offer?.offers?.[0] || offer;
  const price = parseFloat(hotelOffer?.price?.total || offer?.price?.total || "0");
  const currency = hotelOffer?.price?.currency || offer?.price?.currency || "USD";
  const name =
    offer?.hotel?.name ||
    (offer?.googlePlace as any)?.displayName?.text ||
    offer?.name ||
    "Selected Hotel";
  const address =
    offer?.hotel?.address ||
    (offer?.googlePlace as any)?.formattedAddress ||
    offer?.hotel?.cityCode ||
    "";
  const checkIn = hotelOffer?.checkInDate || offer?.searchMeta?.checkInDate;
  const checkOut = hotelOffer?.checkOutDate || offer?.searchMeta?.checkOutDate;
  const rating = offer?.rating;
  const room = hotelOffer?.room?.description?.text || hotelOffer?.room?.typeEstimated?.category;

  const fmt = (d?: string) =>
    d ? new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "";

  return (
    <Card className="bg-card border-border overflow-hidden">
      <div className="bg-primary/5 border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hotel className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">Hotel Summary</span>
        </div>
        {rating ? <Badge variant="outline" className="text-xs">★ {rating}</Badge> : null}
      </div>
      <CardContent className="p-6 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xl font-bold text-foreground">{name}</p>
            {address && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> {address}
              </p>
            )}
            {room && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <BedDouble className="w-3.5 h-3.5" /> {room}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{formatCurrency(Math.ceil(price), currency)}</p>
            <p className="text-xs text-muted-foreground">total stay</p>
          </div>
        </div>
        {(checkIn || checkOut) && (
          <div className="pt-3 border-t border-border flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>{fmt(checkIn)} → {fmt(checkOut)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HotelSummaryCard;
