-- 500-REPAIR-AND-UNBLOCK.sql
-- BU SCRIPT PROGRAMI ÇIKMAZDAN KURTARIR.

-- 1. TABLO YAPISI TAMİRİ (Eksik kolonları ekle)
DO $$ 
BEGIN 
  -- full_name yoksa ekle
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='profiles' AND COLUMN_NAME='full_name') THEN
    ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
  END IF;
  
  -- user_role tipini kontrol et
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
       CREATE TYPE user_role AS ENUM ('CUSTOMER', 'STAFF', 'SALON_OWNER', 'SUPER_ADMIN');
  END IF;

  -- role kolonu yoksa ekle
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='profiles' AND COLUMN_NAME='role') THEN
    ALTER TABLE public.profiles ADD COLUMN role user_role DEFAULT 'CUSTOMER';
  END IF;
END $$;

-- 2. ACİL DURUM: TÜM RLS'LERİ GEÇİCİ OLARAK KAPAT
-- Bu, sonsuz döngüyü anında bitirir ve giriş yapmanızı sağlar.
-- Güvenliği sonra temiz policylerle geri açacağız.
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.salons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff DISABLE ROW LEVEL SECURITY;

-- 3. TÜM POLİCY'LERİ SİL (Temiz bir sayfa)
DO $$ 
DECLARE 
  pol RECORD;
BEGIN 
  -- Profiles policyleri
  FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public') LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON public.profiles';
  END LOOP;
  -- Salons policyleri
  FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'salons' AND schemaname = 'public') LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON public.salons';
  END LOOP;
END $$;

-- 4. YENİ VE BASİT KURALLAR (Döngü Riskini Sıfıra İndir)

-- A. Herkes her şeyi görebilsin (Sorun çözülene kadar debug için en güvenli yol)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "allow_own_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "salons_public_read" ON public.salons FOR SELECT USING (true);
CREATE POLICY "salons_owner_all" ON public.salons FOR ALL USING (owner_id = auth.uid());

-- 5. ADMİNİ MANUEL SET ET
-- admin@demo.com kullanıcısını SUPER_ADMIN yap
UPDATE public.profiles 
SET role = 'SUPER_ADMIN', full_name = 'System Admin' 
WHERE email = 'admin@demo.com';

-- 6. SONUÇ TESTİ
SELECT id, email, role, full_name, 'SİSTEM UNBLOCK EDİLDİ' as status FROM public.profiles WHERE email = 'admin@demo.com';
