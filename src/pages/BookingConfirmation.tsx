import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { Check, Calendar, MapPin, Car, MessageCircle, Home, Phone, Star, CreditCard, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Car as CarType, Booking } from '@/types';
import { getBookingById, createRentCheckout, createIdentitySession, isSupabaseConfigured } from '@/lib/supabase';
import toast from 'react-hot-toast';

interface BookingState {
  car: CarType;
  startDate: string;
  endDate: string;
  totalDays: number;
  subtotal: number;
  serviceFee: number;
  total: number;
  pickupLocation: string;
  requestPending?: boolean;
}

// Shown when someone opens a /bookings/:id link directly (e.g. from a text
// message after you've approved their request) rather than right after
// submitting — pulls the live booking from Supabase and offers the "pay rent"
// / "verify ID" actions the host approval unlocks.
const LiveBookingActions: React.FC<{ bookingId: string }> = ({ bookingId }) => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<'pay' | 'verify' | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return; }
    getBookingById(bookingId).then(({ data }) => {
      setBooking((data as unknown as Booking) || null);
      setLoading(false);
    });
  }, [bookingId]);

  const handlePay = async () => {
    setActionLoading('pay');
    const { data, error } = await createRentCheckout(bookingId);
    if (error || !data?.url) { toast.error('Could not start payment — check back shortly'); setActionLoading(null); return; }
    window.location.href = data.url;
  };

  const handleVerify = async () => {
    setActionLoading('verify');
    const { data, error } = await createIdentitySession(bookingId);
    if (error || !data?.url) { toast.error('Could not start ID verification — check back shortly'); setActionLoading(null); return; }
    window.location.href = data.url;
  };

  if (loading) {
    return <div className="min-h-screen pt-24 flex items-center justify-center text-muted-foreground">Loading your booking…</div>;
  }

  if (!booking) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center text-center px-4">
        <div>
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-2">Booking request received</h2>
          <p className="text-muted-foreground mb-6">Your booking ID: <strong>{bookingId}</strong></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-charcoal-900 pt-16">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white dark:bg-charcoal-900 rounded-3xl border shadow-xl p-6 space-y-5">
          <div>
            <p className="text-sm text-muted-foreground">Booking #{booking.id.slice(0, 8)}</p>
            <h1 className="text-xl font-extrabold">{booking.car?.year} {booking.car?.make} {booking.car?.model}</h1>
            <p className="text-sm text-muted-foreground mt-1">{formatDate(booking.start_date)} → {formatDate(booking.end_date)} · {formatCurrency(booking.total_amount)}</p>
          </div>

          <div className="text-sm px-3 py-2 rounded-xl bg-muted inline-block font-semibold capitalize">
            Status: {booking.status}
          </div>

          {booking.status === 'pending' && (
            <p className="text-sm text-muted-foreground">We're still reviewing your request. You'll be able to pay and verify your ID here once it's approved.</p>
          )}

          {booking.status !== 'pending' && (
            <div className="space-y-3">
              <Button className="w-full gap-2" disabled={actionLoading !== null || booking.identity_verification_status === 'verified'} onClick={handleVerify}>
                {actionLoading === 'verify' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                {booking.identity_verification_status === 'verified' ? 'ID Verified ✓' : 'Verify My ID'}
              </Button>
              <Button className="w-full gap-2" disabled={actionLoading !== null || Boolean(booking.stripe_payment_intent_id)} onClick={handlePay}>
                {actionLoading === 'pay' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                {booking.stripe_payment_intent_id ? 'Payment received ✓' : `Pay ${formatCurrency(booking.total_amount)}`}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const BookingConfirmation: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as BookingState | null;
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowCheck(true), 100);
    return () => clearTimeout(t);
  }, []);

  if (!state) {
    return <LiveBookingActions bookingId={bookingId || ''} />;
  }

  const { car, startDate, endDate, totalDays, subtotal, serviceFee, total, pickupLocation, requestPending } = state;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-charcoal-900 pt-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {/* Success animation */}
        <div className="text-center mb-8">
          <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center transition-all duration-700 ${showCheck ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
            <div className={`w-16 h-16 rounded-full bg-green-500 flex items-center justify-center transition-all duration-500 delay-300 ${showCheck ? 'scale-100' : 'scale-0'}`}>
              <Check className="w-8 h-8 text-white stroke-[3]" />
            </div>
          </div>

          <div className={`transition-all duration-500 delay-500 ${showCheck ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <h1 className="text-3xl font-extrabold text-charcoal-900 dark:text-white mb-2">
              {requestPending ? 'Request submitted! 🎉' : "You're all set! 🎉"}
            </h1>
            <p className="text-muted-foreground text-lg">
              {requestPending
                ? "We'll text or email you within 24 hours to verify your ID and confirm."
                : 'Your booking is confirmed. Get ready for an amazing drive!'}
            </p>
          </div>
        </div>

        {/* Booking card */}
        <div className="bg-white dark:bg-charcoal-900 rounded-3xl border shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-charcoal-900 dark:bg-gold-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium">{requestPending ? 'Request received' : 'Booking confirmed'}</p>
                <p className="text-2xl font-extrabold mt-0.5">#{bookingId}</p>
              </div>
              <div className="bg-white/10 rounded-xl px-3 py-1.5 text-sm font-semibold">
                {requestPending ? '⏳ Pending review' : '✓ Confirmed'}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Car details */}
            <div className="flex gap-4 items-start">
              <img
                src={car.images[0]}
                alt={car.make}
                className="w-28 h-20 rounded-xl object-cover flex-shrink-0"
                onError={e => (e.currentTarget.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200&h=150&fit=crop')}
              />
              <div>
                <h3 className="text-xl font-extrabold">{car.year} {car.make} {car.model}</h3>
                <p className="text-muted-foreground text-sm capitalize">{car.color} · {car.category}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
                  <span className="text-sm font-semibold">{car.rating}</span>
                  <span className="text-xs text-muted-foreground">({car.total_trips} trips)</span>
                </div>
              </div>
            </div>

            <div className="border-t" />

            {/* Trip info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase mb-2">
                  <Calendar className="w-3.5 h-3.5" /> Pick-up
                </div>
                <p className="font-bold text-base">{formatDate(startDate)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase mb-2">
                  <Calendar className="w-3.5 h-3.5" /> Return
                </div>
                <p className="font-bold text-base">{formatDate(endDate)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 col-span-2">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase mb-2">
                  <MapPin className="w-3.5 h-3.5" /> Pickup location
                </div>
                <p className="font-bold">{pickupLocation || `${car.location}, ${car.city}, ${car.state}`}</p>
              </div>
            </div>

            <div className="border-t" />

            {/* Price breakdown */}
            <div className="space-y-2 text-sm">
              <h4 className="font-bold text-base mb-3">{requestPending ? 'Estimated total' : 'Payment summary'}</h4>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{formatCurrency(car.daily_rate)} × {totalDays} days</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service fee</span>
                <span className="font-semibold">{formatCurrency(serviceFee)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t">
                <span>{requestPending ? 'Estimated total' : 'Total paid'}</span>
                <span className={requestPending ? 'text-gold-600 dark:text-gold-400' : 'text-green-600'}>{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="border-t" />

            {/* Host info */}
            {car.host && (
              <div>
                <h4 className="font-bold mb-3">Your host</h4>
                <div className="flex items-center gap-3">
                  <img
                    src={car.host.avatar_url}
                    alt={car.host.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={e => (e.currentTarget.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop')}
                  />
                  <div className="flex-1">
                    <p className="font-bold">{car.host.full_name}</p>
                    <p className="text-sm text-muted-foreground">Contact available after booking start</p>
                  </div>
                  <button className="p-2.5 rounded-xl border border-border hover:bg-muted transition-colors">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Next steps */}
        <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5">
          <h4 className="font-bold text-amber-800 dark:text-amber-400 mb-3">📋 What's next?</h4>
          <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-500">
            {requestPending ? (
              <>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 mt-0.5 flex-shrink-0" />We'll verify your ID and driver's license</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 mt-0.5 flex-shrink-0" />You'll receive a rental agreement to e-sign</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 mt-0.5 flex-shrink-0" />A secure payment link is sent once approved</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 mt-0.5 flex-shrink-0" />Pickup/lockbox details sent after payment clears</li>
              </>
            ) : (
              <>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 mt-0.5 flex-shrink-0" />Confirmation email sent to your inbox</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 mt-0.5 flex-shrink-0" />Pickup location unlocked 24 hours before trip start</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 mt-0.5 flex-shrink-0" />Bring your driver's license and this confirmation</li>
              </>
            )}
          </ul>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          <Button variant="default" size="lg" className="gap-2" onClick={() => navigate('/dashboard?tab=trips')}>
            <Car className="w-4 h-4" /> View my trips
          </Button>
          <Button variant="outline" size="lg" className="gap-2" onClick={() => navigate('/')}>
            <Home className="w-4 h-4" /> Back to home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
