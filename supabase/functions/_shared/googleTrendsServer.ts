/** Keep in sync with src/lib/googleTrendsServer.ts (this copy uses Deno .ts imports). */
import {
  buildCacheKey,
  buildSerpApiSearchParams,
  expiresAtFor,
  isCacheFresh,
  normalizeSerpApiResponse,
  publicHttpError,
  scoresFromTimeseries,
  serpApiErrorMessage,
  splitQueries,
  validateTrendsRequest,
  type GoogleTrendsDataType,
  type GoogleTrendsRequest,
  type NormalizedTrendsPayload,
  type TrendingDestinationScore,
} from "./googleTrendsLogic.ts";

export interface TrendsCacheEntry {
  cache_key: string;
  query: string;
  data_type: GoogleTrendsDataType;
  geo: string | null;
  date_range: string | null;
  response_json: unknown;
  created_at: string;
  expires_at: string;
}

export interface TrendsCacheStore {
  get(cacheKey: string): Promise<TrendsCacheEntry | null>;
  set(entry: TrendsCacheEntry): Promise<void>;
}

export interface SerpApiFetchResult {
  status: number;
  json: unknown;
  timedOut?: boolean;
}

export type TrendsSearchSuccess = {
  ok: true;
  cached: boolean;
  stale?: boolean;
  empty: boolean;
  data_type: GoogleTrendsDataType;
  payload: NormalizedTrendsPayload | null;
};

export type TrendsSearchFailure = {
  ok: false;
  status: number;
  error: string;
};

export type TrendsSearchResult = TrendsSearchSuccess | TrendsSearchFailure;

export interface TrendDestinationInput {
  city: string;
  slug: string;
  query: string;
}

function isRateLimited(status: number, json: unknown): boolean {
  if (status === 429) return true;
  const message = serpApiErrorMessage(json);
  return Boolean(message && /rate limit|too many requests/i.test(message));
}

function toEmptySuccess(dataType: GoogleTrendsDataType, cached: boolean, stale = false): TrendsSearchSuccess {
  return { ok: true, cached, stale, empty: true, data_type: dataType, payload: null };
}

function cachedPayload(entry: TrendsCacheEntry, now?: number): TrendsSearchResult {
  const raw = entry.response_json;
  if (raw && typeof raw === "object" && (raw as { empty?: boolean }).empty === true) {
    return toEmptySuccess(entry.data_type, true, !isCacheFresh(entry.expires_at, now));
  }
  const payload = raw as NormalizedTrendsPayload | null;
  if (!payload || typeof payload !== "object" || !("data_type" in payload)) {
    return toEmptySuccess(entry.data_type, true);
  }
  return {
    ok: true,
    cached: true,
    stale: !isCacheFresh(entry.expires_at, now),
    empty: false,
    data_type: payload.data_type,
    payload,
  };
}

/**
 * Cache-first Google Trends lookup. SerpApi is only called on a miss or
 * expired row. A 429 reuses a stale cached row when one exists.
 */
