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

    // 2. Check if user is already logged in
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    let userId: string;
    let isNewUser = false;
    let profile = null;

    if (currentUser) {
      // User is already logged in - just update their phone
      userId = currentUser.id;
      isNewUser = false;

      // Update phone in auth.users
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        phone: e164Phone
      });

      // Fetch existing profile
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      profile = existingProfile;

      console.log(`[verify-phone] Updated phone for logged-in user ${userId}`);
    } else {
      // User is NOT logged in - find or create account
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
        // Create new user with phone
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
      // Fallback: Try email login if phone login fails
      // Use profile email if available, otherwise use pending.user email
      const userEmail = profile?.email || `${cleanedPhone}@pending.user`;
      await supabase.auth.signInWithPassword({
        email: userEmail,
        password: tempPassword
      });
    }

    // 3.5. Log IYS Consent & SMS Verification (IYS COMPLIANCE)
    if (consent && isNewUser) {
      // For new users, record SMS verification for IYS compliance
      const { error: iysError } = await supabaseAdmin
        .from('sms_verifications')
        .insert({
          user_id: userId,
          phone: e164Phone,
          verified_at: new Date().toISOString(),
          iys_registered: false, // Will be set to true after actual IYS API call
          consent_given: true
        });

      if (iysError) {
        console.error('[IYS] Failed to log SMS verification:', iysError.message);
      } else {
        console.log(`[IYS LOG] User ${userId} gave consent. Phone: ${e164Phone}`);

        // TODO: Call actual IYS API to register consent
        // await registerToIYS(userId, e164Phone);
        // After success, update iys_registered = true, iys_registered_at = now()
      }
    } else if (consent && !isNewUser) {
      // Existing user verified phone again (maybe changed phone)
      // Check if we have a verification record
      const { data: existingVerification } = await supabaseAdmin
        .from('sms_verifications')
        .select('id')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();

      if (!existingVerification) {
        // No previous verification, add it now
        await supabaseAdmin
          .from('sms_verifications')
          .insert({
            user_id: userId,
            phone: e164Phone,
            verified_at: new Date().toISOString(),
            iys_registered: false,
            consent_given: true
          });

        console.log(`[IYS LOG] Existing user ${userId} verified phone. Phone: ${e164Phone}`);
      }
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