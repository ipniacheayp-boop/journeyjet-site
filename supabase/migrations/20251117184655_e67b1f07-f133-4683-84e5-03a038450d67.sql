-- Create deals table for production-ready deals management
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  origin_city TEXT NOT NULL,
  origin_code TEXT NOT NULL,
  dest_city TEXT NOT NULL,
  dest_code TEXT NOT NULL,
  airline TEXT NOT NULL,
  airline_code TEXT,
  class TEXT NOT NULL DEFAULT 'Economy',
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,
  price_usd DECIMAL(10,2) NOT NULL,
  original_price_usd DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  images JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  source TEXT,
  description TEXT,
  short_description TEXT,
  notes TEXT,
  views_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  bookings_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Public can view published deals
CREATE POLICY "Anyone can view published deals"
ON public.deals
FOR SELECT
USING (published = true);

-- Admins can manage all deals
CREATE POLICY "Admins can insert deals"
ON public.deals
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update deals"
ON public.deals
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete deals"
ON public.deals
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_deals_slug ON public.deals(slug);
CREATE INDEX IF NOT EXISTS idx_deals_published ON public.deals(published) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_deals_featured ON public.deals(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_deals_price ON public.deals(price_usd);
CREATE INDEX IF NOT EXISTS idx_deals_dates ON public.deals(date_from, date_to);
CREATE INDEX IF NOT EXISTS idx_deals_origin ON public.deals(origin_code);
CREATE INDEX IF NOT EXISTS idx_deals_dest ON public.deals(dest_code);
CREATE INDEX IF NOT EXISTS idx_deals_tags ON public.deals USING GIN(tags);

-- Create trigger to update updated_at
CREATE TRIGGER update_deals_updated_at
BEFORE UPDATE ON public.deals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();