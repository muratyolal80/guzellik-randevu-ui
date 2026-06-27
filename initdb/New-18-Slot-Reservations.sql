-- =============================================================================
-- New-18-Slot-Reservations.sql
-- Faz: Sprint D (R4) — Slot lock (concurrent booking race condition guard)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.slot_reservations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
  staff_id uuid REFERENCES public.staff(id) ON DELETE CASCADE,
  service_id uuid REFERENCES public.salon_services(id) ON DELETE CASCADE,
  slot_start TIMESTAMPTZ NOT NULL,
  slot_end   TIMESTAMPTZ NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '5 minutes'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.slot_reservations IS 'Müşteri booking step 3 → step 4 arasında slot rezerve eder, 5 dk TTL.';

CREATE INDEX IF NOT EXISTS idx_slot_res_salon_staff_time
  ON public.slot_reservations (salon_id, staff_id, slot_start, slot_end);

CREATE INDEX IF NOT EXISTS idx_slot_res_expires
  ON public.slot_reservations (expires_at);

ALTER TABLE public.slot_reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "slot_res_self_select" ON public.slot_reservations;
CREATE POLICY "slot_res_self_select" ON public.slot_reservations
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "slot_res_self_insert" ON public.slot_reservations;
CREATE POLICY "slot_res_self_insert" ON public.slot_reservations
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "slot_res_self_delete" ON public.slot_reservations;
CREATE POLICY "slot_res_self_delete" ON public.slot_reservations
  FOR DELETE USING (auth.uid() = user_id OR auth.role() = 'service_role');

GRANT SELECT, INSERT, DELETE ON public.slot_reservations TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.slot_reservations TO anon;
GRANT ALL ON public.slot_reservations TO service_role;

-- RPC — atomic acquire (boş ise lock al, dolu ise null dön)
CREATE OR REPLACE FUNCTION public.acquire_slot_lock(
  p_salon_id uuid,
  p_staff_id uuid,
  p_service_id uuid,
  p_slot_start TIMESTAMPTZ,
  p_slot_end TIMESTAMPTZ,
  p_user_id uuid DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_count int;
  v_appt_count int;
  v_new_id uuid;
BEGIN
  -- Önce expired olanları temizle
  DELETE FROM public.slot_reservations WHERE expires_at < NOW();

  -- Aynı slot için aktif rezervasyon var mı?
  SELECT COUNT(*) INTO v_existing_count
  FROM public.slot_reservations
  WHERE salon_id = p_salon_id
    AND (staff_id = p_staff_id OR (staff_id IS NULL AND p_staff_id IS NULL))
    AND tstzrange(slot_start, slot_end, '[)') && tstzrange(p_slot_start, p_slot_end, '[)')
    AND expires_at > NOW();

  IF v_existing_count > 0 THEN
    RETURN NULL;
  END IF;

  -- Mevcut randevu var mı? (status != CANCELLED)
  SELECT COUNT(*) INTO v_appt_count
  FROM public.appointments
  WHERE salon_id = p_salon_id
    AND staff_id = p_staff_id
    AND status NOT IN ('CANCELLED', 'NO_SHOW')
    AND tstzrange(start_time, end_time, '[)') && tstzrange(p_slot_start, p_slot_end, '[)');

  IF v_appt_count > 0 THEN
    RETURN NULL;
  END IF;

  -- Lock kabul, insert et
  INSERT INTO public.slot_reservations
    (salon_id, staff_id, service_id, slot_start, slot_end, user_id, session_id)
  VALUES
    (p_salon_id, p_staff_id, p_service_id, p_slot_start, p_slot_end, p_user_id, p_session_id)
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.acquire_slot_lock(uuid, uuid, uuid, TIMESTAMPTZ, TIMESTAMPTZ, uuid, TEXT) TO authenticated, anon;

-- Migration log
INSERT INTO public._migrations (name, applied_at)
VALUES ('New-18-Slot-Reservations.sql', NOW())
ON CONFLICT (name) DO NOTHING;

DO $$ BEGIN
  RAISE NOTICE 'New-18 OK: slot_reservations + acquire_slot_lock RPC';
END $$;

NOTIFY pgrst, 'reload schema';
