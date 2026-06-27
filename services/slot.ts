/**
 * Slot Availability Engine
 * Calculates available time slots for booking based on:
 * - Staff working hours
 * - Existing appointments
 * - Service duration
 * - Staff skills/permissions
 */

import { supabase as defaultSupabase } from '@/lib/supabase';
import { type SupabaseClient } from '@supabase/supabase-js';

export interface TimeSlot {
    startTime: Date;
    endTime: Date;
    staffId: string;
    staffName: string;
    available: boolean;
}

export interface SlotQuery {
    salonId: string;
    serviceId?: string;
    serviceIds?: string[];
    durationMin?: number;
    date: Date;
    staffId?: string;
}

export const SlotService = {
    /**
     * Get available time slots for a service on a given date
     */
    async getAvailableSlots(query: SlotQuery, supabase: SupabaseClient = defaultSupabase): Promise<TimeSlot[]> {
        const { salonId, serviceId, serviceIds, durationMin, date, staffId } = query;

        let serviceDuration = durationMin || 0;

        // 1. Calculate duration if not provided
        if (!serviceDuration) {
            if (serviceIds && serviceIds.length > 0) {
                const { data: services, error: servicesError } = await supabase
                    .from('salon_services')
                    .select('duration_min')
                    .in('id', serviceIds);

                if (!servicesError && services) {
                    serviceDuration = services.reduce((acc, s) => acc + (s.duration_min || 0), 0);
                }
            } else if (serviceId) {
                const { data: service, error: serviceError } = await supabase
                    .from('salon_services')
                    .select('duration_min')
                    .eq('id', serviceId)
                    .single();

                if (!serviceError && service) {
                    serviceDuration = service.duration_min;
                }
            }
        }

        if (!serviceDuration) {
            throw new Error('Service duration could not be determined');
        }

        // 2. Get staff who can perform this service
<<<<<<< HEAD
        // Filter by staff_services if specific service(s) requested
        const requestedServiceIds = serviceIds && serviceIds.length > 0
            ? serviceIds
            : (serviceId ? [serviceId] : null);

        let capableStaffIds: string[] | null = null;
        if (requestedServiceIds) {
            const { data: capable } = await supabase
                .from('staff_services')
                .select('staff_id')
                .in('salon_service_id', requestedServiceIds);
            capableStaffIds = Array.from(new Set((capable || []).map(r => r.staff_id)));
            if (capableStaffIds.length === 0) {
                return [];
            }
        }

=======
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
        let staffQuery = supabase
            .from('staff')
            .select('id, name')
            .eq('salon_id', salonId)
            .eq('is_active', true);

        if (staffId) {
            staffQuery = staffQuery.eq('id', staffId);
        }
<<<<<<< HEAD
        if (capableStaffIds) {
            staffQuery = staffQuery.in('id', capableStaffIds);
        }
=======
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8

        const { data: staffList, error: staffError } = await staffQuery;

        if (staffError || !staffList || staffList.length === 0) {
            return [];
        }

        // 3. For each staff member, calculate available slots
        const allSlots: TimeSlot[] = [];

        for (const staff of staffList) {
            const slots = await this.getStaffAvailableSlots(
                staff.id,
                staff.name,
                date,
                serviceDuration,
                salonId,
                supabase
            );
            allSlots.push(...slots);
        }

        return allSlots.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    },

    /**
     * Get available slots for a specific staff member
     */
    async getStaffAvailableSlots(
        staffId: string,
        staffName: string,
        date: Date,
        serviceDuration: number,
        salonId?: string,
        supabase: SupabaseClient = defaultSupabase
    ): Promise<TimeSlot[]> {
        // 1. Get staff working hours for this day of week
        const dayOfWeek = date.getDay();

        const { data: staffHours, error: staffHoursError } = await supabase
            .from('working_hours')
            .select('*')
            .eq('staff_id', staffId)
            .eq('day_of_week', dayOfWeek)
            .maybeSingle(); // Use maybeSingle to avoid 406/error if not found

        let workingHours: { start_time: string; end_time: string; is_day_off?: boolean; is_closed?: boolean } | null = null;

        if (staffHours && !staffHours.is_day_off) {
            // Staff has individual working hours
            workingHours = staffHours;
        } else if (salonId) {
            // Fallback: Try salon-level working hours if staff hours missing OR staff is on day off but we want to know if salon is open
            const { data: salonHours, error: salonHoursError } = await supabase
                .from('salon_working_hours')
                .select('*')
                .eq('salon_id', salonId)
                .eq('day_of_week', dayOfWeek)
                .maybeSingle();

            if (salonHours && !salonHours.is_closed) {
                workingHours = salonHours;
                console.log(`📋 Using salon-level working hours for staff ${staffName} on day ${dayOfWeek}`);
            }
        }

        if (!workingHours) {
            return [];
        }

        // 2. Get existing appointments for this staff on this date
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const { data: appointments, error: apptError } = await supabase
            .from('appointments')
            .select('start_time, end_time, status')
            .eq('staff_id', staffId)
            .gte('start_time', startOfDay.toISOString())
            .lte('start_time', endOfDay.toISOString())
            .neq('status', 'CANCELLED');

        if (apptError) {
            console.error('Error fetching appointments:', apptError);
            return [];
        }

<<<<<<< HEAD
        // Sprint D (R4) — slot lock'larını da hesaba kat (5 dk TTL, başkası tutmuş)
        const { data: locks } = await supabase
            .from('slot_reservations')
            .select('slot_start, slot_end')
            .eq('salon_id', salonId)
            .eq('staff_id', staffId)
            .gt('expires_at', new Date().toISOString())
            .gte('slot_start', startOfDay.toISOString())
            .lte('slot_start', endOfDay.toISOString());

=======
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
        // 3. Generate potential slots
        const slots = this.generateTimeSlots(
            date,
            workingHours.start_time,
            workingHours.end_time,
            serviceDuration,
            staffId,
            staffName
        );

<<<<<<< HEAD
        // 4. Filter out slots that conflict with existing appointments OR active slot locks
        const bookedSlots = [
            ...(appointments || []).map(appt => ({
                start: new Date(appt.start_time),
                end: new Date(appt.end_time)
            })),
            ...((locks || []) as any[]).map(l => ({
                start: new Date(l.slot_start),
                end: new Date(l.slot_end)
            })),
        ];

        // 5. Filter out past slots if the requested date is today.
        //    "Now + 15 dk buffer" altındaki slotlar booking yapılamaz hale gelir.
        const now = new Date();
        const isToday =
            date.getFullYear() === now.getFullYear() &&
            date.getMonth() === now.getMonth() &&
            date.getDate() === now.getDate();
        const minStart = isToday ? new Date(now.getTime() + 15 * 60 * 1000) : null;

        return slots.filter(slot => {
            if (minStart && slot.startTime < minStart) return false;
=======
        // 4. Filter out slots that conflict with existing appointments
        const bookedSlots = (appointments || []).map(appt => ({
            start: new Date(appt.start_time),
            end: new Date(appt.end_time)
        }));

        return slots.filter(slot => {
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
            const hasConflict = bookedSlots.some(booked => {
                return (
                    (slot.startTime >= booked.start && slot.startTime < booked.end) ||
                    (slot.endTime > booked.start && slot.endTime <= booked.end) ||
                    (slot.startTime <= booked.start && slot.endTime >= booked.end)
                );
            });
            return !hasConflict;
        });
    },

    /**
     * Generate all possible time slots for a day
     */
    generateTimeSlots(
        date: Date,
        startTimeStr: string,
        endTimeStr: string,
        serviceDuration: number,
        staffId: string,
        staffName: string
    ): TimeSlot[] {
        const slots: TimeSlot[] = [];

        // Parse start and end times
        const [startHour, startMin] = startTimeStr.split(':').map(Number);
        const [endHour, endMin] = endTimeStr.split(':').map(Number);

        const currentSlot = new Date(date);
        currentSlot.setHours(startHour, startMin, 0, 0);

        const endTime = new Date(date);
        endTime.setHours(endHour, endMin, 0, 0);

        const slotInterval = 30; // 30-minute intervals

        while (currentSlot.getTime() + serviceDuration * 60000 <= endTime.getTime()) {
            const slotEnd = new Date(currentSlot.getTime() + serviceDuration * 60000);

            slots.push({
                startTime: new Date(currentSlot),
                endTime: slotEnd,
                staffId,
                staffName,
                available: true
            });

            currentSlot.setMinutes(currentSlot.getMinutes() + slotInterval);
        }

        return slots;
    },

    /**
     * Check if a specific time slot is available
     */
    async isSlotAvailable(
        staffId: string,
        startTime: Date,
        endTime: Date,
        supabase: SupabaseClient = defaultSupabase
    ): Promise<boolean> {
        const { data: conflicts, error } = await supabase
            .from('appointments')
            .select('id')
            .eq('staff_id', staffId)
            .neq('status', 'CANCELLED')
            .or(`start_time.gte.${startTime.toISOString()},start_time.lt.${endTime.toISOString()}`)
            .limit(1);

        if (error) {
            console.error('Error checking slot availability:', error);
            return false;
        }

        return !conflicts || conflicts.length === 0;
    }
};
