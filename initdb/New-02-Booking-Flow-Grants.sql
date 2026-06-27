-- New-02-Booking-Flow-Grants.sql
-- Grant access for booking flow tables and create missing views.

-- working_hours (public: via approved salon staff)
GRANT SELECT ON public.working_hours TO anon, authenticated;
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_working_hours" ON public.working_hours;
CREATE POLICY "public_read_working_hours" ON public.working_hours
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.staff st
      JOIN public.salons s ON s.id = st.salon_id
      WHERE st.id = working_hours.staff_id AND s.status = 'APPROVED'
    )
  );

-- appointments (authenticated: own / staff / owner)
GRANT SELECT, INSERT, UPDATE ON public.appointments TO authenticated;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_appointments" ON public.appointments;
CREATE POLICY "own_appointments" ON public.appointments
  FOR ALL USING (customer_id = auth.uid());
DROP POLICY IF EXISTS "staff_appointments" ON public.appointments;
CREATE POLICY "staff_appointments" ON public.appointments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.staff WHERE id = appointments.staff_id AND user_id = auth.uid())
  );
DROP POLICY IF EXISTS "owner_appointments" ON public.appointments;
CREATE POLICY "owner_appointments" ON public.appointments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.salons WHERE id = appointments.salon_id AND owner_id = auth.uid())
  );

-- reviews
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE ON public.reviews TO authenticated;
DROP POLICY IF EXISTS "customer_write_reviews" ON public.reviews;
CREATE POLICY "customer_write_reviews" ON public.reviews
  FOR INSERT WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "own_update_reviews" ON public.reviews;
CREATE POLICY "own_update_reviews" ON public.reviews
  FOR UPDATE USING (user_id = auth.uid());

-- subscription_plans (public)
GRANT SELECT ON public.subscription_plans TO anon, authenticated;

-- salon_resources (public: approved salons)
GRANT SELECT ON public.salon_resources TO anon, authenticated;
ALTER TABLE public.salon_resources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_resources" ON public.salon_resources;
CREATE POLICY "public_read_resources" ON public.salon_resources
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.salons WHERE id = salon_resources.salon_id AND status = 'APPROVED')
  );

-- verified_reviews_view
DROP VIEW IF EXISTS public.verified_reviews_view;
CREATE VIEW public.verified_reviews_view AS
SELECT r.id, r.salon_id, r.user_id, r.rating, r.comment, r.created_at,
       r.user_name, r.user_avatar, false AS is_verified
FROM public.reviews r;
GRANT SELECT ON public.verified_reviews_view TO anon, authenticated;

-- salon_service_details view (from archive/migration-history)
DROP VIEW IF EXISTS public.salon_service_details;
CREATE OR REPLACE VIEW public.salon_service_details AS
SELECT ss.id, ss.salon_id, ss.price, ss.duration_min,
    gs.name AS service_name,
    sc.name AS category_name, sc.icon AS category_icon, sc.slug AS category_slug,
    s.name AS salon_name
FROM public.salon_services ss
LEFT JOIN public.global_services gs ON gs.id = ss.global_service_id
LEFT JOIN public.service_categories sc ON sc.id = gs.category_id
JOIN public.salons s ON s.id = ss.salon_id;
GRANT SELECT ON public.salon_service_details TO anon, authenticated;
