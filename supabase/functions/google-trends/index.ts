/// <reference path="../flights-search/deno-shim.d.ts" />
// @ts-expect-error TS2307 — Supabase Edge Functions run on Deno, not Vite.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-expect-error TS2307 — Deno remote import.
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { RELATIVE_INTEREST_NOTE, type GoogleTrendsRequest } from "../_shared/googleTrendsLogic.ts";
import { TRENDING_DESTINATIONS } from "../_shared/googleTrendsDestinations.ts";
import {
  resolveGoogleTrendsSearch,
  resolveTrendingDestinations,
  serpApiRequestUrl,
  type TrendsCacheEntry,
  type TrendsCacheStore,
} from "../_shared/googleTrendsServer.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SERPAPI_TIMEOUT_MS = 10_000;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function parseSearchRequest(body: Record<string, unknown>): Partial<GoogleTrendsRequest> {
  const includeLow = body.include_low_search_volume;
  return {
    q: typeof body.q === "string" ? body.q : "",
    data_type: body.data_type as GoogleTrendsRequest["data_type"],
    hl: optionalString(body.hl),
    geo: optionalString(body.geo),
    region: optionalString(body.region),
    date: optionalString(body.date),
    tz: body.tz === undefined || body.tz === null ? undefined : String(body.tz),
    cat: body.cat === undefined || body.cat === null ? undefined : String(body.cat),
    gprop: optionalString(body.gprop),
    include_low_search_volume: includeLow === true || includeLow === "true",
  };
}

function createCacheStore(supabase: SupabaseClient | null): TrendsCacheStore {
  return {
    async get(cacheKey: string) {
      if (!supabase) return null;
      const { data, error } = await supabase
        .from("google_trends_cache")
        .select("cache_key, query, data_type, geo, date_range, response_json, created_at, expires_at")
        .eq("cache_key", cacheKey)
        .maybeSingle();
      if (error || !data) return null;
      return data as TrendsCacheEntry;
    },
    async set(entry: TrendsCacheEntry) {
      if (!supabase) return;
      const { error } = await supabase.from("google_trends_cache").upsert(
        {
          cache_key: entry.cache_key,
          query: entry.query,
          data_type: entry.data_type,
          geo: entry.geo,
          date_range: entry.date_range,
          response_json: entry.response_json,
          created_at: entry.created_at,
          expires_at: entry.expires_at,
        },
        { onConflict: "cache_key" },
      );
      if (error) console.warn("[google-trends] cache write skipped:", error.message);
    },
  };
}

function createSupabase(): SupabaseClient | null {
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  return createClient(url, key);
}

async function fetchSerpApi(req: GoogleTrendsRequest) {
  const apiKey = Deno.env.get("SERPAPI_KEY");
  if (!apiKey) {
    console.error("[google-trends] SERPAPI_KEY is not set");
    return { status: 401, json: { error: "not configured" } };
  }

  const url = serpApiRequestUrl(req, apiKey);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SERPAPI_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    let parsed: unknown = null;
    try {
      parsed = await res.json();
    } catch {
      parsed = {};
    }
    return { status: res.status, json: parsed };
  } catch (error) {
    const aborted = controller.signal.aborted;
    if (aborted) return { status: 504, json: {}, timedOut: true };
    console.error("[google-trends] network error", error instanceof Error ? error.message : "unknown");
    return { status: 502, json: {}, timedOut: false };
  } finally {
    clearTimeout(timer);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ ok: false, error: "Method not allowed." }, 405);

  let body: Record<string, unknown> = {};
  try {
    const parsed = await req.json();
    body = asRecord(parsed) ?? {};
  } catch {
    return json({ ok: false, error: "Invalid JSON body." }, 400);
  }

  const cache = createCacheStore(createSupabase());
  const action = optionalString(body.action) ?? "search";

  try {
    if (action === "trending") {
      const result = await resolveTrendingDestinations(TRENDING_DESTINATIONS, {
        cache,
        fetchSerpApi,
        geo: optionalString(body.geo),
        date: optionalString(body.date),
      });
      if (!result.ok) {
        return json({ ok: false, error: result.error }, 502);
      }
      return json({
        ok: true,
        cached: result.cached,
        destinations: result.destinations,
        interestNote: RELATIVE_INTEREST_NOTE,
      });
    }

    if (action !== "search") {
      return json({ ok: false, error: "Unknown action." }, 400);
    }

    const result = await resolveGoogleTrendsSearch(parseSearchRequest(body), {
      cache,
      fetchSerpApi,
    });

    if (!result.ok) {
      return json({ ok: false, error: result.error }, result.status);
    }

    return json({
      ok: true,
      cached: result.cached,
      empty: result.empty,
      data_type: result.data_type,
      payload: result.payload,
      interestNote: RELATIVE_INTEREST_NOTE,
    });
  } catch (error) {
    console.error("[google-trends] unexpected error", error instanceof Error ? error.message : "unknown");
    return json({ ok: false, error: "Trends data could not be loaded." }, 502);
  }
});
