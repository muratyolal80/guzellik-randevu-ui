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

export const SupportService = {
  /**
   * Get all tickets for a user
   */
  async getTickets(
    userId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<SupportTicket[]> {
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Create a new ticket with initial message
   */
  async createTicket(
    userId: string,
    subject: string,
    category: string,
    message: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<SupportTicket> {
    const { data: ticket, error: ticketError } = await supabase
      .from("support_tickets")
      .insert({
        user_id: userId,
        subject,
        category,
        message,
        status: "OPEN",
      })
      .select()
      .single();

    if (ticketError) throw ticketError;

    // Add initial message to thread
    const { error: msgError } = await supabase.from("ticket_messages").insert({
      ticket_id: ticket.id,
      sender_id: userId,
      sender_role: "CUSTOMER",
      content: message,
    });

    if (msgError)
      console.warn("Initial message creation failed:", msgError.message);

    return ticket;
  },

  /**
   * Get ticket by ID
   */
  async getTicketById(
    ticketId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<SupportTicket | null> {
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("id", ticketId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get messages for a specific ticket
   */
  async getTicketMessages(
    ticketId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<TicketMessage[]> {
    const { data, error } = await supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get all tickets in the system (Admin only)
   */
  async getAllTickets(
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<SupportTicket[]> {
    const { data, error } = await supabase
      .from("support_tickets")
      .select(
        `
        *,
        user:profiles(full_name, email)
      `,
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Add message to ticket (Reply)
   */
  async addMessage(
    ticketId: string,
    senderId: string,
    senderRole: string,
    message: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    const { error: msgError } = await supabase.from("ticket_messages").insert({
      ticket_id: ticketId,
      sender_id: senderId,
      sender_role: senderRole,
      content: message,
    });

    if (msgError) throw msgError;

    // Update ticket status mainly if Admin replies or User re-opens
    // const newStatus = senderRole.includes("ADMIN") ? "IN_PROGRESS" : "OPEN";

    // Only update updated_at always, status conditionally
    // For simplicity, let's bump updated_at
    await supabase
      .from("support_tickets")
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq("id", ticketId);
  },

  /**
   * Reply to a ticket as an Admin (Legacy support)
   */
  async replyToTicket(
    ticketId: string,
    adminId: string,
    message: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    return this.addMessage(ticketId, adminId, "SUPER_ADMIN", message, supabase);
  },

  /**
   * Resolve/Close a ticket
   */
  async resolveTicket(
    ticketId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    // Try to resolve using safe RPC (for customers)
    const { error: rpcError } = await supabase.rpc("resolve_own_ticket", {
      p_ticket_id: ticketId,
    });

    if (rpcError) {
      console.warn(
        "RPC resolution failed, falling back to direct update:",
        rpcError,
      );
      // Fallback for Admin or if logic changes
      const { error } = await supabase
        .from("support_tickets")
        .update({ status: "RESOLVED", updated_at: new Date().toISOString() })
        .eq("id", ticketId);

      if (error) throw error;
    }
  },
};

export const IYSService = {
  /**
   * Log SMS send
   */
  async logSMS(
    log: Omit<IYSLog, "id" | "created_at">,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<IYSLog> {
    const { data, error } = await supabase
      .from("iys_logs")
      .insert(log)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get SMS logs by phone
   */
  async getLogsByPhone(
    phone: string,
    limit: number = 50,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<IYSLog[]> {
    const { data, error } = await supabase
      .from("iys_logs")
      .select("*")
      .eq("phone", phone)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  /**
   * Get all IYS logs (admin)
   */
  async getAllLogs(
    limit: number = 100,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<IYSLog[]> {
    const { data, error } = await supabase
      .from("iys_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },
};

export const NotificationService = {
  /**
   * Get notifications for a user
   */
  async getNotifications(
    userId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<Notification[]> {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Mark notification as read
   */
  async markAsRead(
    id: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) throw error;
  },

  /**
   * Send notification to user
   */
  async sendNotification(
    notification: Omit<Notification, "id" | "created_at" | "is_read">,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<Notification> {
    // Map TypeScript field names to actual DB column names
    const { content, link, ...rest } = notification as any;
    const dbPayload: Record<string, unknown> = {
      ...rest,
      message: content ?? (notification as any).message,
      action_url: link ?? (notification as any).action_url,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("notifications")
      .insert(dbPayload)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(
    userId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) throw error;
  },
};

export const AuditLogService = {
  /**
   * Create a new audit log entry
   */
  async logAction(log: {
    salon_id: string;
    user_id?: string;
    action: string;
    resource_type: string;
    resource_id?: string;
    changes?: any;
    ip_address?: string;
    user_agent?: string;
    supabase?: SupabaseClient;
  }): Promise<void> {
    const { supabase: passedSupabase, ...logData } = log as any;
    const client = passedSupabase || defaultSupabase;
    const { error } = await client.from("audit_logs").insert(logData);

    if (error) {
      console.error("[AuditLogService] Error creating audit log:", error);
    }
  },

  /**
   * Get audit logs for a salon
   */
  async getLogsBySalon(
    salonId: string,
    limit: number = 100,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<any[]> {
    const { data, error } = await supabase
      .from("audit_logs")
      .select(
        `
        *,
        user:profiles(full_name, email)
      `,
      )
      .eq("salon_id", salonId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },
};
