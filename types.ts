export type UserRole = 'CUSTOMER' | 'STAFF' | 'MANAGER' | 'SALON_OWNER' | 'ADMIN' | 'SUPER_ADMIN';
export type SalonPlan = 'FREE' | 'PRO' | 'ENTERPRISE';

export type Permission =
  | 'CAN_MANAGE_SALON'
  | 'CAN_MANAGE_STAFF'
  | 'CAN_EDIT_SERVICES'
  | 'CAN_VIEW_REPORTS'
  | 'CAN_MANAGE_BOOKINGS'
  | 'CAN_MODERATE_CONTENT'
  | 'CAN_MANAGE_SYSTEM';

export interface Profile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string; // Sync with DB column name
  avatar_url?: string;
  role: UserRole;
  permissions?: Permission[]; // For future-proof RBAC
  phone?: string;
  birth_date?: string; // YYYY-MM-DD
  created_at?: string;
  updated_at?: string;
  bio?: string;
  // Account & Security Updates (Faz 1)
  is_active?: boolean;
  deleted_at?: string;
  kvkk_accepted_at?: string;
  marketing_opt_in?: boolean;
  language_preference?: string;
  default_city_id?: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  salon_id: string;
  created_at: string;
  salon?: SalonDetail; // Joined salon data
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  content: string; // Renamed from message to content to match my service logic
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'APPOINTMENT' | 'REVIEW' | 'SYSTEM' | 'REMINDER' | 'PROMOTION' | 'BOOKING';
  is_read: boolean;
  link?: string; // Renamed from action_url to link
  created_at: string;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  salon_id?: string;
  subject: string;
  message: string; // The initial message
  category: 'PAYMENT' | 'BOOKING' | 'ACCOUNT' | 'SALON' | 'OTHER' | 'GENEL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  created_at: string;
  updated_at: string;
  messages?: TicketMessage[]; // Optional thread
  user?: {
    full_name: string;
    email: string;
  };
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_role: UserRole;
  content: string;
  created_at: string;
}

// ==============================================
// MASTER DATA TYPES (Admin-Managed Global Data)
// ==============================================

export interface City {
  id: string;
  name: string;
  plate_code: number;
  latitude?: number;
  longitude?: number;
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
  image?: string; // For display/marketing purposes (Now in DB)
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
  avg_duration_min?: number;
  avg_price?: number;
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
  neighborhood?: string; // Mahalle
  avenue?: string;       // Cadde
  street?: string;       // Sokak
  building_no?: string;  // Dış Kapı No
  apartment_no?: string; // İç Kapı/Daire
  postal_code?: string;
  phone?: string;
  geo_latitude?: number;
  geo_longitude?: number;
  image?: string;
  is_sponsored?: boolean;
  description?: string;
  features?: string[]; // Stored as JSONB in DB
  created_at?: string;
  updated_at?: string;
  owner_id?: string;
  status?: 'DRAFT' | 'SUBMITTED' | 'REVISION_REQUESTED' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  rejected_reason?: string;
  plan?: SalonPlan;
  slug: string;
  type_ids?: string[]; // For multi-type support
  primary_type_id?: string;


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
  assigned_types?: { id: string, name: string, slug: string, is_primary: boolean }[];
  working_hours?: {
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_closed: boolean;
  }[];


  // Legacy/compatibility properties (for existing code)
  city?: string;        // Alias for city_name
  district?: string;    // Alias for district_name
  location?: string;    // Combined location string
  tags?: string[];      // Service/category tags (will be populated from services)
  typeIds?: string[];   // Array of type IDs
  rating?: number;      // Alias for average_rating
  startPrice?: number;  // Minimum service price
  description?: string;
  features?: string[];
  is_closed?: boolean;
}

export interface Staff {
  id: string;
  salon_id?: string;
  user_id?: string;
  name: string;
  photo?: string;
  specialty?: string;
  phone?: string; // Contact info
  email?: string; // Contact info
  is_active?: boolean;
  bio?: string;
  created_at?: string;

