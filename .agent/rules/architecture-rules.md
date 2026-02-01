---
trigger: always_on
---

# Architecture Rules


- **Components:** Use `@/components` folder. Aim for atomic design principles.
- **Service Layer:** Instead of writing database queries directly in the UI, use existing service classes in `@/services/db.ts` (e.g., `SalonDataService`) or add new ones there.
- **Types:** All type definitions should be in `@/types.ts` (or `types/` folder). Don't use `any`.
- **Absolute Imports:** Always use absolute paths prefixed with `@/` (e.g., `import { ... } from '@/lib/supabase'`).
