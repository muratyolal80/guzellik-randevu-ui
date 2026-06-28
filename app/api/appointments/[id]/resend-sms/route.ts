import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendAppointmentSMS } from '@/lib/messaging/sms';
import { rateLimit } from '@/lib/rate-limit';

/**
 * POST /api/appointments/[id]/resend-sms
 *
 * Müşteri SMS gelmediği durumlarda tekrar göndertir.
 * Rate limit: telefon başına 3/dakika (spam koruma).
 *
 * Yetki: müşteri (kendi randevusu) veya salon owner / admin
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: appointmentId } = await params;

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll(); },
                setAll() { },
            },
        }
    );

    try {
        const { data: { user } } = await supabase.auth.getUser();

        const { data: appointment, error: apptErr } = await supabaseAdmin
            .from('appointments')
            .select('id, status, customer_id, customer_phone, customer_name, start_time, salon_id, salon:salons(name, owner_id)')
            .eq('id', appointmentId)
            .maybeSingle();

        if (apptErr || !appointment) {
            return NextResponse.json({ error: 'Randevu bulunamadı.' }, { status: 404 });
        }

        // Yetki: misafir randevu = herkes resend yapabilir
        // Üyelik randevu = sadece müşteri, owner, admin
        if (user && appointment.customer_id) {
            const isCustomer = appointment.customer_id === user.id;
            const isOwner = (appointment.salon as any)?.owner_id === user.id;
            let isAdmin = false;
            if (!isCustomer && !isOwner) {
                const { data: profile } = await supabaseAdmin
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                isAdmin = ['SUPER_ADMIN', 'ADMIN'].includes((profile?.role || '').toUpperCase());
            }
            if (!isCustomer && !isOwner && !isAdmin) {
                return NextResponse.json({ error: 'Yetkiniz yok.' }, { status: 403 });
            }
        }

        if (!appointment.customer_phone) {
            return NextResponse.json({ error: 'Telefon numarası bulunamadı.' }, { status: 400 });
        }

        // Rate limit: telefon başına 3/dakika
        const rl = await rateLimit(`sms-resend:${appointment.customer_phone}`, 3, 60_000);
        if (!rl.success) {
            return NextResponse.json(
                {
                    error: 'Çok sık SMS isteği. Lütfen 1 dakika sonra tekrar deneyin.',
                },
                { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.reset - Date.now()) / 1000)) } }
            );
        }

        const startStr = new Date(appointment.start_time).toLocaleString('tr-TR', {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
        });
        const salonName = (appointment.salon as any)?.name || 'Salon';
        const statusLabel = appointment.status === 'CONFIRMED' ? 'onaylandı' : 'alındı';
        const msg = `Randevu hatırlatma: ${salonName} - ${startStr} (${statusLabel}). İptal/değişiklik için salonu arayın.`;

        const smsDelivered = await sendAppointmentSMS(
            appointment.salon_id,
            appointment.customer_phone,
            msg,
        );

        if (!smsDelivered) {
            return NextResponse.json(
                { error: 'SMS gönderilemedi, sistem hatası.' },
                { status: 502 }
            );
        }

        return NextResponse.json({ success: true, smsDelivered });
    } catch (err: any) {
        console.error('[appointment/resend-sms] error:', err);
        return NextResponse.json(
            { error: err?.message || 'Beklenmedik hata' },
            { status: 500 }
        );
    }
}
