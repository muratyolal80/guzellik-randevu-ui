/**
 * Sprint C (K3) — Salon açık/kapalı durumu kontrolü.
 *
 * working_hours array'inden bugünkü kayıt + şu anki saati karşılaştırır.
 * Slot-level mevcudiyet (bugün slot var mı?) ileri sprintte SlotService ile entegre edilecek.
 */

export interface WorkingHourLike {
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  is_closed?: boolean;
}

export interface SalonLike {
  working_hours?: WorkingHourLike[];
}

/**
 * Postgres convention: day_of_week 0=Pazar ... 6=Cumartesi.
 * JS Date.getDay() de aynı (0=Sunday ... 6=Saturday). Direkt eşleşir.
 */
export function isSalonOpenNow(salon: SalonLike, now: Date = new Date()): boolean {
  const wh = salon?.working_hours;
  if (!Array.isArray(wh) || wh.length === 0) return false;

  const dow = now.getDay();
  const today = wh.find((w) => Number(w?.day_of_week) === dow);
  if (!today || today.is_closed) return false;

  const start = parseHHMM(String(today.start_time || '00:00'));
  const end = parseHHMM(String(today.end_time || '00:00'));
  if (start === null || end === null) return false;

  const nowMin = now.getHours() * 60 + now.getMinutes();
  return nowMin >= start && nowMin < end;
}

function parseHHMM(s: string): number | null {
  const m = s.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const h = Number(m[1]);
  const mm = Number(m[2]);
  if (Number.isNaN(h) || Number.isNaN(mm)) return null;
  return h * 60 + mm;
}
