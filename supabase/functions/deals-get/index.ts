import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.74.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

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

    let query = supabase
      .from('deals')
      .select('*', { count: 'exact' })
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

    // Apply sorting
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
        query = query.order('views_count', { ascending: false });
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
      console.error('Error fetching deals:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        deals: data,
        total: count || 0,
        page: page,
        limit: limit,
        total_pages: Math.ceil((count || 0) / limit),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});