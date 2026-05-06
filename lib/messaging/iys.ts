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
 * profiles.marketing_consent alanına bakar (varsa).
 */
export async function hasMarketingConsent(userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('marketing_consent')
    .eq('id', userId)
    .maybeSingle();
  return !!data?.marketing_consent;
}
