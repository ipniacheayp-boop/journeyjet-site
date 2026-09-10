/**
 * Keep in sync with src/lib/googleTrendsLogic.ts
 *
 * Pure Google Trends helpers shared by the Edge Function contract, client
 * service, and unit tests. Scores come only from SerpApi-documented fields.
 *
 * Google Trends values are *relative interest* (typically 0–100 for the
 * selected query set and date range), not absolute search volume.
 */

export const GOOGLE_TRENDS_DATA_TYPES = [
  "TIMESERIES",
  "GEO_MAP",
  "GEO_MAP_0",
  "RELATED_TOPICS",
  "RELATED_QUERIES",
] as const;

export type GoogleTrendsDataType = (typeof GOOGLE_TRENDS_DATA_TYPES)[number];

export type TrendDirection = "up" | "down" | "stable";

export interface GoogleTrendsRequest {
  q: string;
  data_type: GoogleTrendsDataType;
  hl?: string;
  geo?: string;
  region?: string;
  date?: string;
  tz?: string | number;
  cat?: string | number;
  gprop?: string;
  include_low_search_volume?: boolean;
}

export interface TimelineValue {
  query: string;
  query_index?: number;
  value: string;
  extracted_value?: number;
}

export interface TimelinePoint {
  date: string;
  timestamp?: string;
  values: TimelineValue[];
}

export interface InterestAverage {
  query: string;
  value: number;
}

export interface NormalizedInterestOverTime {
  timeline_data: TimelinePoint[];
  averages: InterestAverage[];
}

export interface RelatedQueryItem {
  query: string;
  value: string;
  extracted_value?: number;
  link?: string;
}

export interface NormalizedRelatedQueries {
  rising: RelatedQueryItem[];
  top: RelatedQueryItem[];
}

export interface RelatedTopicItem {
  topic: {
    value?: string;
    title?: string;
    type?: string;
  };
  value: string;
  extracted_value?: number;
  link?: string;
}

export interface NormalizedRelatedTopics {
  rising: RelatedTopicItem[];
  top: RelatedTopicItem[];
}

export interface RegionInterestItem {
  geo?: string;
  location?: string;
  value: string;
  extracted_value?: number;
}

export interface NormalizedInterestByRegion {
  regions: RegionInterestItem[];
}

export interface ComparedRegionItem {
  geo?: string;
  location?: string;
  values: TimelineValue[];
}

export interface NormalizedComparedBreakdown {
  regions: ComparedRegionItem[];
}

export interface TrendingDestinationScore {
  destination: string;
  slug: string;
  query: string;
  trendScore: number;
  previousScore: number;
  direction: TrendDirection;
}

export type NormalizedTrendsPayload =
  | { data_type: "TIMESERIES"; interest_over_time: NormalizedInterestOverTime }
  | { data_type: "RELATED_QUERIES"; related_queries: NormalizedRelatedQueries }
  | { data_type: "RELATED_TOPICS"; related_topics: NormalizedRelatedTopics }
  | { data_type: "GEO_MAP_0"; interest_by_region: NormalizedInterestByRegion }
  | { data_type: "GEO_MAP"; compared_breakdown_by_region: NormalizedComparedBreakdown };

const SINGLE_QUERY_TYPES: ReadonlySet<GoogleTrendsDataType> = new Set([
  "GEO_MAP_0",
  "RELATED_TOPICS",
  "RELATED_QUERIES",
]);

const MULTI_QUERY_ONLY: ReadonlySet<GoogleTrendsDataType> = new Set(["GEO_MAP"]);

/** SerpApi max queries for TIMESERIES / GEO_MAP. */
export const MAX_COMPARISON_QUERIES = 5;
export const MAX_QUERY_LENGTH = 100;

/** Shown in API responses and UI. Trends numbers are relative, not volume. */
export const RELATIVE_INTEREST_NOTE =
  "Google Trends scores are relative interest (typically 0–100 for the selected queries and date range), not absolute search volume.";

export const SERPAPI_TRENDS_ENDPOINT = "https://serpapi.com/search.json";

export const TTL_MS: Record<GoogleTrendsDataType, number> = {
  TIMESERIES: 12 * 60 * 60 * 1000,
  GEO_MAP: 18 * 60 * 60 * 1000,
  GEO_MAP_0: 18 * 60 * 60 * 1000,
  RELATED_QUERIES: 18 * 60 * 60 * 1000,
  RELATED_TOPICS: 18 * 60 * 60 * 1000,
};

