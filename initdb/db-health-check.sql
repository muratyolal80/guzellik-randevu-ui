-- =============================================================================
-- db-health-check.sql
-- Tek atışta DB sağlığını kontrol eder. Periyodik (haftalık) çalıştırılması önerilir.
-- Çalıştırma: docker exec -i supabase-db psql -U postgres -d postgres < initdb/db-health-check.sql
-- ÇIKTIDA HİÇBİR HATA SATIRI OLMAMASI BEKLENİR.
-- =============================================================================

\echo '═══════════════════════════════════════════════════════════════════════'
\echo '  GÜZELLIK RANDEVU — DB SAĞLIK KONTROLÜ'
\echo '═══════════════════════════════════════════════════════════════════════'

-- 1. RLS açık olmayan hassas tablolar (lookup tabloları hariç beklenen: 0)
\echo ''
\echo '▶ 1) RLS kapalı hassas tablolar (BEKLENEN: 0):'
SELECT tablename
FROM pg_tables
WHERE schemaname='public' AND rowsecurity=false
  AND tablename NOT IN ('spatial_ref_sys','cities','districts','salon_types','service_categories','global_services');

-- 2. SELECT policy'si olmayan RLS-on tablolar (kullanılamaz)
\echo ''
\echo '▶ 2) RLS açık ama hiç policy olmayan tablolar (BEKLENEN: 0):'
SELECT t.tablename
FROM pg_tables t
WHERE t.schemaname='public' AND t.rowsecurity=true
  AND NOT EXISTS (SELECT 1 FROM pg_policies p WHERE p.schemaname='public' AND p.tablename=t.tablename);

-- 3. Tehlikeli DELETE policy'leri (admin dışında)
\echo ''
\echo '▶ 3) salons / salon_services üzerinde admin dışı DELETE policy (BEKLENEN: 0):'
SELECT policyname, tablename FROM pg_policies
WHERE schemaname='public' AND cmd='DELETE'
  AND tablename IN ('salons','salon_services')
  AND policyname NOT ILIKE '%admin%';

-- 4. İlişki bütünlüğü — kritik eksikler
\echo ''
\echo '▶ 4) İlişki bütünlüğü (her satır 0 olmalı):'
SELECT 'staff_without_hours'           AS check, COUNT(*) FROM staff s WHERE is_active AND NOT EXISTS (SELECT 1 FROM working_hours WHERE staff_id=s.id)
UNION ALL SELECT 'staff_without_services',     COUNT(*) FROM staff s WHERE is_active AND NOT EXISTS (SELECT 1 FROM staff_services WHERE staff_id=s.id)
UNION ALL SELECT 'staff_without_branches',     COUNT(*) FROM staff s WHERE is_active AND NOT EXISTS (SELECT 1 FROM staff_branches WHERE staff_id=s.id)
UNION ALL SELECT 'salons_without_staff',       COUNT(*) FROM salons s WHERE NOT EXISTS (SELECT 1 FROM staff WHERE salon_id=s.id AND is_active)
UNION ALL SELECT 'salons_without_services',    COUNT(*) FROM salons s WHERE NOT EXISTS (SELECT 1 FROM salon_services WHERE salon_id=s.id)
UNION ALL SELECT 'salons_without_hours',       COUNT(*) FROM salons s WHERE NOT EXISTS (SELECT 1 FROM salon_working_hours WHERE salon_id=s.id)
UNION ALL SELECT 'salons_without_assigned_types', COUNT(*) FROM salons s WHERE NOT EXISTS (SELECT 1 FROM salon_assigned_types WHERE salon_id=s.id);

-- 5. Master lookup data dolu mu?
\echo ''
\echo '▶ 5) Master data (sıfır olmamalı):'
SELECT 'cities'             AS table, COUNT(*) FROM cities
UNION ALL SELECT 'districts',          COUNT(*) FROM districts
UNION ALL SELECT 'global_services',    COUNT(*) FROM global_services
UNION ALL SELECT 'salon_types',        COUNT(*) FROM salon_types
UNION ALL SELECT 'service_categories', COUNT(*) FROM service_categories
UNION ALL SELECT 'subscription_plans', COUNT(*) FROM subscription_plans;

-- 6. Storage bucket policy'leri
\echo ''
\echo '▶ 6) Storage bucket sayısı (BEKLENEN: en az 5):'
SELECT COUNT(*) AS buckets FROM storage.buckets;

-- 7. Toplam policy sayısı + RLS oranı
\echo ''
\echo '▶ 7) Toplam DB istatistikleri:'
SELECT 'total_tables'        AS metric, COUNT(*)::text FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' AND table_name<>'spatial_ref_sys'
UNION ALL SELECT 'total_views',         COUNT(*)::text FROM information_schema.views WHERE table_schema='public'
UNION ALL SELECT 'rls_enabled_tables',  COUNT(*)::text FROM pg_tables WHERE schemaname='public' AND rowsecurity=true
UNION ALL SELECT 'total_policies',      COUNT(*)::text FROM pg_policies WHERE schemaname='public';

\echo ''
\echo '═══════════════════════════════════════════════════════════════════════'
\echo '  KONTROL TAMAM. Yukarıdaki adımlarda hiçbir bulgu olmamalı.'
\echo '═══════════════════════════════════════════════════════════════════════'
