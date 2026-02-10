import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll(); },
                setAll() { }
            },
        }
    );

    try {
        // 1. Get Current User (Check Auth)
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Oturum bulunamadı.' }, { status: 401 });
        }

        const body = await request.json();
        const { appointmentId } = body;

        if (!appointmentId) {
            return NextResponse.json({ error: 'Randevu ID gereklidir.' }, { status: 400 });
        }

        // 2. Verify Ownership via Admin (since we use admin for update, we must be careful)
        const { data: appointment } = await supabaseAdmin
            .from('appointments')
            .select('customer_id, status')
            .eq('id', appointmentId)
            .single();

        if (!appointment) {
            return NextResponse.json({ error: 'Randevu bulunamadı.' }, { status: 404 });
        }

        if (appointment.customer_id !== user.id) {
            return NextResponse.json({ error: 'Bu randevuyu iptal etme yetkiniz yok.' }, { status: 403 });
        }

        // 3. Cancel Appointment
        const { error: updateError } = await supabaseAdmin
            .from('appointments')
            .update({ status: 'CANCELLED', updated_at: new Date().toISOString() })
            .eq('id', appointmentId);

        if (updateError) {
            console.error('Cancel Error:', updateError);
            return NextResponse.json({ error: 'İptal işlemi başarısız oldu.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Randevu iptal edildi.' });
    } catch (err: any) {
        console.error('Server Error:', err.message);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
