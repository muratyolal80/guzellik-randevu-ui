/**
 * Rate Limit — provider-agnostic.
 * Default: in-memory (single-instance). Production'da UPSTASH_REDIS_REST_URL/TOKEN
 * tanımlıysa otomatik Upstash'e geçer.
 */
import { type NextRequest, NextResponse } from 'next/server';
import type { Ratelimit } from '@upstash/ratelimit';

type Bucket = { count: number; reset: number };
const memory = new Map<string, Bucket>();

const useUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

// one limiter per (limit, window) — callers pass different budgets
const upstashLimiters = new Map<string, Ratelimit>();
async function getUpstash(limit: number, windowMs: number): Promise<Ratelimit> {
  const id = `${limit}:${windowMs}`;
  const cached = upstashLimiters.get(id);
  if (cached) return cached;
  const { Ratelimit } = await import('@upstash/ratelimit');
  const { Redis } = await import('@upstash/redis');
  const rl = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(limit, `${Math.ceil(windowMs / 1000)} s`),
    prefix: `gr-rl:${id}`,
  });
  upstashLimiters.set(id, rl);
  return rl;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

/**
 * `key` örn: `booking:${ip}` veya `otp:${phone}`.
 * `limit` ve `windowMs` opsiyonel — default 10/60sn.
 */
export async function rateLimit(
  key: string,
  limit = 10,
  windowMs = 60_000,
): Promise<RateLimitResult> {
  if (useUpstash) {
    const r = await (await getUpstash(limit, windowMs)).limit(key);
    return { success: r.success, remaining: r.remaining, reset: r.reset };
  }

  const now = Date.now();
  const b = memory.get(key);
  if (!b || b.reset < now) {
    memory.set(key, { count: 1, reset: now + windowMs });
    if (memory.size > 50_000) {
      memory.forEach((v, k) => { if (v.reset < now) memory.delete(k); });
    }
    return { success: true, remaining: limit - 1, reset: now + windowMs };
  }
  b.count += 1;
  return { success: b.count <= limit, remaining: Math.max(0, limit - b.count), reset: b.reset };
}

/**
 * Client IP behind Cloudflare → Traefik. CF-Connecting-IP / X-Real-IP are set by the
 * proxies; the first X-Forwarded-For entry is client-controlled, so it is the last resort.
 */
export function getClientIp(req: NextRequest | Request): string {
  const h = req.headers;
  return (
    h.get('cf-connecting-ip')?.trim() ||
    h.get('x-real-ip')?.trim() ||
    h.get('x-forwarded-for')?.split(',')[0].trim() ||
    '127.0.0.1'
  );
}

export function rateLimitResponse(reset: number) {
  return NextResponse.json(
    { success: false, error: 'Çok fazla istek. Lütfen biraz sonra tekrar deneyin.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
        'X-RateLimit-Reset': String(reset),
      },
    },
  );
}
