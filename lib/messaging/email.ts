/**
 * Resend tabanlı transactional email gönderici.
 * RESEND_API_KEY tanımlı değilse demo mode — sadece loglar.
 */
import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.RESEND_FROM_EMAIL || 'Güzellik Randevu <noreply@kuaforara.com.tr>';
const demoMode = !apiKey;

const client = apiKey ? new Resend(apiKey) : null;

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  if (demoMode) {
    console.log('[email] DEMO MODE — would send:', {
      to: params.to,
      subject: params.subject,
    });
    return { success: true, id: 'demo' };
  }
  try {
    const result = await client!.emails.send({
      from: fromAddress,
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject: params.subject,
      html: params.html,
      text: params.text,
      replyTo: params.replyTo,
    });
    if (result.error) return { success: false, error: result.error.message };
    return { success: true, id: result.data?.id };
  } catch (err: any) {
    console.error('[email] send failed:', err?.message || err);
    return { success: false, error: err?.message || 'Bilinmeyen hata' };
  }
}

// ── Templates ───────────────────────────────────────────────────────────────

export interface AppointmentConfirmationData {
  customerName: string;
  salonName: string;
  serviceName: string;
  staffName: string;
  startTime: string; // ISO
  salonAddress?: string;
  appointmentId: string;
}

export function renderAppointmentConfirmation(d: AppointmentConfirmationData) {
  const date = new Date(d.startTime);
  const dateStr = date.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  return {
    subject: `${d.salonName} — Randevunuz onaylandı (${dateStr} ${timeStr})`,
    html: `<!DOCTYPE html><html lang="tr"><body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial; background:#FAF8F5; padding:24px; color:#1a1a1a;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #f1ebe0;">
    <div style="background:linear-gradient(135deg,#C59F59 0%,#a08145 100%);padding:32px 24px;color:#fff;text-align:center;">
      <h1 style="margin:0;font-size:22px;font-weight:800;">Randevunuz Onaylandı ✓</h1>
      <p style="margin:8px 0 0;opacity:.9;font-size:14px;">${d.salonName}</p>
    </div>
    <div style="padding:24px;">
      <p style="margin:0 0 16px;">Merhaba <strong>${escapeHtml(d.customerName)}</strong>,</p>
      <p style="margin:0 0 24px;color:#555;line-height:1.6;">Randevunuz başarıyla oluşturuldu. Aşağıdaki detayları lütfen not alın.</p>

      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:12px 0;border-bottom:1px solid #f0eadf;color:#888;font-size:13px;">Hizmet</td><td style="padding:12px 0;border-bottom:1px solid #f0eadf;text-align:right;font-weight:600;">${escapeHtml(d.serviceName)}</td></tr>
        <tr><td style="padding:12px 0;border-bottom:1px solid #f0eadf;color:#888;font-size:13px;">Uzman</td><td style="padding:12px 0;border-bottom:1px solid #f0eadf;text-align:right;font-weight:600;">${escapeHtml(d.staffName)}</td></tr>
        <tr><td style="padding:12px 0;border-bottom:1px solid #f0eadf;color:#888;font-size:13px;">Tarih</td><td style="padding:12px 0;border-bottom:1px solid #f0eadf;text-align:right;font-weight:600;">${dateStr}</td></tr>
        <tr><td style="padding:12px 0;border-bottom:1px solid #f0eadf;color:#888;font-size:13px;">Saat</td><td style="padding:12px 0;border-bottom:1px solid #f0eadf;text-align:right;font-weight:700;color:#C59F59;font-size:18px;">${timeStr}</td></tr>
        ${d.salonAddress ? `<tr><td style="padding:12px 0;color:#888;font-size:13px;">Adres</td><td style="padding:12px 0;text-align:right;font-weight:500;">${escapeHtml(d.salonAddress)}</td></tr>` : ''}
      </table>

      <div style="margin-top:28px;padding:16px;background:#FAF8F5;border-radius:12px;border-left:3px solid #C59F59;font-size:13px;color:#666;line-height:1.6;">
        Randevunuza zamanında gelmenizi rica ederiz. İptal veya değişiklik için randevunuzdan en az 4 saat önce işlem yapmalısınız.
      </div>
    </div>
    <div style="padding:16px;background:#FAF8F5;text-align:center;font-size:11px;color:#999;">
      Randevu No: ${d.appointmentId}<br>
      Bu e-posta otomatik olarak gönderildi.
    </div>
  </div>
</body></html>`,
    text: `Randevunuz onaylandı.\n\nSalon: ${d.salonName}\nHizmet: ${d.serviceName}\nUzman: ${d.staffName}\nTarih: ${dateStr} ${timeStr}\n\nRandevu No: ${d.appointmentId}`,
  };
}

export interface AppointmentCancellationData {
  customerName: string;
  salonName: string;
  serviceName: string;
  startTime: string;
  reason?: string;
}

export function renderAppointmentCancellation(d: AppointmentCancellationData) {
  const date = new Date(d.startTime);
  const dateStr = date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  return {
    subject: `${d.salonName} — Randevu İptali`,
    html: `<div style="font-family:Arial;max-width:560px;margin:24px auto;padding:24px;background:#fff;border-radius:12px;border:1px solid #eee;">
      <h2 style="margin:0 0 12px;color:#dc2626;">Randevunuz iptal edildi</h2>
      <p>Merhaba <strong>${escapeHtml(d.customerName)}</strong>,</p>
      <p><strong>${escapeHtml(d.salonName)}</strong> salonundaki <strong>${escapeHtml(d.serviceName)}</strong> hizmetiniz için ${dateStr} ${timeStr} tarihindeki randevunuz iptal edilmiştir.</p>
      ${d.reason ? `<p style="background:#fef2f2;padding:12px;border-radius:8px;color:#991b1b;font-size:13px;">${escapeHtml(d.reason)}</p>` : ''}
      <p style="color:#666;font-size:13px;">Yeni bir randevu için sitemizi ziyaret edebilirsiniz.</p>
    </div>`,
    text: `Randevu iptali: ${d.salonName} - ${d.serviceName} - ${dateStr} ${timeStr}`,
  };
}

function escapeHtml(s: string) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
