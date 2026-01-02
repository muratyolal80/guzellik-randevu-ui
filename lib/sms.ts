import { supabaseAdmin } from './supabase-admin';

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

async function logSMS(data: {
  phone: string;
  message_type: 'OTP' | 'INFO' | 'CAMPAIGN';
  content: string;
  status: 'SENT' | 'FAILED' | 'DEMO';
}): Promise<void> {
  try {
    await supabaseAdmin.from('iys_logs').insert({
      phone: data.phone,
      message_type: data.message_type,
      content: data.content,
      status: data.status,
    });
  } catch (err) {
    console.error('Failed to log SMS:', err);
  }
}

export async function sendOTPSMS(phone: string, code: string): Promise<boolean> {
  const { header } = getConfig();
  const authHeader = getAuthHeader();
  const isConfigured = hasCredentials();

  const cleanedPhone = cleanPhone(phone);
  const message = `Dogrulama Kodunuz: ${code}`;

  if (!isConfigured || process.env.OTP_DEMO_MODE === 'true') {
    console.warn('Demo mode: SMS simulated for', cleanedPhone);
    await logSMS({
      phone: cleanedPhone,
      message_type: 'OTP',
      content: `[DEMO] ${message}`,
      status: 'DEMO',
    });
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

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    await logSMS({
      phone: cleanedPhone,
      message_type: 'OTP',
      content: message,
      status: 'SENT',
    });

    console.log('OTP SMS sent to', cleanedPhone);
    return true;

  } catch (error) {
    console.error('Failed to send OTP SMS:', error);

    await logSMS({
      phone: cleanedPhone,
      message_type: 'OTP',
      content: message,
      status: 'FAILED',
    });

    return false;
  }
}

export async function sendAppointmentSMS(phone: string, details: string): Promise<boolean> {
  const cleanedPhone = cleanPhone(phone);
  const { header } = getConfig();
  const authHeader = getAuthHeader();
  const isConfigured = hasCredentials();

  if (!isConfigured) {
    await logSMS({
      phone: cleanedPhone,
      message_type: 'INFO',
      content: `[DEMO] ${details}`,
      status: 'DEMO',
    });
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

    if (!response.ok) throw new Error('API Error');

    await logSMS({
      phone: cleanedPhone,
      message_type: 'INFO',
      content: details,
      status: 'SENT',
    });

    return true;

  } catch (error) {
    console.error('Failed to send appointment SMS:', error);
    await logSMS({
      phone: cleanedPhone,
      message_type: 'INFO',
      content: details,
      status: 'FAILED',
    });
    return false;
  }
}


