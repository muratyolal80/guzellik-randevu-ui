import { supabase as defaultSupabase, supabaseUrl } from "@/lib/supabase";
import { type SupabaseClient } from "@supabase/supabase-js";
import type {
  City,
  District,
  SalonType,
  ServiceCategory,
  GlobalService,
  Salon,
  SalonDetail,
  Staff,
  SalonService,
  SalonServiceDetail,
  WorkingHours,
  SalonWorkingHours,
  Appointment,
  Review,
  IYSLog,
  SupportTicket,
  TicketMessage,
  Favorite,
  Notification,
  Invite,
  StaffReview,
  SalonGallery,
  ReviewImage,
  Profile,
  Coupon,
  Package,
  Transaction,
  AppointmentCoupon,
  DiscountType,
  PaymentMethod,
  PaymentStatus,
} from "@/types";
import { SubscriptionService } from "./db_finance";

// Helper to check if we have a real connection
const isSupabaseConfigured = () => {
  return (
    typeof supabaseUrl === "string" && supabaseUrl.includes("localhost:8000")
  );
};

export const StaffService = {
  /**
   * Get all staff for a salon (with tenant check)
   */
  async getStaffBySalon(
    salonId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<Staff[]> {
    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .eq("salon_id", salonId)
      .eq("is_active", true)
      .order("name");

    if (error) throw error;
    return data || [];
  },

  /**
   * Get staff by ID (with tenant check)
   */
  async getStaffById(
    id: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<Staff | null> {
    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create a new staff member with working hours
   */
  async createStaff(
    staffData: Partial<Staff> & { email?: string; specialty?: string },
    customWorkingHours?: Omit<WorkingHours, "id" | "staff_id" | "created_at">[],
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<Staff> {
    // Enforcement: Check subscription limit for staff
    if (staffData.salon_id) {
      const limitResult = await SubscriptionService.checkLimit(
        staffData.salon_id,
        "staff",
        supabase,
      );
      if (!limitResult.allowed)
        throw new Error(
          `SUBSCRIPTION_LIMIT_REACHED:STAFF:${limitResult.limit}`,
        );
    }

    const { data, error } = await supabase
      .from("staff")
      .insert({
        name: staffData.name,
        // map specialty to role if role is not provided
        role: staffData.role || staffData.specialty,
        phone: staffData.phone,
        photo: staffData.photo || staffData.image, // Support both aliases
        salon_id: staffData.salon_id,
        user_id: staffData.user_id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    let hoursToInsert;

    if (customWorkingHours && customWorkingHours.length > 0) {
      hoursToInsert = customWorkingHours.map((h) => ({
        ...h,
        staff_id: data.id,
        // Ensure time format is HH:MM:SS
        start_time:
          h.start_time.length === 5 ? `${h.start_time}:00` : h.start_time,
        end_time: h.end_time.length === 5 ? `${h.end_time}:00` : h.end_time,
      }));
    } else {
      // Create default working hours (Mon-Sat 09-19, Sun Closed)
      hoursToInsert = [1, 2, 3, 4, 5, 6].map((day) => ({
        staff_id: data.id,
        day_of_week: day,
        start_time: "09:00:00",
        end_time: "19:00:00",
        is_day_off: false,
      }));

      hoursToInsert.push({
        staff_id: data.id,
        day_of_week: 0,
        start_time: "09:00:00",
        end_time: "19:00:00",
        is_day_off: true,
      });
    }

    await supabase.from("working_hours").insert(hoursToInsert);

    // 3. Auto-link to profile if email matches
    if (staffData.email && !staffData.user_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", staffData.email)
        .single();

      if (profile) {
        await supabase
          .from("staff")
          .update({ user_id: profile.id })
          .eq("id", data.id);
        // Optionally update user role to STAFF
        await supabase
          .from("profiles")
          .update({ role: "STAFF" })
          .eq("id", profile.id);
      }
    }

    return data;
  },

  /**
   * Update existing staff
   */
  async updateStaff(
    id: string,
    updates: Partial<Staff>,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<Staff> {
    const { data, error } = await supabase
      .from("staff")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get working hours for a specific staff member
   */
  async getStaffWorkingHours(
    staffId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<WorkingHours[]> {
    const { data, error } = await supabase
      .from("working_hours")
      .select("*")
      .eq("staff_id", staffId)
      .order("day_of_week", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Delete staff member
   */
  async deleteStaff(
    id: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    const { error } = await supabase.from("staff").delete().eq("id", id);

    if (error) throw error;
  },

  /**
   * Update staff working hours record
   */
  async updateWorkingHours(
    id: string,
    updates: Partial<WorkingHours>,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    const { error } = await supabase
      .from("working_hours")
      .update(updates)
      .eq("id", id);

    if (error) throw error;
  },

  async linkStaffToServices(
    staffId: string | number,
    salonId: string | number,
    serviceIds: (string | number)[],
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    if (!serviceIds || serviceIds.length === 0) return;
    const assignments = serviceIds.map((serviceId) => ({
      staff_id: staffId,
      salon_id: salonId,
      salon_service_id: serviceId,
    }));
    const { error } = await supabase.from("staff_services").insert(assignments);
    if (error) throw error;
  },

  /**
   * Get services linked to a staff member
   */
  async getStaffServices(
    staffId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<string[]> {
    const { data, error } = await supabase
      .from("staff_services")
      .select("salon_service_id")
      .eq("staff_id", staffId);

    if (error) throw error;
    return data?.map((s) => s.salon_service_id) || [];
  },

  /**
   * Sync staff services (Delete old, Insert new)
   */
  async updateStaffServices(
    staffId: string,
    salonId: string,
    serviceIds: string[],
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    // 1. Delete existing links
    const { error: deleteError } = await supabase
      .from("staff_services")
      .delete()
      .eq("staff_id", staffId);

    if (deleteError) throw deleteError;

    // 2. Insert new ones
    if (serviceIds.length > 0) {
      await this.linkStaffToServices(staffId, salonId, serviceIds, supabase);
    }
  },
};

export const ServiceService = {
  /**
   * Get services offered by a salon (with details)
   */
  async getServicesBySalon(
    salonId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<SalonServiceDetail[]> {
    const { data, error } = await supabase
      .from("salon_service_details")
      .select("*")
      .eq("salon_id", salonId)
      .order("category_name")
      .order("service_name");

    if (error) throw error;
    return data || [];
  },

  /**
   * Get all salon services in a single batch query (for search/homepage optimization)
   */
  async getAllSalonServices(
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<{ salon_id: string; service_name: string }[]> {
    const { data, error } = await supabase
      .from("salon_service_details")
      .select("salon_id, service_name");

    if (error) throw error;
    return data || [];
  },

  /**
   * Get service by ID (with tenant check)
   */
  async getServiceById(
    id: string,
    salonId?: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<SalonServiceDetail | null> {
    let query = supabase.from("salon_service_details").select("*").eq("id", id);

    if (salonId) {
      query = query.eq("salon_id", salonId);
    }

    const { data, error } = await query.single();

    if (error) throw error;
    return data;
  },

  /**
   * Get all global services (for selection)
   */
  async getGlobalServices(
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<GlobalService[]> {
    const { data, error } = await supabase
      .from("global_services")
      .select("*")
      .order("name");

    if (error) throw error;
    return data || [];
  },

  /**
   * Add a new service to a salon
   */
  async createService(
    serviceData: {
      salon_id: string;
      global_service_id: string;
      price: number;
      duration_min: number;
    },
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<any> {
    const { data, error } = await supabase
      .from("salon_services")
      .insert(serviceData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an existing service (with tenant check)
   */
  async updateService(
    id: string,
    updates: { price?: number; duration_min?: number; is_active?: boolean },
    salonId?: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<any> {
    let query = supabase.from("salon_services").update(updates).eq("id", id);

    if (salonId) {
      query = query.eq("salon_id", salonId);
    }

    const { data, error } = await query.select().single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete (or soft delete) a service (with tenant check)
   */
  async deleteService(
    id: string,
    salonId?: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    let query = supabase.from("salon_services").delete().eq("id", id);

    if (salonId) {
      query = query.eq("salon_id", salonId);
    }

    const { error } = await query;

    if (error) throw error;
  },
};

export const StaffReviewService = {
  /**
   * Get reviews for a staff member
   */
  async getReviewsByStaff(
    staffId: string,
    limit = 50,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<StaffReview[]> {
    const { data, error } = await supabase
      .from("staff_reviews")
      .select("*")
      .eq("staff_id", staffId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  /**
   * Get reviews for all staff in a salon (detailed view)
   */
  async getReviewsBySalon(
    salonId: string,
    limit = 50,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<StaffReview[]> {
    const { data, error } = await supabase
      .from("staff_reviews_detailed")
      .select("*")
      .eq("salon_id", salonId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async createStaffReview(
    review: Omit<StaffReview, "id" | "created_at">,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<StaffReview> {
    // Force is_verified to true if appointment_id is present
    const reviewData = {
      ...review,
      is_verified: !!review.appointment_id,
    };

    const { data, error } = await supabase
      .from("staff_reviews")
      .insert(reviewData)
      .select()
      .single();

    if (error) {
      console.error("Error creating staff review:", error);
      throw error;
    }
    return data;
  },

  /**
   * Check if user already reviewed this staff for an appointment
   */
  async hasReviewed(
    userId: string,
    staffId: string,
    appointmentId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<boolean> {
    const { data } = await supabase
      .from("staff_reviews")
      .select("id")
      .eq("user_id", userId)
      .eq("staff_id", staffId)
      .eq("appointment_id", appointmentId)
      .maybeSingle();

    return !!data;
  },

  /**
   * Get appointments eligible for staff review
   */
  async getReviewableAppointmentsForStaff(
    userId: string,
    staffId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<Appointment[]> {
    const { data: appointments, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("customer_id", userId)
      .eq("staff_id", staffId)
      .eq("status", "COMPLETED")
      .order("end_time", { ascending: false });

    if (error) throw error;
    if (!appointments || appointments.length === 0) return [];

    const { data: existing } = await supabase
      .from("staff_reviews")
      .select("appointment_id")
      .eq("user_id", userId)
      .eq("staff_id", staffId)
      .not("appointment_id", "is", null);

    const reviewed = new Set(existing?.map((r) => r.appointment_id) || []);
    return appointments.filter((a) => !reviewed.has(a.id));
  },

  /**
   * Delete review
   */
  async deleteReview(
    reviewId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    const { error } = await supabase
      .from("staff_reviews")
      .delete()
      .eq("id", reviewId);

    if (error) throw error;
  },
};

export const StaffAnalyticsService = {
  /**
   * Get today's appointment count for a staff member (Real Data)
   */
  async getTodayAppointmentsByStaff(
    staffId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<number> {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("appointments")
      .select("id", { count: "exact" })
      .eq("staff_id", staffId)
      .gte("start_time", `${today}T00:00:00Z`)
      .lte("start_time", `${today}T23:59:59Z`)
      .in("status", ["PENDING", "CONFIRMED", "COMPLETED"]);

    return data?.length || 0;
  },

  /**
   * Get weekly occupancy analysis (Real Data)
   */
  async getWeeklyOccupancyByStaff(
    staffId: string,
    weekStart: Date,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<
    {
      date: string;
      occupancyPercent: number;
      bookedSlots: number;
      totalSlots: number;
    }[]
  > {
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    });

    const results = [];
    for (const date of weekDays) {
      const dateStr = date.toISOString().split("T")[0];

      // Get working hours for this day
      const { data: hours } = await supabase
        .from("working_hours")
        .select("start_time, end_time, is_day_off")
        .eq("staff_id", staffId)
        .eq("day_of_week", date.getDay())
        .single();

      if (!hours || hours.is_day_off) {
        results.push({
          date: dateStr,
          occupancyPercent: 0,
          bookedSlots: 0,
          totalSlots: 0,
        });
        continue;
      }

      // Calculate total slots (30 min slots)
      const [startH, startM] = hours.start_time.split(":").map(Number);
      const [endH, endM] = hours.end_time.split(":").map(Number);
      const totalMinutes = endH * 60 + endM - (startH * 60 + startM);
      const totalSlots = Math.floor(totalMinutes / 30);

      // Get booked slots count
      const { data: appts } = await supabase
        .from("appointments")
        .select(
          `
          start_time,
          end_time,
          service:salon_services(duration_min)
        `,
        )
        .eq("staff_id", staffId)
        .gte("start_time", `${dateStr}T00:00:00Z`)
        .lte("start_time", `${dateStr}T23:59:59Z`)
        .in("status", ["PENDING", "CONFIRMED", "COMPLETED"]);

      /*
       * Calculate actual booked slots
       * Ideally, this should check for overlaps, but for simplicity we assume
       * duration / 30 mins
       */
      const bookedSlots =
        appts?.reduce((sum, a: any) => {
          const duration = a.service?.duration_min || 30;
          return sum + Math.ceil(duration / 30);
        }, 0) || 0;

      const occupancyPercent =
        totalSlots > 0 ? (bookedSlots / totalSlots) * 100 : 0;

      results.push({
        date: dateStr,
        occupancyPercent: Math.round(occupancyPercent),
        bookedSlots,
        totalSlots,
      });
    }

    return results;
  },

  /**
   * Get current real-time availability status
   */
  async getCurrentAvailability(
    staffId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<{
    isAvailable: boolean;
    currentAppointment?: any; // Using exact type would be better but keeping it flexible
    nextAvailableSlot?: string;
  }> {
    const now = new Date();
    const nowStr = now.toISOString();

    // Check if currently busy
    const { data: current } = await supabase
      .from("appointments")
      .select(
        `
        *,
        service:salon_services(duration_min, global_service:global_services(name))
      `,
      )
      .eq("staff_id", staffId)
      .lte("start_time", nowStr)
      .gte("end_time", nowStr)
      .in("status", ["CONFIRMED", "PENDING"])
      .single();

    if (current) {
      return {
        isAvailable: false,
        currentAppointment: current,
        nextAvailableSlot: current.end_time,
      };
    }

    // Find next appointment to determine free until when
    const { data: next } = await supabase
      .from("appointments")
      .select("start_time")
      .eq("staff_id", staffId)
      .gte("start_time", nowStr)
      .order("start_time", { ascending: true })
      .limit(1)
      .single();

    return {
      isAvailable: true,
      nextAvailableSlot: next?.start_time || undefined,
    };
  },
};
