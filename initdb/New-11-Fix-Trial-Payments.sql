-- Fix missing payment_history for existing TRIAL subscriptions
INSERT INTO payment_history (salon_id, subscription_id, amount, payment_method, payment_type, status, metadata, created_at)
SELECT 
    s.salon_id, 
    s.id, 
    0, 
    'TRIAL', 
    'SUBSCRIPTION', 
    'SUCCESS', 
    '{"note": "Geçmiş deneme kaydı tanımlandı"}'::jsonb,
    s.created_at
FROM subscriptions s
WHERE s.status = 'TRIAL'
AND NOT EXISTS (
    SELECT 1 FROM payment_history p 
    WHERE p.subscription_id = s.id
);
