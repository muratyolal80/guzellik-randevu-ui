-- =============================================
-- New-24-Appointment-Coupon-Support.sql
-- Randevulara kupon desteği ekler
-- =============================================

-- Randevular tablosuna kupon ve indirim bilgilerini ekle
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS coupon_code text,
ADD COLUMN IF NOT EXISTS discount_amount numeric(10,2) DEFAULT 0;

-- Kupon kullanım sayısını artıran bir fonksiyon
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(p_coupon_id uuid)
RETURNS void AS $$
BEGIN
    UPDATE public.coupons 
    SET used_count = used_count + 1 
    WHERE id = p_coupon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
