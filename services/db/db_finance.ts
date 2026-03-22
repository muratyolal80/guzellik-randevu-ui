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
    typeof supabaseUrl === "string" && (supabaseUrl.includes("localhost:8000") || supabaseUrl.includes("127.0.0.1:8000"))
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
      .select("*, subscriptions(subscription_plans(name, display_name))")
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
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*, subscription_plans(*)")
      .eq("salon_id", salonId)
      .in("status", ["ACTIVE", "PENDING_APPROVAL"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return subscription;
  },

  /**
   * Get all subscriptions for a salon (History)
   */
  async getSalonSubscriptionHistory(
    salonId: string,
    supabase: SupabaseClient = defaultSupabase,
  ) {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*, subscription_plans(*)")
      .eq("salon_id", salonId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get the active subscription for an owner across all their salons.
   * Useful when checking global limits like max_branches.
   */
  async getOwnerActiveSubscription(
    ownerId: string,
    supabase: SupabaseClient = defaultSupabase,
  ) {
    // Önce sahibin salonlarını bul
    const { data: salons } = await supabase
      .from("salons")
      .select("id")
      .eq("owner_id", ownerId);
      
    if (!salons || salons.length === 0) return null;

    const salonIds = salons.map((s) => s.id);

    // Bu salonlara ait en yüksek yetkili aktif aboneliği bul
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*, subscription_plans(*)")
      .in("salon_id", salonIds)
      .in("status", ["ACTIVE", "PENDING_APPROVAL"])
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    if (!data || data.length === 0) return null;

    // Ağırlığa göre sırala ve en yüksek olanı döndür (ELITE > BUSINESS > PRO > STARTER)
    const planWeights: Record<string, number> = {
      'STARTER': 0,
      'PRO': 1,
      'BUSINESS': 2,
      'ELITE': 3
    };

    data.sort((a, b) => {
      const weightA = planWeights[a.subscription_plans?.name || 'STARTER'] || 0;
      const weightB = planWeights[b.subscription_plans?.name || 'STARTER'] || 0;
      return weightB - weightA; // Descending
    });

    return data[0];
  },

  /**
   * Get all subscriptions for an owner (across all salons)
   */
  async getOwnerSubscriptionHistory(
    ownerId: string,
    supabase: SupabaseClient = defaultSupabase,
  ) {
    const { data: salons } = await supabase
      .from("salons")
      .select("id")
      .eq("owner_id", ownerId);
      
    if (!salons || salons.length === 0) return [];

    const salonIds = salons.map((s) => s.id);

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*, subscription_plans(*), salons(name)")
      .in("salon_id", salonIds)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Admin: Get ALL subscriptions with salon info
   */
  async getAllSubscriptions(supabase: SupabaseClient = defaultSupabase) {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*, subscription_plans(*), salons(name, owner_id)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Admin: Delete a subscription record
   */
  async deleteSubscription(id: string, supabase: SupabaseClient = defaultSupabase) {
    const { error } = await supabase
      .from("subscriptions")
      .delete()
      .eq("id", id);

    if (error) throw error;
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

    // Trial Period Check for STARTER
    if (plan.name === 'STARTER' && sub?.start_date) {
      const startDate = new Date(sub.start_date);
      const trialEndDate = sub.end_date ? new Date(sub.end_date) : new Date(startDate.setMonth(startDate.getMonth() + 3));
      const now = new Date();
      
      if (now > trialEndDate) {
        return {
          allowed: false,
          current,
          limit: -2, // Special code for TRIAL_EXPIRED
        };
      }
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
   * Create a new subscription record (usually PENDING status, but ACTIVE/TRIAL for Free/Starter)
   */
  async createSubscriptionRequest(
    salonId: string,
    planId: string,
    paymentMethod: "CREDIT_CARD" | "BANK_TRANSFER",
    billingCycle: "MONTHLY" | "YEARLY" = "MONTHLY",
    supabase: SupabaseClient = defaultSupabase,
  ) {
    // Önce planın detaylarını alalım
    const { data: planData } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .single();

    let days = billingCycle === "YEARLY" ? 365 : 30;
    let initialStatus = "PENDING_APPROVAL";
    let periodEnd = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

    // Starter planı 3 ay (90 gün) ücretsiz deneme
    if (planData && (planData.name === "STARTER" || planData.price_monthly === 0)) {
       days = 90;
       initialStatus = "ACTIVE"; // Starter matches ACTIVE in schema
       periodEnd = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .upsert({
        salon_id: salonId,
        plan_id: planId,
        status: initialStatus,
        payment_method: paymentMethod,
        billing_cycle: billingCycle,
        current_period_start: new Date().toISOString(),
        current_period_end: periodEnd,
        updated_at: new Date().toISOString()
      }, { onConflict: 'salon_id' })
      .select()
      .single();

    if (error) throw error;
    
    // If it's a free plan (STARTER), activate it immediately
    if (initialStatus === 'ACTIVE' && planData?.price_monthly === 0) {
      // 1. Ödeme geçmişine kaydet
      await supabase.from("payment_history").insert({
        salon_id: salonId,
        subscription_id: data.id,
        amount: 0,
        payment_method: "TRIAL",
        payment_type: "SUBSCRIPTION",
        status: "SUCCESS",
        metadata: { note: "Ücretsiz deneme başlatıldı" }
      });

      // 2. Aktivasyon yap
      await SubscriptionService.activateSalonAndSubscription(
        salonId, 
        data.id, 
        'Otomatik TRIAL Aktivasyonu',
        supabase
      );
    }
    
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
  /**
   * Admin: Manually assign or upgrade a subscription for a salon.
   * This bypasses the normal payment flow.
   */
  async adminAssignSubscription(
    salonId: string,
    planId: string,
    billingCycle: "MONTHLY" | "YEARLY" = "MONTHLY",
    adminNote: string = "Admin tarafından manuel atandı",
    supabase: SupabaseClient = defaultSupabase,
  ) {
    // 1. Plan detaylarını al
    const { data: planData } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (!planData) throw new Error("Plan bulunamadı");

    const days = billingCycle === "YEARLY" ? 365 : 30;
    const periodEnd = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

    // 2. Aboneliği oluştur veya güncelle
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .upsert({
        salon_id: salonId,
        plan_id: planId,
        status: "ACTIVE",
        payment_method: "BANK_TRANSFER", // Placeholder for manual
        billing_cycle: billingCycle,
        current_period_start: new Date().toISOString(),
        current_period_end: periodEnd,
        updated_at: new Date().toISOString()
      }, { onConflict: 'salon_id' })
      .select()
      .single();

    if (subError) throw subError;

    // 3. Ödeme geçmişine "Sistem Ataması" olarak ekle
    await supabase.from("payment_history").insert({
      salon_id: salonId,
      subscription_id: subscription.id,
      amount: billingCycle === "YEARLY" ? planData.price_yearly : planData.price_monthly,
      payment_method: "BANK_TRANSFER",
      payment_type: "SUBSCRIPTION",
      status: "SUCCESS",
      metadata: { note: adminNote, is_admin_assignment: true }
    });

    // 4. Salonu ve aboneliği aktif et (onaylı durumu için)
    await this.activateSalonAndSubscription(
      salonId,
      subscription.id,
      adminNote,
      supabase
    );

    return subscription;
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

    // Case 1: Subscription Activation (Atomic RPC)
    if (status === "SUCCESS" && payment.payment_type === "SUBSCRIPTION" && payment.subscription_id) {
      try {
        const { error: rpcError } = await supabase.rpc("activate_salon_and_subscription", {
          p_salon_id: payment.salon_id,
          p_subscription_id: payment.subscription_id,
          p_admin_note: adminNote
        });
        
        if (rpcError) {
          console.error("RPC Error (Activation):", rpcError);
          throw rpcError;
        }
        return { success: true, method: 'RPC' };
      } catch (err) {
          console.error("Activation RPC failed, attempting manual fallback for payment history:", err);
          // Fallback: at least update the payment record
          await supabase.from("payment_history").update({ status: 'SUCCESS' }).eq("id", paymentId);
          throw err;
      }
    }

    // Case 2: Standard Status Update (Manual)
    const { error: updateError } = await supabase
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

    if (updateError) {
      console.error("Update Error (Manual):", updateError);
      throw updateError;
    }

    // NEW: If rejected AND was a subscription, update subscription status to CANCELLED
    if (status === 'FAILED' && payment.payment_type === 'SUBSCRIPTION' && payment.subscription_id) {
        await supabase
            .from('subscriptions')
            .update({ status: 'CANCELLED', updated_at: new Date().toISOString() })
            .eq('id', payment.subscription_id);
    }
    
    return { success: true, method: 'MANUAL' };
  },

  /**
   * Get financial reports (Overview)
   */
  async getFinancialReports(
    filter: { salonId?: string; startDate?: string; endDate?: string } = {},
    supabase: SupabaseClient = defaultSupabase,
  ) {
    let query = supabase.from("payment_history").select(`
      *, 
      salons(
        id, 
        name, 
        owner_id, 
        phone,
        address,
        cities(name),
        districts(name),
        profiles!owner_id(full_name, email, phone)
      ), 
      subscriptions(
        current_period_end, 
        status, 
        plan_id,
        subscription_plans(*)
      )
    `);

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

  /**
   * Delete a payment record
   */
  async deletePayment(
    id: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    // 1. Get payment info to see if it's a subscription request
    const { data: payment } = await supabase
        .from('payment_history')
        .select('payment_type, subscription_id')
        .eq('id', id)
        .single();

    // 2. Delete the payment record
    const { error } = await supabase
      .from("payment_history")
      .delete()
      .eq("id", id);

    if (error) throw error;

    // 3. If it was a subscription request, cancel the pending subscription too
    if (payment?.payment_type === 'SUBSCRIPTION' && payment?.subscription_id) {
        await supabase
            .from('subscriptions')
            .update({ status: 'CANCELLED', updated_at: new Date().toISOString() })
            .eq('id', payment.subscription_id)
            .eq('status', 'PENDING_APPROVAL');
    }
  },

  /**
   * Admin: Get Ghost (Orphaned) Subscriptions
   * Subscriptions that belong to deleted salons or have inconsistent states.
   */
  async getGhostSubscriptions(supabase: SupabaseClient = defaultSupabase) {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*, salons(name, status, owner_id), subscription_plans(name)")
      .or(`salons.status.eq.DELETED,current_period_end.lt.${new Date().toISOString()}`)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Filter purely in JS for safety if the .or filter on joined table is tricky
    return data.filter((sub: any) => 
      !sub.salons || 
      sub.salons.status === 'DELETED' || 
      (sub.status === 'ACTIVE' && new Date(sub.current_period_end) < new Date())
    );
  },

  /**
   * Admin: Hard delete a ghost subscription
   */
  async hardDeleteSubscription(id: string, supabase: SupabaseClient = defaultSupabase) {
    const { error } = await supabase
      .from("subscriptions")
      .delete()
      .eq("id", id);
      
    if (error) throw error;
  }
};
