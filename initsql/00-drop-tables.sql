-- Drop all tables in public schema
-- This script is used by reset-db.bat to clean the database before re-creating schema

DO $$
DECLARE
    r RECORD;
BEGIN
    -- Loop through all tables in public schema and drop them with CASCADE
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;

    RAISE NOTICE 'All tables in public schema have been dropped.';
END $$;

