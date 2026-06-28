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
  CampaignRule,
  Transaction,
  AppointmentCoupon,
  DiscountType,
  PaymentMethod,
  PaymentStatus,
} from "@/types";
import { AuditLogService, NotificationService } from "./db_support";
import { ServiceService } from "./db_staff";
import { ResourceService } from "./db_resource";

// Helper to check if we have a real connection
const isSupabaseConfigured = () => {
  return (
    typeof supabaseUrl === "string" && (supabaseUrl.includes("localhost:8000") || supabaseUrl.includes("127.0.0.1:8000"))
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
      .select(`
        *,
        staff:staff_id ( id, name ),
        service:salon_service_id (
          id, duration_min, price,
          global_service:global_service_id ( id, name )
        )
      `)
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
    // Phase 6: Advanced Logic
    try {
      // 1. Fetch service details to check constraints
      const service = await ServiceService.getServiceById(appointment.salon_service_id, appointment.salon_id, supabase);
      if (!service) throw new Error("Hizmet bulunamadı.");

      let resourceId = appointment.resource_id;

      // 2. Capacity Check for Group Services
      if (service.max_participants && service.max_participants > 1) {
        // Find existing appointments for the same slot, staff and service
        const { data: existingAppts } = await supabase
          .from("appointments")
          .select("participant_count")
          .eq("salon_id", appointment.salon_id)
          .eq("staff_id", appointment.staff_id)
          .eq("salon_service_id", appointment.salon_service_id)
          .eq("start_time", appointment.start_time)
          .neq("status", "CANCELLED");

        const currentTotal = existingAppts?.reduce((sum, a) => sum + (a.participant_count || 1), 0) || 0;
        const newTotal = currentTotal + (appointment.participant_count || 1);

        if (newTotal > service.max_participants) {
          throw new Error(`Kapasite dolu. Bu saatte en fazla ${service.max_participants} kişi randevu alabilir. Mevcut: ${currentTotal}`);
        }
      }

      // 3. Resource Allocation (Optional/Background)
      if (service.requires_resource && !resourceId) {
        const resources = await ResourceService.getResourcesBySalon(appointment.salon_id, supabase);
        const activeResources = resources.filter(r => r.is_active);

        if (activeResources.length === 0) {
          throw new Error("Bu işlem için gerekli fiziksel kaynak (koltuk/oda) bulunamadı.");
        }

        // Find which resources are busy at this EXACT time
        const { data: busyResources } = await supabase
          .from("appointments")
          .select("resource_id")
          .eq("salon_id", appointment.salon_id)
          .eq("start_time", appointment.start_time)
          .not("resource_id", "is", null)
          .neq("status", "CANCELLED");

        const busyIds = new Set(busyResources?.map(r => r.resource_id) || []);
        
        // Pick first available resource
        const availableResource = activeResources.find(r => !busyIds.has(r.id));
        
        if (!availableResource) {
          throw new Error("Bu saat için uygun koltuk/oda kalmadı.");
        }
        
        resourceId = availableResource.id;
      }

      // 4. Save Appointment
      const { data, error } = await supabase
        .from("appointments")
        .insert({
          ...appointment,
          resource_id: resourceId,
          participant_count: appointment.participant_count || 1
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Appointment creation failed:", err);
      throw err;
    }
  },

  /**
   * Complete appointment and record payment
   */
  async completeAppointmentWithPayment(
    id: string,
    salonId: string,
    paymentMethod: PaymentMethod,
    amount: number,
    customerId?: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<{ appointment: Appointment; transaction: Transaction }> {
    // 1. Update Appointment Status
    const { data: appointment, error: apptError } = await supabase
      .from("appointments")
      .update({ 
        status: "COMPLETED",
        payment_method: paymentMethod as any,
        payment_status: "COMPLETED",
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .eq("salon_id", salonId)
      .select()
      .single();

    if (apptError) throw apptError;

    // 2. Create Transaction Record
    const { data: transaction, error: transError } = await supabase
      .from("transactions")
      .insert({
        salon_id: salonId,
        customer_id: customerId || appointment.customer_id,
        appointment_id: id,
        amount: amount,
        payment_method: paymentMethod,
        payment_status: "COMPLETED",
        notes: "On-site payment recorded during appointment completion."
      })
      .select()
      .single();

    if (transError) {
      console.error("Failed to create transaction after completing appointment:", transError);
      throw transError;
    }

    // 3. Log the action
    AuditLogService.logAction({
      salon_id: salonId,
      action: "APPOINTMENT_COMPLETED_WITH_PAYMENT",
      resource_type: "appointment",
      resource_id: id,
      changes: { status: "COMPLETED", paymentMethod, amount },
      supabase,
    }).catch(console.error);

    return { appointment, transaction };
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
    // Onaylama/iptal işleminde KİM ve NE ZAMAN bilgisini iz olarak tut.
    const updatePayload: Record<string, unknown> = { status };
    if (status === "CONFIRMED" || status === "CANCELLED") {
      const { data: sessionData } = await supabase.auth.getSession();
      const actorId = sessionData?.session?.user?.id || null;
      const nowIso = new Date().toISOString();
      if (status === "CONFIRMED") {
        updatePayload.approved_by = actorId;
        updatePayload.approved_at = nowIso;
      } else {
        updatePayload.cancelled_by = actorId;
        updatePayload.cancelled_at = nowIso;
      }
    }

    let query = supabase.from("appointments").update(updatePayload).eq("id", id);

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

    // Müşteriye bildirim gönder (yalnızca üye müşteri = customer_id varsa).
    if ((status === "CONFIRMED" || status === "CANCELLED") && data?.customer_id) {
      const dt = new Date(data.start_time).toLocaleString("tr-TR", {
        dateStyle: "medium",
        timeStyle: "short",
      });
      NotificationService.sendNotification(
        {
          user_id: data.customer_id,
          salon_id: salonId,
          title: status === "CONFIRMED" ? "Randevunuz Onaylandı" : "Randevunuz İptal Edildi",
          content:
            status === "CONFIRMED"
              ? `${dt} tarihli randevunuz onaylandı. Sizi bekliyoruz!`
              : `${dt} tarihli randevunuz iptal edildi.`,
          type: "APPOINTMENT",
          link: "/appointments",
        },
        supabase,
      ).catch((err) => console.error("[Bildirim] Randevu durumu gönderilemedi:", err));
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

  /**
   * Get all active campaign rules for a salon
   */
  async getSalonCampaignRules(
    salonId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<CampaignRule[]> {
    const { data, error } = await supabase
      .from("campaign_rules")
      .select("*")
      .eq("salon_id", salonId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as any) || [];
  },

  /**
   * Create a new campaign rule
   */
  async createCampaignRule(
    rule: Omit<CampaignRule, "id" | "created_at" | "updated_at">,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<CampaignRule> {
    const { data, error } = await supabase
      .from("campaign_rules")
      .insert(rule)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a campaign rule
   */
  async deleteCampaignRule(
    id: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    const { error } = await supabase
      .from("campaign_rules")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
