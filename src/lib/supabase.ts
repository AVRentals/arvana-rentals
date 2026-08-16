import { createClient, processLock } from '@supabase/supabase-js';
import { sampleCars, sampleHosts } from '@/data/sampleData';
import type { Car } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// A network call that never settles leaves a form spinning "Submitting…"
// forever with nothing in the console — which is exactly how the quote form
// failed in testing. Every public-facing write goes through this so the worst
// case is a clear error the visitor can act on, not a dead button.
export class TimeoutError extends Error {
  constructor(seconds: number) {
    super(`Timed out after ${seconds}s — check your connection and try again.`);
    this.name = 'TimeoutError';
  }
}

export const withTimeout = async <T,>(
  promise: PromiseLike<T>,
  ms: number,
): Promise<T | { data: null; error: TimeoutError }> => {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<{ data: null; error: TimeoutError }>(resolve => {
    timer = setTimeout(() => resolve({ data: null, error: new TimeoutError(ms / 1000) }), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer!);
  }
};

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // THE FIX for "I click one thing, then nothing works until I refresh".
    //
    // By default the client guards token refresh with the browser's Web Locks
    // API. Opening a document in a new tab pushes this page to the background,
    // and a background tab can end up holding that lock indefinitely — after
    // which every query that needs auth waits forever. Buttons stop
    // responding, no error appears, and only a reload clears it.
    //
    // processLock is an in-memory queue instead: same protection against
    // overlapping refreshes, but it can't outlive the page or get stuck
    // behind another tab.
    lock: processLock,
  },
});

// Wraps an admin action so a stalled request surfaces as an error instead of
// a button that silently does nothing.
const guard = <T,>(p: PromiseLike<T>): Promise<T> =>
  withTimeout(p, 15000) as Promise<T>;

// ─────────────────────────────────────────────────────────────
// DIRECT REST LAYER (admin actions)
//
// Buttons in the Fleet Manager kept going dead until a page refresh. The
// cause is inside the Supabase client: its internal auth handling can stall
// after the page has been backgrounded (which is exactly what happens when
// you open a renter's document in a new tab), and a stalled call never
// settles — so the click appears to do nothing at all.
//
// Rather than keep guessing at that machinery, admin writes bypass it. These
// helpers talk to the same REST API with a plain fetch, an AbortController
// (so the promise ALWAYS settles), and a token we keep in memory. Nothing
// here can deadlock, and a failure is a real error you can see.
// ─────────────────────────────────────────────────────────────

let cachedAccessToken: string | null = null;

// Keep the token fresh in memory. onAuthStateChange fires on sign-in,
// sign-out and every token refresh, so this stays current without us ever
// having to ask the client for the session mid-click.
if (isSupabaseConfigured) {
  supabase.auth.onAuthStateChange((_event, session) => {
    cachedAccessToken = session?.access_token ?? null;
  });
  supabase.auth.getSession()
    .then(({ data }) => { cachedAccessToken = data.session?.access_token ?? null; })
    .catch(() => { /* the REST layer falls back to the anon key */ });
}

export const restRequest = async <T = unknown>(
  path: string,
  init: { method: string; body?: unknown; headers?: Record<string, string> },
): Promise<{ data: T | null; error: Error | null }> => {
  if (!isSupabaseConfigured) return { data: null, error: new Error('Supabase not configured') };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
      method: init.method,
      signal: controller.signal,
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${cachedAccessToken || supabaseAnonKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
        ...init.headers,
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      return { data: null, error: new Error(detail || `Request failed (${res.status})`) };
    }
    const text = await res.text();
    return { data: text ? (JSON.parse(text) as T) : null, error: null };
  } catch (err) {
    const aborted = err instanceof DOMException && err.name === 'AbortError';
    return {
      data: null,
      error: new Error(aborted ? 'Timed out — check your connection and try again.' : String(err)),
    };
  } finally {
    clearTimeout(timer);
  }
};

// SELECT rows. `query` is PostgREST syntax, e.g. "cars?host_id=eq.123&order=created_at.desc"
export const restSelect = async <T = unknown[]>(query: string) => {
  const { data, error } = await restRequest<T>(query, { method: 'GET' });
  return { data: (data ?? []) as T, error };
};

