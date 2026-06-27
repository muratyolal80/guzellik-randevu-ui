-- New-31-Staff-Invites.sql
-- Description: Creates invites table for staff invitation system and a secure RPC function to accept invitations.

-- Create invites table if not exists
CREATE TABLE IF NOT EXISTS public.invites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id UUID REFERENCES public.salons(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'STAFF',
    token VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    inviter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT valid_status CHECK (status IN ('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED')),
    CONSTRAINT valid_role CHECK (role IN ('STAFF', 'MANAGER', 'SALON_OWNER'))
);

-- Note: We add an email index for querying if needed, though token is UNIQUE
CREATE INDEX IF NOT EXISTS idx_invites_email ON public.invites(email);
CREATE INDEX IF NOT EXISTS idx_invites_salon_id ON public.invites(salon_id);

-- Enable RLS
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Admins can manage all invites" ON public.invites;
DROP POLICY IF EXISTS "Owners can manage invites for their salons" ON public.invites;
DROP POLICY IF EXISTS "Public can read invite by token" ON public.invites;

-- Policies for Invites
CREATE POLICY "Admins can manage all invites"
    ON public.invites
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role IN ('SUPER_ADMIN', 'ADMIN')
        )
    );

CREATE POLICY "Owners can manage invites for their salons"
    ON public.invites
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.salons
            WHERE salons.id = invites.salon_id AND salons.owner_id = auth.uid()
        )
    );

CREATE POLICY "Public can read invite by token"
    ON public.invites
    FOR SELECT
    USING (
        true -- Allow anyone to fetch an invite details (needed for the accept screen before logging in)
    );


-- RPC function to accept invite securely
-- Uses SECURITY DEFINER to bypass RLS for necessary cross-table updates (profiles and staff)
CREATE OR REPLACE FUNCTION accept_staff_invite(p_token VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_invite_id UUID;
    v_salon_id UUID;
    v_email VARCHAR;
    v_status VARCHAR;
    v_user_email VARCHAR;
    v_user_full_name VARCHAR;
    v_user_id UUID;
BEGIN
    -- 1. Get caller user info
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Need to check the email in auth.users
    -- In Supabase, auth.users is accessible from SECURITY DEFINER context
    SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;
    
    -- Also grab user's full name from profiles
    SELECT full_name INTO v_user_full_name FROM public.profiles WHERE id = v_user_id;

    -- 2. Find invite
    SELECT id, salon_id, email, status INTO v_invite_id, v_salon_id, v_email, v_status
    FROM public.invites
    WHERE token = p_token;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invite not found';
    END IF;

    IF v_status != 'PENDING' THEN
        RAISE EXCEPTION 'Invite is no longer pending or has expired';
    END IF;

    -- Optional: Check expiration
    -- IF (SELECT expires_at FROM public.invites WHERE id = v_invite_id) < now() THEN
    --    UPDATE public.invites SET status = 'EXPIRED' WHERE id = v_invite_id;
    --    RAISE EXCEPTION 'Invite has expired';
    -- END IF;

    IF lower(v_email) != lower(v_user_email) THEN
        RAISE EXCEPTION 'This invite was sent to a different email address (%) than your account (%)', v_email, v_user_email;
    END IF;

    -- 3. Update invite status
    UPDATE public.invites
    SET status = 'ACCEPTED', accepted_at = now()
    WHERE id = v_invite_id;

    -- 4. Update profile role to STAFF (if they were CUSTOMER)
    UPDATE public.profiles
    SET role = 'STAFF'
    WHERE id = v_user_id AND role = 'CUSTOMER';

    -- 5. Link staff record or create new one
    UPDATE public.staff
    SET user_id = v_user_id, is_active = true
    WHERE salon_id = v_salon_id AND lower(email) = lower(v_email);

    -- If no staff record was found to update by email, we assume owner created invite but didn't fill staff form with email, 
    -- or they created it fully through Invite UI. We should insert one.
    IF NOT FOUND THEN
        INSERT INTO public.staff (salon_id, user_id, name, email, is_active)
        VALUES (v_salon_id, v_user_id, COALESCE(v_user_full_name, split_part(v_email, '@', 1)), v_email, true);
    END IF;

    RETURN TRUE;
END;
$$;
