import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight, ChevronLeft, Check, MapPin, Calendar,
  User, Phone, CreditCard, Shield, Lock, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sampleCars } from '@/data/sampleData';
import { Car } from '@/types';
import { formatCurrency, formatDate, calculateDays, calculateBookingTotal } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const STEPS = ['Trip Details', 'Driver Info', 'Payment'];

const Book: React.FC = () => {
  const { carId } = useParams<{ carId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [car, setCar] = useState<Car | null>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1 state
  const [startDate, setStartDate] = useState(searchParams.get('start') || '');
  const [endDate, setEndDate] = useState(searchParams.get('end') || '');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');

  // Step 2 state
  const [driverName, setDriverName] = useState(profile?.full_name || '');
  const [driverPhone, setDriverPhone] = useState(profile?.phone || '');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Step 3 (Payment) — mock card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [cardName, setCardName] = useState(profile?.full_name || '');

  useEffect(() => {
    const found = sampleCars.find(c => c.id === carId);
    if (found) setCar(found);
    else navigate('/search');
  }, [carId, navigate]);

  useEffect(() => {
    if (profile) {
      setDriverName(profile.full_name || '');
      setDriverPhone(profile.phone || '');
      setCardName(profile.full_name || '');
    }
  }, [profile]);

  if (!car) return null;

  const today = new Date().toISOString().split('T')[0];
  const totalDays = startDate && endDate ? calculateDays(startDate, endDate) : 0;
  const { subtotal, serviceFee, total } = totalDays > 0
    ? calculateBookingTotal(car.daily_rate, totalDays)
    : { subtotal: 0, serviceFee: 0, total: 0 };

  const handleNext = () => {
    if (step === 1) {
      if (!startDate || !endDate) { toast.error('Please select trip dates'); return; }
      if (!pickupLocation) { toast.error('Please enter a pickup location'); return; }
    }
    if (step === 2) {
      if (!driverName || !driverPhone) { toast.error('Please fill in all driver details'); return; }
      if (!termsAccepted) { toast.error('Please accept the terms and conditions'); return; }
    }
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmPayment = async () => {
    if (!cardNumber || !cardExpiry || !cardCVC) {
      toast.error('Please enter your card details');
      return;
    }
    setLoading(true);

    // Simulate payment processing
    await new Promise(r => setTimeout(r, 2000));

    const bookingId = `DS${Date.now().toString().slice(-8)}`;
    toast.success('Booking confirmed! 🎉');
    navigate(`/bookings/${bookingId}`, {
      state: { car, startDate, endDate, totalDays, subtotal, serviceFee, total, pickupLocation }
    });
    setLoading(false);
  };

  const CarSummary = () => (
    <div className="bg-card rounded-2xl border p-5 shadow-sm">
      <div className="flex gap-4">
        <img
          src={car.images[0]}
          alt={car.make}
          className="w-24 h-16 rounded-xl object-cover flex-shrink-0"
          onError={e => (e.currentTarget.src = 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200&h=150&fit=crop')}
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base truncate">{car.year} {car.make} {car.model}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
            <MapPin className="w-3 h-3" /> {car.city}, {car.state}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
            <span className="text-sm font-semibold">{car.rating}</span>
            <span className="text-xs text-muted-foreground">({car.total_trips} trips)</span>
          </div>
        </div>
      </div>

      {startDate && endDate && (
        <div className="mt-4 pt-4 border-t space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{formatDate(startDate)} → {formatDate(endDate)}</span>
            <span className="font-semibold">{totalDays} day{totalDays > 1 ? 's' : ''}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{formatCurrency(car.daily_rate)} × {totalDays} days</span>
            <span className="font-semibold">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service fee (12%)</span>
            <span className="font-semibold">{formatCurrency(serviceFee)}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-2 border-t">
            <span>Total</span>
            <span className="text-gold-600 dark:text-gold-400">{formatCurrency(total)}</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-charcoal-900 pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => step > 1 ? setStep(s => s - 1) : navigate(-1)}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm font-medium mb-4 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-3xl font-extrabold">Complete your booking</h1>
          <p className="text-muted-foreground mt-1">You're almost there — just a few more steps</p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => {
            const stepNum = i + 1;
            const isActive = stepNum === step;
            const isDone = stepNum < step;
            return (
              <React.Fragment key={label}>
                <div className={`flex items-center gap-2 ${isActive ? 'text-charcoal-900 dark:text-white' : isDone ? 'text-green-600' : 'text-muted-foreground'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                    isActive ? 'border-gold-500 bg-gold-500 text-charcoal-900'
                    : isDone ? 'border-green-500 bg-green-500 text-white'
                    : 'border-border'
                  }`}>
                    {isDone ? <Check className="w-4 h-4" /> : stepNum}
                  </div>
                  <span className="hidden sm:block text-sm font-semibold">{label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded transition-colors ${step > stepNum ? 'bg-green-500' : 'bg-border'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: step content */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-charcoal-900 rounded-2xl border shadow-sm p-6 sm:p-8">
              {/* STEP 1: Trip details */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-extrabold mb-1">Trip details</h2>
                    <p className="text-muted-foreground text-sm">Confirm your dates and pickup information</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Pick-up date</Label>
                      <div className="relative mt-1.5">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input type="date" value={startDate} min={today}
                          onChange={e => setStartDate(e.target.value)} className="pl-10" />
                      </div>
                    </div>
                    <div>
                      <Label>Return date</Label>
                      <div className="relative mt-1.5">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input type="date" value={endDate} min={startDate || today}
                          onChange={e => setEndDate(e.target.value)} className="pl-10" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Pickup location</Label>
                    <div className="relative mt-1.5">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder={`${car.location}, ${car.city}, ${car.state}`}
                        value={pickupLocation}
                        onChange={e => setPickupLocation(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Default: host's listed location</p>
                  </div>

                  <div>
                    <Label>Drop-off location <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <div className="relative mt-1.5">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Same as pickup" value={dropoffLocation}
                        onChange={e => setDropoffLocation(e.target.value)} className="pl-10" />
                    </div>
                  </div>

                  {totalDays > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      {totalDays} day{totalDays > 1 ? 's' : ''} selected · Total {formatCurrency(total)}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 2: Driver info */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-extrabold mb-1">Driver information</h2>
                    <p className="text-muted-foreground text-sm">Confirm your details for the trip</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Full name</Label>
                      <div className="relative mt-1.5">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input value={driverName} onChange={e => setDriverName(e.target.value)}
                          placeholder="Your full name" className="pl-10" />
                      </div>
                    </div>
                    <div>
                      <Label>Phone number</Label>
                      <div className="relative mt-1.5">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input value={driverPhone} onChange={e => setDriverPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000" className="pl-10" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Driver's license number</Label>
                    <Input value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)}
                      placeholder="e.g. D1234567" className="mt-1.5" />
                    <p className="text-xs text-muted-foreground mt-1">Required for insurance purposes</p>
                  </div>

                  {/* Insurance info */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 font-bold text-blue-800 dark:text-blue-400 mb-2">
                      <Shield className="w-4 h-4" /> Trip Protection Included
                    </div>
                    <ul className="text-sm text-blue-700 dark:text-blue-500 space-y-1">
                      <li>✓ $1 million liability insurance</li>
                      <li>✓ Comprehensive & collision coverage</li>
                      <li>✓ 24/7 roadside assistance</li>
                    </ul>
                  </div>

                  {/* Terms */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div
                      onClick={() => setTermsAccepted(!termsAccepted)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        termsAccepted ? 'bg-gold-500 border-gold-500' : 'border-border'
                      }`}
                    >
                      {termsAccepted && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      I agree to Arvana Rentals's{' '}
                      <Link to="/terms" className="text-gold-600 dark:text-gold-400 hover:underline">Terms of Service</Link>,{' '}
                      <Link to="/terms" className="text-gold-600 dark:text-gold-400 hover:underline">Rental Agreement</Link>, and confirm
                      I am 21+ years old with a valid driver's license.
                    </span>
                  </label>
                </div>
              )}

              {/* STEP 3: Payment */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-extrabold mb-1">Payment</h2>
                    <p className="text-muted-foreground text-sm">Your payment info is encrypted and secure</p>
                  </div>

                  {/* Secure badge */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted rounded-xl p-3">
                    <Lock className="w-4 h-4 text-green-500" />
                    256-bit SSL encryption · Powered by Stripe
                  </div>

                  {/* Card name */}
                  <div>
                    <Label>Name on card</Label>
                    <div className="relative mt-1.5">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input value={cardName} onChange={e => setCardName(e.target.value)}
                        placeholder="Your full name" className="pl-10" />
                    </div>
                  </div>

                  {/* Card number */}
                  <div>
                    <Label>Card number</Label>
                    <div className="relative mt-1.5">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim())}
                        placeholder="1234 5678 9012 3456"
                        className="pl-10 font-mono tracking-widest"
                        maxLength={19}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                        {['💳', '💳'].map((_, i) => (
                          <div key={i} className="w-8 h-5 bg-muted rounded text-xs flex items-center justify-center font-bold text-muted-foreground">
                            {i === 0 ? 'VISA' : 'MC'}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Expiry date</Label>
                      <Input
                        value={cardExpiry}
                        onChange={e => {
                          let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                          if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2);
                          setCardExpiry(v);
                        }}
                        placeholder="MM/YY"
                        className="mt-1.5 font-mono"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <Label>Security code</Label>
                      <div className="relative mt-1.5">
                        <Input
                          value={cardCVC}
                          onChange={e => setCardCVC(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          placeholder="CVC"
                          className="pr-10 font-mono"
                          maxLength={4}
                        />
                        <Shield className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Note: In production this uses the Stripe SDK for secure card processing. Your card details are never stored on our servers.
                  </p>

                  {/* Final price */}
                  <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 space-y-2 text-sm border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{formatCurrency(car.daily_rate)} × {totalDays} days</span>
                      <span className="font-semibold">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service fee</span>
                      <span className="font-semibold">{formatCurrency(serviceFee)}</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-lg pt-2 border-t">
                      <span>Total charged today</span>
                      <span className="text-gold-600 dark:text-gold-400">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex gap-3 mt-8">
                {step > 1 && (
                  <Button variant="outline" size="lg" onClick={() => setStep(s => s - 1)} className="flex-1">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                )}
                {step < 3 ? (
                  <Button variant="default" size="lg" onClick={handleNext} className="flex-1 font-bold">
                    Continue <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button variant="default" size="lg" onClick={handleConfirmPayment}
                    className="flex-1 font-bold" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-charcoal-900/30 border-t-charcoal-900 rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      <><Lock className="w-4 h-4 mr-2" /> Confirm & Pay {formatCurrency(total)}</>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Right: car summary (sticky) */}
          <div className="space-y-4">
            <div className="sticky top-24">
              <CarSummary />
              <div className="bg-card rounded-2xl border p-4 mt-4 text-xs text-muted-foreground space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Free cancellation up to 24hrs before pickup</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-500" />
                  <span>Secure payment via Stripe</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-gold-600 dark:text-gold-400" />
                  <span>$1M trip protection included</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Book;
