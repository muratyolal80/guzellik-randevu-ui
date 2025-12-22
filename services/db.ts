/**
 * Database Service Layer for GuzellikRandevu
 * Connects to self-hosted Supabase instance
 */

import { supabase, supabaseUrl } from '@/lib/supabase';
import type {
  City, District, SalonType, ServiceCategory, GlobalService,
  Salon, SalonDetail, Staff, SalonService, SalonServiceDetail,
  WorkingHours, Appointment, Review, IYSLog
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
   * Get navigation menu data (for header)
   */
  async getNavMenuData() {
    const [salonTypes, categories] = await Promise.all([
      this.getSalonTypes(),
      this.getServiceCategories(),
    ]);

    return { salonTypes, categories };
  },
};

// ==============================================
// SALON SERVICE (Business/Tenant Data)
// ==============================================

export const SalonService = {
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
   * Create a new salon
   */
  async createSalon(salon: Omit<Salon, 'id' | 'created_at' | 'updated_at'>): Promise<Salon> {
    const { data, error } = await supabase
      .from('salons')
      .insert(salon)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update salon
   */
  async updateSalon(id: string, updates: Partial<Salon>): Promise<Salon> {
    const { data, error } = await supabase
      .from('salons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
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
   * Create new staff member
   */
  async createStaff(staff: Omit<Staff, 'id' | 'created_at'>): Promise<Staff> {
    const { data, error } = await supabase
      .from('staff')
      .insert(staff)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
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
   * Add service to salon
   */
  async addServiceToSalon(service: Omit<SalonService, 'id' | 'created_at'>): Promise<SalonService> {
    const { data, error } = await supabase
      .from('salon_services')
      .insert(service)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update salon service pricing
   */
  async updateSalonService(id: string, updates: Partial<SalonService>): Promise<SalonService> {
    const { data, error } = await supabase
      .from('salon_services')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
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
};

// ==============================================
// APPOINTMENT SERVICE
// ==============================================

export const AppointmentService = {
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
  SalonService,
  StaffService,
  ServiceService,
  WorkingHoursService,
  AppointmentService,
  ReviewService,
  IYSService,
};

