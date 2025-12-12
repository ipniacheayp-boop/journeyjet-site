-- FX-SmartSave Module Tables
-- Table for logging SmartSave recommendations and usage
CREATE TABLE IF NOT EXISTS public.fx_smart_save_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    product_type TEXT NOT NULL CHECK (product_type IN ('flight', 'hotel', 'car')),
    original_currency VARCHAR(3) NOT NULL,
    original_amount DECIMAL(12, 2) NOT NULL,
    recommended_currency VARCHAR(3) NOT NULL,
    recommended_amount DECIMAL(12, 2) NOT NULL,
    savings_usd DECIMAL(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for caching FX rates
CREATE TABLE IF NOT EXISTS public.fx_rates_cache (
    currency VARCHAR(3) PRIMARY KEY,
    rate DECIMAL(18, 8) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fx_smart_save_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fx_rates_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fx_smart_save_logs
CREATE POLICY "Admins can view all fx logs"
ON public.fx_smart_save_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can insert fx logs"
ON public.fx_smart_save_logs
FOR INSERT
WITH CHECK (true);

-- RLS Policies for fx_rates_cache (public read for FX rates)
CREATE POLICY "Anyone can view fx rates"
ON public.fx_rates_cache
FOR SELECT
USING (true);

CREATE POLICY "Service role can manage fx rates"
ON public.fx_rates_cache
FOR ALL
USING (true);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_fx_logs_created_at ON public.fx_smart_save_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fx_logs_product_type ON public.fx_smart_save_logs(product_type);
CREATE INDEX IF NOT EXISTS idx_fx_rates_updated_at ON public.fx_rates_cache(updated_at);