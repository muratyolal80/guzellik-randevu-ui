-- =============================================
-- New-39-Security-Audit.sql
-- Enforces RLS consistency and provides full Admin access to all core tables
-- =============================================

-- 1. APPOINTMENTS (Admin Access)
DROP POLICY IF EXISTS "Admins manage all appointments" ON public.appointments;
CREATE POLICY "Admins manage all appointments" ON public.appointments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'SUPER_ADMIN'
        )
    );

-- 2. IYS LOGS (Security & Compliance)
ALTER TABLE public.iys_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage all iys_logs" ON public.iys_logs;
CREATE POLICY "Admins manage all iys_logs" ON public.iys_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'SUPER_ADMIN'
        )
    );

-- 3. REVIEWS (Admin Management)
DROP POLICY IF EXISTS "Admins manage all reviews" ON public.reviews;
CREATE POLICY "Admins manage all reviews" ON public.reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'SUPER_ADMIN'
        )
    );

-- 4. SALON GALLERY (Admin Access)
DROP POLICY IF EXISTS "admins_manage_all_gallery" ON public.salon_gallery;
CREATE POLICY "admins_manage_all_gallery" ON public.salon_gallery
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'SUPER_ADMIN'
        )
    );

-- 5. REVIEW IMAGES (Admin Access)
DROP POLICY IF EXISTS "admins_manage_all_review_images" ON public.review_images;
CREATE POLICY "admins_manage_all_review_images" ON public.review_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'SUPER_ADMIN'
        )
    );

-- 6. AUDIT LOGS (Owner Insert Access - Needed for logging automation)
-- Ensure that the backend can insert audit logs when actions happen
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
CREATE POLICY "System can insert audit logs" ON public.audit_logs 
    FOR INSERT WITH CHECK (true);

-- 7. NOTIFICATIONS (System Insert Access)
-- Ensure system-level events can trigger notifications
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "System can insert notifications" ON public.notifications 
    FOR INSERT WITH CHECK (true);

-- 8. ANALYTICS / AUDIT CONSISTENCY
COMMENT ON TABLE public.audit_logs IS 'System audit trail for security and transparency';
COMMENT ON TABLE public.iys_logs IS 'SMS and commercial message compliance logs';
