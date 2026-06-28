-- ============================================================================
-- New-29: salon_type_categories — salon tipi → hizmet kategorisi köprüsü (seed)
-- ----------------------------------------------------------------------------
-- SORUN: BulkAddServicesModal ("Standart Hizmetleri Toplu Ekle") akışı
--          salon.type_id → salon_type_categories → service_categories → global_services
--        zincirinden okur. service_categories (8) ve global_services (63) DB'de DOLU,
--        ama ortadaki köprü tablosu salon_type_categories TAMAMEN BOŞTU (0 satır).
--        Bu yüzden HER salon tipinde "Bu salon tipi için tanımlı kategori yok." çıkıyordu.
--        (Eski helpersql/18 seed'i yanlış kolon adı 'category_id' kullanıyordu —
--         gerçek kolon 'service_category_id' — ve hiç uygulanmamıştı.)
--
-- ÇÖZÜM: Boş tabloya salon tipi ↔ kategori eşleşmelerini ekle. Sadece INSERT;
--        mevcut hiçbir veriye dokunmaz. ON CONFLICT DO NOTHING → idempotent
--        (tekrar çalıştırılabilir). Slug bazlı JOIN → ID'lerden bağımsız, ortamlar
--        arası (local/staging/prod) güvenli.
--
-- NOT: 'dovme' (Dövme Stüdyoları) için sistemde uygun kategori/hizmet yok →
--      eşleştirme eklenmedi (toplu ekleme bu tipte boş kalır; manuel ekleme çalışır).
--      İleride "Dövme" kategorisi + global servisler eklenirse buraya satır eklenir.
-- ============================================================================

INSERT INTO public.salon_type_categories (salon_type_id, service_category_id)
SELECT st.id, sc.id
FROM (VALUES
    -- Berber Salonları → Erkek, Saç
    ('berber',   'erkek'),
    ('berber',   'sac'),
    -- Kuaför Salonları → Saç, Makyaj, Tırnak, Yüz/Cilt
    ('kuafor',   'sac'),
    ('kuafor',   'makyaj'),
    ('kuafor',   'tirnak'),
    ('kuafor',   'cilt'),
    -- Güzellik Merkezleri → geniş kapsam
    ('guzellik', 'cilt'),
    ('guzellik', 'lazer'),
    ('guzellik', 'tirnak'),
    ('guzellik', 'makyaj'),
    ('guzellik', 'vucut'),
    ('guzellik', 'masaj'),
    -- Makyaj Stüdyoları → Makyaj ve Bakış Tasarımı
    ('makyaj',   'makyaj'),
    -- Tırnak Tasarım → Tırnak
    ('tirnak',   'tirnak'),
    -- Masaj ve Spa → Masaj, Vücut Bakımı
    ('spa',      'masaj'),
    ('spa',      'vucut'),
    -- Fizyoterapi → Masaj
    ('terapi',   'masaj'),
    -- Solaryum → Vücut Bakımı ve Solaryum
    ('solaryum', 'vucut')
) AS m(type_slug, cat_slug)
JOIN public.salon_types       st ON st.slug = m.type_slug
JOIN public.service_categories sc ON sc.slug = m.cat_slug
ON CONFLICT (salon_type_id, service_category_id) DO NOTHING;

-- Okuma erişimi (zaten mevcut; CLAUDE.md RLS+GRANT kuralı gereği idempotent teyit).
GRANT SELECT ON public.salon_type_categories TO authenticated;
GRANT SELECT ON public.salon_type_categories TO anon;
