-- New-34-Hardened-RLS-Audit.sql
-- Güzellik Randevu Platformu - Merkezi RLS Sıkılaştırma (Hardening) Betiği (v2.0)
-- Bu betik, Faz 1'deki eksikleri kapatır ve projeyi en güncel güvenlik standartlarına taşır.

-- 0. ADMIN KONTROL FONKSİYONU GÜNCELLEME
-- Hem ADMIN hem SUPER_ADMIN rollerini kapsar ve performans için SECURITY DEFINER kullanır.
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

-- 1. MEVCUT POLİTİKALARI TEMİZLE (Kritik tablolar için)
DO $$ 
DECLARE r record;
BEGIN
    FOR r IN (
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename IN ('salons', 'salon_services', 'subscriptions', 'payment_history', 'notifications', 'staff', 'working_hours', 'review_images')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- 2. SALONLAR: OWNER İÇİN SİLME YASAĞI (CRITICAL)
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "salons_public_select" ON public.salons FOR SELECT USING (status = 'APPROVED' OR owner_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "salons_owner_insert" ON public.salons FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "salons_owner_update" ON public.salons FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR public.is_admin(auth.uid())) WITH CHECK (owner_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "salons_admin_all" ON public.salons FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 3. SALON_SERVICES (PAKETLER): OWNER İÇİN SİLME YASAĞI
ALTER TABLE public.salon_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "salon_services_public_select" ON public.salon_services FOR SELECT USING (true);
CREATE POLICY "salon_services_owner_insert" ON public.salon_services FOR INSERT TO authenticated 
    WITH CHECK (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid()) OR public.is_admin(auth.uid()));
CREATE POLICY "salon_services_owner_update" ON public.salon_services FOR UPDATE TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid()) OR public.is_admin(auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid()) OR public.is_admin(auth.uid()));
CREATE POLICY "salon_services_admin_all" ON public.salon_services FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 4. BİLDİRİMLER: KULLANICI GİZLİLİĞİ
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_self_select" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "notifications_self_update" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "notifications_admin_all" ON public.notifications FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 5. ABONELİKLER: OWNER-CENTRIC MODEL UYUMU
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- Subscriptions politikası (New-32 modeline göre owner_id kullanır)
CREATE POLICY "subscriptions_owner_select" ON public.subscriptions FOR SELECT TO authenticated 
    USING (owner_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "subscriptions_admin_all" ON public.subscriptions FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Payment History politikası
CREATE POLICY "payment_history_owner_select" ON public.payment_history FOR SELECT TO authenticated 
    USING (owner_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "payment_history_admin_all" ON public.payment_history FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 6. PERSONEL (STAFF): VERİ ERİŞİM İYİLEŞTİRMELERİ
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;

-- Personel kendi kaydını ve bağlı olduğu salon personellerini görebilir
CREATE POLICY "staff_self_and_salon_select" ON public.staff FOR SELECT TO authenticated
    USING (
        user_id = auth.uid() 
        OR EXISTS (SELECT 1 FROM public.salons WHERE id = salon_id AND owner_id = auth.uid())
        OR salon_id IN (SELECT salon_id FROM public.staff WHERE user_id = auth.uid())
        OR public.is_admin(auth.uid())
    );

-- Çalışma saatleri erişimi
CREATE POLICY "working_hours_self_select" ON public.working_hours FOR SELECT TO authenticated
    USING (
        staff_id IN (SELECT id FROM public.staff WHERE user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.staff s JOIN public.salons sl ON s.salon_id = sl.id WHERE s.id = staff_id AND sl.owner_id = auth.uid())
        OR public.is_admin(auth.uid())
    );

-- 7. YORUM GÖRSELLERİ: SAHİPLİK KONTROLÜ
ALTER TABLE public.review_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "review_images_owner_all" ON public.review_images FOR ALL TO authenticated
    USING (
        EXISTS (SELECT 1 FROM public.reviews WHERE id = review_id AND user_id = auth.uid())
        OR public.is_admin(auth.uid())
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.reviews WHERE id = review_id AND user_id = auth.uid())
        OR public.is_admin(auth.uid())
    );

-- =================================================================
-- HARDENING COMPLETE
-- =================================================================
