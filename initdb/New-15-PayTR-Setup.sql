-- =============================================================================
-- New-15-PayTR-Setup.sql
--
-- Amaç: Iyzico onayı alınamadığı için PayTR iFrame API entegrasyonu eklenir.
--        Iyzico kodu SİLİNMİYOR; admin panelinden hangi sağlayıcı aktif olacak seçilebilir.
--        Şu an SADECE abonelik (subscription) ödemesi için kullanılacak — booking
--        kapora ödemesi kapsam dışı.
--
-- Bu migration:
--   1) platform_settings'e 'paytr_config' JSON (boş demo şablonu)
--   2) platform_settings'e 'active_payment_provider' satırı ('PAYTR' default)
--   3) subscriptions tablosuna paytr_oid kolonu (provider-agnostic merchant_oid)
--   4) paytr_webhooks tablosu (audit log, RLS + GRANT)
--   5) _migrations kaydı
--   6) PostgREST schema reload
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. platform_settings — PayTR config + aktif sağlayıcı seçimi
--    Not: platform_settings tablosu (key, value, updated_at) kolonlarından oluşur.
-- -----------------------------------------------------------------------------
INSERT INTO public.platform_settings (key, value)
VALUES (
    'paytr_config',
    jsonb_build_object(
        'merchant_id', '',
        'merchant_key', '',
        'merchant_salt', '',
        'test_mode', 1,
        'debug_on', 1,
        'currency', 'TL',
        'callback_url', '',
        'merchant_ok_url', '',
        'merchant_fail_url', ''
    )
)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.platform_settings (key, value)
VALUES (
    'active_payment_provider',
    jsonb_build_object('provider', 'PAYTR')
)
ON CONFLICT (key) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. subscriptions — paytr_oid (provider-agnostic merchant_oid)
--    Bu kolon PayTR'nin merchant_oid'i veya başka provider'ın transaction id'sini tutar
-- -----------------------------------------------------------------------------
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS paytr_oid text;
CREATE INDEX IF NOT EXISTS idx_subscriptions_paytr_oid ON public.subscriptions(paytr_oid);

-- -----------------------------------------------------------------------------
-- 3. paytr_webhooks — audit log (iyzico_webhooks ile aynı şablon)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.paytr_webhooks (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    merchant_oid    text NOT NULL,
    status          text NOT NULL,             -- 'success' | 'failed'
    total_amount    integer,                   -- kuruş cinsinden
    payment_amount  integer,
    payment_type    text,                      -- 'card' | 'eft'
    currency        text,
    failed_reason_code text,
    failed_reason_msg  text,
    test_mode       boolean,
    hash            text NOT NULL,             -- gelen hash (verify için saklanır)
    hash_verified   boolean DEFAULT false,     -- biz verify ettik mi
    processed       boolean DEFAULT false,     -- idempotency: işlendi mi
    processing_note text,
    payload         jsonb NOT NULL,            -- ham POST body
    created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_paytr_webhooks_merchant_oid ON public.paytr_webhooks(merchant_oid);
CREATE INDEX IF NOT EXISTS idx_paytr_webhooks_status       ON public.paytr_webhooks(status);
CREATE INDEX IF NOT EXISTS idx_paytr_webhooks_created_at   ON public.paytr_webhooks(created_at DESC);

-- -----------------------------------------------------------------------------
-- 4. RLS + GRANT (CLAUDE.md kuralı: birlikte verilir)
--    Sadece admin görür/yönetir; service_role zaten BYPASSRLS (New-09).
-- -----------------------------------------------------------------------------
ALTER TABLE public.paytr_webhooks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_manage_paytr_webhooks" ON public.paytr_webhooks;
CREATE POLICY "admin_manage_paytr_webhooks" ON public.paytr_webhooks FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN','ADMIN'))
);

-- Base GRANT — RLS açık tablo için authenticated SELECT şart (yoksa boş {} hatası)
GRANT SELECT ON public.paytr_webhooks TO authenticated;

-- -----------------------------------------------------------------------------
-- 5. _migrations tracking kaydı
-- -----------------------------------------------------------------------------
INSERT INTO public._migrations (name, notes) VALUES
    ('New-15-PayTR-Setup',
     'PayTR iFrame API setup: paytr_config + active_payment_provider + subscriptions.paytr_oid + paytr_webhooks (RLS+GRANT)')
ON CONFLICT (name) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 6. PostgREST cache reload
-- -----------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';

-- -----------------------------------------------------------------------------
-- 7. Safety doğrulama
-- -----------------------------------------------------------------------------
DO $$
DECLARE
    cfg_exists boolean;
    provider_exists boolean;
    col_exists boolean;
    tbl_exists boolean;
BEGIN
    SELECT EXISTS(SELECT 1 FROM public.platform_settings WHERE key='paytr_config') INTO cfg_exists;
    SELECT EXISTS(SELECT 1 FROM public.platform_settings WHERE key='active_payment_provider') INTO provider_exists;
    SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='subscriptions' AND column_name='paytr_oid') INTO col_exists;
    SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='paytr_webhooks') INTO tbl_exists;

    RAISE NOTICE 'New-15 doğrulama: paytr_config=%, active_payment_provider=%, subscriptions.paytr_oid=%, paytr_webhooks=%',
        cfg_exists, provider_exists, col_exists, tbl_exists;

    IF NOT (cfg_exists AND provider_exists AND col_exists AND tbl_exists) THEN
        RAISE EXCEPTION 'New-15 eksik kurulum tespit edildi';
    END IF;
END $$;
