import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Phone, ShieldCheck, Car as CarIcon, CreditCard, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import {
  isSupabaseConfigured, getMyApplication, updateProfile,
  getCarsWithFallback, restUpdateById,
} from '@/lib/supabase';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Car, QuoteRequest } from '@/types';
import toast from 'react-hot-toast';

/**
 * The guided setup a renter sees immediately after creating their account.
 *
 * Before this existed, approval → signup → an empty dashboard with no
 * indication of what to do next. This walks them from "account created" to
 * "car requested" without ever leaving the page, then gets out of the way:
 * once finished, profiles.onboarding_completed_at is set and they never see
 * it again.
 *
 * Steps that depend on services we haven't connected yet (Stripe Identity,
 * Stripe checkout, SMS one-time codes) render as informational rather than
 * broken — they explain what happens and let the renter continue. When those
 * services are connected the same steps become interactive; nothing here
 * needs restructuring.
 */

const STRIPE_CONNECTED = Boolean(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

type StepState = 'done' | 'active' | 'todo';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, loading, refreshProfile } = useAuth();

  const [application, setApplication] = useState<QuoteRequest | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [busy, setBusy] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Step 1 — details the renter confirms
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [detailsSaved, setDetailsSaved] = useState(false);

  // Dates carried over from their application, editable here.
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [loading, user, navigate]);

  useEffect(() => {
    let cancelled = false;
    const email = user?.email || profile?.email;
    if (!email) return;

    (async () => {
      const [app, fleet] = await Promise.all([
        getMyApplication(email),
        getCarsWithFallback(),
      ]);
      if (cancelled) return;
      setApplication(app);
      setCars(fleet);
      setFullName(profile?.full_name || app?.full_name || '');
      setPhone(profile?.phone || app?.phone || '');
      setStartDate(app?.pickup_date || '');
      setEndDate(app?.return_date || '');
      setDetailsSaved(Boolean(profile?.phone));
      setLoadingData(false);
    })();

    return () => { cancelled = true; };
  }, [user, profile]);

  const handleSaveDetails = async () => {
    if (!fullName.trim()) { toast.error('Please enter your name'); return; }
    if (!phone.trim()) { toast.error('Please enter your phone number'); return; }
    if (!user) return;

    setBusy(true);
    if (isSupabaseConfigured) {
      const { error } = await updateProfile(user.id, {
        full_name: fullName.trim(),
        phone: phone.trim(),
        phone_confirm_requested_at: new Date().toISOString(),
      });
      if (error) {
        toast.error('Could not save that — please try again');
        setBusy(false);
        return;
      }
      await refreshProfile();
    }
    setDetailsSaved(true);
    setBusy(false);
    toast.success('Saved — we\'ll text you to confirm this number');
  };

  const handleFinish = async () => {
    if (!user) return;
    setBusy(true);
    if (isSupabaseConfigured) {
      await restUpdateById('profiles', user.id, {
        onboarding_completed_at: new Date().toISOString(),
      });
      await refreshProfile();
    }
    setBusy(false);
    navigate('/dashboard');
  };

  const pickCar = (car: Car) => {
    const params = new URLSearchParams();
    if (startDate) params.set('start', startDate);
    if (endDate) params.set('end', endDate);
    navigate(`/cars/${car.id}?${params.toString()}`);
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center text-muted-foreground">
        Setting things up…
      </div>
    );
  }

  const steps: { key: string; title: string; state: StepState }[] = [
    { key: 'details', title: 'Confirm your details', state: detailsSaved ? 'done' : 'active' },
    { key: 'identity', title: 'Verify your identity', state: profile?.identity_verified ? 'done' : detailsSaved ? 'active' : 'todo' },
    { key: 'car', title: 'Choose your car', state: detailsSaved ? 'active' : 'todo' },
    { key: 'checkout', title: 'Confirm & pay', state: 'todo' },
  ];

  const firstName = (profile?.full_name || fullName || '').split(' ')[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0e0e1e] pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold mb-2">
            You're in{firstName ? `, ${firstName}` : ''}.
          </h1>
          <p className="text-muted-foreground">
            Four quick steps and your car is booked. This page only shows up once.
          </p>
        </div>

        {/* Progress rail */}
        <div className="flex items-center justify-between mb-8 px-2">
          {steps.map((s, i) => (
            <React.Fragment key={s.key}>
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                  s.state === 'done'
                    ? 'bg-green-500 text-white'
                    : s.state === 'active'
                      ? 'bg-gold-500 text-charcoal-900'
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {s.state === 'done' ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-[11px] text-muted-foreground text-center max-w-[80px] leading-tight hidden sm:block">
                  {s.title}
                </span>
              </div>
              {i < steps.length - 1 && <div className="flex-1 h-px bg-border mx-1 mb-6" />}
            </React.Fragment>
          ))}
        </div>

        <div className="space-y-4">

          {/* ── Step 1: details ── */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <Phone className="w-5 h-5 text-gold-500 mt-0.5 flex-shrink-0" />
              <div>
                <h2 className="font-extrabold">1. Confirm your details</h2>
                <p className="text-sm text-muted-foreground">
                  We text about pickup, so this number needs to be right.
                </p>
              </div>
              {detailsSaved && <Check className="w-5 h-5 text-green-500 ml-auto flex-shrink-0" />}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Full name</label>
                <input
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full rounded-xl border bg-muted px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Mobile number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(305) 000-0000"
                  className="w-full rounded-xl border bg-muted px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <Button onClick={handleSaveDetails} disabled={busy} className="font-bold">
                {detailsSaved ? 'Update' : 'Save and continue'}
              </Button>
              {detailsSaved && (
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> We'll text you shortly to confirm this number
                </span>
              )}
            </div>
          </div>

          {/* ── Step 2: identity ── */}
          <div className={`bg-card border rounded-2xl p-6 shadow-sm ${!detailsSaved ? 'opacity-60' : ''}`}>
            <div className="flex items-start gap-3 mb-3">
              <ShieldCheck className="w-5 h-5 text-gold-500 mt-0.5 flex-shrink-0" />
              <div>
                <h2 className="font-extrabold">2. Verify your identity</h2>
                <p className="text-sm text-muted-foreground">
                  {STRIPE_CONNECTED
                    ? 'A quick photo ID check, handled securely by Stripe.'
                    : 'Already done — we reviewed the license you sent with your application.'}
                </p>
              </div>
              {!STRIPE_CONNECTED && <Check className="w-5 h-5 text-green-500 ml-auto flex-shrink-0" />}
            </div>

            {STRIPE_CONNECTED ? (
              <Button variant="outline" disabled={!detailsSaved} onClick={() => toast('Starting ID check…')}>
                Start ID check
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground pl-8">
                If we need anything else, we'll ask when we text you.
              </p>
            )}
          </div>

          {/* ── Step 3: pick a car ── */}
          <div className={`bg-card border rounded-2xl p-6 shadow-sm ${!detailsSaved ? 'opacity-60 pointer-events-none' : ''}`}>
            <div className="flex items-start gap-3 mb-4">
              <CarIcon className="w-5 h-5 text-gold-500 mt-0.5 flex-shrink-0" />
              <div>
                <h2 className="font-extrabold">3. Choose your car</h2>
                <p className="text-sm text-muted-foreground">
                  {application?.pickup_date
                    ? 'Your dates are carried over from your application — change them if plans moved.'
                    : 'Pick your dates and a car.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Pick-up</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full rounded-xl border bg-muted px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Return</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full rounded-xl border bg-muted px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold-400"
                />
              </div>
            </div>

            <div className="space-y-3">
              {cars.map(car => (
                <button
                  key={car.id}
                  onClick={() => pickCar(car)}
                  className="w-full flex items-center gap-4 p-3 rounded-xl border hover:border-gold-400 hover:bg-muted/40 transition-all text-left"
                >
                  <img
                    src={car.images[0]}
                    alt={`${car.year} ${car.make} ${car.model}`}
                    className="w-24 h-16 object-cover rounded-lg flex-shrink-0 bg-muted"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm truncate">{car.year} {car.make} {car.model}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(car.daily_rate)}/day
                      {car.weekly_rate ? ` · ${formatCurrency(car.weekly_rate)}/week` : ''}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </button>
              ))}
              {cars.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No cars available right now — we'll text you as soon as one frees up.
                </p>
              )}
            </div>
          </div>

          {/* ── Step 4: checkout ── */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm opacity-60">
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-gold-500 mt-0.5 flex-shrink-0" />
              <div>
                <h2 className="font-extrabold">4. Confirm & pay</h2>
                <p className="text-sm text-muted-foreground">
                  After you pick a car you'll send us a request. We confirm availability,
                  send the rental agreement to sign, and{' '}
                  {STRIPE_CONNECTED
                    ? 'take payment and the deposit hold on your card.'
                    : 'arrange payment with you directly.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Escape hatch */}
        <div className="text-center mt-8">
          <button
            onClick={handleFinish}
            disabled={busy}
            className="text-sm text-muted-foreground hover:text-foreground underline"
          >
            {detailsSaved ? 'Done for now — take me to my dashboard' : 'Skip setup for now'}
          </button>
          {application?.pickup_date && application?.return_date && (
            <p className="text-xs text-muted-foreground mt-3">
              From your application: {formatDate(application.pickup_date)} → {formatDate(application.return_date)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Welcome;
