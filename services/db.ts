
import { supabase, supabaseUrl } from '../lib/supabase';
import { Salon, Staff, Service, Review, SalonType, ServiceCategory, IYSLog } from '../types';
import { MOCK_SALONS, MOCK_STAFF, MOCK_SERVICES, MOCK_REVIEWS, MOCK_SALON_TYPES, MOCK_SERVICE_CATEGORIES } from '../constants';

// Helper to check if we have a real connection
const isSupabaseConfigured = () => {
    return supabaseUrl && !supabaseUrl.includes('placeholder.supabase.co');
};

// --- Master Service for Global Data (Menus) ---
export const MasterService = {
  // Fetch "Salon Türleri" for the "Salonlar" menu
  async getSalonTypes(): Promise<SalonType[]> {
    try {
        if (!isSupabaseConfigured()) throw new Error("Supabase not configured");
        const { data, error } = await supabase.from('salon_types').select('*');
        if (error) throw error;
        return data as unknown as SalonType[];
    } catch (e) {
        return MOCK_SALON_TYPES;
    }
  },
  
  // Fetch "Hizmet Türleri" (Categories)
  async getServiceCategories(): Promise<ServiceCategory[]> {
     try {
         if (!isSupabaseConfigured()) throw new Error("Supabase not configured");
         const { data, error } = await supabase.from('service_categories').select('*');
         if (error) throw error;
         return data as unknown as ServiceCategory[];
     } catch (e) {
         return MOCK_SERVICE_CATEGORIES;
     }
  },

  // Combined fetch for the Navigation Bar
  async getNavMenuData() {
      const salonTypes = await this.getSalonTypes();
      const categories = await this.getServiceCategories();
      const allServices = await ServiceService.getAllServices();

      // Group unique services by category_id for the dropdowns
      // We use a Map to ensure unique service names per category
      const servicesByCatId: Record<string, string[]> = {};
      
      allServices.forEach(s => {
          if (!servicesByCatId[s.category_id]) {
              servicesByCatId[s.category_id] = [];
          }
          if (!servicesByCatId[s.category_id].includes(s.name)) {
              servicesByCatId[s.category_id].push(s.name);
          }
      });

      return { salonTypes, categories, servicesByCatId };
  },

  // Fetch unique service names for a specific category (Legacy support)
  async getServicesMenuByCategory(category: string): Promise<string[]> {
      try {
        if (!isSupabaseConfigured()) throw new Error("Supabase not configured");
        
        const { data, error } = await supabase
            .from('services')
            .select('name')
            .eq('category', category);
            
        if (error) throw error;
        
        const names = Array.from(new Set(data.map((item: any) => item.name)));
        return names as string[];
      } catch (e) {
        const services = MOCK_SERVICES.filter(s => s.category === category);
        return Array.from(new Set(services.map(s => s.name)));
      }
  }
};

// --- Helper Functions for Dynamic Calculations ---
const calculateSalonStats = (salonId: string, reviews: Review[]) => {
    const salonReviews = reviews.filter(r => r.salon_id === salonId);
    const count = salonReviews.length;
    if (count === 0) return { rating: 0, reviewCount: 0 };
    
    const total = salonReviews.reduce((sum, r) => sum + r.rating, 0);
    const average = total / count;
    
    // Return formatted to 1 decimal place
    return { 
        rating: parseFloat(average.toFixed(1)), 
        reviewCount: count 
    };
};

export const SalonService = {
  async getSalons(): Promise<Salon[]> {
    try {
      if (!isSupabaseConfigured()) throw new Error("Supabase not configured");
      
      const { data, error } = await supabase.from('salons').select('*');
      if (error) throw error;
      if (data && data.length > 0) return data as unknown as Salon[];
      
      throw new Error("Fallback needed");
    } catch (e) {
      // Simulate network delay
      if (!isSupabaseConfigured()) await new Promise(r => setTimeout(r, 600)); 
      
      // Dynamic Calculation Logic:
      // We map over mock salons and inject the calculated rating from reviews
      const allReviews = await ReviewService.getAllReviews(); // In a real app, use a join or view
      
      return MOCK_SALONS.map(salon => {
          const stats = calculateSalonStats(salon.id, allReviews);
          return { ...salon, ...stats };
      });
    }
  },

  async getSalonById(id: string): Promise<Salon | undefined> {
    try {
      if (!isSupabaseConfigured()) throw new Error("Supabase not configured");
      const { data, error } = await supabase.from('salons').select('*').eq('id', id).single();
      if (error) throw error;
      if (data) return data as unknown as Salon;
      throw new Error("Fallback needed");
    } catch (e) {
      const salon = MOCK_SALONS.find(s => s.id === id);
      if (!salon) return undefined;

      const allReviews = await ReviewService.getAllReviews();
      const stats = calculateSalonStats(salon.id, allReviews);
      return { ...salon, ...stats };
    }
  }
};

