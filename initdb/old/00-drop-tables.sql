-- Drop all tables in public schema
-- This script is used by reset-db.bat to clean the database before re-creating schema

-- Clean up sample data from auth schema FIRST (before dropping tables)
DO $$
BEGIN
    DELETE FROM auth.users WHERE email IN (
        'owner1@example.com',
        'owner2@example.com',
        'owner3@example.com',
        'owner4@example.com',
        'owner5@example.com'
    );
    RAISE NOTICE 'Sample users cleaned from auth.users (this cascades to profiles)';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not clean auth.users (this is OK on first run)';
END $$;

-- Now drop all public schema objects
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all views first
    FOR r IN (SELECT viewname FROM pg_views WHERE schemaname = 'public')
    LOOP
        EXECUTE 'DROP VIEW IF EXISTS public.' || quote_ident(r.viewname) || ' CASCADE';
    END LOOP;

    -- Drop all tables
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public')
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;

    -- Drop all types/enums
    FOR r IN (SELECT typname FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND typtype = 'e')
    LOOP
        EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
    END LOOP;

    RAISE NOTICE 'All tables, views, and types in public schema have been dropped.';
END $$;

