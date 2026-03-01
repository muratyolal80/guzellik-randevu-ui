-- =============================================================================
-- New-36-Marketplace-Best-Practices.sql
-- iyzico Webhook Auditing, Atomic Activation RPC and Usage Stats View
-- =============================================================================

-- 1. WEBHOOK AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.iyzico_webhooks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    iyzi_event_type text,
    payload jsonb NOT NULL,
    status text DEFAULT 'RECEIVED', -- RECEIVED, PROCESSED, ERROR
    error_message text,
    processed_at timestamptz,
    created_at timestamptz DEFAULT now()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_iyzico_webhooks_created_at ON public.iyzico_webhooks(created_at DESC);

-- 2. ATOMIC ACTIVATION RPC
-- This function ensures both salon and subscription are updated in a single transaction.
CREATE OR REPLACE FUNCTION public.activate_salon_and_subscription(
    p_salon_id uuid,
    p_subscription_id uuid,
    p_admin_note text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    -- 1. Activate Subscription
    UPDATE public.subscriptions
    SET 
        status = 'ACTIVE',
        updated_at = NOW()
    WHERE id = p_subscription_id;

    -- 2. Activate Salon
    UPDATE public.salons
    SET 
        status = 'APPROVED',
        is_verified = true,
        updated_at = NOW()
    WHERE id = p_salon_id;

    -- 3. Update Payment History status if applicable
    UPDATE public.payment_history
    SET 
        status = 'SUCCESS',
        metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{admin_note}', to_jsonb(p_admin_note))
    WHERE subscription_id = p_subscription_id AND status = 'PENDING';

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Activation failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. SALON USAGE STATISTICS VIEW
-- Centralized view to see usage vs limits for Dashboard Widgets
CREATE OR REPLACE VIEW public.salon_usage_stats AS
SELECT 
    s.id as salon_id,
    s.name as salon_name,
    sp.name as plan_name,
    sp.display_name as plan_display_name,
    -- Staff count
    (SELECT count(*) FROM public.staff WHERE salon_id = s.id AND is_active = true) as current_staff,
    sp.max_staff as limit_staff,
    -- branch count (if many-to-one exists or assumed 1 for now)
    1 as current_branches,
    sp.max_branches as limit_branches,
    -- Gallery count
    (SELECT count(*) FROM public.salon_gallery WHERE salon_id = s.id) as current_gallery_photos,
    sp.max_gallery_photos as limit_gallery_photos,
    -- Feature flags
    sp.has_advanced_reports,
    sp.has_campaigns,
    sp.has_sponsored,
    -- Sub status
    sub.status as subscription_status,
    sub.current_period_end as subscription_expires_at
FROM 
    public.salons s
JOIN 
    public.subscriptions sub ON sub.salon_id = s.id
JOIN 
    public.subscription_plans sp ON sub.plan_id = sp.id;

-- 4. Permissions
GRANT ALL ON public.iyzico_webhooks TO postgres;
GRANT ALL ON public.iyzico_webhooks TO service_role;
GRANT SELECT ON public.salon_usage_stats TO authenticated;
GRANT EXECUTE ON FUNCTION public.activate_salon_and_subscription TO service_role;
GRANT EXECUTE ON FUNCTION public.activate_salon_and_subscription TO authenticated; -- Authorized check should be in RLS or Service
