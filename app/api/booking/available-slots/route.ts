import { NextRequest, NextResponse } from 'next/server';
import { SlotService } from '@/services/slot';
<<<<<<< HEAD
import { supabaseAdmin } from '@/lib/supabase-admin';
import { rateLimit } from '@/lib/rate-limit';
=======
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8

/**
 * Available Slots API
 * Returns available time slots using SlotService
<<<<<<< HEAD
 *
=======
 * 
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
 * GET /api/booking/available-slots?salon_id=xxx&staff_id=xxx&service_id=xxx&date=2026-01-26
 */

export async function GET(request: NextRequest) {
    try {
<<<<<<< HEAD
        // Sprint F (R10) — rate limit (IP başına 30/dakika)
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || request.headers.get('x-real-ip')
            || 'unknown';
        const rl = await rateLimit(`slots:${ip}`, 30, 60_000);
        if (!rl.success) {
            return NextResponse.json(
                { success: false, error: 'Çok fazla istek. Lütfen birkaç saniye sonra tekrar deneyin.' },
                { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.reset - Date.now()) / 1000)) } }
            );
        }

=======
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
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

        const selectedDate = new Date(dateStr);

        // Validate date
        if (isNaN(selectedDate.getTime())) {
            return NextResponse.json({
                success: false,
                error: 'Geçersiz tarih formatı'
            }, { status: 400 });
        }

<<<<<<< HEAD
        // Use SlotService with admin client (server-side, bypasses RLS).
        // Booking flow needs to read appointments to compute conflicts; the
        // anon role does not have SELECT on appointments by design.
=======
        // Use SlotService to get available slots
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
        const availableSlots = await SlotService.getAvailableSlots({
            salonId,
            serviceId: serviceId || undefined,
            serviceIds: serviceIds || undefined,
            durationMin: durationMin ? parseInt(durationMin) : undefined,
            date: selectedDate,
            staffId: (staffId && staffId !== 'any') ? staffId : undefined
<<<<<<< HEAD
        }, supabaseAdmin);
=======
        });
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8

        console.log(`✅ Generated ${availableSlots.length} slots for ${dateStr} (Staff: ${staffId || 'any'})`);

        // Return only unique slots by time (e.g. 09:00, 09:30)
        // Convert TimeSlot[] to string[] (HH:MM format) for backward compatibility
        const slots = availableSlots.map(slot => {
            return slot.startTime.toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        });

        // Remove duplicates (if same time from multiple staff)
        const uniqueSlots = Array.from(new Set(slots)).sort();

        return NextResponse.json({
            success: true,
            slots: uniqueSlots,
            count: uniqueSlots.length
        });

    } catch (err: any) {
        console.error('[available-slots] Error:', err);
        return NextResponse.json({
            success: false,
            error: err.message || 'Sunucu hatası',
            slots: []
        }, { status: 500 });
    }
}
