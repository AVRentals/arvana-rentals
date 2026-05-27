export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  bio?: string;
  is_host: boolean;
  driver_license_verified: boolean;
  created_at: string;
}

export type CarCategory = 'economy' | 'suv' | 'luxury' | 'electric' | 'sports';
export type Transmission = 'auto' | 'manual';
export type FuelType = 'gasoline' | 'diesel' | 'electric' | 'hybrid';

export interface Car {
  id: string;
  host_id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  license_plate?: string;
  description: string;
  category: CarCategory;
  daily_rate: number;
  location: string;
  city: string;
  state: string;
  seats: number;
  transmission: Transmission;
  fuel_type: FuelType;
  features: string[];
  images: string[];
  is_available: boolean;
  is_approved: boolean;
  rating: number;
  total_trips: number;
  created_at: string;
  host?: Profile;
}

export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  car_id: string;
  renter_id: string;
  host_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  daily_rate: number;
  subtotal: number;
  service_fee: number;
  total_amount: number;
  status: BookingStatus;
  pickup_location: string;
  dropoff_location?: string;
  stripe_payment_intent_id?: string;
  created_at: string;
  car?: Car;
  renter?: Profile;
  host?: Profile;
}

export interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  reviewee_id: string;
  car_id?: string;
  rating: number;
  comment: string;
  type: 'car' | 'host' | 'renter';
  created_at: string;
  reviewer?: Profile;
}

export interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
}

export interface SearchFilters {
  location?: string;
  startDate?: string;
  endDate?: string;
  category?: CarCategory | 'all';
  minPrice?: number;
  maxPrice?: number;
  seats?: number;
  transmission?: Transmission | 'all';
  fuelType?: FuelType | 'all';
  instantBook?: boolean;
  sortBy?: 'recommended' | 'price_asc' | 'price_desc' | 'top_rated';
}
