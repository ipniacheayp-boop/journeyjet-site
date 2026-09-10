import { supabase } from '@/integrations/supabase/client';

const REQUEST_TIMEOUT = 8000; // 8 seconds timeout
const MAX_RETRIES = 2;

// In-memory request deduplication cache
const pendingRequests = new Map<string, Promise<any>>();
const responseCache = new Map<string, { data: any; timestamp: number }>();

interface FetchOptions {
  method?: 'GET' | 'POST';
  body?: Record<string, unknown>;
  cacheTTL?: number; // Cache TTL in milliseconds
  skipCache?: boolean;
}

// Generate cache key from function name and params
const getCacheKey = (functionName: string, body?: Record<string, unknown>): string => {
  return `${functionName}:${JSON.stringify(body || {})}`;
};

// Check if cached response is still valid
const getCachedResponse = (key: string, ttl: number): any | null => {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  return null;
};

// Optimized fetch wrapper with timeout, retry, deduplication, and caching
export const fetchWithOptimization = async <T>(
  functionName: string,
  options: FetchOptions = {}
): Promise<T> => {
  const { method = 'GET', body, cacheTTL = 5 * 60 * 1000, skipCache = false } = options;
  const cacheKey = getCacheKey(functionName, body);

  // Check memory cache first (instant response)
  if (!skipCache && method === 'GET') {
    const cached = getCachedResponse(cacheKey, cacheTTL);
    if (cached) {
      console.log(`📦 Cache hit: ${functionName}`);
      return cached as T;
    }
  }

  // Request deduplication - return existing promise if same request is in flight
  if (pendingRequests.has(cacheKey)) {
    console.log(`🔄 Dedup: Reusing pending request for ${functionName}`);
    return pendingRequests.get(cacheKey) as Promise<T>;
  }

  // Create fetch promise with timeout and retry logic
  const fetchPromise = (async () => {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        const invokeOptions: any = { method };
        if (body) invokeOptions.body = body;

        const { data, error } = await supabase.functions.invoke(functionName, invokeOptions);

        clearTimeout(timeoutId);

        if (error) throw error;

        // Cache successful response
        if (!skipCache) {
          responseCache.set(cacheKey, { data, timestamp: Date.now() });
        }

        return data as T;
      } catch (error: any) {
        lastError = error;
        console.warn(`⚠️ Attempt ${attempt + 1} failed for ${functionName}:`, error.message);
        
        if (attempt < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    // All retries failed - try returning stale cache if available
    const staleCache = responseCache.get(cacheKey);
    if (staleCache) {
      console.log(`📦 Returning stale cache for ${functionName}`);
      return staleCache.data as T;
    }

    throw lastError || new Error('Request failed');
  })();

  // Store pending request for deduplication
  pendingRequests.set(cacheKey, fetchPromise);

  try {
    return await fetchPromise;
  } finally {
    pendingRequests.delete(cacheKey);
  }
};

// Batch multiple requests together
export const batchFetch = async <T>(
  requests: Array<{ functionName: string; options?: FetchOptions }>
): Promise<T[]> => {
  return Promise.all(
    requests.map(({ functionName, options }) => 
      fetchWithOptimization<T>(functionName, options)
    )
  );
};

// Clear cache for specific keys or all
export const clearFetchCache = (pattern?: string) => {
  if (pattern) {
    for (const key of responseCache.keys()) {
      if (key.includes(pattern)) {
        responseCache.delete(key);
      }
    }
  } else {
    responseCache.clear();
  }
};
