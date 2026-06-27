-- ============================================================
-- 04-advanced-schema.sql
-- Storage Buckets, RLS Security Policies, and Finance Extensions
-- ============================================================

-- 1. FINANCE EXTENSIONS (From New-45)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
        CREATE TYPE public.payment_method AS ENUM ('CASH', 'CREDIT_CARD', 'BANK_TRANSFER', 'WALLET', 'OTHER', 'IYZICO');
    ELSE
        BEGIN
            ALTER TYPE public.payment_method ADD VALUE IF NOT EXISTS 'BANK_TRANSFER';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    customer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'TRY',
    payment_method text DEFAULT 'CASH',
    payment_status text DEFAULT 'COMPLETED',
    provider_transaction_id text,
    notes text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Customers can see their own transactions' AND tablename = 'transactions') THEN
        CREATE POLICY "Customers can see their own transactions" ON public.transactions
            FOR SELECT USING (customer_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Salon owners can see their salon transactions' AND tablename = 'transactions') THEN
        CREATE POLICY "Salon owners can see their salon transactions" ON public.transactions
            FOR SELECT USING (
                salon_id IN (SELECT id FROM public.salons WHERE owner_id = auth.uid())
            );
    END IF;
END $$;

-- 2. STORAGE BUCKETS (From New-41)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('salon-images', 'salon-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('staff-photos', 'staff-photos', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('avatars', 'avatars', true, 1048576, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('reviews', 'reviews', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('system-assets', 'system-assets', true, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET 
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. STORAGE RLS POLICIES (From New-41 & New-44)
DO $$ 
BEGIN
    EXECUTE (
        SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON storage.objects;', ' ')
        FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects'
    );
END $$;

CREATE POLICY "Public Read Access" ON storage.objects 
FOR SELECT USING (
    bucket_id IN ('salon-images', 'staff-photos', 'avatars', 'reviews', 'system-assets')
);

CREATE POLICY "Owner Gallery Management" ON storage.objects 
FOR ALL TO authenticated
USING (
    bucket_id = 'salon-images' AND 
    EXISTS (
        SELECT 1 FROM public.salons 
        WHERE id::text = (storage.foldername(storage.objects.name))[1] 
        AND owner_id = auth.uid()
    )
)
WITH CHECK (
    bucket_id = 'salon-images' AND 
    EXISTS (
        SELECT 1 FROM public.salons 
        WHERE id::text = (storage.foldername(storage.objects.name))[1] 
        AND owner_id = auth.uid()
    )
);

CREATE POLICY "Users Manage Own Avatar" ON storage.objects 
FOR ALL TO authenticated
USING (
    bucket_id = 'avatars' AND 
    (storage.foldername(storage.objects.name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'avatars' AND 
    (storage.foldername(storage.objects.name))[1] = auth.uid()::text
);

CREATE POLICY "Admins Manage System Assets" ON storage.objects 
FOR ALL TO authenticated
USING (
    bucket_id = 'system-assets' AND 
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
);
