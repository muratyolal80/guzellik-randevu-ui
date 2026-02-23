-- =============================================
-- New-19-Branding-And-Audit.sql
-- Adds branding (colors/logo) and audit logging for SaaS architecture
-- =============================================

-- 1. Add Branding Columns to Salons
ALTER TABLE public.salons 
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#CFA76D',
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS banner_url TEXT;

COMMENT ON COLUMN public.salons.primary_color IS 'Business brand primary color (HEX)';
COMMENT ON COLUMN public.salons.logo_url IS 'Business brand logo (Storage URL)';

-- 2. Audit Logs Table (For security and tracking)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid DEFAULT public.uuid_generate_v4() PRIMARY KEY,
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- e.g., 'APPOINTMENT_CANCELLED', 'STAFF_ADDED', 'PLAN_UPGRADED'
    resource_type TEXT NOT NULL, -- e.g., 'appointment', 'staff', 'salon'
    resource_id TEXT, -- ID of the modified resource
    changes JSONB, -- Before/After values
    ip_address TEXT,
    user_agent TEXT,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for Audit Logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only SUPER_ADMIN and the Salon OWNER can view their audit logs
CREATE POLICY "Super admins can see all audit logs" 
ON public.audit_logs FOR SELECT 
TO authenticated 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN'));

CREATE POLICY "Owners can see their own salon audit logs" 
ON public.audit_logs FOR SELECT 
TO authenticated 
USING (salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid()));

-- Create Index for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_salon_id ON public.audit_logs(salon_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- 3. Dynamic Service Level View Update (Optional but helpful)
-- Refresh salon_details view to include new columns if needed (assuming salon_details uses select *)
-- If it's a static view, it would need a DROP and CREATE. 
-- For now, we manually check.
