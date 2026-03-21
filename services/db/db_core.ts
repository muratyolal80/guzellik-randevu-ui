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

export const MasterDataService = {
  /**
   * Get all cities (81 Turkish provinces)
   */
  async getCities(supabase: SupabaseClient = defaultSupabase): Promise<City[]> {
    const { data, error } = await supabase
      .from("cities")
      .select("*")
      .order("name");

    if (error) throw error;
    return data || [];
  },

  /**
   * Get districts for a specific city
   */
  async getDistrictsByCity(
    cityId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<District[]> {
    const { data, error } = await supabase
      .from("districts")
      .select("*")
      .eq("city_id", cityId)
      .order("name");

    if (error) throw error;
    return data || [];
  },

  /**
   * Get all salon types (Kuaför, Berber, SPA, etc.)
   */
  async getSalonTypes(
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<SalonType[]> {
    const { data, error } = await supabase
      .from("salon_types")
      .select("*")
      .order("name");

    if (error) throw error;
    return data || [];
  },

  /**
   * Create new salon type
   */
  async createSalonType(
    type: Omit<SalonType, "id" | "created_at">,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<SalonType> {
    const { data, error } = await supabase
      .from("salon_types")
      .insert(type)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update salon type
   */
  async updateSalonType(
    id: string,
    updates: Partial<SalonType>,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<SalonType> {
    const { data, error } = await supabase
      .from("salon_types")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete salon type
   */
  async deleteSalonType(
    id: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    const { error } = await supabase.from("salon_types").delete().eq("id", id);

    if (error) throw error;
  },

  /**
   * Get all service categories (Saç, Tırnak, Makyaj, etc.)
   */
  async getServiceCategories(
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<ServiceCategory[]> {
    const { data, error } = await supabase
      .from("service_categories")
      .select("*")
      .order("name");

    if (error) throw error;
    return data || [];
  },

  /**
   * Create new service category
   */
  async createServiceCategory(
    category: Omit<ServiceCategory, "id" | "created_at">,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<ServiceCategory> {
    const { data, error } = await supabase
      .from("service_categories")
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update service category
   */
  async updateServiceCategory(
    id: string,
    updates: Partial<ServiceCategory>,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<ServiceCategory> {
    const { data, error } = await supabase
      .from("service_categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete service category
   */
  async deleteServiceCategory(
    id: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    const { error } = await supabase
      .from("service_categories")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  /**
   * Get global services by category
   */
  async getGlobalServicesByCategory(
    categoryId: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<GlobalService[]> {
    const { data, error } = await supabase
      .from("global_services")
      .select("*")
      .eq("category_id", categoryId)
      .order("name");

    if (error) throw error;
    return data || [];
  },

  /**
   * Get all global services
   */
  async getAllGlobalServices(
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<GlobalService[]> {
    const { data, error } = await supabase
      .from("global_services")
      .select("*")
      .order("name");

    if (error) throw error;
    return data || [];
  },

  /**
   * Get service categories for selected salon types
   * Returns unique categories associated with the given salon type IDs
   */
  async getServiceCategoriesForSalonTypes(
    typeIds: string[],
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<ServiceCategory[]> {
    if (!typeIds || typeIds.length === 0) return [];

    // Filter out invalid IDs
    const validIds = typeIds.filter((id) => id && id !== "");
    if (validIds.length === 0) return [];

    const { data, error } = await supabase
      .from("salon_type_categories")
      .select(
        `
        category:service_categories(*)
      `,
      )
      .in("salon_type_id", validIds);

    if (error) {
      console.error("Error fetching categories for salon types:", error);
      throw error;
    }

    // Extract and deduplicate categories
    const uniqueCategories = new Map<string, ServiceCategory>();
    data?.forEach((item: any) => {
      if (item.category) {
        uniqueCategories.set(item.category.id, item.category);
      }
    });

    return Array.from(uniqueCategories.values());
  },

  /**
   * Get global services by category IDs
   */
  async getGlobalServicesByCategories(
    categoryIds: string[],
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<GlobalService[]> {
    if (!categoryIds || categoryIds.length === 0) return [];

    const { data, error } = await supabase
      .from("global_services")
      .select("*")
      .in("category_id", categoryIds)
      .order("name");

    if (error) {
      console.error("Error fetching services by categories:", error);
      throw error;
    }

    return data || [];
  },

  /**
   * Create new global service
   */
  async createGlobalService(
    service: Omit<GlobalService, "id" | "created_at">,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<GlobalService> {
    const { data, error } = await supabase
      .from("global_services")
      .insert(service)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update global service
   */
  async updateGlobalService(
    id: string,
    updates: Partial<GlobalService>,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<GlobalService> {
    const { data, error } = await supabase
      .from("global_services")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete global service
   */
  async deleteGlobalService(
    id: string,
    supabase: SupabaseClient = defaultSupabase,
  ): Promise<void> {
    const { error } = await supabase
      .from("global_services")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  /**
   * Get navigation menu data (for header)
   */
  async getNavMenuData(supabase: SupabaseClient = defaultSupabase) {
    const [salonTypes, categories, allServices] = await Promise.all([
      this.getSalonTypes(supabase),
      this.getServiceCategories(supabase),
      this.getAllGlobalServices(supabase),
    ]);

    // Group services by category ID
    const servicesByCatId: Record<string, string[]> = {};
    allServices.forEach((service) => {
      if (!servicesByCatId[service.category_id]) {
        servicesByCatId[service.category_id] = [];
      }
      servicesByCatId[service.category_id].push(service.name);
    });

    return { salonTypes, categories, servicesByCatId };
  },
};

export const GlobalSearchService = {
  /**
   * Search across salons, services and cities
   */
  async search(query: string, supabase: SupabaseClient = defaultSupabase) {
    if (!query || query.length < 2) return { salons: [], services: [] };

    const [salonsResp, servicesResp] = await Promise.all([
      supabase
        .from("salons")
        .select("id, name, image, slug, city:cities(name)")
        .ilike("name", `%${query}%`)
        .eq("status", "APPROVED")
        .limit(5),
      supabase
        .from("global_services")
        .select("id, name, slug, category:service_categories(name)")
        .ilike("name", `%${query}%`)
        .limit(5),
    ]);

    const salons = (salonsResp.data || []).map((s: any) => ({
      ...s,
      name: String(s.name || ""),
      city_name:
        typeof s.city === "object"
          ? String(s.city?.name || "Belirtilmemiş")
          : String(s.city || "Belirtilmemiş"),
    }));

    const services = (servicesResp.data || []).map((s: any) => ({
      ...s,
      name: String(s.name || ""),
      category_name:
        typeof s.category === "object"
          ? String(s.category?.name || "Diğer")
          : String(s.category || "Diğer"),
    }));

    return { salons, services };
  },
};

export const PlatformService = {
  /**
   * Get platform settings by key
   */
  async getSetting(key: string, supabase: SupabaseClient = defaultSupabase) {
    const { data, error } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();

    if (error) throw error;
    return data?.value;
  },

  /**
   * Update platform setting
   */
  async updateSetting(
    key: string,
    value: any,
    supabase: SupabaseClient = defaultSupabase,
  ) {
    const { error } = await supabase
      .from("platform_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() });

    if (error) throw error;
  },
};
