import { supabase as defaultSupabase } from "@/lib/supabase";
import { type SupabaseClient } from "@supabase/supabase-js";
import type { SalonCustomer, CustomerNote, Profile } from "@/types";

export const CustomerService = {
  /**
   * Get all unique customers for a salon
   */
  async getCustomersBySalon(
    salonId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<SalonCustomer[]> {
    // 1. Fetch from salon_customers table (syncing logic should populate this)
    // For now, we fetch joined with profiles
    const { data, error } = await supabase
      .from("salon_customers")
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq("salon_id", salonId)
      .order("last_visit", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Sync salon_customers from appointments (to populate the table)
   * This should be called periodically or after appointments are completed
   */
  async syncSalonCustomers(
    salonId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    // This logic would ideally be a DB function/trigger, 
    // but for the MVP we can do it here.
    const { data: appointments } = await supabase
      .from("appointments")
      .select("customer_id, price")
      .eq("salon_id", salonId)
      .eq("status", "COMPLETED");

    if (!appointments) return;

    // Aggregate by customer_id
    const customerStats = appointments.reduce((acc: any, curr) => {
      if (!acc[curr.customer_id]) {
        acc[curr.customer_id] = { count: 0, spent: 0 };
      }
      acc[curr.customer_id].count += 1;
      acc[curr.customer_id].spent += (curr.price || 0);
      return acc;
    }, {});

    for (const [customerId, stats] of Object.entries(customerStats) as any) {
      await supabase.from("salon_customers").upsert({
        salon_id: salonId,
        customer_id: customerId,
        total_appointments: stats.count,
        total_spent: stats.spent,
        updated_at: new Date().toISOString()
      }, { onConflict: 'salon_id, customer_id' });
    }
  },

  /**
   * Get notes for a customer in a salon
   */
  async getCustomerNotes(
    salonId: string,
    customerId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<CustomerNote[]> {
    const { data, error } = await supabase
      .from("customer_notes")
      .select(`
        *,
        staff:staff(name)
      `)
      .eq("salon_id", salonId)
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    return (data || []).map(n => ({
        ...n,
        staff_name: n.staff?.name
    }));
  },

  /**
   * Add a note for a customer
   */
  async addCustomerNote(
    note: Omit<CustomerNote, 'id' | 'created_at' | 'updated_at'>,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<CustomerNote> {
    const { data, error } = await supabase
      .from("customer_notes")
      .insert(note)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update loyalty points
   */
  async updateLoyaltyPoints(
    salonId: string,
    customerId: string,
    points: number,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    const { error } = await supabase
      .from("salon_customers")
      .update({ loyalty_points: points })
      .eq("salon_id", salonId)
      .eq("customer_id", customerId);

    if (error) throw error;
  }
};
