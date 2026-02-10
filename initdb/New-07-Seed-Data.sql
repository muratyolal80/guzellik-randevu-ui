-- Seed Data for Güzellik Randevu

-- 1. CITIES & DISTRICTS
INSERT INTO public.cities (id, name, plate_code, latitude, longitude) VALUES 
('db32470f-626d-4dae-88a6-056690867bc2', 'İstanbul', 34, 41.0082, 28.9784),
('7e8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d', 'İzmir', 35, 38.4237, 27.1428)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.districts (id, city_id, name) VALUES 
('c8bcc880-52f4-4381-9c81-1a1e8f912894', 'db32470f-626d-4dae-88a6-056690867bc2', 'Kadıköy'),
('b1d2e3f4-g5h6-i7j8-k9l0-m1n2o3p4q5r6', 'db32470f-626d-4dae-88a6-056690867bc2', 'Beşiktaş'),
('1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', '7e8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d', 'Konak')
ON CONFLICT (city_id, name) DO NOTHING;

-- 2. SALON TYPES
INSERT INTO public.salon_types (id, name, slug, icon) VALUES 
('5188bddf-7d18-4bcb-a274-6dfa07ad8f17', 'Kuaför', 'kuafor', 'content_cut'),
('d0a403a7-44a3-45d4-b489-2b6d3cc311c6', 'Berber', 'berber', 'face'),
('f8e7d6c5-b4a3-2d1c-e0f1-a2b3c4d5e6f7', 'Güzellik Merkezi', 'guzellik-merkezi', 'spa')
ON CONFLICT (name) DO NOTHING;

-- 3. SERVICE CATEGORIES
INSERT INTO public.service_categories (id, name, slug, icon) VALUES 
('ed6ebf1b-2345-4259-9dfc-93eb5176d510', 'Saç', 'sac', 'content_cut'),
('a4c9379d-87c6-4fc7-bb66-0de9aca7965c', 'Tırnak', 'tirnak', 'brush'),
('c5d4e3f2-b1a0-9c8d-7e6f-5a4b3c2d1e0f', 'Bakım', 'bakim', 'face')
ON CONFLICT (name) DO NOTHING;

-- 4. GLOBAL SERVICES
INSERT INTO public.global_services (id, category_id, name) VALUES 
('bcd2f8ee-a2c7-4188-9de1-83923a565c0b', 'ed6ebf1b-2345-4259-9dfc-93eb5176d510', 'Saç Kesimi'),
('a1b2c3d4-e5f6-4a8b-9c0d-e1f2a3b4c5d6', 'ed6ebf1b-2345-4259-9dfc-93eb5176d510', 'Saç Boyama'),
('b2c3d4e5-f6a7-8b9c-0d1e-f2a3b4c5d6e7', 'a4c9379d-87c6-4fc7-bb66-0de9aca7965c', 'Manikür')
ON CONFLICT (category_id, name) DO NOTHING;

-- 5. TEST PROFILES (Matching Auth IDs if known, or dummy)
INSERT INTO public.profiles (id, email, full_name, role) VALUES 
('00000000-0000-0000-0000-000000000001', 'owner@example.com', 'Test Salon Sahibi', 'SALON_OWNER'),
('00000000-0000-0000-0000-000000000002', 'admin@example.com', 'Sistem Yöneticisi', 'ADMIN')
ON CONFLICT (id) DO NOTHING;

-- 6. SALONS
-- Salon 1: Elite Barber Shop (MATCHING USER URL UUID)
INSERT INTO public.salons (id, name, description, address, city_id, district_id, type_id, owner_id, geo_latitude, geo_longitude, is_verified, status, image) VALUES 
('e374db91-eed0-4b03-bfd1-d5ddef391c6f', 'Elite Barber Shop', 'İzmir''in kalbinde, modern ve geleneksel tıraşın buluşma noktası.', 'Kordon Boyu No: 234, Konak', '7e8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'd0a403a7-44a3-45d4-b489-2b6d3cc311c6', '00000000-0000-0000-0000-000000000001', 38.4237, 27.1428, true, 'APPROVED', 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800')
ON CONFLICT (id) DO NOTHING;

-- 7. SALON SERVICES
INSERT INTO public.salon_services (salon_id, global_service_id, price, duration_min) VALUES 
('e374db91-eed0-4b03-bfd1-d5ddef391c6f', 'bcd2f8ee-a2c7-4188-9de1-83923a565c0b', 250.00, 45),
('e374db91-eed0-4b03-bfd1-d5ddef391c6f', 'a1b2c3d4-e5f6-4a8b-9c0d-e1f2a3b4c5d6', 500.00, 90)
ON CONFLICT DO NOTHING;

-- 8. SALON WORKING HOURS
INSERT INTO public.salon_working_hours (salon_id, day_of_week, start_time, end_time, is_closed) VALUES 
('e374db91-eed0-4b03-bfd1-d5ddef391c6f', 1, '09:00', '20:00', false),
('e374db91-eed0-4b03-bfd1-d5ddef391c6f', 2, '09:00', '20:00', false),
('e374db91-eed0-4b03-bfd1-d5ddef391c6f', 3, '09:00', '20:00', false),
('e374db91-eed0-4b03-bfd1-d5ddef391c6f', 4, '09:00', '20:00', false),
('e374db91-eed0-4b03-bfd1-d5ddef391c6f', 5, '09:00', '20:00', false),
('e374db91-eed0-4b03-bfd1-d5ddef391c6f', 6, '09:00', '18:00', false),
('e374db91-eed0-4b03-bfd1-d5ddef391c6f', 0, '00:00', '00:00', true)
ON CONFLICT DO NOTHING;
