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
    typeof supabaseUrl === "string" && (supabaseUrl.includes("localhost:8000") || supabaseUrl.includes("127.0.0.1:8000"))
  );
};

export const DashboardService = {
  /**
   * Get main dashboard metrics for a user
   */
  async getDashboardData(
    userId: string,
    supabase: SupabaseClient = defaultSupabase,
  ) {
    const now = new Date();
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    ).toISOString();
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    ).toISOString();

    const upcomingQuery = supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("status", "CONFIRMED")
      .gt("start_time", new Date().toISOString())
      .eq("customer_id", userId);

    const reviewQuery = supabase
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    const spendingQuery = supabase
      .from("appointments")
      .select(
        `
        salon_service:salon_services (
          price
        )
      `,
      )
      .in("status", ["CONFIRMED", "COMPLETED"])
      .gte("start_time", startOfMonth)
      .lte("start_time", endOfMonth)
      .eq("customer_id", userId);

    const nextAppointmentQuery = supabase
      .from("appointments")
      .select(
        `
        *,
        salon:salons (
          name,
          address,
          image,
          city:cities(name),
          district:districts(name)
        ),
        service:salon_services (
          price,
          global_service:global_services(name)
        )
      `,
      )
      .gt("start_time", new Date().toISOString())
      .eq("status", "CONFIRMED")
      .eq("customer_id", userId)
      .order("start_time", { ascending: true })
      .limit(1)
      .maybeSingle();

    const [upcoming, reviews, spending, nextAppt] = await Promise.all([
      upcomingQuery,
      reviewQuery,
      spendingQuery,
      nextAppointmentQuery,
    ]);

    const totalSpending =
      spending.data?.reduce(
        (acc, curr: any) => acc + (curr.salon_service?.price || 0),
        0,
      ) || 0;

    return {
      upcomingCount: upcoming.count || 0,
      reviewCount: reviews.count || 0,
      monthlySpending: totalSpending,
      nextAppointment: nextAppt.data,
    };
  },

  /**
   * Get advanced analytics for salon owners
   */
  async getOwnerDashboardData(
    salonId: string,
    supabase: SupabaseClient = defaultSupabase,
  ) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();

    // 1. Income & Appointments over time
    const { data: appts, error } = await supabase
      .from("appointments")
      .select(
        `
        id,
        start_time,
        status,
        service:salon_services (
          price,
          global_service:global_services(name)
        )
      `,
      )
      .eq("salon_id", salonId)
      .gte("start_time", thirtyDaysAgoStr)
      .in("status", ["CONFIRMED", "COMPLETED"]);

    if (error) throw error;

    // Process daily stats for charts
    const dailyStats: Record<
      string,
      { date: string; income: number; appointments: number }
    > = {};
    appts?.forEach((a: any) => {
      const day = a.start_time.split("T")[0];
      if (!dailyStats[day]) {
        dailyStats[day] = { date: day, income: 0, appointments: 0 };
      }
      dailyStats[day].income += a.service?.price || 0;
      dailyStats[day].appointments += 1;
    });

    const chartData = Object.values(dailyStats).sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    // 2. Staff Performance
    const { data: staffData } = await supabase
      .from("staff")
      .select(
        `
        id,
        name,
        appointments:appointments(id, status)
      `,
      )
      .eq("salon_id", salonId);

    const staffPerformance =
      staffData
        ?.map((s) => ({
          name: s.name,
          appointments:
            (s.appointments as any[])?.filter((a) => a.status !== "CANCELLED")
              .length || 0,
        }))
        .sort((a, b) => b.appointments - a.appointments) || [];

    // 3. Service Popularity
    const serviceCounts: Record<string, number> = {};
    appts?.forEach((a: any) => {
      const name = a.service?.global_service?.name || "Diğer";
      serviceCounts[name] = (serviceCounts[name] || 0) + 1;
    });

    const serviceStats = Object.entries(serviceCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // 4. Summaries
    const totalIncome =
      appts?.reduce(
        (acc, curr) => acc + ((curr.service as any)?.price || 0),
        0,
      ) || 0;

    return {
      chartData,
      staffPerformance,
      serviceStats,
      summary: {
        totalIncome,
        totalAppointments: appts?.length || 0,
        activeCustomers: new Set(appts?.map((a) => (a as any).customer_id))
          .size,
      },
    };
  },

  /**
   * Get dynamic recommendations for the user
   */
  async getRecommendedSalons(
    limit: number = 3,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<SalonDetail[]> {
    // Basic logic: high rating + sponsored
    const { data, error } = await supabase
      .from("salon_details")
      .select("*")
      .order("is_sponsored", { ascending: false })
      .order("average_rating", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  /**
   * Get platform-wide statistics for SUPER_ADMIN
   */
  async getPlatformStats(supabase: SupabaseClient = defaultSupabase) {
    const today = new Date().toISOString().split("T")[0];
    const [salons, appointments, staff] = await Promise.all([
      supabase.from("salons").select("*", { count: "exact", head: true }),
      supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .gte("start_time", `${today}T00:00:00Z`),
      supabase
        .from("staff")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true),
    ]);
    const { data: revenueData } = await supabase
      .from("appointments")
      .select("service:salon_services(price)")
      .eq("status", "COMPLETED");
    const totalRevenue =
      (revenueData as any[])?.reduce(
        (acc, curr) => acc + (curr.service?.price || 0),
        0,
      ) || 0;

    return {
      totalSalons: salons.count || 0,
      todayAppointments: appointments.count || 0,
      totalRevenue,
      activeStaff: staff.count || 0,
    };
  },
};

export const ProfileService = {
  /**
   * Get profile by ID
   */
  async getProfile(
    userId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*, default_city:cities(name)")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update profile information
   */
  async updateProfile(
    userId: string,
    updates: Partial<Profile>,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<Profile> {
    const { data, error } = await supabase
      .from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    // Log the action
    AuditLogService.logAction({
      salon_id: updates.default_city_id || "",
      user_id: userId,
      action: "PROFILE_UPDATED",
      resource_type: "profile",
      resource_id: userId,
      changes: updates,
      supabase,
    }).catch((err) =>
      console.error("[AuditLog] Failed to log profile update:", err),
    );

    return data;
  },

  /**
   * Request account deletion (Soft Delete)
   */
  async requestAccountDeletion(
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase.rpc("request_account_deletion");
    if (error) throw error;

    if (user) {
      AuditLogService.logAction({
        salon_id: "",
        user_id: user.id,
        action: "ACCOUNT_DELETION_REQUESTED",
        resource_type: "profile",
        resource_id: user.id,
        supabase,
      }).catch((err) =>
        console.error("[AuditLog] Failed to log deletion request:", err),
      );
    }
  },

  /**
   * Get active sessions for a user
   */
  async getActiveSessions(
    userId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<any[]> {
    const { data, error } = await supabase
      .from("user_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("is_revoked", false)
      .order("last_active_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Terminate a specific session
   */
  async terminateSession(
    sessionId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("user_sessions")
      .update({ is_revoked: true })
      .eq("id", sessionId);

    if (error) throw error;

    if (user) {
      AuditLogService.logAction({
        salon_id: "",
        user_id: user.id,
        action: "SESSION_TERMINATED",
        resource_type: "session",
        resource_id: sessionId,
        supabase,
      }).catch((err) =>
        console.error("[AuditLog] Failed to log session termination:", err),
      );
    }
  },

  /**
   * Terminate all other sessions
   */
  async terminateAllOtherSessions(
    userId: string,
    currentSessionId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    const { error } = await supabase
      .from("user_sessions")
      .update({ is_revoked: true })
      .eq("user_id", userId)
      .neq("id", currentSessionId);

    if (error) throw error;
  },

  /**
   * Admin: Get all profiles with advanced filtering
   */
  async adminGetProfiles(
    options: {
      search?: string;
      role?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {},
    supabase: SupabaseClient = defaultSupabase,
  ) {
    let query = supabase
      .from("profiles")
      .select("*");

    if (options.role && options.role !== 'all') {
      query = query.eq("role", options.role);
    }

    if (options.search) {
      query = query.or(`full_name.ilike.%${options.search}%,email.ilike.%${options.search}%,phone.ilike.%${options.search}%`);
    }

    if (options.sortBy) {
      query = query.order(options.sortBy, { ascending: options.sortOrder === 'asc' });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;
    // Map is_active from profiles (ensure it's typed properly if possible)
    return (data || []).map(u => ({
      ...u,
      is_active: u.is_active ?? true
    }));
  },

  /**
   * Admin: Update profile (Full control)
   */
  async adminUpdateProfile(
    userId: string,
    updates: Partial<Profile>,
    supabase: SupabaseClient = defaultSupabase,
  ) {
    const { data, error } = await supabase
      .from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Admin: Hard Delete user and all associated data (Cascade)
   */
  async adminHardDelete(
    userId: string,
    supabase: SupabaseClient = defaultSupabase,
  ) {
    // Call the RPC for cascading delete
    const { error: rpcError } = await supabase.rpc("admin_delete_user_cascade", { 
        target_user_id: userId 
    });
    
    if (rpcError) throw rpcError;
  },

  /**
   * Admin: Toggle user active/passive status
   */
  async adminToggleActive(
    userId: string,
    isActive: boolean,
    supabase: SupabaseClient = defaultSupabase,
  ) {
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) throw error;
  }
};
