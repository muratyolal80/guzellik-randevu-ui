import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
    const response = new NextResponse();
    const cookieStore: { name: string, value: string, options: any }[] = [];

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll(); },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach((cookie) => {
                        cookieStore.push(cookie);
                    });
                },
            },
            cookieOptions: {
                secure: process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('localhost'),
                sameSite: 'lax',
                path: '/',
            }
        }
    );

    try {
        const { email, token, consent } = await request.json();

        if (!email || !token) {
            return NextResponse.json({ error: 'E-posta ve kod gerekli.' }, { status: 400 });
        }

        // Verify OTP token
        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'email'
        });

        if (error || !data.user) {
            return NextResponse.json({ error: 'Geçersiz veya süresi dolmuş kod.' }, { status: 401 });
        }

        const userId = data.user.id;

        // Fetch or create profile
        let profile = null;
        const { data: existingProfile } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        profile = existingProfile;

        // Log consent if given
        if (consent) {
            console.log(`[IYS LOG] User ${userId} gave consent via email. Email: ${email}`);
        }

        // Return response
        const finalResponse = NextResponse.json({
            success: true,
            isNewUser: !profile,
            profile: profile || null
        });

        cookieStore.forEach((cookie) => {
            finalResponse.cookies.set(cookie.name, cookie.value, cookie.options);
        });

        return finalResponse;

    } catch (error: any) {
        console.error('Verify Email Error:', error.message);
        return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 });
    }
}
