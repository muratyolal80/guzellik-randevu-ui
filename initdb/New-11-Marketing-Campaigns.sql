
-- Faz 8: Pazarlama ve Bildirim Motoru Geliştirmeleri

-- 1. Süreli Kampanya Kuralları (Happy Hours vb.)
CREATE TABLE IF NOT EXISTS public.campaign_rules (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    discount_type text NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FIXED')),
    discount_value numeric(10,2) NOT NULL,
    start_time time, -- Örn: 09:00:00
    end_time time,   -- Örn: 12:00:00
    days_of_week integer[], -- [1, 2, 3] (1: Pazartesi, 7: Pazar)
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. Bildirim/Hatırlatma Ayarları (Salon bazlı)
ALTER TABLE public.salons
ADD COLUMN IF NOT EXISTS reminder_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS reminder_hours_before integer DEFAULT 2;

-- 3. RLS Politikaları
ALTER TABLE public.campaign_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Salon sahipleri kendi kampanya kurallarını yönetebilir"
    ON public.campaign_rules
    FOR ALL
    USING (salon_id IN (
        SELECT id FROM public.salons WHERE owner_id = auth.uid()
    ));

CREATE POLICY "Herkes aktif kampanya kurallarını görebilir"
    ON public.campaign_rules
    FOR SELECT
    USING (is_active = true);
