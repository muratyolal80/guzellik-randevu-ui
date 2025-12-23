export type UserRole = 'user' | 'staff' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  phone?: string;
  created_at?: string;
  updated_at?: string;
}

// ==============================================
// MASTER DATA TYPES (Admin-Managed Global Data)
// ==============================================

export interface City {
  id: string;
  name: string;
  plate_code: number;
  created_at?: string;
}

export interface District {
  id: string;
  city_id: string;
  name: string;
  created_at?: string;
}

export interface SalonType {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;  // For display/marketing purposes
  created_at?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  created_at?: string;
}

export interface GlobalService {
  id: string;
  category_id: string;
  name: string;
  created_at?: string;
}

// ==============================================
// BUSINESS/TENANT DATA TYPES
// ==============================================

export interface Salon {
  id: string;
  name: string;
  city_id?: string;
  district_id?: string;
  type_id?: string;
  address?: string;
  phone?: string;
  geo_latitude?: number;
  geo_longitude?: number;
  image?: string;
  is_sponsored?: boolean;
  created_at?: string;
  updated_at?: string;

  // UI/card fields used by MOCK_SALONS and components
  location?: string;
  city?: string;
  district?: string;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  typeIds?: string[];
  startPrice?: number;
  isSponsored?: boolean;
  coordinates?: { lat: number; lng: number };
  createdAt?: string;
}

// Extended Salon with joined data for display
export interface SalonDetail extends Salon {
  coordinates: any;
  city_name: string;
  district_name: string;
  type_name: string;
  type_slug: string;
  review_count: number;
  average_rating: number;

  // Legacy/compatibility properties (for existing code)
  city?: string;        // Alias for city_name
  district?: string;    // Alias for district_name
  location?: string;    // Combined location string
  tags?: string[];      // Service/category tags (will be populated from services)
  typeIds?: string[];   // Array of type IDs
  rating?: number;      // Alias for average_rating
  startPrice?: number;  // Minimum service price
}

export interface Staff {
  id: string;
  salon_id?: string;
  name: string;
  photo?: string;
  specialty?: string;
  is_active?: boolean;
  created_at?: string;

  // Display/compatibility properties
  image?: string;       // Alias for photo
  role?: string;        // Job title/role
  rating?: number;      // Staff rating
  isOnline?: boolean;   // Online status
}

export interface SalonService {
  id: string;
  salon_id: string;
  global_service_id: string;
  duration_min: number;
  price: number;
  created_at: string;
}

// Extended SalonService with joined data for display
export interface SalonServiceDetail extends SalonService {
  service_name: string;
  category_name: string;
  category_slug: string;
  salon_name: string;
}

// ==============================================
// OPERATIONS TYPES
// ==============================================

export interface WorkingHours {
  id: string;
  staff_id: string;
  day_of_week: number; // 0=Sunday, 6=Saturday
  start_time: string;
  end_time: string;
  is_day_off: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  customer_name: string;
  customer_phone: string;
  salon_id: string;
  staff_id: string;
  salon_service_id: string;
  start_time: string;
  end_time: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  salon_id: string;
  user_id?: string;
  user_name: string;
  user_avatar?: string;
  rating: number; // 1 to 5
  comment?: string;
  created_at?: string;
  date?: string;
}

export interface IYSLog {
  id: string;
  phone: string;
  message_type: 'OTP' | 'INFO' | 'CAMPAIGN';
  content: string;
  status: 'SENT' | 'FAILED' | 'DEMO';
  created_at: string;
}

// ==============================================
// LEGACY/COMPATIBILITY TYPES
// ==============================================

// For backward compatibility with existing components
export interface Service {
  id: string;
  category_id: string;
  salon_id?: string;
  name: string;
  duration: string;
  price: number;
  category: string;
}

export interface Booking {
  id: string;
  user_id: string;
  salon_id: string;
  staff_id: string;
  service_ids: string[];
  booking_date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  total_price: number;
}

export { };
