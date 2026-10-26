import { randomInt, timingSafeEqual } from 'crypto';
import { supabaseAdmin } from '../supabase-admin';

const DEMO_OTP_CODE = '111111';
const OTP_EXPIRY_MINUTES = 5;
export const OTP_MAX_ATTEMPTS = 5;

/**
 * Demo mode (fixed code 111111, SMS bypassed). Never active in a production build
 * unless explicitly allowed — staging with masked data may set
 * OTP_DEMO_ALLOW_IN_PRODUCTION=true. Prod must not.
 */
export function isOtpDemoMode(): boolean {
  if (process.env.OTP_DEMO_MODE !== 'true') return false;
  return process.env.NODE_ENV !== 'production' || process.env.OTP_DEMO_ALLOW_IN_PRODUCTION === 'true';
}

export function generateOTP(): string {
  if (isOtpDemoMode()) return DEMO_OTP_CODE;
  return randomInt(100000, 1000000).toString();
}

export async function saveOTP(phone: string, code: string): Promise<boolean> {
  try {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

    // A resend replaces the active code and resets its attempt counter
    const { data: existing } = await supabaseAdmin
      .from('otp_codes')
      .select('id')
      .eq('phone', phone)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing) {
      const { error } = await supabaseAdmin
        .from('otp_codes')
        .update({
          code,
          attempts: 0,
          expires_at: expiresAt.toISOString(),
          created_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) throw new Error(`DB Error: ${error.message}`);
      return true;
    }

    await supabaseAdmin
      .from('otp_codes')
      .update({ used: true })
      .eq('phone', phone)
      .eq('used', false);

    const { error } = await supabaseAdmin
      .from('otp_codes')
      .insert({ phone, code, expires_at: expiresAt.toISOString(), used: false, attempts: 0 });

    if (error) throw new Error(`DB Error: ${error.message}`);
    return true;
  } catch (err) {
    console.error('Exception saving OTP:', err);
    throw new Error(`Exception: ${(err as Error).message}`);
  }
}

export async function getActiveOTP(phone: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('otp_codes')
    .select('code')
    .eq('phone', phone)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.code || null;
}

function sameCode(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/**
 * Checks the latest active code for this phone. Every wrong guess counts; after
 * OTP_MAX_ATTEMPTS the code is burned and a new one must be requested.
 */
export async function verifyOTP(phone: string, code: string): Promise<boolean> {
  try {
    if (isOtpDemoMode() && code === DEMO_OTP_CODE) return true;

    const { data } = await supabaseAdmin
      .from('otp_codes')
      .select('id, code, attempts')
      .eq('phone', phone)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) return false;

    if (data.attempts >= OTP_MAX_ATTEMPTS || !sameCode(String(code), data.code)) {
      const attempts = data.attempts + 1;
      await supabaseAdmin
        .from('otp_codes')
        .update({ attempts, used: attempts >= OTP_MAX_ATTEMPTS })
        .eq('id', data.id);
      return false;
    }

    await supabaseAdmin.from('otp_codes').update({ used: true }).eq('id', data.id);
    return true;
  } catch (err) {
    console.error('Exception verifying OTP:', err);
    return false;
  }
}

export function cleanPhone(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('90')) cleaned = cleaned.substring(2);
  if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
  return cleaned;
}
