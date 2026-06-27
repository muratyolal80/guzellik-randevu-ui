import React from 'react';
import type { Appointment, SalonDetail, Staff, SalonServiceDetail } from '@/types';

interface PrintTicketProps {
  appointment: Appointment | null;
  salon: SalonDetail | null;
  staff: Staff | null;
  services: SalonServiceDetail[];
  customerName?: string;
  customerPhone?: string;
}

/**
 * Yazdırma için optimize edilmiş "ticket" görünümü.
 *
 * - Ekranda gizli (Tailwind: hidden print:block)
 * - Print sırasında SADECE bu component'in çıktısı sayfaya gelir (CSS @media print)
 * - Tek sayfaya sığar — sabit genişlik 80mm thermal printer'a da uyar
 */
export default function PrintTicket({
  appointment,
  salon,
  staff,
  services,
  customerName,
  customerPhone,
}: PrintTicketProps) {
  if (!appointment && !salon) return null;

  const start = appointment?.start_time
    ? new Date(appointment.start_time)
    : null;

  const total = services.reduce((acc, s) => acc + (s.price || 0), 0);
  const discountAmount = appointment?.discount_amount ?? 0;
  const finalPrice = Math.max(0, total - discountAmount);

  const shortId = appointment?.id?.substring(0, 8).toUpperCase() ?? '—';

  return (
    <div className="print-ticket hidden print:block">
      <div className="ticket-frame">
        <header className="ticket-header">
          <p className="ticket-eyebrow">RANDEVU ONAY BELGESİ</p>
          <h1 className="ticket-salon">{salon?.name || 'Salon'}</h1>
          {salon?.address && (
            <p className="ticket-meta">
              {[salon.address, salon.district_name, salon.city_name]
                .filter(Boolean)
                .join(', ')}
            </p>
          )}
          {salon?.phone && <p className="ticket-meta">Tel: {salon.phone}</p>}
        </header>

        <div className="ticket-divider" />

        <section className="ticket-when">
          <div>
            <p className="ticket-label">Randevu Tarihi</p>
            <p className="ticket-value-lg">
              {start
                ? start.toLocaleDateString('tr-TR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : '—'}
            </p>
          </div>
          <div>
            <p className="ticket-label">Saat</p>
            <p className="ticket-value-lg">
              {start
                ? start.toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '—'}
            </p>
          </div>
        </section>

        <div className="ticket-divider" />

        <section className="ticket-services">
          <p className="ticket-label">Hizmetler</p>
          {services.length === 0 ? (
            <p className="ticket-value">—</p>
          ) : (
            services.map((s: any) => (
              <div className="ticket-service-row" key={s.id}>
                <span>
                  {s.service_name || s.name || 'Hizmet'}
                  {s.duration_min ? ` · ${s.duration_min} dk` : ''}
                </span>
                <span className="ticket-value">{s.price ?? 0} ₺</span>
              </div>
            ))
          )}
        </section>

        {staff && staff.name && (
          <>
            <div className="ticket-divider" />
            <section className="ticket-row">
              <p className="ticket-label">Uzman</p>
              <p className="ticket-value">{staff.name}</p>
            </section>
          </>
        )}

        <div className="ticket-divider" />

        <section className="ticket-row">
          <p className="ticket-label">Müşteri</p>
          <p className="ticket-value">
            {appointment?.customer_name || customerName || '—'}
          </p>
        </section>
        <section className="ticket-row">
          <p className="ticket-label">Telefon</p>
          <p className="ticket-value">
            {appointment?.customer_phone || customerPhone || '—'}
          </p>
        </section>

        <div className="ticket-divider" />

        <section className="ticket-total">
          {discountAmount > 0 && (
            <>
              <div className="ticket-total-row">
                <span>Ara Toplam</span>
                <span>{total} ₺</span>
              </div>
              <div className="ticket-total-row">
                <span>İndirim {appointment?.coupon_code ? `(${appointment.coupon_code})` : ''}</span>
                <span>-{discountAmount} ₺</span>
              </div>
            </>
          )}
          <div className="ticket-total-row ticket-total-final">
            <span>TOPLAM</span>
            <span>{finalPrice} ₺</span>
          </div>
          <p className="ticket-meta ticket-pay-note">
            Ödeme salonda gerçekleştirilecek.
          </p>
        </section>

        <div className="ticket-divider" />

        <footer className="ticket-footer">
          <p className="ticket-label">Randevu No</p>
          <p className="ticket-id">{shortId}</p>
          <p className="ticket-uuid">{appointment?.id ?? ''}</p>
          <p className="ticket-meta ticket-fineprint">
            Lütfen randevu saatinizden 15 dakika önce salonda olun.
            <br />
            İptal veya değişiklik için salonu arayın.
          </p>
          <p className="ticket-meta ticket-brand">kuaforara.com.tr</p>
        </footer>
      </div>
    </div>
  );
}
