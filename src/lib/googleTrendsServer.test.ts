import { describe, expect, it } from "vitest";
import {
  resolveGoogleTrendsSearch,
  resolveTrendingDestinations,
  type TrendsCacheEntry,
  type TrendsCacheStore,
} from "./googleTrendsServer";
import { buildCacheKey, expiresAtFor, type GoogleTrendsRequest } from "./googleTrendsLogic";

const timeseriesJson = {
  interest_over_time: {
    timeline_data: [
      {
        date: "Mar 1 – 7, 2026",
        timestamp: "1740787200",
        values: [{ query: "Dubai", value: "72", extracted_value: 72 }],
      },
      {
        date: "Mar 8 – 14, 2026",
        timestamp: "1741392000",
        values: [{ query: "Dubai", value: "84", extracted_value: 84 }],
      },
    ],
    averages: [{ query: "Dubai", value: 78 }],
  },
};

const relatedQueriesJson = {
  related_queries: {
    rising: [{ query: "dubai expo", value: "+250%", extracted_value: 250 }],
    top: [{ query: "dubai", value: "100", extracted_value: 100 }],
  },
};

const relatedTopicsJson = {
  related_topics: {
    rising: [
      {
        topic: { value: "/m/02cft", title: "Dubai", type: "City" },
        value: "+80%",
        extracted_value: 80,
      },
    ],
    top: [],
  },
};

const geoMap0Json = {
  interest_by_region: [{ geo: "US-NY", location: "New York", value: "100", extracted_value: 100 }],
};

function memoryCache(seed: TrendsCacheEntry[] = []): TrendsCacheStore & { rows: Map<string, TrendsCacheEntry> } {
  const rows = new Map(seed.map((row) => [row.cache_key, row]));
  return {
    rows,
    async get(cacheKey) {
      return rows.get(cacheKey) ?? null;
    },
    async set(entry) {
      rows.set(entry.cache_key, entry);
    },
  };
}

