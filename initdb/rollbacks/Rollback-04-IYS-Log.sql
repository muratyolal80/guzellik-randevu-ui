-- Rollback-04-IYS-Log.sql
-- ⚠️ YIKICI: iys_log tablosu silinirse mevcut tüm IYS kayıtları kaybolur.
-- Yasal sebeplerle BU TABLOYU SİLMEYİN. Sadece test ortamında.

DROP TABLE IF EXISTS public.iys_log CASCADE;

NOTIFY pgrst, 'reload schema';
