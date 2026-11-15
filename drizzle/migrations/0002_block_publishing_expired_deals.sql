CREATE OR REPLACE FUNCTION public.prevent_expired_deal_activation()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE today date := (now() AT TIME ZONE 'UTC')::date;
BEGIN
  IF NEW.date_to < today THEN
    IF TG_OP = 'INSERT' AND (COALESCE(NEW.published,false) OR COALESCE(NEW.featured,false)) THEN
      RAISE EXCEPTION 'Cannot publish or feature a deal whose travel period ended on %', NEW.date_to;
    END IF;
    IF TG_OP = 'UPDATE' AND (
      (COALESCE(NEW.published,false) AND NOT COALESCE(OLD.published,false)) OR
      (COALESCE(NEW.featured,false) AND NOT COALESCE(OLD.featured,false))
    ) THEN
      RAISE EXCEPTION 'Cannot publish or feature a deal whose travel period ended on %', NEW.date_to;
    END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_prevent_expired_deal_activation ON public.deals;
CREATE TRIGGER trg_prevent_expired_deal_activation
BEFORE INSERT OR UPDATE ON public.deals
FOR EACH ROW EXECUTE FUNCTION public.prevent_expired_deal_activation();