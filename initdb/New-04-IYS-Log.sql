-- New-04-IYS-Log.sql
-- IYS (Iletisim Yonetim Sistemi) log tablosu
-- Türkiye'de SMS/email pazarlama mesajları için yasal kayıt zorunluluğu var.
-- Her gönderilen mesaj burada loglanmalı (kim, ne zaman, hangi consent ile, izin durumu).

CREATE TABLE IF NOT EXISTS public.iys_log (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient       text NOT NULL,                       -- telefon veya email
  channel         text NOT NULL CHECK (channel IN ('SMS', 'EMAIL', 'CALL')),
  message_type    text NOT NULL CHECK (message_type IN ('TRANSACTIONAL', 'MARKETING')),
  content_summary text,                                -- mesajın kısa özeti (PII içermemeli)
  consent_id      text,                                -- IYS'den dönen consent referansı (varsa)
  status          text NOT NULL CHECK (status IN ('SENT', 'FAILED', 'REJECTED', 'PENDING')),
  failure_reason  text,
  user_id         uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  salon_id        uuid REFERENCES public.salons(id) ON DELETE SET NULL,
  related_id      uuid,                                -- appointment_id veya benzeri
  metadata        jsonb DEFAULT '{}'::jsonb,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_iys_log_recipient   ON public.iys_log(recipient);
CREATE INDEX IF NOT EXISTS idx_iys_log_created_at  ON public.iys_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_iys_log_user_id     ON public.iys_log(user_id);
CREATE INDEX IF NOT EXISTS idx_iys_log_salon_id    ON public.iys_log(salon_id);

GRANT SELECT, INSERT ON public.iys_log TO authenticated;
ALTER TABLE public.iys_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own_iys_log" ON public.iys_log;
CREATE POLICY "own_iys_log" ON public.iys_log
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "owner_iys_log" ON public.iys_log;
CREATE POLICY "owner_iys_log" ON public.iys_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = iys_log.salon_id AND salons.owner_id = auth.uid()
    )
  );

NOTIFY pgrst, 'reload schema';