  // Display/compatibility properties
  image?: string;       // Alias for photo
  role?: string;        // Job title/role
  rating?: number;      // Staff rating
  review_count?: number; // Total number of reviews
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
  category_icon: string;
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
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  salon_id: string;
  staff_id: string;
  salon_service_id: string;
  start_time: string;
  end_time: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  notes?: string;
  coupon_code?: string;
  discount_amount?: number;
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
  appointment_id?: string; // Links to the appointment if verified
  // Visual verification fields (from view)
  is_verified?: boolean;
  service_name?: string;
  service_date?: string;
  images?: ReviewImage[]; // Added images to review
}

export interface ReviewImage {
  id: string;
  review_id: string;
  image_url: string;
  created_at?: string;
}

export interface StaffReview {
  id: string;
  staff_id: string;
  salon_id: string;
  user_id?: string;
  appointment_id?: string;
  user_name: string;
  user_avatar?: string;
  rating: number; // 1 to 5
  comment?: string;
  is_verified?: boolean;
  staff_name?: string;
  staff_photo?: string;
  created_at?: string;
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

// ==============================================
// UI/DISPLAY TYPES
// ==============================================

export interface BookingDisplay {
  id: string;
  start_time: string;
  end_time: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  salon: {
    name: string;
    address: string;
  };
  service: {
    name: string;
    price: number;
    duration_min: number;
  };
  staff: {
    name: string;
  };
  coupon_code?: string;
  discount_amount?: number;
}

export interface SalonWorkingHours {
  id: string;
  salon_id: string;
  day_of_week: number; // 0=Sunday, 6=Saturday
  start_time: string;
  end_time: string;
  is_closed: boolean;
  created_at: string;
}

export type InviteStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';

export interface Invite {
  id: string;
  salon_id: string;
  email: string;
  role: UserRole;
  token: string;
  status: InviteStatus;
  inviter_id: string;
  expires_at: string;
  created_at: string;
  accepted_at?: string;
  salon?: { name: string }; // Optional joined data
}

export interface SalonGallery {
  id: string;
  salon_id: string;
  image_url: string;
  display_order: number;
  is_cover: boolean;
  caption?: string;
  created_at: string;
}

// ==============================================
// FINANCE & CAMPAIGN TYPES (Faz 3)
// ==============================================

export type DiscountType = 'PERCENTAGE' | 'FIXED';
export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'WALLET' | 'OTHER';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'REFUNDED' | 'FAILED';

export interface Coupon {
  id: string;
  salon_id?: string; // Null if global
  code: string;
  description?: string;
  discount_type: DiscountType;
  discount_value: number;
  min_purchase_amount?: number;
  max_discount_amount?: number;
  expires_at?: string;
  usage_limit?: number;
  used_count?: number;
  is_active: boolean;
  created_at?: string;
}

export interface Package {
  id: string;
  salon_id: string;
  name: string;
  description?: string;
  price: number;
  is_active: boolean;
  expires_at?: string;
  created_at?: string;
  services?: PackageService[];
}

export interface PackageService {
  id: string;
  package_id: string;
  salon_service_id: string;
  quantity: number;
  created_at?: string;
  service?: SalonServiceDetail; // Joined data
}

export interface Transaction {
  id: string;
  salon_id: string;
  customer_id?: string;
  appointment_id?: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  provider_transaction_id?: string;
  commission_amount?: number;
  notes?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface AppointmentCoupon {
  id: string;
  appointment_id: string;
  coupon_id: string;
  discount_amount: number;
  created_at: string;
}

export interface SalonUsageStats {
  salon_id: string;
  salon_name: string;
  plan_name: string;
  plan_display_name: string;
  current_staff: number;
  limit_staff: number;
  current_branches: number;
  limit_branches: number;
  current_gallery_photos: number;
  limit_gallery_photos: number;
  has_advanced_reports: boolean;
  has_campaigns: boolean;
  has_sponsored: boolean;
  subscription_status: string;
  subscription_expires_at: string;
}

export interface IyzicoWebhook {
  id: string;
  iyzi_event_type: string;
  payload: any;
  status: 'RECEIVED' | 'PROCESSED' | 'ERROR';
  error_message?: string;
  processed_at?: string;
  created_at: string;
}

export { };
