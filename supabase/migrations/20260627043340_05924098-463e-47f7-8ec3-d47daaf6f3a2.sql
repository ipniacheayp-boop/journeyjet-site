-- ── 1. agent_availability: stop exposing agent presence to anonymous users ──
DROP POLICY IF EXISTS "Anyone can view agent availability" ON public.agent_availability;
CREATE POLICY "Authenticated users can view agent availability"
ON public.agent_availability
FOR SELECT
TO authenticated
USING (true);

-- ── 2. reviews: stop exposing booking_id / user_id via the public Data API ──
-- Public review display is served through the service-role `reviews-get` edge function.
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
CREATE POLICY "Authenticated users can view reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (true);

-- ── 3. Lock down SECURITY DEFINER trigger helper functions ──
-- These are only ever invoked by triggers (which run regardless of caller EXECUTE
-- privilege); they should never be directly callable by clients.
-- NOTE: public.has_role() and public.is_admin() are intentionally left executable
-- because PostgreSQL evaluates RLS policy expressions with the privileges of the
-- querying role, so revoking EXECUTE would break every admin/owner RLS policy.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_last_login() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_conversation_timestamp() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_agent_clients_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- ── 4. Remove redundant always-true ("USING (true)") RLS policies ──
-- service_role has BYPASSRLS, so these policies grant nothing extra and only
-- trip the permissive-policy linter. Writes from edge functions continue to work.
DROP POLICY IF EXISTS "Service role can manage fx rates" ON public.fx_rates_cache;
DROP POLICY IF EXISTS "Service role can insert fx logs" ON public.fx_smart_save_logs;