-- =============================================================================
-- New-10-OTP-Codes-Table.sql
-- otp_codes tablosu eksikti — telefon doğrulama akışı bozuktu.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.otp_codes (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    phone       text NOT NULL,
    code        text NOT NULL,
    used        boolean DEFAULT false,
    expires_at  timestamptz NOT NULL,
    created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_codes_phone_active
    ON public.otp_codes(phone)
    WHERE used = false;

CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at
    ON public.otp_codes(expires_at);

ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Sadece service_role yazabilir (zaten BYPASSRLS), public erişim yok.
-- (auth flow service_role ile çalışıyor)

NOTIFY pgrst, 'reload schema';
