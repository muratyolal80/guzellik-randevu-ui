-- =============================================================================
-- New-17-PostGIS-Salon-Coordinates.sql
-- Faz: Sprint C (K2) — Konum bazlı arama
-- Amaç: PostGIS coğrafi sorgu altyapısı + ST_DWithin ile "yakındaki salon"
-- =============================================================================

-- 1. PostGIS extension (yoksa kur)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. salons tablosuna geography sütunu (idempotent)
ALTER TABLE public.salons
  ADD COLUMN IF NOT EXISTS coordinates geography(Point, 4326);

COMMENT ON COLUMN public.salons.coordinates IS
  'PostGIS geography(Point, 4326) — geo_latitude/geo_longitude''dan otomatik üretilir';

-- 3. Mevcut verileri doldur (geo_latitude/longitude varsa)
UPDATE public.salons
SET coordinates = ST_SetSRID(ST_MakePoint(geo_longitude::float8, geo_latitude::float8), 4326)::geography
WHERE coordinates IS NULL
  AND geo_latitude IS NOT NULL
  AND geo_longitude IS NOT NULL
  AND geo_latitude != 0
  AND geo_longitude != 0;

-- 4. Trigger: lat/lng update edilince coordinates otomatik güncellesin
CREATE OR REPLACE FUNCTION public.salons_sync_coordinates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.geo_latitude IS NOT NULL
     AND NEW.geo_longitude IS NOT NULL
     AND NEW.geo_latitude != 0
     AND NEW.geo_longitude != 0 THEN
    NEW.coordinates := ST_SetSRID(
      ST_MakePoint(NEW.geo_longitude::float8, NEW.geo_latitude::float8),
      4326
    )::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS salons_coordinates_sync ON public.salons;
CREATE TRIGGER salons_coordinates_sync
  BEFORE INSERT OR UPDATE OF geo_latitude, geo_longitude
  ON public.salons
  FOR EACH ROW
  EXECUTE FUNCTION public.salons_sync_coordinates();

-- 5. GiST index (spatial sorgu performansı)
CREATE INDEX IF NOT EXISTS idx_salons_coordinates
  ON public.salons USING GIST (coordinates);

-- 6. RPC — salons within radius (Supabase JS'ten çağrılır)
CREATE OR REPLACE FUNCTION public.salons_within_radius(
  center_lat double precision,
  center_lng double precision,
  radius_km integer DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  image text,
  city_name text,
  district_name text,
  average_rating numeric,
  is_sponsored boolean,
  distance_km double precision
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    s.id,
    s.name,
    s.slug,
    s.image,
    c.name AS city_name,
    d.name AS district_name,
    s.average_rating,
    s.is_sponsored,
    ROUND(
      (ST_Distance(
        s.coordinates,
        ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography
      ) / 1000.0)::numeric,
      2
    )::double precision AS distance_km
  FROM public.salons s
  LEFT JOIN public.cities c ON s.city_id = c.id
  LEFT JOIN public.districts d ON s.district_id = d.id
  WHERE s.status = 'APPROVED'
    AND s.coordinates IS NOT NULL
    AND ST_DWithin(
      s.coordinates,
      ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography,
      radius_km * 1000.0
    )
  ORDER BY s.coordinates <-> ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography
  LIMIT 200;
$$;

GRANT EXECUTE ON FUNCTION public.salons_within_radius(double precision, double precision, integer) TO anon, authenticated;

-- 7. _migrations kaydı
INSERT INTO public._migrations (name, applied_at)
VALUES ('New-17-PostGIS-Salon-Coordinates.sql', NOW())
ON CONFLICT (name) DO NOTHING;

-- 8. Doğrulama
DO $$
DECLARE
  geo_count int;
  total_count int;
BEGIN
  SELECT COUNT(*) INTO geo_count FROM public.salons WHERE coordinates IS NOT NULL;
  SELECT COUNT(*) INTO total_count FROM public.salons;
  RAISE NOTICE 'New-17 OK: % / % salonda coordinates dolu', geo_count, total_count;
END $$;

NOTIFY pgrst, 'reload schema';
