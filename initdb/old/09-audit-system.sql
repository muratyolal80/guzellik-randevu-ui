-- Audit Log System for GuzellikRandevu Platform
-- Tracks all critical data changes for accountability and compliance

-- Audit log table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_email TEXT, -- Denormalized for safety (in case user deleted)
    action TEXT NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    old_values JSONB, -- Previous state (UPDATE/DELETE only)
    new_values JSONB, -- New state (CREATE/UPDATE only)
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_table_record ON public.audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.audit_logs(action);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
        )
    );

-- Function to log audit trail (called manually from app code)
CREATE OR REPLACE FUNCTION public.log_audit(
    p_user_id UUID,
    p_action TEXT,
    p_table_name TEXT,
    p_record_id UUID,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
    v_user_email TEXT;
BEGIN
    -- Get user email for denormalization
    SELECT email INTO v_user_email FROM public.profiles WHERE id = p_user_id;
    
    INSERT INTO public.audit_logs (
        user_id, user_email, action, table_name, record_id,
        old_values, new_values, ip_address, user_agent
    ) VALUES (
        p_user_id, v_user_email, p_action, p_table_name, p_record_id,
        p_old_values, p_new_values, p_ip_address, p_user_agent
    )
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function for automatic audit on critical tables
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM public.log_audit(
            auth.uid(),
            'DELETE',
            TG_TABLE_NAME,
            OLD.id,
            row_to_json(OLD)::jsonb,
            NULL
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM public.log_audit(
            auth.uid(),
            'UPDATE',
            TG_TABLE_NAME,
            NEW.id,
            row_to_json(OLD)::jsonb,
            row_to_json(NEW)::jsonb
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        PERFORM public.log_audit(
            auth.uid(),
            'CREATE',
            TG_TABLE_NAME,
            NEW.id,
            NULL,
            row_to_json(NEW)::jsonb
        );
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to critical tables
DROP TRIGGER IF EXISTS audit_salons ON public.salons;
CREATE TRIGGER audit_salons
    AFTER INSERT OR UPDATE OR DELETE ON public.salons
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

DROP TRIGGER IF EXISTS audit_appointments ON public.appointments;
CREATE TRIGGER audit_appointments
    AFTER INSERT OR UPDATE OR DELETE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

DROP TRIGGER IF EXISTS audit_staff ON public.staff;
CREATE TRIGGER audit_staff
    AFTER INSERT OR UPDATE OR DELETE ON public.staff
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

DROP TRIGGER IF EXISTS audit_salon_services ON public.salon_services;
CREATE TRIGGER audit_salon_services
    AFTER INSERT OR UPDATE OR DELETE ON public.salon_services
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

DROP TRIGGER IF EXISTS audit_profiles ON public.profiles;
CREATE TRIGGER audit_profiles
    AFTER INSERT OR UPDATE OR DELETE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- Cleanup old audit logs (optional, run periodically)
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs(days_to_keep INTEGER DEFAULT 730)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.audit_logs
    WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
