DROP POLICY IF EXISTS "Authenticated users can view reviews" ON public.reviews;
CREATE POLICY "Users can view their own reviews" ON public.reviews FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));
DROP POLICY IF EXISTS "Anyone can view helpful votes" ON public.site_review_helpful;
CREATE POLICY "Users can view their own helpful votes" ON public.site_review_helpful FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Authenticated users can view agent availability" ON public.agent_availability;
CREATE POLICY "Agents and admins can view availability" ON public.agent_availability FOR SELECT TO authenticated USING (agent_id IN (SELECT id FROM public.agent_profiles WHERE user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role));