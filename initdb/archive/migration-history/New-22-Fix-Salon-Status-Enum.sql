-- New-22-Fix-Salon-Status-Enum.sql
-- Adds missing enum values to salon_status

DO $$ 
BEGIN
    -- APPROVED
    IF NOT EXISTS (SELECT 1 FROM pg_enum JOIN pg_type ON pg_type.oid = pg_enum.enumtypid WHERE typname = 'salon_status' AND enumlabel = 'APPROVED') THEN
        ALTER TYPE public.salon_status ADD VALUE 'APPROVED';
    END IF;
    -- REVISION_REQUESTED
    IF NOT EXISTS (SELECT 1 FROM pg_enum JOIN pg_type ON pg_type.oid = pg_enum.enumtypid WHERE typname = 'salon_status' AND enumlabel = 'REVISION_REQUESTED') THEN
        ALTER TYPE public.salon_status ADD VALUE 'REVISION_REQUESTED';
    END IF;
    -- SUSPENDED
    IF NOT EXISTS (SELECT 1 FROM pg_enum JOIN pg_type ON pg_type.oid = pg_enum.enumtypid WHERE typname = 'salon_status' AND enumlabel = 'SUSPENDED') THEN
        ALTER TYPE public.salon_status ADD VALUE 'SUSPENDED';
    END IF;
    -- SUBMITTED
    IF NOT EXISTS (SELECT 1 FROM pg_enum JOIN pg_type ON pg_type.oid = pg_enum.enumtypid WHERE typname = 'salon_status' AND enumlabel = 'SUBMITTED') THEN
        ALTER TYPE public.salon_status ADD VALUE 'SUBMITTED';
    END IF;
    -- DELETED
    IF NOT EXISTS (SELECT 1 FROM pg_enum JOIN pg_type ON pg_type.oid = pg_enum.enumtypid WHERE typname = 'salon_status' AND enumlabel = 'DELETED') THEN
        ALTER TYPE public.salon_status ADD VALUE 'DELETED';
    END IF;
    -- PASSIVE
    IF NOT EXISTS (SELECT 1 FROM pg_enum JOIN pg_type ON pg_type.oid = pg_enum.enumtypid WHERE typname = 'salon_status' AND enumlabel = 'PASSIVE') THEN
        ALTER TYPE public.salon_status ADD VALUE 'PASSIVE';
    END IF;
END $$;

