import { supabaseAdmin } from './supabase-admin';

const DEMO_OTP_CODE = '111111';
const OTP_EXPIRY_MINUTES = 5;

export function generateOTP(): string {
  if (process.env.OTP_DEMO_MODE === 'true') {
    return DEMO_OTP_CODE;
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function saveOTP(phone: string, code: string): Promise<boolean> {
  try {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

    const { error } = await supabaseAdmin
      .from('otp_codes')
      .insert({
        phone,
        code,
        expires_at: expiresAt.toISOString(),
        used: false,
      });

    if (error) {
      console.error('Error saving OTP:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Exception saving OTP:', err);
    return false;
  }
}

export async function verifyOTP(phone: string, code: string): Promise<boolean> {
  try {
    if (process.env.OTP_DEMO_MODE === 'true' && code === DEMO_OTP_CODE) {
      console.log('Demo mode: OTP accepted');
      return true;
    }

    const { data, error } = await supabaseAdmin
      .from('otp_codes')
      .select('*')
      .eq('phone', phone)
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      console.error('OTP verification failed:', error?.message || 'No valid OTP');
      return false;
    }

    await supabaseAdmin
      .from('otp_codes')
      .update({ used: true })
      .eq('id', data.id);

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

