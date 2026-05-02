import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useFxSmartSave } from "@/hooks/useFxSmartSave";
import FxSmartSaveBadge from "@/components/FxSmartSaveBadge";
import {
  Hotel as HotelIcon,
  MapPin,
  Star,
  MessageSquare,
  Phone,
  Globe,
  Clock,
  ChevronDown,
  CalendarRange,
  Users,
  BedDouble,
  ExternalLink,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

interface HotelResultCardProps {
  hotel: any;
  onBook: (hotel: any) => void;
}

function nightsBetween(checkIn?: string, checkOut?: string): number {
  if (!checkIn || !checkOut) return 0;
  const a = new Date(`${checkIn}T12:00:00`);
  const b = new Date(`${checkOut}T12:00:00`);
  const n = Math.round((b.getTime() - a.getTime()) / 86400000);
  return n > 0 ? n : 0;
}

function formatPriceLevel(level?: string): string {
  if (!level) return "";
  const map: Record<string, string> = {
    PRICE_LEVEL_FREE: "Free",
    PRICE_LEVEL_INEXPENSIVE: "Inexpensive",
    PRICE_LEVEL_MODERATE: "Moderate",
    PRICE_LEVEL_EXPENSIVE: "Expensive",
    PRICE_LEVEL_VERY_EXPENSIVE: "Very expensive",
    PRICE_LEVEL_UNSPECIFIED: "—",
  };
  return map[level] || level.replace(/^PRICE_LEVEL_/, "").replace(/_/g, " ") || "—";
}

function formatBusinessStatus(s?: string): string {
  if (!s) return "";
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function HotelResultCard({ hotel, onBook }: HotelResultCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const offer = hotel.offers?.[0] || hotel;
  const price = parseFloat(offer.price?.total || "0");
  const currency = offer.price?.currency || "USD";
  const rating = typeof hotel.rating === "number" ? hotel.rating : 0;
  const reviewCount = typeof hotel.reviewCount === "number" ? hotel.reviewCount : 0;
  const primaryPhotoUrl = hotel.photos?.[0]?.url || "";
  const googlePlace = hotel.googlePlace as Record<string, unknown> | undefined;

  const gpFormatted =
    (googlePlace?.formattedAddress as string | undefined) ||
    (googlePlace?.shortFormattedAddress as string | undefined) ||
    (typeof googlePlace?.adrFormatAddress === "string"
      ? googlePlace.adrFormatAddress.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
      : "");

  const displayHotelName =
    hotel.hotel?.name?.trim() ||
    (googlePlace?.displayName as { text?: string } | undefined)?.text?.trim() ||
    "";

  const locationLabel =
    hotel.hotel?.address?.trim() ||
    gpFormatted ||
    hotel.hotel?.cityCode?.trim() ||
    (hotel.searchMeta as { cityQuery?: string } | undefined)?.cityQuery?.trim() ||
    "N/A";
  const searchMeta = hotel.searchMeta as
    | {
        cityQuery?: string;
        checkInDate?: string;
        checkOutDate?: string;
        adults?: number;
        roomQuantity?: number;
      }
    | undefined;

  const isGooglePlaces = hotel.provider === "google-places" || !!googlePlace;
  const stayNights = nightsBetween(searchMeta?.checkInDate, searchMeta?.checkOutDate);

  const regularHours = googlePlace?.regularOpeningHours as { weekdayDescriptions?: string[] } | undefined;
  const currentHours = googlePlace?.currentOpeningHours as { weekdayDescriptions?: string[] } | undefined;
  const weekdayLines = regularHours?.weekdayDescriptions?.length
    ? regularHours.weekdayDescriptions
    : currentHours?.weekdayDescriptions;

  const { data: fxData, showBadge } = useFxSmartSave({
    productType: "hotel",
    prices: [
      { currency: "USD", amount: price },
      { currency: "EUR", amount: price * 0.92 },
      { currency: "GBP", amount: price * 0.79 },
    ],
    destination: hotel.hotel?.cityCode,
    enabled: price > 0,
  });

  const displayTypes = (googlePlace?.types as string[] | undefined)?.filter(Boolean);
  const primaryTypeLabel =
    (googlePlace?.primaryTypeDisplayName as { text?: string } | undefined)?.text ||
    googlePlace?.primaryType ||
    "";

  const coordLat = (googlePlace?.location as { latitude?: number } | undefined)?.latitude;
  const coordLng = (googlePlace?.location as { longitude?: number } | undefined)?.longitude;

  return (
    <Card className="hover:shadow-lg transition-shadow animate-fade-in">
      {primaryPhotoUrl && (
        <div className="w-full h-48 overflow-hidden rounded-t-xl bg-muted relative">
          <img
            src={primaryPhotoUrl}
            alt={displayHotelName || "Hotel"}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {Array.isArray(hotel.photos) && hotel.photos.length > 1 && (
            <span className="absolute bottom-2 right-2 text-xs font-medium bg-black/60 text-white px-2 py-0.5 rounded">
              {hotel.photos.length} photos
            </span>
          )}
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 shrink-0 bg-primary/10 rounded-lg flex items-center justify-center">
              <HotelIcon className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg leading-snug">{displayHotelName || "Hotel"}</CardTitle>
              <p className="text-sm text-muted-foreground flex items-start gap-1 mt-1">
                <MapPin className="w-3 h-3 shrink-0 mt-0.5" />
                <span className="break-words">
                  {gpFormatted || locationLabel}
                </span>
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            {price > 0 ? (
              <>
                <div className="flex items-center gap-2 justify-end mb-1">
                  <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white">
                    Lowest Price
                  </Badge>
                </div>
                <div className="text-2xl font-bold text-primary">{formatCurrency(price, currency)}</div>
                <p className="text-sm text-muted-foreground">{currency}</p>
              </>
            ) : isGooglePlaces ? (
              <Badge variant="secondary" className="text-xs">
                Google Places
              </Badge>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {searchMeta && (searchMeta.checkInDate || searchMeta.checkOutDate) && (
            <div className="rounded-lg border border-border/80 bg-muted/30 p-3 text-sm space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <CalendarRange className="w-3.5 h-3.5" />
                Your search
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {searchMeta.cityQuery && (
                  <div>
                    <span className="text-muted-foreground">Destination</span>
                    <p className="font-medium">{searchMeta.cityQuery}</p>
                  </div>
                )}
                {stayNights > 0 && (
                  <div>
                    <span className="text-muted-foreground">Nights</span>
                    <p className="font-medium">{stayNights}</p>
                  </div>
                )}
                {searchMeta.checkInDate && (
                  <div>
                    <span className="text-muted-foreground">Check-in</span>
                    <p className="font-medium">{searchMeta.checkInDate}</p>
                  </div>
                )}
                {searchMeta.checkOutDate && (
                  <div>
                    <span className="text-muted-foreground">Check-out</span>
                    <p className="font-medium">{searchMeta.checkOutDate}</p>
                  </div>
                )}
                {searchMeta.adults != null && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {searchMeta.adults} guest{searchMeta.adults === 1 ? "" : "s"}
                    </span>
                  </div>
                )}
                {searchMeta.roomQuantity != null && (
                  <div className="flex items-center gap-2">
                    <BedDouble className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {searchMeta.roomQuantity} room{searchMeta.roomQuantity === 1 ? "" : "s"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="inline-flex items-center gap-1 font-medium">
              <Star className="w-4 h-4 text-amber-500" />
              {rating > 0 ? rating.toFixed(1) : "—"}
            </span>
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <MessageSquare className="w-4 h-4" />
              {reviewCount} reviews
            </span>
            {googlePlace?.priceLevel != null && String(googlePlace.priceLevel).length > 0 && (
              <Badge variant="outline" className="font-normal">
                {formatPriceLevel(String(googlePlace.priceLevel))}
              </Badge>
            )}
            {googlePlace?.businessStatus != null && (
              <span className="text-muted-foreground">{formatBusinessStatus(String(googlePlace.businessStatus))}</span>
            )}
          </div>

          {(googlePlace?.editorialSummary as { text?: string } | undefined)?.text && (
            <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3">
              {(googlePlace.editorialSummary as { text: string }).text}
            </p>
          )}

          {primaryTypeLabel && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Primary type:</span> {primaryTypeLabel}
            </p>
          )}

          {displayTypes && displayTypes.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {displayTypes.slice(0, 12).map((t) => (
                <Badge key={t} variant="secondary" className="text-xs font-normal">
                  {t.replace(/_/g, " ")}
                </Badge>
              ))}
              {displayTypes.length > 12 && (
                <Badge variant="outline" className="text-xs">
                  +{displayTypes.length - 12} more
                </Badge>
              )}
            </div>
          )}

          {(googlePlace?.nationalPhoneNumber || googlePlace?.internationalPhoneNumber) && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
              <a
                className="text-primary hover:underline break-all"
                href={`tel:${googlePlace.nationalPhoneNumber || googlePlace.internationalPhoneNumber}`}
              >
                {String(googlePlace.nationalPhoneNumber || googlePlace.internationalPhoneNumber)}
              </a>
            </div>
          )}

          {googlePlace?.websiteUri && (
            <div className="flex flex-wrap items-start gap-2 text-sm">
              <Globe className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <a
                className="text-primary hover:underline break-all inline-flex items-center gap-1"
                href={String(googlePlace.websiteUri)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Website <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {weekdayLines && weekdayLines.length > 0 && (
            <div className="text-sm space-y-1">
              <p className="font-medium flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Hours
              </p>
              <ul className="text-muted-foreground space-y-0.5 pl-1">
                {weekdayLines.map((line, idx) => (
                  <li key={idx} className="text-xs sm:text-sm">
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {googlePlace?.addressComponents && Array.isArray(googlePlace.addressComponents) && (
            <div className="text-xs space-y-1">
              <p className="font-medium text-sm text-foreground">Address details</p>
              <ul className="text-muted-foreground space-y-0.5 max-h-24 overflow-y-auto">
                {(googlePlace.addressComponents as { longText?: string; shortText?: string; types?: string[] }[]).map(
                  (c, i) => (
                    <li key={i}>
                      {(c.longText || c.shortText) ?? "—"}
                      {c.types?.length ? (
                        <span className="text-muted-foreground/80"> ({c.types.join(", ")})</span>
                      ) : null}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          {(coordLat != null && coordLng != null) || googlePlace?.utcOffsetMinutes != null ? (
            <div className="text-xs text-muted-foreground space-y-1">
              {coordLat != null && coordLng != null && (
                <p>
                  <span className="font-medium text-foreground">Coordinates:</span> {coordLat.toFixed(6)},{" "}
                  {coordLng.toFixed(6)}
                </p>
              )}
              {googlePlace?.utcOffsetMinutes != null && (
                <p>
                  <span className="font-medium text-foreground">UTC offset:</span>{" "}
                  {String(googlePlace.utcOffsetMinutes)} min
                </p>
              )}
            </div>
          ) : null}

          {(googlePlace?.accessibilityOptions ||
            googlePlace?.parkingOptions ||
            googlePlace?.paymentOptions ||
            googlePlace?.allowsDogs != null) && (
            <div className="text-xs space-y-1 rounded-md bg-muted/40 p-2">
              <p className="font-medium text-sm">Amenities & access</p>
              {googlePlace?.allowsDogs != null && (
                <p className="text-muted-foreground">Allows dogs: {String(googlePlace.allowsDogs)}</p>
              )}
              {googlePlace?.accessibilityOptions != null && (
                <pre className="text-[11px] whitespace-pre-wrap break-words max-h-24 overflow-y-auto">
                  {JSON.stringify(googlePlace.accessibilityOptions, null, 2)}
                </pre>
              )}
              {googlePlace?.parkingOptions != null && (
                <pre className="text-[11px] whitespace-pre-wrap break-words max-h-24 overflow-y-auto">
                  {JSON.stringify(googlePlace.parkingOptions, null, 2)}
                </pre>
              )}
              {googlePlace?.paymentOptions != null && (
                <pre className="text-[11px] whitespace-pre-wrap break-words max-h-24 overflow-y-auto">
                  {JSON.stringify(googlePlace.paymentOptions, null, 2)}
                </pre>
              )}
            </div>
          )}

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

          {googlePlace && (
            <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted/50">
                <span>Full Google Places response</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${detailsOpen ? "rotate-180" : ""}`} />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <pre className="mt-2 max-h-72 overflow-auto rounded-md bg-muted/50 p-3 text-[10px] leading-relaxed whitespace-pre-wrap break-words">
                  {JSON.stringify(googlePlace, null, 2)}
                </pre>
              </CollapsibleContent>
            </Collapsible>
          )}

          <div className="grid grid-cols-1 gap-2 pt-1">
            {hotel.googleMapsUri && (
              <Button
                variant="outline"
                onClick={() => window.open(hotel.googleMapsUri, "_blank", "noopener,noreferrer")}
                className="w-full"
              >
                View on Google Maps
              </Button>
            )}
            <Button onClick={() => onBook(hotel)} className="w-full">
              Book Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default HotelResultCard;
