-- 1. bookings: restrict UPDATE to contact columns only (prevent overwriting payment/status/PNR)
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;

REVOKE UPDATE ON public.bookings FROM anon;
REVOKE UPDATE ON public.bookings FROM authenticated;
GRANT UPDATE (contact_email, contact_name, contact_phone) ON public.bookings TO authenticated;

CREATE POLICY "Users can update their own booking contact info"
ON public.bookings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. fx_rates_cache: only service_role may write; public keeps read-only
DROP POLICY IF EXISTS "Service role can manage fx rates" ON public.fx_rates_cache;

REVOKE INSERT, UPDATE, DELETE ON public.fx_rates_cache FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.fx_rates_cache FROM authenticated;

CREATE POLICY "Service role can manage fx rates"
ON public.fx_rates_cache
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3. fx_smart_save_logs: only service_role may insert
DROP POLICY IF EXISTS "Service role can insert fx logs" ON public.fx_smart_save_logs;

REVOKE INSERT, UPDATE, DELETE ON public.fx_smart_save_logs FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.fx_smart_save_logs FROM authenticated;

CREATE POLICY "Service role can insert fx logs"
ON public.fx_smart_save_logs
FOR INSERT
TO service_role
WITH CHECK (true);