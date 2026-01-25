import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * Professional Slot Motor API
 * Calculates actual available time slots for a specific date, staff, and service.
 * 
 * GET /api/booking/available-slots?salon_id=xxx&staff_id=xxx&service_id=xxx&date=2025-12-26
 */

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const salonId = searchParams.get('salon_id');
        const staffId = searchParams.get('staff_id'); // Can be 'any'
        const serviceId = searchParams.get('service_id');
        const dateStr = searchParams.get('date'); // YYYY-MM-DD

        if (!salonId || !serviceId || !dateStr) {
            return NextResponse.json({ error: 'Eksik parametreler' }, { status: 400 });
        }

        const selectedDate = new Date(dateStr);
        const dayOfWeek = selectedDate.getDay(); // 0=Sunday, 6=Saturday

        // 1. Get Service Duration
        const { data: service, error: serviceError } = await supabaseAdmin
            .from('salon_services')
            .select('duration_min')
            .eq('id', serviceId)
            .single();

        if (serviceError || !service) {
            return NextResponse.json({ error: 'Hizmet bulunamadı' }, { status: 404 });
        }
        const duration = service.duration_min;

        // 2. Get Working Hours
        // Professional approach: Use Staff hours if specific staff selected, otherwise Salon hours
        let startTime = '09:00:00';
        let endTime = '19:00:00';
        let isClosed = false;

        if (staffId && staffId !== 'any') {
            const { data: staffHours } = await supabaseAdmin
                .from('working_hours')
                .select('*')
                .eq('staff_id', staffId)
                .eq('day_of_week', dayOfWeek)
                .single();

            if (staffHours) {
                startTime = staffHours.start_time;
                endTime = staffHours.end_time;
                isClosed = staffHours.is_day_off;
            } else {
                // Fallback to salon hours
                const { data: salonHours } = await supabaseAdmin
                    .from('salon_working_hours')
                    .select('*')
                    .eq('salon_id', salonId)
                    .eq('day_of_week', dayOfWeek)
                    .single();

                if (salonHours) {
                    startTime = salonHours.start_time;
                    endTime = salonHours.end_time;
                    isClosed = salonHours.is_closed;
                }
            }
        } else {
            const { data: salonHours } = await supabaseAdmin
                .from('salon_working_hours')
                .select('*')
                .eq('salon_id', salonId)
                .eq('day_of_week', dayOfWeek)
                .single();

            if (salonHours) {
                startTime = salonHours.start_time;
                endTime = salonHours.end_time;
                isClosed = salonHours.is_closed;
            }
        }

        if (isClosed) {
            return NextResponse.json({ success: true, slots: [] });
        }

        // 3. Get Appointments for the day
        let query = supabaseAdmin
            .from('appointments')
            .select('start_time, end_time, staff_id')
            .gte('start_time', `${dateStr}T00:00:00Z`)
            .lte('start_time', `${dateStr}T23:59:59Z`)
            .in('status', ['PENDING', 'CONFIRMED']);

        if (staffId && staffId !== 'any') {
            query = query.eq('staff_id', staffId);
        }

        const { data: appointments } = await query;

        // 4. Generate & Filter Slots
        const slots: string[] = [];
        const interval = 15; // 15-minute resolution

        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);

        let current = new Date(selectedDate);
        current.setHours(startH, startM, 0, 0);

        const dayEnd = new Date(selectedDate);
        dayEnd.setHours(endH, endM, 0, 0);

        const now = new Date();
        const bufferMinutes = 30; // Min 30 mins from now

        while (current.getTime() + duration * 60000 <= dayEnd.getTime()) {
            const slotStart = current.toISOString();
            const slotEnd = new Date(current.getTime() + duration * 60000).toISOString();

            const timeStr = current.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', hour12: false });

            // Constraint A: In the future
            const isPast = current.getTime() < now.getTime() + bufferMinutes * 60000;

            if (!isPast) {
                // Constraint B: No conflict
                // If 'any', we need to find at least ONE staff who is free
                // For simplicity in MVP, if 'any', we just check against all appointments if they fill ALL staff.
                // But let's stick to the specific staff for now.

                const isBusy = (appointments || []).some(apt => {
                    const aptStart = new Date(apt.start_time).getTime();
                    const aptEnd = new Date(apt.end_time).getTime();
                    const sStart = current.getTime();
                    const sEnd = sStart + duration * 60000;

                    return (sStart < aptEnd && sEnd > aptStart);
                });

                if (!isBusy) {
                    slots.push(timeStr);
                }
            }

            current = new Date(current.getTime() + interval * 60000);
        }

        return NextResponse.json({ success: true, slots });

    } catch (err: any) {
        console.error('Slot calculation error:', err);
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
