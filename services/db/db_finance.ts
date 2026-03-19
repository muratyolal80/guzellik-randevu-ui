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

// Helper to check if we have a real connection
const isSupabaseConfigured = () => {
  return (
    typeof supabaseUrl === "string" && supabaseUrl.includes("localhost:8000")
  );
};

export const PaymentService = {
  // Record a new transaction
  async createTransaction(
    transaction: Omit<Transaction, "id" | "created_at" | "updated_at">,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<Transaction> {
    const { data, error } = await supabase
      .from("transactions")
      .insert(transaction)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get transactions for a salon (Owner view)
  async getSalonTransactions(
    salonId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("salon_id", salonId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get transactions for a customer
  async getCustomerTransactions(
    customerId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from("transactions")
      .select("*, salons(name)")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Record a payment in payment_history (New unified table)
   */
  async recordPayment(payment: any, supabase: SupabaseClient = defaultSupabase) {
    const { data, error } = await supabase
      .from("payment_history")
      .insert(payment)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get payment history for a salon
   */
  async getSalonPaymentHistory(
    salonId: string,
    supabase: SupabaseClient = defaultSupabase,
  ) {
    const { data, error } = await supabase
      .from("payment_history")
      .select("*")
      .eq("salon_id", salonId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },
};

export const SubscriptionService = {
  /**
   * Get all available plans
   */
  async getPlans(supabase: SupabaseClient = defaultSupabase) {
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Get current subscription of a salon
   */
  async getSalonSubscription(
    salonId: string,
    supabase: SupabaseClient = defaultSupabase,
  ) {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*, subscription_plans(*)")
      .eq("salon_id", salonId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Check if a salon can add more resources based on their plan
   * @param salonId Salon ID
   * @param resourceType 'staff' | 'branch' | 'gallery_photo'
   */
  async checkLimit(
    salonId: string,
    resourceType: "staff" | "branch" | "gallery_photo",
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<{ allowed: boolean; current: number; limit: number }> {
    const sub = await this.getSalonSubscription(salonId, supabase);
    let plan = sub?.subscription_plans;

    if (!plan) {
      // Default to STARTER limits if no sub found (e.g. during onboarding)
      const { data: defaultPlan } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("name", "STARTER")
        .maybeSingle();

      if (!defaultPlan) {
        return { allowed: false, current: 0, limit: 0 };
      }
      plan = defaultPlan;
    }
    let current = 0;
    let limit = 0;

    if (resourceType === "staff") {
      const { count } = await supabase
        .from("staff")
        .select("*", { count: "exact", head: true })
        .eq("salon_id", salonId);
      current = count || 0;
      limit = plan.max_staff;
    } else if (resourceType === "branch") {
      // Count total salons for the same owner
      const { data: currentSalon } = await supabase
        .from("salons")
        .select("owner_id")
        .eq("id", salonId)
        .maybeSingle();
      if (currentSalon?.owner_id) {
        const { count } = await supabase
          .from("salons")
          .select("*", { count: "exact", head: true })
          .eq("owner_id", currentSalon.owner_id);
        current = count || 0;
      } else {
        current = 1;
      }
      limit = plan.max_branches;
    } else if (resourceType === "gallery_photo") {
      const { count } = await supabase
        .from("salon_gallery")
        .select("*", { count: "exact", head: true })
        .eq("salon_id", salonId);
      current = count || 0;
      limit = plan.max_gallery_photos;
    }

    return {
      allowed: limit === -1 || current < limit,
      current,
      limit,
    };
  },

  /**
   * Start a subscription process.
   * If Credit Card, it calls the server API for iyzico processing.
   */
  async subscribe(
    salonId: string,
    planId: string,
    paymentMethod: "CREDIT_CARD" | "BANK_TRANSFER",
    billingCycle: "MONTHLY" | "YEARLY" = "MONTHLY",
    supabase: SupabaseClient = defaultSupabase,
  ) {
    if (paymentMethod === "CREDIT_CARD") {
      const response = await fetch("/api/subscription/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salonId, planId, billingCycle }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Ödeme başlatılamadı");
      return data;
    }

    // Default: Just create the pending record for Bank Transfer
    return this.createSubscriptionRequest(
      salonId,
      planId,
      paymentMethod,
      billingCycle,
      supabase,
    );
  },

  /**
   * Create a new subscription record (usually PENDING status)
   */
  async createSubscriptionRequest(
    salonId: string,
    planId: string,
    paymentMethod: "CREDIT_CARD" | "BANK_TRANSFER",
    billingCycle: "MONTHLY" | "YEARLY" = "MONTHLY",
    supabase: SupabaseClient = defaultSupabase,
  ) {
    const days = billingCycle === "YEARLY" ? 365 : 30;

    const { data, error } = await supabase
      .from("subscriptions")
      .upsert({
        salon_id: salonId,
        plan_id: planId,
        status: "PENDING",
        payment_method: paymentMethod,
        billing_cycle: billingCycle,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(
          Date.now() + days * 24 * 60 * 60 * 1000,
        ).toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Notify platform about a bank transfer payment
   */
  async notifyBankTransfer(
    subscriptionId: string,
    salonId: string,
    amount: number,
    supabase: SupabaseClient = defaultSupabase,
  ) {
    const { data, error } = await supabase
      .from("payment_history")
      .insert({
        salon_id: salonId,
        subscription_id: subscriptionId,
        amount: amount,
        payment_method: "BANK_TRANSFER",
        payment_type: "SUBSCRIPTION",
        status: "PENDING", // Admin confirmation needed
        bank_transfer_notified_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a subscription plan (Admin only)
   */
  async updatePlan(
    planId: string,
    updates: any,
    supabase: SupabaseClient = defaultSupabase,
  ) {
    const { data, error } = await supabase
      .from("subscription_plans")
      .update(updates)
      .eq("id", planId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Check if a specific feature is enabled in salon's plan
   */
  async checkFeatureAccess(
    salonId: string,
    feature: "has_advanced_reports" | "has_campaigns" | "has_sponsored",
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<boolean> {
    const sub = await this.getSalonSubscription(salonId, supabase);
    return sub?.subscription_plans?.[feature] === true;
  },

  /**
   * Atomic RPC to activate salon and subscription
   */
  async activateSalonAndSubscription(
    salonId: string,
    subscriptionId: string,
    adminNote?: string,
    supabase: SupabaseClient = defaultSupabase,
  ) {
    const { error } = await supabase.rpc("activate_salon_and_subscription", {
      p_salon_id: salonId,
      p_subscription_id: subscriptionId,
      p_admin_note: adminNote,
    });

    if (error) throw error;
  },
};

export const SubmerchantService = {
  /**
   * Get salon's sub-merchant registration info
   */
  async getBySalonId(
    salonId: string,
    supabase: SupabaseClient = defaultSupabase,
  ) {
    const { data, error } = await supabase
      .from("salon_sub_merchants")
      .select("*")
      .eq("salon_id", salonId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Upsert sub-merchant registration (Application)
   */
  async saveRegistration(
    salonId: string,
    registrationData: any,
    supabase: SupabaseClient = defaultSupabase,
  ) {
    const { data, error } = await supabase
      .from("salon_sub_merchants")
      .upsert({
        salon_id: salonId,
        ...registrationData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export const FinanceService = {
  /**
   * Get pending bank transfer payments for Admin
   */
  async getPendingPayments(supabase: SupabaseClient = defaultSupabase) {
    const { data, error } = await supabase
      .from("payment_history")
      .select("*, salons(name, owner_id)")
      .eq("status", "PENDING")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Approve or reject a payment (Bank Transfer)
   */
  async updatePaymentStatus(
    paymentId: string,
    status: "SUCCESS" | "FAILED",
    adminNote?: string,
    supabase: SupabaseClient = defaultSupabase,
  ) {
    const { data: payment, error: pError } = await supabase
      .from("payment_history")
      .select("*")
      .eq("id", paymentId)
      .single();

    if (pError) throw pError;

    const { error } = await supabase
      .from("payment_history")
      .update({
        status,
        metadata: {
          ...payment.metadata,
          admin_note: adminNote,
          updated_by_admin_at: new Date().toISOString(),
        },
      })
      .eq("id", paymentId);

    if (error) throw error;

    // If it was a subscription payment, activate the subscription and the salon
    if (
      status === "SUCCESS" &&
      payment.payment_type === "SUBSCRIPTION" &&
      payment.subscription_id
    ) {
      // Activate subscription
      await supabase
        .from("subscriptions")
        .update({ status: "ACTIVE" })
        .eq("id", payment.subscription_id);

      // Activate salon (Set to APPROVED)
      await supabase
        .from("salons")
        .update({ status: "APPROVED", is_verified: true })
        .eq("id", payment.salon_id);
    }
  },

  /**
   * Get financial reports (Overview)
   */
  async getFinancialReports(
    filter: { salonId?: string; startDate?: string; endDate?: string } = {},
    supabase: SupabaseClient = defaultSupabase,
  ) {
    let query = supabase.from("payment_history").select("*");

    if (filter.salonId) query = query.eq("salon_id", filter.salonId);
    if (filter.startDate) query = query.gte("created_at", filter.startDate);
    if (filter.endDate) query = query.lte("created_at", filter.endDate);

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });
    if (error) throw error;

    // Simple aggregation
    const totalRevenue = data.reduce(
      (acc, curr) => (curr.status === "SUCCESS" ? acc + curr.amount : acc),
      0,
    );
    const successCount = data.filter((p) => p.status === "SUCCESS").length;

    return {
      transactions: data,
      stats: {
        totalRevenue,
        successCount,
        failedCount: data.filter((p) => p.status === "FAILED").length,
        pendingCount: data.filter((p) => p.status === "PENDING").length,
      },
    };
  },
};
