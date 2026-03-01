-- Description: Subscription Expiry Handler
-- This script creates a function to check and expire subscriptions that have passed their end date.
-- It also updates the salon status to 'PASSED_DUE' or similar if needed.

-- 1. Create function to check and expire subscriptions
CREATE OR REPLACE FUNCTION public.check_expired_subscriptions()
RETURNS void AS $$
BEGIN
    -- Update subscriptions that are past their period end and still ACTIVE
    UPDATE public.subscriptions
    SET status = 'EXPIRED',
        updated_at = NOW()
    WHERE status = 'ACTIVE'
    AND current_period_end < NOW();

    -- Assuming salons should be suspended when they don't have an active sub
    UPDATE public.salons
    SET status = 'SUSPENDED'
    FROM public.subscriptions s
    WHERE s.salon_id = public.salons.id
    AND s.status = 'EXPIRED'
    AND public.salons.status = 'APPROVED';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Grant permissions (Adjust as needed for your cron runner)
GRANT EXECUTE ON FUNCTION public.check_expired_subscriptions() TO postgres;
GRANT EXECUTE ON FUNCTION public.check_expired_subscriptions() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_expired_subscriptions() TO service_role;

-- NOTE: Since Supabase doesn't support built-in pg_cron on free tier easily,
-- this function can be called via an Edge Function Cron or a Database Webhook Trigger.
-- Alternatively, if we want to check ON-THE-FLY when a salon is accessed:

CREATE OR REPLACE FUNCTION public.auto_expire_on_access()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'ACTIVE' AND OLD.current_period_end < NOW() THEN
        NEW.status := 'EXPIRED';
        NEW.updated_at := NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_auto_expire_subscription ON public.subscriptions;
CREATE TRIGGER tr_auto_expire_subscription
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_expire_on_access();
