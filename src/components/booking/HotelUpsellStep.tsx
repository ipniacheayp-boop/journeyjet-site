import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Hotel, MapPin, Calendar, Users, Star, Wifi, Coffee, Waves, Car, Dumbbell, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
}

interface HotelUpsellStepProps {
  destinationCode: string;
  arrivalDate: string;
  onComplete: (data: HotelUpsellData) => void;
  onSkip: () => void;
  disabled?: boolean;
}

const PREFERENCES = [
  { id: "wifi", label: "Free WiFi", icon: Wifi },
  { id: "breakfast", label: "Breakfast Included", icon: Coffee },
  { id: "pool", label: "Swimming Pool", icon: Waves },
  { id: "parking", label: "Free Parking", icon: Car },
  { id: "gym", label: "Gym / Fitness", icon: Dumbbell },
];

const BUDGET_OPTIONS = [
  { value: "budget", label: "Budget (Under $100/night)" },
  { value: "mid", label: "Mid-Range ($100–$250/night)" },
  { value: "premium", label: "Premium ($250–$500/night)" },
  { value: "luxury", label: "Luxury ($500+/night)" },
];

const HotelUpsellStep = ({ destinationCode, arrivalDate, onComplete, onSkip, disabled }: HotelUpsellStepProps) => {
  const [wantsHotel, setWantsHotel] = useState<boolean | null>(null);
  const [checkInDate, setCheckInDate] = useState(arrivalDate || "");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [rooms, setRooms] = useState(1);
  const [budgetRange, setBudgetRange] = useState("");
  const [preferences, setPreferences] = useState<string[]>([]);

  const togglePreference = (id: string) => {
    setPreferences((prev) => prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]);
  };

  const handleContinue = () => {
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
    });
  };

  // Prompt state
  if (wantsHotel === null) {
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
              Would you like to book a hotel for your stay at your destination? We can help you find the best deals.
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <Button onClick={() => setWantsHotel(true)} size="lg" className="gap-2 min-w-[140px]">
              <Star className="w-4 h-4" /> Yes, Find Hotels
            </Button>
            <Button variant="outline" onClick={() => { setWantsHotel(false); onSkip(); }} size="lg" className="min-w-[140px]">
              No, Skip
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Hotel details form
  return (
    <Card className="bg-card border-border overflow-hidden">
      <div className="bg-accent/10 border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hotel className="w-4 h-4 text-accent-foreground" />
          <span className="font-semibold text-sm text-foreground">Hotel Details</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => { setWantsHotel(null); }} className="text-xs text-muted-foreground gap-1">
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
            <Badge variant="secondary" className="text-xs">Auto-filled from flight</Badge>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="checkin">Check-in Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="checkin"
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="pl-10"
                disabled={disabled}
              />
            </div>
            <p className="text-xs text-muted-foreground">Auto-filled from arrival date</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="checkout">Check-out Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="checkout"
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                min={checkInDate}
                className="pl-10"
                disabled={disabled}
              />
            </div>
          </div>
        </div>

        {/* Guests & Rooms */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Adults</Label>
            <Select value={String(adults)} onValueChange={(v) => setAdults(Number(v))} disabled={disabled}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1,2,3,4,5,6].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n} Adult{n > 1 ? "s" : ""}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Children</Label>
            <Select value={String(children)} onValueChange={(v) => setChildren(Number(v))} disabled={disabled}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[0,1,2,3,4].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n} Child{n !== 1 ? "ren" : ""}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Rooms</Label>
            <Select value={String(rooms)} onValueChange={(v) => setRooms(Number(v))} disabled={disabled}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1,2,3,4,5].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n} Room{n > 1 ? "s" : ""}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Budget Range */}
        <div className="space-y-1.5">
          <Label>Budget Range <span className="text-muted-foreground font-normal">(Optional)</span></Label>
          <Select value={budgetRange} onValueChange={setBudgetRange} disabled={disabled}>
            <SelectTrigger><SelectValue placeholder="Select budget range" /></SelectTrigger>
            <SelectContent>
              {BUDGET_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Preferences */}
        <div className="space-y-2">
          <Label>Hotel Preferences <span className="text-muted-foreground font-normal">(Optional)</span></Label>
          <div className="flex flex-wrap gap-2">
            {PREFERENCES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => togglePreference(id)}
                disabled={disabled}
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

        {/* Continue */}
        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={() => { setWantsHotel(null); }} disabled={disabled}>
            Back
          </Button>
          <Button onClick={handleContinue} size="lg" disabled={disabled || !checkOutDate}>
            Continue with Hotel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HotelUpsellStep;
