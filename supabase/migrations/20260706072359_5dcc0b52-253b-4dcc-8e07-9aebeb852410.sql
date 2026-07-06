REVOKE EXECUTE ON FUNCTION public.prevent_booking_sensitive_update() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.prevent_booking_sensitive_update() FROM anon;
REVOKE EXECUTE ON FUNCTION public.prevent_booking_sensitive_update() FROM authenticated;

REVOKE EXECUTE ON FUNCTION public.enforce_chat_sender_type() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enforce_chat_sender_type() FROM anon;
REVOKE EXECUTE ON FUNCTION public.enforce_chat_sender_type() FROM authenticated;