/**
 * Cloudflare Turnstile server-side verify.
 * https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 *
 * Secret yoksa veya token "demo-no-turnstile" ise true döner (development konforu).
 */
const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export interface TurnstileVerifyResult {
  success: boolean;
  errorCodes?: string[];
  hostname?: string;
}

export async function verifyTurnstile(token: string | undefined, ip?: string): Promise<TurnstileVerifyResult> {
  const secret = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;

  // Demo / dev mode: secret yoksa veya token "demo" ise geç
  if (!secret) return { success: true };
  if (!token || token === 'demo-no-turnstile') return { success: true };

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.append('remoteip', ip);

    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!res.ok) return { success: false, errorCodes: [`http-${res.status}`] };

    const data = await res.json();
    return {
      success: !!data.success,
      errorCodes: data['error-codes'],
      hostname: data.hostname,
    };
  } catch (err: any) {
    console.error('[turnstile] verify failed:', err?.message || err);
    return { success: false, errorCodes: ['fetch-failed'] };
  }
}
