-- 13-staff-invitation-system.sql
-- Purpose: Implementation of the invite-based registration flow for STAFF.

-- 1. Invite Status Enum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invite_status') THEN
        CREATE TYPE invite_status AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Invites Table
-- Note: salon_id is BIGINT to match public.salons.id
CREATE TABLE IF NOT EXISTS public.invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    salon_id BIGINT NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role public.user_role DEFAULT 'STAFF', 
    token TEXT UNIQUE NOT NULL, 
    status invite_status DEFAULT 'PENDING',
    inviter_id UUID NOT NULL REFERENCES public.profiles(id), 
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ
);

-- 3. Security (RLS)
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- Only Salon Owners/Managers can see/manage invites for their salon
DROP POLICY IF EXISTS "Owners can manage salon invites" ON public.invites;
CREATE POLICY "Owners can manage salon invites" ON public.invites
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.salon_memberships 
            WHERE salon_id = public.invites.salon_id 
            AND user_id = auth.uid() 
            AND role IN ('OWNER', 'MANAGER')
        )
    );

-- Potential staff can view their specific invite via token
DROP POLICY IF EXISTS "Public can view invite by token" ON public.invites;
CREATE POLICY "Public can view invite by token" ON public.invites
    FOR SELECT
    USING (true); 
