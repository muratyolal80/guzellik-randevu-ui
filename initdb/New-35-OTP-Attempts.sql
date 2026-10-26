-- =============================================================================
-- New-35-OTP-Attempts.sql  (Roadmap F6 — code audit C2)
-- verifyOTP had no attempt limit: a 6-digit code could be brute-forced inside the
-- 5-minute window (1M guesses, parallel requests) → takeover of any phone account.
-- lib/auth/otp.ts now increments `attempts` on every wrong guess and burns the
-- code after OTP_MAX_ATTEMPTS (5).
-- =============================================================================
ALTER TABLE public.otp_codes ADD COLUMN IF NOT EXISTS attempts integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS otp_codes_phone_active_idx
    ON public.otp_codes (phone, created_at DESC) WHERE used = false;

NOTIFY pgrst, 'reload schema';
