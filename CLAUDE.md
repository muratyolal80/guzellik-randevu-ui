# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Güzellik Randevu** — A multi-tenant SaaS marketplace for beauty salons (kuaforara.com.tr). Salon owners list services, customers book appointments. Built on Next.js 16 App Router + Supabase (self-hosted).

---

## Commands

```bash
npm run dev       # Start dev server (localhost:3000)
npm run build     # Production build (also runs next-sitemap postbuild)
npm run start     # Start production server
npm run lint      # ESLint check
```

No test runner is configured.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19 — use `use`, Server Actions, Server Components
- **Database/Auth:** Supabase (`@supabase/ssr` + `@supabase/supabase-js`)
- **Styling:** Tailwind CSS (no component library — shadcn/ui style patterns)
- **Icons:** `lucide-react`
- **Charts:** Recharts | **Maps:** react-leaflet | **Calendar:** FullCalendar v6
- **Payment:** Iyzico | **SMS:** İletiMerkezi/NetGSM | **AI:** Google Gemini (`@google/genai`)
- **Bot protection:** Cloudflare Turnstile

### Design tokens (tailwind.config.ts)
- Primary gold: `#C59F59`
- Background: `#FAF8F5`
- Fonts: Plus Jakarta Sans (body), Playfair Display (headings)

---

## Architecture

### Supabase Client Selection — Critical

| Context | Client | Import |
|---------|--------|--------|
| Client components (`'use client'`) | `createBrowserClient` | `@/lib/supabase` |
| Server Actions, API routes, middleware | `createServerClient` / admin | `@/lib/supabaseAdmin` |

`supabaseAdmin` uses the service role key — it bypasses RLS. Use it **only** in server-side code, never in client components.

### Data Layer

All DB queries go through `@/services/db/` modules, exported via `@/services/db.ts` barrel:

| Module | Responsibility |
|--------|---------------|
| `db_core.ts` | Cities, districts, salon types, global services |
| `db_salon.ts` | Salon CRUD, approval flow |
| `db_staff.ts` | Staff management, working hours |
| `db_appointments.ts` | Appointments |
| `db_finance.ts` | Subscriptions, payments |
| `db_user.ts` / `db_customer.ts` | Profile, customer data |
| `db_support.ts` / `db_resource.ts` | Support tickets, resources |

Do not write raw Supabase queries in page/component files.

### Types

All TypeScript interfaces live in `@/types.ts` (622 lines). Key types:

```typescript
type UserRole = 'CUSTOMER' | 'STAFF' | 'MANAGER' | 'SALON_OWNER' | 'ADMIN' | 'SUPER_ADMIN';
type SalonPlan = 'STARTER' | 'PRO' | 'BUSINESS' | 'ELITE';
// Salon.status: 'DRAFT' | 'SUBMITTED' | 'REVISION_REQUESTED' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'DELETED' | 'PASSIVE'
// Subscription.status: 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'CANCELLED'
```

Never use `any`. All new types go into `@/types.ts`.

### Auth & RBAC

`context/AuthContext.tsx` is the central auth provider. Key helpers: `isAdmin`, `isOwner`, `isStaff`, `isAuthenticated`.

Role hierarchy enforced in **middleware** (`middleware.ts`):
- `/admin` → `SUPER_ADMIN` only
- `/owner` → `SALON_OWNER | MANAGER | SUPER_ADMIN`
- `/staff` → `STAFF | SALON_OWNER | SUPER_ADMIN`
- Customer paths redirect roles to their own panel (e.g. OWNER hitting `/customer` → `/owner/dashboard`)
- Inactive users (`is_active = false`) are automatically signed out in middleware

Salon owners hitting `/owner/*` are also checked for onboarding completion (no salon → `/owner/onboarding`) and subscription status.

### Multi-tenancy / Subdomain Routing

Subdomains (`*.kuaforara.com.tr`) are rewritten by middleware to `/salon-slug/[subdomain]`. Main domains are whitelisted in `middleware.ts` → `mainDomains` array. Update this array when adding new domains.

### Slot Booking Engine

`services/slot.ts` — `SlotService.getAvailableSlots(query)` calculates available time slots from staff working hours + existing appointments + service duration. Used by `/api/booking/available-slots/`.

### OTP System

`lib/auth/otp.ts` — 6-digit codes, 5-min expiry. Set `OTP_DEMO_MODE=true` in `.env` to bypass SMS (always returns `111111`).

---

## Route Map

| Prefix | Auth | Panel |
|--------|------|-------|
| `/` `/search` `/salon/[id]` `/salon-slug/[slug]` | Public | Marketplace |
| `/login` `/register` `/register/business` | Public | Auth |
| `/booking/[id]/*` `/bookings` | — | 4-step booking flow |
| `/customer/*` | CUSTOMER | Customer dashboard |
| `/owner/*` | SALON_OWNER | Owner panel |
| `/staff/*` | STAFF | Staff panel |
| `/admin/*` | SUPER_ADMIN | Admin panel |

API routes: `app/api/` — booking, auth (OTP), iyzico webhook, subscription, AI insights, cron reminders.

---

## Security Rules (Enforced)

**RLS is mandatory on every table.** Policy hierarchy:

- **SUPER_ADMIN / ADMIN:** Full access to all rows
- **OWNER:** Access only to own salon rows — **CANNOT DELETE from `salons` or `salon_services`** (use status update instead)
- **STAFF:** Own appointments + own profile + own working_hours only
- **CUSTOMER:** Own appointments/profile/reviews + public APPROVED salon data
- **Public:** SELECT on active/approved salons and global services only

After any DB change, run the RLS audit queries (see `.agent/workflows/security-audit.md`):

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- List all policies
SELECT policyname, tablename, cmd, roles FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;

-- Find DELETE policies not scoped to admins (salons/salon_services should NOT appear)
SELECT policyname, tablename FROM pg_policies
WHERE schemaname = 'public' AND cmd = 'DELETE' AND policyname NOT LIKE 'admin_%';
```

---

## Database Migrations

Every schema change must be saved as `initdb/New-XX-Description.sql`. Check existing files to get the next number:

```bash
ls initdb/New-*.sql
```

The canonical schema is `initdb/Master-Database-Setup.sql`. Individual `New-*.sql` files are incremental migrations to apply on top.

---

## Imports & Conventions

- Always use absolute imports: `@/lib/supabase`, `@/components/...`, `@/services/db`
- Every page needs a `metadata` export or `generateMetadata` function (SEO)
- Use Skeleton screens for loading states, never empty unstyled blanks
- Semantic HTML: `section`, `article`, `header`, etc.
- Images require `alt` attributes
