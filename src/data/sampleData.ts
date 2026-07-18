import { Car, Booking, Review, Profile, Maintenance } from '@/types';

// This is the ONE host: Daniel, owner-operator of Arvana Rentals.
// This file is used as a fallback so the site still renders real content
// before a Supabase project is connected. Once VITE_SUPABASE_URL /
// VITE_SUPABASE_ANON_KEY are set, pages fetch live data instead.
export const sampleHosts: Profile[] = [
  {
    id: 'host-daniel',
    full_name: 'Daniel M.',
    avatar_url: undefined,
    phone: undefined,
    bio: 'Owner-operator of Arvana Rentals. I personally inspect, maintain, and hand off every car — no call center, no corporate fleet.',
    is_host: true,
    driver_license_verified: true,
    created_at: '2026-07-01T00:00:00Z',
  },
];

export const sampleCars: Car[] = [
  {
    id: 'car-corolla',
    host_id: 'host-daniel',
    make: 'Toyota',
    model: 'Corolla',
    year: 2014,
    color: 'White',
    license_plate: 'SPZQ90',
    vin: '2T1BURHE4EC040001',
    description: 'Clean, reliable daily driver. Great on gas and easy to park. Full pre-rental inspection completed before every trip.',
    category: 'economy',
    daily_rate: 57,
    weekly_rate: 400,
    monthly_rate: 1600,
    location: 'TBD',
    city: 'TBD',
    state: 'FL',
    seats: 5,
    transmission: 'auto',
    fuel_type: 'gasoline',
    features: ['Bluetooth', 'Backup Camera', 'AC', 'USB'],
    images: [
      'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=500&fit=crop',
    ],
    is_available: true,
    is_approved: true,
    rating: 0,
    total_trips: 0,
    odometer: 137000,
    gps_provider: 'Trackhawk',
    purchase_price: 4300,
    purchase_date: '2026-07-06',
    created_at: '2026-07-06T00:00:00Z',
    host: sampleHosts[0],
  },
  {
    id: 'car-camry',
    host_id: 'host-daniel',
    make: 'Toyota',
    model: 'Camry',
    year: 2018,
    color: 'Black',
    license_plate: 'TBD',
    vin: '4T1B11HK7JU023752',
    description: 'Comfortable, roomy sedan. Recently acquired — full inspection scheduled before first rental.',
    category: 'economy',
    daily_rate: 65,
    location: 'TBD',
    city: 'TBD',
    state: 'FL',
    seats: 5,
    transmission: 'auto',
    fuel_type: 'gasoline',
    features: ['Bluetooth', 'Backup Camera', 'AC', 'USB'],
    images: [
      'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&h=500&fit=crop',
    ],
    is_available: true,
    is_approved: true,
    rating: 0,
    total_trips: 0,
    odometer: 228400,
    gps_provider: 'Trackhawk',
    purchase_price: 7500,
    purchase_date: '2026-07-14',
    created_at: '2026-07-14T00:00:00Z',
    host: sampleHosts[0],
  },
];

export const sampleMaintenance: Maintenance[] = [
  {
    id: 'maint-1',
    car_id: 'car-corolla',
    service_type: 'Pre-Rental Full Inspection',
    mileage: 137000,
    next_due_date: '2026-07-17',
    next_due_miles: 137000,
    notes: 'High-mileage used car, first acquisition - check oil/fluids, brakes, tires, belts, timing chain & water pump history, spark plugs before first rental.',
    created_at: '2026-07-06T00:00:00Z',
  },
  {
    id: 'maint-2',
    car_id: 'car-camry',
    service_type: 'Pre-Rental Full Inspection',
    mileage: 228400,
    next_due_date: '2026-07-17',
    next_due_miles: 228400,
    notes: 'Second acquisition - check oil/fluids, brakes, tires, belts, timing chain & water pump history, spark plugs before first rental.',
    created_at: '2026-07-14T00:00:00Z',
  },
];

// No reviews or completed trips yet — this is a brand new operation.
export const sampleReviews: Review[] = [];

// No bookings yet.
export const sampleBookings: Booking[] = [];

export const categories = [
  { id: 'all', label: 'All Cars', icon: '🚗' },
  { id: 'economy', label: 'Economy', icon: '💰' },
  { id: 'suv', label: 'SUV', icon: '🚙' },
  { id: 'luxury', label: 'Luxury', icon: '👑' },
  { id: 'electric', label: 'Electric', icon: '⚡' },
  { id: 'sports', label: 'Sports', icon: '🏎️' },
];

// Real earnings will populate this once bookings exist. Empty until then —
// no fabricated revenue numbers.
export const monthlyEarnings: { month: string; earnings: number }[] = [];
