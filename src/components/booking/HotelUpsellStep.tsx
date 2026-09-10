import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Hotel, MapPin, Calendar, Users, Star, Wifi, Coffee, Waves, Car, Dumbbell,
  X, Search, Loader2, Check, ArrowRight,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { invokeSupabaseFunction } from "@/lib/invokeSupabaseFunction";
import { extractHotelSearchRows } from "@/lib/extractHotelSearchRows";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

export interface HotelUpsellData {
  wantsHotel: boolean;
  destination: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  rooms: number;
  budgetRange: string;
  preferences: string[];
  selectedHotel: any;
}

interface HotelUpsellStepProps {
  destinationCode: string;
  arrivalDate: string;
  departureDate?: string;
  onComplete: (data: HotelUpsellData) => void;
  onSkip: () => void;
  disabled?: boolean;
}

const PREFERENCES = [
  { id: "wifi", label: "Free WiFi", icon: Wifi },
  { id: "breakfast", label: "Breakfast", icon: Coffee },
  { id: "pool", label: "Pool", icon: Waves },
  { id: "parking", label: "Parking", icon: Car },
  { id: "gym", label: "Gym", icon: Dumbbell },
];

type Phase = "prompt" | "search" | "results" | "selected";

const HotelUpsellStep = ({ destinationCode, arrivalDate, departureDate, onComplete, onSkip, disabled }: HotelUpsellStepProps) => {
  const [phase, setPhase] = useState<Phase>("prompt");
  const [checkInDate, setCheckInDate] = useState(arrivalDate || "");
  const [checkOutDate, setCheckOutDate] = useState(departureDate || "");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [budgetRange, setBudgetRange] = useState("");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const [hotels, setHotels] = useState<any[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);

  const togglePreference = (id: string) => {
    setPreferences((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  };

  const handleSearch = async () => {
    if (!checkOutDate) {
      toast.error("Please select a check-out date");
      return;
    }
    setSearching(true);
    setPhase("results");
    try {
      const { data, error } = await invokeSupabaseFunction<{ data?: unknown[] }>("hotels-search", {
        cityCode: destinationCode,
        checkInDate,
        checkOutDate,
        adults,
        roomQuantity: rooms,
      });
      if (error) throw new Error(error);
      const results = extractHotelSearchRows(data);
      setHotels(results);
      if (results.length === 0) {
        toast.info("No hotels found for these dates. Try different dates.");
      }
    } catch (err: any) {
      toast.error("Failed to search hotels: " + (err.message || "Unknown error"));
      setHotels([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelect = (hotel: any) => {
    setSelectedHotel(hotel);
    setPhase("selected");
  };

  const handleConfirm = () => {
    onComplete({
      wantsHotel: true,
      destination: destinationCode,
      checkInDate,
      checkOutDate,
      adults,
      children,
      rooms,
      budgetRange,
      preferences,
      selectedHotel,
    });
  };

  // Phase: Prompt
  if (phase === "prompt") {
    return (
      <Card className="bg-card border-border overflow-hidden">
        <div className="bg-accent/10 border-b border-border px-6 py-3 flex items-center gap-2">
          <Hotel className="w-4 h-4 text-accent-foreground" />
          <span className="font-semibold text-sm text-foreground">Hotel Suggestion</span>
        </div>
        <CardContent className="p-6 text-center space-y-5">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Hotel className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              Need a hotel at {destinationCode}?
            </h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Would you like to book a hotel for your stay at your destination? We'll find the best deals for you.
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <Button onClick={() => setPhase("search")} size="lg" className="gap-2 min-w-[140px]">
              <Star className="w-4 h-4" /> Yes, Find Hotels
            </Button>
            <Button variant="outline" onClick={onSkip} size="lg" className="min-w-[140px]">
              No, Skip
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Phase: Search form
  if (phase === "search") {
    return (
      <Card className="bg-card border-border overflow-hidden">
        <div className="bg-accent/10 border-b border-border px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hotel className="w-4 h-4 text-accent-foreground" />
            <span className="font-semibold text-sm text-foreground">Search Hotels</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setPhase("prompt")} className="text-xs text-muted-foreground gap-1">
            <X className="w-3 h-3" /> Cancel
          </Button>
        </div>
        <CardContent className="p-6 space-y-5">
          {/* Destination */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Destination</Label>
            <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">{destinationCode}</span>
              <Badge variant="secondary" className="text-xs">Auto-filled</Badge>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="checkin">Check-in Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="checkin" type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} className="pl-10" />
              </div>
              <p className="text-xs text-muted-foreground">Auto-filled from arrival</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="checkout">Check-out Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="checkout" type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} min={checkInDate} className="pl-10" />
              </div>
              {departureDate && <p className="text-xs text-muted-foreground">Auto-filled from return flight</p>}
            </div>
          </div>

          {/* Guests & Rooms */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Adults</Label>
              <Select value={String(adults)} onValueChange={(v) => setAdults(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n} Adult{n > 1 ? "s" : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Children</Label>
              <Select value={String(children)} onValueChange={(v) => setChildren(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n} Child{n !== 1 ? "ren" : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Rooms</Label>
              <Select value={String(rooms)} onValueChange={(v) => setRooms(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n} Room{n > 1 ? "s" : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-2">
            <Label>Preferences <span className="text-muted-foreground font-normal">(Optional)</span></Label>
            <div className="flex flex-wrap gap-2">
              {PREFERENCES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => togglePreference(id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    preferences.includes(id)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 text-muted-foreground border-border hover:border-primary/50"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => setPhase("prompt")}>Back</Button>
            <Button onClick={handleSearch} size="lg" disabled={!checkOutDate || searching} className="gap-2">
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search Hotels
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Phase: Results
  if (phase === "results") {
    return (
      <Card className="bg-card border-border overflow-hidden">
        <div className="bg-accent/10 border-b border-border px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hotel className="w-4 h-4 text-accent-foreground" />
            <span className="font-semibold text-sm text-foreground">
              Available Hotels at {destinationCode}
            </span>
            {!searching && <Badge variant="secondary" className="text-xs">{hotels.length} found</Badge>}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setPhase("search")} className="text-xs text-muted-foreground gap-1">
            <Search className="w-3 h-3" /> New Search
          </Button>
        </div>
        <CardContent className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
          {searching && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-lg border border-border space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!searching && hotels.length === 0 && (
            <div className="text-center py-8 space-y-3">
              <Hotel className="w-10 h-10 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">No hotels found. Try different dates or destination.</p>
              <Button variant="outline" onClick={() => setPhase("search")}>Modify Search</Button>
            </div>
          )}

          {!searching && hotels.map((hotel: any, idx: number) => {
            const offer = hotel.offers?.[0];
            const price = parseFloat(offer?.price?.total || "0");
            const currency = offer?.price?.currency || "USD";
            const hotelName = hotel.hotel?.name || `Hotel ${idx + 1}`;
            const cityName = hotel.hotel?.address?.cityName || destinationCode;
            const rating = hotel.hotel?.rating ? Number(hotel.hotel.rating) : null;

            return (
              <div
                key={hotel.hotel?.hotelId || idx}
                className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer group"
                onClick={() => handleSelect(hotel)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors">
                      {hotelName}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs text-muted-foreground truncate">{cityName}</span>
                    </div>
                    {rating && (
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">{rating}-star</span>
                      </div>
                    )}
                    {offer?.room?.description?.text && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {offer.room.description.text}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-primary">{formatCurrency(price, currency)}</p>
                    <p className="text-xs text-muted-foreground">total stay</p>
                    <Button size="sm" className="mt-2 gap-1 text-xs">
                      Select <ArrowRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="pt-3 border-t border-border flex justify-between">
            <Button variant="outline" onClick={() => setPhase("search")} className="gap-1">
              <Search className="w-3.5 h-3.5" /> Modify Search
            </Button>
            <Button variant="ghost" onClick={onSkip} className="text-muted-foreground">
              Skip Hotel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Phase: Selected — confirmation
  if (phase === "selected" && selectedHotel) {
    const offer = selectedHotel.offers?.[0];
    const price = parseFloat(offer?.price?.total || "0");
    const currency = offer?.price?.currency || "USD";
    const hotelName = selectedHotel.hotel?.name || "Selected Hotel";
    const rating = selectedHotel.hotel?.rating ? Number(selectedHotel.hotel.rating) : null;

    return (
      <Card className="bg-card border-border overflow-hidden">
        <div className="bg-accent/10 border-b border-border px-6 py-3 flex items-center gap-2">
          <Check className="w-4 h-4 text-green-500" />
          <span className="font-semibold text-sm text-foreground">Hotel Selected</span>
        </div>
        <CardContent className="p-6 space-y-4">
          <div className="p-4 bg-muted/30 rounded-lg space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-foreground">{hotelName}</h4>
                {rating && (
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xl font-bold text-primary">{formatCurrency(price, currency)}</p>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {checkInDate} → {checkOutDate}</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {adults} Adult{adults > 1 ? "s" : ""}{children > 0 ? `, ${children} Child${children > 1 ? "ren" : ""}` : ""}</span>
              <span>{rooms} Room{rooms > 1 ? "s" : ""}</span>
            </div>
            {preferences.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {preferences.map((p) => (
                  <Badge key={p} variant="outline" className="text-xs capitalize">{p}</Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setPhase("results")} className="gap-1">
              Change Hotel
            </Button>
            <Button onClick={handleConfirm} size="lg" className="gap-2">
              Continue with Hotel <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default HotelUpsellStep;
