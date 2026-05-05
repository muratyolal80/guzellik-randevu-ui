-- =============================================
-- New-21-Fix-Usage-Stats-View.sql
-- Fixes salon_usage_stats to show limits even for passive/expired salons
-- =============================================

CREATE OR REPLACE VIEW public.salon_usage_stats AS
WITH latest_subs AS (
    SELECT DISTINCT ON (salon_id)
        id,
        salon_id,
        plan_id,
        status,
        current_period_end
    FROM public.subscriptions
    ORDER BY salon_id, created_at DESC
)
SELECT 
    s.id as salon_id,
    s.name as salon_name,
    COALESCE(sp.name, 'STARTER') as plan_name,
    COALESCE(sp.display_name, 'Başlangıç') as plan_display_name,
    -- Staff count
    (SELECT count(*) FROM public.staff WHERE salon_id = s.id AND is_active = true) as current_staff,
    COALESCE(sp.max_staff, 3) as limit_staff,
    -- branch count
    1 as current_branches,
    COALESCE(sp.max_branches, 1) as limit_branches,
    -- Gallery count
    (SELECT count(*) FROM public.salon_gallery WHERE salon_id = s.id) as current_gallery_photos,
    COALESCE(sp.max_gallery_photos, 3) as limit_gallery_photos,
    -- Feature flags
    COALESCE(sp.has_advanced_reports, false) as has_advanced_reports,
    COALESCE(sp.has_campaigns, false) as has_campaigns,
    COALESCE(sp.has_sponsored, false) as has_sponsored,
    -- Sub status
    sub.status as subscription_status,
    sub.current_period_end as subscription_expires_at
FROM 
    public.salons s
LEFT JOIN 
    latest_subs sub ON sub.salon_id = s.id
LEFT JOIN 
    public.subscription_plans sp ON sub.plan_id = sp.id;

-- Ensure permissions are maintained
GRANT SELECT ON public.salon_usage_stats TO authenticated;
GRANT SELECT ON public.salon_usage_stats TO service_role;
