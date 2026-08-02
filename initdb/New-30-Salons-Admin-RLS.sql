-- ============================================================================
-- New-30: salons — SUPER_ADMIN/ADMIN tam erişim RLS politikası (EKSİKTİ)
-- ----------------------------------------------------------------------------
-- SORUN: public.salons tablosunda SELECT politikaları yalnızca şunlardı:
--          - public_approved_salons : status = 'APPROVED'
--          - owner_read_own_salons  : owner_id = auth.uid() OR status = 'APPROVED'
--          - owner_write_own_salons : ALL, owner_id = auth.uid()
--        Admin'e (SUPER_ADMIN/ADMIN) TÜM durumları gösteren politika YOKTU.
--        Sonuç: Admin "Salon Onayları" ekranı yalnızca APPROVED salonları görüyor;
--        SUBMITTED (onay bekleyen), DRAFT, SUSPENDED salonlar admin'e GÖRÜNMÜYOR
--        → onay kuyruğu boş; ayrıca approve/reject (UPDATE) de RLS'e takılırdı.
--        (CLAUDE.md: "SUPER_ADMIN / ADMIN tüm tablolarda tam yetki.")
--
-- ÇÖZÜM: Diğer tablolarda (audit_logs, invites, customer_notes...) kullanılan
--        STANDART desenin aynısıyla salons'a admin politikası ekle:
--          profiles.role IN ('SUPER_ADMIN','ADMIN').
--
-- GÜVENLİK NOTU — DELETE bilinçli olarak verilMEZ:
--   authenticated rolünün salons'ta DELETE GRANT'ı YOK (owner'ın salon silememesi
--   bu sayede sağlanıyor). Bu migration GRANT'lara DOKUNMAZ; dolayısıyla bu admin
--   politikası pratikte SELECT + UPDATE + INSERT sağlar (kuyruğu görmek + onay/red).
--   Kalıcı salon silme yine yalnızca service_role/DB tarafında yapılır.
-- ============================================================================

DROP POLICY IF EXISTS "admin_manage_salons_all" ON public.salons;

CREATE POLICY "admin_manage_salons_all" ON public.salons
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = ANY (ARRAY['SUPER_ADMIN'::user_role, 'ADMIN'::user_role])
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = ANY (ARRAY['SUPER_ADMIN'::user_role, 'ADMIN'::user_role])
    )
  );

-- NOT: GRANT eklenmiyor — authenticated zaten SELECT/UPDATE/INSERT yetkisine sahip,
--      DELETE bilerek yok (owner-silme koruması). Sadece RLS satır görünürlüğü açıldı.
