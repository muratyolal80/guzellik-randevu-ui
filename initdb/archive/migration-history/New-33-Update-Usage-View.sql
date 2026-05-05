-- =============================================
-- New-33-Update-Usage-View.sql
-- Updates salon_usage_stats to be Owner-aware.
-- =============================================

CREATE OR REPLACE VIEW public.salon_usage_stats AS
WITH owner_salon_counts AS (
    SELECT 
        owner_id, 
        COUNT(id) as total_branches
    FROM public.salons
    WHERE status != 'DELETED'
    GROUP BY owner_id
),
latest_owner_subs AS (
    SELECT DISTINCT ON (COALESCE(sub.owner_id, s.owner_id))
        sub.id,
        COALESCE(sub.owner_id, s.owner_id) as owner_id,
        sub.plan_id,
        sub.status,
        sub.current_period_end
    FROM public.subscriptions sub
    LEFT JOIN public.salons s ON sub.salon_id = s.id
    ORDER BY COALESCE(sub.owner_id, s.owner_id), sub.created_at DESC
)
SELECT 
    s.id as salon_id,
    s.name as salon_name,
    COALESCE(sp.name, 'STARTER') as plan_name,
    COALESCE(sp.display_name, 'Başlangıç') as plan_display_name,
    -- Staff count (still per salon)
    (SELECT count(*) FROM public.staff WHERE salon_id = s.id AND is_active = true) as current_staff,
    COALESCE(sp.max_staff, 3) as limit_staff,
    -- Branch count (Total for the owner)
    osc.total_branches as current_branches,
    COALESCE(sp.max_branches, 1) as limit_branches,
    -- Gallery count (per salon)
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
    owner_salon_counts osc ON osc.owner_id = s.owner_id
LEFT JOIN 
    latest_owner_subs sub ON sub.owner_id = s.owner_id
LEFT JOIN 
    public.subscription_plans sp ON sub.plan_id = sp.id;

GRANT SELECT ON public.salon_usage_stats TO authenticated;
GRANT SELECT ON public.salon_usage_stats TO service_role;
