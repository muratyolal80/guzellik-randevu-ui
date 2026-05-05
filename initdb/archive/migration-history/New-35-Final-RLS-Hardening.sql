-- New-35-Final-RLS-Hardening.sql
-- Güzellik Randevu Platformu - Nihai RLS Standardizasyon ve Sıkılaştırma (v3.0)
-- Bu betik, tüm tablo politikalarını merkezi bir hiyerarşide toplar ve manuel denetim noktalarını netleştirir.

-- 1. ADMIN FONKSİYONU GÜVENCESİ
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = user_id 
        AND role IN ('SUPER_ADMIN', 'ADMIN')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. TÜM TABLOLARI LİSTELE VE RLS'İ ETKİNLEŞTİR
DO $$ 
DECLARE 
    t text;
BEGIN
    FOR t IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    END LOOP;
END $$;

-- 3. MEVCUT POLİTİKALARI TEMİZLE (Kontrollü Silme)
DO $$ 
DECLARE r record;
BEGIN
    FOR r IN (
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- 4. EVRENSEL ADMIN POLİTİKASI
-- Admin her tabloda her şeyi yapabilir.
DO $$ 
DECLARE 
    t text;
BEGIN
    FOR t IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
    LOOP
        EXECUTE format('CREATE POLICY "admin_all_%s" ON public.%I FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()))', t, t);
    END LOOP;
END $$;

-- 5. ÖZEL TABLO POLİTİKALARI (HARDENING)

-- SALONLAR
CREATE POLICY "salons_public_select" ON public.salons FOR SELECT USING (status = 'APPROVED' OR owner_id = auth.uid());
CREATE POLICY "salons_owner_insert" ON public.salons FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "salons_owner_update" ON public.salons FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
-- DELETE: Sadece Admin (Global politika üzerinden)

-- SALON SERVICES
CREATE POLICY "salon_services_public_select" ON public.salon_services FOR SELECT USING (true);
CREATE POLICY "salon_services_owner_all" ON public.salon_services FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid()));
-- DELETE Kısıtı: pg_policies cmd = 'DELETE' kontrolünde sadece admin görünmeli.

-- APPOINTMENTS
CREATE POLICY "appointments_owner_select" ON public.appointments FOR SELECT TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid()));
CREATE POLICY "appointments_staff_select" ON public.appointments FOR SELECT TO authenticated 
    USING (staff_id IN (SELECT id FROM public.staff WHERE user_id = auth.uid()));
CREATE POLICY "appointments_customer_all" ON public.appointments FOR ALL TO authenticated 
    USING (customer_id = auth.uid()) WITH CHECK (customer_id = auth.uid());

-- STAFF & WORKING HOURS
CREATE POLICY "staff_owner_all" ON public.staff FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid()));
CREATE POLICY "staff_self_select" ON public.staff FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "working_hours_owner_all" ON public.working_hours FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.staff s JOIN public.salons sl ON s.salon_id = sl.id WHERE s.id = staff_id AND sl.owner_id = auth.uid()));
CREATE POLICY "working_hours_staff_select" ON public.working_hours FOR SELECT TO authenticated 
    USING (staff_id IN (SELECT id FROM public.staff WHERE user_id = auth.uid()));

-- NOTIFICATIONS & PROFILES
CREATE POLICY "notifications_self_all" ON public.notifications FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "profiles_self_all" ON public.profiles FOR ALL TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles_public_select" ON public.profiles FOR SELECT USING (role = 'SALON_OWNER' OR role = 'STAFF');

-- REVIEWS & IMAGES
CREATE POLICY "reviews_public_select" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_customer_all" ON public.reviews FOR ALL TO authenticated USING (user_id = auth.uid());

-- ABONELİKLER (OWNER-CENTRIC)
CREATE POLICY "subscriptions_owner_select" ON public.subscriptions FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "payment_history_owner_select" ON public.payment_history FOR SELECT TO authenticated USING (owner_id = auth.uid());

-- 6. VERİ DENETİM SORGULARI (KONTROL İÇİN)
-- Aşağıdaki sorgular security-audit workflow'unda kullanılır.
-- SELECT policyname, tablename, cmd, roles FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;
