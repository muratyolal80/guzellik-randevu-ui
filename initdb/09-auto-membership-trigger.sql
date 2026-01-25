-- Migration: Auto-Membership Trigger
-- Purpose: Automatically add the creator as an OWNER in salon_memberships when a salon is created.

-- 1. Create the trigger function
CREATE OR REPLACE FUNCTION public.on_salon_created_add_membership()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.salon_memberships (user_id, salon_id, role, is_active)
    VALUES (NEW.owner_id, NEW.id, 'OWNER', true)
    ON CONFLICT (user_id, salon_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger
DROP TRIGGER IF EXISTS tr_salon_created_membership ON public.salons;
CREATE TRIGGER tr_salon_created_membership
    AFTER INSERT ON public.salons
    FOR EACH ROW
    EXECUTE FUNCTION public.on_salon_created_add_membership();

-- 3. Safety check: Ensure owner_id column exists and is used
-- (Already confirmed in previous steps)
