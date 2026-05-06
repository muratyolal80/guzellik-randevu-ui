/**
 * Rate Limit — provider-agnostic.
 * Default: in-memory LRU (single-instance). Production'da UPSTASH_REDIS_REST_URL/TOKEN
 * tanımlıysa otomatik Upstash'e geçer.
 */
import { type NextRequest, NextResponse } from 'next/server';

type Bucket = { count: number; reset: number };
const memory = new Map<string, Bucket>();

const useUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

let upstashLimiter: any = null;
async function getUpstash() {
  if (upstashLimiter) return upstashLimiter;
  const { Ratelimit } = await import('@upstash/ratelimit');
  const { Redis } = await import('@upstash/redis');
  upstashLimiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '60 s'),
    analytics: true,
    prefix: 'gr-rl',
  });
  return upstashLimiter;
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
    const rl = await getUpstash();
    const r = await rl.limit(key);
    return { success: r.success, remaining: r.remaining, reset: r.reset };
  }

  const now = Date.now();
  const b = memory.get(key);
  if (!b || b.reset < now) {
    memory.set(key, { count: 1, reset: now + windowMs });
    return { success: true, remaining: limit - 1, reset: now + windowMs };
  }
  b.count += 1;
  return { success: b.count <= limit, remaining: Math.max(0, limit - b.count), reset: b.reset };
}

export function getClientIp(req: NextRequest | Request): string {
  const h = (req as any).headers;
  const xff = h.get?.('x-forwarded-for') || h.get?.('cf-connecting-ip') || '';
  return xff.split(',')[0].trim() || '127.0.0.1';
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
