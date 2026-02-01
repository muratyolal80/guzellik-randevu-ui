---
trigger: always_on
---

# Security Rules


- **RLS Policies:** Consider RLS policies for every new table. Keep `initdb/New-06-RLS-Policies.sql` updated.
- **SQL Management:** Every database change (CREATE TABLE, ALTER TABLE, etc.) should be saved as a new script in the `initdb/` folder (e.g., `New-07-Feature-X.sql`).
- **Client Selection:** Ensure `createBrowserClient` is used for client-side operations and `createServerClient` for server-side (actions/middleware).
