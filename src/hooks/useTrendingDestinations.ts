import { useEffect, useState } from "react";
import type { TrendingDestinationScore } from "@/lib/googleTrendsLogic";
import { getTrendingDestinations } from "@/services/googleTrends";

export function useTrendingDestinations(enabled = true) {
  const [destinations, setDestinations] = useState<TrendingDestinationScore[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getTrendingDestinations()
      .then((result) => {
        if (cancelled) return;
        setDestinations(result.destinations);
        setError(result.error);
      })
      .catch(() => {
        if (cancelled) return;
        setDestinations([]);
        setError("Trends data could not be loaded.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { destinations, loading, error };
}
