export type ProfileRole = 'owner' | 'staff';

export interface Profile {
  id: string;
  full_name: string;
  email?: string;
  avatar_url?: string;
  phone?: string;
  bio?: string;
  is_host: boolean;
  driver_license_verified: boolean;
  role?: ProfileRole;
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
  vin?: string;
  description: string;
  category: CarCategory;
  daily_rate: number;
  weekly_rate?: number;
  monthly_rate?: number;
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
  odometer?: number;
  gps_provider?: string;
  purchase_price?: number;
  purchase_date?: string;
  created_at: string;
  host?: Profile;
}

export interface Maintenance {
  id: string;
  car_id: string;
  service_type: string;
  date_done?: string;
  mileage?: number;
  cost?: number;
  shop?: string;
  next_due_date?: string;
  next_due_miles?: number;
  notes?: string;
  created_at: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
export type DepositStatus = 'none' | 'held' | 'captured' | 'released' | 'forfeited';
export type IdentityVerificationStatus = 'not_started' | 'pending' | 'verified' | 'failed';
export type OrderStage = 'reserved' | 'picked_up' | 'returned';
export type RefundStatus = 'none' | 'requested' | 'issued';

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
  deposit_amount?: number;
  deposit_stripe_intent_id?: string;
  deposit_status?: DepositStatus;
  identity_verification_status?: IdentityVerificationStatus;
  stripe_identity_session_id?: string;
  renter_has_insurance?: boolean;
  renter_insurance_company?: string;
  renter_insurance_policy_number?: string;
  order_stage?: OrderStage;
  coupon_code?: string;
  discount_amount?: number;
  refund_amount?: number;
  refund_status?: RefundStatus;
  refunded_at?: string;
  balance_due?: number;
  custom_field_responses?: Record<string, string | boolean>;
  is_gig_worker?: boolean;
  gig_platform?: string;
  date_of_birth?: string;
  license_photo_path?: string;
  gig_screenshot_path?: string;
  insurance_doc_path?: string;
  created_at: string;
  car?: Car;
  renter?: Profile;
  host?: Profile;
}

export interface Coupon {
  id: string;
  host_id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  max_uses?: number;
  times_used: number;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}

export type MessageEventType = 'booking_confirmed' | 'pickup_reminder' | 'return_reminder' | 'booking_requested';

export interface MessageTemplate {
  id: string;
  host_id: string;
  event_type: MessageEventType;
  channel: 'email' | 'sms';
  subject?: string;
  body: string;
  is_active: boolean;
  created_at: string;
}

export interface CustomerNote {
  id: string;
  host_id: string;
  renter_id: string;
  note: string;
  created_at: string;
}

export type QuoteRequestStatus = 'new' | 'contacted' | 'closed';

export interface QuoteRequest {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  pickup_date?: string;
  pickup_time?: string;
  return_date?: string;
  is_gig_worker?: boolean;
  gig_screenshot_path?: string;
  license_photo_path?: string;
  status: QuoteRequestStatus;
  created_at: string;
}

export interface CustomCheckoutField {
  id: string;
  host_id: string;
  label: string;
  field_type: 'text' | 'select' | 'checkbox';
  options: string[];
  is_required: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Agreement {
  id: string;
  booking_id: string;
  signer_name: string;
  signer_email?: string;
  contract_version: string;
  contract_text: string;
  signed_at: string;
  ip_address?: string;
  user_agent?: string;
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
