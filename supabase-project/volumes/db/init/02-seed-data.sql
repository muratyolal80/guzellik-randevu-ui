-- GuzellikRandevu Seed Data
-- Migration: Initial Seed Data
-- Created: 2025-12-22

-- ==============================================
-- 1. CITIES (81 Turkey Provinces)
-- ==============================================

INSERT INTO cities (name, plate_code) VALUES
('Adana', 1), ('Adıyaman', 2), ('Afyonkarahisar', 3), ('Ağrı', 4), ('Amasya', 5),
('Ankara', 6), ('Antalya', 7), ('Artvin', 8), ('Aydın', 9), ('Balıkesir', 10),
('Bilecik', 11), ('Bingöl', 12), ('Bitlis', 13), ('Bolu', 14), ('Burdur', 15),
('Bursa', 16), ('Çanakkale', 17), ('Çankırı', 18), ('Çorum', 19), ('Denizli', 20),
('Diyarbakır', 21), ('Edirne', 22), ('Elazığ', 23), ('Erzincan', 24), ('Erzurum', 25),
('Eskişehir', 26), ('Gaziantep', 27), ('Giresun', 28), ('Gümüşhane', 29), ('Hakkari', 30),
('Hatay', 31), ('Isparta', 32), ('Mersin', 33), ('İstanbul', 34), ('İzmir', 35),
('Kars', 36), ('Kastamonu', 37), ('Kayseri', 38), ('Kırklareli', 39), ('Kırşehir', 40),
('Kocaeli', 41), ('Konya', 42), ('Kütahya', 43), ('Malatya', 44), ('Manisa', 45),
('Kahramanmaraş', 46), ('Mardin', 47), ('Muğla', 48), ('Muş', 49), ('Nevşehir', 50),
('Niğde', 51), ('Ordu', 52), ('Rize', 53), ('Sakarya', 54), ('Samsun', 55),
('Siirt', 56), ('Sinop', 57), ('Sivas', 58), ('Tekirdağ', 59), ('Tokat', 60),
('Trabzon', 61), ('Tunceli', 62), ('Şanlıurfa', 63), ('Uşak', 64), ('Van', 65),
('Yozgat', 66), ('Zonguldak', 67), ('Aksaray', 68), ('Bayburt', 69), ('Karaman', 70),
('Kırıkkale', 71), ('Batman', 72), ('Şırnak', 73), ('Bartın', 74), ('Ardahan', 75),
('Iğdır', 76), ('Yalova', 77), ('Karabük', 78), ('Kilis', 79), ('Osmaniye', 80),
('Düzce', 81);

-- ==============================================
-- 2. DISTRICTS (Sample districts for major cities)
-- ==============================================

-- İstanbul Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY[
    'Adalar', 'Arnavutköy', 'Ataşehir', 'Avcılar', 'Bağcılar', 'Bahçelievler',
    'Bakırköy', 'Başakşehir', 'Bayrampaşa', 'Beşiktaş', 'Beykoz', 'Beylikdüzü',
    'Beyoğlu', 'Büyükçekmece', 'Çatalca', 'Çekmeköy', 'Esenler', 'Esenyurt',
    'Eyüpsultan', 'Fatih', 'Gaziosmanpaşa', 'Güngören', 'Kadıköy', 'Kağıthane',
    'Kartal', 'Küçükçekmece', 'Maltepe', 'Pendik', 'Sancaktepe', 'Sarıyer',
    'Silivri', 'Sultanbeyli', 'Sultangazi', 'Şile', 'Şişli', 'Tuzla',
    'Ümraniye', 'Üsküdar', 'Zeytinburnu'
]) AS name
FROM cities WHERE name = 'İstanbul';

-- Ankara Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY[
    'Akyurt', 'Altındağ', 'Ayaş', 'Bala', 'Beypazarı', 'Çamlıdere',
    'Çankaya', 'Çubuk', 'Elmadağ', 'Etimesgut', 'Evren', 'Gölbaşı',
    'Güdül', 'Haymana', 'Kalecik', 'Kazan', 'Keçiören', 'Kızılcahamam',
    'Mamak', 'Nallıhan', 'Polatlı', 'Pursaklar', 'Sincan', 'Şereflikoçhisar',
    'Yenimahalle'
]) AS name
FROM cities WHERE name = 'Ankara';

-- İzmir Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY[
    'Aliağa', 'Balçova', 'Bayındır', 'Bayraklı', 'Bergama', 'Beydağ',
    'Bornova', 'Buca', 'Çeşme', 'Çiğli', 'Dikili', 'Foça', 'Gaziemir',
    'Güzelbahçe', 'Karabağlar', 'Karaburun', 'Karşıyaka', 'Kemalpaşa',
    'Kınık', 'Kiraz', 'Konak', 'Menderes', 'Menemen', 'Narlıdere',
    'Ödemiş', 'Seferihisar', 'Selçuk', 'Tire', 'Torbalı', 'Urla'
]) AS name
FROM cities WHERE name = 'İzmir';

-- Antalya Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY[
    'Akseki', 'Aksu', 'Alanya', 'Demre', 'Döşemealtı', 'Elmalı',
    'Finike', 'Gazipaşa', 'Gündoğmuş', 'İbradı', 'Kaş', 'Kemer',
    'Kepez', 'Konyaaltı', 'Korkuteli', 'Kumluca', 'Manavgat',
    'Muratpaşa', 'Serik'
]) AS name
FROM cities WHERE name = 'Antalya';

