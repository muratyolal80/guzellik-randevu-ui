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
    typeof supabaseUrl === "string" && (supabaseUrl.includes("localhost:8000") || supabaseUrl.includes("127.0.0.1:8000"))
  );
};

export const SalonDataService = {
  /**
   * Helper: Normalize salon data to prevent [object Object] errors
   */
  mapSalonDetail(salon: any): SalonDetail {
    if (!salon) return salon;
    return {
      ...salon,
      name: String(salon.name || ""),
      description:
        typeof salon.description === "object"
          ? JSON.stringify(salon.description)
          : salon.description || "",
      city_name:
        typeof salon.city_name === "object"
          ? (salon.city_name as any)?.name
          : String(salon.city_name || "Belirtilmemiş"),
      district_name:
        typeof salon.district_name === "object"
          ? (salon.district_name as any)?.name
          : String(salon.district_name || ""),
      neighborhood:
        typeof salon.neighborhood === "object"
          ? String((salon.neighborhood as any)?.name || "")
          : String(salon.neighborhood || ""),
      avenue:
        typeof salon.avenue === "object"
          ? String((salon.avenue as any)?.name || "")
          : String(salon.avenue || ""),
      street:
        typeof salon.street === "object"
          ? String((salon.street as any)?.name || "")
          : String(salon.street || ""),
      building_no:
        typeof salon.building_no === "object"
          ? String((salon.building_no as any)?.name || "")
          : String(salon.building_no || ""),
      apartment_no:
        typeof salon.apartment_no === "object"
          ? String((salon.apartment_no as any)?.name || "")
          : String(salon.apartment_no || ""),
      address:
        typeof salon.address === "object"
          ? JSON.stringify(salon.address)
          : salon.address || "",
      geo_latitude: Number(salon.geo_latitude || 0),
      geo_longitude: Number(salon.geo_longitude || 0),
      average_rating: Number(salon.average_rating || 0),
      rating: Number(salon.rating || salon.average_rating || 0),
      deposit_rate: Number(salon.deposit_rate || 0),
      features: Array.isArray(salon.features)
        ? salon.features.map((f: any) =>
          typeof f === "string" ? f : f.name || JSON.stringify(f),
        )
        : [],
      tags: Array.isArray(salon.assigned_types)
        ? salon.assigned_types.map((t: any) =>
          typeof t === "string" ? t : t.name || String(t),
        )
        : salon.type_name
          ? [String(salon.type_name)]
          : [],
      coordinates: {
        lat: Number(salon.geo_latitude || 0),
        lng: Number(salon.geo_longitude || 0),
      },
      working_hours: Array.isArray(salon.working_hours)
        ? salon.working_hours.map((wh: any) => ({
          day_of_week: Number(wh.day_of_week),
          start_time: String(wh.start_time || "09:00:00"),
          end_time: String(wh.end_time || "20:00:00"),
          is_closed: Boolean(wh.is_closed),
        }))
        : [],
    };
  },

  /**
   * Get all salons with detailed information (using view)
   */
  async getSalons(supabase: SupabaseClient = defaultSupabase): Promise<SalonDetail[]> {
    const { data, error } = await supabase
      .from("salon_details")
      .select("*")
      .eq("status", "APPROVED") // Only show approved salons
      .order("is_sponsored", { ascending: false })
      .order("average_rating", { ascending: false });

    if (error) throw error;
    return (data || []).map((s) => this.mapSalonDetail(s));
  },

  /**
   * Get salons by user membership (Owner/Staff branches)
   */
  async getSalonsByMembership(
    userId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<SalonDetail[]> {
    // First, get the salon IDs from memberships
    if (!userId || userId === "") return [];

    const { data: memberships, error: memError } = await supabase
      .from("salon_memberships")
      .select("salon_id")
      .eq("user_id", userId)
      .eq("is_active", true);

    if (memError) throw memError;
    if (!memberships || memberships.length === 0) return [];

    // Then fetch the salon details
    const salonIds = memberships.map((m) => m.salon_id);
    const { data: salons, error: salonError } = await supabase
      .from("salon_details")
      .select("*")
      .in("id", salonIds);

    if (salonError) throw salonError;
    return (salons || []).map((s) => this.mapSalonDetail(s));
  },

  /**
   * Get salon by ID with details
   */
  async getSalonById(
    id: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<SalonDetail | null> {
    if (!id || id === "") return null;
    const { data, error } = await supabase
      .from("salon_details")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data ? this.mapSalonDetail(data) : null;
  },

  /**
   * Get salon by slug (for subdomain routing)
   */
  async getSalonBySlug(
    slug: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<SalonDetail | null> {
    const { data, error } = await supabase
      .from("salon_details")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) throw error;
    return data ? this.mapSalonDetail(data) : null;
  },

  /**
   * Search salons by filters
   */
  async searchSalons(
    filters: {
      cityId?: string;
      districtId?: string;
      typeId?: string;
      query?: string;
    },
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<SalonDetail[]> {
    let query = supabase.from("salon_details").select("*");

    if (filters.cityId && filters.cityId !== "") {
      const { data: cityData } = await supabase
        .from("cities")
        .select("name")
        .eq("id", filters.cityId)
        .single();

      if (cityData) {
        query = query.eq("city_name", cityData.name);
      }
    }

    // Always filter by approved status
    query = query.eq("status", "APPROVED");

    if (filters.districtId) {
      const { data: districtData } = await supabase
        .from("districts")
        .select("name")
        .eq("id", filters.districtId)
        .single();

      if (districtData) {
        query = query.eq("district_name", districtData.name);
      }
    }

    if (filters.typeId) {
      // Use salon_assigned_types to filtering multi-type assignment
      const { data: assigned } = await supabase
        .from("salon_assigned_types")
        .select("salon_id")
        .eq("type_id", filters.typeId);

      if (assigned && assigned.length > 0) {
        const ids = assigned.map((a) => a.salon_id);
        query = query.in("id", ids);
      } else {
        // No salons found for this type, return empty immediately to save query
        // Or create impossible condition
        // But better to just return empty if we want to be efficient
        return [];
      }
    }

    if (filters.query) {
      query = query.ilike("name", `%${filters.query}%`);
    }

    query = query
      .order("is_sponsored", { ascending: false })
      .order("average_rating", { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((s) => this.mapSalonDetail(s));
  },

  /**
   * Get salons by location (nearby)
   */
  async getSalonsByLocation(
    lat: number,
    lng: number,
    radiusKm: number = 10,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<SalonDetail[]> {
    // Simple bounding box search (for more accurate, use PostGIS)
    const latDelta = radiusKm / 111; // ~111km per degree latitude
    const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

    const { data, error } = await supabase
      .from("salon_details")
      .select("*")
      .gte("geo_latitude", lat - latDelta)
      .lte("geo_latitude", lat + latDelta)
      .gte("geo_longitude", lng - lngDelta)
      .lte("geo_longitude", lng + lngDelta)
      .eq("status", "APPROVED")
      .order("is_sponsored", { ascending: false });

    if (error) throw error;
    return (data || []).map((s) => this.mapSalonDetail(s));
  },

  /**
   * Create a new salon
   */
  /**
   * Create a new salon
   */
  async createSalon(
    salon: Omit<Salon, "id" | "created_at" | "updated_at">,
    customHours?: {
      day_of_week: number;
      start_time: string;
      end_time: string;
      is_closed: boolean;
    }[],
    initialServices?: {
      global_service_id: string;
      price: number;
      duration_min: number;
    }[],
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<Salon> {
    // Enforcement: Check branch limit for the owner
    // If owner already has a salon, check its plan's branch limit
    const { data: existingSalons } = await supabase
      .from("salons")
      .select("id, status")
      .eq("owner_id", salon.owner_id);

    let hijackedSalonId: string | null = null;

    if (existingSalons && existingSalons.length > 0) {
      const limitResult = await SubscriptionService.checkLimit(
        existingSalons[0].id,
        "branch",
        supabase,
      );
      if (!limitResult.allowed) {
        // If limit reached (e.g. 0 because no plan, or 1 on standard plan),
        // gracefully hijack into an UPDATE if we only have 1 salon and it's not active
        if (existingSalons.length === 1 && (limitResult.limit === 0 || existingSalons[0].status === 'PENDING' || existingSalons[0].status === 'SUBMITTED' || existingSalons[0].status === 'DRAFT')) {
          console.warn("Hijacking createSalon to update existing pending salon to escape limit loops:", existingSalons[0].id);
          hijackedSalonId = existingSalons[0].id;
        } else {
          throw new Error(
            `SUBSCRIPTION_LIMIT_REACHED:BRANCH:${limitResult.limit}`,
          );
        }
      }
    }

    const { type_ids, primary_type_id, ...salonData } = salon;

    // Use primary_type_id as fallback for type_id for backward compatibility
    const dbSalon = {
      ...salonData,
      type_id: primary_type_id || salonData.type_id,
    };

    let data;
    if (hijackedSalonId) {
      const { data: updateData, error: updateError } = await supabase
        .from("salons")
        .update(dbSalon)
        .eq("id", hijackedSalonId)
        .select()
        .single();
      if (updateError) throw updateError;
      data = updateData;
    } else {
      const { data: insertData, error: insertError } = await supabase
        .from("salons")
        .insert(dbSalon)
        .select()
        .single();
      if (insertError) throw insertError;
      data = insertData;
    }

    const salonId = data.id;

    // Insert Assignments
    if (type_ids && type_ids.length > 0) {
      const assignments = type_ids.map((tid) => ({
        salon_id: salonId,
        type_id: tid,
        is_primary: tid === (primary_type_id || dbSalon.type_id),
      }));

      const { error: assignError } = await supabase
        .from("salon_assigned_types")
        .insert(assignments);
      if (assignError)
        console.error("Error assigning salon types:", assignError);
    }

    // Prepare Working Hours
    let hoursToInsert;

    if (customHours && customHours.length > 0) {
      hoursToInsert = customHours.map((h) => ({
        salon_id: salonId,
        day_of_week: h.day_of_week,
        start_time:
          h.start_time.length === 5 ? `${h.start_time}:00` : h.start_time,
        end_time: h.end_time.length === 5 ? `${h.end_time}:00` : h.end_time,
        is_closed: h.is_closed,
      }));
    } else {
      // Create default working hours (Mon-Sat 09:00-19:00, Sun Closed)
      hoursToInsert = [1, 2, 3, 4, 5, 6].map((day) => ({
        salon_id: salonId,
        day_of_week: day,
        start_time: "09:00:00",
        end_time: "19:00:00",
        is_closed: false,
      }));

      hoursToInsert.push({
        salon_id: salonId,
        day_of_week: 0,
        start_time: "09:00:00",
        end_time: "19:00:00",
        is_closed: true,
      });
    }

    const { error: hoursError } = await supabase
      .from("salon_working_hours")
      .insert(hoursToInsert);
    if (hoursError) {
      console.error("Error inserting working hours:", hoursError);
      // We don't throw here to allow partial success, but logged.
    }

    if (initialServices && initialServices.length > 0) {
      const servicesToInsert = initialServices.map((s) => ({
        salon_id: salonId,
        global_service_id: s.global_service_id,
        price: s.price,
        duration_min: s.duration_min,
        is_active: true,
      }));

      const { error: servicesError } = await supabase
        .from("salon_services")
        .insert(servicesToInsert);
      if (servicesError) {
        console.error("Error inserting services:", servicesError);
      }
    }

    return data;
  },

  /**
   * Update salon
   */
  async updateSalon(
    id: string,
    updates: Partial<Salon>,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<Salon> {
    // Extract multi-type fields to prevent them from being sent to 'salons' table
    const { type_ids, primary_type_id, ...salonUpdates } = updates;

    // If primary type is updated, sync it to the legacy type_id column
    if (primary_type_id) {
      (salonUpdates as any).type_id = primary_type_id;
    }

    // Update main table
    const { data, error } = await supabase
      .from("salons")
      .update(salonUpdates)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Update error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        table: "salons",
        updates: salonUpdates,
      });
      throw error;
    }
    if (!data || data.length === 0) {
      throw new Error(
        "Update successful but RLS policy prevented retrieving the updated data. Please refresh.",
      );
    }

    // Handle Assignment Updates
    if (type_ids && type_ids.length > 0) {
      // Strategy: Delete all existing assignments and re-insert
      // This is safe because it's a join table without extra metadata (except is_primary which we re-calculate)
      const { error: deleteError } = await supabase
        .from("salon_assigned_types")
        .delete()
        .eq("salon_id", id);

      if (deleteError) {
        console.error("Error clearing old types:", deleteError);
        // We continue to try inserting even if delete failed (though unique constraint might hit)
      }

      const effectivePrimary = primary_type_id || data[0].type_id;

      const assignments = type_ids.map((tid) => ({
        salon_id: id,
        type_id: tid,
        is_primary: tid === effectivePrimary,
      }));

      const { error: insertError } = await supabase
        .from("salon_assigned_types")
        .insert(assignments);

      if (insertError)
        console.error("Error updating salon types:", insertError);
    }

    return data[0];
  },

  /**
   * Update salon plan
   */
  async updateSalonPlan(
    id: string,
    plan: "FREE" | "PRO" | "ENTERPRISE",
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    const { error } = await supabase
      .from("salons")
      .update({ plan })
      .eq("id", id);

    if (error) throw error;
  },

  /**
   * Delete salon
   */
  async deleteSalon(
    id: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    const { error } = await supabase.from("salons").delete().eq("id", id);

    if (error) throw error;
  },

  /**
   * Suspend a salon (Owner action) and cancel its active subscription
   */
  async suspendSalonAndCancelSubscription(
    id: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    // 1. Mark salon as SUSPENDED
    const { error: salonError } = await supabase
      .from("salons")
      .update({ status: "SUSPENDED" })
      .eq("id", id);
      
    if (salonError) throw salonError;

    // 2. Cancel active/trial subscriptions for this salon
    const { error: subError } = await supabase
      .from("subscriptions")
      .update({ status: "CANCELLED" })
      .eq("salon_id", id)
      .in("status", ["ACTIVE", "TRIAL", "PENDING"]);

    if (subError) throw subError;
  },

  /**
   * Get salon details by owner user ID (Returns list of all salons owned)
   */
  async getSalonsByOwner(
    ownerId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<SalonDetail[]> {
    if (!ownerId || ownerId === "") return [];
    const { data: salonIds, error: salonError } = await supabase
      .from("salons")
      .select("id")
      .eq("owner_id", ownerId);

    if (salonError || !salonIds || salonIds.length === 0) return [];

    const { data, error } = await supabase
      .from("salon_details")
      .select("*")
      .in(
        "id",
        salonIds.map((s) => s.id),
      );

    if (error) throw error;
    return (data || []).map((s) => this.mapSalonDetail(s));
  },

  /**
   * Get single salon for owner (backward compatibility & dashboard)
   */
  async getSalonByOwner(
    ownerId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<SalonDetail | null> {
    const salons = await this.getSalonsByOwner(ownerId, supabase);
    return salons.length > 0 ? salons[0] : null;
  },

  /**
   * Get all salons for Admin (regardless of status)
   */
  async getAllSalonsForAdmin(
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<SalonDetail[]> {
    const { data, error } = await supabase
      .from("salon_details")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map((s) => this.mapSalonDetail(s));
  },

  /**
   * Admin/System: Update salon status with optional reason
   */
  async updateSalonStatus(
    id: string,
    status: Salon["status"],
    reason?: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    const { error } = await supabase
      .from("salons")
      .update({
        status,
        rejected_reason: reason || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) throw error;
  },

  /**
   * Admin: Approve a salon
   */
  async approveSalon(
    id: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    await this.updateSalonStatus(id, "APPROVED", undefined, supabase);
  },

  /**
   * Admin: Request revision for a salon
   */
  async requestRevision(
    id: string,
    reason: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    await this.updateSalonStatus(id, "REVISION_REQUESTED", reason, supabase);
  },

  /**
   * Admin: Reject a salon
   */
  async rejectSalon(
    id: string,
    reason: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    await this.updateSalonStatus(id, "REJECTED", reason, supabase);
  },

  /**
   * Admin: Suspend a salon
   */
  async suspendSalon(
    id: string,
    reason: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    await this.updateSalonStatus(id, "SUSPENDED", reason, supabase);
  },

  /**
   * Owner: Submit salon for approval
   */
  async submitForApproval(
    id: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    const { error } = await supabase
      .from("salons")
      .update({ status: "SUBMITTED", updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },

  /**
   * Get working hours for a salon
   */
  async getSalonWorkingHours(
    salonId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<SalonWorkingHours[]> {
    const { data, error } = await supabase
      .from("salon_working_hours")
      .select("*")
      .eq("salon_id", salonId)
      .order("day_of_week");

    if (error) throw error;
    return data || [];
  },

  /**
   * Update salon working hours
   */
  async updateSalonWorkingHours(
    id: string,
    updates: Partial<SalonWorkingHours>,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    const { error } = await supabase
      .from("salon_working_hours")
      .update(updates)
      .eq("id", id);

    if (error) throw error;
  },

  /**
   * Initialize default working hours if missing
   */
  async initializeDefaultWorkingHours(
    salonId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<SalonWorkingHours[]> {
    const existing = await this.getSalonWorkingHours(salonId, supabase);
    if (existing && existing.length > 0) return existing;

    const defaultHours = [
      {
        salon_id: salonId,
        day_of_week: 1,
        start_time: "09:00",
        end_time: "20:00",
        is_closed: false,
      },
      {
        salon_id: salonId,
        day_of_week: 2,
        start_time: "09:00",
        end_time: "20:00",
        is_closed: false,
      },
      {
        salon_id: salonId,
        day_of_week: 3,
        start_time: "09:00",
        end_time: "20:00",
        is_closed: false,
      },
      {
        salon_id: salonId,
        day_of_week: 4,
        start_time: "09:00",
        end_time: "20:00",
        is_closed: false,
      },
      {
        salon_id: salonId,
        day_of_week: 5,
        start_time: "09:00",
        end_time: "20:00",
        is_closed: false,
      },
      {
        salon_id: salonId,
        day_of_week: 6,
        start_time: "09:00",
        end_time: "20:00",
        is_closed: false,
      },
      {
        salon_id: salonId,
        day_of_week: 0,
        start_time: "00:00",
        end_time: "00:00",
        is_closed: true,
      },
    ];

    const { data, error } = await supabase
      .from("salon_working_hours")
      .insert(defaultHours)
      .select();

    if (error) throw error;
    return data || [];
  },

  /**
   * Get salon usage statistics against plan limits
   */
  async getUsageStats(
    salonId: string,
    supabase: SupabaseClient = defaultSupabase,
  ) {
    const { data, error } = await supabase
      .from("salon_usage_stats")
      .select("*")
      .eq("salon_id", salonId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },
};

export const WorkingHoursService = {
  /**
   * Get working hours for staff member
   */
  async getWorkingHoursByStaff(
    staffId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<WorkingHours[]> {
    const { data, error } = await supabase
      .from("working_hours")
      .select("*")
      .eq("staff_id", staffId)
      .order("day_of_week");

    if (error) throw error;
    return data || [];
  },

  /**
   * Set working hours for staff
   */
  async setWorkingHours(
    hours: Omit<WorkingHours, "id" | "created_at">,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<WorkingHours> {
    const { data, error } = await supabase
      .from("working_hours")
      .upsert(hours, { onConflict: "staff_id,day_of_week" })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create a new staff member with default working hours
   */
  async createStaff(
    staffData: Partial<Staff>,
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
        ...staffData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Create default working hours (Mon-Sat 09-19, Sun Closed)
    const defaultHours = [1, 2, 3, 4, 5, 6].map((day) => ({
      staff_id: data.id,
      day_of_week: day,
      start_time: "09:00:00",
      end_time: "19:00:00",
      is_day_off: false,
    }));

    defaultHours.push({
      staff_id: data.id,
      day_of_week: 0,
      start_time: "09:00:00",
      end_time: "19:00:00",
      is_day_off: true,
    });

    await supabase.from("working_hours").insert(defaultHours);
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
};

export const ReviewService = {
  /**
   * Get reviews for a salon
   */
  async getReviewsBySalon(
    salonId: string,
    limit: number = 50,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<Review[]> {
    const { data, error } = await supabase
      .from("verified_reviews_view") // Use the view for extra details
      .select("*")
      .eq("salon_id", salonId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      // Fallback to regular table if view doesn't exist yet (during migration window)
      console.warn("View fetch failed, falling back to table", error);
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("reviews")
        .select("*")
        .eq("salon_id", salonId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (fallbackError) throw fallbackError;

      const finalData = (error ? fallbackData : data) || [];

      return finalData.map((r: any) => ({
        ...r,
        user_name: String(r.user_name || "Misafir"),
        comment:
          typeof r.comment === "object"
            ? JSON.stringify(r.comment)
            : String(r.comment || ""),
        service_name:
          typeof r.service_name === "object"
            ? (r.service_name as any)?.name
            : String(r.service_name || ""),
      }));
    }

    // Fetch images for these reviews (from view)
    const reviewIds = (data || []).map((r) => r.id);
    if (reviewIds.length > 0) {
      const { data: imageData } = await supabase
        .from("review_images")
        .select("*")
        .in("review_id", reviewIds);

      return (data || []).map((review) => ({
        ...review,
        user_name: String(review.user_name || "Misafir"),
        comment:
          typeof review.comment === "object"
            ? JSON.stringify(review.comment)
            : String(review.comment || ""),
        service_name:
          typeof review.service_name === "object"
            ? (review.service_name as any)?.name
            : String(review.service_name || ""),
        images: imageData?.filter((img) => img.review_id === review.id) || [],
      }));
    }

    return (data || []).map((review) => ({
      ...review,
      user_name: String(review.user_name || "Misafir"),
      comment:
        typeof review.comment === "object"
          ? JSON.stringify(review.comment)
          : String(review.comment || ""),
      service_name:
        typeof review.service_name === "object"
          ? (review.service_name as any)?.name
          : String(review.service_name || ""),
    }));
  },

  async createReview(
    review: Omit<Review, "id" | "created_at">,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<Review> {
    // Force is_verified to true if appointment_id is present
    const reviewData = {
      ...review,
      is_verified: !!review.appointment_id,
    };

    const { data, error } = await supabase
      .from("reviews")
      .insert(reviewData)
      .select()
      .single();

    if (error) {
      console.error("Error creating review:", error);
      throw error;
    }
    return data;
  },

  /**
   * Get eligible appointments for review (Completed appointments not yet reviewed)
   */
  async getReviewableAppointments(
    userId: string,
    salonId?: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<Appointment[]> {
    // 1. Get all completed appointments for this user
    let query = supabase
      .from("appointments")
      .select("*, salon:salons(name, logo_url)")
      .eq("customer_id", userId)
      .eq("status", "COMPLETED")
      .order("end_time", { ascending: false });

    if (salonId) {
      query = query.eq("salon_id", salonId);
    }

    const { data: appointments, error: apptError } = await query;

    if (apptError) throw apptError;
    if (!appointments || appointments.length === 0) return [];

    // 2. Get appointments that already have reviews
    let reviewQuery = supabase
      .from("reviews")
      .select("appointment_id")
      .eq("user_id", userId)
      .not("appointment_id", "is", null);

    if (salonId) {
      reviewQuery = reviewQuery.eq("salon_id", salonId);
    }

    const { data: reviews, error: reviewError } = await reviewQuery;

    if (reviewError) throw reviewError;

    const reviewedAppointmentIds = new Set(
      reviews?.map((r) => r.appointment_id) || [],
    );

    // Filter out appointments that are already reviewed
    return appointments.filter((ppt) => !reviewedAppointmentIds.has(ppt.id));
  },

  /**
   * Get salon rating summary
   */
  async getSalonRating(
    salonId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<{ average: number; count: number }> {
    const { data, error } = await supabase
      .from("salon_ratings")
      .select("*")
      .eq("salon_id", salonId)
      .single();

    if (error) return { average: 0, count: 0 };

    return {
      average: data?.average_rating || 0,
      count: data?.review_count || 0,
    };
  },
};

export const GalleryService = {
  /**
   * Get all images for a salon gallery
   */
  async getSalonGallery(
    salonId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<SalonGallery[]> {
    const { data, error } = await supabase
      .from("salon_gallery")
      .select("*")
      .eq("salon_id", salonId)
      .order("display_order", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Add image to salon gallery
   */
  async addGalleryImage(
    image: Omit<SalonGallery, "id" | "created_at">,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<SalonGallery> {
    // Enforcement: Check subscription limit for gallery photos
    if (image.salon_id) {
      const limitResult = await SubscriptionService.checkLimit(
        image.salon_id,
        "gallery_photo",
        supabase,
      );
      if (!limitResult.allowed)
        throw new Error(
          `SUBSCRIPTION_LIMIT_REACHED:GALLERY_PHOTO:${limitResult.limit}`,
        );
    }

    const { data, error } = await supabase
      .from("salon_gallery")
      .insert(image)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update gallery image (order, caption, cover status)
   */
  async updateGalleryImage(
    id: string,
    updates: Partial<SalonGallery>,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<SalonGallery> {
    const { data, error } = await supabase
      .from("salon_gallery")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete gallery image
   */
  async deleteGalleryImage(
    id: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    const { error } = await supabase
      .from("salon_gallery")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  /**
   * Set cover image for a salon
   */
  async setCoverImage(
    salonId: string,
    imageId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    // 1. Unset all cover images for this salon
    const { error: unsetErr } = await supabase
      .from("salon_gallery")
      .update({ is_cover: false })
      .eq("salon_id", salonId);

    if (unsetErr) throw unsetErr;

    // 2. Set the new cover image
    const { error: setErr } = await supabase
      .from("salon_gallery")
      .update({ is_cover: true })
      .eq("id", imageId);

    if (setErr) throw setErr;

    // 3. Update the main salons table image cache
    const { data: imgData } = await supabase
      .from("salon_gallery")
      .select("image_url")
      .eq("id", imageId)
      .single();

    if (imgData) {
      const { error: salonErr } = await supabase
        .from("salons")
        .update({ image: imgData.image_url })
        .eq("id", salonId);
      if (salonErr)
        console.error("Could not update salon cover cache:", salonErr);
    }
  },

  /**
   * Get images for a specific review
   */
  async getReviewImages(
    reviewId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<ReviewImage[]> {
    const { data, error } = await supabase
      .from("review_images")
      .select("*")
      .eq("review_id", reviewId);

    if (error) throw error;
    return data || [];
  },

  /**
   * Add image to a review
   */
  async addReviewImage(
    image: Omit<ReviewImage, "id" | "created_at">,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<ReviewImage> {
    const { data, error } = await supabase
      .from("review_images")
      .insert(image)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export const FavoriteService = {
  /**
   * Get user favorites (Current user)
   */
  async getUserFavorites(
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<Favorite[]> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];
    return this.getFavorites(user.id, supabase);
  },

  /**
   * Get all favorites for a user
   */
  async getFavorites(
    userId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<Favorite[]> {
    if (!userId || userId === "") return [];
    const { data, error } = await supabase
      .from("favorites")
      .select(
        `
        *,
        salon:salon_details(*)
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Check if a salon is in user's favorites
   */
  async isFavorite(
    userId: string,
    salonId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("salon_id", salonId)
      .maybeSingle();

    if (error) return false;
    return !!data;
  },

  /**
   * Toggle favorite status
   */
  async toggleFavorite(
    userId: string,
    salonId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<boolean> {
    const isFav = await this.isFavorite(userId, salonId, supabase);

    if (isFav) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("salon_id", salonId);
      if (error) throw error;
      return false;
    } else {
      const { error } = await supabase
        .from("favorites")
        .insert({ user_id: userId, salon_id: salonId });
      if (error) throw error;
      return true;
    }
  },
};

export const ReportingService = {
  /**
   * Get salon performance report for a specific period
   */
  async getSalonReport(
    salonId: string,
    reportDays: number = 30,
    supabase: SupabaseClient = defaultSupabase
  ) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - reportDays);

    // 1. Fetch completed appointments with service and staff details
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id,
        status,
        end_time,
        service_id,
        staff_id,
        salon_id,
        salon_services(
          price,
          global_service_id,
          global_services(name)
        ),
        staff(
          id,
          name
        )
      `)
      .eq('salon_id', salonId)
      .eq('status', 'COMPLETED')
      .gte('end_time', startDate.toISOString());

    if (error) throw error;

    // 2. Aggregate Data
    const serviceStats: Record<string, { name: string, count: number, revenue: number }> = {};
    const staffStats: Record<string, { id: string, name: string, count: number, revenue: number }> = {};
    let totalRevenue = 0;

    appointments?.forEach((appt: any) => {
      const price = appt.salon_services?.price || 0;
      totalRevenue += price;

      // Service Stats
      const serviceName = appt.salon_services?.global_services?.name || 'Diğer';
      if (!serviceStats[serviceName]) {
        serviceStats[serviceName] = { name: serviceName, count: 0, revenue: 0 };
      }
      serviceStats[serviceName].count++;
      serviceStats[serviceName].revenue += price;

      // Staff Stats
      const staffName = appt.staff?.name || 'Belirtilmemiş';
      const staffId = appt.staff_id;
      if (!staffStats[staffId]) {
        staffStats[staffId] = { id: staffId, name: staffName, count: 0, revenue: 0 };
      }
      staffStats[staffId].count++;
      staffStats[staffId].revenue += price;
    });

    // Previous period comparison (Simplified for a start)
    const prevStart = new Date(startDate);
    prevStart.setDate(prevStart.getDate() - reportDays);
    
    const { data: prevAppointments } = await supabase
      .from('appointments')
      .select('salon_services(price)')
      .eq('salon_id', salonId)
      .eq('status', 'COMPLETED')
      .gte('end_time', prevStart.toISOString())
      .lt('end_time', startDate.toISOString());

    const prevRevenue = prevAppointments?.reduce((sum, a: any) => sum + (a.salon_services?.price || 0), 0) || 0;
    const revenueTrend = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    return {
      totalRevenue,
      completedAppts: appointments?.length || 0,
      avgTicket: appointments && appointments.length > 0 ? totalRevenue / appointments.length : 0,
      revenueTrend: `${revenueTrend > 0 ? '+' : ''}${revenueTrend.toFixed(1)}%`,
      serviceStats: Object.values(serviceStats).sort((a, b) => b.revenue - a.revenue),
      staffStats: Object.values(staffStats).sort((a, b) => b.revenue - a.revenue)
    };
  }
};
