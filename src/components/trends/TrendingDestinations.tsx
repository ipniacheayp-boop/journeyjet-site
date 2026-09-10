import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { RELATIVE_INTEREST_NOTE, type TrendDirection, type TrendingDestinationScore } from "@/lib/googleTrendsLogic";
import { useTrendingDestinations } from "@/hooks/useTrendingDestinations";
import { Skeleton } from "@/components/ui/skeleton";

function directionLabel(item: TrendingDestinationScore): string {
  if (item.direction === "up" && item.trendScore >= 75) return "High interest ↑";
  if (item.direction === "up") return "Rising ↑";
  if (item.direction === "down") return "Cooling ↓";
  return "Stable";
}

function directionClass(direction: TrendDirection): string {
  if (direction === "up") return "text-emerald-600";
  if (direction === "down") return "text-amber-600";
  return "text-muted-foreground";
}

export default function TrendingDestinations() {
  const { destinations, loading, error } = useTrendingDestinations();

  return (
    <section aria-label="Trending destinations">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          Trending destinations
        </h2>
      </div>
      <p className="text-xs text-muted-foreground mb-6 max-w-2xl">{RELATIVE_INTEREST_NOTE}</p>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="text-sm text-muted-foreground">Travel trends are unavailable right now.</p>
      )}

      {!loading && !error && destinations.length === 0 && (
        <p className="text-sm text-muted-foreground">No trend scores available yet.</p>
      )}

      {!loading && !error && destinations.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {destinations.map((item) => (
            <li key={item.slug}>
              <Link
                to={`/flights-to/${item.slug}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 hover:border-primary/40 hover:shadow-sm transition-all"
              >
                <div>
                  <p className="font-semibold text-foreground">{item.destination}</p>
                  <p className={`text-xs font-medium ${directionClass(item.direction)}`}>
                    {directionLabel(item)}
                  </p>
                </div>
                <span className="text-lg font-bold tabular-nums text-foreground" title="Relative interest, not search volume">
                  {item.trendScore}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
