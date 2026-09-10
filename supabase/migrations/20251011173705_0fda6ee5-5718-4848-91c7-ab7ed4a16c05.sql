-- Fix function search path mutability for security
-- This sets a fixed search_path for all security-sensitive functions

ALTER FUNCTION public.is_admin() SET search_path = 'public';
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = 'public';
ALTER FUNCTION public.update_updated_at_column() SET search_path = 'public';