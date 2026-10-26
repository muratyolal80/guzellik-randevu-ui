import { supabaseAdmin } from '../supabase-admin';

/**
 * Owner staff-account routes (reset-password, disable-login) act on staff.user_id
 * with the service role. Defense in depth on top of the DB guard (New-34): the
 * target must be a staff-level account — never an owner/admin/customer account and
 * never the caller themselves.
 */
export async function isManageableStaffAccount(targetUserId: string, actingUserId: string): Promise<boolean> {
  if (targetUserId === actingUserId) return false;
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', targetUserId)
    .maybeSingle();
  return data?.role === 'STAFF' || data?.role === 'MANAGER';
}
