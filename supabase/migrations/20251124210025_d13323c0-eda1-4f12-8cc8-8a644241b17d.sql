-- Add demo column to site_reviews table
ALTER TABLE public.site_reviews 
ADD COLUMN IF NOT EXISTS demo boolean NOT NULL DEFAULT false;

-- Add reviewer_name, country, booking_type, and travel_route columns for demo reviews
ALTER TABLE public.site_reviews 
ADD COLUMN IF NOT EXISTS reviewer_name text,
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS booking_type text,
ADD COLUMN IF NOT EXISTS travel_route text;

-- Create a settings table for admin configurations
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on admin_settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view and modify settings
CREATE POLICY "Admins can view all settings"
ON public.admin_settings
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert settings"
ON public.admin_settings
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update settings"
ON public.admin_settings
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Insert default setting for demo reviews (disabled by default)
INSERT INTO public.admin_settings (key, value)
VALUES ('show_demo_reviews', '{"enabled": false}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Add trigger for updated_at
CREATE TRIGGER update_admin_settings_updated_at
BEFORE UPDATE ON public.admin_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();