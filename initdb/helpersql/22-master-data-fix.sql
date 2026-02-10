-- 1. SALON TÜRLERİ (Eksikse ekler)
INSERT INTO public.salon_types (id, name, slug)
SELECT '5188bddf-7d18-4bcb-a274-6dfa07ad8f17', 'Kuaför', 'kuafor'
WHERE NOT EXISTS (SELECT 1 FROM public.salon_types WHERE slug = 'kuafor');

INSERT INTO public.salon_types (id, name, slug)
SELECT 'd0a403a7-44a3-45d4-b489-2b6d3cc311c6', 'Berber', 'berber'
WHERE NOT EXISTS (SELECT 1 FROM public.salon_types WHERE slug = 'berber');

-- 2. HİZMET KATEGORİLERİ
INSERT INTO public.service_categories (id, name, slug)
SELECT 'ed6ebf1b-2345-4259-9dfc-93eb5176d510', 'Saç', 'sac'
WHERE NOT EXISTS (SELECT 1 FROM public.service_categories WHERE slug = 'sac');

INSERT INTO public.service_categories (id, name, slug)
SELECT 'a4c9379d-87c6-4fc7-bb66-0de9aca7965c', 'Tırnak', 'tirnak'
WHERE NOT EXISTS (SELECT 1 FROM public.service_categories WHERE slug = 'tirnak');

-- 3. GLOBAL HİZMETLER
INSERT INTO public.global_services (id, category_id, name)
SELECT 'bcd2f8ee-a2c7-4188-9de1-83923a565c0b', 'ed6ebf1b-2345-4259-9dfc-93eb5176d510', 'Saç Kesimi'
WHERE NOT EXISTS (SELECT 1 FROM public.global_services WHERE name = 'Saç Kesimi');

-- 4. ŞEHİR VE İLÇE (Harita odağı için kritik)
INSERT INTO public.cities (id, name, plate_code, latitude, longitude)
SELECT 'db32470f-626d-4dae-88a6-056690867bc2', 'İstanbul', 34, 41.0082, 28.9784
WHERE NOT EXISTS (SELECT 1 FROM public.cities WHERE name = 'İstanbul');

INSERT INTO public.districts (id, city_id, name)
SELECT 'c8bcc880-52f4-4381-9c81-1a1e8f912894', 'db32470f-626d-4dae-88a6-056690867bc2', 'Kadıköy'
WHERE NOT EXISTS (SELECT 1 FROM public.districts WHERE name = 'Kadıköy');

-- 5. SİZİN PROFİLİNİZİ SAHİP (OWNER) YAPAR
-- Bu komut direkt olarak şu an SQL editörünü çalıştıran sizin ID'nizi kullanır
UPDATE public.profiles 
SET role = 'SALON_OWNER' 
WHERE id = auth.uid();

-- Mevcut salonları da sizin üzerinize bağlar (Test için)
UPDATE public.salons 
SET owner_id = auth.uid()
WHERE owner_id IS NULL OR owner_id::text LIKE '0000%';

-- Şemayı yenile
NOTIFY pgrst, 'reload schema';
