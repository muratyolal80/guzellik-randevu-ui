-- Migration: Final UI Integration adjustments
-- Purpose: Expose category icons in the services view for dynamic UI rendering

DROP VIEW IF EXISTS public.salon_service_details CASCADE;

CREATE OR REPLACE VIEW public.salon_service_details WITH (security_invoker = on) AS
SELECT
    ss.id,
    ss.salon_id,
    ss.duration_min,
    ss.price,
    gs.name AS service_name,
    sc.name AS category_name,
    sc.slug AS category_slug,
    sc.icon AS category_icon, -- Added this to support dynamic icons
    s.name AS salon_name
FROM public.salon_services ss
         JOIN public.global_services gs ON ss.global_service_id = gs.id
         JOIN public.service_categories sc ON gs.category_id = sc.id
         JOIN public.salons s ON ss.salon_id = s.id;