export const StaffService = {
  async getStaffBySalon(salonId: string): Promise<Staff[]> {
    try {
        if (!isSupabaseConfigured()) throw new Error("Supabase not configured");
        const { data, error } = await supabase.from('staff').select('*').eq('salon_id', salonId);
        if (error) throw error;
        if (data && data.length > 0) return data as unknown as Staff[];
        return MOCK_STAFF;
    } catch (e) {
        return MOCK_STAFF;
    }
  }
};

export const ServiceService = {
    async getServicesBySalon(salonId: string): Promise<Service[]> {
        try {
            if (!isSupabaseConfigured()) throw new Error("Supabase not configured");
            
            // Fetch services for the specific salon from Supabase
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('salon_id', salonId);

            if (error) throw error;
            if (data && data.length > 0) return data as unknown as Service[];
            
            return MOCK_SERVICES;
        } catch (e) {
            // Fallback to updated mock data
            return MOCK_SERVICES;
        }
    },

    async getAllServices(): Promise<Service[]> {
        try {
             if (!isSupabaseConfigured()) throw new Error("Supabase not configured");
             const { data, error } = await supabase.from('services').select('*');
             if (error) throw error;
             return data as unknown as Service[];
        } catch (e) {
            return MOCK_SERVICES;
        }
    }
};

export const BookingService = {
    async createBooking(bookingData: any) {
        console.log("Creating booking in DB:", bookingData);
        return { success: true, id: 'mock-booking-id' };
    }
};

// New Review Service
let localReviews = [...MOCK_REVIEWS]; // In-memory store for the session

export const ReviewService = {
    async getAllReviews(): Promise<Review[]> {
        // Helper for SalonService to calculate stats
        return localReviews;
    },

    async getReviewsBySalon(salonId: string): Promise<Review[]> {
        try {
            if (!isSupabaseConfigured()) throw new Error("Supabase not configured");
            const { data, error } = await supabase.from('reviews').select('*').eq('salon_id', salonId).order('date', { ascending: false });
            if (error) throw error;
            return data as unknown as Review[];
        } catch (e) {
            // Simulate API latency
            await new Promise(r => setTimeout(r, 400));
            return localReviews.filter(r => r.salon_id === salonId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
    },

    async addReview(review: Omit<Review, 'id' | 'date'>): Promise<Review> {
         try {
            if (isSupabaseConfigured()) {
                // Real DB Insert
                const { data, error } = await supabase.from('reviews').insert(review).select().single();
                if (error) throw error;
                return data as unknown as Review;
            }
            throw new Error("Mock fallback");
         } catch (e) {
            await new Promise(r => setTimeout(r, 800));
            const newReview: Review = {
                ...review,
                id: Math.random().toString(36).substr(2, 9),
                date: new Date().toISOString().split('T')[0]
            };
            localReviews = [newReview, ...localReviews];
            return newReview;
         }
    }
};

// IYS (SMS) Logging Service
let localIYSLogs: IYSLog[] = []; // In-memory fallback for demo

export const IYSService = {
    async addLog(log: Omit<IYSLog, 'id' | 'created_at'>): Promise<void> {
        try {
            if (isSupabaseConfigured()) {
                await supabase.from('iys_logs').insert(log);
            } else {
                throw new Error("Mock Fallback");
            }
        } catch (e) {
            console.log("Saving SMS Log Locally:", log);
            localIYSLogs = [
                {
                    ...log,
                    id: Math.random().toString(36).substr(2, 9),
                    created_at: new Date().toISOString()
                },
                ...localIYSLogs
            ];
        }
    },

    async getLogs(): Promise<IYSLog[]> {
        try {
            if (isSupabaseConfigured()) {
                const { data, error } = await supabase.from('iys_logs').select('*').order('created_at', { ascending: false });
                if (error) throw error;
                return data as unknown as IYSLog[];
            } else {
                throw new Error("Mock Fallback");
            }
        } catch (e) {
            return localIYSLogs;
        }
    }
}
