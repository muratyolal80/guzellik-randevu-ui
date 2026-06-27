-- New-12-Notifications-Select-Grant.sql
-- Problem: NotificationCenter (client-side, 'authenticated' role) gets
--   "permission denied for table notifications" (SQLSTATE 42501) on SELECT.
-- Root cause: 'authenticated' was granted INSERT/UPDATE/DELETE on public.notifications
--   but NOT SELECT. The RLS policy users_view_own_notifications (USING auth.uid() = user_id)
--   exists, but RLS sits on top of table GRANTs — without the base SELECT grant
--   PostgREST cannot read the table at all.
-- Fix: grant SELECT to 'authenticated'. Row visibility stays restricted to the
--   user's own rows by the existing SELECT RLS policy, so this is not a data exposure.

GRANT SELECT ON public.notifications TO authenticated;

-- Safety check: confirm RLS is still enabled (must remain true).
DO $$
BEGIN
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'notifications') THEN
    RAISE EXCEPTION 'RLS is disabled on public.notifications — refusing to leave SELECT grant without row-level protection';
  END IF;
END $$;
