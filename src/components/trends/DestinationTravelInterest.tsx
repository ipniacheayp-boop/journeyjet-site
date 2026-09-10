import { RELATIVE_INTEREST_NOTE } from "@/lib/googleTrendsLogic";
import { getTrendDestination } from "@/data/googleTrendsDestinations";
import { useTrendingDestinations } from "@/hooks/useTrendingDestinations";
import { Skeleton } from "@/components/ui/skeleton";

function trendLabel(direction: "up" | "down" | "stable"): string {
  if (direction === "up") return "Rising";
  if (direction === "down") return "Cooling";
  return "Stable";
}

export default function DestinationTravelInterest({ slug }: { slug?: string }) {
  const dest = getTrendDestination(slug);
  const { destinations, loading, error } = useTrendingDestinations(Boolean(dest));
  const item = dest ? destinations.find((row) => row.slug === dest.slug) : undefined;

  if (!dest) return null;
  if (!loading && (error || !item)) return null;

  const width = item ? Math.max(0, Math.min(100, item.trendScore)) : 0;

  return (
    <aside className="rounded-xl border border-border/60 bg-card p-4">
      <h3 className="text-sm font-semibold text-foreground mb-1">Travel interest</h3>
      <p className="text-xs text-muted-foreground mb-3">Google Trends interest</p>

      {loading && <Skeleton className="h-8 w-full rounded-md" />}

      {!loading && item && (
        <>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden" aria-hidden>
              <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
            </div>
            <span className="text-sm font-bold tabular-nums" title="Relative interest, not search volume">
              {item.trendScore}
            </span>
          </div>
          <p className="text-sm text-foreground">
            Trend: <span className="font-medium">{trendLabel(item.direction)}</span>
          </p>
          <p className="text-[11px] text-muted-foreground mt-2">{RELATIVE_INTEREST_NOTE}</p>
        </>
      )}
    </aside>
  );
}
