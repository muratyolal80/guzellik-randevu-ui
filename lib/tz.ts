/**
 * Salon time = Europe/Istanbul, a fixed UTC+03:00 (Türkiye has no DST since 2016).
 * Every booking time is built and read through these helpers so results don't depend
 * on the server's or the browser's time zone (a UTC host used to shift slots by 3h).
 */
export const TR_TZ = 'Europe/Istanbul';
const TR_OFFSET = '+03:00';

const dateFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TR_TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
const timeFmt = new Intl.DateTimeFormat('en-GB', { timeZone: TR_TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

/** Calendar day in Türkiye, "YYYY-MM-DD". */
export function trDateString(d: Date): string {
  return dateFmt.format(d);
}

/** "HH:MM" in Türkiye. */
export function trHHMM(d: Date): string {
  return timeFmt.format(d);
}

/** Instant for a Türkiye wall-clock time on a day. `time` = "HH:MM" or "HH:MM:SS". */
export function trTime(dateStr: string, time: string): Date {
  const t = time.length === 5 ? `${time}:00` : time.slice(0, 8);
  return new Date(`${dateStr}T${t}${TR_OFFSET}`);
}

/** 0 = Sunday … 6 = Saturday, for a "YYYY-MM-DD" day (matches working_hours.day_of_week). */
export function trDayOfWeek(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** Local calendar day of a Date picked in the browser (no UTC shift), "YYYY-MM-DD". */
export function localDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Appointment statuses that occupy a staff member's time (same rule as the DB constraint). */
export const BLOCKING_STATUSES_EXCLUDED = ['CANCELLED', 'NO_SHOW'] as const;
