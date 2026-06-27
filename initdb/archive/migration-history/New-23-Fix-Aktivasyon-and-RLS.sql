-- New-23-Fix-Aktivasyon-and-RLS.sql
-- 1. Ensure 'is_verified' column exists in 'salons' table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'salons' AND column_name = 'is_verified') THEN
        ALTER TABLE public.salons ADD COLUMN is_verified boolean DEFAULT false;
    END IF;
END $$;

-- 2. Update Subscription RLS Policies to allow Owners to manage their own requests
-- Owners need to be able to INSERT (for new requests) and UPDATE (for their own data)
DROP POLICY IF EXISTS "Owners manage own subscriptions" ON public.subscriptions;
CREATE POLICY "Owners manage own subscriptions" ON public.subscriptions FOR ALL
    USING (salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid()))
    WITH CHECK (salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid()));

-- 3. Update Payment History RLS Policies to allow Owners to insert payments
DROP POLICY IF EXISTS "Owners manage own payment_history" ON public.payment_history;
CREATE POLICY "Owners manage own payment_history" ON public.payment_history FOR ALL
    USING (salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid()))
    WITH CHECK (salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid()));

-- 4. Update the Activation RPC to be more robust
CREATE OR REPLACE FUNCTION public.activate_salon_and_subscription(
    p_salon_id uuid,
    p_subscription_id uuid,
    p_admin_note text DEFAULT NULL
)
RETURNS void AS $$
DECLARE
    v_owner_id uuid;
BEGIN
    -- Get owner info for notification if needed
    SELECT owner_id INTO v_owner_id FROM public.salons WHERE id = p_salon_id;

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
