import { supabaseAdmin } from '../supabase-admin';

// The auth schema is not exposed via PostgREST — these go through service_role-only
// definer functions (initdb/New-36-Auth-Lookup-Functions.sql). Server code only.

/** @param cleanedPhone 10-digit national number from cleanPhone(), e.g. 5551112233 */
export async function findAuthUserIdByPhone(cleanedPhone: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin.rpc('auth_user_id_by_phone', { p_phone: `90${cleanedPhone}` });
  if (error) throw new Error(`auth_user_id_by_phone: ${error.message}`);
  return (data as string | null) ?? null;
}

export async function findAuthUserIdByEmail(email: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin.rpc('auth_user_id_by_email', { p_email: email });
  if (error) throw new Error(`auth_user_id_by_email: ${error.message}`);
  return (data as string | null) ?? null;
}
