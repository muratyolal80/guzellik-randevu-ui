-- Final migration to remove full_name column
-- Run this AFTER ensuring all code has been updated and the split_name_migration.sql has been run.

ALTER TABLE profiles DROP COLUMN full_name;
