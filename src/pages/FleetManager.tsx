import React, { useEffect, useState } from 'react';
import {
  Car as CarIcon, Calendar, Wrench, LayoutDashboard, Check, X,
  Lock, MapPin, Gauge, DollarSign, AlertTriangle, ExternalLink, Plus, Pencil,
  Tag, Users, MessageSquare, BarChart3, UserCog, Settings as SettingsIcon,
  Trash2, Send, RotateCcw, ArrowRight, Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  isSupabaseConfigured, DANIEL_HOST_ID, ADMIN_EMAIL,
  getHostCars, getHostBookings, getMaintenanceForHost, updateBookingStatus, depositAction,
  createCar, updateCar, updateOrderStage, issueRefund, createPaymentLinkCheckout, getSignedDocUrl,
  getQuoteRequests, updateQuoteRequestStatus, getSignedQuoteDocUrl,
  getCoupons, createCoupon, updateCoupon,
  getMessageTemplates, upsertMessageTemplate,
  getCustomerNotes, upsertCustomerNote,
  getAllCustomCheckoutFields, createCustomCheckoutField, updateCustomCheckoutField, deleteCustomCheckoutField,
  getStaffAccounts, inviteStaffAccount, revokeStaffAccount,
  exportToCsv,
} from '@/lib/supabase';
import CarFormModal, { formValuesToCarData, type CarFormValues } from '@/components/CarFormModal';
import { sampleCars, sampleBookings, sampleMaintenance } from '@/data/sampleData';
import {
  Car, Booking, Maintenance, Coupon, MessageTemplate, MessageEventType,
  CustomerNote, CustomCheckoutField, Profile, OrderStage, QuoteRequest, QuoteRequestStatus,
} from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  pending: 'warning',
  confirmed: 'success',
  active: 'electric',
  completed: 'secondary',
  cancelled: 'destructive',
};

const STAGE_LABELS: Record<OrderStage, string> = {
  reserved: 'Reserved',
  picked_up: 'Picked up',
  returned: 'Returned',
};
const STAGE_ORDER: OrderStage[] = ['reserved', 'picked_up', 'returned'];

const EVENT_LABELS: Record<MessageEventType, string> = {
  booking_requested: 'Booking requested (renter submits)',
  booking_confirmed: 'Booking confirmed (you approve)',
  pickup_reminder: 'Pickup reminder',
  return_reminder: 'Return reminder',
};

const NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'cars', label: 'My Cars', icon: CarIcon },
  { id: 'requests', label: 'Booking Requests', icon: Calendar },
  { id: 'quotes', label: 'Quote Leads', icon: Send },
  { id: 'orders', label: 'Orders & Lot', icon: ArrowRight },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench },
  { id: 'coupons', label: 'Coupons', icon: Tag },
  { id: 'messaging', label: 'Messaging', icon: MessageSquare },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'staff', label: 'Staff', icon: UserCog },
  { id: 'settings', label: 'Checkout Fields', icon: SettingsIcon },
];

// ── Simple password gate ────────────────────────────────────────────
// This is a solo-operator admin panel, not a multi-user auth system —
// a single shared password is enough for now. Set VITE_ADMIN_PASSWORD
// in your .env / Vercel env vars to something only you know.
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'arvana2026';
const SESSION_KEY = 'fleet_admin_ok';

const PasswordGate: React.FC<{ onUnlock: () => void }> = ({ onUnlock }) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      onUnlock();
    } else {
      setError('Wrong password');
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0e0e1e] px-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white dark:bg-charcoal-900 rounded-2xl border shadow-xl p-6 space-y-4">
        <div className="flex items-center gap-2 font-extrabold text-lg">
          <Lock className="w-5 h-5 text-gold-500" /> Fleet Manager
        </div>
        <p className="text-sm text-muted-foreground">Admin-only. Not linked from the public site.</p>
        <input
          type="password"
          autoFocus
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Password"
          className="w-full border rounded-xl px-3 py-2.5 text-sm bg-muted outline-none focus:ring-2 focus:ring-gold-400"
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <Button type="submit" className="w-full font-bold">Unlock</Button>
        {ADMIN_PASSWORD === 'arvana2026' && (
          <p className="text-xs text-amber-600 flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            You're using the default password — set VITE_ADMIN_PASSWORD in your env vars before this goes live.
          </p>
        )}
      </form>
    </div>
  );
};

// ── Message template editor (used in the Messaging tab) ────────────
const TemplateEditor: React.FC<{
  eventType: MessageEventType;
  label: string;
  initialSubject: string;
  initialBody: string;
  initialActive: boolean;
  onSave: (eventType: MessageEventType, subject: string, body: string, isActive: boolean) => void;
}> = ({ eventType, label, initialSubject, initialBody, initialActive, onSave }) => {
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [active, setActive] = useState(initialActive);

  return (
    <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl border p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm">{label}</h3>
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} /> Active
        </label>
      </div>
      <Input placeholder="Subject line" value={subject} onChange={e => setSubject(e.target.value)} />
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Hi {{renter_name}}, your booking for the {{car}} is..."
        className="w-full rounded-xl border px-3 py-2 text-sm bg-muted outline-none focus:ring-2 focus:ring-gold-400 min-h-[100px]"
      />
      <Button variant="outline" size="sm" onClick={() => onSave(eventType, subject, body, active)}>Save template</Button>
    </div>
  );
};

