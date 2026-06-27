/**
 * IYS (Iletisim Yonetim Sistemi) log helper.
 *
 * Türkiye'de ticari elektronik ileti (SMS/email pazarlama) için zorunlu kayıt.
 * Her gönderim öncesi/sonrası bu helper ile loglanmalı.
 *
 * Not: Bu sadece YEREL log tutar — gerçek IYS API entegrasyonu için
 * https://iys.org.tr/api/v1/sps adresine ayrı bir bridge gerekir.
 */
import { supabaseAdmin } from '@/lib/supabase-admin';

export type IysChannel = 'SMS' | 'EMAIL' | 'CALL';
export type IysMessageType = 'TRANSACTIONAL' | 'MARKETING';
export type IysStatus = 'SENT' | 'FAILED' | 'REJECTED' | 'PENDING';

export interface IysLogEntry {
  recipient: string;
  channel: IysChannel;
  messageType: IysMessageType;
  status: IysStatus;
  contentSummary?: string;
  consentId?: string;
  failureReason?: string;
  userId?: string;
  salonId?: string;
  relatedId?: string;
  metadata?: Record<string, any>;
}

export async function logIys(entry: IysLogEntry): Promise<void> {
  try {
    await supabaseAdmin.from('iys_log').insert({
      recipient: entry.recipient,
      channel: entry.channel,
      message_type: entry.messageType,
      status: entry.status,
      content_summary: entry.contentSummary,
      consent_id: entry.consentId,
      failure_reason: entry.failureReason,
      user_id: entry.userId,
      salon_id: entry.salonId,
      related_id: entry.relatedId,
      metadata: entry.metadata || {},
    });
  } catch (err) {
    // log failure is non-blocking — sadece console
    console.error('[iys] log failed:', err);
  }
}

/**
 * Pazarlama mesajı göndermeden önce kullanıcının izin verip vermediğini kontrol eder.
 * Yeni alan: marketing_opt_in (New-16), geriye uyumluluk: marketing_consent.
 */
export async function hasMarketingConsent(userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('marketing_opt_in, marketing_consent')
    .eq('id', userId)
    .maybeSingle();
  return !!(data?.marketing_opt_in || data?.marketing_consent);
}

// ============================================================================
// IYS API entegrasyonu — gerçek register endpoint çağrısı
// ============================================================================

export type IysConsentType = 'MESAJ' | 'ARAMA' | 'EPOSTA';
export type IysConsentSource = 'WEB' | 'MOBIL' | 'CAGRI_MERKEZI' | 'FIZIKSEL';
export type IysConsentStatus = 'ONAY' | 'RET';

export interface IysRegisterParams {
  userId: string;
  phone: string;                 // E.164 format (+90...)
  type?: IysConsentType;         // default: MESAJ
  source?: IysConsentSource;     // default: WEB
  status?: IysConsentStatus;     // default: ONAY
  consentDate?: string;          // ISO; default: now
}

export interface IysRegisterResult {
  success: boolean;
  skipped: boolean;              // env yoksa veya demo mode
  iysId?: string;                // API'den dönen rıza ID'si
  error?: string;
  raw?: unknown;
}

/**
 * IYS API'ye rıza kaydı gönderir. NetGSM proxy veya direkt IYS endpoint kullanılır.
 * Env değişkenleri eksikse skipped=true ile döner (demo mode + hata değil).
 */
export async function registerIYSConsent(
  params: IysRegisterParams
): Promise<IysRegisterResult> {
  const apiUrl = process.env.IYS_API_URL;
  const apiKey = process.env.IYS_API_KEY;
  const brandCode = process.env.IYS_BRAND_CODE;

  if (!apiUrl || !apiKey || !brandCode) {
    console.log('[IYS] Skipped: IYS_API_URL/KEY/BRAND_CODE env yok (demo mode)');
    return { success: false, skipped: true };
  }

  const payload = {
    recipient: params.phone,
    recipientType: 'BIREYSEL',
    type: params.type ?? 'MESAJ',
    source: params.source ?? 'WEB',
    status: params.status ?? 'ONAY',
    consentDate: params.consentDate ?? new Date().toISOString(),
  };

  try {
    const endpoint = apiUrl.replace(/\/+$/, '') + `/sps/${brandCode}/consents`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error(`[IYS] API ${response.status}: ${errText.slice(0, 200)}`);
      return { success: false, skipped: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json().catch(() => ({}));
    const iysId: string | undefined = data?.consentId || data?.id;

    // sms_verifications.iys_registered flag güncelle
    await supabaseAdmin
      .from('sms_verifications')
      .update({
        iys_registered: true,
        iys_registered_at: new Date().toISOString(),
        iys_consent_id: iysId ?? null,
      })
      .eq('user_id', params.userId)
      .eq('phone', params.phone);

    console.log(`[IYS] OK userId=${params.userId} iysId=${iysId ?? '-'}`);
    return { success: true, skipped: false, iysId, raw: data };
  } catch (err: any) {
    console.error('[IYS] Network/parse error:', err?.message || err);
    return { success: false, skipped: false, error: err?.message || 'unknown' };
  }
}
