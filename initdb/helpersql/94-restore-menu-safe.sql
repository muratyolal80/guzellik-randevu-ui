-- SAFE MENU DATA RESTORATION (Slug-Based)
-- This script finds the correct category_id using the slug, avoiding foreign key errors.

-- 1. Ensure Categories Exist First (Add missing ones)
INSERT INTO public.service_categories (name, slug, icon) VALUES
('Saç', 'sac', 'content_cut'),
('Tırnak', 'tirnak', 'brush'),
('Makyaj ve Bakış Tasarımı', 'makyaj', 'face'),
('Vücut Bakımı ve Solaryum', 'vucut', 'accessibility_new'),
('Lazer Epilasyon', 'lazer', 'flash_on'),
('Erkek Bakımı', 'erkek', 'face_retouching_natural'),
('Masaj ve Spa', 'masaj', 'spa'),
('Yüz ve Cilt Bakımı', 'cilt', 'clean_hands')
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name,
    icon = EXCLUDED.icon;

-- 2. Insert Global Services (Using dynamic lookup for category_id)

-- Saç Services
INSERT INTO public.global_services (category_id, name)
SELECT id, unnest(ARRAY[
    'Saç Kesimi', 'Saç Boyama', 'Fön', 'Maşa', 'Saç Yıkama', 
    'Saç Bakımı', 'Keratin Bakımı', 'Brezilya Fönü', 'Saç Düzleştirme', 'Perma'
])
FROM public.service_categories WHERE slug = 'sac'
ON CONFLICT (category_id, name) DO NOTHING;

-- Tırnak Services
INSERT INTO public.global_services (category_id, name)
SELECT id, unnest(ARRAY[
    'Manikür', 'Pedikür', 'Kalıcı Oje', 'Protez Tırnak', 
    'Tırnak Tasarımı', 'Fransız Manikür'
])
FROM public.service_categories WHERE slug = 'tirnak'
ON CONFLICT (category_id, name) DO NOTHING;

-- Makyaj Services
INSERT INTO public.global_services (category_id, name)
SELECT id, unnest(ARRAY[
    'Günlük Makyaj', 'Gece Makyajı', 'Gelin Makyajı', 'Nişan Makyajı', 
    'Kaş Tasarımı', 'Kaş Boyama', 'Kirpik Lifting', 'Kalıcı Makyaj', 'İpek Kirpik'
])
FROM public.service_categories WHERE slug = 'makyaj'
ON CONFLICT (category_id, name) DO NOTHING;

-- Vücut Bakımı Services
INSERT INTO public.global_services (category_id, name)
SELECT id, unnest(ARRAY[
    'Solaryum', 'Bronzlaştırma', 'Peeling', 'Vücut Masajı', 
    'Selülit Masajı', 'Zayıflama Masajı'
])
FROM public.service_categories WHERE slug = 'vucut'
ON CONFLICT (category_id, name) DO NOTHING;

-- Lazer Epilasyon Services
INSERT INTO public.global_services (category_id, name)
SELECT id, unnest(ARRAY[
    'Lazer Epilasyon - Tüm Vücut', 'Lazer Epilasyon - Yüz', 'Lazer Epilasyon - Kol', 
    'Lazer Epilasyon - Bacak', 'Lazer Epilasyon - Bikini Bölgesi'
])
FROM public.service_categories WHERE slug = 'lazer'
ON CONFLICT (category_id, name) DO NOTHING;

-- Erkek Services
INSERT INTO public.global_services (category_id, name)
SELECT id, unnest(ARRAY[
    'Erkek Saç Kesimi', 'Sakal Kesimi', 'Sakal Düzeltme', 'Amerikan Tıraşı', 
    'Damat Tıraşı', 'Bıyık Kesimi', 'Ağda (Erkek)', 'Kaş Düzeltme (Erkek)', 'Erkek Cilt Bakımı'
])
FROM public.service_categories WHERE slug = 'erkek'
ON CONFLICT (category_id, name) DO NOTHING;

-- Masaj ve Spa Services
INSERT INTO public.global_services (category_id, name)
SELECT id, unnest(ARRAY[
    'İsveç Masajı', 'Aromaterapi Masajı', 'Thai Masajı', 'Refleksoloji', 
    'Hamam', 'Kese-Köpük', 'Jakuzi', 'Sauna'
])
FROM public.service_categories WHERE slug = 'masaj'
ON CONFLICT (category_id, name) DO NOTHING;

-- Yüz ve Cilt Bakımı Services
INSERT INTO public.global_services (category_id, name)
SELECT id, unnest(ARRAY[
    'Cilt Bakımı', 'Yüz Temizliği', 'Maske', 'Peeling (Yüz)', 
    'Akne Tedavisi', 'Leke Tedavisi', 'Hydrafacial', 'Mezoterapi', 'Botox', 'Dolgu'
])
FROM public.service_categories WHERE slug = 'cilt'
ON CONFLICT (category_id, name) DO NOTHING;

-- 3. ENSURE RLS POLICIES EXIST (Just in case)
ALTER TABLE public.global_services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read global_services" ON public.global_services;
CREATE POLICY "Public read global_services" ON public.global_services FOR SELECT USING (true);

ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read service_categories" ON public.service_categories;
CREATE POLICY "Public read service_categories" ON public.service_categories FOR SELECT USING (true);

ALTER TABLE public.salon_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read salon_types" ON public.salon_types;
CREATE POLICY "Public read salon_types" ON public.salon_types FOR SELECT USING (true);

-- 4. VERIFICATION
SELECT 'Fixed Menu Data:' as info;
SELECT 'Service Categories: ' || COUNT(*) FROM public.service_categories;
SELECT 'Global Services: ' || COUNT(*) FROM public.global_services;
