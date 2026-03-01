import { LimitEnforcer } from '@/lib/utils/limits';

const API_BASE = "https://api.netgsm.com.tr/sms/rest/v2";

const getConfig = () => {
  return {
    usercode: process.env.ILETIMERKEZI_USERCODE || '',
    password: process.env.ILETIMERKEZI_PASSWORD || '',
    header: process.env.ILETIMERKEZI_HEADER || '',
  };
};

const getAuthHeader = () => {
  const { usercode, password } = getConfig();
  if (!usercode || !password) return null;
  return 'Basic ' + Buffer.from(`${usercode}:${password}`).toString('base64');
};

const hasCredentials = () => {
  const { usercode, password, header } = getConfig();
  return usercode.length > 0 && password.length > 0 && header.length > 0;
};

function cleanPhone(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('90')) cleaned = cleaned.substring(2);
  if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
  return cleaned;
}

export async function sendOTPSMS(phone: string, code: string): Promise<boolean> {
  const { header } = getConfig();
  const authHeader = getAuthHeader();
  const isConfigured = hasCredentials();

  const cleanedPhone = cleanPhone(phone);
  const message = `Dogrulama Kodunuz: ${code}`;

  if (!isConfigured || process.env.OTP_DEMO_MODE === 'true') {
    console.warn('Demo mode: SMS simulated for', cleanedPhone);
    return true;
  }

  try {
    const response = await fetch(`${API_BASE}/otp`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        msgheader: header,
        msg: message,
        no: cleanedPhone,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send OTP SMS:', error);
    return false;
  }
}

export async function sendAppointmentSMS(salonId: string, phone: string, details: string): Promise<boolean> {
  // 1. Check Subscription Limits
  const canSend = await LimitEnforcer.hasRemainingSms(salonId);
  if (!canSend) {
    console.warn('SMS block: Subscription limit reached for salon', salonId);
    return false;
  }

  const cleanedPhone = cleanPhone(phone);
  const { header } = getConfig();
  const authHeader = getAuthHeader();
  const isConfigured = hasCredentials();

  if (!isConfigured) {
    console.log('[DEMO SMS]', details);
    return true;
  }

  try {
    const response = await fetch(`${API_BASE}/send`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        msgheader: header,
        messages: [{ msg: details, no: cleanedPhone }],
        encoding: 'TR',
        iysfilter: '0',
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to send appointment SMS:', error);
    return false;
  }
}


