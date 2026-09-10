import { useQuery } from "@tanstack/react-query";
import { fetchDuffelDeals, usableDeal, type DuffelDeal } from "@/services/duffelDeals";

/**
 * Single source of truth for the Deals page. React Query keeps one request per
 * mount (stale-while-revalidate), so navigating back to /deals reuses the cache
 * instead of re-shopping Duffel.
 */
export const duffelDealsQueryKey = ["deals", "duffel", "live"] as const;

// Kept below the shortest Duffel offer validity so a cached deal is never
// handed to checkout after it has expired.
const STALE_MS = 5 * 60 * 1000;

export const useDuffelDeals = () => {
  const query = useQuery({
    queryKey: duffelDealsQueryKey,
    queryFn: ({ signal }) => fetchDuffelDeals({ signal }),
    staleTime: STALE_MS,
    gcTime: 15 * 60 * 1000,
    retry: 1,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    // Expired offers are dropped on read, not just on fetch.
    select: (data) => ({ ...data, deals: data.deals.filter(usableDeal) }),
  });

  const deals: DuffelDeal[] = query.data?.deals ?? [];

  return {
    deals,
    loading: query.isPending,
    isFetching: query.isFetching,
    error: query.isError ? (query.error as Error).message : null,
    fromCache: query.data?.fromCache ?? false,
    refetch: query.refetch,
  };
};