const FleetManager: React.FC = () => {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');
  const [activeNav, setActiveNav] = useState('overview');
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestFilter, setRequestFilter] = useState('all');
  const [carFormOpen, setCarFormOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  // Fleetwire-parity feature state
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [customerNotes, setCustomerNotes] = useState<CustomerNote[]>([]);
  const [checkoutFields, setCheckoutFields] = useState<CustomCheckoutField[]>([]);
  const [staff, setStaff] = useState<Profile[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  // NOTE: these must stay above the early `if (!unlocked) / if (loading) return`
  // statements below — React hooks can't be called conditionally, and putting
  // them after an early return caused a white-screen crash once loading flipped
  // from true to false (different number of hooks fired between renders).
  const [newCoupon, setNewCoupon] = useState({ code: '', discount_type: 'percent' as 'percent' | 'fixed', discount_value: '', max_uses: '', expires_at: '' });
  const [newField, setNewField] = useState({ label: '', field_type: 'text' as 'text' | 'select' | 'checkbox', options: '', is_required: false });
  const [staffEmail, setStaffEmail] = useState('');
  const [staffName, setStaffName] = useState('');

  const loadData = async () => {
    setLoading(true);
    if (isSupabaseConfigured) {
      const [carsRes, bookingsRes, maintRes, couponsRes, templatesRes, notesRes, fieldsRes, staffRes, quotesRes] = await Promise.all([
        getHostCars(DANIEL_HOST_ID),
        getHostBookings(DANIEL_HOST_ID),
        getMaintenanceForHost(DANIEL_HOST_ID),
        getCoupons(DANIEL_HOST_ID),
        getMessageTemplates(DANIEL_HOST_ID),
        getCustomerNotes(DANIEL_HOST_ID),
        getAllCustomCheckoutFields(DANIEL_HOST_ID),
        getStaffAccounts(),
        getQuoteRequests(),
      ]);
      setCars((carsRes.data as unknown as Car[]) || sampleCars);
      setBookings((bookingsRes.data as unknown as Booking[]) || sampleBookings);
      setMaintenance((maintRes.data as unknown as Maintenance[]) || sampleMaintenance);
      setCoupons((couponsRes.data as unknown as Coupon[]) || []);
      setTemplates((templatesRes.data as unknown as MessageTemplate[]) || []);
      setCustomerNotes((notesRes.data as unknown as CustomerNote[]) || []);
      setCheckoutFields((fieldsRes.data as unknown as CustomCheckoutField[]) || []);
      setStaff((staffRes.data as unknown as Profile[]) || []);
      setQuotes((quotesRes.data as unknown as QuoteRequest[]) || []);
    } else {
      setCars(sampleCars);
      setBookings(sampleBookings);
      setMaintenance(sampleMaintenance);
    }
    setLoading(false);
  };

  useEffect(() => { if (unlocked) loadData(); }, [unlocked]);

  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />;
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading fleet data…</div>;

  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const dueMaintenanceCount = maintenance.filter(m => m.next_due_date && new Date(m.next_due_date) <= new Date()).length;
  const filteredBookings = requestFilter === 'all' ? bookings : bookings.filter(b => b.status === requestFilter);

  const handleAction = async (bookingId: string, status: 'confirmed' | 'cancelled') => {
    if (isSupabaseConfigured) {
      const { error } = await updateBookingStatus(bookingId, status);
      if (error) { toast.error('Could not update — check Supabase connection'); return; }
    }
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
    toast.success(status === 'confirmed' ? 'Approved — renter can now pay & verify ID' : 'Request declined');
  };

  const openAddCar = () => { setEditingCar(null); setCarFormOpen(true); };
  const openEditCar = (car: Car) => { setEditingCar(car); setCarFormOpen(true); };
  const closeCarForm = () => setCarFormOpen(false);

  const handleSaveCar = async (values: CarFormValues) => {
    const carData = formValuesToCarData(values);

    if (isSupabaseConfigured) {
      if (editingCar) {
        const { error } = await updateCar(editingCar.id, carData);
        if (error) { toast.error('Could not save — check Supabase connection'); return; }
      } else {
        const { error } = await createCar({ ...carData, host_id: DANIEL_HOST_ID });
        if (error) { toast.error('Could not save — check Supabase connection'); return; }
      }
      await loadData();
    } else {
      // No Supabase yet — update local state so you can still see it work,
      // but it won't persist across a page reload until Supabase is connected.
      if (editingCar) {
        setCars(prev => prev.map(c => c.id === editingCar.id ? { ...c, ...carData } as Car : c));
      } else {
        const newCar: Car = { id: `local-${Date.now()}`, rating: 0, total_trips: 0, created_at: new Date().toISOString(), host_id: DANIEL_HOST_ID, ...carData } as unknown as Car;
        setCars(prev => [...prev, newCar]);
      }
      toast('Saved locally — connect Supabase to make this permanent', { icon: 'ℹ️' });
    }

    setCarFormOpen(false);
    toast.success(editingCar ? 'Car updated' : 'Car added');
  };

  const handleDeposit = async (bookingId: string, action: 'release' | 'capture_full') => {
    if (!isSupabaseConfigured) { toast.error('Connect Supabase + Stripe to manage real deposits'); return; }
    const { error } = await depositAction(bookingId, action);
    if (error) { toast.error('Could not update deposit — check Stripe setup'); return; }
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, deposit_status: action === 'release' ? 'released' : 'captured' } : b));
    toast.success(action === 'release' ? 'Deposit released' : 'Deposit captured');
  };

  // ── Order stage (reserved -> picked up -> returned) ──
  const handleAdvanceStage = async (bookingId: string, current: OrderStage) => {
    const next = STAGE_ORDER[STAGE_ORDER.indexOf(current) + 1];
    if (!next) return;
    if (isSupabaseConfigured) {
      const { error } = await updateOrderStage(bookingId, next);
      if (error) { toast.error('Could not update — check Supabase connection'); return; }
    }
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, order_stage: next } : b));
    toast.success(`Marked as ${STAGE_LABELS[next]}`);
  };

  // ── Refunds & payment links ──
  const handleRefund = async (bookingId: string, maxAmount: number) => {
    if (!isSupabaseConfigured) { toast.error('Connect Supabase + Stripe to issue real refunds'); return; }
    const input = window.prompt(`Refund amount (up to ${formatCurrency(maxAmount)}):`, String(maxAmount));
    if (!input) return;
    const amount = Number(input);
    if (!amount || amount <= 0) { toast.error('Enter a valid amount'); return; }
    const { error } = await issueRefund(bookingId, amount);
    if (error) { toast.error('Refund failed — check Stripe setup'); return; }
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, refund_amount: amount, refund_status: 'issued' } : b));
    toast.success(`Refund of ${formatCurrency(amount)} issued`);
  };

  const handleQuoteStatus = async (quoteId: string, status: QuoteRequestStatus) => {
    if (isSupabaseConfigured) {
      const { error } = await updateQuoteRequestStatus(quoteId, status);
      if (error) { toast.error('Could not update — check Supabase connection'); return; }
    }
    setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status } : q));
    toast.success(`Marked ${status}`);
  };

  const handleViewQuoteDoc = async (path: string) => {
    if (!isSupabaseConfigured) { toast.error('Connect Supabase to view uploaded documents'); return; }
    const { url, error } = await getSignedQuoteDocUrl(path);
    if (error || !url) { toast.error('Could not load that document'); return; }
    window.open(url, '_blank');
  };

  const handleViewDoc = async (path: string) => {
    if (!isSupabaseConfigured) { toast.error('Connect Supabase to view uploaded documents'); return; }
    const { url, error } = await getSignedDocUrl(path);
    if (error || !url) { toast.error('Could not load that document'); return; }
    window.open(url, '_blank');
  };

  const handleSendPaymentLink = async (bookingId: string) => {
    if (!isSupabaseConfigured) { toast.error('Connect Supabase + Stripe to send real payment links'); return; }
    const input = window.prompt('Amount to request from the renter ($):');
    if (!input) return;
    const amount = Number(input);
    if (!amount || amount <= 0) { toast.error('Enter a valid amount'); return; }
    const { data, error } = await createPaymentLinkCheckout(bookingId, amount, 'Additional charge');
    if (error || !data?.url) { toast.error('Could not create payment link — check Stripe setup'); return; }
    await navigator.clipboard.writeText(data.url).catch(() => {});
    toast.success('Payment link copied to clipboard — send it to the renter');
  };

  // ── Coupons ──
  const handleCreateCoupon = async () => {
    if (!newCoupon.code || !newCoupon.discount_value) { toast.error('Enter a code and discount value'); return; }
    const payload = {
      host_id: DANIEL_HOST_ID,
      code: newCoupon.code.trim().toUpperCase(),
      discount_type: newCoupon.discount_type,
      discount_value: Number(newCoupon.discount_value),
      max_uses: newCoupon.max_uses ? Number(newCoupon.max_uses) : null,
      expires_at: newCoupon.expires_at || null,
      is_active: true,
    };
    if (isSupabaseConfigured) {
      const { data, error } = await createCoupon(payload);
      if (error) { toast.error('Could not save coupon — check Supabase connection'); return; }
      setCoupons(prev => [data as unknown as Coupon, ...prev]);
    } else {
      setCoupons(prev => [{ ...payload, id: `local-${Date.now()}`, times_used: 0, created_at: new Date().toISOString() } as Coupon, ...prev]);
      toast('Saved locally — connect Supabase to make this permanent', { icon: 'ℹ️' });
    }
    setNewCoupon({ code: '', discount_type: 'percent', discount_value: '', max_uses: '', expires_at: '' });
    toast.success('Coupon created');
  };

  const handleToggleCoupon = async (coupon: Coupon) => {
    if (isSupabaseConfigured) {
      const { error } = await updateCoupon(coupon.id, { is_active: !coupon.is_active });
      if (error) { toast.error('Could not update coupon'); return; }
    }
    setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, is_active: !c.is_active } : c));
  };

  // ── Message templates ──
  const handleSaveTemplate = async (eventType: MessageEventType, subject: string, body: string, isActive: boolean) => {
    const payload = { host_id: DANIEL_HOST_ID, event_type: eventType, channel: 'email', subject, body, is_active: isActive };
    if (isSupabaseConfigured) {
      const { data, error } = await upsertMessageTemplate(payload);
      if (error) { toast.error('Could not save template — check Supabase connection'); return; }
      setTemplates(prev => {
        const rest = prev.filter(t => t.event_type !== eventType);
        return [...rest, data as unknown as MessageTemplate];
      });
    } else {
      setTemplates(prev => {
        const rest = prev.filter(t => t.event_type !== eventType);
        return [...rest, { ...payload, id: `local-${eventType}`, created_at: new Date().toISOString() } as MessageTemplate];
      });
      toast('Saved locally — connect Supabase + Resend to send real emails', { icon: 'ℹ️' });
    }
    toast.success('Template saved');
  };

  // ── Customer CRM ──
  const handleSaveNote = async (renterId: string, note: string) => {
    if (isSupabaseConfigured) {
      const { data, error } = await upsertCustomerNote(DANIEL_HOST_ID, renterId, note);
      if (error) { toast.error('Could not save note'); return; }
      setCustomerNotes(prev => [...prev.filter(n => n.renter_id !== renterId), data as unknown as CustomerNote]);
    } else {
      setCustomerNotes(prev => [...prev.filter(n => n.renter_id !== renterId), { id: `local-${renterId}`, host_id: DANIEL_HOST_ID, renter_id: renterId, note, created_at: new Date().toISOString() }]);
    }
    toast.success('Note saved');
  };

  // ── Custom checkout fields ──
  const handleAddField = async () => {
    if (!newField.label) { toast.error('Enter a field label'); return; }
    const payload = {
      host_id: DANIEL_HOST_ID,
      label: newField.label,
      field_type: newField.field_type,
      options: newField.field_type === 'select' ? newField.options.split(',').map(s => s.trim()).filter(Boolean) : [],
      is_required: newField.is_required,
      is_active: true,
      sort_order: checkoutFields.length,
    };
    if (isSupabaseConfigured) {
      const { data, error } = await createCustomCheckoutField(payload);
      if (error) { toast.error('Could not save field — check Supabase connection'); return; }
      setCheckoutFields(prev => [...prev, data as unknown as CustomCheckoutField]);
    } else {
      setCheckoutFields(prev => [...prev, { ...payload, id: `local-${Date.now()}`, created_at: new Date().toISOString() } as CustomCheckoutField]);
      toast('Saved locally — connect Supabase to make this permanent', { icon: 'ℹ️' });
    }
    setNewField({ label: '', field_type: 'text', options: '', is_required: false });
    toast.success('Checkout field added');
  };

  const handleToggleField = async (field: CustomCheckoutField) => {
    if (isSupabaseConfigured) {
      const { error } = await updateCustomCheckoutField(field.id, { is_active: !field.is_active });
      if (error) { toast.error('Could not update field'); return; }
    }
    setCheckoutFields(prev => prev.map(f => f.id === field.id ? { ...f, is_active: !f.is_active } : f));
  };

  const handleDeleteField = async (fieldId: string) => {
    if (isSupabaseConfigured) {
      const { error } = await deleteCustomCheckoutField(fieldId);
      if (error) { toast.error('Could not delete field'); return; }
    }
    setCheckoutFields(prev => prev.filter(f => f.id !== fieldId));
    toast.success('Field removed');
  };

  // ── Staff accounts ──
  const handleInviteStaff = async () => {
    if (!isSupabaseConfigured) { toast.error('Connect Supabase to invite real staff logins'); return; }
    if (!staffEmail) { toast.error('Enter an email address'); return; }
    const { error } = await inviteStaffAccount(staffEmail, staffName);
    if (error) { toast.error('Could not send invite — check Supabase setup'); return; }
    toast.success(`Invite sent to ${staffEmail}`);
    setStaffEmail(''); setStaffName('');
    await loadData();
  };

  const handleRevokeStaff = async (profileId: string) => {
    if (!isSupabaseConfigured) return;
    const { error } = await revokeStaffAccount(profileId);
    if (error) { toast.error('Could not revoke access'); return; }
    setStaff(prev => prev.filter(s => s.id !== profileId));
    toast.success('Access revoked');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0e0e1e] pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl border shadow-sm p-4 lg:sticky lg:top-24">
              <div className="p-3 mb-4 bg-muted rounded-xl">
                <p className="font-bold text-sm">Arvana Rentals</p>
                <p className="text-xs text-muted-foreground">{ADMIN_EMAIL}</p>
                {!isSupabaseConfigured && (
                  <p className="text-xs text-amber-600 mt-2 flex items-start gap-1">
                    <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" /> Not connected to Supabase — showing local fleet data only.
                  </p>
                )}
              </div>
              <nav className="space-y-1">
                {NAV.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveNav(id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      activeNav === id
                        ? 'bg-[#1A1A2E] text-white dark:bg-[#E94560]'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                    {id === 'requests' && pendingCount > 0 && (
                      <span className="ml-auto w-5 h-5 bg-[#E94560] text-white text-xs rounded-full flex items-center justify-center">{pendingCount}</span>
                    )}
                    {id === 'quotes' && quotes.filter(q => q.status === 'new').length > 0 && (
                      <span className="ml-auto w-5 h-5 bg-[#E94560] text-white text-xs rounded-full flex items-center justify-center">{quotes.filter(q => q.status === 'new').length}</span>
                    )}
                    {id === 'maintenance' && dueMaintenanceCount > 0 && (
                      <span className="ml-auto w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center">{dueMaintenanceCount}</span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0 space-y-6">
            {activeNav === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                <h1 className="text-2xl font-extrabold">Fleet overview</h1>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Cars in fleet', value: cars.length, icon: <CarIcon className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                    { label: 'Pending requests', value: pendingCount, icon: <Calendar className="w-5 h-5" />, color: 'text-[#E94560]', bg: 'bg-red-50 dark:bg-red-900/20' },
                    { label: 'Maintenance due', value: dueMaintenanceCount, icon: <Wrench className="w-5 h-5" />, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                    { label: 'Confirmed trips', value: bookings.filter(b => ['confirmed','active','completed'].includes(b.status)).length, icon: <DollarSign className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
                  ].map(({ label, value, icon, color, bg }) => (
                    <div key={label} className="bg-white dark:bg-[#1A1A2E] rounded-2xl border p-5 shadow-sm">
                      <div className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center mb-3`}>{icon}</div>
                      <div className="text-2xl font-extrabold">{value}</div>
                      <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>

                {bookings.length === 0 && (
                  <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl border p-8 text-center text-muted-foreground">
                    No booking requests yet. Once your site is live and someone submits a request, it'll show up here.
                  </div>
                )}
              </div>
            )}

            {activeNav === 'cars' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-extrabold">My Cars</h1>
                  <Button size="sm" className="gap-1.5 font-bold" onClick={openAddCar}>
                    <Plus className="w-4 h-4" /> Add new car
                  </Button>
                </div>
                {cars.map(car => (
                  <div key={car.id} className="bg-white dark:bg-[#1A1A2E] rounded-2xl border p-5 shadow-sm flex flex-col sm:flex-row gap-4">
                    <img src={car.images[0]} alt={car.make}
                      className="w-full sm:w-32 h-24 rounded-xl object-cover flex-shrink-0"
                      onError={e => (e.currentTarget.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200&h=150&fit=crop')} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-extrabold text-base">{car.year} {car.make} {car.model} · {car.color}</h3>
                          <p className="text-muted-foreground text-sm">VIN {car.vin || '—'} · Plate {car.license_plate || '—'}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant={car.is_available ? 'success' : 'secondary'}>{car.is_available ? 'Active' : 'Inactive'}</Badge>
                          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => openEditCar(car)}>
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm">
                        <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-muted-foreground" />{formatCurrency(car.daily_rate)}/day</span>
                        <span className="flex items-center gap-1"><Gauge className="w-3.5 h-3.5 text-muted-foreground" />{car.odometer?.toLocaleString() || '—'} mi</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-muted-foreground" />{car.gps_provider || 'No GPS on file'}</span>
                        {car.purchase_price && <span className="text-muted-foreground">Bought {formatCurrency(car.purchase_price)}{car.purchase_date ? ` on ${formatDate(car.purchase_date)}` : ''}</span>}
                      </div>
                    </div>
                  </div>
                ))}
                {!isSupabaseConfigured && (
                  <p className="text-xs text-amber-600 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    Cars added here right now only save to this browser tab — connect Supabase so they persist for real and show up on the live site.
                  </p>
                )}
              </div>
            )}

            {activeNav === 'requests' && (
              <div className="space-y-4 animate-fade-in">
                <h1 className="text-2xl font-extrabold">Booking Requests</h1>
                <div className="flex gap-2 flex-wrap">
                  {['all', 'pending', 'confirmed', 'active', 'completed', 'cancelled'].map(s => (
                    <button key={s} onClick={() => setRequestFilter(s)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all capitalize ${
                        requestFilter === s ? 'bg-[#1A1A2E] text-white border-[#1A1A2E] dark:bg-white dark:text-[#1A1A2E]' : 'border-border hover:border-[#E94560]'
                      }`}>
                      {s} {s === 'all' && `(${bookings.length})`}
                    </button>
                  ))}
                </div>
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-[#1A1A2E] rounded-2xl border">
                    <Calendar className="w-12 h-12 text-muted mx-auto mb-3" />
                    <p className="text-muted-foreground font-semibold">No {requestFilter} requests</p>
                  </div>
                ) : filteredBookings.map(b => (
                  <div key={b.id} className="bg-white dark:bg-[#1A1A2E] rounded-2xl border p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-extrabold text-base">{b.car?.year} {b.car?.make} {b.car?.model}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(b.start_date)} → {formatDate(b.end_date)} · {b.total_days} days</p>
                        <p className="text-sm font-bold text-[#E94560] mt-0.5">{formatCurrency(b.total_amount)}</p>
                      </div>
                      <Badge variant={STATUS_COLORS[b.status] as 'warning' | 'success' | 'electric' | 'secondary' | 'destructive'}>{b.status}</Badge>
                    </div>

                    {(b.identity_verification_status || b.deposit_status || b.renter_has_insurance !== undefined) && (
                      <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                        {b.identity_verification_status && b.identity_verification_status !== 'not_started' && (
                          <span>ID: <strong className="capitalize">{b.identity_verification_status}</strong></span>
                        )}
                        {b.deposit_status && b.deposit_status !== 'none' && (
                          <span>Deposit: <strong className="capitalize">{b.deposit_status}</strong>{b.deposit_amount ? ` (${formatCurrency(b.deposit_amount)})` : ''}</span>
                        )}
                        {b.renter_has_insurance === false && b.wants_provided_insurance && (
                          <span className="text-green-600 font-semibold">✓ Wants our coverage added — quote them a rate</span>
                        )}
                        {b.renter_has_insurance === false && !b.wants_provided_insurance && (
                          <span className="text-amber-600 font-semibold">⚠ Needs non-owner insurance — confirm before handoff</span>
                        )}
                        {b.renter_has_insurance === true && (
                          <span>Insurance: <strong>{b.renter_insurance_company || 'provided'}</strong></span>
                        )}
                        {b.is_gig_worker && (
                          <span className="text-blue-600 font-semibold">Gig work rental: {b.gig_platform}</span>
                        )}
                      </div>
                    )}

                    {(b.license_photo_path || b.gig_screenshot_path || b.insurance_doc_path) && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {b.license_photo_path && (
                          <Button variant="outline" size="sm" onClick={() => handleViewDoc(b.license_photo_path!)}>
                            View license photo
                          </Button>
                        )}
                        {b.insurance_doc_path && (
                          <Button variant="outline" size="sm" onClick={() => handleViewDoc(b.insurance_doc_path!)}>
                            View insurance doc
                          </Button>
                        )}
                        {b.gig_screenshot_path && (
                          <Button variant="outline" size="sm" onClick={() => handleViewDoc(b.gig_screenshot_path!)}>
                            View trip screenshot
                          </Button>
                        )}
                      </div>
                    )}

                    {b.status === 'pending' && (
                      <div className="flex gap-2 mt-4 pt-4 border-t">
                        <Button variant="red" size="sm" className="gap-1.5 flex-1" onClick={() => handleAction(b.id, 'confirmed')}>
                          <Check className="w-3.5 h-3.5" /> Approve (renter can then pay + verify ID)
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1.5 flex-1 text-[#E94560] border-[#E94560]" onClick={() => handleAction(b.id, 'cancelled')}>
                          <X className="w-3.5 h-3.5" /> Decline
                        </Button>
                      </div>
                    )}

                    {b.deposit_status === 'held' && (
                      <div className="flex gap-2 mt-4 pt-4 border-t">
                        <Button variant="outline" size="sm" className="gap-1.5 flex-1" onClick={() => handleDeposit(b.id, 'release')}>
                          Release deposit (no damage)
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1.5 flex-1 text-[#E94560] border-[#E94560]" onClick={() => handleDeposit(b.id, 'capture_full')}>
                          Capture full deposit (damage/fees)
                        </Button>
                      </div>
                    )}

                    {['confirmed', 'active', 'completed'].includes(b.status) && (
                      <div className="flex gap-2 mt-3 pt-3 border-t flex-wrap">
                        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleSendPaymentLink(b.id)}>
                          <Send className="w-3.5 h-3.5" /> Send payment link
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleRefund(b.id, b.total_amount)}>
                          <RotateCcw className="w-3.5 h-3.5" /> Issue refund
                        </Button>
                        {b.refund_status === 'issued' && (
                          <span className="text-xs text-green-600 self-center">Refunded {formatCurrency(b.refund_amount || 0)}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeNav === 'quotes' && (
              <div className="space-y-4 animate-fade-in">
                <h1 className="text-2xl font-extrabold">Quote Leads</h1>
                <p className="text-sm text-muted-foreground -mt-2">Instant-quote requests from the homepage form — reach out, then mark them contacted or closed.</p>
                {quotes.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-[#1A1A2E] rounded-2xl border text-muted-foreground">
                    No quote requests yet. They'll appear here as soon as someone fills out the homepage form.
                  </div>
                ) : quotes.map(q => (
                  <div key={q.id} className="bg-white dark:bg-[#1A1A2E] rounded-2xl border p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-extrabold text-base">{q.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          <a href={`tel:${q.phone}`} className="hover:underline">{q.phone}</a> · <a href={`mailto:${q.email}`} className="hover:underline">{q.email}</a>
                        </p>
                        <p className="text-sm mt-1">
                          {q.pickup_date ? formatDate(q.pickup_date) : '—'}{q.pickup_time ? ` at ${q.pickup_time}` : ''} → {q.return_date ? formatDate(q.return_date) : '—'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={q.status === 'new' ? 'warning' : q.status === 'contacted' ? 'electric' : 'secondary'}>{q.status}</Badge>
                        {q.is_gig_worker && <span className="text-xs text-blue-600 font-semibold">Gig worker</span>}
                      </div>
                    </div>

                    {(q.license_photo_path || q.gig_screenshot_path) && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {q.license_photo_path && (
                          <Button variant="outline" size="sm" onClick={() => handleViewQuoteDoc(q.license_photo_path!)}>
                            View license photo
                          </Button>
                        )}
                        {q.gig_screenshot_path && (
                          <Button variant="outline" size="sm" onClick={() => handleViewQuoteDoc(q.gig_screenshot_path!)}>
                            View trip screenshot
                          </Button>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      {q.status === 'new' && (
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleQuoteStatus(q.id, 'contacted')}>
                          Mark contacted
                        </Button>
                      )}
                      {q.status !== 'closed' && (
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleQuoteStatus(q.id, 'closed')}>
                          Close lead
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeNav === 'orders' && (
              <div className="space-y-4 animate-fade-in">
                <h1 className="text-2xl font-extrabold">Orders & Lot</h1>
                <p className="text-sm text-muted-foreground -mt-2">Every active trip, tracked through Reserved → Picked up → Returned — like Fleetwire's order stages.</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {cars.map(car => {
                    const activeBooking = bookings.find(b =>
                      b.car_id === car.id && ['confirmed', 'active'].includes(b.status) && b.order_stage !== 'returned'
                    );
                    return (
                      <div key={car.id} className="bg-white dark:bg-[#1A1A2E] rounded-2xl border p-4 shadow-sm">
                        <p className="font-bold text-sm">{car.year} {car.make} {car.model}</p>
                        <Badge variant={activeBooking ? 'warning' : 'success'} className="mt-2">
                          {activeBooking ? `Out — ${STAGE_LABELS[activeBooking.order_stage || 'reserved']}` : 'On lot'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {STAGE_ORDER.map(stage => (
                    <div key={stage} className="bg-white dark:bg-[#1A1A2E] rounded-2xl border p-4 shadow-sm">
                      <h3 className="font-extrabold text-sm mb-3">{STAGE_LABELS[stage]}</h3>
                      <div className="space-y-3">
                        {bookings.filter(b => (b.order_stage || 'reserved') === stage && ['confirmed', 'active', 'completed'].includes(b.status)).map(b => (
                          <div key={b.id} className="border rounded-xl p-3 text-sm">
                            <p className="font-semibold">{b.car?.year} {b.car?.make} {b.car?.model}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(b.start_date)} → {formatDate(b.end_date)}</p>
                            {stage !== 'returned' && (
                              <Button variant="outline" size="sm" className="gap-1 mt-2 w-full" onClick={() => handleAdvanceStage(b.id, stage)}>
                                Mark {STAGE_LABELS[STAGE_ORDER[STAGE_ORDER.indexOf(stage) + 1]]} <ArrowRight className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeNav === 'customers' && (
              <div className="space-y-4 animate-fade-in">
                <h1 className="text-2xl font-extrabold">Customers</h1>
                <p className="text-sm text-muted-foreground -mt-2">A lightweight CRM — every renter's history and notes in one place.</p>
                {(() => {
                  const renterIds = Array.from(new Set(bookings.map(b => b.renter_id)));
                  if (renterIds.length === 0) {
                    return <div className="text-center py-16 bg-white dark:bg-[#1A1A2E] rounded-2xl border text-muted-foreground">No renters yet.</div>;
                  }
                  return renterIds.map(rid => {
                    const renterBookings = bookings.filter(b => b.renter_id === rid);
                    const renter = renterBookings[0]?.renter;
                    const totalSpent = renterBookings.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + b.total_amount, 0);
                    const note = customerNotes.find(n => n.renter_id === rid);
                    return (
                      <div key={rid} className="bg-white dark:bg-[#1A1A2E] rounded-2xl border p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-extrabold">{renter?.full_name || 'Renter'}</p>
                            <p className="text-xs text-muted-foreground">{renter?.email || rid}</p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="font-bold">{formatCurrency(totalSpent)}</p>
                            <p className="text-xs text-muted-foreground">{renterBookings.length} rental{renterBookings.length > 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t space-y-1">
                          {renterBookings.map(b => (
                            <p key={b.id} className="text-xs text-muted-foreground">
                              {b.car?.year} {b.car?.make} {b.car?.model} · {formatDate(b.start_date)} → {formatDate(b.end_date)} · <span className="capitalize">{b.status}</span>
                            </p>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t">
                          <Label>Notes</Label>
                          <textarea
                            defaultValue={note?.note || ''}
                            onBlur={e => e.target.value !== (note?.note || '') && handleSaveNote(rid, e.target.value)}
                            placeholder="Repeat renter, always returns clean, etc."
                            className="w-full rounded-xl border px-3 py-2 text-sm bg-muted outline-none focus:ring-2 focus:ring-gold-400 mt-1.5 min-h-[60px]"
                          />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}

            {activeNav === 'maintenance' && (
              <div className="space-y-4 animate-fade-in">
                <h1 className="text-2xl font-extrabold">Maintenance</h1>
                {maintenance.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-[#1A1A2E] rounded-2xl border text-muted-foreground">No maintenance records yet.</div>
                ) : maintenance.map(m => {
                  const isDue = m.next_due_date && new Date(m.next_due_date) <= new Date();
                  const car = cars.find(c => c.id === m.car_id);
                  return (
                    <div key={m.id} className="bg-white dark:bg-[#1A1A2E] rounded-2xl border p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-extrabold">{car ? `${car.year} ${car.make} ${car.model}` : 'Car'} — {m.service_type}</p>
                          <p className="text-sm text-muted-foreground mt-1">{m.notes}</p>
                          {m.next_due_date && <p className="text-sm mt-1">Next due: <strong>{formatDate(m.next_due_date)}</strong>{m.next_due_miles ? ` or ${m.next_due_miles.toLocaleString()} mi` : ''}</p>}
                        </div>
                        <Badge variant={isDue ? 'destructive' : 'success'}>{isDue ? 'DUE' : 'OK'}</Badge>
                      </div>
                    </div>
                  );
                })}
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <ExternalLink className="w-3 h-3" /> Full maintenance history still lives in your Turo Business Blueprint spreadsheet — this mirrors the same due dates.
                </p>
              </div>
            )}

            {activeNav === 'coupons' && (
              <div className="space-y-4 animate-fade-in">
                <h1 className="text-2xl font-extrabold">Coupons</h1>
                <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl border p-5 shadow-sm space-y-3">
                  <h3 className="font-bold text-sm">New coupon</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <Input placeholder="CODE" value={newCoupon.code} onChange={e => setNewCoupon(c => ({ ...c, code: e.target.value }))} />
                    <select className="rounded-xl border px-3 py-2.5 text-sm bg-muted outline-none focus:ring-2 focus:ring-gold-400"
                      value={newCoupon.discount_type} onChange={e => setNewCoupon(c => ({ ...c, discount_type: e.target.value as 'percent' | 'fixed' }))}>
                      <option value="percent">% off</option>
                      <option value="fixed">$ off</option>
                    </select>
                    <Input type="number" placeholder="Value" value={newCoupon.discount_value} onChange={e => setNewCoupon(c => ({ ...c, discount_value: e.target.value }))} />
                    <Input type="number" placeholder="Max uses (optional)" value={newCoupon.max_uses} onChange={e => setNewCoupon(c => ({ ...c, max_uses: e.target.value }))} />
                    <Input type="date" value={newCoupon.expires_at} onChange={e => setNewCoupon(c => ({ ...c, expires_at: e.target.value }))} />
                  </div>
                  <Button size="sm" className="font-bold gap-1.5" onClick={handleCreateCoupon}><Plus className="w-4 h-4" /> Create coupon</Button>
                </div>

                {coupons.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-[#1A1A2E] rounded-2xl border text-muted-foreground">No coupons yet.</div>
                ) : coupons.map(c => (
                  <div key={c.id} className="bg-white dark:bg-[#1A1A2E] rounded-2xl border p-4 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="font-extrabold">{c.code}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.discount_type === 'percent' ? `${c.discount_value}% off` : `${formatCurrency(c.discount_value)} off`}
                        {c.max_uses ? ` · ${c.times_used}/${c.max_uses} used` : ` · ${c.times_used} used`}
                        {c.expires_at ? ` · expires ${formatDate(c.expires_at)}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={c.is_active ? 'success' : 'secondary'}>{c.is_active ? 'Active' : 'Inactive'}</Badge>
                      <Button variant="outline" size="sm" onClick={() => handleToggleCoupon(c)}>{c.is_active ? 'Deactivate' : 'Activate'}</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeNav === 'messaging' && (
              <div className="space-y-4 animate-fade-in">
                <h1 className="text-2xl font-extrabold">Automated Messaging</h1>
                <p className="text-sm text-muted-foreground -mt-2">
                  Edit what renters get emailed at each step. Use <code>{'{{renter_name}}'}</code>, <code>{'{{car}}'}</code>, <code>{'{{start_date}}'}</code>, <code>{'{{end_date}}'}</code>, <code>{'{{total_amount}}'}</code>, <code>{'{{pickup_location}}'}</code>.
                </p>
                {!isSupabaseConfigured && (
                  <p className="text-xs text-amber-600 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> Sending real emails needs a Resend account (RESEND_API_KEY) wired into the send-notification Edge Function — templates below still save locally so you can set the wording now.
                  </p>
                )}
                {(Object.keys(EVENT_LABELS) as MessageEventType[]).map(eventType => {
                  const existing = templates.find(t => t.event_type === eventType);
                  return (
                    <TemplateEditor
                      key={eventType}
                      eventType={eventType}
                      label={EVENT_LABELS[eventType]}
                      initialSubject={existing?.subject || ''}
                      initialBody={existing?.body || ''}
                      initialActive={existing?.is_active ?? true}
                      onSave={handleSaveTemplate}
                    />
                  );
                })}
              </div>
            )}

            {activeNav === 'reports' && (
              <div className="space-y-4 animate-fade-in">
                <h1 className="text-2xl font-extrabold">Reports & Analytics</h1>
                {(() => {
                  const paidBookings = bookings.filter(b => ['confirmed', 'active', 'completed'].includes(b.status));
                  const revenueByMonth: Record<string, number> = {};
                  paidBookings.forEach(b => {
                    const month = b.start_date?.slice(0, 7) || 'unknown';
                    revenueByMonth[month] = (revenueByMonth[month] || 0) + b.total_amount;
                  });
                  const months = Object.keys(revenueByMonth).sort();
                  const totalRevenue = paidBookings.reduce((s, b) => s + b.total_amount, 0);

                  const utilization = cars.map(car => {
                    const carBookings = paidBookings.filter(b => b.car_id === car.id);
                    const daysBooked = carBookings.reduce((s, b) => s + b.total_days, 0);
                    return { car, daysBooked, trips: carBookings.length };
                  }).sort((a, b) => b.daysBooked - a.daysBooked);

                  return (
                    <>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl border p-5 shadow-sm">
                          <p className="text-2xl font-extrabold">{formatCurrency(totalRevenue)}</p>
                          <p className="text-sm text-muted-foreground">Total revenue (confirmed+)</p>
                        </div>
                        <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl border p-5 shadow-sm">
                          <p className="text-2xl font-extrabold">{paidBookings.length}</p>
                          <p className="text-sm text-muted-foreground">Confirmed trips</p>
                        </div>
                        <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl border p-5 shadow-sm">
                          <p className="text-2xl font-extrabold">{utilization[0]?.car ? `${utilization[0].car.make} ${utilization[0].car.model}` : '—'}</p>
                          <p className="text-sm text-muted-foreground">Most-booked car</p>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl border p-5 shadow-sm">
                        <h3 className="font-bold text-sm mb-3">Revenue by month</h3>
                        {months.length === 0 ? <p className="text-sm text-muted-foreground">No revenue yet.</p> : (
                          <div className="space-y-2">
                            {months.map(m => (
                              <div key={m} className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">{m}</span>
                                <span className="font-semibold">{formatCurrency(revenueByMonth[m])}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl border p-5 shadow-sm">
                        <h3 className="font-bold text-sm mb-3">Utilization by car</h3>
                        <div className="space-y-2">
                          {utilization.map(({ car, daysBooked, trips }) => (
                            <div key={car.id} className="flex items-center justify-between text-sm">
                              <span>{car.year} {car.make} {car.model}</span>
                              <span className="text-muted-foreground">{daysBooked} days booked · {trips} trips</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => exportToCsv('bookings.csv', bookings.map(b => ({
                          id: b.id, car: `${b.car?.year} ${b.car?.make} ${b.car?.model}`, start: b.start_date, end: b.end_date,
                          status: b.status, total: b.total_amount, coupon: b.coupon_code || '',
                        })))}>
                          <Download className="w-3.5 h-3.5" /> Export bookings CSV
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => {
                          const renterIds = Array.from(new Set(bookings.map(b => b.renter_id)));
                          exportToCsv('customers.csv', renterIds.map(rid => {
                            const rb = bookings.filter(b => b.renter_id === rid);
                            return { renter_id: rid, name: rb[0]?.renter?.full_name || '', email: rb[0]?.renter?.email || '', trips: rb.length, total_spent: rb.reduce((s, b) => s + b.total_amount, 0) };
                          }));
                        }}>
                          <Download className="w-3.5 h-3.5" /> Export customers CSV
                        </Button>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {activeNav === 'staff' && (
              <div className="space-y-4 animate-fade-in">
                <h1 className="text-2xl font-extrabold">Staff Accounts</h1>
                <p className="text-sm text-muted-foreground -mt-2">Give a dispatcher or helper their own login to this Fleet Manager without sharing your password.</p>
                <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl border p-5 shadow-sm space-y-3">
                  <h3 className="font-bold text-sm">Invite staff</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input placeholder="Full name" value={staffName} onChange={e => setStaffName(e.target.value)} />
                    <Input placeholder="Email address" value={staffEmail} onChange={e => setStaffEmail(e.target.value)} />
                  </div>
                  <Button size="sm" className="font-bold gap-1.5" onClick={handleInviteStaff}><Send className="w-4 h-4" /> Send invite</Button>
                </div>
                {staff.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-[#1A1A2E] rounded-2xl border text-muted-foreground">No staff accounts yet — just you.</div>
                ) : staff.map(s => (
                  <div key={s.id} className="bg-white dark:bg-[#1A1A2E] rounded-2xl border p-4 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="font-bold">{s.full_name || 'Staff member'}</p>
                      <p className="text-xs text-muted-foreground">{s.email}</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5 text-[#E94560] border-[#E94560]" onClick={() => handleRevokeStaff(s.id)}>
                      <Trash2 className="w-3.5 h-3.5" /> Revoke access
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {activeNav === 'settings' && (
              <div className="space-y-4 animate-fade-in">
                <h1 className="text-2xl font-extrabold">Custom Checkout Fields</h1>
                <p className="text-sm text-muted-foreground -mt-2">Add extra questions to the booking form — shown to every renter at checkout, right after license & insurance.</p>
                <div className="bg-white dark:bg-[#1A1A2E] rounded-2xl border p-5 shadow-sm space-y-3">
                  <h3 className="font-bold text-sm">New field</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <Input placeholder="Label, e.g. Delivery address" value={newField.label} onChange={e => setNewField(f => ({ ...f, label: e.target.value }))} />
                    <select className="rounded-xl border px-3 py-2.5 text-sm bg-muted outline-none focus:ring-2 focus:ring-gold-400"
                      value={newField.field_type} onChange={e => setNewField(f => ({ ...f, field_type: e.target.value as 'text' | 'select' | 'checkbox' }))}>
                      <option value="text">Text</option>
                      <option value="select">Dropdown</option>
                      <option value="checkbox">Checkbox</option>
                    </select>
                    {newField.field_type === 'select' && (
                      <Input placeholder="Options, comma-separated" value={newField.options} onChange={e => setNewField(f => ({ ...f, options: e.target.value }))} />
                    )}
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={newField.is_required} onChange={e => setNewField(f => ({ ...f, is_required: e.target.checked }))} /> Required
                    </label>
                  </div>
                  <Button size="sm" className="font-bold gap-1.5" onClick={handleAddField}><Plus className="w-4 h-4" /> Add field</Button>
                </div>

                {checkoutFields.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-[#1A1A2E] rounded-2xl border text-muted-foreground">No custom fields yet — checkout only asks the default questions.</div>
                ) : checkoutFields.map(f => (
                  <div key={f.id} className="bg-white dark:bg-[#1A1A2E] rounded-2xl border p-4 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="font-bold">{f.label} {f.is_required && <span className="text-red-500">*</span>}</p>
                      <p className="text-xs text-muted-foreground capitalize">{f.field_type}{f.options.length ? `: ${f.options.join(', ')}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={f.is_active ? 'success' : 'secondary'}>{f.is_active ? 'Active' : 'Hidden'}</Badge>
                      <Button variant="outline" size="sm" onClick={() => handleToggleField(f)}>{f.is_active ? 'Hide' : 'Show'}</Button>
                      <Button variant="outline" size="sm" className="text-[#E94560] border-[#E94560]" onClick={() => handleDeleteField(f.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {carFormOpen && (
        <CarFormModal
          initial={editingCar}
          onCancel={closeCarForm}
          onSave={handleSaveCar}
        />
      )}
    </div>
  );
};

export default FleetManager;
