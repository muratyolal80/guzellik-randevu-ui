-- ============================================================================
-- New-27: salon_usage_stats view — abonelik yokken STARTER planına düş
-- ----------------------------------------------------------------------------
-- SORUN: View, salon ile subscriptions/subscription_plans'i LEFT JOIN ediyordu.
--        Aboneliği OLMAYAN salonlarda (örn. onay bekleyen / yeni salon) plan
--        alanları NULL dönüyordu → limit_gallery_photos = NULL → UI'da "0 / 0"
--        ve "Kapasite Doldu". Oysa kod tarafı (SubscriptionService.checkLimit)
--        abonelik yokken STARTER planına düşüyor (3 galeri fotoğrafı).
--
-- ÇÖZÜM: Plan kaynaklı tüm limitleri COALESCE ile STARTER planına düşür.
--        Böylece abonesiz/ücretsiz salonlar STARTER hakkını (3 foto vb.) görür;
--        view ile kod davranışı tutarlı olur. Kolon adları/sırası korunur
--        (CREATE OR REPLACE VIEW gereği).
-- ============================================================================

CREATE OR REPLACE VIEW public.salon_usage_stats AS
SELECT
  s.id   AS salon_id,
  s.name AS salon_name,
  COALESCE(sp.name, starter.name)                 AS plan_name,
  COALESCE(sp.display_name, starter.display_name) AS plan_display_name,
  (SELECT count(*) FROM staff
     WHERE staff.salon_id = s.id AND staff.is_active = true) AS current_staff,
  COALESCE(sp.max_staff, starter.max_staff)       AS limit_staff,
  1 AS current_branches,
  COALESCE(sp.max_branches, starter.max_branches) AS limit_branches,
  (SELECT count(*) FROM salon_gallery
     WHERE salon_gallery.salon_id = s.id)         AS current_gallery_photos,
  COALESCE(sp.max_gallery_photos, starter.max_gallery_photos) AS limit_gallery_photos,
  COALESCE(sp.has_advanced_reports, starter.has_advanced_reports) AS has_advanced_reports,
  COALESCE(sp.has_campaigns, starter.has_campaigns)               AS has_campaigns,
  COALESCE(sp.has_sponsored, starter.has_sponsored)               AS has_sponsored,
  sub.status              AS subscription_status,
  sub.current_period_end  AS subscription_expires_at
FROM salons s
LEFT JOIN subscriptions sub        ON sub.salon_id = s.id
LEFT JOIN subscription_plans sp    ON sub.plan_id  = sp.id
LEFT JOIN subscription_plans starter ON starter.name = 'STARTER';
