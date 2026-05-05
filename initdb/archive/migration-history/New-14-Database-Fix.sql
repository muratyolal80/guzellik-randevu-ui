
-- VERİTABANI SENKRONİZASYON VE DÜZELTME SCRİPTİ (FAZ 7, 8, 9)
-- Eğer New-10, 11, 12 veya 13'te hata aldıysanız bu scripti çalıştırın.

-- 1. FAZ 7 EKSİKLERİ (Finans)
ALTER TABLE public.salons 
ADD COLUMN IF NOT EXISTS deposit_rate NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS cancellation_deadline_hours INTEGER DEFAULT 24;

ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS iyzico_payment_id TEXT,
ADD COLUMN IF NOT EXISTS refund_status TEXT DEFAULT 'NONE' CHECK (refund_status IN ('NONE', 'PENDING', 'COMPLETED', 'FAILED')),
ADD COLUMN IF NOT EXISTS refund_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'CASH',
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'PENDING';

-- 2. FAZ 8 EKSİKLERİ (Pazarlama)
CREATE TABLE IF NOT EXISTS public.campaign_rules (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    discount_type text NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FIXED')),
    discount_value numeric(10,2) NOT NULL,
    start_time time,
    end_time time,
    days_of_week integer[],
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.salons
ADD COLUMN IF NOT EXISTS reminder_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS reminder_hours_before integer DEFAULT 2;

ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS campaign_rule_id UUID REFERENCES public.campaign_rules(id),
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE;

-- 3. FAZ 9 EKSİKLERİ (Çoklu Şube)
CREATE TABLE IF NOT EXISTS public.staff_branches (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id uuid NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    is_primary boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    UNIQUE(staff_id, salon_id)
);

-- RLS
ALTER TABLE public.staff_branches ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Salon sahipleri personel-şube atamalarını yönetebilir') THEN
        CREATE POLICY "Salon sahipleri personel-şube atamalarını yönetebilir" ON public.staff_branches FOR ALL USING (salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid()));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Herkes personel-şube atamalarını görebilir') THEN
        CREATE POLICY "Herkes personel-şube atamalarını görebilir" ON public.staff_branches FOR SELECT USING (true);
    END IF;
END $$;

-- 4. VİEW'LARI GÜNCELLE
CREATE OR REPLACE VIEW public.owner_global_stats AS
SELECT 
    s.owner_id,
    COUNT(DISTINCT s.id) as total_branches,
    COUNT(DISTINCT st.id) as total_staff,
    COUNT(DISTINCT a.id) as total_appointments,
    SUM(COALESCE(a.deposit_amount, 0)) as total_revenue
FROM public.salons s
LEFT JOIN public.staff st ON st.salon_id = s.id
LEFT JOIN public.appointments a ON a.salon_id = s.id
GROUP BY s.owner_id;

-- Mevcut personelleri eşitle
INSERT INTO public.staff_branches (staff_id, salon_id, is_primary)
SELECT id, salon_id, true FROM public.staff
ON CONFLICT (staff_id, salon_id) DO NOTHING;