-- Bursa Districts
INSERT INTO districts (city_id, name)
SELECT id, unnest(ARRAY[
    'Büyükorhan', 'Gemlik', 'Gürsu', 'Harmancık', 'İnegöl', 'İznik',
    'Karacabey', 'Keles', 'Kestel', 'Mudanya', 'Mustafakemalpaşa',
    'Nilüfer', 'Orhaneli', 'Orhangazi', 'Osmangazi', 'Yenişehir', 'Yıldırım'
]) AS name
FROM cities WHERE name = 'Bursa';

-- Add "Merkez" (Center) district for all other cities
INSERT INTO districts (city_id, name)
SELECT id, 'Merkez'
FROM cities
WHERE name NOT IN ('İstanbul', 'Ankara', 'İzmir', 'Antalya', 'Bursa');

-- ==============================================
-- 3. SALON TYPES
-- ==============================================

INSERT INTO salon_types (name, slug, icon) VALUES
('Kuaför Salonları', 'kuafor', 'https://images.unsplash.com/photo-1560869713-7d0a29430803?q=80&w=800&auto=format&fit=crop'),
('Berber Salonları', 'berber', 'https://images.unsplash.com/photo-1503951914875-452162b7f304?q=80&w=800&auto=format&fit=crop'),
('Güzellik Merkezleri', 'guzellik', 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=800&auto=format&fit=crop'),
('Masaj ve Spa', 'spa', 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=800&auto=format&fit=crop'),
('Makyaj Stüdyoları', 'makyaj', 'https://images.unsplash.com/photo-1487412947132-26c25fc496a7?q=80&w=800&auto=format&fit=crop'),
('Tırnak Tasarım', 'tirnak', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=800&auto=format&fit=crop'),
('Fizyoterapi', 'terapi', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop'),
('Solaryum', 'solaryum', 'https://images.unsplash.com/photo-1552693673-1bf958298935?q=80&w=800&auto=format&fit=crop'),
('Dövme Stüdyoları', 'dovme', 'https://images.unsplash.com/photo-1565551332972-76fa2a63273e?q=80&w=800&auto=format&fit=crop');

-- ==============================================
-- 4. SERVICE CATEGORIES
-- ==============================================

INSERT INTO service_categories (name, slug, icon) VALUES
('Saç', 'sac', 'content_cut'),
('Tırnak', 'tirnak', 'brush'),
('Makyaj ve Bakış Tasarımı', 'makyaj', 'face'),
('Vücut Bakımı ve Solaryum', 'vucut', 'accessibility_new'),
('Lazer Epilasyon', 'lazer', 'flash_on'),
('Erkek', 'erkek', 'face_retouching_natural'),
('Masaj ve Spa', 'masaj', 'spa'),
('Yüz ve Cilt Bakımı', 'cilt', 'clean_hands');

-- ==============================================
-- 5. GLOBAL SERVICES
-- ==============================================

-- Saç Services
INSERT INTO global_services (category_id, name)
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
FROM service_categories WHERE slug = 'sac';

-- Tırnak Services
INSERT INTO global_services (category_id, name)
SELECT id, unnest(ARRAY[
    'Manikür',
    'Pedikür',
    'Kalıcı Oje',
    'Protez Tırnak',
    'Tırnak Tasarımı',
    'Fransız Manikür'
])
FROM service_categories WHERE slug = 'tirnak';

-- Makyaj Services
INSERT INTO global_services (category_id, name)
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
FROM service_categories WHERE slug = 'makyaj';

-- Vücut Bakımı Services
INSERT INTO global_services (category_id, name)
SELECT id, unnest(ARRAY[
    'Solaryum',
    'Bronzlaştırma',
    'Peeling',
    'Vücut Masajı',
    'Selülit Masajı',
    'Zayıflama Masajı'
])
FROM service_categories WHERE slug = 'vucut';

-- Lazer Epilasyon Services
INSERT INTO global_services (category_id, name)
SELECT id, unnest(ARRAY[
    'Lazer Epilasyon - Tüm Vücut',
    'Lazer Epilasyon - Yüz',
    'Lazer Epilasyon - Kol',
    'Lazer Epilasyon - Bacak',
    'Lazer Epilasyon - Bikini Bölgesi'
])
FROM service_categories WHERE slug = 'lazer';

-- Erkek Services
INSERT INTO global_services (category_id, name)
SELECT id, unnest(ARRAY[
    'Saç Kesimi',
    'Sakal Kesimi',
    'Sakal Düzeltme',
    'Amerikan Tıraşı',
    'Damat Tıraşı',
    'Bıyık Kesimi',
    'Ağda',
    'Kaş Düzeltme',
    'Cilt Bakımı'
])
FROM service_categories WHERE slug = 'erkek';

-- Masaj ve Spa Services
INSERT INTO global_services (category_id, name)
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
FROM service_categories WHERE slug = 'masaj';

-- Yüz ve Cilt Bakımı Services
INSERT INTO global_services (category_id, name)
SELECT id, unnest(ARRAY[
    'Cilt Bakımı',
    'Yüz Temizliği',
    'Maske',
    'Peeling',
    'Akne Tedavisi',
    'Leke Tedavisi',
    'Hydrafacial',
    'Mezoterapi',
    'Botox',
    'Dolgu'
])
FROM service_categories WHERE slug = 'cilt';

-- ==============================================
-- COMPLETION MESSAGE
-- ==============================================

DO $$
BEGIN
    RAISE NOTICE 'Seed data loaded successfully!';
    RAISE NOTICE 'Cities: %', (SELECT COUNT(*) FROM cities);
    RAISE NOTICE 'Districts: %', (SELECT COUNT(*) FROM districts);
    RAISE NOTICE 'Salon Types: %', (SELECT COUNT(*) FROM salon_types);
    RAISE NOTICE 'Service Categories: %', (SELECT COUNT(*) FROM service_categories);
    RAISE NOTICE 'Global Services: %', (SELECT COUNT(*) FROM global_services);
END $$;

