-- New-15-Correct-Salon-Status-Enum.sql
-- Fix the salon_status enum mismatch and update activation RPC

DO $$ 
BEGIN
    -- 1. Ensure 'APPROVED' exists in salon_status enum
    -- (PostgreSQL doesn't allow IF NOT EXISTS on ALTER TYPE ADD VALUE directly in DO block easily without check)
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'APPROVED' AND enumtypid = 'public.salon_status'::regtype) THEN
        ALTER TYPE public.salon_status ADD VALUE 'APPROVED';
    END IF;
END $$;

-- 2. Update the Activation RPC to be more robust
CREATE OR REPLACE FUNCTION public.activate_salon_and_subscription(
    p_salon_id uuid,
    p_subscription_id uuid,
    p_admin_note text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    -- 1. Activate Subscription
    UPDATE public.subscriptions
    SET 
        status = 'ACTIVE',
        updated_at = NOW()
    WHERE id = p_subscription_id;

    -- 2. Activate Salon (Using the correct 'APPROVED' status)
    UPDATE public.salons
    SET 
        status = 'APPROVED',
        is_verified = true,
        updated_at = NOW()
    WHERE id = p_salon_id;

    -- 3. Update Payment History status
    UPDATE public.payment_history
    SET 
        status = 'SUCCESS',
        metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{admin_note}', to_jsonb(p_admin_note))
    WHERE subscription_id = p_subscription_id AND status = 'PENDING';

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Activation failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
