-- =============================================================================
-- New-31-Marketplace-Setup.sql
-- RLS Policies, Triggers and Initial Settings for Marketplace
-- =============================================================================

-- 1. RLS POLICIES FOR NEW TABLES

-- platform_settings (Admin only write, everyone read for specific keys?)
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can do everything on platform_settings" ON public.platform_settings
    FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'SUPER_ADMIN'));
CREATE POLICY "Public can read non-sensitive platform_settings" ON public.platform_settings
    FOR SELECT USING (key IN ('bank_accounts', 'iyzico_config_public')); -- Sensitive keys (secretKey) are internal

-- subscription_plans (Public read, Admin write)
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can read active subscription_plans" ON public.subscription_plans
    FOR SELECT USING (is_active = true);
CREATE POLICY "Admin can manage subscription_plans" ON public.subscription_plans
    FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'SUPER_ADMIN'));

-- subscriptions (Owner read/write profile-specific, Admin all)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can see their own subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() IN (SELECT owner_id FROM public.salons WHERE id = salon_id));
CREATE POLICY "Admin can manage all subscriptions" ON public.subscriptions
    FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'SUPER_ADMIN'));

-- salon_sub_merchants (Owner read/write, Admin all)
ALTER TABLE public.salon_sub_merchants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can manage their sub-merchant info" ON public.salon_sub_merchants
    FOR ALL USING (auth.uid() IN (SELECT owner_id FROM public.salons WHERE id = salon_id));
CREATE POLICY "Admin can manage all sub-merchants" ON public.salon_sub_merchants
    FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'SUPER_ADMIN'));

-- payment_history (Owner read their salon, Admin all)
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can see their payment history" ON public.payment_history
    FOR SELECT USING (auth.uid() IN (SELECT owner_id FROM public.salons WHERE id = salon_id));
CREATE POLICY "Admin can manage payment history" ON public.payment_history
    FOR ALL USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'SUPER_ADMIN'));


-- 2. AUTOMATION: Trigger to create sub-merchant record for new salons
CREATE OR REPLACE FUNCTION public.handle_new_salon_marketplace()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.salon_sub_merchants (salon_id, iban, bank_name, account_owner, status)
    VALUES (NEW.id, 'TR', '', '', 'PENDING');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_salon_created_marketplace ON public.salons;
CREATE TRIGGER on_salon_created_marketplace
    AFTER INSERT ON public.salons
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_salon_marketplace();


-- 3. GLOBAL SETTINGS
INSERT INTO public.platform_settings (key, value)
VALUES ('platform_commission_rate', '{"rate": 5, "description": "Randevu başı yüzde komisyon"}')
ON CONFLICT (key) DO NOTHING;

-- 4. FIX FOR SUB-MERCHANT STATUS
-- Ensure existing salons have a sub-merchant record
INSERT INTO public.salon_sub_merchants (salon_id, iban, bank_name, account_owner, status)
SELECT id, 'TR', '', '', 'PENDING' FROM public.salons
ON CONFLICT (salon_id) DO NOTHING;
