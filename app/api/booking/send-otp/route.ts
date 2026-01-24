/**
 * API Route: Send OTP
 * SMS dogrulama kodu gonderir
 *
 * POST /api/booking/send-otp
 * Body: { phone: "5551234567" }
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateOTP, saveOTP, cleanPhone, getActiveOTP } from '@/lib/otp';
import { sendOTPSMS } from '@/lib/sms';

// Rate limiting icin basit bir in-memory store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(phone: string): boolean {
  const now = Date.now();
  const limit = rateLimitStore.get(phone);

  if (!limit || now > limit.resetTime) {
    rateLimitStore.set(phone, {
      count: 1,
      resetTime: now + 60 * 1000,
    });
    return true;
  }

  // Rate limit is slightly relaxed here because we might just be returning "existing code"
  if (limit.count >= 5) {
    return false;
  }

  limit.count += 1;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { error: 'Telefon numarasi gerekli' },
        { status: 400 }
      );
    }

    const cleanedPhone = cleanPhone(phone);

    if (cleanedPhone.length !== 10) {
      return NextResponse.json(
        { error: 'Gecersiz telefon numarasi formati' },
        { status: 400 }
      );
    }

    if (!checkRateLimit(cleanedPhone)) {
      return NextResponse.json(
        { error: 'Cok fazla istek. Lutfen 1 dakika bekleyin.' },
        { status: 429 }
      );
    }

    // 1. Check for existing active OTP (Optimize SMS usage)
    const activeCode = await getActiveOTP(cleanedPhone);
    const isDemoMode = process.env.OTP_DEMO_MODE === 'true';

    if (activeCode) {
      console.log('Active OTP found for', cleanedPhone, 'skipping SMS');
      return NextResponse.json({
        success: true,
        message: isDemoMode
          ? `Demo mode: Mevcut kod "${activeCode}" kullanin`
          : 'Mevcut dogrulama kodu hala gecerli. Lutfen kontrol edin.',
        demoMode: isDemoMode,
        ...(isDemoMode && { demoCode: activeCode }),
      });
    }

    const code = generateOTP();

    // saveOTP now throws error if it fails
    await saveOTP(cleanedPhone, code);

    const smsSent = await sendOTPSMS(cleanedPhone, code);

    if (!smsSent && process.env.OTP_DEMO_MODE !== 'true') {
      console.warn('SMS gonderilemedi ama OTP DBye kaydedildi');
    }


    return NextResponse.json({
      success: true,
      message: isDemoMode
        ? 'Demo mode: OTP kodu "111111" kullanin'
        : 'SMS gonderildi. Lutfen telefonunuzu kontrol edin.',
      demoMode: isDemoMode,
      ...(isDemoMode && { demoCode: '111111' }),
    });

  } catch (err) {
    console.error('Unexpected error in send-otp:', err);
    return NextResponse.json(
      { error: `Hata: ${(err as Error).message}` },
      { status: 500 }
    );
  }
}

