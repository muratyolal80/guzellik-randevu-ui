import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

/**
 * Health check endpoint — UptimeRobot / BetterStack / Vercel Cron tarafından çağrılır.
 * 200 → her şey yolunda, 503 → DB veya kritik servis çalışmıyor.
 */
export async function GET() {
  const started = Date.now();
  const checks: Record<string, { ok: boolean; latencyMs?: number; error?: string }> = {};

  // 1) Database ping
  try {
    const t0 = Date.now();
    const { error } = await supabaseAdmin.from('cities').select('id').limit(1);
    checks.database = { ok: !error, latencyMs: Date.now() - t0, error: error?.message };
  } catch (e: any) {
    checks.database = { ok: false, error: e?.message || 'unknown' };
  }

  // 2) Resend email (yapılandırılmış mı sadece — gerçek istek atmıyoruz)
  checks.email = { ok: !!process.env.RESEND_API_KEY };

  // 3) Sentry (yapılandırılmış mı)
  checks.errorTracking = { ok: !!(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN) };

  // 4) Iyzico
  checks.payment = { ok: !!process.env.IYZIPAY_API_KEY };

  const overallOk = checks.database.ok; // DB mecburi, diğerleri opsiyonel
  const status = overallOk ? 200 : 503;

  return NextResponse.json(
    {
      status: overallOk ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime?.() ?? null,
      version: process.env.npm_package_version ?? 'unknown',
      checks,
      latencyMs: Date.now() - started,
    },
    { status, headers: { 'Cache-Control': 'no-store, max-age=0' } },
  );
}
