-- INSERT TEST SALONS (Cem Kuaför)
-- This ensures 'Salon Name' search works for the user's test case.

INSERT INTO public.salons (name, type_id, city_id, district_id, address, status, phone, email, password_hash, owner_id)
VALUES
-- Cem Kuaför (İstanbul/Kadıköy)
(
    'Cem Erkek Kuaförü',
    (SELECT id FROM salon_types WHERE slug = 'berber' LIMIT 1),
    (SELECT id FROM cities WHERE name = 'İstanbul' LIMIT 1),
    (SELECT id FROM districts WHERE name = 'Kadıköy' AND city_id = (SELECT id FROM cities WHERE name = 'İstanbul' LIMIT 1) LIMIT 1),
    'Caferağa Mah. Moda Cad. No:12, Kadıköy/İstanbul',
    'APPROVED',
    '5551234567',
    'cem.kuafor@example.com',
    'hash123',
    (SELECT id FROM auth.users LIMIT 1) -- Use first available user as owner
),
-- Cem Güzellik (İstanbul/Beşiktaş)
(
    'Cem Güzellik Salonu',
    (SELECT id FROM salon_types WHERE slug = 'guzellik' LIMIT 1),
    (SELECT id FROM cities WHERE name = 'İstanbul' LIMIT 1),
    (SELECT id FROM districts WHERE name = 'Beşiktaş' AND city_id = (SELECT id FROM cities WHERE name = 'İstanbul' LIMIT 1) LIMIT 1),
    'Türkali Mah. Nüzhetiye Cad. No:5, Beşiktaş/İstanbul',
    'APPROVED',
    '5557654321',
    'cem.guzellik@example.com',
    'hash456',
    (SELECT id FROM auth.users LIMIT 1)
),
-- Studio Cem (Ankara/Çankaya)
(
    'Studio Cem',
    (SELECT id FROM salon_types WHERE slug = 'kuafor' LIMIT 1),
    (SELECT id FROM cities WHERE name = 'Ankara' LIMIT 1),
    (SELECT id FROM districts WHERE name = 'Çankaya' AND city_id = (SELECT id FROM cities WHERE name = 'Ankara' LIMIT 1) LIMIT 1),
    'Tunus Cad. No:20, Çankaya/Ankara',
    'APPROVED',
    '5559876543',
    'studio.cem@example.com',
    'hash789',
    (SELECT id FROM auth.users LIMIT 1)
);
