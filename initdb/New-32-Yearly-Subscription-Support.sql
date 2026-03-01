-- =============================================================================
-- New-32-Yearly-Subscription-Support.sql
-- Yearly Pricing for Subscription Plans & Billing Cycle Support
-- =============================================================================

-- 1. Update subscription_plans table
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS price_yearly integer; -- Kuruş cinsinden yıllık fiyat

-- 2. Update existing plans with yearly prices (Approx. 20% discount)
UPDATE public.subscription_plans SET price_yearly = 0 WHERE name = 'STARTER';
UPDATE public.subscription_plans SET price_yearly = 499000 WHERE name = 'PRO'; -- 499 * 10 = 4990 TL (12 ay için)
UPDATE public.subscription_plans SET price_yearly = 999000 WHERE name = 'ELITE'; -- 999 * 10 = 9990 TL (12 ay için)

-- 3. Update subscriptions table for cycle tracking
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS billing_cycle text DEFAULT 'MONTHLY' 
CHECK (billing_cycle IN ('MONTHLY', 'YEARLY'));

-- 4. Update RLS (Ensure new columns are visible to owners)
-- RLS policies usually cover the whole table, so no specific column-level RLS needed 
-- unless explicit restricted.

-- 5. Comments
COMMENT ON COLUMN public.subscription_plans.price_yearly IS 'Kuruş cinsinden yıllık abonelik ücreti.';
COMMENT ON COLUMN public.subscriptions.billing_cycle IS 'Abonelik faturalandırma periyodu (Aylık/Yıllık).';
