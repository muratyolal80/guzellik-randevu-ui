-- =============================================================================
-- New-30-Professional-Subscription-Plans-Redesign.sql
-- Re-designs subscription plans with optimized limits, features, and pricing.
-- =============================================================================

-- Add missing column if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subscription_plans' AND column_name='description_features') THEN
        ALTER TABLE public.subscription_plans ADD COLUMN description_features jsonb DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Clear existing plans to ensure fresh start (optional, using UPSERT logic below)
-- DELETE FROM public.subscription_plans;

-- 1. STARTER (Giriş - Ücretsiz)
INSERT INTO public.subscription_plans 
(name, display_name, description, description_features, price_monthly, max_branches, max_staff, max_gallery_photos, max_sms_monthly, has_advanced_reports, has_campaigns, has_sponsored, support_level, sort_order)
VALUES 
('STARTER', 'Starter', 'Sisteme harika bir başlangıç için temel özellikler', '[]', 0, 1, 2, 5, 0, false, false, false, 'STANDARD', 1)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    description_features = EXCLUDED.description_features,
    price_monthly = EXCLUDED.price_monthly,
    max_branches = EXCLUDED.max_branches,
    max_staff = EXCLUDED.max_staff,
    max_gallery_photos = EXCLUDED.max_gallery_photos,
    max_sms_monthly = EXCLUDED.max_sms_monthly,
    has_advanced_reports = EXCLUDED.has_advanced_reports,
    has_campaigns = EXCLUDED.has_campaigns,
    has_sponsored = EXCLUDED.has_sponsored,
    support_level = EXCLUDED.support_level,
    sort_order = EXCLUDED.sort_order;

-- 2. PRO (Standart - Butik Salonlar)
INSERT INTO public.subscription_plans 
(name, display_name, description, description_features, price_monthly, max_branches, max_staff, max_gallery_photos, max_sms_monthly, has_advanced_reports, has_campaigns, has_sponsored, support_level, sort_order)
VALUES 
('PRO', 'Pro', 'Tek şubeli, büyüyen butik salonlar için ideal', '["Gelişmiş Raporlar", "30 Galeri Fotoğrafı", "250 Aylık SMS"]', 29900, 1, 5, 30, 250, true, false, false, 'STANDARD', 2)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    max_branches = EXCLUDED.max_branches,
    max_staff = EXCLUDED.max_staff,
    max_gallery_photos = EXCLUDED.max_gallery_photos,
    max_sms_monthly = EXCLUDED.max_sms_monthly,
    has_advanced_reports = EXCLUDED.has_advanced_reports,
    has_campaigns = EXCLUDED.has_campaigns,
    has_sponsored = EXCLUDED.has_sponsored,
    support_level = EXCLUDED.support_level,
    sort_order = EXCLUDED.sort_order;

-- 3. BUSINESS (Büyüyen - Çok Şubeli Markalar)
INSERT INTO public.subscription_plans 
(name, display_name, description, description_features, price_monthly, max_branches, max_staff, max_gallery_photos, max_sms_monthly, has_advanced_reports, has_campaigns, has_sponsored, support_level, sort_order)
VALUES 
('BUSINESS', 'Business', 'Birden fazla şubesi olan ve ivme yakalayan markalar', '["10 Şube Desteği", "Kampanya Yönetimi", "1000 Aylık SMS", "Öncelikli Destek"]', 69900, 5, 15, 100, 1000, true, true, false, 'PRIORITY', 3)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    max_branches = EXCLUDED.max_branches,
    max_staff = EXCLUDED.max_staff,
    max_gallery_photos = EXCLUDED.max_gallery_photos,
    max_sms_monthly = EXCLUDED.max_sms_monthly,
    has_advanced_reports = EXCLUDED.has_advanced_reports,
    has_campaigns = EXCLUDED.has_campaigns,
    has_sponsored = EXCLUDED.has_sponsored,
    support_level = EXCLUDED.support_level,
    sort_order = EXCLUDED.sort_order;

-- 4. ELITE (Kurumsal - Büyük Zincirler)
INSERT INTO public.subscription_plans 
(name, display_name, description, description_features, price_monthly, max_branches, max_staff, max_gallery_photos, max_sms_monthly, has_advanced_reports, has_campaigns, has_sponsored, support_level, sort_order)
VALUES 
('ELITE', 'Elite', 'Sınırsız güç ve platform üzerinde sponsorlu vitrin özelliği', '["Sınırsız Şube/Personel", "Sponsorlu Vitrin", "5000 Aylık SMS", "VIP Destek"]', 149900, -1, -1, -1, 5000, true, true, true, 'VIP', 4)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    max_branches = EXCLUDED.max_branches,
    max_staff = EXCLUDED.max_staff,
    max_gallery_photos = EXCLUDED.max_gallery_photos,
    max_sms_monthly = EXCLUDED.max_sms_monthly,
    has_advanced_reports = EXCLUDED.has_advanced_reports,
    has_campaigns = EXCLUDED.has_campaigns,
    has_sponsored = EXCLUDED.has_sponsored,
    support_level = EXCLUDED.support_level,
    sort_order = EXCLUDED.sort_order;
