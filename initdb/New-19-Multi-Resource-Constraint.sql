-- =============================================================================
-- New-19-Multi-Resource-Constraint.sql
-- Faz: Sprint D (R2) — Multi-resource overbooking guard
-- Amaç: Hizmet bazlı kaynak gereksinimi + randevu sırasında kaynak lock
-- =============================================================================

-- 1. Hangi hizmet hangi kaynağı kaç adet kullanır?
CREATE TABLE IF NOT EXISTS public.salon_service_resources (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id uuid NOT NULL REFERENCES public.salon_services(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES public.salon_resources(id) ON DELETE CASCADE,
  qty integer DEFAULT 1 CHECK (qty > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service_id, resource_id)
);

COMMENT ON TABLE public.salon_service_resources IS
  'Bir hizmetin hangi salon kaynaklarına ihtiyaç duyduğu (ör. saç boya = 1 koltuk + 1 boya istasyonu).';

CREATE INDEX IF NOT EXISTS idx_ssr_service ON public.salon_service_resources(service_id);
CREATE INDEX IF NOT EXISTS idx_ssr_resource ON public.salon_service_resources(resource_id);

-- 2. Randevuya bağlı kaynak rezervasyonu (overbooking guard)
CREATE TABLE IF NOT EXISTS public.appointment_resources (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES public.salon_resources(id) ON DELETE CASCADE,
  qty integer DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(appointment_id, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_ar_appointment ON public.appointment_resources(appointment_id);
CREATE INDEX IF NOT EXISTS idx_ar_resource ON public.appointment_resources(resource_id);

-- 3. RLS — salon sahibi/personel gerek var ama public booking sırasında insert et
ALTER TABLE public.salon_service_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_resources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ssr_owner_full" ON public.salon_service_resources;
CREATE POLICY "ssr_owner_full" ON public.salon_service_resources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.salon_services ss
      JOIN public.salons s ON s.id = ss.salon_id
      WHERE ss.id = salon_service_resources.service_id
        AND (s.owner_id = auth.uid() OR auth.role() = 'service_role')
    )
  );

DROP POLICY IF EXISTS "ssr_public_select" ON public.salon_service_resources;
CREATE POLICY "ssr_public_select" ON public.salon_service_resources
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "ar_self_full" ON public.appointment_resources;
CREATE POLICY "ar_self_full" ON public.appointment_resources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.appointments a
      WHERE a.id = appointment_resources.appointment_id
        AND (a.customer_id = auth.uid() OR a.staff_id = auth.uid() OR auth.role() = 'service_role')
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON public.salon_service_resources TO authenticated;
GRANT SELECT ON public.salon_service_resources TO anon;
GRANT ALL ON public.salon_service_resources TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointment_resources TO authenticated;
GRANT SELECT ON public.appointment_resources TO anon;
GRANT ALL ON public.appointment_resources TO service_role;

-- 4. RPC — bir slot'ta kaynaklar yeterli mi?
CREATE OR REPLACE FUNCTION public.check_resource_availability(
  p_salon_id uuid,
  p_service_id uuid,
  p_slot_start TIMESTAMPTZ,
  p_slot_end TIMESTAMPTZ
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  req RECORD;
  in_use int;
BEGIN
  FOR req IN
    SELECT ssr.resource_id, ssr.qty, COALESCE(sr.capacity, 1) AS capacity
    FROM public.salon_service_resources ssr
    JOIN public.salon_resources sr ON sr.id = ssr.resource_id
    WHERE ssr.service_id = p_service_id
      AND sr.salon_id = p_salon_id
      AND sr.is_active = true
  LOOP
    SELECT COALESCE(SUM(ar.qty), 0) INTO in_use
    FROM public.appointment_resources ar
    JOIN public.appointments a ON a.id = ar.appointment_id
    WHERE ar.resource_id = req.resource_id
      AND a.status NOT IN ('CANCELLED', 'NO_SHOW')
      AND tstzrange(a.start_time, a.end_time, '[)') && tstzrange(p_slot_start, p_slot_end, '[)');

    IF (in_use + req.qty) > req.capacity THEN
      RETURN false;
    END IF;
  END LOOP;

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_resource_availability(uuid, uuid, TIMESTAMPTZ, TIMESTAMPTZ) TO authenticated, anon;

-- 5. Migration log
INSERT INTO public._migrations (name, applied_at)
VALUES ('New-19-Multi-Resource-Constraint.sql', NOW())
ON CONFLICT (name) DO NOTHING;

DO $$ BEGIN
  RAISE NOTICE 'New-19 OK: salon_service_resources + appointment_resources + check_resource_availability RPC';
END $$;

NOTIFY pgrst, 'reload schema';
