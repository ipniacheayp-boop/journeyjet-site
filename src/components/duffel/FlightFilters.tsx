import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cabinLabel, formatMoney } from "@/lib/duffelUtils";

export type SortKey =
  | "recommended"
  | "cheapest"
  | "fastest"
  | "earliest_departure"
  | "latest_departure";

export interface FlightFilterState {
  stops: number[]; // 0, 1, 2 (2 = 2+)
  airlines: string[];
  cabins: string[];
  maxPrice: number;
  departureWindow: [number, number]; // minutes from midnight
  arrivalWindow: [number, number];
  checkedBagOnly: boolean;
}

interface Props {
  filters: FlightFilterState;
  onChange: (next: FlightFilterState) => void;
  airlines: Array<{ code: string; name: string; count: number }>;
  cabins: string[];
  priceBounds: { min: number; max: number };
  currency: string;
  onReset: () => void;
  resultCount: number;
}

const minutesToLabel = (m: number) =>
  `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

const stopLabels: Record<number, string> = { 0: "Non-stop", 1: "1 stop", 2: "2+ stops" };

export default function FlightFilters({
  filters,
  onChange,
  airlines,
  cabins,
  priceBounds,
  currency,
  onReset,
  resultCount,
}: Props) {
  const toggle = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  return (
    <Card className="border-border">
      <CardContent className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Filters</h2>
            <p className="text-xs text-muted-foreground">{resultCount} flights match</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onReset}>
            Reset
          </Button>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Stops</Label>
          {[0, 1, 2].map((s) => (
            <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={filters.stops.includes(s)}
                onCheckedChange={() => onChange({ ...filters, stops: toggle(filters.stops, s) })}
                aria-label={stopLabels[s]}
              />
              {stopLabels[s]}
            </label>
          ))}
        </div>

        {airlines.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm">Airlines</Label>
            <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
              {airlines.map((a) => (
                <label key={a.code} className="flex items-center justify-between gap-2 text-sm cursor-pointer">
                  <span className="flex items-center gap-2 min-w-0">
                    <Checkbox
                      checked={filters.airlines.includes(a.code)}
                      onCheckedChange={() =>
                        onChange({ ...filters, airlines: toggle(filters.airlines, a.code) })
                      }
                      aria-label={a.name}
                    />
                    <span className="truncate">{a.name}</span>
                  </span>
                  <Badge variant="secondary" className="text-[10px]">
                    {a.count}
                  </Badge>
                </label>
              ))}
            </div>
          </div>
        )}

        {cabins.length > 1 && (
          <div className="space-y-2">
            <Label className="text-sm">Cabin class</Label>
            {cabins.map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={filters.cabins.includes(c)}
                  onCheckedChange={() => onChange({ ...filters, cabins: toggle(filters.cabins, c) })}
                  aria-label={cabinLabel(c)}
                />
                {cabinLabel(c)}
              </label>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Max price</Label>
            <span className="text-xs text-muted-foreground">
              {formatMoney(String(filters.maxPrice), currency)}
            </span>
          </div>
          <Slider
            min={Math.floor(priceBounds.min)}
            max={Math.ceil(priceBounds.max)}
            step={1}
            value={[filters.maxPrice]}
            onValueChange={([v]) => onChange({ ...filters, maxPrice: v })}
            aria-label="Maximum price"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Departure time</Label>
            <span className="text-xs text-muted-foreground">
              {minutesToLabel(filters.departureWindow[0])} – {minutesToLabel(filters.departureWindow[1])}
            </span>
          </div>
          <Slider
            min={0}
            max={1439}
            step={15}
            value={filters.departureWindow}
            onValueChange={(v) =>
              onChange({ ...filters, departureWindow: [v[0], v[1]] as [number, number] })
            }
            aria-label="Departure time range"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Arrival time</Label>
            <span className="text-xs text-muted-foreground">
              {minutesToLabel(filters.arrivalWindow[0])} – {minutesToLabel(filters.arrivalWindow[1])}
            </span>
          </div>
          <Slider
            min={0}
            max={1439}
            step={15}
            value={filters.arrivalWindow}
            onValueChange={(v) => onChange({ ...filters, arrivalWindow: [v[0], v[1]] as [number, number] })}
            aria-label="Arrival time range"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Baggage</Label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox
              checked={filters.checkedBagOnly}
              onCheckedChange={(v) => onChange({ ...filters, checkedBagOnly: Boolean(v) })}
              aria-label="Checked bag included"
            />
            Checked bag included
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
