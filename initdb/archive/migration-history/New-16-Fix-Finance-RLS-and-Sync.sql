-- New-16-Fix-Finance-RLS-and-Sync.sql
-- 1. Enable RLS for finance tables if not enabled
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- 2. Subscription Policies
DROP POLICY IF EXISTS "Admins manage all subscriptions" ON public.subscriptions;
CREATE POLICY "Admins manage all subscriptions" ON public.subscriptions FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN'));

DROP POLICY IF EXISTS "Owners view own subscriptions" ON public.subscriptions;
CREATE POLICY "Owners view own subscriptions" ON public.subscriptions FOR SELECT
    USING (salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid()));

-- 3. Payment History Policies
DROP POLICY IF EXISTS "Admins manage all payment_history" ON public.payment_history;
CREATE POLICY "Admins manage all payment_history" ON public.payment_history FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN'));

DROP POLICY IF EXISTS "Owners view own payment_history" ON public.payment_history;
CREATE POLICY "Owners view own payment_history" ON public.payment_history FOR SELECT
    USING (salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid()));

-- 4. RPC Fix (Optional but good for safety)
-- The activate_salon_and_subscription RPC is already SECURITY DEFINER, so it bypasses RLS.
