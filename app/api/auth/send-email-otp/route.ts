import { toErrorLike } from '@/lib/error-mapping';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { rateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            return NextResponse.json({ error: 'Geçerli bir e-posta adresi girin.' }, { status: 400 });
        }

        const [byIp, byEmail] = await Promise.all([
            rateLimit(`email-otp:ip:${getClientIp(request)}`, 5, 10 * 60_000),
            rateLimit(`email-otp:email:${email.trim().toLowerCase()}`, 3, 10 * 60_000),
        ]);
        if (!byIp.success) return rateLimitResponse(byIp.reset);
        if (!byEmail.success) return rateLimitResponse(byEmail.reset);

        // Send magic link via Supabase Auth
        const { error } = await supabaseAdmin.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: true,
            }
        });

        if (error) {
            console.error('Email OTP send error:', error.message);
            return NextResponse.json({ error: 'E-posta gönderilemedi.' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Doğrulama kodu e-postanıza gönderildi.'
        });

    } catch (error: unknown) {
        console.error('Send Email OTP Error:', toErrorLike(error).message);
        return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 });
    }
}
