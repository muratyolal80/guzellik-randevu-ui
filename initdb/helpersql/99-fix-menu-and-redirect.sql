-- 1. MASTER DATA RECOVERY (Smart Upsert)

-- Salon Types
-- We use unique constraint on SLUG to update existing corrupted names (e.g. Kuaf??r -> Kuaför)
INSERT INTO public.salon_types (id, name, slug, icon) VALUES 
('5188bddf-7d18-4bcb-a274-6dfa07ad8f17', 'Kuaför', 'kuafor', 'content_cut'),
('d0a403a7-44a3-45d4-b489-2b6d3cc311c6', 'Berber', 'berber', 'face'),
('f8e7d6c5-b4a3-2d1c-e0f1-a2b3c4d5e6f7', 'Güzellik Merkezi', 'guzellik-merkezi', 'spa'),
('a1b2c3d4-e5f6-4a8b-9c0d-e1f2a3b4c5d6', 'Diyetisyen', 'diyetisyen', 'monitor_weight')
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, 
    icon = COALESCE(public.salon_types.icon, EXCLUDED.icon); 
    -- Only update icon if it's currently null, or maybe force update? Let's keep existing icon if set.
    -- Actually, let's force name update to fix 'Kuaf??r'

-- Service Categories
-- Using ON CONFLICT (slug) similarly
INSERT INTO public.service_categories (id, name, slug, icon) VALUES 
('ed6ebf1b-2345-4259-9dfc-93eb5176d510', 'Saç', 'sac', 'content_cut'),
('a4c9379d-87c6-4fc7-bb66-0de9aca7965c', 'Tırnak', 'tirnak', 'brush'),
('c5d4e3f2-b1a0-9c8d-7e6f-5a4b3c2d1e0f', 'Bakım', 'bakim', 'face'),
-- Note: 'Makyaj' exists with different ID in DB (a6c90bcc...), so we must use slug conflict.
('d6e7f8a9-b0c1-4d2e-f3a4-b5c6d7e8f9a0', 'Makyaj', 'makyaj', 'palette'), 
('e7f8a9b0-c1d2-4e3f-a5b6-c7d8e9f0a1b2', 'Masaj', 'masaj', 'spa'),
('f8a9b0c1-d2e3-4f4a-b5c6-d7e8f9a0b1c2', 'Lazer', 'lazer', 'flash_on'),
('a9b0c1d2-e3f4-4a5b-c6d7-e8f9a0b1c2d3', 'Diyet', 'diyet', 'monitor_weight')
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name,
    icon = EXCLUDED.icon;


-- Global Services
-- For services, we check on (category_id, name) usually.
-- But if category IDs are mixed up (because of different IDs in DB), this is tricky.
-- We should first get the CORRECT category IDs from DB for the inserts.
-- But standard SQL script can't dynamics easily without DO block.
-- Let's stick to standard IDs for main categories which seem to match (Saç, Tırnak).
-- For others, if the ID differs (like Makyaj), inserting 'Makyaj' services with WRONG category ID might fail FK or be orphaned.
-- Let's try to insert basic ones that we know match.

INSERT INTO public.global_services (id, category_id, name) VALUES 
('bcd2f8ee-a2c7-4188-9de1-83923a565c0b', 'ed6ebf1b-2345-4259-9dfc-93eb5176d510', 'Saç Kesimi'),
('a1b2c3d4-e5f6-4a8b-9c0d-e1f2a3b4c5d6', 'ed6ebf1b-2345-4259-9dfc-93eb5176d510', 'Saç Boyama'),
('b2c3d4e5-f6a7-8b9c-0d1e-f2a3b4c5d6e7', 'a4c9379d-87c6-4fc7-bb66-0de9aca7965c', 'Manikür'),
('c3d4e5f6-a7b8-c9d0-e1f2-a3b4c5d6e7f8', 'c5d4e3f2-b1a0-9c8d-7e6f-5a4b3c2d1e0f', 'Cilt Bakımı')
ON CONFLICT (category_id, name) DO NOTHING;


-- 2. ENSURE RLS POLICIES ALLOW PUBLIC READ (Idempotent)
DO $$
BEGIN
    -- Salon Types
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'salon_types' AND policyname = 'Public read salon_types'
    ) THEN
        CREATE POLICY "Public read salon_types" ON public.salon_types FOR SELECT USING (true);
    END IF;

    -- Service Categories
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'service_categories' AND policyname = 'Public read service_categories'
    ) THEN
        CREATE POLICY "Public read service_categories" ON public.service_categories FOR SELECT USING (true);
    END IF;
    
    -- Global Services
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'global_services' AND policyname = 'Public read global_services'
    ) THEN
        CREATE POLICY "Public read global_services" ON public.global_services FOR SELECT USING (true);
    END IF;
END $$;

-- Enable RLS just in case
ALTER TABLE public.salon_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_services ENABLE ROW LEVEL SECURITY;


-- 3. FIX PROFILES IF NEEDED
UPDATE public.profiles 
SET role = 'SALON_OWNER' 
WHERE email = 'owner@example.com';

UPDATE public.profiles 
SET role = 'ADMIN' 
WHERE email = 'admin@example.com';

-- Ensure Elite Barber Shop is approved
UPDATE public.salons 
SET status = 'APPROVED', is_verified = true 
WHERE name = 'Elite Barber Shop';
