import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signUp = async (email: string, password: string, fullName: string, isHost: boolean) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        is_host: isHost,
      },
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const updateProfile = async (userId: string, updates: Record<string, unknown>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

// Cars
export const getCars = async (filters?: Record<string, unknown>) => {
  let query = supabase
    .from('cars')
    .select('*, host:profiles(*)')
    .eq('is_available', true)
    .eq('is_approved', true);

  if (filters?.category && filters.category !== 'all') {
    query = query.eq('category', filters.category);
  }
  if (filters?.city) {
    query = query.ilike('city', `%${filters.city}%`);
  }
  if (filters?.minPrice) {
    query = query.gte('daily_rate', filters.minPrice);
  }
  if (filters?.maxPrice) {
    query = query.lte('daily_rate', filters.maxPrice);
  }
  if (filters?.seats) {
    query = query.gte('seats', filters.seats);
  }
  if (filters?.transmission && filters.transmission !== 'all') {
    query = query.eq('transmission', filters.transmission);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  return { data, error };
};

export const getCarById = async (carId: string) => {
  const { data, error } = await supabase
    .from('cars')
    .select('*, host:profiles(*)')
    .eq('id', carId)
    .single();
  return { data, error };
};

export const getHostCars = async (hostId: string) => {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('host_id', hostId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const createCar = async (carData: Record<string, unknown>) => {
  const { data, error } = await supabase.from('cars').insert(carData).select().single();
  return { data, error };
};

export const updateCar = async (carId: string, updates: Record<string, unknown>) => {
  const { data, error } = await supabase
    .from('cars')
    .update(updates)
    .eq('id', carId)
    .select()
    .single();
  return { data, error };
};

// Bookings
export const createBooking = async (bookingData: Record<string, unknown>) => {
  const { data, error } = await supabase.from('bookings').insert(bookingData).select().single();
  return { data, error };
};

export const getBookingById = async (bookingId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, car:cars(*, host:profiles(*)), renter:profiles!renter_id(*)')
    .eq('id', bookingId)
    .single();
  return { data, error };
};

export const getRenterBookings = async (renterId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, car:cars(*)')
    .eq('renter_id', renterId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const getHostBookings = async (hostId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, car:cars(*), renter:profiles!renter_id(*)')
    .eq('host_id', hostId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const updateBookingStatus = async (bookingId: string, status: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .select()
    .single();
  return { data, error };
};

// Reviews
export const getCarReviews = async (carId: string) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, reviewer:profiles!reviewer_id(*)')
    .eq('car_id', carId)
    .eq('type', 'car')
    .order('created_at', { ascending: false });
  return { data, error };
};

export const createReview = async (reviewData: Record<string, unknown>) => {
  const { data, error } = await supabase.from('reviews').insert(reviewData).select().single();
  return { data, error };
};

// Messages
export const getMessages = async (bookingId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*, sender:profiles!sender_id(*)')
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: true });
  return { data, error };
};

export const sendMessage = async (messageData: Record<string, unknown>) => {
  const { data, error } = await supabase.from('messages').insert(messageData).select().single();
  return { data, error };
};
