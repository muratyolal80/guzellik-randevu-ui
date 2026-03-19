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
import { AuditLogService } from "./db_support";

// Helper to check if we have a real connection
const isSupabaseConfigured = () => {
  return (
    typeof supabaseUrl === "string" && supabaseUrl.includes("localhost:8000")
  );
};

export const AppointmentService = {
  /**
   * Get appointment by ID (with tenant check)
   */
  async getAppointmentById(
    id: string,
    salonId?: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<Appointment | null> {
    let query = supabase.from("appointments").select("*").eq("id", id);

    if (salonId) {
      query = query.eq("salon_id", salonId);
    }

    const { data, error } = await query.single();

    if (error) throw error;
    return data;
  },

  /**
   * Get appointments for a salon
   */
  async getAppointmentsBySalon(
    salonId: string,
    startDate?: string,
    endDate?: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<Appointment[]> {
    let query = supabase
      .from("appointments")
      .select("*")
      .eq("salon_id", salonId);

    if (startDate) {
      query = query.gte("start_time", startDate);
    }
    if (endDate) {
      query = query.lte("start_time", endDate);
    }

    query = query.order("start_time");

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /**
   * Get appointments for a staff member
   */
  async getAppointmentsByStaff(
    staffId: string,
    date: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<Appointment[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("staff_id", staffId)
      .gte("start_time", startOfDay.toISOString())
      .lte("start_time", endOfDay.toISOString())
      .order("start_time");

    if (error) throw error;
    return data || [];
  },

  /**
   * Get appointments by customer phone
   */
  async getAppointmentsByPhone(
    phone: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("customer_phone", phone)
      .order("start_time", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Create new appointment
   */
  async createAppointment(
    appointment: Omit<Appointment, "id" | "created_at" | "updated_at">,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<Appointment> {
    const { data, error } = await supabase
      .from("appointments")
      .insert(appointment)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update appointment status (with tenant check)
   */
  async updateAppointmentStatus(
    id: string,
    status: Appointment["status"],
    salonId?: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<Appointment> {
    let query = supabase.from("appointments").update({ status }).eq("id", id);

    if (salonId) {
      query = query.eq("salon_id", salonId);
    }

    const { data, error } = await query.select().single();

    if (error) throw error;

    // Log the action for audit trail
    if (salonId) {
      AuditLogService.logAction({
        salon_id: salonId,
        action: `APPOINTMENT_STATUS_UPDATED_${status}`,
        resource_type: "appointment",
        resource_id: id,
        changes: { status },
      }).catch((err) =>
        console.error("[AuditLog] Failed to log status update:", err),
      );
    }

    return data;
  },

  /**
   * Cancel appointment
   */
  async cancelAppointment(
    id: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<Appointment> {
    return this.updateAppointmentStatus(id, "CANCELLED", undefined, supabase);
  },

  /**
   * Update full appointment details (with tenant check)
   */
  async updateAppointment(
    id: string,
    updates: Partial<Appointment>,
    salonId?: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<Appointment> {
    let query = supabase.from("appointments").update(updates).eq("id", id);

    if (salonId) {
      query = query.eq("salon_id", salonId);
    }

    const { data, error } = await query.select().single();

    if (error) throw error;
    return data;
  },
};

export const InviteService = {
  /**
   * Create a new invite (Owner/Manager action)
   */
  async createInvite(
    invite: Omit<
      Invite,
      "id" | "status" | "created_at" | "expires_at" | "accepted_at"
    >,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<Invite> {
    const { data, error } = await supabase
      .from("invites")
      .insert({
        ...invite,
        token:
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15),
        status: "PENDING",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get invite details by token (Public check)
   */
  async getInviteByToken(
    token: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<Invite | null> {
    const { data, error } = await supabase
      .from("invites")
      .select("*, salon:salons(name)")
      .eq("token", token)
      .eq("status", "PENDING")
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  /**
   * Accept invite and link to membership
   */
  async acceptInvite(
    inviteId: string,
    userId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    const { data: invite, error: fetchErr } = await supabase
      .from("invites")
      .select("*")
      .eq("id", inviteId)
      .single();

    if (fetchErr) throw fetchErr;

    // 1. Create membership
    const { error: memErr } = await supabase.from("salon_memberships").insert({
      user_id: userId,
      salon_id: invite.salon_id,
      role: invite.role,
      is_active: true,
    });

    if (memErr) throw memErr;

    // 2. Mark invite as accepted
    const { error: updErr } = await supabase
      .from("invites")
      .update({
        status: "ACCEPTED",
        accepted_at: new Date().toISOString(),
      })
      .eq("id", inviteId);

    if (updErr) throw updErr;
  },
};

export const CampaignService = {
  /**
   * Validate a coupon code for a specific salon and amount
   */
  async validateCoupon(
    code: string,
    salonId: string,
    amount: number,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<Coupon> {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("salon_id", salonId)
      .eq("is_active", true)
      .single();

    if (error || !data)
      throw new Error("Geçersiz veya süresi dolmuş kupon kodu.");

    // Check usage limit
    if (data.usage_limit && data.used_count >= data.usage_limit) {
      throw new Error("Bu kuponun kullanım sınırı dolmuştur.");
    }

    // Check expiry date
    if (data.end_date && new Date(data.end_date) < new Date()) {
      throw new Error("Bu kuponun süresi dolmuştur.");
    }

    // Check minimum purchase amount
    if (data.min_purchase_amount && amount < data.min_purchase_amount) {
      throw new Error(
        `Minimum sepet tutarı ${data.min_purchase_amount} TL olmalıdır.`,
      );
    }

    return data as Coupon;
  },

  /**
   * Get coupons for a salon (Admin/Owner view)
   */
  async getSalonCoupons(
    salonId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<Coupon[]> {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("salon_id", salonId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as any) || [];
  },

  /**
   * Create a new coupon
   */
  async createCoupon(
    coupon: Omit<Coupon, "id" | "created_at" | "used_count">,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<Coupon> {
    const { data, error } = await supabase
      .from("coupons")
      .insert(coupon)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a coupon
   */
  async deleteCoupon(
    id: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    const { error } = await supabase.from("coupons").delete().eq("id", id);

    if (error) throw error;
  },

  /**
   * Get all active packages for a salon
   */
  async getSalonPackages(
    salonId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<Package[]> {
    const { data, error } = await supabase
      .from("packages")
      .select(
        `
        *,
        services:package_services(
          *,
          service:salon_services(*)
        )
      `,
      )
      .eq("salon_id", salonId)
      .eq("is_active", true);

    if (error) throw error;
    return (data as any) || [];
  },

  /**
   * Create a new package
   */
  async createPackage(
    packageData: Omit<Package, "id" | "created_at">,
    services: { salon_service_id: string; quantity: number }[],
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<Package> {
    // 1. Create the package
    const { data: pkg, error: pkgError } = await supabase
      .from("packages")
      .insert(packageData)
      .select()
      .single();

    if (pkgError) throw pkgError;

    // 2. Add services to the package
    const packageServices = services.map((s) => ({
      package_id: pkg.id,
      salon_service_id: s.salon_service_id,
      quantity: s.quantity,
    }));

    const { error: srvError } = await supabase
      .from("package_services")
      .insert(packageServices);

    if (srvError) throw srvError;

    return pkg;
  },

  /**
   * Delete a package
   */
  async deletePackage(
    id: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    const { error } = await supabase.from("packages").delete().eq("id", id);

    if (error) throw error;
  },
};
