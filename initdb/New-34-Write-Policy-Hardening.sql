-- =============================================================================
-- New-34-Write-Policy-Hardening.sql  (Roadmap F6)
--   1. notifications: INSERT WITH CHECK (true) → anyone could send any user a
--      notification (phishing link in `link`). Now: self, admin, or salon
--      owner/staff → a customer who has an appointment at that salon.
--   2. audit_logs: INSERT WITH CHECK (true) → forged audit entries for any salon.
--      Now: actor = auth.uid() (column default) and actor belongs to the salon
--      (owner / staff / member / customer with an appointment there / admin).
--   3. slot_reservations: direct INSERT open to anon with user_id NULL and
--      client-chosen expires_at → a salon's whole calendar could be locked
--      forever. Locks are only taken via acquire_slot_lock() (definer).
-- Each DROP POLICY below is replaced in the same transaction (no gap).
-- =============================================================================

CREATE OR REPLACE FUNCTION public.can_act_for_salon(p_salon_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT public.is_admin()
      OR EXISTS (SELECT 1 FROM public.salons WHERE id = p_salon_id AND owner_id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.staff WHERE salon_id = p_salon_id AND user_id = auth.uid() AND is_active)
      OR EXISTS (SELECT 1 FROM public.salon_memberships WHERE salon_id = p_salon_id AND user_id = auth.uid() AND is_active);
$$;
REVOKE ALL ON FUNCTION public.can_act_for_salon(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.can_act_for_salon(uuid) TO authenticated, service_role;

-- ─── 1. notifications
DROP POLICY IF EXISTS "system_insert_notifications" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_scoped" ON public.notifications;
CREATE POLICY "notifications_insert_scoped" ON public.notifications
    FOR INSERT TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        OR public.is_admin()
        OR (
            salon_id IS NOT NULL
            AND public.can_act_for_salon(salon_id)
            AND EXISTS (SELECT 1 FROM public.appointments a
                        WHERE a.salon_id = notifications.salon_id AND a.customer_id = notifications.user_id)
        )
    );

-- ─── 2. audit_logs
ALTER TABLE public.audit_logs ALTER COLUMN user_id SET DEFAULT auth.uid();

DROP POLICY IF EXISTS "system_insert_audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "users_insert_own_audit" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_insert_scoped" ON public.audit_logs;
CREATE POLICY "audit_insert_scoped" ON public.audit_logs
    FOR INSERT TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        AND (
            public.can_act_for_salon(salon_id)
            OR EXISTS (SELECT 1 FROM public.appointments a
                       WHERE a.salon_id = audit_logs.salon_id AND a.customer_id = auth.uid())
        )
    );

-- ─── 3. slot_reservations: RPC only
DROP POLICY IF EXISTS "slot_res_self_insert" ON public.slot_reservations;
REVOKE INSERT ON public.slot_reservations FROM anon, authenticated;

-- acquire_slot_lock must not trust a client-supplied user id
CREATE OR REPLACE FUNCTION public.acquire_slot_lock(
  p_salon_id uuid, p_staff_id uuid, p_service_id uuid,
  p_slot_start timestamptz, p_slot_end timestamptz,
  p_user_id uuid DEFAULT NULL, p_session_id text DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_existing_count int;
  v_appt_count int;
  v_new_id uuid;
BEGIN
  IF p_slot_end <= p_slot_start OR p_slot_end - p_slot_start > interval '8 hours' THEN
    RETURN NULL;
  END IF;

  DELETE FROM public.slot_reservations WHERE expires_at < NOW();

  SELECT COUNT(*) INTO v_existing_count
  FROM public.slot_reservations
  WHERE salon_id = p_salon_id
    AND (staff_id = p_staff_id OR (staff_id IS NULL AND p_staff_id IS NULL))
    AND tstzrange(slot_start, slot_end, '[)') && tstzrange(p_slot_start, p_slot_end, '[)')
    AND expires_at > NOW();
  IF v_existing_count > 0 THEN
    RETURN NULL;
  END IF;

  SELECT COUNT(*) INTO v_appt_count
  FROM public.appointments
  WHERE salon_id = p_salon_id
    AND staff_id = p_staff_id
    AND status NOT IN ('CANCELLED', 'NO_SHOW')
    AND tstzrange(start_time, end_time, '[)') && tstzrange(p_slot_start, p_slot_end, '[)');
  IF v_appt_count > 0 THEN
    RETURN NULL;
  END IF;

  -- one active lock per session/user: picking a new slot releases the previous one
  DELETE FROM public.slot_reservations
  WHERE (auth.uid() IS NOT NULL AND user_id = auth.uid())
     OR (p_session_id IS NOT NULL AND session_id = p_session_id);

  INSERT INTO public.slot_reservations
    (salon_id, staff_id, service_id, slot_start, slot_end, user_id, session_id)
  VALUES
    (p_salon_id, p_staff_id, p_service_id, p_slot_start, p_slot_end, auth.uid(), p_session_id)
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$;

-- ─── 4. staff: owners must not point a staff card at an arbitrary account.
--      /api/owner/staff/[id]/reset-password + disable-login act on staff.user_id
--      with service role → writable user_id = takeover of any user (incl. admins).
--      Clients may only link a card to THEMSELVES (solo-owner pattern) or unlink;
--      linking another account happens via accept_staff_invite() / server routes.
--      rating / review_count are not client-editable.
CREATE OR REPLACE FUNCTION public.guard_staff_privileged_columns()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    IF current_user NOT IN ('authenticated', 'anon') OR public.is_admin() THEN
        RETURN NEW;
    END IF;
    IF NEW.user_id IS NOT NULL
       AND NEW.user_id IS DISTINCT FROM auth.uid()
       AND (TG_OP = 'INSERT' OR NEW.user_id IS DISTINCT FROM OLD.user_id) THEN
        RAISE EXCEPTION 'staff.user_id can only be linked to your own account'
            USING ERRCODE = '42501';
    END IF;
    IF TG_OP = 'UPDATE' AND (NEW.rating IS DISTINCT FROM OLD.rating
                             OR NEW.review_count IS DISTINCT FROM OLD.review_count) THEN
        RAISE EXCEPTION 'rating is computed, not editable' USING ERRCODE = '42501';
    END IF;
    IF TG_OP = 'INSERT' THEN
        NEW.rating := 0; NEW.review_count := 0;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_staff_privileged_columns ON public.staff;
CREATE TRIGGER guard_staff_privileged_columns
    BEFORE INSERT OR UPDATE ON public.staff
    FOR EACH ROW EXECUTE FUNCTION public.guard_staff_privileged_columns();

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename IN ('notifications','audit_logs')
               AND cmd = 'INSERT' AND with_check = 'true' AND NOT ('service_role' = ANY (roles))) THEN
        RAISE EXCEPTION 'open INSERT policy remains';
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';
