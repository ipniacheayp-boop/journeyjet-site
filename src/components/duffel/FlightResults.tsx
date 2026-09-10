import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlaneTakeoff, SearchX } from "lucide-react";
import FlightCard from "@/components/duffel/FlightCard";
import type { SortKey } from "@/components/duffel/FlightFilters";
import type { DuffelOffer } from "@/types/duffel";

interface Props {
  offers: DuffelOffer[];
  loading: boolean;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  onSelect: (offer: DuffelOffer) => void;
  onViewDetails?: (offer: DuffelOffer) => void;
  onModifySearch: () => void;
  cheapestId?: string | null;
  fastestId?: string | null;
  hasSearched: boolean;
}

const sortOptions: Array<{ value: SortKey; label: string }> = [
  { value: "recommended", label: "Recommended" },
  { value: "cheapest", label: "Cheapest" },
  { value: "fastest", label: "Fastest" },
  { value: "earliest_departure", label: "Earliest departure" },
  { value: "latest_departure", label: "Latest departure" },
];

function LoadingSkeleton() {
  return (
    <div className="space-y-4" aria-live="polite">
      <p className="text-sm text-muted-foreground">Searching available flights…</p>
      {[0, 1, 2, 3].map((i) => (
        <Card key={i} className="border-border">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-9 w-9 rounded-md" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
            <Skeleton className="h-3 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function FlightResults({
  offers,
  loading,
  sort,
  onSortChange,
  onSelect,
  onViewDetails,
  onModifySearch,
  cheapestId,
  fastestId,
  hasSearched,
}: Props) {
  if (loading) return <LoadingSkeleton />;

  if (!hasSearched) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-10 text-center space-y-2">
          <PlaneTakeoff className="w-8 h-8 mx-auto text-primary" aria-hidden="true" />
          <h2 className="font-semibold">Search live flight fares</h2>
          <p className="text-sm text-muted-foreground">
            Pick your airports, dates and passengers to see real-time availability and prices.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (offers.length === 0) {
    return (
      <Card className="border-border">
        <CardContent className="p-10 text-center space-y-3">
          <SearchX className="w-8 h-8 mx-auto text-muted-foreground" aria-hidden="true" />
          <h2 className="text-lg font-semibold">No flights found</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            We couldn't find flights for this route and date. Try changing your dates, airports, or
            filters.
          </p>
          <Button variant="outline" onClick={onModifySearch}>
            Modify search
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-muted-foreground">
          {offers.length} flight{offers.length > 1 ? "s" : ""} available
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="flight-sort" className="text-sm text-muted-foreground">
            Sort by
          </label>
          <Select value={sort} onValueChange={(v) => onSortChange(v as SortKey)}>
            <SelectTrigger id="flight-sort" className="w-[190px] bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {offers.map((offer) => (
        <FlightCard
          key={offer.id}
          offer={offer}
          onSelect={onSelect}
          onViewDetails={onViewDetails}
          badge={
            offer.id === cheapestId
              ? "Cheapest"
              : offer.id === fastestId
                ? "Fastest"
                : null
          }
        />
      ))}
    </div>
  );
}
