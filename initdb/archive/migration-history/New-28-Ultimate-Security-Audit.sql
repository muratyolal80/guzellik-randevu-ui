-- 1. ENUM & ROLE FIXES (Uyumsuzlukları Gider)
DO $$ 
BEGIN
    -- user_role enum'ına eksik rolleri ekle
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'SALON_OWNER' AND enumtypid = 'public.user_role'::regtype) THEN
        ALTER TYPE public.user_role ADD VALUE 'SALON_OWNER';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'OWNER' AND enumtypid = 'public.user_role'::regtype) THEN
        ALTER TYPE public.user_role ADD VALUE 'OWNER';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ADMIN' AND enumtypid = 'public.user_role'::regtype) THEN
        ALTER TYPE public.user_role ADD VALUE 'ADMIN';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'MANAGER' AND enumtypid = 'public.user_role'::regtype) THEN
        ALTER TYPE public.user_role ADD VALUE 'MANAGER';
    END IF;
END $$;

-- 2. MEVCUT POLİTİKALARI TEMİZLE (Tüm tablolar için)
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

-- 2. RLS AKTİF ETME (Tüm kritik tablolar)
DO $$ 
DECLARE t text;
    tables text[] := ARRAY[
        'profiles', 'salons', 'appointments', 'salon_services', 'staff', 
        'staff_services', 'reviews', 'notifications', 'invites', 
        'salon_working_hours', 'working_hours', 'salon_gallery', 
        'review_images', 'subscriptions', 'subscription_plans', 
        'payment_history', 'salon_assigned_types', 'cities', 
        'districts', 'salon_types', 'service_categories', 'global_services'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    END LOOP;
END $$;

-- =================================================================
-- ADMIN FULL ACCESS (Tüm tablolar için ortak mantık)
-- =================================================================

-- Admin kontrol fonksiyonu (Performans için bir kez tanımlanır)
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

-- Tüm tablolar için Admin politikalarını oluştur
DO $$ 
DECLARE t text;
    tables text[] := ARRAY[
        'profiles', 'salons', 'appointments', 'salon_services', 'staff', 
        'staff_services', 'reviews', 'notifications', 'invites', 
        'salon_working_hours', 'working_hours', 'salon_gallery', 
        'review_images', 'subscriptions', 'subscription_plans', 
        'payment_history', 'salon_assigned_types', 'cities', 
        'districts', 'salon_types', 'service_categories', 'global_services'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('
            CREATE POLICY "admin_all_%I" ON public.%I FOR ALL TO authenticated
            USING (public.is_admin(auth.uid()))
            WITH CHECK (public.is_admin(auth.uid()))', t, t);
    END LOOP;
END $$;

-- =================================================================
-- OZELLİKLİ TABLO POLİTİKALARI (Owner/Staff/Customer/Public)
-- =================================================================

-- PROFILES
CREATE POLICY "profiles_self" ON public.profiles FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- SALONS
CREATE POLICY "salons_public_select" ON public.salons FOR SELECT USING (status = 'APPROVED' OR owner_id = auth.uid());
CREATE POLICY "salons_owner_all" ON public.salons FOR ALL TO authenticated 
    USING (owner_id = auth.uid() OR public.is_admin(auth.uid())) 
    WITH CHECK (owner_id = auth.uid() OR public.is_admin(auth.uid()));

-- APPOINTMENTS
CREATE POLICY "appointments_owner_select" ON public.appointments FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid()) OR public.is_admin(auth.uid()));
CREATE POLICY "appointments_staff_select" ON public.appointments FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.staff WHERE id = staff_id AND user_id = auth.uid()));
CREATE POLICY "appointments_customer_all" ON public.appointments FOR ALL TO authenticated
    USING (customer_id = auth.uid()) WITH CHECK (customer_id = auth.uid());

-- SALON_SERVICES & STAFF_SERVICES
CREATE POLICY "salon_services_public_select" ON public.salon_services FOR SELECT USING (true);
CREATE POLICY "salon_services_owner_all" ON public.salon_services FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid()) OR public.is_admin(auth.uid()));

-- SUBSCRIPTIONS & PAYMENTS (Owner access)
CREATE POLICY "subscriptions_owner_select" ON public.subscriptions FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid()) OR public.is_admin(auth.uid()));
CREATE POLICY "payment_history_owner_select" ON public.payment_history FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid()) OR public.is_admin(auth.uid()));

-- MASTER DATA (Public Select)
CREATE POLICY "master_data_public_select_cities" ON public.cities FOR SELECT USING (true);
CREATE POLICY "master_data_public_select_districts" ON public.districts FOR SELECT USING (true);
CREATE POLICY "master_data_public_select_salon_types" ON public.salon_types FOR SELECT USING (true);
CREATE POLICY "master_data_public_select_categories" ON public.service_categories FOR SELECT USING (true);
CREATE POLICY "master_data_public_select_globals" ON public.global_services FOR SELECT USING (true);

-- =================================================================
-- AUDIT COMPLETE
-- =================================================================
