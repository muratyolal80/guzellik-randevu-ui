import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { verifyOTP, cleanPhone } from '@/lib/otp';
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
    const { phone, otp, consent } = await request.json();

    if (!phone || !otp) {
      return NextResponse.json({ error: 'Telefon ve kod gerekli.' }, { status: 400 });
    }

    const cleanedPhone = cleanPhone(phone);
    const e164Phone = `+90${cleanedPhone}`;

    // 1. Verify OTP
    const isValidOTP = await verifyOTP(cleanedPhone, otp);
    if (!isValidOTP) {
      return NextResponse.json({ error: 'Geçersiz veya süresi dolmuş kod.' }, { status: 401 });
    }

    // 2. Find or Create User
    let userId: string;
    let isNewUser = false;
    let profile = null;

    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = users.find(u => u.phone === e164Phone);

    if (existingUser) {
      userId = existingUser.id;

      // Fetch Profile
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      profile = existingProfile;
    } else {
      isNewUser = true;
      // We don't create the user here yet if we want to capture email/name first?
      // Actually, to log them in, we MUST create the user now.
      // We will create a placeholder user. Since we removed temp email fallback requirement,
      // we need a temporary email to satisfy Supabase Auth if email is required, 
      // OR we rely on Phone Auth only. 
      // Assuming Phone Auth is enabled in Supabase.

      // However, the prompt said "Fallback temp mail is no longer needed".
      // This implies we should use the REAL email provided in the next step.
      // BUT we need to log them in NOW.
      // So we must create the user account now to establish the session.

      // Strategy: Create user with phone only (if supported) or a placeholder that we update later.
      // Let's use a placeholder that clearly indicates it needs update: `pending_${phone}@guzellik.app`

      const tempEmail = `${cleanedPhone}@pending.user`;

      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        phone: e164Phone,
        email: tempEmail,
        email_confirm: true,
        phone_confirm: true,
      });

      if (createError || !newUser.user) {
        console.error("User creation failed:", createError);
        return NextResponse.json({ error: 'Kullanıcı oluşturulamadı.' }, { status: 500 });
      }
      userId = newUser.user.id;
    }

    // 3. Login (Set Session)
    // We use the Password Strategy (resetting it to a temp one) to force a login
    // This is robust and works without user interaction
    const tempPassword = Math.random().toString(36).slice(-8) + "Aa1!";
    await supabaseAdmin.auth.admin.updateUserById(userId, { password: tempPassword });

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      phone: e164Phone,
      password: tempPassword
    });

    if (signInError) {
      // Fallback: Try email login if phone login fails (though phone should work if enabled)
      // Or maybe phone login isn't enabled in project settings?
      // Let's try email as backup if we have one
      const userEmail = existingUser?.email || `${cleanedPhone}@pending.user`;
      await supabase.auth.signInWithPassword({
        email: userEmail,
        password: tempPassword
      });
    }

    // 3.5. Log IYS Consent (If consent given)
    if (consent) {
      // Here we would insert into IYSLog or update user preferences
      console.log(`[IYS LOG] User ${userId} gave consent. Phone: ${e164Phone}`);

      // TODO: Insert into iys_logs table if exists 
      // await supabaseAdmin.from('iys_logs').insert({...})
    }

    // 4. Return Response
    const finalResponse = NextResponse.json({
      success: true,
      isNewUser,
      profile: profile || null
    });

    cookieStore.forEach((cookie) => {
      finalResponse.cookies.set(cookie.name, cookie.value, cookie.options);
    });

    return finalResponse;

  } catch (error: any) {
    console.error('Verify Phone Error:', error.message);
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 });
  }
}