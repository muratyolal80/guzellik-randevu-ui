-- =================================================================
-- New-29-Fix-User-Management.sql
-- Kullanıcı Yönetimi (Ekle, Sil, Düzenle, İncele) için nihai onarım.
-- =================================================================

-- 1. handle_new_user Fonksiyonunu Güncelle (Admin oluşturmalarına izin ver)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    v_role public.user_role;
    v_first_name TEXT;
    v_last_name TEXT;
    v_full_name TEXT;
BEGIN
    v_first_name := NEW.raw_user_meta_data->>'first_name';
    v_last_name := NEW.raw_user_meta_data->>'last_name';
    v_full_name := NEW.raw_user_meta_data->>'full_name';
    
    -- İsim mantığı
    IF v_first_name IS NULL AND v_full_name IS NOT NULL THEN
        v_first_name := split_part(v_full_name, ' ', 1);
        v_last_name := substr(v_full_name, length(v_first_name) + 2);
    END IF;
    
    -- Rol mantığı (Eğer role null ise CUSTOMER yap, değilse gelen rolü koru)
    v_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'CUSTOMER'::public.user_role);
    
    -- Not: Eskiden burada olan SUPER_ADMIN kısıtlaması kaldırıldı, 
    -- çünkü admin panelinden admin ekleyebilmemiz gerekiyor.

    -- Profili Ekle veya Güncelle
    INSERT INTO public.profiles (id, email, first_name, last_name, full_name, role, avatar_url, is_active)
    VALUES (
        NEW.id,
        NEW.email,
        v_first_name,
        v_last_name,
        COALESCE(v_full_name, v_first_name || ' ' || v_last_name),
        v_role,
        NEW.raw_user_meta_data->>'avatar_url',
        true
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        role = COALESCE(EXCLUDED.role, public.profiles.role),
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Tetikleyiciyi Re-deploy Et
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. is_admin Fonksiyonunu Re-deploy Et (En güncel hali)
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

-- 4. Kaskad Silme Fonksiyonunu Güncelle
CREATE OR REPLACE FUNCTION public.admin_delete_user_cascade(target_user_id uuid)
RETURNS void AS $$
BEGIN
    -- 1. Abonelikler
    DELETE FROM public.subscriptions WHERE salon_id IN (SELECT id FROM public.salons WHERE owner_id = target_user_id);
    
    -- 2. Randevular (Hata almamak için önce bağımlılıkları temizle miyiz? Hayır, Tablo bazlı kaskadlar çalışmalı)
    DELETE FROM public.appointments WHERE customer_id = target_user_id;
    
    -- 3. Salonlar (Buradan salon_services, staff vb. kaskad silinir)
    DELETE FROM public.salons WHERE owner_id = target_user_id;
    
    -- 4. Diğer veriler
    DELETE FROM public.reviews WHERE user_id = target_user_id;
    DELETE FROM public.notifications WHERE user_id = target_user_id;
    
    -- 5. Profil
    DELETE FROM public.profiles WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Admin Rolünü Doğrula
UPDATE public.profiles 
SET role = 'SUPER_ADMIN' 
WHERE email = 'myolal@gmail.com';

-- 6. RLS Politikalarını Re-Fresh (Admin İçin)
-- Profiles tablosu için admin politikası
DROP POLICY IF EXISTS "admin_all_profiles" ON public.profiles;
CREATE POLICY "admin_all_profiles" ON public.profiles FOR ALL TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- Diğer tablolar New-28 ile zaten kapsanmıştı ancak profiles politikasını netleştirdik.

-- Audit
COMMENT ON FUNCTION handle_new_user() IS 'Updated by New-29 for admin user management support.';