export async function resolveGoogleTrendsSearch(
  input: Partial<GoogleTrendsRequest>,
  deps: {
    cache: TrendsCacheStore;
    fetchSerpApi: (req: GoogleTrendsRequest) => Promise<SerpApiFetchResult>;
    now?: number;
  },
): Promise<TrendsSearchResult> {
  const validationError = validateTrendsRequest(input);
  if (validationError) {
    return { ok: false, status: 400, error: validationError };
  }

  const req = input as GoogleTrendsRequest;
  const now = deps.now ?? Date.now();
  const cacheKey = buildCacheKey(req);

  let cachedRow: TrendsCacheEntry | null = null;
  try {
    cachedRow = await deps.cache.get(cacheKey);
  } catch {
    cachedRow = null;
  }

  if (cachedRow && isCacheFresh(cachedRow.expires_at, now)) {
    return cachedPayload(cachedRow, now);
  }

  let fetched: SerpApiFetchResult;
  try {
    fetched = await deps.fetchSerpApi(req);
  } catch {
    if (cachedRow) return cachedPayload(cachedRow, now);
    return { ok: false, status: 504, error: "Trends request timed out." };
  }

  if (fetched.timedOut) {
    if (cachedRow) return cachedPayload(cachedRow, now);
    return { ok: false, status: 504, error: "Trends request timed out." };
  }

  if (isRateLimited(fetched.status, fetched.json)) {
    if (cachedRow) return cachedPayload(cachedRow, now);
    return { ok: false, ...publicHttpError(429) };
  }

  if (fetched.status === 401 || fetched.status === 403) {
    return { ok: false, ...publicHttpError(fetched.status) };
  }

  if (fetched.status >= 500) {
    if (cachedRow) return cachedPayload(cachedRow, now);
    return { ok: false, ...publicHttpError(fetched.status) };
  }

  if (fetched.status < 200 || fetched.status >= 300) {
    return { ok: false, ...publicHttpError(fetched.status) };
  }

  const serpError = serpApiErrorMessage(fetched.json);
  if (serpError) {
    if (/hasn't returned any results|no results/i.test(serpError)) {
      await persist(deps.cache, req, cacheKey, { empty: true }, now);
      return toEmptySuccess(req.data_type, false);
    }
    return { ok: false, status: 502, error: "Trends data could not be loaded." };
  }

  const normalized = normalizeSerpApiResponse(req.data_type, fetched.json);
  if ("empty" in normalized) {
    await persist(deps.cache, req, cacheKey, { empty: true }, now);
    return toEmptySuccess(req.data_type, false);
  }

  await persist(deps.cache, req, cacheKey, normalized, now);
  return {
    ok: true,
    cached: false,
    empty: false,
    data_type: req.data_type,
    payload: normalized,
  };
}

async function persist(
  cache: TrendsCacheStore,
  req: GoogleTrendsRequest,
  cacheKey: string,
  responseJson: unknown,
  now: number,
): Promise<void> {
  const entry: TrendsCacheEntry = {
    cache_key: cacheKey,
    query: req.q.trim(),
    data_type: req.data_type,
    geo: req.geo?.trim() || null,
    date_range: req.date?.trim() || null,
    response_json: responseJson,
    created_at: new Date(now).toISOString(),
    expires_at: expiresAtFor(req.data_type, now),
  };
  try {
    await cache.set(entry);
  } catch {
    // Cache writes must never fail the user-facing response.
  }
}

export async function resolveTrendingDestinations(
  destinations: ReadonlyArray<TrendDestinationInput>,
  deps: {
    cache: TrendsCacheStore;
    fetchSerpApi: (req: GoogleTrendsRequest) => Promise<SerpApiFetchResult>;
    now?: number;
    geo?: string;
    date?: string;
    batchSize?: number;
  },
): Promise<{
  ok: boolean;
  cached: boolean;
  destinations: TrendingDestinationScore[];
  error?: string;
}> {
  const size = deps.batchSize ?? 5;
  const scores: TrendingDestinationScore[] = [];
  let cached = true;
  let sawSuccess = false;
  let lastError: string | undefined;

  for (let i = 0; i < destinations.length; i += size) {
    const batch = destinations.slice(i, i + size);
    const req: GoogleTrendsRequest = {
      q: batch.map((d) => d.query).join(","),
      data_type: "TIMESERIES",
      ...(deps.geo ? { geo: deps.geo } : {}),
      ...(deps.date ? { date: deps.date } : {}),
    };
    const result = await resolveGoogleTrendsSearch(req, deps);
    if (!result.ok) {
      lastError = result.error;
      continue;
    }
    sawSuccess = true;
    if (!result.cached) cached = false;
    if (result.payload?.data_type === "TIMESERIES") {
      scores.push(...scoresFromTimeseries(result.payload.interest_over_time, batch));
    }
  }

  if (!sawSuccess) {
    return {
      ok: false,
      cached: false,
      destinations: [],
      error: lastError ?? "Trends data could not be loaded.",
    };
  }

  scores.sort((a, b) => b.trendScore - a.trendScore);
  return { ok: true, cached, destinations: scores };
}

export function serpApiRequestUrl(req: GoogleTrendsRequest, apiKey: string): string {
  const params = buildSerpApiSearchParams(req);
  params.set("api_key", apiKey);
  return `https://serpapi.com/search.json?${params.toString()}`;
}

export { splitQueries };
