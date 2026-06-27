-- =================================================================
-- New-26-RLS-Master-Audit.sql
-- Rol Tabanlı Erişim Denetimi (RBAC) Tam RLS Politika Yeniden Yapılandırması
-- Bu script, Admin/Owner/Staff/Customer/Anonim için tüm politikaları sıfırlayıp
-- doğru şekilde kurar.
-- =================================================================

-- 1. RLS'nin tüm kritik tablolarda aktif olduğundan emin ol
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- 2. Mevcut politikaları temizle (tekrar çalıştırmak için idempotent)
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

-- =================================================================
-- PROFILES TABLOSU
-- =================================================================

-- Admin: Her şeyi görebilir, güncelleyebilir
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL TO authenticated
    USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'SUPER_ADMIN'
    )
    WITH CHECK (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'SUPER_ADMIN'
    );

-- Kullanıcılar: Kendi profillerini görür ve günceller
CREATE POLICY "profiles_self_select" ON public.profiles FOR SELECT TO authenticated
    USING ( id = auth.uid() );

CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated
    USING ( id = auth.uid() )
    WITH CHECK ( id = auth.uid() );

-- =================================================================
-- SALONS TABLOSU
-- =================================================================

-- Admin: Tam erişim
CREATE POLICY "salons_admin_all" ON public.salons FOR ALL TO authenticated
    USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'SUPER_ADMIN' )
    WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'SUPER_ADMIN' );

-- Owner: Kendi salonlarını yönetir (oluşturma, güncelleme). Sileemez.
CREATE POLICY "salons_owner_select" ON public.salons FOR SELECT TO authenticated
    USING ( owner_id = auth.uid() );

CREATE POLICY "salons_owner_insert" ON public.salons FOR INSERT TO authenticated
    WITH CHECK ( owner_id = auth.uid() );

CREATE POLICY "salons_owner_update" ON public.salons FOR UPDATE TO authenticated
    USING ( owner_id = auth.uid() )
    WITH CHECK ( owner_id = auth.uid() );

-- Herkese açık: Sadece APPROVED salonları görüntüle (giriş yapmamış)
CREATE POLICY "salons_public_select" ON public.salons FOR SELECT TO anon
    USING ( status = 'APPROVED' );

-- Giriş yapmış müşteriler de görebilir
CREATE POLICY "salons_authenticated_select" ON public.salons FOR SELECT TO authenticated
    USING ( status = 'APPROVED' );

-- =================================================================
-- APPOINTMENTS TABLOSU
-- =================================================================

-- Admin: Tam erişim
CREATE POLICY "appointments_admin_all" ON public.appointments FOR ALL TO authenticated
    USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'SUPER_ADMIN' )
    WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'SUPER_ADMIN' );

-- Owner: Kendi salonuna ait randevuları görüntüler
CREATE POLICY "appointments_owner_select" ON public.appointments FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.salons
            WHERE id = public.appointments.salon_id
            AND owner_id = auth.uid()
        )
    );

-- Staff: Kendisine atanan randevuları görüp güncelleyebilir
CREATE POLICY "appointments_staff_select" ON public.appointments FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.staff
            WHERE id = public.appointments.staff_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "appointments_staff_update" ON public.appointments FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.staff
            WHERE id = public.appointments.staff_id
            AND user_id = auth.uid()
        )
    );

-- Customer: Kendi randevularını görür, düzenler, oluşturur
CREATE POLICY "appointments_customer_all" ON public.appointments FOR ALL TO authenticated
    USING ( customer_id = auth.uid() )
    WITH CHECK ( customer_id = auth.uid() );

-- Anonim: Randevu oluşturabilir
CREATE POLICY "appointments_anon_insert" ON public.appointments FOR INSERT TO anon
    WITH CHECK ( true );

-- =================================================================
-- SALON_SERVICES TABLOSU
-- =================================================================

-- Admin: Tam erişim
CREATE POLICY "salon_services_admin_all" ON public.salon_services FOR ALL TO authenticated
    USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'SUPER_ADMIN' )
    WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'SUPER_ADMIN' );

-- Owner: Kendi salonunun hizmetlerini yönetir
CREATE POLICY "salon_services_owner_all" ON public.salon_services FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.salons
            WHERE id = public.salon_services.salon_id
            AND owner_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.salons
            WHERE id = public.salon_services.salon_id
            AND owner_id = auth.uid()
        )
    );

-- Herkese açık: Hizmet listesini görebilir
CREATE POLICY "salon_services_public_select" ON public.salon_services FOR SELECT TO anon USING ( is_active = true );
CREATE POLICY "salon_services_auth_select" ON public.salon_services FOR SELECT TO authenticated USING ( true );

-- =================================================================
-- STAFF TABLOSU
-- =================================================================

-- Admin: Tam erişim
CREATE POLICY "staff_admin_all" ON public.staff FOR ALL TO authenticated
    USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'SUPER_ADMIN' )
    WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'SUPER_ADMIN' );

-- Owner: Kendi salonunun personellerini yönetir
CREATE POLICY "staff_owner_all" ON public.staff FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.salons
            WHERE id = public.staff.salon_id
            AND owner_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.salons
            WHERE id = public.staff.salon_id
            AND owner_id = auth.uid()
        )
    );

-- Staff: Kendi kaydını görebilir
CREATE POLICY "staff_self_select" ON public.staff FOR SELECT TO authenticated
    USING ( user_id = auth.uid() );

-- =================================================================
-- NOTIFICATIONS TABLOSU
-- =================================================================

-- Admin: Tam erişim
CREATE POLICY "notifications_admin_all" ON public.notifications FOR ALL TO authenticated
    USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'SUPER_ADMIN' )
    WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'SUPER_ADMIN' );

-- Kullanıcılar: Kendi bildirimlerini görür ve günceller
CREATE POLICY "notifications_user_all" ON public.notifications FOR ALL TO authenticated
    USING ( user_id = auth.uid() )
    WITH CHECK ( user_id = auth.uid() );

-- =================================================================
-- REVIEWS TABLOSU
-- =================================================================

-- Herkes görebilir
CREATE POLICY "reviews_public_select" ON public.reviews FOR SELECT TO anon USING ( true );
CREATE POLICY "reviews_auth_select" ON public.reviews FOR SELECT TO authenticated USING ( true );

-- Admin: Tam erişim
CREATE POLICY "reviews_admin_all" ON public.reviews FOR ALL TO authenticated
    USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'SUPER_ADMIN' )
    WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'SUPER_ADMIN' );

-- Müşteriler: Kendi yorumlarını düzenler/siler
CREATE POLICY "reviews_user_manage" ON public.reviews FOR ALL TO authenticated
    USING ( user_id = auth.uid() )
    WITH CHECK ( user_id = auth.uid() );

-- =================================================================
-- INVITES TABLOSU
-- =================================================================

-- Admin: Tam erişim
CREATE POLICY "invites_admin_all" ON public.invites FOR ALL TO authenticated
    USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'SUPER_ADMIN' )
    WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'SUPER_ADMIN' );

-- Owner: Kendi davetlerini yönetir
CREATE POLICY "invites_owner_all" ON public.invites FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.salons
            WHERE id = public.invites.salon_id
            AND owner_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.salons
            WHERE id = public.invites.salon_id
            AND owner_id = auth.uid()
        )
    );
