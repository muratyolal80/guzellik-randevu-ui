/**
 * Sprint F (R8) — RFC 5545 iCalendar (.ics) export
 *
 * Confirmation page'de "Takvime Ekle" butonu için kullanılır.
 * Tarayıcı doğrudan indirir, Google/Apple/Outlook açar.
 */

export interface IcsEvent {
  uid: string;             // benzersiz ID (genelde appointment.id)
  start: Date;             // randevu başlangıç
  end: Date;               // randevu bitiş
  summary: string;         // başlık (örn. "Saç Kesimi — Salon Adı")
  description?: string;    // açıklama
  location?: string;       // salon adresi
  organizer?: string;      // salon email/isim
}

function formatIcsDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  );
}

function escapeIcs(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

export function buildIcs(event: IcsEvent): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Guzellik Randevu//Booking//TR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.uid}@kuaforara.com.tr`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(event.start)}`,
    `DTEND:${formatIcsDate(event.end)}`,
    `SUMMARY:${escapeIcs(event.summary)}`,
  ];
  if (event.description) lines.push(`DESCRIPTION:${escapeIcs(event.description)}`);
  if (event.location) lines.push(`LOCATION:${escapeIcs(event.location)}`);
  if (event.organizer) lines.push(`ORGANIZER:CN=${escapeIcs(event.organizer)}`);
  lines.push('STATUS:CONFIRMED', 'END:VEVENT', 'END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadIcs(event: IcsEvent, filename = 'randevu.ics') {
  if (typeof window === 'undefined') return;
  const content = buildIcs(event);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
