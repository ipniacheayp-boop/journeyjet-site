import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AirportDropdown from "@/components/AirportDropdown";
import { Loader2, Plus, Search, Trash2, Users } from "lucide-react";
import type { CabinClass, DuffelSearchLeg, DuffelSearchRequest, TripType } from "@/types/duffel";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Props {
  loading: boolean;
  initial?: Partial<DuffelSearchRequest>;
  onSearch: (payload: DuffelSearchRequest, tripType: TripType) => void;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

const emptyLeg = (): DuffelSearchLeg => ({
  origin: "",
  destination: "",
  departureDate: "",
  originLabel: "",
  destinationLabel: "",
});

const cabinOptions: Array<{ value: CabinClass; label: string }> = [
  { value: "economy", label: "Economy" },
  { value: "premium_economy", label: "Premium Economy" },
  { value: "business", label: "Business" },
  { value: "first", label: "First" },
];

export default function FlightSearchForm({ loading, initial, onSearch }: Props) {
  const [tripType, setTripType] = useState<TripType>(initial?.returnDate ? "round_trip" : "round_trip");
  const [legs, setLegs] = useState<DuffelSearchLeg[]>([
    {
      origin: initial?.origin || "",
      destination: initial?.destination || "",
      departureDate: initial?.departureDate || "",
      originLabel: initial?.origin || "",
      destinationLabel: initial?.destination || "",
    },
  ]);
  const [returnDate, setReturnDate] = useState(initial?.returnDate || "");
  const [adults, setAdults] = useState(initial?.adults ?? 1);
  const [children, setChildren] = useState(initial?.children ?? 0);
  const [infants, setInfants] = useState(initial?.infants ?? 0);
  const [cabinClass, setCabinClass] = useState<CabinClass>((initial?.cabinClass as CabinClass) || "economy");
  const [formError, setFormError] = useState<string | null>(null);

  const updateLeg = (index: number, patch: Partial<DuffelSearchLeg>) =>
    setLegs((prev) => prev.map((leg, i) => (i === index ? { ...leg, ...patch } : leg)));

  const changeTripType = (next: TripType) => {
    setTripType(next);
    setFormError(null);
    if (next === "multi_city") {
      setReturnDate("");
      setLegs((prev) => (prev.length > 1 ? prev : [prev[0], emptyLeg()]));
    } else {
      setLegs((prev) => [prev[0]]);
      if (next === "one_way") setReturnDate("");
    }
  };

  const passengerSummary = () => {
    const total = adults + children + infants;
    return `${total} passenger${total > 1 ? "s" : ""}`;
  };

  const handleSubmit = () => {
    setFormError(null);

    const activeLegs = tripType === "multi_city" ? legs : [legs[0]];

    for (const leg of activeLegs) {
      if (!/^[A-Za-z]{3}$/.test(leg.origin) || !/^[A-Za-z]{3}$/.test(leg.destination)) {
        setFormError("Select a departure and arrival airport from the suggestions.");
        return;
      }
      if (leg.origin.toUpperCase() === leg.destination.toUpperCase()) {
        setFormError("Departure and arrival airports must be different.");
        return;
      }
      if (!leg.departureDate) {
        setFormError("Choose a departure date for every flight.");
        return;
      }
      if (leg.departureDate < todayISO()) {
        setFormError("Departure date cannot be in the past.");
        return;
      }
    }

    if (tripType === "round_trip") {
      if (!returnDate) {
        setFormError("Choose a return date, or switch to One way.");
        return;
      }
      if (returnDate < activeLegs[0].departureDate) {
        setFormError("Return date must be on or after the departure date.");
        return;
      }
    }

    if (infants > adults) {
      setFormError("Each infant must travel with an adult.");
      return;
    }

    const payload: DuffelSearchRequest = {
      origin: activeLegs[0].origin.toUpperCase(),
      destination: activeLegs[0].destination.toUpperCase(),
      departureDate: activeLegs[0].departureDate,
      returnDate: tripType === "round_trip" ? returnDate : null,
      adults,
      children,
      infants,
      cabinClass,
      ...(tripType === "multi_city"
        ? {
            slices: activeLegs.map((l) => ({
              origin: l.origin.toUpperCase(),
              destination: l.destination.toUpperCase(),
              departureDate: l.departureDate,
            })),
          }
        : {}),
    };

    onSearch(payload, tripType);
  };

  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-4 sm:p-6 space-y-5">
        <Tabs value={tripType} onValueChange={(v) => changeTripType(v as TripType)}>
          <TabsList>
            <TabsTrigger value="round_trip">Round trip</TabsTrigger>
            <TabsTrigger value="one_way">One way</TabsTrigger>
            <TabsTrigger value="multi_city">Multi-city</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          {(tripType === "multi_city" ? legs : [legs[0]]).map((leg, index) => (
            <div key={index} className="grid gap-3 md:grid-cols-[1fr_1fr_auto] items-end">
              <div className="grid gap-3 sm:grid-cols-2 md:col-span-2">
                <div className="space-y-1.5">
                  <Label htmlFor={`from-${index}`}>From</Label>
                  <div className="bg-background rounded-lg">
                    <AirportDropdown
                      value={leg.originLabel || ""}
                      onChange={(label, iata) =>
                        updateLeg(index, { originLabel: label, origin: iata || "" })
                      }
                      placeholder="City or airport"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`to-${index}`}>To</Label>
                  <div className="bg-background rounded-lg">
                    <AirportDropdown
                      value={leg.destinationLabel || ""}
                      onChange={(label, iata) =>
                        updateLeg(index, { destinationLabel: label, destination: iata || "" })
                      }
                      placeholder="City or airport"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 md:col-span-1 md:min-w-[280px]">
                <div className="space-y-1.5">
                  <Label htmlFor={`depart-${index}`}>Departure</Label>
                  <Input
                    id={`depart-${index}`}
                    type="date"
                    min={todayISO()}
                    value={leg.departureDate}
                    onChange={(e) => updateLeg(index, { departureDate: e.target.value })}
                    className="bg-background"
                  />
                </div>
                {tripType === "round_trip" && index === 0 && (
                  <div className="space-y-1.5">
                    <Label htmlFor="return-date">Return</Label>
                    <Input
                      id="return-date"
                      type="date"
                      min={leg.departureDate || todayISO()}
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                )}
                {tripType === "multi_city" && legs.length > 2 && (
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`Remove flight ${index + 1}`}
                      onClick={() => setLegs((prev) => prev.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {tripType === "multi_city" && legs.length < 4 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setLegs((prev) => [...prev, emptyLeg()])}
            >
              <Plus className="w-4 h-4 mr-1" /> Add another flight
            </Button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Passengers</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start bg-background font-normal">
                  <Users className="w-4 h-4 mr-2" />
                  {passengerSummary()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 space-y-3" align="start">
                {[
                  { label: "Adults", hint: "12+ years", value: adults, set: setAdults, min: 1, max: 9 },
                  { label: "Children", hint: "2–11 years", value: children, set: setChildren, min: 0, max: 8 },
                  { label: "Infants", hint: "Under 2", value: infants, set: setInfants, min: 0, max: adults },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{row.label}</p>
                      <p className="text-xs text-muted-foreground">{row.hint}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        aria-label={`Decrease ${row.label}`}
                        disabled={row.value <= row.min}
                        onClick={() => row.set(row.value - 1)}
                      >
                        −
                      </Button>
                      <span className="w-6 text-center text-sm">{row.value}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        aria-label={`Increase ${row.label}`}
                        disabled={row.value >= row.max}
                        onClick={() => row.set(row.value + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                ))}
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cabin-class">Cabin class</Label>
            <Select value={cabinClass} onValueChange={(v) => setCabinClass(v as CabinClass)}>
              <SelectTrigger id="cabin-class" className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cabinOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button className="w-full" onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Searching…
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" /> Search Flights
                </>
              )}
            </Button>
          </div>
        </div>

        {formError && (
          <p role="alert" className="text-sm text-destructive">
            {formError}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
