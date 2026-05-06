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

        // 2. Verify Ownership and Get Details
        const { data: appointment } = await supabaseAdmin
            .from('appointments')
            .select(`
                customer_id, 
                status, 
                start_time, 
                deposit_amount, 
                iyzico_payment_id,
                salon_id,
                salons (cancellation_deadline_hours)
            `)
            .eq('id', appointmentId)
            .single();

        if (!appointment) {
            return NextResponse.json({ error: 'Randevu bulunamadı.' }, { status: 404 });
        }

        if (appointment.customer_id !== user.id) {
            return NextResponse.json({ error: 'Bu randevuyu iptal etme yetkiniz yok.' }, { status: 403 });
        }

        // Zaten iptal edilmiş randevu için tekrar iptal yapma
        if (appointment.status === 'CANCELLED') {
            return NextResponse.json({ error: 'Bu randevu zaten iptal edilmiş.' }, { status: 400 });
        }

        // Tamamlanmış randevu iptal edilemez
        if (appointment.status === 'COMPLETED') {
            return NextResponse.json({ error: 'Tamamlanmış randevular iptal edilemez.' }, { status: 400 });
        }

        // ── Cancellation Policy Enforcement ─────────────────────────────────
        // Hard lock: randevuya çok az kala iptal yasak (default 1 saat).
        // .env'den CANCELLATION_HARD_LOCK_MINUTES ile değiştirilebilir.
        const hardLockMinutes = Number(process.env.CANCELLATION_HARD_LOCK_MINUTES || 60);
        const minutesUntilStart =
            (new Date(appointment.start_time).getTime() - Date.now()) / 60000;

        if (minutesUntilStart < hardLockMinutes) {
            const hoursLeft = Math.max(0, Math.floor(minutesUntilStart / 60));
            const minsLeft = Math.max(0, Math.floor(minutesUntilStart % 60));
            return NextResponse.json(
                {
                    error: `Randevunuza ${hoursLeft > 0 ? hoursLeft + ' saat ' : ''}${minsLeft} dakika kalmış. Bu süre içinde iptal yapılamaz, lütfen salonu doğrudan arayın.`,
                    code: 'CANCELLATION_LOCKED',
                    hardLockMinutes,
                    minutesUntilStart: Math.floor(minutesUntilStart),
                },
                { status: 400 },
            );
        }

        // 3. Refund Logic
        let refundProcessed = false;
        let refundError = null;

        if (appointment.deposit_amount > 0 && appointment.iyzico_payment_id) {
            const startTime = new Date(appointment.start_time);
            const now = new Date();
            const hoursUntilStart = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
            const deadline = (appointment.salons as any)?.cancellation_deadline_hours || 24;

            if (hoursUntilStart >= deadline) {
                try {
                    const { IyzicoService } = await import('@/lib/payment/iyzico');
                    const refundResult = await IyzicoService.refund({
                        locale: 'tr',
                        conversationId: `refund_${appointmentId}`,
                        paymentTransactionId: appointment.iyzico_payment_id, // We use this as the transaction ID
                        price: (appointment.deposit_amount).toString(), // Refund full deposit
                        currency: 'TRY',
                        ip: request.headers.get('x-forwarded-for') || '127.0.0.1'
                    });

                    if (refundResult.status === 'success') {
                        refundProcessed = true;
                    } else {
                        refundError = refundResult.errorMessage || 'İade işlemi iyzico tarafından reddedildi.';
                    }
                } catch (err: any) {
                    console.error('Refund API Error:', err);
                    refundError = 'İade servisi şu anda kullanılamıyor.';
                }
            }
        }

        // 4. Cancel Appointment & Update Refund Status
        const { error: updateError } = await supabaseAdmin
            .from('appointments')
            .update({ 
                status: 'CANCELLED', 
                refund_status: refundProcessed ? 'SUCCESS' : (refundError ? 'FAILED' : null),
                refund_amount: refundProcessed ? appointment.deposit_amount : 0,
                notes: refundError ? `[İADE HATASI: ${refundError}]` : undefined,
                updated_at: new Date().toISOString() 
            })
            .eq('id', appointmentId);

        if (updateError) {
            console.error('Cancel Error:', updateError);
            return NextResponse.json({ error: 'İptal işlemi başarısız oldu.' }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            message: refundProcessed 
                ? 'Randevunuz iptal edildi ve kaporanız iade edildi.' 
                : 'Randevunuz iptal edildi.' 
        });
    } catch (err: any) {
        console.error('Server Error:', err.message);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
