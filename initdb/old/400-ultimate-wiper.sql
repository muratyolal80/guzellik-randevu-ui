-- 400-ULTIMATE-WIPER.sql
-- Bu script: 
-- 1. Tablo yapısındaki eksikleri tamamlar (full_name vb.)
-- 2. Profiles tablosundaki TÜM policyleri dinamik olarak siler.
-- 3. Yepyeni ve çakışmayan kurallar ekler.

-- 1. Tablo Senkronizasyonu (Eksik kolonları ekle)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='profiles' AND COLUMN_NAME='full_name') THEN
    ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='profiles' AND COLUMN_NAME='role') THEN
    -- Eğer role yoksa (ki olmalı), ekle
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
       CREATE TYPE user_role AS ENUM ('CUSTOMER', 'STAFF', 'SALON_OWNER', 'SUPER_ADMIN');
    END IF;
    ALTER TABLE public.profiles ADD COLUMN role user_role DEFAULT 'CUSTOMER';
  END IF;
END $$;

-- 2. RLS'yi Kapat (Operasyon sırasında hata vermesin)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 3. DİNAMİK TEMİZLİK (Tüm Policyleri Sil)
-- Bu blok veritabanındaki TÜM kural isimlerini bulur ve siler.
DO $$ 
DECLARE 
  pol RECORD;
BEGIN 
  FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public') LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON public.profiles';
  END LOOP;
END $$;

-- 4. Fonksiyonları Temizle ve Yeni (v3) Oluştur
DROP FUNCTION IF EXISTS public.check_is_admin();
DROP FUNCTION IF EXISTS public.check_is_admin_v2();

CREATE OR REPLACE FUNCTION public.is_admin_v3()
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- auth.jwt() içerisindeki email'i kontrol etmek en güvenli ve döngüye girmeyen yöntemdir
  -- Çünkü profiles tablosuna dokunmaz!
  RETURN (auth.jwt() ->> 'email') = 'admin@demo.com';
END;
$$;

-- 5. RLS'yi Aç
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. TERTEMİZ KURALLAR

-- Kural A: Herkes kendi kaydını görebilir ve güncelleyebilir (Döngü ihtimali sıfır)
CREATE POLICY "p_self" ON public.profiles
    FOR ALL
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Kural B: Admin her şeyi yapabilir (JWT tabanlı kontrol - Profiles tablosuna bakmaz!)
CREATE POLICY "p_admin" ON public.profiles
    FOR ALL
    USING (public.is_admin_v3());

-- 7. Admin Verisini Güncelle
INSERT INTO public.profiles (id, email, role, full_name)
SELECT id, email, 'SUPER_ADMIN', 'System Admin'
FROM auth.users 
WHERE email = 'admin@demo.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'SUPER_ADMIN', full_name = 'System Admin';

-- 8. Yetkileri Ver
GRANT EXECUTE ON FUNCTION public.is_admin_v3() TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

SELECT 'BAŞARILI: Tüm kurallar temizlendi ve JWT tabanlı Admin sistemi kuruldu.' as result;
