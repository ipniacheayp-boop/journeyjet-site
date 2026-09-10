import { invokeSupabaseFunction } from "@/lib/invokeSupabaseFunction";
import type {
  GoogleTrendsDataType,
  GoogleTrendsRequest,
  NormalizedComparedBreakdown,
  NormalizedInterestByRegion,
  NormalizedInterestOverTime,
  NormalizedRelatedQueries,
  NormalizedRelatedTopics,
  NormalizedTrendsPayload,
  TrendingDestinationScore,
} from "@/lib/googleTrendsLogic";
import { buildCacheKey } from "@/lib/googleTrendsLogic";

const TRENDS_TIMEOUT_MS = 12_000;
const CLIENT_MEMORY_TTL_MS = 10 * 60 * 1000;

export interface TrendsFunctionSuccess {
  ok: true;
  cached: boolean;
  empty?: boolean;
  data_type: GoogleTrendsDataType;
  payload: NormalizedTrendsPayload | null;
}

export interface TrendsFunctionError {
  ok: false;
  error: string;
}

export type TrendsFunctionResponse = TrendsFunctionSuccess | TrendsFunctionError;

export interface TrendingFunctionResponse {
  ok: boolean;
  cached?: boolean;
  destinations?: TrendingDestinationScore[];
  interestNote?: string;
  error?: string;
}

const inflight = new Map<string, Promise<unknown>>();
const memory = new Map<string, { expires: number; value: unknown }>();

function memoryGet<T>(key: string): T | undefined {
  const hit = memory.get(key);
  if (!hit) return undefined;
  if (hit.expires < Date.now()) {
    memory.delete(key);
    return undefined;
  }
  return hit.value as T;
}

function memorySet<T>(key: string, value: T): void {
  memory.set(key, { value, expires: Date.now() + CLIENT_MEMORY_TTL_MS });
}

function dedupe<T>(key: string, factory: () => Promise<T>): Promise<T> {
  const cached = memoryGet<T>(key);
  if (cached) return Promise.resolve(cached);
  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;
  const pending = factory()
    .then((value) => {
      const failed =
        value &&
        typeof value === "object" &&
        "error" in value &&
        Boolean((value as { error?: string | null }).error);
      if (!failed) memorySet(key, value);
      return value;
    })
    .finally(() => inflight.delete(key));
  inflight.set(key, pending);
  return pending;
}

async function invokeTrends<T>(body: object): Promise<{ data: T | null; error: string | null }> {
  return invokeSupabaseFunction<T>("google-trends", body, { timeoutMs: TRENDS_TIMEOUT_MS });
}

async function searchTrends(req: GoogleTrendsRequest): Promise<{
  data: NormalizedTrendsPayload | null;
  error: string | null;
  cached: boolean;
}> {
  const key = `search:${buildCacheKey(req)}`;
  return dedupe(key, async () => {
    const { data, error } = await invokeTrends<TrendsFunctionResponse>({ action: "search", ...req });
    if (error) return { data: null, error, cached: false };
    if (!data || data.ok === false) {
      return { data: null, error: data?.error ?? "Trends data could not be loaded.", cached: false };
    }
    if (data.empty || !data.payload) {
      return { data: null, error: null, cached: data.cached };
    }
    return { data: data.payload, error: null, cached: data.cached };
  });
}

export async function getInterestOverTime(
  params: Omit<GoogleTrendsRequest, "data_type">,
): Promise<{ data: NormalizedInterestOverTime | null; error: string | null; cached: boolean }> {
  const result = await searchTrends({ ...params, data_type: "TIMESERIES" });
  if (result.error || !result.data || result.data.data_type !== "TIMESERIES") {
    return { data: null, error: result.error, cached: result.cached };
  }
  return { data: result.data.interest_over_time, error: null, cached: result.cached };
}

export async function getInterestByRegion(
  params: Omit<GoogleTrendsRequest, "data_type">,
): Promise<{ data: NormalizedInterestByRegion | null; error: string | null; cached: boolean }> {
  const result = await searchTrends({ ...params, data_type: "GEO_MAP_0" });
  if (result.error || !result.data || result.data.data_type !== "GEO_MAP_0") {
    return { data: null, error: result.error, cached: result.cached };
  }
  return { data: result.data.interest_by_region, error: null, cached: result.cached };
}

export async function getComparedBreakdownByRegion(
  params: Omit<GoogleTrendsRequest, "data_type">,
): Promise<{ data: NormalizedComparedBreakdown | null; error: string | null; cached: boolean }> {
  const result = await searchTrends({ ...params, data_type: "GEO_MAP" });
  if (result.error || !result.data || result.data.data_type !== "GEO_MAP") {
    return { data: null, error: result.error, cached: result.cached };
  }
  return { data: result.data.compared_breakdown_by_region, error: null, cached: result.cached };
}

export async function getRelatedQueries(
  params: Omit<GoogleTrendsRequest, "data_type">,
): Promise<{ data: NormalizedRelatedQueries | null; error: string | null; cached: boolean }> {
  const result = await searchTrends({ ...params, data_type: "RELATED_QUERIES" });
  if (result.error || !result.data || result.data.data_type !== "RELATED_QUERIES") {
    return { data: null, error: result.error, cached: result.cached };
  }
  return { data: result.data.related_queries, error: null, cached: result.cached };
}

export async function getRelatedTopics(
  params: Omit<GoogleTrendsRequest, "data_type">,
): Promise<{ data: NormalizedRelatedTopics | null; error: string | null; cached: boolean }> {
  const result = await searchTrends({ ...params, data_type: "RELATED_TOPICS" });
  if (result.error || !result.data || result.data.data_type !== "RELATED_TOPICS") {
    return { data: null, error: result.error, cached: result.cached };
  }
  return { data: result.data.related_topics, error: null, cached: result.cached };
}

export async function getTrendingDestinations(params: { geo?: string; date?: string } = {}): Promise<{
  destinations: TrendingDestinationScore[];
  error: string | null;
  cached: boolean;
}> {
  const key = `trending:${params.geo ?? ""}:${params.date ?? ""}`;
  return dedupe(key, async () => {
    const { data, error } = await invokeTrends<TrendingFunctionResponse>({
      action: "trending",
      ...params,
    });
    if (error) return { destinations: [], error, cached: false };
    if (!data?.ok) {
      return {
        destinations: [],
        error: data?.error ?? "Trends data could not be loaded.",
        cached: false,
      };
    }
    return {
      destinations: data.destinations ?? [],
      error: null,
      cached: Boolean(data.cached),
    };
  });
}
