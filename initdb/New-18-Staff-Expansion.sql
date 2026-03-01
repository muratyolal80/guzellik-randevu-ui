-- Add MANAGER to user_role enum
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'MANAGER';

-- Add email and specialty to staff table
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS specialty text;

-- Add index for email lookup
CREATE INDEX IF NOT EXISTS idx_staff_email ON public.staff(email);

-- Add unique constraint per salon and email (a person can join multiple salons, but with unique email entry for that record)
-- Actually, a single user (email) can be staff in multiple salons.

-- Ensure user_id is linked to profiles
-- (Already exists in New-03-Tables but good to ensure FK)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'staff_user_id_fkey') THEN
        ALTER TABLE public.staff ADD CONSTRAINT staff_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);
    END IF;
END $$;
