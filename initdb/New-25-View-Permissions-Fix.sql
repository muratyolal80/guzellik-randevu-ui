-- =============================================
-- New-25-View-Permissions-Fix.sql
-- Grant SELECT permissions to anon and authenticated roles for all views
-- This ensures the frontend can fetch data properly.
-- =============================================

-- 1. Grant permissions to existing views
GRANT SELECT ON public.salon_details TO anon, authenticated;
GRANT SELECT ON public.salon_details_with_membership TO anon, authenticated;
GRANT SELECT ON public.salon_service_details TO anon, authenticated;
GRANT SELECT ON public.verified_reviews_view TO anon, authenticated;
GRANT SELECT ON public.staff_reviews_detailed TO anon, authenticated;

-- 2. Ensure RLS doesn't block views (Views themselves don't have RLS, but the underlying tables do)
-- The underlying tables already have public read access in New-06-RLS-Policies.sql.

-- 3. Verify salon_details view includes status column for filtering
-- (Already handled in New-22)

-- 4. Fix any potential slug issues (Ensure slugs are lowercase)
UPDATE public.salons SET slug = LOWER(slug) WHERE slug IS NOT NULL;
