-- =============================================
-- New-20-Account-Security-KVKK.sql
-- Adds session management, soft-delete, and KVKK/Preferences for profiles
-- =============================================

-- 1. Updates to Profiles Table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS kvkk_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS marketing_opt_in BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'tr',
ADD COLUMN IF NOT EXISTS default_city_id UUID REFERENCES public.cities(id);

COMMENT ON COLUMN public.profiles.deleted_at IS 'Timestamp for soft-delete';
COMMENT ON COLUMN public.profiles.kvkk_accepted_at IS 'When the user accepted KVKK terms';
COMMENT ON COLUMN public.profiles.marketing_opt_in IS 'User preference for marketing communications';

-- 2. User Sessions Table (To track active devices/sessions)
-- Note: Supabase Auth already handles sessions, but this table allows us 
-- to provide a UI to the user to "view & terminate sessions" specifically 
-- for our app context if we use custom tokens or just for logging.
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    ip_address TEXT,
    user_agent TEXT,
    device_name TEXT,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    is_revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Session Policies
CREATE POLICY "Users can view their own sessions" 
ON public.user_sessions FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Users can terminate (delete) their own sessions" 
ON public.user_sessions FOR DELETE 
TO authenticated 
USING (user_id = auth.uid());

-- Indexing
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);

-- 3. Soft Delete Helper Function
CREATE OR REPLACE FUNCTION public.request_account_deletion()
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles 
    SET deleted_at = now() + interval '30 days', -- 30 days recovery period
        is_active = false
    WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Audit Log Action for Security
-- (Already having audit_logs table from New-19)
-- We can add a trigger or just handle it in service layer.

-- 5. Update salon_details view if needed
-- (Profiles additions don't strictly require view update unless we show these info in salon context)
