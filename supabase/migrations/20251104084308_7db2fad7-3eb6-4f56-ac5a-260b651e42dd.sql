-- Add RLS policy for agents to view their assigned bookings
CREATE POLICY "Agents can view their assigned bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (
  agent_id IN (
    SELECT id FROM public.agent_profiles
    WHERE user_id = auth.uid()
  )
);