-- New-12-Sync-Existing-Subscriptions.sql
-- Sync existing subscriptions to payment_history to make them visible in Admin Panel

-- 0. RECOVERY: Create an initial TRIAL record for EVERY salon that doesn't have any payment history
-- This ensures that even if a salon upgraded to a paid plan, their initial trial shows up.
INSERT INTO payment_history (salon_id, amount, payment_method, payment_type, status, metadata, created_at)
SELECT 
    s.id, 
    0, 
    'TRIAL', 
    'SUBSCRIPTION', 
    'SUCCESS', 
    jsonb_build_object('note', 'Sistem tarafından otomatik kurtarılan başlangıç deneme kaydı'),
    s.created_at
FROM salons s
WHERE NOT EXISTS (
    SELECT 1 FROM payment_history p 
    WHERE p.salon_id = s.id
);

-- 1. Sync TRIAL/FREE subscriptions
INSERT INTO payment_history (salon_id, subscription_id, amount, payment_method, payment_type, status, metadata, created_at)
SELECT 
    s.salon_id, 
    s.id, 
    0, 
    'TRIAL', 
    'SUBSCRIPTION', 
    'SUCCESS', 
    jsonb_build_object('note', 'Otomatik senkronize edildi (Hizmet Bazlı)'),
    s.created_at
FROM subscriptions s
JOIN subscription_plans sp ON s.plan_id = sp.id
WHERE (sp.name = 'STARTER' OR sp.price_monthly = 0)
AND NOT EXISTS (
    SELECT 1 FROM payment_history p 
    WHERE p.subscription_id = s.id
);

-- 2. Sync PAID BANK_TRANSFER subscriptions
INSERT INTO payment_history (salon_id, subscription_id, amount, payment_method, payment_type, status, metadata, created_at)
SELECT 
    s.salon_id, 
    s.id, 
    sp.price_monthly, 
    'BANK_TRANSFER', 
    'SUBSCRIPTION', 
    CASE WHEN s.status = 'ACTIVE' THEN 'SUCCESS' ELSE 'PENDING' END, 
    jsonb_build_object('note', 'Otomatik senkronize edildi (Havale)'),
    s.created_at
FROM subscriptions s
JOIN subscription_plans sp ON s.plan_id = sp.id
WHERE s.payment_method = 'BANK_TRANSFER' 
AND sp.price_monthly > 0
AND NOT EXISTS (
    SELECT 1 FROM payment_history p 
    WHERE p.subscription_id = s.id AND p.amount > 0 -- Allow coexist with the trial record created in step 0
);

-- 3. Sync PAID IYZICO (Credit Card) subscriptions
INSERT INTO payment_history (salon_id, subscription_id, amount, payment_method, payment_type, status, metadata, created_at)
SELECT 
    s.salon_id, 
    s.id, 
    sp.price_monthly, 
    'IYZICO_CC', 
    'SUBSCRIPTION', 
    'SUCCESS', 
    jsonb_build_object('note', 'Otomatik senkronize edildi (Kredi Kartı)'),
    s.created_at
FROM subscriptions s
JOIN subscription_plans sp ON s.plan_id = sp.id
WHERE s.payment_method = 'IYZICO' 
AND sp.price_monthly > 0
AND NOT EXISTS (
    SELECT 1 FROM payment_history p 
    WHERE p.subscription_id = s.id AND p.amount > 0 -- Allow coexist with the trial record created in step 0
);
