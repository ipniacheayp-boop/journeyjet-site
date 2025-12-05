-- Add performance indexes for deals table
CREATE INDEX IF NOT EXISTS idx_deals_price_usd ON public.deals(price_usd);
CREATE INDEX IF NOT EXISTS idx_deals_dest_code ON public.deals(dest_code);
CREATE INDEX IF NOT EXISTS idx_deals_origin_code ON public.deals(origin_code);
CREATE INDEX IF NOT EXISTS idx_deals_date_from ON public.deals(date_from);
CREATE INDEX IF NOT EXISTS idx_deals_featured ON public.deals(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_deals_published ON public.deals(published) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_deals_featured_created ON public.deals(featured DESC, created_at DESC) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_deals_price_published ON public.deals(price_usd ASC) WHERE published = true;

-- Add composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_deals_origin_dest_price ON public.deals(origin_code, dest_code, price_usd) WHERE published = true;