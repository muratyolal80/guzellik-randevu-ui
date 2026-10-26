import { type SupabaseClient } from "@supabase/supabase-js";
import type { Staff } from "@/types";

/**
 * Columns anon/authenticated may SELECT on `staff` (New-33 column grants).
 * Never use `select("*")` on staff — PII (email, phone, tc_no, verification flags)
 * is not granted and the whole query would fail with 42501.
 */
export const STAFF_PUBLIC_COLUMNS =
  "id, salon_id, user_id, name, photo, specialty, bio, is_active, created_at, updated_at, rating, review_count, role";

type StaffPrivate = Pick<
  Staff,
  "id" | "email" | "phone" | "tc_no" | "is_email_verified" | "is_phone_verified" | "kvkk_consent" | "verified_at"
>;

/**
 * Merges contact/KVKK fields via get_staff_private RPC. The RPC only returns rows the
 * caller may see (salon owner, the staff member, admin) — for anyone else it returns
 * nothing, so calling this from public pages is safe and simply adds no data.
 */
export async function withStaffPrivate<T extends Staff>(supabase: SupabaseClient, rows: T[]): Promise<T[]> {
  if (rows.length === 0) return rows;
  const { data, error } = await supabase.rpc("get_staff_private", { p_staff_ids: rows.map((r) => r.id) });
  if (error || !data) return rows; // anon has no EXECUTE → public view without PII
  const byId = new Map((data as StaffPrivate[]).map((p) => [p.id, p]));
  return rows.map((r) => ({ ...r, ...byId.get(r.id) }));
}
