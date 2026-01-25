import { NextRequest, NextResponse } from 'next/server';
import { SlotService } from '@/services/slot';

/**
 * Available Slots API
 * Returns available time slots using SlotService
 * 
 * GET /api/booking/available-slots?salon_id=xxx&staff_id=xxx&service_id=xxx&date=2026-01-26
 */

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const salonId = searchParams.get('salon_id');
        const staffId = searchParams.get('staff_id');
        const serviceId = searchParams.get('service_id');
        const dateStr = searchParams.get('date');

        if (!salonId || !serviceId || !dateStr) {
            return NextResponse.json({
                success: false,
                error: 'Eksik parametreler (salon_id, service_id, date gerekli)'
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

        // Use SlotService to get available slots
        const availableSlots = await SlotService.getAvailableSlots({
            salonId,
            serviceId,
            date: selectedDate,
            staffId: (staffId && staffId !== 'any') ? staffId : undefined
        });

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
