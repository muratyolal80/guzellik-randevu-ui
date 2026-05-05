-- =============================================
-- New-32-Owner-Centric-Subscriptions.sql
-- Decouples subscriptions from individual salons and links them to Owners.
-- =============================================

DO $$ 
BEGIN
    -- 1. Add owner_id to subscriptions
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name = 'subscriptions' AND column_name = 'owner_id') THEN
        ALTER TABLE public.subscriptions ADD COLUMN owner_id uuid REFERENCES public.profiles(id);
    END IF;

    -- 2. Make salon_id nullable
    ALTER TABLE public.subscriptions ALTER COLUMN salon_id DROP NOT NULL;

    -- 3. Data Migration:-- 3. Backfill owner_id from existing salons
UPDATE public.subscriptions s
SET owner_id = sl.owner_id
FROM public.salons sl
WHERE s.salon_id = sl.id AND s.owner_id IS NULL;

-- 4. Update payment_history to include owner_id for better reporting
ALTER TABLE public.payment_history ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES public.profiles(id);

-- 5. Backfill owner_id in payment_history
UPDATE public.payment_history ph
SET owner_id = sl.owner_id
FROM public.salons sl
WHERE ph.salon_id = sl.id AND ph.owner_id IS NULL;

    -- 4. Add UNIQUE constraint to owner_id 
    -- (An owner has one global subscription)
    -- First, remove any duplicates if they exist (unlikely in current 1:1 salon model, but safer)
    -- DELETE FROM public.subscriptions a USING public.subscriptions b 
    -- WHERE a.id < b.id AND a.owner_id = b.owner_id;
    
    -- ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_owner_id_key UNIQUE (owner_id);

END $$;
