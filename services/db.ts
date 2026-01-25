/**
 * Database Service Layer for GuzellikRandevu
 * Connects to self-hosted Supabase instance
 */

import { supabase, supabaseUrl } from '@/lib/supabase';
import type {
  City, District, SalonType, ServiceCategory, GlobalService,
  Salon, SalonDetail, Staff, SalonService, SalonServiceDetail,
  WorkingHours, SalonWorkingHours, Appointment, Review, IYSLog,
  SupportTicket, TicketMessage, Favorite
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
      .order('is_sponsored', { ascending: false })
      .order('average_rating', { ascending: false });

    if (error) throw error;
    return data || [];
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
      const { data: typeData } = await supabase
        .from('salon_types')
        .select('name')
        .eq('id', filters.typeId)
        .single();

      if (typeData) {
        query = query.eq('type_name', typeData.name);
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
      .order('is_sponsored', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Create a new salon (Intercepted for Approval)
   */
  async createSalon(salon: Omit<Salon, 'id' | 'created_at' | 'updated_at'>): Promise<any> {
    console.log('[DEBUG] createSalon started', salon);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      console.log('[DEBUG] createSalon user:', user?.id);
      if (!user) throw new Error('Not authenticated');

      const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      console.log('[DEBUG] createSalon profile:', profile, 'error:', profileError);

      if (profile?.role === 'SALON_OWNER') {
        console.log('[DEBUG] Redirecting to ApprovalService');
        return ApprovalService.createRequest({
          type: 'SALON_CREATE',
          data: salon
        }, user.id);
      }

      const { data, error } = await supabase
        .from('salons')
        .insert(salon)
        .select()
        .single();

      console.log('[DEBUG] Direct createSalon result:', { data, error });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[DEBUG] createSalon ERROR:', err);
      throw err;
    }
  },

  /**
   * Update salon (Intercepted for Approval)
   */
  async updateSalon(id: string, updates: Partial<Salon>): Promise<any> {
    console.log('[DEBUG] updateSalon started', { id, updates });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      console.log('[DEBUG] updateSalon user:', user?.id);
      if (!user) throw new Error('Not authenticated');

      const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      console.log('[DEBUG] updateSalon profile:', profile, 'error:', profileError);

      if (profile?.role === 'SALON_OWNER') {
        console.log('[DEBUG] Redirecting to ApprovalService');
        return ApprovalService.createRequest({
          salon_id: id,
          type: 'SALON_UPDATE',
          data: updates
        }, user.id);
      }

      const { data, error } = await supabase
        .from('salons')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      console.log('[DEBUG] Direct updateSalon result:', { data, error });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[DEBUG] updateSalon ERROR:', err);
      throw err;
    }
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
   * Get salon details by owner user ID
   */
  async getSalonByOwner(ownerId: string): Promise<SalonDetail | null> {
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select('id')
      .eq('owner_id', ownerId)
      .single();

    if (salonError || !salon) return null;

    return this.getSalonById(salon.id);
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
   * Get all staff for a salon
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
   * Get staff by ID
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
   * Create a new staff member (Intercepted for Approval)
   */
  async createStaff(staffData: Partial<Staff>): Promise<any> {
    console.log('[DEBUG] createStaff started', staffData);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      console.log('[DEBUG] createStaff user:', user?.id);
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      console.log('[DEBUG] createStaff profile:', profile?.role);

      if (profile?.role === 'SALON_OWNER') {
        console.log('[DEBUG] Redirecting to ApprovalService');
        return ApprovalService.createRequest({
          salon_id: staffData.salon_id,
          type: 'STAFF_ADD',
          data: staffData
        }, user.id);
      }

      const { data, error } = await supabase
        .from('staff')
        .insert({
          ...staffData,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      console.log('[DEBUG] Direct createStaff result:', { data, error });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[DEBUG] createStaff ERROR:', err);
      throw err;
    }
  },

  /**
   * Update existing staff (Intercepted for Approval)
   */
  async updateStaff(id: string, updates: Partial<Staff>): Promise<any> {
    console.log('[DEBUG] updateStaff started', { id, updates });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      console.log('[DEBUG] updateStaff user:', user?.id);
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      console.log('[DEBUG] updateStaff profile:', profile?.role);

      if (profile?.role === 'SALON_OWNER') {
        console.log('[DEBUG] Redirecting to ApprovalService');
        return ApprovalService.createRequest({
          salon_id: updates.salon_id,
          type: 'STAFF_UPDATE',
          data: { ...updates, id }
        }, user.id);
      }

      const { data, error } = await supabase
        .from('staff')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      console.log('[DEBUG] Direct updateStaff result:', { data, error });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[DEBUG] updateStaff ERROR:', err);
      throw err;
    }
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
   * Delete staff member (Intercepted for Approval)
   */
  async deleteStaff(id: string): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

    if (profile?.role === 'SALON_OWNER') {
      const { data: existing } = await supabase.from('staff').select('salon_id').eq('id', id).single();
      return ApprovalService.createRequest({
        salon_id: existing?.salon_id,
        type: 'STAFF_DELETE',
        data: { id }
      });
    }

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
   * Get service by ID
   */
  async getServiceById(id: string): Promise<SalonServiceDetail | null> {
    const { data, error } = await supabase
      .from('salon_service_details')
      .select('*')
      .eq('id', id)
      .single();

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
   * Add a new service to a salon (Intercepted for Approval)
   */
  async createService(serviceData: { salon_id: string, global_service_id: string, price: number, duration_min: number }): Promise<any> {
    console.log('[DEBUG] createService started', serviceData);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      console.log('[DEBUG] createService user:', user?.id);
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      console.log('[DEBUG] createService profile:', profile?.role);

      if (profile?.role === 'SALON_OWNER') {
        console.log('[DEBUG] Redirecting to ApprovalService');
        return ApprovalService.createRequest({
          salon_id: serviceData.salon_id,
          type: 'SERVICE_ADD',
          data: serviceData
        }, user.id);
      }

      const { data, error } = await supabase
        .from('salon_services')
        .insert(serviceData)
        .select()
        .single();

      console.log('[DEBUG] Direct createService result:', { data, error });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[DEBUG] createService ERROR:', err);
      throw err;
    }
  },

  /**
   * Update an existing service (Intercepted for Approval)
   */
  async updateService(id: string, updates: { price?: number, duration_min?: number, is_active?: boolean }): Promise<any> {
    console.log('[DEBUG] updateService started', { id, updates });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      console.log('[DEBUG] updateService user:', user?.id);
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      console.log('[DEBUG] updateService profile:', profile?.role);

      if (profile?.role === 'SALON_OWNER') {
        const { data: existing } = await supabase.from('salon_services').select('salon_id').eq('id', id).single();
        console.log('[DEBUG] Redirecting to ApprovalService');
        return ApprovalService.createRequest({
          salon_id: existing?.salon_id,
          type: 'SERVICE_UPDATE',
          data: { ...updates, id }
        }, user.id);
      }

      const { data, error } = await supabase
        .from('salon_services')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      console.log('[DEBUG] Direct updateService result:', { data, error });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[DEBUG] updateService ERROR:', err);
      throw err;
    }
  },

  /**
   * Delete a service (Intercepted for Approval)
   */
  async deleteService(id: string): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

    if (profile?.role === 'SALON_OWNER') {
      const { data: existing } = await supabase.from('salon_services').select('salon_id').eq('id', id).single();

      return ApprovalService.createRequest({
        salon_id: existing?.salon_id,
        type: 'SERVICE_DELETE',
        data: { id }
      });
    }

    const { error } = await supabase
      .from('salon_services')
      .delete()
      .eq('id', id);

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
// APPROVAL SERVICE
// ==============================================

export const ApprovalService = {
  /**
   * Get pending change requests for admin
   */
  async getPendingRequests(): Promise<any[]> {
    const { data, error } = await supabase
      .from('change_requests')
      .select(`
        *,
        requester:profiles(full_name, email),
        salon:salons(name)
      `)
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get user's own change requests
   */
  async getMyRequests(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('change_requests')
      .select('*')
      .eq('requester_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Create a new change request
   */
  async createRequest(request: {
    salon_id?: string;
    type: string;
    data: any;
  }, userId?: string): Promise<any> {
    console.log('[DEBUG] ApprovalService.createRequest started', request);
    try {
      let finalUserId = userId;

      if (!finalUserId) {
        const { data: { session } } = await supabase.auth.getSession();
        finalUserId = session?.user?.id;
      }

      console.log('[DEBUG] ApprovalService userId:', finalUserId);
      if (!finalUserId) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('change_requests')
        .insert({
          requester_id: finalUserId,
          salon_id: request.salon_id,
          type: request.type,
          data: request.data,
          status: 'PENDING'
        })
        .select()
        .single();

      console.log('[DEBUG] ApprovalService result:', { data, error });
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('[DEBUG] ApprovalService ERROR:', err);
      throw err;
    }
  },

  /**
   * Approve a request (calls DB function)
   */
  async approveRequest(requestId: string): Promise<any> {
    const { data, error } = await supabase
      .rpc('approve_change_request', { request_id: requestId });

    if (error) throw error;
    return data;
  },

  /**
   * Reject a request
   */
  async rejectRequest(requestId: string, note?: string): Promise<void> {
    const { error } = await supabase
      .from('change_requests')
      .update({ status: 'REJECTED', admin_note: note, updated_at: new Date().toISOString() })
      .eq('id', requestId);

    if (error) throw error;
  }
};

// ==============================================
// APPOINTMENT SERVICE
// ==============================================

export const AppointmentService = {
  /**
   * Get appointment by ID
   */
  async getAppointmentById(id: string): Promise<Appointment | null> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();

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
   * Update appointment status
   */
  async updateAppointmentStatus(id: string, status: Appointment['status']): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

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
   * Update full appointment details
   */
  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

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
      .from('reviews')
      .select('*')
      .eq('salon_id', salonId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
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
};