export function isGoogleTrendsDataType(value: unknown): value is GoogleTrendsDataType {
  return typeof value === "string" && (GOOGLE_TRENDS_DATA_TYPES as readonly string[]).includes(value);
}

export function splitQueries(q: string): string[] {
  return q
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function validateTrendsRequest(input: Partial<GoogleTrendsRequest>): string | null {
  const q = typeof input.q === "string" ? input.q.trim() : "";
  if (!q) return "Query (q) is required.";
  if (!isGoogleTrendsDataType(input.data_type)) {
    return `Invalid data_type. Allowed: ${GOOGLE_TRENDS_DATA_TYPES.join(", ")}.`;
  }

  const queries = splitQueries(q);
  if (queries.length === 0) return "Query (q) is required.";
  if (queries.some((query) => query.length > MAX_QUERY_LENGTH)) {
    return `Each query must be ${MAX_QUERY_LENGTH} characters or fewer.`;
  }

  if (SINGLE_QUERY_TYPES.has(input.data_type) && queries.length !== 1) {
    return `${input.data_type} accepts exactly one query.`;
  }
  if (MULTI_QUERY_ONLY.has(input.data_type) && queries.length < 2) {
    return "GEO_MAP requires at least two comma-separated queries.";
  }
  if ((input.data_type === "TIMESERIES" || input.data_type === "GEO_MAP") && queries.length > MAX_COMPARISON_QUERIES) {
    return `${input.data_type} accepts at most ${MAX_COMPARISON_QUERIES} queries.`;
  }
  if (input.region && input.data_type !== "GEO_MAP" && input.data_type !== "GEO_MAP_0") {
    return "region is only valid for GEO_MAP and GEO_MAP_0.";
  }
  if (input.include_low_search_volume && input.data_type !== "GEO_MAP" && input.data_type !== "GEO_MAP_0") {
    return "include_low_search_volume is only valid for GEO_MAP and GEO_MAP_0.";
  }
  return null;
}

export function buildCacheKey(req: GoogleTrendsRequest): string {
  const parts = [
    req.data_type,
    req.q.trim().toLowerCase(),
    req.geo?.trim().toUpperCase() ?? "",
    req.date?.trim() ?? "",
    String(req.tz ?? ""),
    String(req.cat ?? ""),
    req.gprop?.trim() ?? "",
    req.region?.trim() ?? "",
    req.hl?.trim() ?? "",
    req.include_low_search_volume ? "1" : "0",
  ];
  return parts.join("|");
}

export function isCacheFresh(expiresAt: string, now = Date.now()): boolean {
  const expires = Date.parse(expiresAt);
  return Number.isFinite(expires) && expires > now;
}

export function expiresAtFor(dataType: GoogleTrendsDataType, now = Date.now()): string {
  return new Date(now + TTL_MS[dataType]).toISOString();
}

/** Official SerpApi Google Trends query params. Does not include api_key. */
export function buildSerpApiSearchParams(req: GoogleTrendsRequest): URLSearchParams {
  const sp = new URLSearchParams();
  sp.set("engine", "google_trends");
  sp.set("q", req.q.trim());
  sp.set("data_type", req.data_type);
  if (req.hl) sp.set("hl", String(req.hl).trim());
  if (req.geo) sp.set("geo", String(req.geo).trim());
  if (req.date) sp.set("date", String(req.date).trim());
  if (req.tz !== undefined && req.tz !== "") sp.set("tz", String(req.tz).trim());
  if (req.cat !== undefined && req.cat !== "") sp.set("cat", String(req.cat).trim());
  if (req.gprop) sp.set("gprop", String(req.gprop).trim());
  if (req.data_type === "GEO_MAP" || req.data_type === "GEO_MAP_0") {
    if (req.region) sp.set("region", String(req.region).trim());
    if (req.include_low_search_volume) sp.set("include_low_search_volume", "true");
  }
  return sp;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function optionalNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return undefined;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function normalizeTimelineValue(raw: unknown): TimelineValue | null {
  const row = asRecord(raw);
  if (!row) return null;
  const query = optionalString(row.query);
  const value = optionalString(row.value) ?? (row.extracted_value != null ? String(row.extracted_value) : undefined);
  if (!query || value === undefined) return null;
  const extracted = optionalNumber(row.extracted_value);
  const queryIndex = optionalNumber(row.query_index);
  return {
    query,
    value,
    ...(extracted !== undefined ? { extracted_value: extracted } : {}),
    ...(queryIndex !== undefined ? { query_index: queryIndex } : {}),
  };
}

export function normalizeInterestOverTime(raw: unknown): NormalizedInterestOverTime {
  const root = asRecord(raw)?.interest_over_time ?? asRecord(raw);
  const obj = asRecord(root) ?? {};
  const timeline_data = asArray(obj.timeline_data)
    .map((point) => {
      const row = asRecord(point);
      if (!row) return null;
      const date = optionalString(row.date);
      if (!date) return null;
      const values = asArray(row.values).map(normalizeTimelineValue).filter((v): v is TimelineValue => v !== null);
      return {
        date,
        ...(optionalString(row.timestamp) ? { timestamp: optionalString(row.timestamp) } : {}),
        values,
      } satisfies TimelinePoint;
    })
    .filter((p): p is TimelinePoint => p !== null);

  const averages = asArray(obj.averages)
    .map((item) => {
      const row = asRecord(item);
      if (!row) return null;
      const query = optionalString(row.query);
      const value = optionalNumber(row.value);
      if (!query || value === undefined) return null;
      return { query, value } satisfies InterestAverage;
    })
    .filter((a): a is InterestAverage => a !== null);

  return { timeline_data, averages };
}

function normalizeRelatedQuery(raw: unknown): RelatedQueryItem | null {
  const row = asRecord(raw);
  if (!row) return null;
  const query = optionalString(row.query);
  const value = optionalString(row.value) ?? (row.extracted_value != null ? String(row.extracted_value) : undefined);
  if (!query || value === undefined) return null;
  const extracted = optionalNumber(row.extracted_value);
  return {
    query,
    value,
    ...(extracted !== undefined ? { extracted_value: extracted } : {}),
    ...(optionalString(row.link) ? { link: optionalString(row.link) } : {}),
  };
}

export function normalizeRelatedQueries(raw: unknown): NormalizedRelatedQueries {
  const root = asRecord(raw)?.related_queries ?? asRecord(raw);
  const obj = asRecord(root) ?? {};
  return {
    rising: asArray(obj.rising).map(normalizeRelatedQuery).filter((v): v is RelatedQueryItem => v !== null),
    top: asArray(obj.top).map(normalizeRelatedQuery).filter((v): v is RelatedQueryItem => v !== null),
  };
}

function normalizeRelatedTopic(raw: unknown): RelatedTopicItem | null {
  const row = asRecord(raw);
  if (!row) return null;
  const topic = asRecord(row.topic) ?? {};
  const value = optionalString(row.value) ?? (row.extracted_value != null ? String(row.extracted_value) : undefined);
  if (value === undefined) return null;
  const extracted = optionalNumber(row.extracted_value);
  return {
    topic: {
      ...(optionalString(topic.value) ? { value: optionalString(topic.value) } : {}),
      ...(optionalString(topic.title) ? { title: optionalString(topic.title) } : {}),
      ...(optionalString(topic.type) ? { type: optionalString(topic.type) } : {}),
    },
    value,
    ...(extracted !== undefined ? { extracted_value: extracted } : {}),
    ...(optionalString(row.link) ? { link: optionalString(row.link) } : {}),
  };
}

export function normalizeRelatedTopics(raw: unknown): NormalizedRelatedTopics {
  const root = asRecord(raw)?.related_topics ?? asRecord(raw);
  const obj = asRecord(root) ?? {};
  return {
    rising: asArray(obj.rising).map(normalizeRelatedTopic).filter((v): v is RelatedTopicItem => v !== null),
    top: asArray(obj.top).map(normalizeRelatedTopic).filter((v): v is RelatedTopicItem => v !== null),
  };
}

function normalizeRegion(raw: unknown): RegionInterestItem | null {
  const row = asRecord(raw);
  if (!row) return null;
  const value =
    optionalString(row.value) ??
    (row.extracted_value != null ? String(row.extracted_value) : undefined);
  if (value === undefined) return null;
  const extracted = optionalNumber(row.extracted_value);
  return {
    ...(optionalString(row.geo) ? { geo: optionalString(row.geo) } : {}),
    ...(optionalString(row.location) ? { location: optionalString(row.location) } : {}),
    value,
    ...(extracted !== undefined ? { extracted_value: extracted } : {}),
  };
}

export function normalizeInterestByRegion(raw: unknown): NormalizedInterestByRegion {
  const root = asRecord(raw);
  const list = asArray(root?.interest_by_region ?? root?.regions);
  return { regions: list.map(normalizeRegion).filter((v): v is RegionInterestItem => v !== null) };
}

export function normalizeComparedBreakdown(raw: unknown): NormalizedComparedBreakdown {
  const root = asRecord(raw);
  const list = asArray(root?.compared_breakdown_by_region ?? root?.regions);
  const regions = list
    .map((item) => {
      const row = asRecord(item);
      if (!row) return null;
      const values = asArray(row.values).map(normalizeTimelineValue).filter((v): v is TimelineValue => v !== null);
      return {
        ...(optionalString(row.geo) ? { geo: optionalString(row.geo) } : {}),
        ...(optionalString(row.location) ? { location: optionalString(row.location) } : {}),
        values,
      } satisfies ComparedRegionItem;
    })
    .filter((r): r is ComparedRegionItem => r !== null);
  return { regions };
}

export function normalizeSerpApiResponse(
  dataType: GoogleTrendsDataType,
  raw: unknown,
): NormalizedTrendsPayload | { empty: true } {
  switch (dataType) {
    case "TIMESERIES": {
      const interest_over_time = normalizeInterestOverTime(raw);
      if (interest_over_time.timeline_data.length === 0) return { empty: true };
      return { data_type: "TIMESERIES", interest_over_time };
    }
    case "RELATED_QUERIES": {
      const related_queries = normalizeRelatedQueries(raw);
      if (related_queries.rising.length === 0 && related_queries.top.length === 0) return { empty: true };
      return { data_type: "RELATED_QUERIES", related_queries };
    }
    case "RELATED_TOPICS": {
      const related_topics = normalizeRelatedTopics(raw);
      if (related_topics.rising.length === 0 && related_topics.top.length === 0) return { empty: true };
      return { data_type: "RELATED_TOPICS", related_topics };
    }
    case "GEO_MAP_0": {
      const interest_by_region = normalizeInterestByRegion(raw);
      if (interest_by_region.regions.length === 0) return { empty: true };
      return { data_type: "GEO_MAP_0", interest_by_region };
    }
    case "GEO_MAP": {
      const compared_breakdown_by_region = normalizeComparedBreakdown(raw);
      if (compared_breakdown_by_region.regions.length === 0) return { empty: true };
      return { data_type: "GEO_MAP", compared_breakdown_by_region };
    }
  }
}

export function serpApiErrorMessage(raw: unknown): string | null {
  const obj = asRecord(raw);
  if (typeof obj?.error === "string" && obj.error.trim()) return obj.error;
  return null;
}

function latestExtractedValue(timeline: TimelinePoint[], query: string): { current?: number; previous?: number } {
  const points = timeline.filter((p) => p.values.some((v) => v.query.toLowerCase() === query.toLowerCase()));
  const values = points
    .map((p) => p.values.find((v) => v.query.toLowerCase() === query.toLowerCase())?.extracted_value)
    .filter((n): n is number => typeof n === "number");
  if (values.length === 0) return {};
  const current = values[values.length - 1];
  const previous = values.length > 1 ? values[values.length - 2] : current;
  return { current, previous };
}

export function directionFromScores(current: number, previous: number): TrendDirection {
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "stable";
}

/**
 * Build destination scores from a TIMESERIES payload. Missing extracted_value
 * points are skipped — scores are never invented.
 */
export function scoresFromTimeseries(
  interest: NormalizedInterestOverTime,
  destinations: ReadonlyArray<{ city: string; slug: string; query: string }>,
): TrendingDestinationScore[] {
  const scores: TrendingDestinationScore[] = [];
  for (const dest of destinations) {
    const { current, previous } = latestExtractedValue(interest.timeline_data, dest.query);
    if (current === undefined || previous === undefined) continue;
    scores.push({
      destination: dest.city,
      slug: dest.slug,
      query: dest.query,
      trendScore: current,
      previousScore: previous,
      direction: directionFromScores(current, previous),
    });
  }
  return scores.sort((a, b) => b.trendScore - a.trendScore);
}

export function publicHttpError(status: number): { status: number; error: string } {
  if (status === 401 || status === 403) return { status: 502, error: "Trends service is not configured." };
  if (status === 429) return { status: 429, error: "Trends are temporarily rate limited. Please try again later." };
  if (status >= 500) return { status: 502, error: "Trends service is unavailable." };
  return { status: 502, error: "Trends data could not be loaded." };
}
