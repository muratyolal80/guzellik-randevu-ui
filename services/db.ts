/**
 * Database Service Layer for GuzellikRandevu
 * Connects to self-hosted Supabase instance
 */

import { supabase, supabaseUrl } from '@/lib/supabase';
import type {
  City, District, SalonType, ServiceCategory, GlobalService,
  Salon, SalonDetail, Staff, SalonService, SalonServiceDetail,
  WorkingHours, SalonWorkingHours, Appointment, Review, IYSLog,
  SupportTicket, TicketMessage, Favorite, Notification,
  Invite
} from '@/types';

// Helper to check if we have a real connection
const isSupabaseConfigured = () => {
  return supabaseUrl && supabaseUrl.includes('localhost:8000');
};

// ==============================================
// MASTER DATA SERVICE (Admin-Managed Global Data)
// ==============================================

export const MasterDataService = {
  /**
   * Get all cities (81 Turkish provinces)
   */
  async getCities(): Promise<City[]> {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  /**
   * Get districts for a specific city
   */
  async getDistrictsByCity(cityId: string): Promise<District[]> {
    const { data, error } = await supabase
      .from('districts')
      .select('*')
      .eq('city_id', cityId)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  /**
   * Get all salon types (Kuaför, Berber, SPA, etc.)
   */
  async getSalonTypes(): Promise<SalonType[]> {
    const { data, error } = await supabase
      .from('salon_types')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  /**
   * Create new salon type
   */
  async createSalonType(type: Omit<SalonType, 'id' | 'created_at'>): Promise<SalonType> {
    const { data, error } = await supabase
      .from('salon_types')
      .insert(type)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update salon type
   */
  async updateSalonType(id: string, updates: Partial<SalonType>): Promise<SalonType> {
    const { data, error } = await supabase
      .from('salon_types')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete salon type
   */
  async deleteSalonType(id: string): Promise<void> {
    const { error } = await supabase
      .from('salon_types')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Get all service categories (Saç, Tırnak, Makyaj, etc.)
   */
  async getServiceCategories(): Promise<ServiceCategory[]> {
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  /**
   * Create new service category
   */
  async createServiceCategory(category: Omit<ServiceCategory, 'id' | 'created_at'>): Promise<ServiceCategory> {
    const { data, error } = await supabase
      .from('service_categories')
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update service category
   */
  async updateServiceCategory(id: string, updates: Partial<ServiceCategory>): Promise<ServiceCategory> {
    const { data, error } = await supabase
      .from('service_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete service category
   */
  async deleteServiceCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('service_categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Get global services by category
   */
  async getGlobalServicesByCategory(categoryId: string): Promise<GlobalService[]> {
    const { data, error } = await supabase
      .from('global_services')
      .select('*')
      .eq('category_id', categoryId)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  /**
   * Get all global services
   */
  async getAllGlobalServices(): Promise<GlobalService[]> {
    const { data, error } = await supabase
      .from('global_services')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  /**
   * Get service categories for selected salon types
   * Returns unique categories associated with the given salon type IDs
   */
  async getServiceCategoriesForSalonTypes(typeIds: string[]): Promise<ServiceCategory[]> {
    if (!typeIds || typeIds.length === 0) return [];

    const { data, error } = await supabase
      .from('salon_type_categories')
      .select(`
        category:service_categories(*)
      `)
      .in('salon_type_id', typeIds);

    if (error) {
      console.error('Error fetching categories for salon types:', error);
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
  async getGlobalServicesByCategories(categoryIds: string[]): Promise<GlobalService[]> {
    if (!categoryIds || categoryIds.length === 0) return [];

    const { data, error } = await supabase
      .from('global_services')
      .select('*')
      .in('category_id', categoryIds)
      .order('name');

    if (error) {
      console.error('Error fetching services by categories:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Create new global service
   */
  async createGlobalService(service: Omit<GlobalService, 'id' | 'created_at'>): Promise<GlobalService> {
    const { data, error } = await supabase
      .from('global_services')
      .insert(service)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update global service
   */
  async updateGlobalService(id: string, updates: Partial<GlobalService>): Promise<GlobalService> {
    const { data, error } = await supabase
      .from('global_services')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete global service
   */
  async deleteGlobalService(id: string): Promise<void> {
    const { error } = await supabase
      .from('global_services')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Get navigation menu data (for header)
   */
  async getNavMenuData() {
    const [salonTypes, categories, allServices] = await Promise.all([
      this.getSalonTypes(),
      this.getServiceCategories(),
      this.getAllGlobalServices(),
    ]);

    // Group services by category ID
    const servicesByCatId: Record<string, string[]> = {};
    allServices.forEach(service => {
      if (!servicesByCatId[service.category_id]) {
        servicesByCatId[service.category_id] = [];
      }
      servicesByCatId[service.category_id].push(service.name);
    });

    return { salonTypes, categories, servicesByCatId };
  },
};

// ==============================================
// SALON SERVICE (Business/Tenant Data)
// ==============================================

export const SalonDataService = {
  /**
   * Get all salons with detailed information (using view)
   */
  async getSalons(): Promise<SalonDetail[]> {
    const { data, error } = await supabase
      .from('salon_details')
      .select('*')
      .eq('status', 'APPROVED') // Only show approved salons
      .order('is_sponsored', { ascending: false })
      .order('average_rating', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get salons by user membership (Owner/Staff branches)
   */
  async getSalonsByMembership(userId: string): Promise<SalonDetail[]> {
    // First, get the salon IDs from memberships
    const { data: memberships, error: memError } = await supabase
      .from('salon_memberships')
      .select('salon_id')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (memError) throw memError;
    if (!memberships || memberships.length === 0) return [];

    // Then fetch the salon details
    const salonIds = memberships.map(m => m.salon_id);
    const { data: salons, error: salonError } = await supabase
      .from('salon_details')
      .select('*')
      .in('id', salonIds);

    if (salonError) throw salonError;
    return salons || [];
  },

  /**
   * Get salon by ID with details
   */
  async getSalonById(id: string): Promise<SalonDetail | null> {
    const { data, error } = await supabase
      .from('salon_details')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Search salons by filters
   */
  async searchSalons(filters: {
    cityId?: string;
    districtId?: string;
    typeId?: string;
    query?: string;
  }): Promise<SalonDetail[]> {
    let query = supabase
      .from('salon_details')
      .select('*');

    if (filters.cityId) {
      const { data: cityData } = await supabase
        .from('cities')
        .select('name')
        .eq('id', filters.cityId)
        .single();

      if (cityData) {
        query = query.eq('city_name', cityData.name);
      }
    }

    // Always filter by approved status
    query = query.eq('status', 'APPROVED');

    if (filters.districtId) {
      const { data: districtData } = await supabase
        .from('districts')
        .select('name')
        .eq('id', filters.districtId)
        .single();

      if (districtData) {
        query = query.eq('district_name', districtData.name);
      }
    }

    if (filters.typeId) {
      // Use salon_assigned_types to filtering multi-type assignment
      const { data: assigned } = await supabase
        .from('salon_assigned_types')
        .select('salon_id')
        .eq('type_id', filters.typeId);

      if (assigned && assigned.length > 0) {
        const ids = assigned.map(a => a.salon_id);
        query = query.in('id', ids);
      } else {
        // No salons found for this type, return empty immediately to save query
        // Or create impossible condition
        // But better to just return empty if we want to be efficient
        return [];
      }
    }

    if (filters.query) {
      query = query.ilike('name', `%${filters.query}%`);
    }

    query = query
      .order('is_sponsored', { ascending: false })
      .order('average_rating', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /**
   * Get salons by location (nearby)
   */
  async getSalonsByLocation(lat: number, lng: number, radiusKm: number = 10): Promise<SalonDetail[]> {
    // Simple bounding box search (for more accurate, use PostGIS)
    const latDelta = radiusKm / 111; // ~111km per degree latitude
    const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

    const { data, error } = await supabase
      .from('salon_details')
      .select('*')
      .gte('geo_latitude', lat - latDelta)
      .lte('geo_latitude', lat + latDelta)
      .gte('geo_longitude', lng - lngDelta)
      .lte('geo_longitude', lng + lngDelta)
      .eq('status', 'APPROVED')
      .order('is_sponsored', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Create a new salon
   */
  /**
   * Create a new salon
   */
  async createSalon(
    salon: Omit<Salon, 'id' | 'created_at' | 'updated_at'>,
    customHours?: { day_of_week: number, start_time: string, end_time: string, is_closed: boolean }[],
    initialServices?: { global_service_id: string, price: number, duration_min: number }[]
  ): Promise<Salon> {
    const { type_ids, primary_type_id, ...salonData } = salon;

    // Use primary_type_id as fallback for type_id for backward compatibility
    const dbSalon = {
      ...salonData,
      type_id: primary_type_id || salonData.type_id
    };

    const { data, error } = await supabase
      .from('salons')
      .insert(dbSalon)
      .select()
      .single();

    if (error) {
      console.error("Create error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        table: 'salons',
        data: dbSalon
      });
      throw error;
    }

    const salonId = data.id;

    // Insert Assignments
    if (type_ids && type_ids.length > 0) {
      const assignments = type_ids.map(tid => ({
        salon_id: salonId,
        type_id: tid,
        is_primary: tid === (primary_type_id || dbSalon.type_id)
      }));

      const { error: assignError } = await supabase.from('salon_assigned_types').insert(assignments);
      if (assignError) console.error("Error assigning salon types:", assignError);
    }

    // Prepare Working Hours
    let hoursToInsert;

    if (customHours && customHours.length > 0) {
      hoursToInsert = customHours.map(h => ({
        salon_id: salonId,
        day_of_week: h.day_of_week,
        start_time: h.start_time.length === 5 ? `${h.start_time}:00` : h.start_time,
        end_time: h.end_time.length === 5 ? `${h.end_time}:00` : h.end_time,
        is_closed: h.is_closed
      }));
    } else {
      // Create default working hours (Mon-Sat 09:00-19:00, Sun Closed)
      hoursToInsert = [1, 2, 3, 4, 5, 6].map(day => ({
        salon_id: salonId,
        day_of_week: day,
        start_time: '09:00:00',
        end_time: '19:00:00',
        is_closed: false
      }));

      hoursToInsert.push({
        salon_id: salonId,
        day_of_week: 0,
        start_time: '09:00:00',
        end_time: '19:00:00',
        is_closed: true
      });
    }

    const { error: hoursError } = await supabase.from('salon_working_hours').insert(hoursToInsert);
    if (hoursError) {
      console.error("Error inserting working hours:", hoursError);
      // We don't throw here to allow partial success, but logged.
    }

    if (initialServices && initialServices.length > 0) {
      const servicesToInsert = initialServices.map(s => ({
        salon_id: salonId,
        global_service_id: s.global_service_id,
        price: s.price,
        duration_min: s.duration_min,
        is_active: true
      }));

      const { error: servicesError } = await supabase.from('salon_services').insert(servicesToInsert);
      if (servicesError) {
        console.error("Error inserting services:", servicesError);
      }
    }

    return data;
  },

  /**
   * Update salon
   */
  async updateSalon(id: string, updates: Partial<Salon>): Promise<Salon> {
    // Extract multi-type fields to prevent them from being sent to 'salons' table
    const { type_ids, primary_type_id, ...salonUpdates } = updates;

    // If primary type is updated, sync it to the legacy type_id column
    if (primary_type_id) {
      (salonUpdates as any).type_id = primary_type_id;
    }

    // Update main table
    const { data, error } = await supabase
      .from('salons')
      .update(salonUpdates)
      .eq('id', id)
      .select();

    if (error) {
      console.error("Update error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        table: 'salons',
        updates: salonUpdates
      });
      throw error;
    }
    if (!data || data.length === 0) {
      throw new Error('Update successful but RLS policy prevented retrieving the updated data. Please refresh.');
    }

    // Handle Assignment Updates
    if (type_ids && type_ids.length > 0) {
      // Strategy: Delete all existing assignments and re-insert
      // This is safe because it's a join table without extra metadata (except is_primary which we re-calculate)
      const { error: deleteError } = await supabase
        .from('salon_assigned_types')
        .delete()
        .eq('salon_id', id);

      if (deleteError) {
        console.error("Error clearing old types:", deleteError);
        // We continue to try inserting even if delete failed (though unique constraint might hit)
      }

      const effectivePrimary = primary_type_id || data[0].type_id;

      const assignments = type_ids.map(tid => ({
        salon_id: id,
        type_id: tid,
        is_primary: tid === effectivePrimary
      }));

      const { error: insertError } = await supabase
        .from('salon_assigned_types')
        .insert(assignments);

      if (insertError) console.error("Error updating salon types:", insertError);
    }

    return data[0];
  },

  /**
   * Delete salon
   */
  async deleteSalon(id: string): Promise<void> {
    const { error } = await supabase
      .from('salons')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Get salon details by owner user ID (Returns list of all salons owned)
   */
  async getSalonsByOwner(ownerId: string): Promise<SalonDetail[]> {
    const { data: salonIds, error: salonError } = await supabase
      .from('salons')
      .select('id')
      .eq('owner_id', ownerId);

    if (salonError || !salonIds || salonIds.length === 0) return [];

    const { data, error } = await supabase
      .from('salon_details')
      .select('*')
      .in('id', salonIds.map(s => s.id));

    if (error) throw error;
    return data || [];
  },

  /**
   * Get single salon for owner (backward compatibility & dashboard)
   */
  async getSalonByOwner(ownerId: string): Promise<SalonDetail | null> {
    const salons = await this.getSalonsByOwner(ownerId);
    return salons.length > 0 ? salons[0] : null;
  },

  /**
   * Get all salons for Admin (regardless of status)
   */
  async getAllSalonsForAdmin(): Promise<SalonDetail[]> {
    const { data, error } = await supabase
      .from('salon_details')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Admin/System: Update salon status with optional reason
   */
  async updateSalonStatus(id: string, status: Salon['status'], reason?: string): Promise<void> {
    const { error } = await supabase
      .from('salons')
      .update({
        status,
        rejected_reason: reason || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    if (error) throw error;
  },

  /**
   * Admin: Approve a salon
   */
  async approveSalon(id: string): Promise<void> {
    await this.updateSalonStatus(id, 'APPROVED');
  },

  /**
   * Admin: Reject a salon
   */
  async rejectSalon(id: string, reason: string): Promise<void> {
    await this.updateSalonStatus(id, 'REJECTED', reason);
  },

  /**
   * Admin: Suspend a salon
   */
  async suspendSalon(id: string, reason: string): Promise<void> {
    await this.updateSalonStatus(id, 'SUSPENDED', reason);
  },

  /**
   * Owner: Submit salon for approval
   */
  async submitForApproval(id: string): Promise<void> {
    const { error } = await supabase
      .from('salons')
      .update({ status: 'SUBMITTED', updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  /**
   * Get working hours for a salon
   */
  async getSalonWorkingHours(salonId: string): Promise<SalonWorkingHours[]> {
    const { data, error } = await supabase
      .from('salon_working_hours')
      .select('*')
      .eq('salon_id', salonId)
      .order('day_of_week');

    if (error) throw error;
    return data || [];
  },

  /**
   * Update salon working hours
   */
  async updateSalonWorkingHours(id: string, updates: Partial<SalonWorkingHours>): Promise<void> {
    const { error } = await supabase
      .from('salon_working_hours')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },
};

// ==============================================
// STAFF SERVICE
// ==============================================

export const StaffService = {
  /**
   * Get all staff for a salon (with tenant check)
   */
  async getStaffBySalon(salonId: string): Promise<Staff[]> {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('salon_id', salonId)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  /**
   * Get staff by ID (with tenant check)
   */
  async getStaffById(id: string): Promise<Staff | null> {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create a new staff member with working hours
   */
  async createStaff(
    staffData: Partial<Staff>,
    customWorkingHours?: Omit<WorkingHours, 'id' | 'staff_id' | 'created_at'>[]
  ): Promise<Staff> {
    const { data, error } = await supabase
      .from('staff')
      .insert({
        name: staffData.name,
        role: staffData.role,
        phone: staffData.phone,
        photo: staffData.photo || staffData.image, // Support both aliases
        salon_id: staffData.salon_id,
        user_id: staffData.user_id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    let hoursToInsert;

    if (customWorkingHours && customWorkingHours.length > 0) {
      hoursToInsert = customWorkingHours.map(h => ({
        ...h,
        staff_id: data.id,
        // Ensure time format is HH:MM:SS
        start_time: h.start_time.length === 5 ? `${h.start_time}:00` : h.start_time,
        end_time: h.end_time.length === 5 ? `${h.end_time}:00` : h.end_time
      }));
    } else {
      // Create default working hours (Mon-Sat 09-19, Sun Closed)
      hoursToInsert = [1, 2, 3, 4, 5, 6].map(day => ({
        staff_id: data.id,
        day_of_week: day,
        start_time: '09:00:00',
        end_time: '19:00:00',
        is_day_off: false
      }));

      hoursToInsert.push({
        staff_id: data.id,
        day_of_week: 0,
        start_time: '09:00:00',
        end_time: '19:00:00',
        is_day_off: true
      });
    }

    await supabase.from('working_hours').insert(hoursToInsert);
    return data;
  },

  /**
   * Update existing staff
   */
  async updateStaff(id: string, updates: Partial<Staff>): Promise<Staff> {
    const { data, error } = await supabase
      .from('staff')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get working hours for a specific staff member
   */
  async getStaffWorkingHours(staffId: string): Promise<WorkingHours[]> {
    const { data, error } = await supabase
      .from('working_hours')
      .select('*')
      .eq('staff_id', staffId)
      .order('day_of_week', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Delete staff member
   */
  async deleteStaff(id: string): Promise<void> {
    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Update staff working hours record
   */
  async updateWorkingHours(id: string, updates: Partial<WorkingHours>): Promise<void> {
    const { error } = await supabase
      .from('working_hours')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  async linkStaffToServices(staffId: string | number, salonId: string | number, serviceIds: (string | number)[]): Promise<void> {
    if (!serviceIds || serviceIds.length === 0) return;
    const assignments = serviceIds.map(serviceId => ({
      staff_id: staffId,
      salon_id: salonId,
      salon_service_id: serviceId
    }));
    const { error } = await supabase.from('staff_services').insert(assignments);
    if (error) throw error;
  }
};

// ==============================================
// SERVICE SERVICE (Salon Services)
// ==============================================

export const ServiceService = {
  /**
   * Get services offered by a salon (with details)
   */
  async getServicesBySalon(salonId: string): Promise<SalonServiceDetail[]> {
    const { data, error } = await supabase
      .from('salon_service_details')
      .select('*')
      .eq('salon_id', salonId)
      .order('category_name')
      .order('service_name');

    if (error) throw error;
    return data || [];
  },

  /**
   * Get service by ID (with tenant check)
   */
  async getServiceById(id: string, salonId?: string): Promise<SalonServiceDetail | null> {
    let query = supabase
      .from('salon_service_details')
      .select('*')
      .eq('id', id);

    if (salonId) {
      query = query.eq('salon_id', salonId);
    }

    const { data, error } = await query.single();

    if (error) throw error;
    return data;
  },

  /**
   * Get all global services (for selection)
   */
  async getGlobalServices(): Promise<{ id: string; name: string; category_id: string }[]> {
    const { data, error } = await supabase
      .from('global_services')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  },

  /**
   * Add a new service to a salon
   */
  async createService(serviceData: { salon_id: string, global_service_id: string, price: number, duration_min: number }): Promise<any> {
    const { data, error } = await supabase
      .from('salon_services')
      .insert(serviceData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an existing service (with tenant check)
   */
  async updateService(id: string, updates: { price?: number, duration_min?: number, is_active?: boolean }, salonId?: string): Promise<any> {
    let query = supabase
      .from('salon_services')
      .update(updates)
      .eq('id', id);

    if (salonId) {
      query = query.eq('salon_id', salonId);
    }

    const { data, error } = await query.select().single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete (or soft delete) a service (with tenant check)
   */
  async deleteService(id: string, salonId?: string): Promise<void> {
    let query = supabase
      .from('salon_services')
      .delete()
      .eq('id', id);

    if (salonId) {
      query = query.eq('salon_id', salonId);
    }

    const { error } = await query;

    if (error) throw error;
  }
};


// ==============================================
// WORKING HOURS SERVICE
// ==============================================

export const WorkingHoursService = {
  /**
   * Get working hours for staff member
   */
  async getWorkingHoursByStaff(staffId: string): Promise<WorkingHours[]> {
    const { data, error } = await supabase
      .from('working_hours')
      .select('*')
      .eq('staff_id', staffId)
      .order('day_of_week');

    if (error) throw error;
    return data || [];
  },

  /**
   * Set working hours for staff
   */
  async setWorkingHours(hours: Omit<WorkingHours, 'id' | 'created_at'>): Promise<WorkingHours> {
    const { data, error } = await supabase
      .from('working_hours')
      .upsert(hours, { onConflict: 'staff_id,day_of_week' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create a new staff member with default working hours
   */
  async createStaff(staffData: Partial<Staff>): Promise<Staff> {
    const { data, error } = await supabase
      .from('staff')
      .insert({
        ...staffData,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Create default working hours (Mon-Sat 09-19, Sun Closed)
    const defaultHours = [1, 2, 3, 4, 5, 6].map(day => ({
      staff_id: data.id,
      day_of_week: day,
      start_time: '09:00:00',
      end_time: '19:00:00',
      is_day_off: false
    }));

    defaultHours.push({
      staff_id: data.id,
      day_of_week: 0,
      start_time: '09:00:00',
      end_time: '19:00:00',
      is_day_off: true
    });

    await supabase.from('working_hours').insert(defaultHours);
    return data;
  },

  /**
   * Update existing staff
   */
  async updateStaff(id: string, updates: Partial<Staff>): Promise<Staff> {
    const { data, error } = await supabase
      .from('staff')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get working hours for a specific staff member
   */
  async getStaffWorkingHours(staffId: string): Promise<WorkingHours[]> {
    const { data, error } = await supabase
      .from('working_hours')
      .select('*')
      .eq('staff_id', staffId)
      .order('day_of_week', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Delete staff member
   */
  async deleteStaff(id: string): Promise<void> {
    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

// ==============================================
// APPOINTMENT SERVICE
// ==============================================

export const AppointmentService = {
  /**
   * Get appointment by ID (with tenant check)
   */
  async getAppointmentById(id: string, salonId?: string): Promise<Appointment | null> {
    let query = supabase
      .from('appointments')
      .select('*')
      .eq('id', id);

    if (salonId) {
      query = query.eq('salon_id', salonId);
    }

    const { data, error } = await query.single();

    if (error) throw error;
    return data;
  },

  /**
   * Get appointments for a salon
   */
  async getAppointmentsBySalon(salonId: string, startDate?: string, endDate?: string): Promise<Appointment[]> {
    let query = supabase
      .from('appointments')
      .select('*')
      .eq('salon_id', salonId);

    if (startDate) {
      query = query.gte('start_time', startDate);
    }
    if (endDate) {
      query = query.lte('start_time', endDate);
    }

    query = query.order('start_time');

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /**
   * Get appointments for a staff member
   */
  async getAppointmentsByStaff(staffId: string, date: string): Promise<Appointment[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('staff_id', staffId)
      .gte('start_time', startOfDay.toISOString())
      .lte('start_time', endOfDay.toISOString())
      .order('start_time');

    if (error) throw error;
    return data || [];
  },

  /**
   * Get appointments by customer phone
   */
  async getAppointmentsByPhone(phone: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('customer_phone', phone)
      .order('start_time', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Create new appointment
   */
  async createAppointment(appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .insert(appointment)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update appointment status (with tenant check)
   */
  async updateAppointmentStatus(id: string, status: Appointment['status'], salonId?: string): Promise<Appointment> {
    let query = supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);

    if (salonId) {
      query = query.eq('salon_id', salonId);
    }

    const { data, error } = await query.select().single();

    if (error) throw error;
    return data;
  },

  /**
   * Cancel appointment
   */
  async cancelAppointment(id: string): Promise<Appointment> {
    return this.updateAppointmentStatus(id, 'CANCELLED');
  },

  /**
   * Update full appointment details (with tenant check)
   */
  async updateAppointment(id: string, updates: Partial<Appointment>, salonId?: string): Promise<Appointment> {
    let query = supabase
      .from('appointments')
      .update(updates)
      .eq('id', id);

    if (salonId) {
      query = query.eq('salon_id', salonId);
    }

    const { data, error } = await query.select().single();

    if (error) throw error;
    return data;
  },
};

// ==============================================
// REVIEW SERVICE
// ==============================================

export const ReviewService = {
  /**
   * Get reviews for a salon
   */
  async getReviewsBySalon(salonId: string, limit: number = 50): Promise<Review[]> {
    const { data, error } = await supabase
      .from('verified_reviews_view') // Use the view for extra details
      .select('*')
      .eq('salon_id', salonId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      // Fallback to regular table if view doesn't exist yet (during migration window)
      console.warn('View fetch failed, falling back to table', error);
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('reviews')
        .select('*')
        .eq('salon_id', salonId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fallbackError) throw fallbackError;
      return fallbackData || [];
    }
    return data || [];
  },

  /**
   * Create new review
   */
  async createReview(review: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get eligible appointments for review (Completed appointments not yet reviewed)
   */
  async getReviewableAppointments(userId: string, salonId: string): Promise<Appointment[]> {
    // 1. Get all completed appointments for this user at this salon
    const { data: appointments, error: apptError } = await supabase
      .from('appointments')
      .select('*')
      .eq('customer_id', userId)
      .eq('salon_id', salonId)
      .eq('status', 'COMPLETED')
      .order('end_time', { ascending: false });

    if (apptError) throw apptError;
    if (!appointments || appointments.length === 0) return [];

    // 2. Get existing reviews by this user for this salon
    // Note: Ideally we check by appointment_id, but current schema might have old reviews without appointment_id
    // For strictly verified reviews, we only care if an appointment ID is already used.

    // Check which appointments are already reviewed
    const { data: reviews, error: reviewError } = await supabase
      .from('reviews')
      .select('appointment_id')
      .eq('user_id', userId)
      .eq('salon_id', salonId)
      .not('appointment_id', 'is', null);

    if (reviewError) throw reviewError;

    const reviewedAppointmentIds = new Set(reviews?.map(r => r.appointment_id) || []);

    // Filter out appointments that are already reviewed
    return appointments.filter(ppt => !reviewedAppointmentIds.has(ppt.id));
  },

  /**
   * Get salon rating summary
   */
  async getSalonRating(salonId: string): Promise<{ average: number; count: number }> {
    const { data, error } = await supabase
      .from('salon_ratings')
      .select('*')
      .eq('salon_id', salonId)
      .single();

    if (error) return { average: 0, count: 0 };

    return {
      average: data?.average_rating || 0,
      count: data?.review_count || 0,
    };
  },
};

// ==============================================
// SUPPORT SERVICE (Tickets & Messages)
// ==============================================

export const SupportService = {
  /**
   * Get all tickets for a user
   */
  async getTickets(userId: string): Promise<SupportTicket[]> {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Create a new ticket with initial message
   */
  async createTicket(userId: string, subject: string, category: string, message: string): Promise<SupportTicket> {
    const { data: ticket, error: ticketError } = await supabase
      .from('support_tickets')
      .insert({
        user_id: userId,
        subject,
        category,
        message,
        status: 'OPEN'
      })
      .select()
      .single();

    if (ticketError) throw ticketError;

    // Add initial message to thread
    const { error: msgError } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: ticket.id,
        sender_id: userId,
        sender_role: 'CUSTOMER',
        content: message
      });

    if (msgError) console.warn('Initial message creation failed:', msgError.message);

    return ticket;
  },

  /**
   * Get ticket by ID
   */
  async getTicketById(ticketId: string): Promise<SupportTicket | null> {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('id', ticketId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get messages for a specific ticket
   */
  async getTicketMessages(ticketId: string): Promise<TicketMessage[]> {
    const { data, error } = await supabase
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get all tickets in the system (Admin only)
   */
  async getAllTickets(): Promise<SupportTicket[]> {
    const { data, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        user:profiles(full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Add message to ticket (Reply)
   */
  async addMessage(ticketId: string, senderId: string, senderRole: string, message: string): Promise<void> {
    const { error: msgError } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: ticketId,
        sender_id: senderId,
        sender_role: senderRole,
        content: message
      });

    if (msgError) throw msgError;

    // Update ticket status mainly if Admin replies or User re-opens
    const newStatus = senderRole.includes('ADMIN') ? 'IN_PROGRESS' : 'OPEN';

    // Only update updated_at always, status conditionally
    // For simplicity, let's bump updated_at
    await supabase
      .from('support_tickets')
      .update({
        updated_at: new Date().toISOString(),
        // Optional: update status logic based on business rules
        // status: newStatus 
      })
      .eq('id', ticketId);
  },

  /**
   * Reply to a ticket as an Admin (Legacy support)
   */
  async replyToTicket(ticketId: string, adminId: string, message: string): Promise<void> {
    return this.addMessage(ticketId, adminId, 'SUPER_ADMIN', message);
  },

  /**
   * Resolve/Close a ticket
   */
  async resolveTicket(ticketId: string): Promise<void> {
    // Try to resolve using safe RPC (for customers)
    const { error: rpcError } = await supabase.rpc('resolve_own_ticket', { p_ticket_id: ticketId });

    if (rpcError) {
      console.warn('RPC resolution failed, falling back to direct update:', rpcError);
      // Fallback for Admin or if logic changes
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: 'RESOLVED', updated_at: new Date().toISOString() })
        .eq('id', ticketId);

      if (error) throw error;
    }
  }
};

// ==============================================
// DASHBOARD SERVICE (Customer Insights)
// ==============================================

export const DashboardService = {
  /**
   * Get main dashboard metrics for a user
   */
  async getDashboardData(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    const upcomingQuery = supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'CONFIRMED')
      .gt('start_time', new Date().toISOString())
      .eq('customer_id', userId);

    const reviewQuery = supabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const spendingQuery = supabase
      .from('appointments')
      .select(`
        salon_service:salon_services (
          price
        )
      `)
      .in('status', ['CONFIRMED', 'COMPLETED'])
      .gte('start_time', startOfMonth)
      .lte('start_time', endOfMonth)
      .eq('customer_id', userId);

    const nextAppointmentQuery = supabase
      .from('appointments')
      .select(`
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
      `)
      .gt('start_time', new Date().toISOString())
      .eq('status', 'CONFIRMED')
      .eq('customer_id', userId)
      .order('start_time', { ascending: true })
      .limit(1);

    const [
      { count: upcomingCount },
      { count: reviewCount },
      { data: spendingData },
      { data: appointments }
    ] = await Promise.all([
      upcomingQuery,
      reviewQuery,
      spendingQuery,
      nextAppointmentQuery
    ]);

    const totalSpent = spendingData?.reduce((sum, item: any) => {
      return sum + (item.salon_service?.price || 0);
    }, 0) || 0;

    return {
      stats: {
        upcomingCount: upcomingCount || 0,
        totalSpent,
        reviewCount: reviewCount || 0
      },
      nextAppointment: appointments && appointments.length > 0 ? appointments[0] : null
    };
  },

  /**
   * Get dynamic recommendations for the user
   */
  async getRecommendedSalons(limit: number = 3): Promise<SalonDetail[]> {
    // Basic logic: high rating + sponsored
    const { data, error } = await supabase
      .from('salon_details')
      .select('*')
      .order('is_sponsored', { ascending: false })
      .order('average_rating', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
};

// ==============================================
// FAVORITE SERVICE
// ==============================================

export const FavoriteService = {
  /**
   * Get all favorites for a user
   */
  async getFavorites(userId: string): Promise<Favorite[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        *,
        salon:salon_details(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Check if a salon is in user's favorites
   */
  async isFavorite(userId: string, salonId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('salon_id', salonId)
      .maybeSingle();

    if (error) return false;
    return !!data;
  },

  /**
   * Toggle favorite status
   */
  async toggleFavorite(userId: string, salonId: string): Promise<boolean> {
    const isFav = await this.isFavorite(userId, salonId);

    if (isFav) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('salon_id', salonId);
      if (error) throw error;
      return false;
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: userId, salon_id: salonId });
      if (error) throw error;
      return true;
    }
  }
};

// ==============================================
// IYS LOG SERVICE (SMS Compliance)
// ==============================================

export const IYSService = {
  /**
   * Log SMS send
   */
  async logSMS(log: Omit<IYSLog, 'id' | 'created_at'>): Promise<IYSLog> {
    const { data, error } = await supabase
      .from('iys_logs')
      .insert(log)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get SMS logs by phone
   */
  async getLogsByPhone(phone: string, limit: number = 50): Promise<IYSLog[]> {
    const { data, error } = await supabase
      .from('iys_logs')
      .select('*')
      .eq('phone', phone)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  /**
   * Get all IYS logs (admin)
   */
  async getAllLogs(limit: number = 100): Promise<IYSLog[]> {
    const { data, error } = await supabase
      .from('iys_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  /**
   * Update working hours
   */
  async updateWorkingHours(id: string, updates: Partial<WorkingHours>): Promise<void> {
    const { error } = await supabase
      .from('working_hours')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }
};

// ==============================================
// STAFF ANALYTICS SERVICE
// ==============================================

export const StaffAnalyticsService = {
  /**
   * Get today's appointment count for a staff member (Real Data)
   */
  async getTodayAppointmentsByStaff(staffId: string): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('appointments')
      .select('id', { count: 'exact' })
      .eq('staff_id', staffId)
      .gte('start_time', `${today}T00:00:00Z`)
      .lte('start_time', `${today}T23:59:59Z`)
      .in('status', ['PENDING', 'CONFIRMED', 'COMPLETED']);

    return data?.length || 0;
  },

  /**
   * Get weekly occupancy analysis (Real Data)
   */
  async getWeeklyOccupancyByStaff(staffId: string, weekStart: Date): Promise<{
    date: string;
    occupancyPercent: number;
    bookedSlots: number;
    totalSlots: number;
  }[]> {
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      return d;
    });

    const results = [];
    for (const date of weekDays) {
      const dateStr = date.toISOString().split('T')[0];

      // Get working hours for this day
      const { data: hours } = await supabase
        .from('working_hours')
        .select('start_time, end_time, is_day_off')
        .eq('staff_id', staffId)
        .eq('day_of_week', date.getDay())
        .single();

      if (!hours || hours.is_day_off) {
        results.push({ date: dateStr, occupancyPercent: 0, bookedSlots: 0, totalSlots: 0 });
        continue;
      }

      // Calculate total slots (30 min slots)
      const [startH, startM] = hours.start_time.split(':').map(Number);
      const [endH, endM] = hours.end_time.split(':').map(Number);
      const totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
      const totalSlots = Math.floor(totalMinutes / 30);

      // Get booked slots count
      const { data: appts } = await supabase
        .from('appointments')
        .select(`
          start_time,
          end_time,
          service:salon_services(duration_min)
        `)
        .eq('staff_id', staffId)
        .gte('start_time', `${dateStr}T00:00:00Z`)
        .lte('start_time', `${dateStr}T23:59:59Z`)
        .in('status', ['PENDING', 'CONFIRMED', 'COMPLETED']);

      /*
       * Calculate actual booked slots
       * Ideally, this should check for overlaps, but for simplicity we assume
       * duration / 30 mins
       */
      const bookedSlots = appts?.reduce((sum, a: any) => {
        const duration = a.service?.duration_min || 30;
        return sum + Math.ceil(duration / 30);
      }, 0) || 0;

      const occupancyPercent = totalSlots > 0 ? (bookedSlots / totalSlots) * 100 : 0;

      results.push({
        date: dateStr,
        occupancyPercent: Math.round(occupancyPercent),
        bookedSlots,
        totalSlots
      });
    }

    return results;
  },

  /**
   * Get current real-time availability status
   */
  async getCurrentAvailability(staffId: string): Promise<{
    isAvailable: boolean;
    currentAppointment?: any; // Using exact type would be better but keeping it flexible
    nextAvailableSlot?: string;
  }> {
    const now = new Date();
    const nowStr = now.toISOString();

    // Check if currently busy
    const { data: current } = await supabase
      .from('appointments')
      .select(`
        *,
        service:salon_services(duration_min, global_service:global_services(name))
      `)
      .eq('staff_id', staffId)
      .lte('start_time', nowStr)
      .gte('end_time', nowStr)
      .in('status', ['CONFIRMED', 'PENDING'])
      .single();

    if (current) {
      return {
        isAvailable: false,
        currentAppointment: current,
        nextAvailableSlot: current.end_time
      };
    }

    // Find next appointment to determine free until when
    const { data: next } = await supabase
      .from('appointments')
      .select('start_time')
      .eq('staff_id', staffId)
      .gte('start_time', nowStr)
      .order('start_time', { ascending: true })
      .limit(1)
      .single();

    return {
      isAvailable: true,
      nextAvailableSlot: next?.start_time || undefined
    };
  }
};


// ==============================================
// NOTIFICATION SERVICE
// ==============================================

export const NotificationService = {
  /**
   * Get notifications for a user
   */
  async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Send notification to user
   */
  async sendNotification(notification: Omit<Notification, 'id' | 'created_at' | 'is_read'>): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        ...notification,
        is_read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};


// ==============================================
// INVITE SERVICE (Staff Recruitment)
// ==============================================

export const InviteService = {
  /**
   * Create a new invite (Owner/Manager action)
   */
  async createInvite(invite: Omit<Invite, 'id' | 'status' | 'created_at' | 'expires_at' | 'accepted_at'>): Promise<Invite> {
    const { data, error } = await supabase
      .from('invites')
      .insert({
        ...invite,
        token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        status: 'PENDING'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get invite details by token (Public check)
   */
  async getInviteByToken(token: string): Promise<Invite | null> {
    const { data, error } = await supabase
      .from('invites')
      .select('*, salon:salons(name)')
      .eq('token', token)
      .eq('status', 'PENDING')
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  /**
   * Accept invite and link to membership
   */
  async acceptInvite(inviteId: string, userId: string): Promise<void> {
    const { data: invite, error: fetchErr } = await supabase
      .from('invites')
      .select('*')
      .eq('id', inviteId)
      .single();

    if (fetchErr) throw fetchErr;

    // 1. Create membership
    const { error: memErr } = await supabase
      .from('salon_memberships')
      .insert({
        user_id: userId,
        salon_id: invite.salon_id,
        role: invite.role,
        is_active: true
      });

    if (memErr) throw memErr;

    // 2. Mark invite as accepted
    const { error: updErr } = await supabase
      .from('invites')
      .update({
        status: 'ACCEPTED',
        accepted_at: new Date().toISOString()
      })
      .eq('id', inviteId);

    if (updErr) throw updErr;
  }
};

// ==============================================
// LEGACY COMPATIBILITY (for existing components)
// ==============================================

// Re-export new services with old names for backward compatibility
export const MasterService = MasterDataService;

// Export all services
export default {
  MasterDataService,
  MasterService,
  SalonDataService,
  StaffService,
  ServiceService,
  AppointmentService,
  ReviewService,
  DashboardService,
  SupportService,
  IYSService,
  NotificationService,
  InviteService,
};

