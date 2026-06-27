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
<<<<<<< HEAD
    return (
        typeof supabaseUrl === 'string' && 
        (supabaseUrl.includes('localhost') || supabaseUrl.includes('127.0.0.1'))
    );
=======
  return (
    typeof supabaseUrl === "string" && (supabaseUrl.includes("localhost:8000") || supabaseUrl.includes("127.0.0.1:8000"))
  );
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
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
<<<<<<< HEAD
    if (!salonId || salonId === "") return [];
=======
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
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
<<<<<<< HEAD
    if (!customerId || customerId === "") return [];
=======
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
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
<<<<<<< HEAD
    if (!salonId || salonId === "") return [];
=======
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
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
<<<<<<< HEAD
   * Get available plans
   * @param onlyActive If true, returns only plans where is_active is true
   */
  async getPlans(onlyActive: boolean = false, supabase: SupabaseClient = defaultSupabase) {
    let query = supabase
      .from("subscription_plans")
      .select("*");
    
    if (onlyActive) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query.order("sort_order", { ascending: true });
=======
   * Get all available plans
   */
  async getPlans(supabase: SupabaseClient = defaultSupabase) {
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .order("sort_order", { ascending: true });
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8

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
<<<<<<< HEAD
    if (!salonId || salonId === "") return null;
=======
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
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
<<<<<<< HEAD
    if (!salonId || salonId === "") return [];
=======
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
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
<<<<<<< HEAD
    if (!ownerId || ownerId === "") return null;
=======
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
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
<<<<<<< HEAD
   * Get total resource usage for an owner across all their salons
   */
  async getOwnerUsageStats(ownerId: string, supabase: SupabaseClient = defaultSupabase) {
    if (!ownerId || ownerId === "") return null;
    const sub = await this.getOwnerActiveSubscription(ownerId, supabase);
    const plan = sub?.subscription_plans;

    if (!plan) return null;

    // 1. Total Salons (Branches)
    const { count: branchCount } = await supabase
      .from("salons")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", ownerId)
      .not("status", "eq", "DELETED");

    // 2. Total Staff (Across all salons)
    const { data: salons } = await supabase
      .from("salons")
      .select("id")
      .eq("owner_id", ownerId);
    
    const salonIds = salons?.map(s => s.id) || [];
    
    let staffCount = 0;
    if (salonIds.length > 0) {
      const { count } = await supabase
        .from("staff")
        .select("id", { count: "exact", head: true })
        .in("salon_id", salonIds)
        .eq("is_active", true);
      staffCount = count || 0;
    }

    // 3. Total Gallery Photos
    let photoCount = 0;
    if (salonIds.length > 0) {
      const { count } = await supabase
        .from("salon_gallery")
        .select("id", { count: "exact", head: true })
        .in("salon_id", salonIds);
      photoCount = count || 0;
    }

    return {
      plan: {
        id: plan.id,
        name: plan.name,
        display_name: plan.display_name,
        limits: {
          branches: plan.max_branches,
          staff: plan.max_staff,
          gallery_photos: plan.max_gallery_photos,
          sms_monthly: plan.max_sms_monthly,
        }
      },
      usage: {
        branches: branchCount || 0,
        staff: staffCount || 0,
        gallery_photos: photoCount || 0,
      },
      subscription: {
        status: sub.status,
        expires_at: sub.current_period_end
      }
    };
  },

  /**
   * Get comprehensive subscription and payment details for an owner
   */
  async getOwnerSubscriptionFullDetails(ownerId: string, supabase: SupabaseClient = defaultSupabase) {
    if (!ownerId || ownerId === "") return null;
    try {
      // 1. Current Active Subscription
      const activeSub = await this.getOwnerActiveSubscription(ownerId, supabase);
      
      // 2. Resource Usage Stats (Branches, Staff, Photos)
      const usage = await this.getOwnerUsageStats(ownerId, supabase);
      
      // 3. Payment & Subscription History
      const { data: history, error: historyError } = await supabase
        .from("payment_history")
        .select(`
          *,
          subscriptions:subscriptions (
            id,
            status,
            current_period_end,
            subscription_plans (
              name,
              display_name
            )
          )
        `)
        .eq("owner_id", ownerId)
        .order("created_at", { ascending: false });

      if (historyError) {
        // Fallback to salon-based history if owner_id migration isn't applied yet
        const { data: salons } = await supabase.from("salons").select("id").eq("owner_id", ownerId);
        const salonIds = salons?.map(s => s.id) || [];
        
        const { data: fallbackHistory } = await supabase
          .from("payment_history")
          .select(`
            *,
            subscriptions:subscriptions (
              id,
              status,
              current_period_end,
              subscription_plans (
                name,
                display_name
              )
            )
          `)
          .in("salon_id", salonIds)
          .order("created_at", { ascending: false });
          
        return {
          activeSub,
          usage,
          history: fallbackHistory || [],
          firstPurchase: fallbackHistory && fallbackHistory.length > 0 ? fallbackHistory[fallbackHistory.length - 1].created_at : null
        };
      }

      // 4. First Purchase Date
      const firstPurchase = history && history.length > 0 
        ? history[history.length - 1].created_at 
        : (activeSub?.created_at || null);

      return {
        activeSub,
        usage,
        history: history || [],
        firstPurchase
      };
    } catch (error) {
      console.error("Error in getOwnerSubscriptionFullDetails:", error);
      throw error;
    }
  },

  /**
=======
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
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
<<<<<<< HEAD
  async getAllSubscriptions(
    options: { page?: number; pageSize?: number; search?: string } = {},
    supabase: SupabaseClient = defaultSupabase
  ) {
    const page = options.page || 1;
    const pageSize = options.pageSize || 10;
    const offset = (page - 1) * pageSize;

    let selectQuery = "*, subscription_plans(*), salons(name, owner_id)";
    if (options.search) {
      selectQuery = "*, subscription_plans(*), salons!inner(name, owner_id)";
    }

    let query = supabase
      .from("subscriptions")
      .select(selectQuery, { count: 'exact' });

    if (options.search) {
      query = query.ilike("salons.name", `%${options.search}%`);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;
    return {
      subscriptions: data || [],
      totalCount: count || 0
    };
  },

  /**
   * Performance optimization: Get all salons with their active subscription in a single query.
   */
  async getSalonsWithActiveSubscriptions(
    options: { search?: string } = {},
    supabase: SupabaseClient = defaultSupabase
  ) {
    let query = supabase
      .from("salons")
      .select(`
        *,
        cities(name),
        districts(name),
        profiles:profiles!owner_id(full_name, email, phone),
        subscriptions(
          id, status, plan_id, current_period_start, current_period_end,
          subscription_plans(name, display_name, price_monthly, price_yearly)
        )
      `)
      .order("created_at", { ascending: false });

    if (options.search) {
      query = query.ilike("name", `%${options.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Supabase normally returns all subscriptions, but we want the 'active' one 
    // Usually we only have one ACTIVE/PENDING_APPROVAL subscription at a time per salon.
    const enriched = data?.map(s => {
      // Find the active/pending subscription
      const activeSubs = Array.isArray(s.subscriptions) ? s.subscriptions.filter((sub: any) => 
        sub.status === "ACTIVE" || sub.status === "PENDING_APPROVAL" || sub.status === "TRIAL"
      ) : [];
      let activeSub = activeSubs.length > 0 ? activeSubs[0] : null;

      return {
        ...s,
        activeSub,
        city_name: s.cities?.name,
        district_name: s.districts?.name,
        owner_name: s.profiles?.full_name,
        owner_email: s.profiles?.email
      };
    }) || [];

    return enriched;
=======
  async getAllSubscriptions(supabase: SupabaseClient = defaultSupabase) {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*, subscription_plans(*), salons(name, owner_id)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
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
<<<<<<< HEAD
    if (!salonId || salonId === "") return { allowed: false, current: 0, limit: 0 };
=======
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
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
<<<<<<< HEAD
    metadata?: { senderName?: string; bankName?: string; amount?: number; receiptUrl?: string },
=======
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
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

<<<<<<< HEAD
    // Default: BANK_TRANSFER flow
    const sub: any = await this.createSubscriptionRequest(
=======
    // Default: Just create the pending record for Bank Transfer
    return this.createSubscriptionRequest(
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
      salonId,
      planId,
      paymentMethod,
      billingCycle,
      supabase,
    );
<<<<<<< HEAD

    // After creating subscription, if it is PENDING_APPROVAL, register it in payment_history
    if (sub.status === "PENDING_APPROVAL") {
      // Ensure we have an amount, fall back to plan price if metadata is missing
      let amount: number = metadata?.amount || 0;
      if (amount === 0) {
          const { data: plan } = await supabase.from('subscription_plans').select('price_monthly, price_yearly').eq('id', planId).single();
          amount = billingCycle === 'YEARLY' ? (plan?.price_yearly || 0) : (plan?.price_monthly || 0);
      }

      await this.notifyBankTransfer(
        sub.id,
        salonId,
        amount,
        metadata?.senderName || 'Belirtilmedi',
        metadata?.receiptUrl,
        supabase,
        metadata?.bankName || 'Belirtilmedi'
      );
    }
    
    return sub;
=======
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
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
<<<<<<< HEAD
    // 1. Plan ve Salon bilgilerini al
=======
    // Önce planın detaylarını alalım
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
    const { data: planData } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .single();

<<<<<<< HEAD
    const { data: salonData } = await supabase
      .from("salons")
      .select("owner_id")
      .eq("id", salonId)
      .single();

    if (!planData) throw new Error("Plan bulunamadı");

    const days = billingCycle === "YEARLY" ? 365 : 30;
    const periodEnd = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    
    // Ücretsiz paketse direkt ACTIVE, değilse PENDING_APPROVAL
    const initialStatus = planData.price_monthly === 0 ? 'ACTIVE' : 'PENDING_APPROVAL';

    // 2. Abonelik talebi oluştur
=======
    let days = billingCycle === "YEARLY" ? 365 : 30;
    let initialStatus = "PENDING_APPROVAL";
    let periodEnd = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

    // Starter planı 3 ay (90 gün) ücretsiz deneme
    if (planData && (planData.name === "STARTER" || planData.price_monthly === 0)) {
       days = 90;
       initialStatus = "ACTIVE"; // Starter matches ACTIVE in schema
       periodEnd = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
    }

>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
    const { data, error } = await supabase
      .from("subscriptions")
      .upsert({
        salon_id: salonId,
<<<<<<< HEAD
        owner_id: salonData?.owner_id || null,
=======
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
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
<<<<<<< HEAD
        owner_id: salonData?.owner_id || null,
=======
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
        subscription_id: data.id,
        amount: 0,
        payment_method: "TRIAL",
        payment_type: "SUBSCRIPTION",
        status: "SUCCESS",
        metadata: { note: "Ücretsiz deneme başlatıldı" }
      });

      // 2. Aktivasyon yap
<<<<<<< HEAD
      await this.activateSalonAndSubscription(
=======
      await SubscriptionService.activateSalonAndSubscription(
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
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
<<<<<<< HEAD
    senderName?: string,
    receiptUrl?: string,
    supabase: SupabaseClient = defaultSupabase,
    bankName?: string,
=======
    supabase: SupabaseClient = defaultSupabase,
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
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
<<<<<<< HEAD
        bank_transfer_proof_url: receiptUrl || null,
        metadata: {
          sender_name: senderName || 'Belirtilmedi',
          bank_name: bankName || 'Belirtilmedi'
        }
=======
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
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
<<<<<<< HEAD
    target: { salonId?: string; ownerId?: string },
=======
    salonId: string,
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
    planId: string,
    billingCycle: "MONTHLY" | "YEARLY" = "MONTHLY",
    adminNote: string = "Admin tarafından manuel atandı",
    supabase: SupabaseClient = defaultSupabase,
  ) {
<<<<<<< HEAD
    const { salonId, ownerId } = target;
    if (!salonId && !ownerId) throw new Error("salonId veya ownerId zorunludur");

=======
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
    // 1. Plan detaylarını al
    const { data: planData } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (!planData) throw new Error("Plan bulunamadı");

    const days = billingCycle === "YEARLY" ? 365 : 30;
    const periodEnd = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

<<<<<<< HEAD
    // 2. Owner ID'yi bul (salonId verilmişse)
    let finalOwnerId = ownerId;
    if (salonId && !finalOwnerId) {
      const { data: salon } = await supabase.from('salons').select('owner_id').eq('id', salonId).single();
      finalOwnerId = salon?.owner_id;
    }

    // 3. Aboneliği oluştur veya güncelle
    let existingSub = null;
    if (salonId) {
       const { data } = await supabase.from('subscriptions').select('id').eq('salon_id', salonId).maybeSingle();
       existingSub = data;
    } else if (finalOwnerId) {
       const { data } = await supabase.from('subscriptions').select('id').eq('owner_id', finalOwnerId).maybeSingle();
       existingSub = data;
    }

    const subPayload = {
      salon_id: salonId || null,
      owner_id: finalOwnerId || null,
      plan_id: planId,
      status: "ACTIVE",
      payment_method: "BANK_TRANSFER",
      billing_cycle: billingCycle,
      current_period_start: new Date().toISOString(),
      current_period_end: periodEnd,
      updated_at: new Date().toISOString()
    };

    let subscription;
    if (existingSub) {
      const { data, error } = await supabase
        .from("subscriptions")
        .update(subPayload)
        .eq("id", existingSub.id)
        .select()
        .single();
      if (error) throw error;
      subscription = data;
    } else {
      const { data, error } = await supabase
        .from("subscriptions")
        .insert(subPayload)
        .select()
        .single();
      if (error) throw error;
      subscription = data;
    }

    // 4. Ödeme geçmişine "Sistem Ataması" olarak ekle
    await supabase.from("payment_history").insert({
      salon_id: salonId || null,
      owner_id: finalOwnerId || null,
=======
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
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
      subscription_id: subscription.id,
      amount: billingCycle === "YEARLY" ? planData.price_yearly : planData.price_monthly,
      payment_method: "BANK_TRANSFER",
      payment_type: "SUBSCRIPTION",
      status: "SUCCESS",
      metadata: { note: adminNote, is_admin_assignment: true }
    });

<<<<<<< HEAD
    // 5. Salonu ve aboneliği aktif et (eğer salonId varsa)
    if (salonId) {
      await this.activateSalonAndSubscription(
        salonId,
        subscription.id,
        adminNote,
        supabase
      );
    }

    return subscription;
  },

  /**
   * Admin: Create a new subscription plan
   */
  async createPlan(plan: any, supabase: SupabaseClient = defaultSupabase) {
    const { data, error } = await supabase
      .from("subscription_plans")
      .insert(plan)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Admin: Delete or deactivate a plan
   */
  async deletePlan(planId: string, supabase: SupabaseClient = defaultSupabase) {
    // Önce bu plana bağlı abonelik var mı kontrol et
    const { count } = await supabase
      .from("subscriptions")
      .select("*", { count: 'exact', head: true })
      .eq("plan_id", planId);

    if (count && count > 0) {
      // Eğer kullanımda ise tamamen silme, pasife çek
      const { error } = await supabase
        .from("subscription_plans")
        .update({ is_active: false })
        .eq("id", planId);
      
      if (error) throw error;
      return { success: true, action: 'DEACTIVATED' };
    }

    // Kullanımda değilse tamamen sil
    const { error } = await supabase
      .from("subscription_plans")
      .delete()
      .eq("id", planId);

    if (error) throw error;
    return { success: true, action: 'DELETED' };
  },
=======
    // 4. Salonu ve aboneliği aktif et (onaylı durumu için)
    await this.activateSalonAndSubscription(
      salonId,
      subscription.id,
      adminNote,
      supabase
    );

    return subscription;
  },
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
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
<<<<<<< HEAD
   * Admin: Get Unified Finance Records (Combines payments and subscriptions without a payment record)
   */
  async getUnifiedFinanceRecords(
    options: { page?: number; pageSize?: number; search?: string; status?: string } = {},
    supabase: SupabaseClient = defaultSupabase
  ) {
    const page = options.page || 1;
    const pageSize = options.pageSize || 10;
    const offset = (page - 1) * pageSize;

    // We primarily query payment_history as it contains the sequence of events
    let query = supabase
      .from("payment_history")
      .select(`
        *,
        salons!inner(
          id, 
          name, 
          owner_id,
          cities(name),
          districts(name),
          profiles:profiles!owner_id(full_name, email, phone)
        ),
        subscriptions(
          id,
          status,
          current_period_end,
          subscription_plans(*)
        )
      `, { count: 'exact' });

    if (options.search) {
      query = query.ilike("salons.name", `%${options.search}%`);
    }

    if (options.status && options.status !== 'ALL') {
      if (options.status === 'PENDING') {
          query = query.eq('status', 'PENDING');
      } else if (options.status === 'SUCCESS') {
          query = query.eq('status', 'SUCCESS');
      } else if (options.status === 'FAILED') {
          query = query.eq('status', 'FAILED');
      }
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;

    return {
      records: data || [],
      totalCount: count || 0
    };
  },

  /**
=======
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
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
<<<<<<< HEAD
    if (status === "SUCCESS" && payment.payment_type === "SUBSCRIPTION") {
      let subscriptionId = payment.subscription_id;
      
      // RECOVERY: If subscription_id is missing, try to find a pending one for this salon
      if (!subscriptionId) {
        const { data: latestSub } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("salon_id", payment.salon_id)
          .eq("status", "PENDING_APPROVAL")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        
        if (latestSub) {
          subscriptionId = latestSub.id;
        }
      }

      if (subscriptionId) {
        const { error: rpcError } = await supabase.rpc("activate_salon_and_subscription", {
          p_salon_id: payment.salon_id,
          p_subscription_id: subscriptionId,
=======
    if (status === "SUCCESS" && payment.payment_type === "SUBSCRIPTION" && payment.subscription_id) {
      try {
        const { error: rpcError } = await supabase.rpc("activate_salon_and_subscription", {
          p_salon_id: payment.salon_id,
          p_subscription_id: payment.subscription_id,
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
          p_admin_note: adminNote
        });
        
        if (rpcError) {
<<<<<<< HEAD
          console.error("Activation RPC Error:", rpcError);
          throw new Error(`Aktivasyon hatası (RPC): ${rpcError.message}`);
        }
        // After RPC, we continue to Case 2 to ensure the specific payment_history record is updated by ID
      }
    }

    // Case 2: Standard Status Update (Direct ID)
=======
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
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
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
    
<<<<<<< HEAD
    return { success: true };
=======
    return { success: true, method: 'MANUAL' };
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
  },

  /**
   * Get financial reports (Overview)
   */
  async getFinancialReports(
<<<<<<< HEAD
    filter: { 
      salonId?: string; 
      startDate?: string; 
      endDate?: string;
      page?: number;
      pageSize?: number;
      status?: string;
      method?: string;
      search?: string;
    } = {},
    supabase: SupabaseClient = defaultSupabase,
  ) {
    const page = filter.page || 1;
    const pageSize = filter.pageSize || 10;
    const offset = (page - 1) * pageSize;

    let selectStr = `
=======
    filter: { salonId?: string; startDate?: string; endDate?: string } = {},
    supabase: SupabaseClient = defaultSupabase,
  ) {
    let query = supabase.from("payment_history").select(`
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
      *, 
      salons(
        id, 
        name, 
        owner_id, 
        phone,
        address,
        cities(name),
        districts(name),
<<<<<<< HEAD
        profiles:profiles!owner_id(full_name, email, phone)
=======
        profiles!owner_id(full_name, email, phone)
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
      ), 
      subscriptions(
        current_period_end, 
        status, 
        plan_id,
        subscription_plans(*)
      )
<<<<<<< HEAD
    `;

    if (filter.search) {
      selectStr = `
      *, 
      salons!inner(
        id, 
        name, 
        owner_id, 
        phone,
        address,
        cities(name),
        districts(name),
        profiles:profiles!owner_id(full_name, email, phone)
      ), 
      subscriptions(
        current_period_end, 
        status, 
        plan_id,
        subscription_plans(*)
      )
    `;
    }

    let query = supabase.from("payment_history").select(selectStr, { count: 'exact' });

    if (filter.salonId) query = query.eq("salon_id", filter.salonId);
    if (filter.status && filter.status !== 'ALL') query = query.eq("status", filter.status);
    if (filter.method && filter.method !== 'ALL') {
        if (filter.method === 'TRIAL') {
            query = query.or('payment_method.eq.TRIAL,amount.eq.0');
        } else {
            query = query.eq("payment_method", filter.method);
        }
    }
    if (filter.startDate) query = query.gte("created_at", filter.startDate);
    if (filter.search) {
      // payment_history joined with salons
      // Since supabase JS currently doesn't support complex embedded OR searches easily on joined tables
      // via `ilike`, we apply it on `salons.name`.
      // Using foreign table filtering notation:
      // Note: Supabase JS filtering on joined columns correctly uses `salons.name`
      query = query.ilike('salons.name', `%${filter.search}%`);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;

    const transactions = data || [];
    const stats = transactions.reduce(
      (acc, t: any) => {
        const amount = Number(t.amount) || 0;
        if (t.status === 'SUCCESS') {
          acc.totalRevenue += amount;
          acc.successCount += 1;
        } else if (t.status === 'PENDING') {
          acc.pendingCount += 1;
        } else if (t.status === 'FAILED' || t.status === 'CANCELLED') {
          acc.failedCount += 1;
        }
        return acc;
      },
      { totalRevenue: 0, successCount: 0, pendingCount: 0, failedCount: 0 }
    );

    return {
      transactions,
      totalCount: count || 0,
      stats,
=======
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
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
    };
  },

  /**
<<<<<<< HEAD
   * Admin: Get overall finance stats
   */
  async getFinanceStats(supabase: SupabaseClient = defaultSupabase) {
    const { data: payments, error } = await supabase
      .from("payment_history")
      .select("amount, status, payment_method, subscriptions(current_period_end)");

    if (error) throw error;

    const stats = {
        total: payments.length,
        pending: payments.filter(p => p.status === 'PENDING').length,
        revenue: payments
            .filter(p => p.status === 'SUCCESS' && p.payment_method !== 'TRIAL')
            .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0),
        trialActive: payments.filter(p => (p.payment_method === 'TRIAL' || p.amount === 0) && p.subscriptions?.[0] && new Date(p.subscriptions[0].current_period_end) > new Date()).length
    };

    return stats;
  },

  /**
=======
>>>>>>> ddf287bab222644b77b8b129f7ecabcd4d3010d8
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
