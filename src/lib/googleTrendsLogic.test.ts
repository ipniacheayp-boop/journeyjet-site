import { describe, expect, it } from "vitest";
import {
  buildCacheKey,
  buildSerpApiSearchParams,
  directionFromScores,
  expiresAtFor,
  isCacheFresh,
  isGoogleTrendsDataType,
  normalizeInterestByRegion,
  normalizeInterestOverTime,
  normalizeRelatedQueries,
  normalizeRelatedTopics,
  normalizeSerpApiResponse,
  publicHttpError,
  scoresFromTimeseries,
  serpApiErrorMessage,
  validateTrendsRequest,
} from "./googleTrendsLogic";

const timeseriesFixture = {
  interest_over_time: {
    timeline_data: [
      {
        date: "Mar 1 – 7, 2026",
        timestamp: "1740787200",
        values: [
          { query: "Dubai", query_index: 0, value: "72", extracted_value: 72 },
          { query: "Paris", query_index: 1, value: "60", extracted_value: 60 },
        ],
      },
      {
        date: "Mar 8 – 14, 2026",
        timestamp: "1741392000",
        values: [
          { query: "Dubai", query_index: 0, value: "84", extracted_value: 84 },
          { query: "Paris", query_index: 1, value: "60", extracted_value: 60 },
        ],
      },
    ],
    averages: [
      { query: "Dubai", value: 78 },
      { query: "Paris", value: 60 },
    ],
  },
};

const relatedQueriesFixture = {
  related_queries: {
    rising: [
      {
        query: "dubai expo",
        value: "+250%",
        extracted_value: 250,
        link: "https://trends.google.com/trends/explore?q=dubai+expo",
      },
      { query: "dubai breakout term", value: "Breakout" },
    ],
    top: [{ query: "dubai", value: "100", extracted_value: 100 }],
  },
};

const relatedTopicsFixture = {
  related_topics: {
    rising: [
      {
        topic: { value: "/m/02cft", title: "Dubai", type: "City" },
        value: "+80%",
        extracted_value: 80,
        link: "https://trends.google.com/trends/explore?q=/m/02cft",
      },
    ],
    top: [
      {
        topic: { value: "/m/0h7h6", title: "United Arab Emirates", type: "Country" },
        value: "100",
        extracted_value: 100,
      },
    ],
  },
};

const geoMap0Fixture = {
  interest_by_region: [
    { geo: "US-NY", location: "New York", value: "100", extracted_value: 100 },
    { geo: "US-CA", location: "California", value: "74", extracted_value: 74 },
  ],
};

describe("validateTrendsRequest", () => {
  it("accepts a valid TIMESERIES request", () => {
    expect(validateTrendsRequest({ q: "Dubai,Paris", data_type: "TIMESERIES" })).toBeNull();
  });

  it("rejects an invalid data_type", () => {
    expect(validateTrendsRequest({ q: "Dubai", data_type: "VOLUME" as never })).toMatch(/Invalid data_type/);
  });

  it("rejects RELATED_QUERIES with multiple queries", () => {
    expect(validateTrendsRequest({ q: "Dubai,Paris", data_type: "RELATED_QUERIES" })).toMatch(
      /exactly one query/,
    );
  });

  it("rejects GEO_MAP with a single query", () => {
    expect(validateTrendsRequest({ q: "Dubai", data_type: "GEO_MAP" })).toMatch(/at least two/);
  });

  it("rejects a missing query", () => {
    expect(validateTrendsRequest({ q: "  ", data_type: "TIMESERIES" })).toMatch(/required/);
  });
});

describe("normalize TIMESERIES", () => {
  it("keeps official timeline and average fields", () => {
    const result = normalizeInterestOverTime(timeseriesFixture);
    expect(result.timeline_data).toHaveLength(2);
    expect(result.averages).toEqual([
      { query: "Dubai", value: 78 },
      { query: "Paris", value: 60 },
    ]);
    expect(result.timeline_data[1].values[0]).toMatchObject({
      query: "Dubai",
      value: "84",
      extracted_value: 84,
    });
  });

  it("returns empty for a missing payload", () => {
    expect(normalizeSerpApiResponse("TIMESERIES", {})).toEqual({ empty: true });
  });
});

describe("normalize RELATED_QUERIES", () => {
  it("keeps rising/top items and non-numeric value text", () => {
    const result = normalizeRelatedQueries(relatedQueriesFixture);
    expect(result.rising[0]).toMatchObject({ query: "dubai expo", value: "+250%", extracted_value: 250 });
    expect(result.rising[1]).toMatchObject({ query: "dubai breakout term", value: "Breakout" });
    expect(result.rising[1].extracted_value).toBeUndefined();
    expect(result.top[0].extracted_value).toBe(100);
  });
});

