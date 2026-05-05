-- 600-ADMIN-GOD-MODE.sql
-- Admin'e tüm tablolarda tam yetki verir ve çakışan policyleri temizler.

-- 1. SALONS TABLOSU
ALTER TABLE public.salons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;

-- Eski sorunlu kuralları temizle
DROP POLICY IF EXISTS "salons_owner_all" ON public.salons;
DROP POLICY IF EXISTS "salons_admin_all" ON public.salons;

-- Admin için TANRI modu (JWT Check - Döngüye girmeden)
CREATE POLICY "admin_god_mode_salons" ON public.salons
    FOR ALL
    USING (
      (auth.jwt() ->> 'email') = 'admin@demo.com' -- Direkt email kontrolü
    );

-- Owner için kendi salonu
CREATE POLICY "owner_manage_own_salon" ON public.salons
    FOR ALL
    USING (owner_id = auth.uid());

-- Herkese açık okuma
CREATE POLICY "public_read_salons" ON public.salons
    FOR SELECT
    USING (true);

-- 2. STAFF TABLOSU
ALTER TABLE public.staff DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "staff_admin_all" ON public.staff;

CREATE POLICY "admin_god_mode_staff" ON public.staff
    FOR ALL
    USING ((auth.jwt() ->> 'email') = 'admin@demo.com');

CREATE POLICY "owner_manage_staff" ON public.staff
    FOR ALL
    USING (
        salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid())
    );

-- 3. SERVICES (salon_services)
ALTER TABLE public.salon_services DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_god_mode_services" ON public.salon_services
    FOR ALL
    USING ((auth.jwt() ->> 'email') = 'admin@demo.com');

-- 4. APPOINTMENTS
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_god_mode_appointments" ON public.appointments
    FOR ALL
    USING ((auth.jwt() ->> 'email') = 'admin@demo.com');

-- SONUÇ
SELECT 'ADMIN YETKİLERİ GÜNCELLENDİ (GOD MODE)' as status;