// Signs a storage object for temporary viewing, without going through the
// client. Same reasoning as the writes: a plain fetch always settles.
export const restSignUrl = async (bucket: string, path: string, expiresIn = 3600) => {
  if (!isSupabaseConfigured) return { url: null, error: new Error('Supabase not configured') };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(`${supabaseUrl}/storage/v1/object/sign/${bucket}/${path}`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${cachedAccessToken || supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ expiresIn }),
    });
    if (!res.ok) return { url: null, error: new Error(await res.text().catch(() => 'sign failed')) };
    const json = await res.json() as { signedURL?: string };
    return {
      url: json.signedURL ? `${supabaseUrl}/storage/v1${json.signedURL}` : null,
      error: null,
    };
  } catch (err) {
    return { url: null, error: err instanceof Error ? err : new Error(String(err)) };
  } finally {
    clearTimeout(timer);
  }
};

// INSERT a row.
export const restInsert = async (
  table: string,
  row: Record<string, unknown>,
  prefer = 'return=representation',
) => {
  const { data, error } = await restRequest<unknown[]>(table, {
    method: 'POST',
    body: row,
    headers: { Prefer: prefer },
  });
  return { data: Array.isArray(data) ? data[0] ?? null : data, error };
};

// PATCH a single row by id, the shape every admin button needs.
export const restUpdateById = async (table: string, id: string, patch: Record<string, unknown>) => {
  const { data, error } = await restRequest<unknown[]>(`${table}?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: patch,
  });
  return { data: Array.isArray(data) ? data[0] ?? null : data, error };
};

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

// True only when there's a live Supabase session belonging to the host.
// The Fleet Manager checks this on load: a stale "unlocked" flag in the
// browser without a real session would show empty tabs rather than an
// obvious "please sign in", which is exactly the confusion we hit before.
export const hasHostSession = async (): Promise<boolean> => {
  const res = await withTimeout(supabase.auth.getSession(), 10000) as
    { data?: { session?: { user?: { id: string }; access_token?: string } } };
  const session = res?.data?.session;
  if (!session?.user) return false;
  if (session.access_token) cachedAccessToken = session.access_token;
  const { data } = await restSelect<unknown[]>(`profiles?id=eq.${session.user.id}&select=is_host`);
  const row = Array.isArray(data) ? data[0] as { is_host?: boolean } | undefined : undefined;
  return Boolean(row?.is_host);
};

export const getProfile = async (userId: string) => {
  const { data, error } = await restSelect<unknown[]>(`profiles?id=eq.${userId}&select=*`);
  return { data: Array.isArray(data) ? data[0] ?? null : null, error };
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

export const getHostCars = (hostId: string) =>
  restSelect(`cars?host_id=eq.${hostId}&order=created_at.desc`);

export const createCar = (carData: Record<string, unknown>) =>
  restInsert('cars', carData);

export const updateCar = (carId: string, updates: Record<string, unknown>) =>
  restUpdateById('cars', carId, updates);

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

export const updateBookingStatus = (bookingId: string, status: string) =>
  restUpdateById('bookings', bookingId, { status });

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
export const getMaintenanceForHost = (hostId: string) =>
  restSelect(`maintenance?select=*,car:cars!inner(*)&car.host_id=eq.${hostId}&order=next_due_date.asc`);

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
export const updateOrderStage = (bookingId: string, stage: string) =>
  restUpdateById('bookings', bookingId, { order_stage: stage });

// ── Coupons ──
export const getCoupons = (hostId: string) =>
  restSelect(`coupons?host_id=eq.${hostId}&order=created_at.desc`);

export const createCoupon = (couponData: Record<string, unknown>) =>
  restInsert('coupons', couponData);

export const updateCoupon = (couponId: string, updates: Record<string, unknown>) =>
  restUpdateById('coupons', couponId, updates);

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
export const getMessageTemplates = (hostId: string) =>
  restSelect(`message_templates?host_id=eq.${hostId}`);

export const upsertMessageTemplate = (templateData: Record<string, unknown>) =>
  restInsert('message_templates', templateData, 'resolution=merge-duplicates,return=representation');

// ── Customer CRM (notes) ──
export const getCustomerNotes = (hostId: string) =>
  restSelect(`customer_notes?host_id=eq.${hostId}&order=created_at.desc`);

export const upsertCustomerNote = (hostId: string, renterId: string, note: string) =>
  restInsert('customer_notes', { host_id: hostId, renter_id: renterId, note });

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

export const getAllCustomCheckoutFields = (hostId: string) =>
  restSelect(`custom_checkout_fields?host_id=eq.${hostId}&order=sort_order.asc`);

export const createCustomCheckoutField = (fieldData: Record<string, unknown>) =>
  restInsert('custom_checkout_fields', fieldData);

export const updateCustomCheckoutField = (fieldId: string, updates: Record<string, unknown>) =>
  restUpdateById('custom_checkout_fields', fieldId, updates);

export const deleteCustomCheckoutField = (fieldId: string) =>
  restRequest(`custom_checkout_fields?id=eq.${encodeURIComponent(fieldId)}`, { method: 'DELETE' });

// ── Staff / role accounts ──
// Invites a staff account. Supabase's client SDK can't create users directly
// (that needs the service-role key), so this calls an Edge Function that
// runs with admin rights on the server side.
export const inviteStaffAccount = async (email: string, fullName: string) => {
  const { data, error } = await supabase.functions.invoke('invite-staff', { body: { email, fullName } });
  return { data, error };
};

export const getStaffAccounts = () =>
  restSelect('profiles?role=eq.staff&order=created_at.desc');

export const revokeStaffAccount = async (profileId: string) => {
  const { data, error } = await supabase.functions.invoke('revoke-staff', { body: { profileId } });
  return { data, error };
};

// ── Instant quote leads (homepage form — MMJ-style, no login required) ──
// NOTE: no .select() here on purpose. Adding it asks Postgres to return the
// row it just wrote, and our RLS only lets a logged-in host READ quote
// requests — so for an ordinary (anonymous) visitor the read-back is denied
// and the whole insert fails. Fire-and-forget is what this table needs: the
// visitor doesn't need the row back, only the host reads these.
export const createQuoteRequest = async (quoteData: Record<string, unknown>) => {
  const { error } = await withTimeout(
    supabase.from('quote_requests').insert(quoteData),
    20000,
  );
  return { data: null, error };
};

export const getQuoteRequests = () =>
  restSelect('quote_requests?order=created_at.desc');

export const updateQuoteRequestStatus = (quoteId: string, status: string) =>
  restUpdateById('quote_requests', quoteId, { status });

// ─────────────────────────────────────────
// CONTACT MESSAGES (the /contact page form)
// ─────────────────────────────────────────
// Same reasoning as createQuoteRequest — anonymous senders can INSERT but
// must not ask for the row back.
export const createContactMessage = async (messageData: Record<string, unknown>) => {
  const { error } = await withTimeout(
    supabase.from('contact_messages').insert(messageData),
    20000,
  );
  return { data: null, error };
};

export const getContactMessages = () =>
  restSelect('contact_messages?order=created_at.desc');

export const updateContactMessageStatus = (messageId: string, status: string) =>
  restUpdateById('contact_messages', messageId, { status });

// Record money collected outside Stripe (cash, Zelle, Cash App...) so the
// Payment Status board reflects reality, not just card payments.
export const recordManualPayment = (bookingId: string, amountPaid: number, balanceDue: number) =>
  restUpdateById('bookings', bookingId, { amount_paid: amountPaid, balance_due: balanceDue });

// Emails an applicant their approval/decline. Never blocks the decision
// itself — if email isn't configured yet, the status still changes and the
// caller can fall back to texting them.
export const sendApplicationDecision = async (
  quoteRequestId: string,
  decision: 'approved' | 'declined',
): Promise<{ sent: boolean }> => {
  try {
    const { data, error } = await withTimeout(
      supabase.functions.invoke('send-application-email', { body: { quoteRequestId, decision } }),
      15000,
    ) as { data?: { ok?: boolean } | null; error?: unknown };
    if (error) return { sent: false };
    return { sent: Boolean((data as { ok?: boolean } | null)?.ok) };
  } catch {
    return { sent: false };
  }
};

// The renter's own application, so their profile page can show them exactly
// what we hold on them. Returns the most recent one if they applied twice.
export const getMyApplication = async (email: string) => {
  if (!isSupabaseConfigured || !email) return null;
  const { data, error } = await restSelect<unknown[]>(
    `quote_requests?email=eq.${encodeURIComponent(email)}&order=created_at.desc&limit=1`);
  if (error || !Array.isArray(data) || !data.length) return null;
  return data[0] as import('@/types').QuoteRequest;
};

// Does this email address have an approved application? The booking flow
// checks this so an account alone can't get someone to checkout — approval
// is what unlocks renting.
export const hasApprovedApplication = async (email: string): Promise<boolean> => {
  if (!isSupabaseConfigured || !email) return false;
  const { data, error } = await restSelect<unknown[]>(
    `quote_requests?email=eq.${encodeURIComponent(email)}&status=eq.approved&limit=1`);
  if (error) return false;
  return Array.isArray(data) && data.length > 0;
};

// The signed rental agreement tied to a booking (legal record).
export const getAgreementForBooking = async (bookingId: string) => {
  const { data, error } = await restSelect<unknown[]>(`agreements?booking_id=eq.${bookingId}&limit=1`);
  return { data: Array.isArray(data) ? data[0] ?? null : null, error };
};

// Anonymous upload from the homepage quote form (quote-docs bucket).
// Phone photos are routinely 3–8 MB, so this gets a longer leash than the
// database writes — but still a finite one, so a stalled upload on a weak
// connection can't freeze the form.
export const uploadQuoteDoc = async (file: File, kind: 'license' | 'gigscreenshot' | 'insurance') => {
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${kind}.${file.name.split('.').pop() || 'jpg'}`;
  const { error } = await withTimeout(supabase.storage.from('quote-docs').upload(path, file), 60000);
  if (error) return { path: null, error };
  return { path, error: null };
};

export const getSignedQuoteDocUrl = (path: string, expiresInSeconds = 60 * 60) =>
  restSignUrl('quote-docs', path, expiresInSeconds);

// ── Gig-worker verification uploads (license photo + gig trip screenshot) ──
// Files live in the private 'verification-docs' bucket, path-scoped to the
// uploading renter's own auth uid so RLS can allow only them + their booking's
// host to read it back. We store the PATH on the booking, not a URL, and
// generate a short-lived signed URL on demand when someone needs to view it.
export const uploadVerificationDoc = async (renterId: string, file: File, kind: 'license' | 'gigscreenshot' | 'insurance') => {
  const path = `${renterId}/${Date.now()}-${kind}.${file.name.split('.').pop() || 'jpg'}`;
  const { error } = await supabase.storage.from('verification-docs').upload(path, file);
  if (error) return { path: null, error };
  return { path, error: null };
};

export const getSignedDocUrl = (path: string, expiresInSeconds = 60 * 60) =>
  restSignUrl('verification-docs', path, expiresInSeconds);

// Builds every document link the Fleet Manager needs in one pass, up front.
// Doing it per-click meant an await between the click and window.open, which
// browsers treat as an unrequested popup — and a request that occasionally
// hung left a blank tab with no error. Pre-signing means clicking a document
// is instant and synchronous, with nothing to fail at that moment.
export const signDocUrls = async (
  quotePaths: string[],
  verificationPaths: string[],
): Promise<Record<string, string>> => {
  if (!isSupabaseConfigured) return {};
  const map: Record<string, string> = {};
  const jobs = [
    ...quotePaths.map(p => ({ path: p, bucket: 'quote-docs' })),
    ...verificationPaths.map(p => ({ path: p, bucket: 'verification-docs' })),
  ];
  await Promise.all(jobs.map(async ({ path, bucket }) => {
    const { url } = await restSignUrl(bucket, path);
    if (url) map[path] = url;
  }));
  return map;
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
