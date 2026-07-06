-- ============================================================
-- 1. bookings: prevent owners from tampering with payment/status fields
-- ============================================================
CREATE OR REPLACE FUNCTION public.prevent_booking_sensitive_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Service-role / edge functions (no JWT) and admins may change anything.
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  -- Regular authenticated owners may only change their contact details.
  IF NEW.status              IS DISTINCT FROM OLD.status
     OR NEW.amount           IS DISTINCT FROM OLD.amount
     OR NEW.currency         IS DISTINCT FROM OLD.currency
     OR NEW.payment_status   IS DISTINCT FROM OLD.payment_status
     OR NEW.payment_method   IS DISTINCT FROM OLD.payment_method
     OR NEW.payment_reference IS DISTINCT FROM OLD.payment_reference
     OR NEW.transaction_id   IS DISTINCT FROM OLD.transaction_id
     OR NEW.refund_status    IS DISTINCT FROM OLD.refund_status
     OR NEW.refund_amount    IS DISTINCT FROM OLD.refund_amount
     OR NEW.refund_reason    IS DISTINCT FROM OLD.refund_reason
     OR NEW.stripe_session_id        IS DISTINCT FROM OLD.stripe_session_id
     OR NEW.stripe_payment_intent_id IS DISTINCT FROM OLD.stripe_payment_intent_id
     OR NEW.amadeus_order_id IS DISTINCT FROM OLD.amadeus_order_id
     OR NEW.amadeus_pnr      IS DISTINCT FROM OLD.amadeus_pnr
     OR NEW.booking_type     IS DISTINCT FROM OLD.booking_type
     OR NEW.booking_details  IS DISTINCT FROM OLD.booking_details
     OR NEW.user_id          IS DISTINCT FROM OLD.user_id
     OR NEW.agent_id         IS DISTINCT FROM OLD.agent_id
     OR NEW.confirmed_at     IS DISTINCT FROM OLD.confirmed_at
     OR NEW.hold_expiry      IS DISTINCT FROM OLD.hold_expiry
     OR NEW.fare_validated_at IS DISTINCT FROM OLD.fare_validated_at
     OR NEW.ticket_issued_at IS DISTINCT FROM OLD.ticket_issued_at
  THEN
    RAISE EXCEPTION 'Only contact fields (name, email, phone) can be updated on your booking';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_booking_sensitive_update_trigger ON public.bookings;
CREATE TRIGGER prevent_booking_sensitive_update_trigger
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.prevent_booking_sensitive_update();

-- ============================================================
-- 2. chat_messages: force sender_type to match the caller's real role
-- ============================================================
CREATE OR REPLACE FUNCTION public.enforce_chat_sender_type()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_assigned_agent boolean;
BEGIN
  -- Service-role / edge functions (no JWT) may set any sender_type (e.g. 'system').
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.chat_conversations c
    JOIN public.agent_profiles ap ON ap.id = c.agent_id
    WHERE c.id = NEW.conversation_id
      AND ap.user_id = auth.uid()
  ) INTO is_assigned_agent;

  IF is_assigned_agent THEN
    NEW.sender_type := 'agent';
  ELSE
    NEW.sender_type := 'user';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_chat_sender_type_trigger ON public.chat_messages;
CREATE TRIGGER enforce_chat_sender_type_trigger
BEFORE INSERT ON public.chat_messages
FOR EACH ROW EXECUTE FUNCTION public.enforce_chat_sender_type();

-- ============================================================
-- 3. Lock down SECURITY DEFINER RLS helpers from anon / public
--    First scope admin policies to authenticated so anon never
--    evaluates has_role()/is_admin() during RLS checks.
-- ============================================================
ALTER POLICY "Admins can update commissions" ON public.agent_commissions TO authenticated;
ALTER POLICY "Admins can view all commissions" ON public.agent_commissions TO authenticated;
ALTER POLICY "Admins can update feedback" ON public.agent_feedback TO authenticated;
ALTER POLICY "Admins can view all feedback" ON public.agent_feedback TO authenticated;
ALTER POLICY "Admins can insert agent profiles" ON public.agent_profiles TO authenticated;
ALTER POLICY "Admins can update any agent profile" ON public.agent_profiles TO authenticated;
ALTER POLICY "Admins can view all agent profiles" ON public.agent_profiles TO authenticated;
ALTER POLICY "Admins can view all wallets" ON public.agent_wallet TO authenticated;
ALTER POLICY "Admins can view all conversations" ON public.chat_conversations TO authenticated;
ALTER POLICY "Admins can view all messages" ON public.chat_messages TO authenticated;
ALTER POLICY "Admins can delete deals" ON public.deals TO authenticated;
ALTER POLICY "Admins can insert deals" ON public.deals TO authenticated;
ALTER POLICY "Admins can update deals" ON public.deals TO authenticated;
ALTER POLICY "Admins can view all fx logs" ON public.fx_smart_save_logs TO authenticated;
ALTER POLICY "Admins can view all transactions" ON public.wallet_transactions TO authenticated;
ALTER POLICY "Admins can view webhook events" ON public.webhook_events TO authenticated;

-- Revoke direct EXECUTE from anon and PUBLIC; keep authenticated (required for
-- RLS policies scoped to authenticated) and service_role.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;