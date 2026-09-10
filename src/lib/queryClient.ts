import { QueryClient } from '@tanstack/react-query';

// Global query client with optimized caching configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale-while-revalidate: show cached data immediately, refetch in background
      staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
      gcTime: 30 * 60 * 1000, // 30 minutes - cache garbage collection
      refetchOnWindowFocus: false, // Don't refetch when switching tabs
      refetchOnReconnect: true, // Refetch when reconnecting
      retry: 2, // Retry failed requests twice
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
    mutations: {
      retry: 1,
    },
  },
});

// Query keys for cache management
export const queryKeys = {
  deals: {
    all: ['deals'] as const,
    list: (filters?: Record<string, unknown>) => ['deals', 'list', filters] as const,
    detail: (id: string) => ['deals', 'detail', id] as const,
    minPrice: (limit: number) => ['deals', 'minPrice', limit] as const,
  },
  flights: {
    all: ['flights'] as const,
    search: (params: Record<string, unknown>) => ['flights', 'search', params] as const,
  },
  hotels: {
    all: ['hotels'] as const,
    search: (params: Record<string, unknown>) => ['hotels', 'search', params] as const,
  },
  cars: {
    all: ['cars'] as const,
    search: (params: Record<string, unknown>) => ['cars', 'search', params] as const,
  },
  reviews: {
    all: ['reviews'] as const,
    site: (filters?: Record<string, unknown>) => ['reviews', 'site', filters] as const,
  },
};

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  DEALS: 10 * 60 * 1000, // 10 minutes
  FLIGHTS: 2 * 60 * 1000, // 2 minutes
  HOTELS: 5 * 60 * 1000, // 5 minutes
  CARS: 5 * 60 * 1000, // 5 minutes
  REVIEWS: 15 * 60 * 1000, // 15 minutes
} as const;
