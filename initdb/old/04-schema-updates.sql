-- Migration: Add missing columns to match UI requirements and Seed Data
-- 1. Add Coordinates to Cities
-- 2. Add Images to Salon Types

-- ==============================================
-- 1. CITIES: Add Latitude & Longitude
-- ==============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cities' AND column_name='latitude') THEN
        ALTER TABLE public.cities ADD COLUMN latitude DECIMAL(10, 8);
        ALTER TABLE public.cities ADD COLUMN longitude DECIMAL(11, 8);
    END IF;
END $$;

-- Seed Coordinates for Major Cities (Data from constants.ts)
UPDATE public.cities SET latitude = 41.0082, longitude = 28.9784 WHERE name = 'İstanbul';
UPDATE public.cities SET latitude = 39.9208, longitude = 32.8541 WHERE name = 'Ankara';
UPDATE public.cities SET latitude = 38.4237, longitude = 27.1428 WHERE name = 'İzmir';
UPDATE public.cities SET latitude = 36.8969, longitude = 30.7133 WHERE name = 'Antalya';
UPDATE public.cities SET latitude = 40.1885, longitude = 29.0610 WHERE name = 'Bursa';
UPDATE public.cities SET latitude = 37.0000, longitude = 35.3213 WHERE name = 'Adana';
UPDATE public.cities SET latitude = 37.0662, longitude = 37.3833 WHERE name = 'Gaziantep';
UPDATE public.cities SET latitude = 37.8667, longitude = 32.4833 WHERE name = 'Konya';
-- Add more as needed...

-- ==============================================
-- 2. SALON TYPES: Add Image Column
-- ==============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='salon_types' AND column_name='image') THEN
        ALTER TABLE public.salon_types ADD COLUMN image TEXT;
    END IF;
END $$;

-- Seed Images for Salon Types (Data from MOCK_SALON_TYPES)
UPDATE public.salon_types SET image = 'https://images.unsplash.com/photo-1560869713-7d0a29430803?q=80&w=800&auto=format&fit=crop' WHERE slug = 'kuafor';
UPDATE public.salon_types SET image = 'https://images.unsplash.com/photo-1503951914875-452162b7f304?q=80&w=800&auto=format&fit=crop' WHERE slug = 'berber';
UPDATE public.salon_types SET image = 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=800&auto=format&fit=crop' WHERE slug = 'guzellik';
UPDATE public.salon_types SET image = 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=800&auto=format&fit=crop' WHERE slug = 'spa';
UPDATE public.salon_types SET image = 'https://images.unsplash.com/photo-1487412947132-26c25fc496a7?q=80&w=800&auto=format&fit=crop' WHERE slug = 'makyaj';
UPDATE public.salon_types SET image = 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=800&auto=format&fit=crop' WHERE slug = 'tirnak';
UPDATE public.salon_types SET image = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop' WHERE slug = 'terapi';
UPDATE public.salon_types SET image = 'https://images.unsplash.com/photo-1552693673-1bf958298935?q=80&w=800&auto=format&fit=crop' WHERE slug = 'solaryum';
UPDATE public.salon_types SET image = 'https://images.unsplash.com/photo-1565551332972-76fa2a63273e?q=80&w=800&auto=format&fit=crop' WHERE slug = 'dovme';
