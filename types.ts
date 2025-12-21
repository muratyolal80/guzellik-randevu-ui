
export type UserRole = 'user' | 'staff' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
}

export interface SalonType {
  id: string;
  name: string;
  slug: string;
  image?: string; // Added image support for visual categories
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string; // Optional icon for UI
}

export interface Salon {
  id: string;
  name: string;
  location: string;
  city?: string;
  district?: string;
  rating: number; // Dynamically calculated
  reviewCount: number; // Dynamically calculated
  image: string;
  tags: string[]; // These will map to SalonType names in the UI
  startPrice: number;
  isSponsored?: boolean;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Staff {
  id: string;
  salon_id?: string;
  name: string;
  role: string;
  rating: number;
  image: string;
  isOnline?: boolean;
  specialty: string;
}

export interface Service {
  id: string;
  category_id: string; // Link to ServiceCategory
  salon_id?: string; // Optional: If a specific salon overrides a global service
  name: string;
  duration: string;
  price: number;
  category: string; // Denormalized name for display convenience
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

export interface Review {
  id: string;
  salon_id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
}

export interface IYSLog {
    id: string;
    phone: string;
    message_type: 'OTP' | 'INFO' | 'CAMPAIGN';
    content: string;
    status: 'SENT' | 'FAILED' | 'DEMO'; // DEMO indicates simulated send
    created_at: string;
}
