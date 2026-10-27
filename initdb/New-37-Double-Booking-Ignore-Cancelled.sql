-- =============================================================================
-- New-37-Double-Booking-Ignore-Cancelled.sql  (Roadmap F11 — booking flow)
-- prevent_staff_double_booking had no WHERE clause, so CANCELLED / NO_SHOW
-- appointments kept blocking their time forever: the slot engine showed the slot
-- as free, the customer picked it, and the insert failed with 23P01
-- ("Bu saat dilimi dolu"). Only appointments that really occupy the staff count now.
-- Safe on existing data: the old constraint was stricter (no live overlaps exist).
-- =============================================================================
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS prevent_staff_double_booking;

ALTER TABLE public.appointments
    ADD CONSTRAINT prevent_staff_double_booking
    EXCLUDE USING gist (
        staff_id WITH =,
        tstzrange(start_time, end_time, '[)') WITH &&
    ) WHERE (status NOT IN ('CANCELLED', 'NO_SHOW'));

NOTIFY pgrst, 'reload schema';
