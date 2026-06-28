-- ============================================================================
-- New-28: subscriptions.billing_cycle kolonu (eksik kolon — schema drift)
-- ----------------------------------------------------------------------------
-- SORUN: Kod (db_finance.subscribe, /api/subscription/subscribe, /api/paytr/create-token,
--        admin finance ekranları) 'billing_cycle' (MONTHLY/YEARLY) kolonunu yazıp okuyor,
--        ama public.subscriptions tablosunda bu kolon HİÇ yoktu. Sonuç:
--        "Could not find the 'billing_cycle' column of 'subscriptions' in the schema cache"
--        → paket/abonelik kaydı tamamlanamıyor → onboarding paket adımından ilerlemiyor.
--
-- ÇÖZÜM: Kolonu ekle (MONTHLY varsayılan) + PostgREST şema cache'ini yenile.
-- ============================================================================

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS billing_cycle text NOT NULL DEFAULT 'MONTHLY';

-- Geçerli değer kısıtı (yalnızca MONTHLY/YEARLY)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_billing_cycle_chk'
  ) THEN
    ALTER TABLE public.subscriptions
      ADD CONSTRAINT subscriptions_billing_cycle_chk
      CHECK (billing_cycle IN ('MONTHLY', 'YEARLY'));
  END IF;
END $$;

-- PostgREST'in yeni kolonu görmesi için şema cache'ini yenile.
NOTIFY pgrst, 'reload schema';
