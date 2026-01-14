-- Migration: Split full_name into first_name and last_name
-- Run this in Supabase SQL Editor

DO $$
BEGIN
    -- 1. Add new columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'first_name') THEN
        ALTER TABLE profiles ADD COLUMN first_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_name') THEN
        ALTER TABLE profiles ADD COLUMN last_name TEXT;
    END IF;

    -- 2. Migrate existing data
    -- Simple split by first space. Everything after first space is last_name.
    UPDATE profiles 
    SET 
        first_name = split_part(full_name, ' ', 1),
        last_name = substring(full_name from position(' ' in full_name) + 1)
    WHERE full_name IS NOT NULL AND first_name IS NULL;

    -- Handle cases where there is no space (last_name would be empty or same as first if not handled)
    UPDATE profiles
    SET last_name = '' 
    WHERE last_name IS NULL AND full_name IS NOT NULL;

    -- 3. Update specific user myolal if needed (ensure clean data)
    UPDATE profiles
    SET first_name = 'Murat', last_name = 'Yolal'
    WHERE id = 'f9821af5-3930-4a83-8de9-8d434e7155aa';

    -- 4. Drop full_name column (Optional: Uncomment to enforce break)
    -- ALTER TABLE profiles DROP COLUMN full_name;

END $$;
