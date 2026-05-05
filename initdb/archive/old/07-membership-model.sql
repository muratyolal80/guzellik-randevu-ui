-- Migration: Membership Model (RBAC) - Revised for BigInt compatibility
-- Purpose: Support multiple salons, branches, and staff memberships.

-- 1. Create Membership Table
CREATE TABLE IF NOT EXISTS public.salon_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- Use UUID for Supabase compatibility
    user_id_bigint BIGINT, -- Use BigInt for legacy/docker compatibility
    salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('OWNER', 'MANAGER', 'STAFF')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Migrate existing owner_id from salons table to memberships
-- We check if owner_id is UUID or BigInt
DO $$ 
BEGIN 
    -- If owner_id is bigint (as seen in local docker)
    INSERT INTO public.salon_memberships (user_id_bigint, salon_id, role)
    SELECT owner_id, id, 'OWNER'
    FROM public.salons
    ON CONFLICT DO NOTHING;
EXCEPTION WHEN OTHERS THEN
    -- Fallback for UUID owner_id
    INSERT INTO public.salon_memberships (user_id, salon_id, role)
    SELECT owner_id::uuid, id, 'OWNER'
    FROM public.salons
    ON CONFLICT DO NOTHING;
END $$;

-- 3. Enable RLS or basic SELECT
ALTER TABLE public.salon_memberships ENABLE ROW LEVEL SECURITY;

-- Dynamic Policy: Allow users to see their memberships via either ID type
CREATE POLICY "Users can view their own memberships" ON public.salon_memberships
    FOR SELECT USING (
        (user_id IS NOT NULL AND user_id = auth.uid()) OR 
        (user_id_bigint IS NOT NULL AND user_id_bigint::text = auth.uid()::text)
    );

-- 4. Simplified Salon View with Membership
CREATE OR REPLACE VIEW public.salon_details_with_membership AS
SELECT s.*, m.role AS user_role, m.user_id AS current_user_id
FROM public.salon_details s
LEFT JOIN public.salon_memberships m ON s.id = m.salon_id;
