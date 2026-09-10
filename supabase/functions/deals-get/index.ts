import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Cache-Control': 'public, max-age=600, s-maxage=600', // 10 minute browser/CDN cache
  'Content-Encoding': 'gzip',
};

interface DealsQuery {
  origin?: string;
  dest?: string;
  min_price?: number;
  max_price?: number;
  date_from?: string;
  date_to?: string;
  airline?: string;
  tags?: string;
  page?: number;
  limit?: number;
  sort?: string;
  featured?: boolean;
}

// In-memory cache for edge function
interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const getCacheKey = (params: DealsQuery): string => {
  return JSON.stringify(params);
};

const getCachedData = (key: string): any | null => {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  cache.delete(key);
  return null;
};

const setCachedData = (key: string, data: any): void => {
  // Limit cache size to prevent memory issues
  if (cache.size > 100) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, { data, timestamp: Date.now() });
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const params: DealsQuery = {
      origin: url.searchParams.get('origin') || undefined,
      dest: url.searchParams.get('dest') || undefined,
      min_price: url.searchParams.get('min_price') ? Number(url.searchParams.get('min_price')) : undefined,
      max_price: url.searchParams.get('max_price') ? Number(url.searchParams.get('max_price')) : undefined,
      date_from: url.searchParams.get('date_from') || undefined,
      date_to: url.searchParams.get('date_to') || undefined,
      airline: url.searchParams.get('airline') || undefined,
      tags: url.searchParams.get('tags') || undefined,
      page: url.searchParams.get('page') ? Number(url.searchParams.get('page')) : 1,
      limit: url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : 12,
      sort: url.searchParams.get('sort') || 'featured',
      featured: url.searchParams.get('featured') === 'true' ? true : undefined,
    };

    const cacheKey = getCacheKey(params);
    const skipCache = url.searchParams.get('refresh') === 'true';

    // Check cache first (instant response)
    if (!skipCache) {
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        console.log(`[deals-get] Cache hit, returning in ${Date.now() - startTime}ms`);
        return new Response(
          JSON.stringify({ ...cachedData, fromCache: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Optimized query - only select needed fields for list view
    let query = supabase
      .from('deals')
      .select(`
        id,
        slug,
        title,
        origin_city,
        origin_code,
        dest_city,
        dest_code,
        airline,
        airline_code,
        class,
        date_from,
        date_to,
        price_usd,
        original_price_usd,
        currency,
        images,
        tags,
        featured,
        short_description
      `, { count: 'exact' })
      .eq('published', true);

    // Apply filters
    if (params.origin) {
      query = query.ilike('origin_code', `%${params.origin}%`);
    }
    if (params.dest) {
      query = query.ilike('dest_code', `%${params.dest}%`);
    }
    if (params.min_price) {
      query = query.gte('price_usd', params.min_price);
    }
    if (params.max_price) {
      query = query.lte('price_usd', params.max_price);
    }
    if (params.date_from) {
      query = query.gte('date_from', params.date_from);
    }
    if (params.date_to) {
      query = query.lte('date_to', params.date_to);
    }
    if (params.airline) {
      query = query.ilike('airline', `%${params.airline}%`);
    }
    if (params.tags) {
      const tagArray = params.tags.split(',').map(t => t.trim());
      query = query.contains('tags', tagArray);
    }
    if (params.featured) {
      query = query.eq('featured', true);
    }

    // Apply sorting (using indexed columns for speed)
    switch (params.sort) {
      case 'price_asc':
        query = query.order('price_usd', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price_usd', { ascending: false });
        break;
      case 'date':
        query = query.order('date_from', { ascending: true });
        break;
      case 'popularity':
        query = query.order('views_count', { ascending: false, nullsFirst: false });
        break;
      case 'featured':
      default:
        query = query.order('featured', { ascending: false }).order('created_at', { ascending: false });
        break;
    }

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 12;
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('[deals-get] Error fetching deals:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = {
      deals: data,
      total: count || 0,
      page: page,
      limit: limit,
      total_pages: Math.ceil((count || 0) / limit),
      fromCache: false,
    };

    // Cache the response
    setCachedData(cacheKey, response);

    console.log(`[deals-get] Fetched ${data?.length || 0} deals in ${Date.now() - startTime}ms`);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[deals-get] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
