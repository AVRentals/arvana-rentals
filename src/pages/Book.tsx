import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight, ChevronLeft, Check, MapPin, Calendar,
  User, Phone, Shield, Lock, Star, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Car, Coupon, CustomCheckoutField } from '@/types';
import { formatCurrency, formatDate, calculateDays, calculateBookingTotal } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  createBooking, createAgreement, getCarByIdWithFallback, isSupabaseConfigured, DANIEL_HOST_ID,
  lookupCoupon, getCustomCheckoutFields, sendBookingNotification,
} from '@/lib/supabase';
import { getContractText, CONTRACT_VERSION } from '@/data/contractTemplate';
import toast from 'react-hot-toast';

const STEPS = ['Trip Details', 'Driver Info', 'Sign Agreement', 'Review & Submit'];

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
  const [hasOwnInsurance, setHasOwnInsurance] = useState<boolean | null>(null);
  const [insuranceCompany, setInsuranceCompany] = useState('');
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState('');

  // Step 3 state (e-signature)
  const [signatureName, setSignatureName] = useState('');
  const [signatureAgreed, setSignatureAgreed] = useState(false);
  const [clientIp, setClientIp] = useState<string | null>(null);

  // Coupon code (Fleetwire-style discount codes)
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponStatus, setCouponStatus] = useState<'idle' | 'checking' | 'error'>('idle');
  const [couponError, setCouponError] = useState('');

  // Custom checkout fields (host-defined, set up in Fleet Manager > Settings)
  const [customFields, setCustomFields] = useState<CustomCheckoutField[]>([]);
  const [customFieldResponses, setCustomFieldResponses] = useState<Record<string, string | boolean>>({});

  useEffect(() => {
    // Best-effort IP capture for the signed record — not required for the flow to work.
    fetch('https://api.ipify.org?format=json').then(r => r.json()).then(d => setClientIp(d.ip)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const hostId = car?.host_id || DANIEL_HOST_ID;
    getCustomCheckoutFields(hostId).then(({ data }) => {
      if (data) setCustomFields(data as unknown as CustomCheckoutField[]);
    }).catch(() => {});
  }, [car?.host_id]);

  useEffect(() => {
    if (!carId) return;
    getCarByIdWithFallback(carId).then(found => {
      if (found) setCar(found);
      else navigate('/search');
    });
  }, [carId, navigate]);

  useEffect(() => {
    if (profile) {
      setDriverName(profile.full_name || '');
      setDriverPhone(profile.phone || '');
    }
  }, [profile]);

  if (!car) return null;

  const today = new Date().toISOString().split('T')[0];
  const totalDays = startDate && endDate ? calculateDays(startDate, endDate) : 0;
  const { subtotal, serviceFee, total: preDiscountTotal } = totalDays > 0
    ? calculateBookingTotal(car.daily_rate, totalDays)
    : { subtotal: 0, serviceFee: 0, total: 0 };

  const discountAmount = appliedCoupon
    ? Math.min(
        appliedCoupon.discount_type === 'percent'
          ? (subtotal * appliedCoupon.discount_value) / 100
          : appliedCoupon.discount_value,
        preDiscountTotal
      )
    : 0;
  const total = Math.max(0, preDiscountTotal - discountAmount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponStatus('checking');
    setCouponError('');
    const hostId = car.host_id || DANIEL_HOST_ID;
    try {
      const { data } = await lookupCoupon(hostId, couponCode);
      if (!data) {
        setCouponStatus('error'); setCouponError('Coupon not found or inactive'); setAppliedCoupon(null);
        return;
      }
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        setCouponStatus('error'); setCouponError('This coupon has expired'); setAppliedCoupon(null);
        return;
      }
      if (data.max_uses && data.times_used >= data.max_uses) {
        setCouponStatus('error'); setCouponError('This coupon has reached its usage limit'); setAppliedCoupon(null);
        return;
      }
      setAppliedCoupon(data as unknown as Coupon);
      setCouponStatus('idle');
      toast.success('Coupon applied!');
    } catch {
      setCouponStatus('error'); setCouponError('Could not check that code — try again');
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!startDate || !endDate) { toast.error('Please select trip dates'); return; }
      if (!pickupLocation) { toast.error('Please enter a pickup location'); return; }
    }
    if (step === 2) {
      if (!driverName || !driverPhone) { toast.error('Please fill in all driver details'); return; }
      if (!licenseNumber) { toast.error("Please enter your driver's license number"); return; }
      if (hasOwnInsurance === null) { toast.error('Please answer whether you have your own auto insurance'); return; }
      if (hasOwnInsurance && (!insuranceCompany || !insurancePolicyNumber)) {
        toast.error('Please enter your insurance company and policy number'); return;
      }
      if (!termsAccepted) { toast.error('Please accept the terms and conditions'); return; }
      for (const f of customFields) {
        if (f.is_required && !customFieldResponses[f.id]) {
          toast.error(`Please fill in "${f.label}"`); return;
        }
      }
    }
    if (step === 3) {
      if (!signatureName.trim()) { toast.error('Please type your full legal name to sign'); return; }
      if (signatureName.trim().toLowerCase() !== driverName.trim().toLowerCase()) {
        toast.error('Signature must match the driver name from the previous step'); return;
      }
      if (!signatureAgreed) { toast.error('Please confirm you agree to the rental agreement'); return; }
    }
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitRequest = async () => {
    setLoading(true);

    let bookingId = `AR${Date.now().toString().slice(-8)}`;
    const contractText = car ? getContractText({
      make: car.make, model: car.model, year: car.year, vin: car.vin, licensePlate: car.license_plate,
      renterName: signatureName, startDate, endDate,
      insuranceCompany: hasOwnInsurance ? insuranceCompany : 'Non-owner insurance (pending — provide before pickup)',
      insurancePolicyNumber: hasOwnInsurance ? insurancePolicyNumber : undefined,
    }) : '';

    if (isSupabaseConfigured && car) {
      const { data, error } = await createBooking({
        car_id: car.id,
        renter_id: user?.id,
        host_id: car.host_id || DANIEL_HOST_ID,
        start_date: startDate,
        end_date: endDate,
        total_days: totalDays,
        daily_rate: car.daily_rate,
        subtotal,
        service_fee: serviceFee,
        total_amount: total,
        status: 'pending',
        order_stage: 'reserved',
        pickup_location: pickupLocation || `${car.location}, ${car.city}, ${car.state}`,
        dropoff_location: dropoffLocation || null,
        renter_has_insurance: hasOwnInsurance,
        renter_insurance_company: hasOwnInsurance ? insuranceCompany : null,
        renter_insurance_policy_number: hasOwnInsurance ? insurancePolicyNumber : null,
        coupon_code: appliedCoupon?.code || null,
        discount_amount: discountAmount || 0,
        custom_field_responses: customFieldResponses,
      });
      if (!error && data) {
        bookingId = data.id;
        await createAgreement({
          booking_id: data.id,
          signer_name: signatureName,
          signer_email: user?.email || null,
          contract_version: CONTRACT_VERSION,
          contract_text: contractText,
          ip_address: clientIp,
          user_agent: navigator.userAgent,
        });
        sendBookingNotification(data.id, 'booking_requested');
      }
    }

    await new Promise(r => setTimeout(r, 800));

    toast.success('Request submitted!');
    navigate(`/bookings/${bookingId}`, {
      state: { car, startDate, endDate, totalDays, subtotal, serviceFee, total, pickupLocation, driverName, driverPhone, requestPending: true }
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
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600 dark:text-green-400">
              <span>Coupon ({appliedCoupon?.code})</span>
              <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
            </div>
          )}
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

                  <div>
                    <Label>Coupon code <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <div className="flex gap-2 mt-1.5">
                      <Input value={couponCode} onChange={e => setCouponCode(e.target.value)}
                        placeholder="e.g. WELCOME10" disabled={!!appliedCoupon} />
                      {appliedCoupon ? (
                        <Button type="button" variant="outline" onClick={() => { setAppliedCoupon(null); setCouponCode(''); setCouponStatus('idle'); }}>
                          Remove
                        </Button>
                      ) : (
                        <Button type="button" variant="outline" onClick={handleApplyCoupon} disabled={couponStatus === 'checking'}>
                          {couponStatus === 'checking' ? 'Checking…' : 'Apply'}
                        </Button>
                      )}
                    </div>
                    {appliedCoupon && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        "{appliedCoupon.code}" applied — {appliedCoupon.discount_type === 'percent' ? `${appliedCoupon.discount_value}% off` : `${formatCurrency(appliedCoupon.discount_value)} off`}
                      </p>
                    )}
                    {couponStatus === 'error' && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                  </div>
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

                  {/* Insurance */}
                  <div>
                    <Label>Do you have your own auto insurance?</Label>
                    <div className="flex gap-2 mt-1.5">
                      <button type="button" onClick={() => setHasOwnInsurance(true)}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${hasOwnInsurance === true ? 'bg-gold-500 border-gold-500 text-charcoal-900' : 'border-border'}`}>
                        Yes, I have a policy
                      </button>
                      <button type="button" onClick={() => setHasOwnInsurance(false)}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${hasOwnInsurance === false ? 'bg-gold-500 border-gold-500 text-charcoal-900' : 'border-border'}`}>
                        No, not yet
                      </button>
                    </div>

                    {hasOwnInsurance === true && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                        <div>
                          <Label>Insurance company</Label>
                          <Input value={insuranceCompany} onChange={e => setInsuranceCompany(e.target.value)}
                            placeholder="e.g. Progressive" className="mt-1.5" />
                        </div>
                        <div>
                          <Label>Policy number</Label>
                          <Input value={insurancePolicyNumber} onChange={e => setInsurancePolicyNumber(e.target.value)}
                            placeholder="Policy #" className="mt-1.5" />
                        </div>
                      </div>
                    )}

                    {hasOwnInsurance === false && (
                      <div className="mt-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-800 dark:text-amber-400">
                        <p className="font-bold mb-2">You'll need non-owner insurance before pickup</p>
                        <p className="mb-2">This covers you to drive without owning a car — it's quick to set up. Most of our renters use <strong>Direct Auto</strong>. Also available in most states: Bristol West, National General, Acceptance Insurance, and sometimes State Farm, Progressive, or GEICO directly.</p>
                        <p className="text-xs">Availability varies by state — call ahead and confirm coverage. We'll ask for your policy info before handing over the keys.</p>
                      </div>
                    )}
                  </div>

                  {/* Host-defined custom checkout fields */}
                  {customFields.length > 0 && (
                    <div className="space-y-4 border-t pt-4">
                      {customFields.map(f => (
                        <div key={f.id}>
                          <Label>{f.label}{f.is_required && <span className="text-red-500"> *</span>}</Label>
                          {f.field_type === 'text' && (
                            <Input className="mt-1.5" value={(customFieldResponses[f.id] as string) || ''}
                              onChange={e => setCustomFieldResponses(r => ({ ...r, [f.id]: e.target.value }))} />
                          )}
                          {f.field_type === 'select' && (
                            <select
                              className="w-full rounded-xl border px-3 py-2.5 text-sm bg-muted outline-none focus:ring-2 focus:ring-gold-400 mt-1.5"
                              value={(customFieldResponses[f.id] as string) || ''}
                              onChange={e => setCustomFieldResponses(r => ({ ...r, [f.id]: e.target.value }))}
                            >
                              <option value="">Select…</option>
                              {f.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                          )}
                          {f.field_type === 'checkbox' && (
                            <label className="flex items-center gap-2 mt-1.5 cursor-pointer text-sm">
                              <input type="checkbox" checked={!!customFieldResponses[f.id]}
                                onChange={e => setCustomFieldResponses(r => ({ ...r, [f.id]: e.target.checked }))} />
                              Yes
                            </label>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Verification info */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 font-bold text-blue-800 dark:text-blue-400 mb-2">
                      <Shield className="w-4 h-4" /> Before you drive
                    </div>
                    <ul className="text-sm text-blue-700 dark:text-blue-500 space-y-1">
                      <li>✓ We verify your ID and license match</li>
                      <li>✓ You'll sign a rental agreement</li>
                      <li>✓ Payment is collected securely once approved</li>
                    </ul>
                  </div>

                  {/* Site terms (separate from the rental agreement, which is signed next step) */}
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
                      I confirm I am 21+ years old with a valid driver's license, and I agree to Arvana Rentals's{' '}
                      <Link to="/terms" className="text-gold-600 dark:text-gold-400 hover:underline">Terms of Service</Link>.
                      The full rental agreement is signed in the next step.
                    </span>
                  </label>
                </div>
              )}

              {/* STEP 3: Sign the rental agreement */}
              {step === 3 && car && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-extrabold mb-1">Sign your rental agreement</h2>
                    <p className="text-muted-foreground text-sm">Read the full agreement below, then type your name to sign</p>
                  </div>

                  <div className="border rounded-xl p-4 h-72 overflow-y-auto bg-muted/40 text-xs leading-relaxed whitespace-pre-wrap font-mono">
                    {getContractText({
                      make: car.make, model: car.model, year: car.year, vin: car.vin, licensePlate: car.license_plate,
                      renterName: driverName || '(your name)', startDate: startDate || '—', endDate: endDate || '—',
                      insuranceCompany: hasOwnInsurance ? insuranceCompany : 'Non-owner insurance (pending — provide before pickup)',
                      insurancePolicyNumber: hasOwnInsurance ? insurancePolicyNumber : undefined,
                    })}
                  </div>

                  <div>
                    <Label>Type your full legal name to sign</Label>
                    <Input value={signatureName} onChange={e => setSignatureName(e.target.value)}
                      placeholder={driverName || 'Full legal name'} className="mt-1.5" />
                    <p className="text-xs text-muted-foreground mt-1">Must match the driver name from the previous step.</p>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <div
                      onClick={() => setSignatureAgreed(!signatureAgreed)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        signatureAgreed ? 'bg-gold-500 border-gold-500' : 'border-border'
                      }`}
                    >
                      {signatureAgreed && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      I have read and agree to the Vehicle Rental Agreement above. I understand this is a legally binding e-signature, timestamped with my name{clientIp ? ' and IP address' : ''}.
                    </span>
                  </label>
                </div>
              )}

              {/* STEP 4: Review & Submit */}
              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-extrabold mb-1">Review & submit your request</h2>
                    <p className="text-muted-foreground text-sm">This is a request, not an instant booking — here's what happens next</p>
                  </div>

                  {/* How it works */}
                  <div className="flex items-start gap-2 text-sm bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-blue-700 dark:text-blue-400">
                    <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div>
                      We personally verify every renter before handing over a car. After you submit, we'll text or email you within 24 hours to confirm your ID, send the rental agreement to sign, and collect payment. No payment is taken on this page.
                    </div>
                  </div>

                  {/* Trip + driver summary */}
                  <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 space-y-2 text-sm border">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dates</span>
                      <span className="font-semibold">{formatDate(startDate)} → {formatDate(endDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Driver</span>
                      <span className="font-semibold">{driverName || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="font-semibold">{driverPhone || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{formatCurrency(car.daily_rate)} × {totalDays} days</span>
                      <span className="font-semibold">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service fee</span>
                      <span className="font-semibold">{formatCurrency(serviceFee)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span>Coupon ({appliedCoupon?.code})</span>
                        <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-extrabold text-lg pt-2 border-t">
                      <span>Estimated total</span>
                      <span className="text-gold-600 dark:text-gold-400">{formatCurrency(total)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Estimated total — final amount and payment link are confirmed once your request is approved.
                  </p>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex gap-3 mt-8">
                {step > 1 && (
                  <Button variant="outline" size="lg" onClick={() => setStep(s => s - 1)} className="flex-1">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                )}
                {step < 4 ? (
                  <Button variant="default" size="lg" onClick={handleNext} className="flex-1 font-bold">
                    Continue <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button variant="default" size="lg" onClick={handleSubmitRequest}
                    className="flex-1 font-bold" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-charcoal-900/30 border-t-charcoal-900 rounded-full animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      <><Lock className="w-4 h-4 mr-2" /> Submit Request</>
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
                  <span>No payment required to submit a request</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-500" />
                  <span>We'll follow up to verify ID & confirm</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-gold-600 dark:text-gold-400" />
                  <span>Response within 24 hours</span>
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
