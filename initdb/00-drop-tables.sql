-- ============================================================
-- 00-drop-tables.sql
-- Güzellik Randevu - Veritabanı Temizleme Scripti
-- ============================================================

-- Force drop the public schema to ensure everything is gone
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Standard permissions
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
COMMENT ON SCHEMA public IS 'standard public schema';

-- Extra: Clear extensions to be re-enabled in Master script
-- DROP EXTENSION IF EXISTS "uuid-ossp";
-- DROP EXTENSION IF EXISTS "postgis";
-- DROP EXTENSION IF EXISTS "btree_gist";
