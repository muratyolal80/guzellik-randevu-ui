-- Abonelik durumlarını periyodik olarak kontrol edip süresi dolanları EXPIRED yapacak script.
-- pg_cron eklentisini (eğer destekleniyorsa) kullanarak günlük olarak çalışacak bir fonksiyon oluştururuz.
-- Not: Supabase üzerinde pg_cron kullanmak için yetkili olmanız (veya extensions'dan açmanız) gerekir.

-- 1. Süresi dolan abonelikleri EXPIRED yapacak bir fonksiyon
CREATE OR REPLACE FUNCTION check_and_expire_subscriptions()
RETURNS void AS $$
BEGIN
  -- 1. Süresi bugün veya öncesinde dolmuş olan, fakat hala ACTIVE veya TRIAL görünen abonelikleri EXPIRED yap
  UPDATE public.subscriptions
  SET status = 'EXPIRED'
  WHERE (status = 'ACTIVE' OR status = 'TRIAL')
    AND current_period_end < CURRENT_TIMESTAMP;

  -- 2. Bu abonelikleri barındıran salonların durumunu INACTIVE (veya EXPIRED) olarak güncelleyebiliriz
  -- Ancak SubscriptionBanner zaten UI tarafında erişimi kestiği için, veritabanında da salonları
  -- SUSPENDED veya INACTIVE yapabiliriz. Şimdilik sadece abonelik statüsünü güncellemek yeterlidir,
  -- çünkü UI ve RLS kuralları bu duruma (EXPIRED) göre çalışmaktadır.
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. pg_cron aracılığıyla her gece saat 00:00'da kontrol et (opsiyonel)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('0 0 * * *', $$SELECT check_and_expire_subscriptions();$$);