describe("resolveGoogleTrendsSearch", () => {
  it("normalizes a successful TIMESERIES response and writes cache (miss)", async () => {
    const cache = memoryCache();
    let calls = 0;
    const result = await resolveGoogleTrendsSearch(
      { q: "Dubai", data_type: "TIMESERIES" },
      {
        cache,
        fetchSerpApi: async () => {
          calls += 1;
          return { status: 200, json: timeseriesJson };
        },
      },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.cached).toBe(false);
    expect(result.empty).toBe(false);
    expect(result.payload?.data_type).toBe("TIMESERIES");
    expect(calls).toBe(1);
    expect(cache.rows.size).toBe(1);
  });

  it("normalizes RELATED_QUERIES including percentage value text", async () => {
    const result = await resolveGoogleTrendsSearch(
      { q: "Dubai", data_type: "RELATED_QUERIES" },
      {
        cache: memoryCache(),
        fetchSerpApi: async () => ({ status: 200, json: relatedQueriesJson }),
      },
    );
    expect(result.ok).toBe(true);
    if (!result.ok || result.payload?.data_type !== "RELATED_QUERIES") return;
    expect(result.payload.related_queries.rising[0]).toMatchObject({
      query: "dubai expo",
      value: "+250%",
      extracted_value: 250,
    });
  });

  it("normalizes RELATED_TOPICS topic fields", async () => {
    const result = await resolveGoogleTrendsSearch(
      { q: "Dubai", data_type: "RELATED_TOPICS" },
      {
        cache: memoryCache(),
        fetchSerpApi: async () => ({ status: 200, json: relatedTopicsJson }),
      },
    );
    expect(result.ok).toBe(true);
    if (!result.ok || result.payload?.data_type !== "RELATED_TOPICS") return;
    expect(result.payload.related_topics.rising[0].topic.title).toBe("Dubai");
  });

  it("normalizes GEO_MAP_0 region rows", async () => {
    const result = await resolveGoogleTrendsSearch(
      { q: "Dubai", data_type: "GEO_MAP_0", geo: "US" },
      {
        cache: memoryCache(),
        fetchSerpApi: async () => ({ status: 200, json: geoMap0Json }),
      },
    );
    expect(result.ok).toBe(true);
    if (!result.ok || result.payload?.data_type !== "GEO_MAP_0") return;
    expect(result.payload.interest_by_region.regions[0]).toMatchObject({
      geo: "US-NY",
      location: "New York",
      extracted_value: 100,
    });
  });

  it("rejects an invalid data_type before calling SerpApi", async () => {
    let calls = 0;
    const result = await resolveGoogleTrendsSearch(
      { q: "Dubai", data_type: "VOLUME" as GoogleTrendsRequest["data_type"] },
      {
        cache: memoryCache(),
        fetchSerpApi: async () => {
          calls += 1;
          return { status: 200, json: timeseriesJson };
        },
      },
    );
    expect(result).toMatchObject({ ok: false, status: 400 });
    expect(calls).toBe(0);
  });

  it("treats an empty SerpApi body as empty, not invented scores", async () => {
    const result = await resolveGoogleTrendsSearch(
      { q: "Dubai", data_type: "TIMESERIES" },
      {
        cache: memoryCache(),
        fetchSerpApi: async () => ({ status: 200, json: {} }),
      },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.empty).toBe(true);
    expect(result.payload).toBeNull();
  });

  it("maps a SerpApi error object to a safe application error", async () => {
    const result = await resolveGoogleTrendsSearch(
      { q: "Dubai", data_type: "TIMESERIES" },
      {
        cache: memoryCache(),
        fetchSerpApi: async () => ({ status: 200, json: { error: "Invalid API key." } }),
      },
    );
    expect(result).toEqual({
      ok: false,
      status: 502,
      error: "Trends data could not be loaded.",
    });
  });

  it("returns a fresh cache hit without calling SerpApi", async () => {
    const req = { q: "Dubai", data_type: "TIMESERIES" as const };
    const now = Date.parse("2026-03-01T00:00:00.000Z");
    const cache = memoryCache([
      {
        cache_key: buildCacheKey(req),
        query: "Dubai",
        data_type: "TIMESERIES",
        geo: null,
        date_range: null,
        response_json: {
          data_type: "TIMESERIES",
          interest_over_time: {
            timeline_data: [
              { date: "cached", values: [{ query: "Dubai", value: "40", extracted_value: 40 }] },
            ],
            averages: [],
          },
        },
        created_at: new Date(now).toISOString(),
        expires_at: expiresAtFor("TIMESERIES", now),
      },
    ]);
    let calls = 0;
    const result = await resolveGoogleTrendsSearch(req, {
      cache,
      now,
      fetchSerpApi: async () => {
        calls += 1;
        return { status: 200, json: timeseriesJson };
      },
    });
    expect(calls).toBe(0);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.cached).toBe(true);
    expect(result.stale).toBe(false);
    expect(result.payload?.data_type === "TIMESERIES" && result.payload.interest_over_time.timeline_data[0].date).toBe(
      "cached",
    );
  });

  it("calls SerpApi on a cache miss", async () => {
    let calls = 0;
    await resolveGoogleTrendsSearch(
      { q: "Dubai", data_type: "TIMESERIES" },
      {
        cache: memoryCache(),
        fetchSerpApi: async () => {
          calls += 1;
          return { status: 200, json: timeseriesJson };
        },
      },
    );
    expect(calls).toBe(1);
  });

  it("refetches when the cached row is expired", async () => {
    const req = { q: "Dubai", data_type: "TIMESERIES" as const };
    const now = Date.parse("2026-03-01T00:00:00.000Z");
    const cache = memoryCache([
      {
        cache_key: buildCacheKey(req),
        query: "Dubai",
        data_type: "TIMESERIES",
        geo: null,
        date_range: null,
        response_json: { empty: true },
        created_at: new Date(now - 48 * 3600_000).toISOString(),
        expires_at: new Date(now - 1).toISOString(),
      },
    ]);
    let calls = 0;
    const result = await resolveGoogleTrendsSearch(req, {
      cache,
      now,
      fetchSerpApi: async () => {
        calls += 1;
        return { status: 200, json: timeseriesJson };
      },
    });
    expect(calls).toBe(1);
    expect(result.ok && result.cached).toBe(false);
    expect(result.ok && result.empty).toBe(false);
  });

  it("serves stale cache on 429 instead of failing", async () => {
    const req = { q: "Dubai", data_type: "TIMESERIES" as const };
    const now = Date.parse("2026-03-01T00:00:00.000Z");
    const cache = memoryCache([
      {
        cache_key: buildCacheKey(req),
        query: "Dubai",
        data_type: "TIMESERIES",
        geo: null,
        date_range: null,
        response_json: {
          data_type: "TIMESERIES",
          interest_over_time: {
            timeline_data: [{ date: "stale", values: [{ query: "Dubai", value: "11", extracted_value: 11 }] }],
            averages: [],
          },
        },
        created_at: new Date(now - 48 * 3600_000).toISOString(),
        expires_at: new Date(now - 1).toISOString(),
      },
    ]);
    const result = await resolveGoogleTrendsSearch(req, {
      cache,
      now,
      fetchSerpApi: async () => ({ status: 429, json: { error: "Rate limit exceeded" } }),
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.cached).toBe(true);
    expect(result.stale).toBe(true);
  });

  it("returns a safe rate-limit error when 429 and cache is empty", async () => {
    const result = await resolveGoogleTrendsSearch(
      { q: "Dubai", data_type: "TIMESERIES" },
      {
        cache: memoryCache(),
        fetchSerpApi: async () => ({ status: 429, json: {} }),
      },
    );
    expect(result).toEqual({
      ok: false,
      status: 429,
      error: "Trends are temporarily rate limited. Please try again later.",
    });
  });
});

describe("resolveTrendingDestinations", () => {
  it("scores destinations only from extracted_value", async () => {
    const result = await resolveTrendingDestinations(
      [
        { city: "Dubai", slug: "dubai", query: "Dubai" },
        { city: "Paris", slug: "paris", query: "Paris" },
      ],
      {
        cache: memoryCache(),
        fetchSerpApi: async () => ({
          status: 200,
          json: {
            interest_over_time: {
              timeline_data: [
                {
                  date: "week 1",
                  values: [
                    { query: "Dubai", value: "50", extracted_value: 50 },
                    { query: "Paris", value: "40", extracted_value: 40 },
                  ],
                },
                {
                  date: "week 2",
                  values: [
                    { query: "Dubai", value: "70", extracted_value: 70 },
                    { query: "Paris", value: "40", extracted_value: 40 },
                  ],
                },
              ],
              averages: [],
            },
          },
        }),
      },
    );
    expect(result.ok).toBe(true);
    expect(result.destinations).toEqual([
      {
        destination: "Dubai",
        slug: "dubai",
        query: "Dubai",
        trendScore: 70,
        previousScore: 50,
        direction: "up",
      },
      {
        destination: "Paris",
        slug: "paris",
        query: "Paris",
        trendScore: 40,
        previousScore: 40,
        direction: "stable",
      },
    ]);
  });
});
