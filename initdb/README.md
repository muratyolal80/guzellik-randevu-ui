# Database Setup Instructions

This directory contains the SQL scripts required to initialize the `guzellik-randevu` database from scratch. These scripts are valid as of **February 2026** and capture the full state of the development database.

## Prerequisites

- **PostgreSQL 15+** (or Supabase local stack)
- **PostGIS** extension support (usually included in Supabase images)

## Deployment Order

Run the scripts in the following numeric order. If you are using `psql`, you can run them via command line. If you are using a GUI (like DBeaver or Supabase Studio), execute them one by one.

### 1. Reset (Optional)
*   **[New-00-Drop-All.sql](New-00-Drop-All.sql)**
    *   *Warning*: This deletes `public`, `tiger`, and `topology` schemas. Use only if you want a completely fresh start.

### 2. Core Structure
*   **[New-01-Extensions.sql](New-01-Extensions.sql)**: Enables PostGIS, UUID, etc.
*   **[New-02-Types-and-Enums.sql](New-02-Types-and-Enums.sql)**: Sets up `user_role`, `salon_status` etc
*   **[New-03-Tables.sql](New-03-Tables.sql)**: Creates tables, views, and constraints.

### 3. Logic & Security
*   **[New-04-Functions.sql](New-04-Functions.sql)**: Adds helper functions and triggers logic.
*   **[New-05-Triggers.sql](New-05-Triggers.sql)**: Attaches triggers to tables.
*   **[New-06-RLS-Policies.sql](New-06-RLS-Policies.sql)**: Activates security policies.

### 4. Data
*   **[New-07-Seed-Data.sql](New-07-Seed-Data.sql)**: Populates the database with initial users, salons, cities, and services.

### 6. Authentication (Critical)
*   **[New-09-Auth-Users.sql](New-09-Auth-Users.sql)**: Inserts default users (Admin, Owner, Customer) into `auth.users` so you can log in.
    *   **Default Password**: `123456`


## Notes for Developers

- **Source of Truth**: These `New-*.sql` files are now the master definition of the database.
- **Old Files**: Previous scripts have been moved to the `old/` directory for reference but should not be used for new setups.
- **Modifying Schema**: If you make changes to the DB, please update these scripts or create a `New-09-Updates.sql` to track changes.

**Owner**: Furkan & Murat
**Last Synced**: 2026-02-01
