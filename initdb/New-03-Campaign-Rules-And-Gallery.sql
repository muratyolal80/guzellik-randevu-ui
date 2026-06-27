-- New-03-Campaign-Rules-And-Gallery.sql
-- 1) campaign_rules: GRANT + RLS (tablo zaten var, sadece izinler eksik)
-- 2) salon_gallery: tabloyu eksikse oluştur, GRANT + RLS

-- ─── 1. CAMPAIGN_RULES ──────────────────────────────────────────────────────
GRANT SELECT ON public.campaign_rules TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.campaign_rules TO authenticated;

ALTER TABLE public.campaign_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_campaigns" ON public.campaign_rules;
CREATE POLICY "public_read_campaigns" ON public.campaign_rules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = campaign_rules.salon_id AND salons.status = 'APPROVED'
    )
  );

DROP POLICY IF EXISTS "owner_manage_campaigns" ON public.campaign_rules;
CREATE POLICY "owner_manage_campaigns" ON public.campaign_rules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = campaign_rules.salon_id AND salons.owner_id = auth.uid()
    )
  );

-- ─── 2. SALON_GALLERY ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.salon_gallery (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id      uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  image_url     text NOT NULL,
  display_order integer DEFAULT 0,
  is_cover      boolean DEFAULT false,
  caption       text,
  created_at    timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_salon_gallery_salon_id ON public.salon_gallery(salon_id);

GRANT SELECT ON public.salon_gallery TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.salon_gallery TO authenticated;

ALTER TABLE public.salon_gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_gallery" ON public.salon_gallery;
CREATE POLICY "public_read_gallery" ON public.salon_gallery
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = salon_gallery.salon_id AND salons.status = 'APPROVED'
    )
  );

DROP POLICY IF EXISTS "owner_manage_gallery" ON public.salon_gallery;
CREATE POLICY "owner_manage_gallery" ON public.salon_gallery
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.salons
      WHERE salons.id = salon_gallery.salon_id AND salons.owner_id = auth.uid()
    )
  );

-- PostgREST schema cache'i yenile (404 sorununu önler)
NOTIFY pgrst, 'reload schema';
