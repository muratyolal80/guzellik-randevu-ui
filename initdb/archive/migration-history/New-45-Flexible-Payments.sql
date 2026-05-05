-- New-45-Flexible-Payments.sql
-- Esnek Ödeme Sistemi ve İşlem Takibi

-- 1. payment_method enum'una BANK_TRANSFER ekleme (eğer yoksa)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
        CREATE TYPE public.payment_method AS ENUM ('CASH', 'CREDIT_CARD', 'BANK_TRANSFER', 'WALLET', 'OTHER');
    ELSE
        -- Enum varsa BANK_TRANSFER eklemeyi dene (zaten varsa hata vermez)
        BEGIN
            ALTER TYPE public.payment_method ADD VALUE IF NOT EXISTS 'BANK_TRANSFER';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
    END IF;
END $$;

-- 2. transactions tablosunun varlığını ve yapısını kontrol et/oluştur
CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    salon_id uuid NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    customer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'TRY',
    payment_method public.payment_method DEFAULT 'CASH',
    payment_status text DEFAULT 'COMPLETED', -- Peşin ödemelerde varsayılan tamamlandı
    provider_transaction_id text, -- Iyzico, Stripe vb.
    notes text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 3. RLS Politikaları
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

-- 4. appointments tablosuna ödeme yöntemi kolonu ekleme (eğer New-10'da eklenmediyse)
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS payment_method text,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'PENDING';
