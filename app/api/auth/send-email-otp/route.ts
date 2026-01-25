import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Geçerli bir e-posta adresi girin.' }, { status: 400 });
        }

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

    } catch (error: any) {
        console.error('Send Email OTP Error:', error.message);
        return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 });
    }
}
