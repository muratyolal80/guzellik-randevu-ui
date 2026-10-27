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
  AppointmentWithRelations,
  AppointmentDetail,
  PendingAppointmentRow,
  CustomerBookingRow,
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
   * Full appointment detail with salon/staff/service and confirmed/completed/cancelled actor profiles
   */
  async getAppointmentDetail(
    id: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<AppointmentDetail | null> {
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id, status, start_time, end_time, customer_id, customer_name, customer_phone,
        notes, coupon_code, discount_amount, deposit_amount, participant_count,
        confirmed_by, confirmed_at, completed_by, completed_at,
        cancelled_by, cancelled_at, cancellation_reason, created_at,
        salon:salons(id, name, address, phone),
        staff:staff(id, name, role, specialty),
        salon_service:salon_services(
          id, price, duration_min,
          global_service:global_services(name)
        ),
        confirmed_by_profile:profiles!appointments_confirmed_by_fkey(id, first_name, last_name, email),
        completed_by_profile:profiles!appointments_completed_by_fkey(id, first_name, last_name, email),
        cancelled_by_profile:profiles!appointments_cancelled_by_fkey(id, first_name, last_name, email)
      `)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data as unknown as AppointmentDetail | null;
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
   * Salon appointments starting at/after `fromIso` (owner dashboard "upcoming" list)
   */
  async getSalonAppointmentsFrom(
    salonId: string,
    fromIso: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<AppointmentWithRelations[]> {
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        *,
        service:salon_services(price, duration_min, global_service:global_services(name)),
        staff:staff(name, photo)
      `)
      .eq("salon_id", salonId)
      .gte("start_time", fromIso)
      .order("start_time", { ascending: true });

    if (error) throw error;
    return (data || []) as unknown as AppointmentWithRelations[];
  },

  /**
   * Next 20 upcoming PENDING appointments of a salon (awaiting owner/staff approval)
   */
  async getUpcomingPendingAppointments(
    salonId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<PendingAppointmentRow[]> {
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id, start_time, customer_name, customer_phone, notes, staff_id,
        salon_service:salon_services(duration_min, global_service:global_services(name)),
        staff:staff(id, name, user_id)
      `)
      .eq("salon_id", salonId)
      .eq("status", "PENDING")
      .gte("start_time", new Date().toISOString())
      .order("start_time", { ascending: true })
      .limit(20);

    if (error) throw error;
    return (data || []) as unknown as PendingAppointmentRow[];
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
   * Staff appointments in a time range with service (and optionally salon name) embedded
   */
  async getStaffAppointmentsWithService(
    staffId: string,
    startIso: string,
    endIso: string,
    includeSalon = false,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<AppointmentWithRelations[]> {
    const select = includeSalon
      ? `*, salon:salons(name), service:salon_services(price, duration_min, global_service:global_services(name))`
      : `*, service:salon_services(price, duration_min, global_service:global_services(name))`;
    const { data, error } = await supabase
      .from("appointments")
      .select(select)
      .eq("staff_id", staffId)
      .gte("start_time", startIso)
      .lte("start_time", endIso)
      .order("start_time", { ascending: true });

    if (error) throw error;
    return (data || []) as unknown as AppointmentWithRelations[];
  },

  /**
   * Signed-in customer's appointments for one tab of the customer panel
   */
  async getCustomerAppointments(
    customerId: string,
    tab: "upcoming" | "past" | "cancelled",
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<AppointmentWithRelations[]> {
    let query = supabase
      .from("appointments")
      .select(`
        *,
        salon:salons(id, name, address, image),
        service:salon_services(id, price, duration_min, global_service:global_services(name)),
        staff:staff(id, name)
      `)
      .eq("customer_id", customerId)
      .order("start_time", { ascending: tab === "upcoming" });

    if (tab === "upcoming") {
      query = query.in("status", ["PENDING", "CONFIRMED"]).gt("start_time", new Date().toISOString());
    } else if (tab === "past") {
      query = query.in("status", ["COMPLETED", "CONFIRMED", "NO_SHOW"]).lt("start_time", new Date().toISOString());
    } else if (tab === "cancelled") {
      query = query.eq("status", "CANCELLED");
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as unknown as AppointmentWithRelations[];
  },

  /**
   * All appointments of a customer (newest first) for the /bookings list
   */
  async getCustomerBookingRows(
    customerId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<CustomerBookingRow[]> {
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id,
        start_time,
        end_time,
        status,
        salon:salons (
          name,
          address
        ),
        staff:staff (
          name
        ),
        salon_service:salon_services (
          price,
          duration_min,
          global_service:global_services (
            name
          )
        )
      `)
      .eq("customer_id", customerId)
      .order("start_time", { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as CustomerBookingRow[];
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
   * Plain insert for an owner-entered (walk-in / phone) appointment — status PENDING,
   * no capacity/resource allocation (unlike createAppointment).
   */
  async createManualAppointment(
    input: Pick<
      Appointment,
      "salon_id" | "staff_id" | "salon_service_id" | "customer_name" | "customer_phone" | "start_time" | "end_time"
    > & { notes: string | null },
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<Appointment> {
    const { data, error } = await supabase
      .from("appointments")
      .insert({ ...input, status: "PENDING" })
      .select()
      .single();

    if (error) throw error;
    return data as Appointment;
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
        payment_method: paymentMethod,
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
    // Durum değiştiren KİM + NE ZAMAN izi — kanonik kolonlar (confirmed/completed/cancelled_by).
    // profiles(id) FK'lı olduklarından actor = auth.uid() (owner/personel profil id'si).
    const updatePayload: Record<string, unknown> = { status };
    if (status === "CONFIRMED" || status === "CANCELLED" || status === "COMPLETED") {
      const { data: sessionData } = await supabase.auth.getSession();
      const actorId = sessionData?.session?.user?.id || null;
      const nowIso = new Date().toISOString();
      if (status === "CONFIRMED") {
        updatePayload.confirmed_by = actorId;
        updatePayload.confirmed_at = nowIso;
      } else if (status === "COMPLETED") {
        updatePayload.completed_by = actorId;
        updatePayload.completed_at = nowIso;
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
    // invites are not publicly readable (New-33) — token lookup goes through a definer RPC
    const { data, error } = await supabase.rpc("get_invite_by_token", { p_token: token });

    if (error) throw error;
    const row = (data as Array<Invite & { salon_name: string | null }> | null)?.[0];
    if (!row || row.status !== "PENDING") return null;
    return { ...row, token, salon: { name: row.salon_name ?? "" } };
  },

  /**
   * Accept invite for the signed-in user. accept_staff_invite (New-33) verifies the
   * invite email matches the session, links/creates the staff card, membership and role.
   */
  async acceptInvite(
    token: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    const { error } = await supabase.rpc("accept_staff_invite", { p_token: token });
    if (error) throw error;
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
    return (data as Coupon[] | null) || [];
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
    return (data as Package[] | null) || [];
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
    return (data as CampaignRule[] | null) || [];
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
