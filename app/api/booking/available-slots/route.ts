import { toErrorLike } from '@/lib/error-mapping';
import { NextRequest, NextResponse } from 'next/server';
import { SlotService } from '@/services/slot';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { trTime, trHHMM } from '@/lib/tz';

/**
 * Available Slots API
 * Returns available time slots using SlotService
 *
 * GET /api/booking/available-slots?salon_id=xxx&staff_id=xxx&service_id=xxx&date=2026-01-26
 */

export async function GET(request: NextRequest) {
    try {
        // Sprint F (R10) — rate limit (IP başına 30/dakika)
        const ip = getClientIp(request);
        const rl = await rateLimit(`slots:${ip}`, 30, 60_000);
        if (!rl.success) {
            return NextResponse.json(
                { success: false, error: 'Çok fazla istek. Lütfen birkaç saniye sonra tekrar deneyin.' },
                { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.reset - Date.now()) / 1000)) } }
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const salonId = searchParams.get('salon_id');
        const staffId = searchParams.get('staff_id');
        const serviceId = searchParams.get('service_id');
        const serviceIds = searchParams.get('service_ids')?.split(',').filter(Boolean);
        const durationMin = searchParams.get('duration_min');
        const dateStr = searchParams.get('date');

        if (!salonId || (!serviceId && !serviceIds && !durationMin) || !dateStr) {
            return NextResponse.json({
                success: false,
                error: 'Eksik parametreler (salon_id, date ve hizmet bilgisi gerekli)'
            }, { status: 400 });
        }

        // `date` is a Türkiye calendar day; noon TR avoids any day-boundary ambiguity
        const selectedDate = /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? trTime(dateStr, '12:00') : new Date(NaN);

        // Validate date
        if (isNaN(selectedDate.getTime())) {
            return NextResponse.json({
                success: false,
                error: 'Geçersiz tarih formatı'
            }, { status: 400 });
        }

        // Use SlotService with admin client (server-side, bypasses RLS).
        // Booking flow needs to read appointments to compute conflicts; the
        // anon role does not have SELECT on appointments by design.
        const availableSlots = await SlotService.getAvailableSlots({
            salonId,
            serviceId: serviceId || undefined,
            serviceIds: serviceIds || undefined,
            durationMin: durationMin ? parseInt(durationMin) : undefined,
            date: selectedDate,
            staffId: (staffId && staffId !== 'any') ? staffId : undefined
        }, supabaseAdmin);

        // Return only unique slots by time (e.g. 09:00, 09:30)
        // Convert TimeSlot[] to string[] (HH:MM format) for backward compatibility
        const slots = availableSlots.map(slot => trHHMM(slot.startTime));

        // Remove duplicates (if same time from multiple staff)
        const uniqueSlots = Array.from(new Set(slots)).sort();

        return NextResponse.json({
            success: true,
            slots: uniqueSlots,
            count: uniqueSlots.length
        });

    } catch (err: unknown) {
        console.error('[available-slots] Error:', err);
        return NextResponse.json({
            success: false,
            error: toErrorLike(err).message || 'Sunucu hatası',
            slots: []
        }, { status: 500 });
    }
}
