---
trigger: always_on
---

# Security Rules

<<<<<<< HEAD
- **RLS Policies:** Every table MUST have RLS enabled. Policy Hierarchy:
  - **SUPER_ADMIN / ADMIN:** Full access (SELECT, INSERT, UPDATE, DELETE) to all rows in all tables.
  - **OWNER (Salon Sahibi):** 
    - Full access to rows where `salon_id` or `owner_id` matches their own salon.
    - **CRITICAL:** CANNOT DELETE records in `salons` and `salon_services` tables. Deletion must be handled via status update or by Admin.
    - Can view and manage their own `staff`, `appointments`, and `reviews` for their salon.
    - Manage their own `subscriptions` and `payment_history`.
  - **CUSTOMER (Müşteri):** 
    - SELECT access to public salon data (APPROVED status).
    - Full access to their own `appointments`, `profiles`, and `reviews` only.
    - NO access to salon settings, internal staff data, or package management.
  - **STAFF (Personel):** 
    - SELECT access to **only** their own assigned `appointments`.
    - SELECT access to their own `profile` and assigned `working_hours`.
    - NO access to salon settings, packages, other staff's data, or financial records.
  - **Public / Unauthenticated:** Strictly SELECT access for public data only (active salons, global services).

- **Audit Requirement:** After every database change, run the standard RLS check queries documented in the `/security-audit` workflow.
- **SQL Management:** Every database change (CREATE TABLE, ALTER TABLE, etc.) should be saved as a new script in the `initdb/` folder (e.g., `New-07-Feature-X.sql`).
- **Client Selection:** Ensure `createBrowserClient` is used for client-side operations and `createServerClient` for server-side (actions/middleware).

=======

- **RLS Policies:** Every table MUST have RLS enabled. Policy Hierarchy:
  - **SUPER_ADMIN:** Full access (SELECT, INSERT, UPDATE, DELETE) to all rows in all tables.
  - **OWNER:** 
    - Full access to rows where `salon_id` or `owner_id` matches their own salon.
    - **CRITICAL:** CANNOT DELETE records in `salons` and `salon_services` (packages) tables.
    - Can view and manage their own `staff` and `appointments` for their salon.
  - **CUSTOMER:** 
    - SELECT access to public salon data.
    - Full access to their own `appointments`, `profiles`, and `reviews` only.
    - NO access to salon settings, internal staff data, or package management.
  - **STAFF:** 
    - SELECT access to **only** their own assigned `appointments`.
    - SELECT access to their own `profile`.
    - NO access to salon settings, packages, or other staff's data.
  - **Unauthenticated:** Strictly SELECT access for public data only (active salons, global services).
- **Audit Requirement:** Use `/security-audit` workflow after every database change.
- **SQL Management:** Every database change (CREATE TABLE, ALTER TABLE, etc.) should be saved as a new script in the `initdb/` folder (e.g., `New-07-Feature-X.sql`).
- **Client Selection:** Ensure `createBrowserClient` is used for client-side operations and `createServerClient` for server-side (actions/middleware).
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
