-- New-13-Update-Payment-Method-Constraint.sql
-- Update payment_history_payment_method_check to include 'TRIAL'

DO $$
BEGIN
    -- Drop the existing constraint if it exists
    ALTER TABLE public.payment_history DROP CONSTRAINT IF EXISTS payment_history_payment_method_check;

    -- Add the updated constraint including 'TRIAL'
    ALTER TABLE public.payment_history 
    ADD CONSTRAINT payment_history_payment_method_check 
    CHECK (payment_method IN ('IYZICO_CC', 'IYZICO_LINK', 'BANK_TRANSFER', 'TRIAL'));
END $$;
