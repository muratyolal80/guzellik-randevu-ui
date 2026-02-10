-- COMPLETE MENU DATA RESTORATION (FINAL FIX)
-- ALL names and slugs are now UNIQUE

-- 1. SALON TYPES (9 types) - UNIQUE NAMES
INSERT INTO public.salon_types (name, slug, icon, image) VALUES
('Kuaför Salonları', 'kuafor', 'content_cut', 'https://images.unsplash.com/photo-1560869713-7d0a29430803?q=80&w=800&auto=format&fit=crop'),
('Berber Salonları', 'berber', 'face', 'https://images.unsplash.com/photo-1503951914875-452162b7f304?q=80&w=800&auto=format&fit=crop'),
('Güzellik Merkezleri', 'guzellik', 'spa', 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=800&auto=format&fit=crop'),
('Masaj ve Spa Merkezleri', 'masaj-spa', 'spa', 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=800&auto=format&fit=crop'),
('Makyaj Stüdyoları', 'makyaj-studyo', 'palette', 'https://images.unsplash.com/photo-1487412947132-26c25fc496a7?q=80&w=800&auto=format&fit=crop'),
('Tırnak Tasarım Salonları', 'tirnak-tasarim', 'brush', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=800&auto=format&fit=crop'),
('Fizyoterapi Merkezleri', 'terapi', 'monitor_heart', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop'),
('Solaryum Merkezleri', 'solaryum', 'light_mode', 'https://images.unsplash.com/photo-1552693673-1bf958298935?q=80&w=800&auto=format&fit=crop'),
('Dövme Stüdyoları', 'dovme', 'draw', 'https://images.unsplash.com/photo-1565551332972-76fa2a63273e?q=80&w=800&auto=format&fit=crop')
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name,
    icon = EXCLUDED.icon,
    image = EXCLUDED.image;

-- 2. SERVICE CATEGORIES (8 categories)
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

-- 3. GLOBAL SERVICES
-- Saç Services
INSERT INTO public.global_services (category_id, name)
SELECT id, unnest(ARRAY[
    'Saç Kesimi',
    'Saç Boyama',
    'Fön',
    'Maşa',
    'Saç Yıkama',
    'Saç Bakımı',
    'Keratin Bakımı',
    'Brezilya Fönü',
    'Saç Düzleştirme',
    'Perma'
])
FROM public.service_categories WHERE slug = 'sac'
ON CONFLICT (category_id, name) DO NOTHING;

-- Tırnak Services
INSERT INTO public.global_services (category_id, name)
SELECT id, unnest(ARRAY[
    'Manikür',
    'Pedikür',
    'Kalıcı Oje',
    'Protez Tırnak',
    'Tırnak Tasarımı',
    'Fransız Manikür'
])
FROM public.service_categories WHERE slug = 'tirnak'
ON CONFLICT (category_id, name) DO NOTHING;

-- Makyaj Services
INSERT INTO public.global_services (category_id, name)
SELECT id, unnest(ARRAY[
    'Günlük Makyaj',
    'Gece Makyajı',
    'Gelin Makyajı',
    'Nişan Makyajı',
    'Kaş Tasarımı',
    'Kaş Boyama',
    'Kirpik Lifting',
    'Kalıcı Makyaj',
    'İpek Kirpik'
])
FROM public.service_categories WHERE slug = 'makyaj'
ON CONFLICT (category_id, name) DO NOTHING;

-- Vücut Bakımı Services
INSERT INTO public.global_services (category_id, name)
SELECT id, unnest(ARRAY[
    'Solaryum',
    'Bronzlaştırma',
    'Peeling',
    'Vücut Masajı',
    'Selülit Masajı',
    'Zayıflama Masajı'
])
FROM public.service_categories WHERE slug = 'vucut'
ON CONFLICT (category_id, name) DO NOTHING;

-- Lazer Epilasyon Services
INSERT INTO public.global_services (category_id, name)
SELECT id, unnest(ARRAY[
    'Lazer Epilasyon - Tüm Vücut',
    'Lazer Epilasyon - Yüz',
    'Lazer Epilasyon - Kol',
    'Lazer Epilasyon - Bacak',
    'Lazer Epilasyon - Bikini Bölgesi'
])
FROM public.service_categories WHERE slug = 'lazer'
ON CONFLICT (category_id, name) DO NOTHING;

-- Erkek Services
INSERT INTO public.global_services (category_id, name)
SELECT id, unnest(ARRAY[
    'Erkek Saç Kesimi',
    'Sakal Kesimi',
    'Sakal Düzeltme',
    'Amerikan Tıraşı',
    'Damat Tıraşı',
    'Bıyık Kesimi',
    'Ağda (Erkek)',
    'Kaş Düzeltme (Erkek)',
    'Erkek Cilt Bakımı'
])
FROM public.service_categories WHERE slug = 'erkek'
ON CONFLICT (category_id, name) DO NOTHING;

-- Masaj ve Spa Services
INSERT INTO public.global_services (category_id, name)
SELECT id, unnest(ARRAY[
    'İsveç Masajı',
    'Aromaterapi Masajı',
    'Thai Masajı',
    'Refleksoloji',
    'Hamam',
    'Kese-Köpük',
    'Jakuzi',
    'Sauna'
])
FROM public.service_categories WHERE slug = 'masaj'
ON CONFLICT (category_id, name) DO NOTHING;

-- Yüz ve Cilt Bakımı Services
INSERT INTO public.global_services (category_id, name)
SELECT id, unnest(ARRAY[
    'Cilt Bakımı',
    'Yüz Temizliği',
    'Yüz Maskesi',
    'Yüz Peeling',
    'Akne Tedavisi',
    'Leke Tedavisi',
    'Hydrafacial',
    'Mezoterapi',
    'Botox',
    'Dolgu'
])
FROM public.service_categories WHERE slug = 'cilt'
ON CONFLICT (category_id, name) DO NOTHING;

-- VERIFICATION
SELECT 'Salon Types: ' || COUNT(*) as result FROM public.salon_types;
SELECT 'Service Categories: ' || COUNT(*) as result FROM public.service_categories;
SELECT 'Global Services: ' || COUNT(*) as result FROM public.global_services;
