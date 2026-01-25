/**
 * Slot Availability Engine
 * Calculates available time slots for booking based on:
 * - Staff working hours
 * - Existing appointments
 * - Service duration
 * - Staff skills/permissions
 */

import { supabase } from '@/lib/supabase';

export interface TimeSlot {
    startTime: Date;
    endTime: Date;
    staffId: string;
    staffName: string;
    available: boolean;
}

export interface SlotQuery {
    salonId: string;
    serviceId: string;
    date: Date;
    staffId?: string;
}

export const SlotService = {
    /**
     * Get available time slots for a service on a given date
     */
    async getAvailableSlots(query: SlotQuery): Promise<TimeSlot[]> {
        const { salonId, serviceId, date, staffId } = query;

        // 1. Get service details (duration is critical)
        const { data: service, error: serviceError } = await supabase
            .from('salon_services')
            .select('duration_min, global_service_id')
            .eq('id', serviceId)
            .single();

        if (serviceError || !service) {
            throw new Error('Service not found');
        }

        const serviceDuration = service.duration_min;

        // 2. Get staff who can perform this service
        let staffQuery = supabase
            .from('staff')
            .select('id, name')
            .eq('salon_id', salonId)
            .eq('is_active', true);

        if (staffId) {
            staffQuery = staffQuery.eq('id', staffId);
        }

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
                serviceDuration
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
        serviceDuration: number
    ): Promise<TimeSlot[]> {
        // 1. Get staff working hours for this day of week
        const dayOfWeek = date.getDay();

        const { data: workingHours, error: hoursError } = await supabase
            .from('working_hours')
            .select('*')
            .eq('staff_id', staffId)
            .eq('day_of_week', dayOfWeek)
            .single();

        if (hoursError || !workingHours || workingHours.is_day_off) {
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

        // 3. Generate potential slots
        const slots = this.generateTimeSlots(
            date,
            workingHours.start_time,
            workingHours.end_time,
            serviceDuration,
            staffId,
            staffName
        );

        // 4. Filter out slots that conflict with existing appointments
        const bookedSlots = (appointments || []).map(appt => ({
            start: new Date(appt.start_time),
            end: new Date(appt.end_time)
        }));

        return slots.filter(slot => {
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
        endTime: Date
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
