
-- Faz 8: Pazarlama ve Bildirim Motoru - Hatırlatıcı ve Kampanya İyileştirmeleri

-- 1. Randevu tablosuna kampanya ve hatırlatma alanları ekleme
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS campaign_rule_id UUID REFERENCES public.campaign_rules(id),
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE;

-- 2. Hatırlatma durumu için indeks (Performans için)
CREATE INDEX IF NOT EXISTS idx_appointments_reminder_sent ON public.appointments (reminder_sent) WHERE status = 'CONFIRMED';
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON public.appointments (start_time);

-- 3. Bildirim ayarlarını içeren Salon Detayları View'ını güncelleme (Opsiyonel ama iyi olur)
-- Not: New-11'de salons tablosuna reminder_enabled ve reminder_hours_before eklenmişti.
