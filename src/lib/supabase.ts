import { createClient } from '@supabase/supabase-js';
import { sampleCars, sampleHosts } from '@/data/sampleData';
import type { Car } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// The single host UUID, once you've created your real Supabase auth user
// and pasted the ID here. Used to gate the /admin route and as a fallback
// host_id when Supabase isn't configured yet.
export const DANIEL_HOST_ID = import.meta.env.VITE_HOST_ID || 'host-daniel';
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || '17.mateo@gmail.com';

// Fetch real cars from Supabase; silently fall back to the local fleet data
// (sampleCars) if Supabase isn't set up yet or the query fails. This means
// the site always shows Daniel's real 2 cars, with or without a live backend.
export const getCarsWithFallback = async (): Promise<Car[]> => {
  if (!isSupabaseConfigured) return sampleCars;
  try {
    const { data, error } = await getCars();
    if (error || !data || data.length === 0) return sampleCars;
    return data as unknown as Car[];
  } catch {
    return sampleCars;
  }
};

export const getCarByIdWithFallback = async (carId: string): Promise<Car | null> => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await getCarById(carId);
      if (!error && data) return data as unknown as Car;
    } catch { /* fall through to sample data */ }
  }
  return sampleCars.find(c => c.id === carId) || null;
};

export { sampleHosts };

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

// Stripe (via Supabase Edge Functions — see supabase/functions/)
export const createRentCheckout = async (bookingId: string) => {
  const { data, error } = await supabase.functions.invoke('create-rent-checkout', { body: { bookingId } });
  return { data, error };
};

export const createDepositCheckout = async (bookingId: string, depositAmount?: number) => {
  const { data, error } = await supabase.functions.invoke('create-deposit-checkout', { body: { bookingId, depositAmount } });
  return { data, error };
};

export const createIdentitySession = async (bookingId: string) => {
  const { data, error } = await supabase.functions.invoke('create-identity-session', { body: { bookingId } });
  return { data, error };
};

export const depositAction = async (bookingId: string, action: 'release' | 'capture_full' | 'capture_partial', amount?: number) => {
  const { data, error } = await supabase.functions.invoke('deposit-action', { body: { bookingId, action, amount } });
  return { data, error };
};

// Agreements (e-signed rental contracts)
export const createAgreement = async (agreementData: Record<string, unknown>) => {
  const { data, error } = await supabase.from('agreements').insert(agreementData).select().single();
  return { data, error };
};

// Maintenance
export const getMaintenanceForHost = async (hostId: string) => {
  const { data, error } = await supabase
    .from('maintenance')
    .select('*, car:cars!inner(*)')
    .eq('car.host_id', hostId)
    .order('next_due_date', { ascending: true });
  return { data, error };
};

