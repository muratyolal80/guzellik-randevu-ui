import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/services/server-notification';

/**
 * CRON JOB — Notification Queue Processor
 *
 * Vercel Cron veya benzeri scheduler her 5 dakikada bir POST/GET ile çağırır.
 * processQueue() PENDING notifications'ı toplar, SMS/email gönderir, SENT/FAILED işaretler.
 *
 * Auth: Authorization: Bearer ${CRON_SECRET} (header) veya ?token=${CRON_SECRET} (query)
 */

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function handle(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = request.nextUrl.searchParams.get('token');
  const expected = process.env.CRON_SECRET;

  if (expected) {
    const headerOk = authHeader === `Bearer ${expected}`;
    const queryOk = token === expected;
    if (!headerOk && !queryOk) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const startedAt = Date.now();
  try {
    const result = await NotificationService.processQueue(50);
    const durationMs = Date.now() - startedAt;
    return NextResponse.json({
      ok: true,
      durationMs,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[cron/notifications] error:', err?.message || err);
    return NextResponse.json(
      { ok: false, error: err?.message || 'unknown', timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
