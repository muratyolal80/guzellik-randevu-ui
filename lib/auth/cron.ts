import { timingSafeEqual } from 'crypto';
import type { NextRequest } from 'next/server';

/**
 * Cron endpoints send SMS (cost) — closed unless CRON_SECRET is configured, and the
 * secret is accepted only as `Authorization: Bearer <secret>` (query strings land in logs).
 */
export function isCronAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const given = Buffer.from(request.headers.get('authorization') || '');
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
