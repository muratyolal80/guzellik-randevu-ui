-- New-01-Public-Grants-And-RLS.sql
-- Fix: Grant SELECT privileges to anon/authenticated roles on public lookup tables,
-- views, and enable RLS with correct policies on data tables.

-- ─── 1. LOOKUP TABLES (fully public, no RLS needed) ───────────────────────────
GRANT SELECT ON TABLE public.cities            TO anon, authenticated;
GRANT SELECT ON TABLE public.districts         TO anon, authenticated;
GRANT SELECT ON TABLE public.salon_types       TO anon, authenticated;
GRANT SELECT ON TABLE public.service_categories TO anon, authenticated;
GRANT SELECT ON TABLE public.global_services   TO anon, authenticated;

-- ─── 2. SALONS (public can only see APPROVED salons) ─────────────────────────
GRANT SELECT ON TABLE public.salons TO anon, authenticated;
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Access" ON public.salons;
CREATE POLICY "public_approved_salons" ON public.salons
  FOR SELECT USING (status = 'APPROVED');

CREATE POLICY "owner_all_own_salons" ON public.salons
  FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "admin_all_salons" ON public.salons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'ADMIN')
    )
  );

-- ─── 3. SALON SERVICES (public: approved salons only) ────────────────────────
GRANT SELECT ON TABLE public.salon_services TO anon, authenticated;
ALTER TABLE public.salon_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "public_read_salon_services" ON public.salon_services
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = salon_services.salon_id AND salons.status = 'APPROVED'
    )
  );

-- ─── 4. SALON WORKING HOURS (public) ─────────────────────────────────────────
GRANT SELECT ON TABLE public.salon_working_hours TO anon, authenticated;
ALTER TABLE public.salon_working_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "public_read_salon_working_hours" ON public.salon_working_hours
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = salon_working_hours.salon_id AND salons.status = 'APPROVED'
    )
  );

-- ─── 5. STAFF (public: approved salons only) ─────────────────────────────────
GRANT SELECT ON TABLE public.staff TO anon, authenticated;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "public_read_staff" ON public.staff
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = staff.salon_id AND salons.status = 'APPROVED'
    )
  );

-- ─── 6. REVIEWS (public: approved salons only) ───────────────────────────────
GRANT SELECT ON TABLE public.reviews TO anon, authenticated;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "public_read_reviews" ON public.reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = reviews.salon_id AND salons.status = 'APPROVED'
    )
  );

-- ─── 7. SALON GALLERY (public: approved salons only) ─────────────────────────
GRANT SELECT ON TABLE public.salon_gallery TO anon, authenticated;
ALTER TABLE public.salon_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "public_read_gallery" ON public.salon_gallery
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = salon_gallery.salon_id AND salons.status = 'APPROVED'
    )
  );

-- ─── 8. PROFILES (limited: only public salon owner profiles) ─────────────────
GRANT SELECT ON TABLE public.profiles TO authenticated;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "own_profile" ON public.profiles
  FOR ALL USING (id = auth.uid());

DROP POLICY IF EXISTS "public_owner_profiles" ON public.profiles;
CREATE POLICY "public_owner_profiles" ON public.profiles
  FOR SELECT USING (role = 'SALON_OWNER');

-- NOTE: No admin policy on profiles — admin panel uses supabaseAdmin (service role)
-- which bypasses RLS entirely. A self-referential profiles policy causes infinite recursion.

-- ─── 9. VIEWS ─────────────────────────────────────────────────────────────────
GRANT SELECT ON public.salon_details TO anon, authenticated;
GRANT SELECT ON public.salon_ratings TO anon, authenticated;

-- ─── 10. SALONS — corrected policies (no self-referential admin check) ────────
DROP POLICY IF EXISTS "admin_all_salons" ON public.salons;
DROP POLICY IF EXISTS "owner_all_own_salons" ON public.salons;

DROP POLICY IF EXISTS "owner_read_own_salons" ON public.salons;
CREATE POLICY "owner_read_own_salons" ON public.salons
  FOR SELECT USING (owner_id = auth.uid() OR status = 'APPROVED');

DROP POLICY IF EXISTS "owner_write_own_salons" ON public.salons;
CREATE POLICY "owner_write_own_salons" ON public.salons
  FOR ALL USING (owner_id = auth.uid());
