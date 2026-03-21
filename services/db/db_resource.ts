import { supabase as defaultSupabase } from "@/lib/supabase";
import { type SupabaseClient } from "@supabase/supabase-js";
import type { SalonResource } from "@/types";

export const ResourceService = {
  /**
   * Get all resources for a salon
   */
  async getResourcesBySalon(
    salonId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<SalonResource[]> {
    const { data, error } = await supabase
      .from("salon_resources")
      .select("*")
      .eq("salon_id", salonId)
      .order("name");

    if (error) throw error;
    return data || [];
  },

  /**
   * Create a new resource
   */
  async createResource(
    resource: Omit<SalonResource, 'id' | 'created_at' | 'updated_at'>,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<SalonResource> {
    const { data, error } = await supabase
      .from("salon_resources")
      .insert(resource)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a resource
   */
  async updateResource(
    id: string,
    updates: Partial<SalonResource>,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<SalonResource> {
    const { data, error } = await supabase
      .from("salon_resources")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a resource
   */
  async deleteResource(
    id: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    const { error } = await supabase
      .from("salon_resources")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
};
