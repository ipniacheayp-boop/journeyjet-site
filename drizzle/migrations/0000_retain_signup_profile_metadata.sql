CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, name, email, profile_image, login_method, last_login, phone_number, country_code, marketing_sms_opt_in, marketing_sms_opt_in_at)
  VALUES (
    NEW.id,
    left(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'), 100),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    CASE WHEN NEW.raw_app_meta_data->>'provider' IN ('google', 'apple') THEN NEW.raw_app_meta_data->>'provider' ELSE 'email' END,
    now(),
    CASE WHEN NEW.raw_user_meta_data->>'phone_number' ~ '^[0-9]{6,15}$' THEN NEW.raw_user_meta_data->>'phone_number' ELSE NULL END,
    CASE WHEN NEW.raw_user_meta_data->>'country_code' ~ '^\+[0-9]{1,4}$' THEN NEW.raw_user_meta_data->>'country_code' ELSE NULL END,
    COALESCE(NEW.raw_user_meta_data->>'marketing_sms_opt_in' = 'true', false),
    CASE WHEN NEW.raw_user_meta_data->>'marketing_sms_opt_in' = 'true' THEN now() ELSE NULL END
  );
  RETURN NEW;
END;
$function$;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;