export const createMaintenance = async (maintenanceData: Record<string, unknown>) => {
  const { data, error } = await supabase.from('maintenance').insert(maintenanceData).select().single();
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

// ── Order stage (Fleetwire-style reserved -> picked up -> returned) ──
export const updateOrderStage = async (bookingId: string, order_stage: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .update({ order_stage })
    .eq('id', bookingId)
    .select()
    .single();
  return { data, error };
};

// ── Coupons ──
export const getCoupons = async (hostId: string) => {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('host_id', hostId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const createCoupon = async (couponData: Record<string, unknown>) => {
  const { data, error } = await supabase.from('coupons').insert(couponData).select().single();
  return { data, error };
};

export const updateCoupon = async (couponId: string, updates: Record<string, unknown>) => {
  const { data, error } = await supabase.from('coupons').update(updates).eq('id', couponId).select().single();
  return { data, error };
};

// Looks up an active coupon by code for a given host — used at checkout.
export const lookupCoupon = async (hostId: string, code: string) => {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('host_id', hostId)
    .eq('code', code.trim().toUpperCase())
    .eq('is_active', true)
    .maybeSingle();
  return { data, error };
};

// ── Refunds ──
export const issueRefund = async (bookingId: string, amount: number) => {
  const { data, error } = await supabase.functions.invoke('issue-refund', { body: { bookingId, amount } });
  return { data, error };
};

// ── Payment links / partial (down) payments ──
export const createPaymentLinkCheckout = async (bookingId: string, amount: number, description?: string) => {
  const { data, error } = await supabase.functions.invoke('create-payment-link', { body: { bookingId, amount, description } });
  return { data, error };
};

// ── Message templates (automated messaging) ──
export const getMessageTemplates = async (hostId: string) => {
  const { data, error } = await supabase
    .from('message_templates')
    .select('*')
    .eq('host_id', hostId)
    .order('event_type', { ascending: true });
  return { data, error };
};

export const upsertMessageTemplate = async (templateData: Record<string, unknown>) => {
  const { data, error } = await supabase
    .from('message_templates')
    .upsert(templateData, { onConflict: 'host_id,event_type,channel' })
    .select()
    .single();
  return { data, error };
};

// ── Customer CRM (notes) ──
export const getCustomerNotes = async (hostId: string) => {
  const { data, error } = await supabase
    .from('customer_notes')
    .select('*')
    .eq('host_id', hostId);
  return { data, error };
};

export const upsertCustomerNote = async (hostId: string, renterId: string, note: string) => {
  const { data, error } = await supabase
    .from('customer_notes')
    .upsert({ host_id: hostId, renter_id: renterId, note }, { onConflict: 'host_id,renter_id' })
    .select()
    .single();
  return { data, error };
};

// ── Custom checkout fields ──
export const getCustomCheckoutFields = async (hostId: string) => {
  const { data, error } = await supabase
    .from('custom_checkout_fields')
    .select('*')
    .eq('host_id', hostId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  return { data, error };
};

export const getAllCustomCheckoutFields = async (hostId: string) => {
  const { data, error } = await supabase
    .from('custom_checkout_fields')
    .select('*')
    .eq('host_id', hostId)
    .order('sort_order', { ascending: true });
  return { data, error };
};

export const createCustomCheckoutField = async (fieldData: Record<string, unknown>) => {
  const { data, error } = await supabase.from('custom_checkout_fields').insert(fieldData).select().single();
  return { data, error };
};

export const updateCustomCheckoutField = async (fieldId: string, updates: Record<string, unknown>) => {
  const { data, error } = await supabase
    .from('custom_checkout_fields')
    .update(updates)
    .eq('id', fieldId)
    .select()
    .single();
  return { data, error };
};

export const deleteCustomCheckoutField = async (fieldId: string) => {
  const { error } = await supabase.from('custom_checkout_fields').delete().eq('id', fieldId);
  return { error };
};

// ── Staff / role accounts ──
// Invites a staff account. Supabase's client SDK can't create users directly
// (that needs the service-role key), so this calls an Edge Function that
// runs with admin rights on the server side.
export const inviteStaffAccount = async (email: string, fullName: string) => {
  const { data, error } = await supabase.functions.invoke('invite-staff', { body: { email, fullName } });
  return { data, error };
};

export const getStaffAccounts = async () => {
  const { data, error } = await supabase.from('profiles').select('*').eq('role', 'staff');
  return { data, error };
};

export const revokeStaffAccount = async (profileId: string) => {
  const { data, error } = await supabase.functions.invoke('revoke-staff', { body: { profileId } });
  return { data, error };
};

// ── Instant quote leads (homepage form — MMJ-style, no login required) ──
export const createQuoteRequest = async (quoteData: Record<string, unknown>) => {
  const { data, error } = await supabase.from('quote_requests').insert(quoteData).select().single();
  return { data, error };
};

export const getQuoteRequests = async () => {
  const { data, error } = await supabase
    .from('quote_requests')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
};

export const updateQuoteRequestStatus = async (quoteId: string, status: string) => {
  const { data, error } = await supabase
    .from('quote_requests')
    .update({ status })
    .eq('id', quoteId)
    .select()
    .single();
  return { data, error };
};

// Anonymous upload from the homepage quote form (quote-docs bucket).
export const uploadQuoteDoc = async (file: File, kind: 'license' | 'gigscreenshot') => {
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${kind}.${file.name.split('.').pop() || 'jpg'}`;
  const { error } = await supabase.storage.from('quote-docs').upload(path, file);
  if (error) return { path: null, error };
  return { path, error: null };
};

export const getSignedQuoteDocUrl = async (path: string) => {
  const { data, error } = await supabase.storage.from('quote-docs').createSignedUrl(path, 60 * 10);
  return { url: data?.signedUrl || null, error };
};

// ── Gig-worker verification uploads (license photo + gig trip screenshot) ──
// Files live in the private 'verification-docs' bucket, path-scoped to the
// uploading renter's own auth uid so RLS can allow only them + their booking's
// host to read it back. We store the PATH on the booking, not a URL, and
// generate a short-lived signed URL on demand when someone needs to view it.
export const uploadVerificationDoc = async (renterId: string, file: File, kind: 'license' | 'gigscreenshot') => {
  const path = `${renterId}/${Date.now()}-${kind}.${file.name.split('.').pop() || 'jpg'}`;
  const { error } = await supabase.storage.from('verification-docs').upload(path, file);
  if (error) return { path: null, error };
  return { path, error: null };
};

export const getSignedDocUrl = async (path: string) => {
  const { data, error } = await supabase.storage.from('verification-docs').createSignedUrl(path, 60 * 10);
  return { url: data?.signedUrl || null, error };
};

// ── Automated messaging trigger ──
// Fire-and-forget: call after a booking event (confirmed / requested / pickup / return).
// Safe to call even if Resend isn't configured yet — the Edge Function just no-ops.
export const sendBookingNotification = async (bookingId: string, eventType: string) => {
  try {
    await supabase.functions.invoke('send-notification', { body: { bookingId, eventType } });
  } catch {
    /* never block the booking flow on a notification failure */
  }
};

// ── Reports & analytics ──
// Simple CSV export helper — works entirely client-side, no backend needed.
export const exportToCsv = (filename: string, rows: Record<string, unknown>[]) => {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map(row =>
      headers.map(h => {
        const val = row[h] ?? '';
        const str = String(val).replace(/"/g, '""');
        return /[",\n]/.test(str) ? `"${str}"` : str;
      }).join(',')
    ),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
