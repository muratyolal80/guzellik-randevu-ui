// Twilio Verify API Configuration
// NOT: Gerçek uygulamada Auth Token'ı frontend kodunda saklamak güvenli değildir.
// Bu işlemler normalde backend üzerinden yapılmalıdır.

// Vite apps read client-side env vars from `.env*` files via `import.meta.env`.
// Only variables prefixed with `VITE_` are exposed to the browser.
const ACCOUNT_SID = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
const SERVICE_SID = import.meta.env.VITE_TWILIO_VERIFY_SERVICE_SID;
const AUTH_TOKEN = import.meta.env.VITE_TWILIO_AUTH_TOKEN;

function assertTwilioEnv() {
  const missing: string[] = [];
  if (!ACCOUNT_SID) missing.push('VITE_TWILIO_ACCOUNT_SID');
  if (!SERVICE_SID) missing.push('VITE_TWILIO_VERIFY_SERVICE_SID');
  if (!AUTH_TOKEN) missing.push('VITE_TWILIO_AUTH_TOKEN');

  if (missing.length) {
    // Fail fast: we don't want to silently run with real defaults or demo tokens.
    throw new Error(
      `Missing Twilio env var(s): ${missing.join(', ')}. ` +
        'Create/update `.env.local` with these VITE_* values and restart the dev server.'
    );
  }
}

export const TwilioService = {

  // 1. WhatsApp ile Kod Gönder
  sendOtp: async (phone: string): Promise<boolean> => {
    assertTwilioEnv();

    // Telefon numarasını E.164 formatına (örn: +90532...) zorla
    const formattedPhone = phone.startsWith('+') ? phone : `+90${phone.replace(/^0/, '')}`;

    const response = await fetch(`https://verify.twilio.com/v2/Services/${SERVICE_SID}/Verifications`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${ACCOUNT_SID}:${AUTH_TOKEN}`),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'To': formattedPhone,
        'Channel': 'whatsapp' // SMS yerine WhatsApp istendiği için
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Twilio Send Error:", errorData);
      throw new Error((errorData as any).message || 'Gönderim hatası');
    }

    const data = await response.json();
    return data.status === 'pending';
  },

  // 2. Kodu Doğrula (Senin verdiğin cURL yapısı)
  verifyOtp: async (phone: string, code: string): Promise<boolean> => {
    assertTwilioEnv();

    const formattedPhone = phone.startsWith('+') ? phone : `+90${phone.replace(/^0/, '')}`;

    const response = await fetch(`https://verify.twilio.com/v2/Services/${SERVICE_SID}/VerificationCheck`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${ACCOUNT_SID}:${AUTH_TOKEN}`),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'To': formattedPhone,
        'Code': code
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Twilio Verify Error:", errorData);
      throw new Error((errorData as any).message || 'Doğrulama hatası');
    }

    const data = await response.json();
    // Twilio yanıtı: { status: "approved", valid: true, ... }
    return data.status === 'approved' && data.valid === true;
  }
};