describe("normalize RELATED_TOPICS", () => {
  it("keeps topic.value / title / type plus value fields", () => {
    const result = normalizeRelatedTopics(relatedTopicsFixture);
    expect(result.rising[0].topic).toEqual({ value: "/m/02cft", title: "Dubai", type: "City" });
    expect(result.rising[0].value).toBe("+80%");
    expect(result.top[0].extracted_value).toBe(100);
  });
});

describe("normalize GEO_MAP_0", () => {
  it("keeps geo, location, value, and extracted_value", () => {
    const result = normalizeInterestByRegion(geoMap0Fixture);
    expect(result.regions).toEqual([
      { geo: "US-NY", location: "New York", value: "100", extracted_value: 100 },
      { geo: "US-CA", location: "California", value: "74", extracted_value: 74 },
    ]);
  });
});

describe("SerpApi errors and rate limits", () => {
  it("reads the official error string", () => {
    expect(serpApiErrorMessage({ error: "Google hasn't returned any results for this query." })).toMatch(
      /hasn't returned/,
    );
  });

  it("maps 429 to a safe client message", () => {
    expect(publicHttpError(429)).toEqual({
      status: 429,
      error: "Trends are temporarily rate limited. Please try again later.",
    });
  });

  it("does not expose auth failures", () => {
    expect(publicHttpError(401).error).toBe("Trends service is not configured.");
  });
});

describe("cache helpers", () => {
  it("builds a stable cache key", () => {
    const a = buildCacheKey({ q: "Dubai", data_type: "TIMESERIES", geo: "us", date: "today 12-m" });
    const b = buildCacheKey({ q: "dubai", data_type: "TIMESERIES", geo: "US", date: "today 12-m" });
    expect(a).toBe(b);
  });

  it("treats a future expires_at as a cache hit", () => {
    const expires = new Date(Date.now() + 60_000).toISOString();
    expect(isCacheFresh(expires)).toBe(true);
  });

  it("treats a past expires_at as a cache miss / expired", () => {
    const expires = new Date(Date.now() - 60_000).toISOString();
    expect(isCacheFresh(expires)).toBe(false);
  });

  it("sets TIMESERIES TTL in the 6–24 hour window", () => {
    const now = Date.parse("2026-03-01T00:00:00.000Z");
    const expires = Date.parse(expiresAtFor("TIMESERIES", now));
    const hours = (expires - now) / 3_600_000;
    expect(hours).toBeGreaterThanOrEqual(6);
    expect(hours).toBeLessThanOrEqual(24);
  });
});

describe("destination scores", () => {
  it("uses only extracted_value from the timeline — never invented numbers", () => {
    const interest = normalizeInterestOverTime(timeseriesFixture);
    const scores = scoresFromTimeseries(interest, [
      { city: "Dubai", slug: "dubai", query: "Dubai" },
      { city: "Paris", slug: "paris", query: "Paris" },
      { city: "Bali", slug: "bali", query: "Bali" },
    ]);
    expect(scores).toEqual([
      {
        destination: "Dubai",
        slug: "dubai",
        query: "Dubai",
        trendScore: 84,
        previousScore: 72,
        direction: "up",
      },
      {
        destination: "Paris",
        slug: "paris",
        query: "Paris",
        trendScore: 60,
        previousScore: 60,
        direction: "stable",
      },
    ]);
  });

  it("classifies direction from actual score change", () => {
    expect(directionFromScores(84, 72)).toBe("up");
    expect(directionFromScores(50, 60)).toBe("down");
    expect(directionFromScores(60, 60)).toBe("stable");
  });
});

describe("SerpApi params", () => {
  it("never includes api_key and omits GEO-only fields on TIMESERIES", () => {
    const params = buildSerpApiSearchParams({
      q: "Dubai",
      data_type: "TIMESERIES",
      include_low_search_volume: true,
      region: "CITY",
    });
    expect(params.get("engine")).toBe("google_trends");
    expect(params.get("api_key")).toBeNull();
    expect(params.get("include_low_search_volume")).toBeNull();
    expect(params.get("region")).toBeNull();
  });
});

describe("data type guard", () => {
  it("accepts official SerpApi data types only", () => {
    expect(isGoogleTrendsDataType("GEO_MAP_0")).toBe(true);
    expect(isGoogleTrendsDataType("SEARCH_VOLUME")).toBe(false);
  });
});
