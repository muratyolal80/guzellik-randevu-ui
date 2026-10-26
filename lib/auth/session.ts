import type { SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../supabase-admin';

/** Accounts that must use their password — never logged in by an SMS code alone. */
const PASSWORD_ONLY_ROLES = ['SUPER_ADMIN', 'ADMIN'];

/**
 * Starts a session for an already-verified user (phone OTP passed) WITHOUT touching
 * their password: mint a one-time magic-link token server-side and redeem it on the
 * cookie-bound SSR client. Replaces the old "reset password to a temp value" trick,
 * which silently overwrote real passwords on every booking.
 */
export async function startSessionForUser(
  ssrClient: SupabaseClient,
  userId: string,
): Promise<{ ok: boolean; reason?: 'password_only' | 'no_email' | 'error' }> {
  const [{ data: profile }, { data: authUser }] = await Promise.all([
    supabaseAdmin.from('profiles').select('role').eq('id', userId).maybeSingle(),
    supabaseAdmin.auth.admin.getUserById(userId),
  ]);

  if (profile?.role && PASSWORD_ONLY_ROLES.includes(profile.role)) {
    return { ok: false, reason: 'password_only' };
  }
  const email = authUser.user?.email;
  if (!email) return { ok: false, reason: 'no_email' };

  const { data: link, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });
  const tokenHash = link?.properties?.hashed_token;
  if (linkError || !tokenHash) {
    console.error('[session] generateLink failed:', linkError?.message);
    return { ok: false, reason: 'error' };
  }

  const { error: verifyError } = await ssrClient.auth.verifyOtp({ type: 'magiclink', token_hash: tokenHash });
  if (verifyError) {
    console.error('[session] verifyOtp failed:', verifyError.message);
    return { ok: false, reason: 'error' };
  }
  return { ok: true };
}
