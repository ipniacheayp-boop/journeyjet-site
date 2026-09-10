# Google Trends integration

Tripile uses [SerpApi Google Trends](https://serpapi.com/google-trends-api) to show **relative travel interest** for existing destinations. Scores are used for ranking and a small UI — they never create SEO URLs.

Google Trends values are **relative interest** (typically 0–100 for the selected query set and date range). They are **not** absolute search volume.

## How a request flows

1. The browser calls the `google-trends` Supabase Edge Function (`src/services/googleTrends.ts` → `invokeSupabaseFunction`).
2. The Edge Function checks `google_trends_cache`.
3. On a miss or expired row it calls `https://serpapi.com/search.json?engine=google_trends` with the server-side `SERPAPI_KEY`.
4. The response is normalized from official SerpApi fields only, cached, and returned.

The browser never talks to SerpApi. `SERPAPI_KEY` must not appear in `src/`, `public/`, Vite `VITE_*` variables, or committed files.

## Supported `data_type` values

Official SerpApi types only:

| `data_type` | Queries | Normalized payload |
| --- | --- | --- |
| `TIMESERIES` | 1–5 | `interest_over_time.timeline_data`, `averages` |
| `GEO_MAP` | 2–5 | `compared_breakdown_by_region` |
| `GEO_MAP_0` | exactly 1 | `interest_by_region` |
| `RELATED_QUERIES` | exactly 1 | `related_queries.rising` / `top` (`query`, `value`, `extracted_value`, `link`) |
| `RELATED_TOPICS` | exactly 1 | `related_topics.rising` / `top` (`topic.value/title/type`, `value`, `extracted_value`) |

`value` may be `"100"`, `"+250%"`, or `"Breakout"`. `extracted_value` is numeric when SerpApi provides it. Destination scores use `extracted_value` only — they are never invented.

Optional SerpApi params forwarded when valid: `q`, `hl`, `geo`, `region`, `date`, `tz`, `cat`, `gprop`, `include_low_search_volume`.

## Client functions

`src/services/googleTrends.ts`:

- `getInterestOverTime()`
- `getInterestByRegion()` (`GEO_MAP_0`)
- `getComparedBreakdownByRegion()` (`GEO_MAP`)
- `getRelatedQueries()`
- `getRelatedTopics()`
- `getTrendingDestinations()`

In-flight requests are deduped. Successful payloads are remembered in the tab for 10 minutes so Explore and destination pages do not refetch on every navigation.

## Trending destinations

The curated list lives in `src/data/googleTrendsDestinations.ts` and must match existing `popularDestinations` slugs that already have `/flights-to/:slug` pages:

Dubai, Paris, London, New York, Tokyo, Singapore, Bangkok, Barcelona.

Query = the canonical city name. `" travel"` is not appended. Bali and Maldives are omitted because they have no dedicated Tripile landing pages.

Related Trends queries are **not** turned into sitemap or SEO routes.

## Caching

Table `google_trends_cache` (migration `20260911000000_google_trends_cache.sql`):

- Unique `cache_key`
- Indexes on `expires_at` and `(data_type, query, expires_at)`
- RLS enabled; `anon` / `authenticated` have no access
- Writes use the service role from the Edge Function

TTL:

- `TIMESERIES`: 12 hours (inside the 6–24h window)
- `GEO_MAP`, `GEO_MAP_0`, `RELATED_QUERIES`, `RELATED_TOPICS`: 18 hours (inside the 12–24h window)

A 429 or timeout reuses a stale cached row when one exists.

## Environment

This repo already uses `SERPAPI_KEY` for `flights-search` and `flight-status`. Reuse that secret.

**Local**

```bash
supabase secrets set --local SERPAPI_KEY=your_key
supabase functions serve google-trends
```

**Production**

```bash
supabase db push
# or apply supabase/migrations/20260911000000_google_trends_cache.sql in the SQL editor
supabase secrets set SERPAPI_KEY=your_key
supabase functions deploy google-trends
```

Confirm `SERPAPI_KEY` is set in Supabase → Project Settings → Edge Functions → Secrets. Do not put the key in `.env` as `VITE_SERPAPI_KEY`.

## Testing locally

```bash
bunx vitest run src/lib/googleTrendsLogic.test.ts src/lib/googleTrendsServer.test.ts
```

Tests mock SerpApi. They must not consume real searches.

## UI

- `src/components/trends/TrendingDestinations.tsx` on Explore
- `src/components/trends/DestinationTravelInterest.tsx` on curated `/flights-to/:slug` pages only

If SerpApi, cache, or the Edge Function fails, those widgets stay quiet. The rest of Tripile keeps working.
