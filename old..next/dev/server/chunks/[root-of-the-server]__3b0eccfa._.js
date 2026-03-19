module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/supabase.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase,
    "supabaseUrl",
    ()=>supabaseUrl
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createBrowserClient.js [app-route] (ecmascript)");
;
const supabaseUrl = ("TURBOPACK compile-time value", "http://127.0.0.1:8000") || 'http://localhost:8000';
const supabaseAnonKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzY3MzcyMTU3LCJleHAiOjE5MjUwNTIxNTd9.Frv7rg6d7kXV1-sEDew5aIkGDk6xE1vE0UvM1Bo6tvU") || 'dummy_anon_key_for_build';
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createBrowserClient"])(supabaseUrl, supabaseAnonKey);
}),
"[project]/services/slot.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SlotService",
    ()=>SlotService
]);
/**
 * Slot Availability Engine
 * Calculates available time slots for booking based on:
 * - Staff working hours
 * - Existing appointments
 * - Service duration
 * - Staff skills/permissions
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-route] (ecmascript)");
;
const SlotService = {
    /**
     * Get available time slots for a service on a given date
     */ async getAvailableSlots (query) {
        const { salonId, serviceId, serviceIds, durationMin, date, staffId } = query;
        let serviceDuration = durationMin || 0;
        // 1. Calculate duration if not provided
        if (!serviceDuration) {
            if (serviceIds && serviceIds.length > 0) {
                const { data: services, error: servicesError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('salon_services').select('duration_min').in('id', serviceIds);
                if (!servicesError && services) {
                    serviceDuration = services.reduce((acc, s)=>acc + (s.duration_min || 0), 0);
                }
            } else if (serviceId) {
                const { data: service, error: serviceError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('salon_services').select('duration_min').eq('id', serviceId).single();
                if (!serviceError && service) {
                    serviceDuration = service.duration_min;
                }
            }
        }
        if (!serviceDuration) {
            throw new Error('Service duration could not be determined');
        }
        // 2. Get staff who can perform this service
        let staffQuery = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('staff').select('id, name').eq('salon_id', salonId).eq('is_active', true);
        if (staffId) {
            staffQuery = staffQuery.eq('id', staffId);
        }
        const { data: staffList, error: staffError } = await staffQuery;
        if (staffError || !staffList || staffList.length === 0) {
            return [];
        }
        // 3. For each staff member, calculate available slots
        const allSlots = [];
        for (const staff of staffList){
            const slots = await this.getStaffAvailableSlots(staff.id, staff.name, date, serviceDuration);
            allSlots.push(...slots);
        }
        return allSlots.sort((a, b)=>a.startTime.getTime() - b.startTime.getTime());
    },
    /**
     * Get available slots for a specific staff member
     */ async getStaffAvailableSlots (staffId, staffName, date, serviceDuration) {
        // 1. Get staff working hours for this day of week
        const dayOfWeek = date.getDay();
        const { data: workingHours, error: hoursError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('working_hours').select('*').eq('staff_id', staffId).eq('day_of_week', dayOfWeek).single();
        if (hoursError || !workingHours || workingHours.is_day_off) {
            return [];
        }
        // 2. Get existing appointments for this staff on this date
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        const { data: appointments, error: apptError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('appointments').select('start_time, end_time, status').eq('staff_id', staffId).gte('start_time', startOfDay.toISOString()).lte('start_time', endOfDay.toISOString()).neq('status', 'CANCELLED');
        if (apptError) {
            console.error('Error fetching appointments:', apptError);
            return [];
        }
        // 3. Generate potential slots
        const slots = this.generateTimeSlots(date, workingHours.start_time, workingHours.end_time, serviceDuration, staffId, staffName);
        // 4. Filter out slots that conflict with existing appointments
        const bookedSlots = (appointments || []).map((appt)=>({
                start: new Date(appt.start_time),
                end: new Date(appt.end_time)
            }));
        return slots.filter((slot)=>{
            const hasConflict = bookedSlots.some((booked)=>{
                return slot.startTime >= booked.start && slot.startTime < booked.end || slot.endTime > booked.start && slot.endTime <= booked.end || slot.startTime <= booked.start && slot.endTime >= booked.end;
            });
            return !hasConflict;
        });
    },
    /**
     * Generate all possible time slots for a day
     */ generateTimeSlots (date, startTimeStr, endTimeStr, serviceDuration, staffId, staffName) {
        const slots = [];
        // Parse start and end times
        const [startHour, startMin] = startTimeStr.split(':').map(Number);
        const [endHour, endMin] = endTimeStr.split(':').map(Number);
        const currentSlot = new Date(date);
        currentSlot.setHours(startHour, startMin, 0, 0);
        const endTime = new Date(date);
        endTime.setHours(endHour, endMin, 0, 0);
        const slotInterval = 30; // 30-minute intervals
        while(currentSlot.getTime() + serviceDuration * 60000 <= endTime.getTime()){
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
     */ async isSlotAvailable (staffId, startTime, endTime) {
        const { data: conflicts, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabase"].from('appointments').select('id').eq('staff_id', staffId).neq('status', 'CANCELLED').or(`start_time.gte.${startTime.toISOString()},start_time.lt.${endTime.toISOString()}`).limit(1);
        if (error) {
            console.error('Error checking slot availability:', error);
            return false;
        }
        return !conflicts || conflicts.length === 0;
    }
};
}),
"[project]/app/api/booking/available-slots/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$slot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/slot.ts [app-route] (ecmascript)");
;
;
async function GET(request) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const salonId = searchParams.get('salon_id');
        const staffId = searchParams.get('staff_id');
        const serviceId = searchParams.get('service_id');
        const serviceIds = searchParams.get('service_ids')?.split(',').filter(Boolean);
        const durationMin = searchParams.get('duration_min');
        const dateStr = searchParams.get('date');
        if (!salonId || !serviceId && !serviceIds && !durationMin || !dateStr) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Eksik parametreler (salon_id, date ve hizmet bilgisi gerekli)'
            }, {
                status: 400
            });
        }
        const selectedDate = new Date(dateStr);
        // Validate date
        if (isNaN(selectedDate.getTime())) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Geçersiz tarih formatı'
            }, {
                status: 400
            });
        }
        // Use SlotService to get available slots
        const availableSlots = await __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$slot$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SlotService"].getAvailableSlots({
            salonId,
            serviceId: serviceId || undefined,
            serviceIds: serviceIds || undefined,
            durationMin: durationMin ? parseInt(durationMin) : undefined,
            date: selectedDate,
            staffId: staffId && staffId !== 'any' ? staffId : undefined
        });
        console.log(`✅ Generated ${availableSlots.length} slots for ${dateStr} (Staff: ${staffId || 'any'})`);
        // Return only unique slots by time (e.g. 09:00, 09:30)
        // Convert TimeSlot[] to string[] (HH:MM format) for backward compatibility
        const slots = availableSlots.map((slot)=>{
            return slot.startTime.toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        });
        // Remove duplicates (if same time from multiple staff)
        const uniqueSlots = Array.from(new Set(slots)).sort();
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            slots: uniqueSlots,
            count: uniqueSlots.length
        });
    } catch (err) {
        console.error('[available-slots] Error:', err);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: err.message || 'Sunucu hatası',
            slots: []
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__3b0eccfa._.js.map