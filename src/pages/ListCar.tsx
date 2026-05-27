import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car, Info, Camera, MapPin, DollarSign, Check,
  ChevronRight, ChevronLeft, Upload, X, Zap, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 1, label: 'Car Basics', icon: Car },
  { id: 2, label: 'Car Details', icon: Info },
  { id: 3, label: 'Photos', icon: Camera },
  { id: 4, label: 'Location', icon: MapPin },
  { id: 5, label: 'Pricing', icon: DollarSign },
  { id: 6, label: 'Review', icon: Check },
];

const CATEGORIES = [
  { id: 'economy', label: 'Economy', icon: '💰', desc: 'Affordable everyday cars' },
  { id: 'suv', label: 'SUV', icon: '🚙', desc: 'Spacious family vehicles' },
  { id: 'luxury', label: 'Luxury', icon: '👑', desc: 'Premium experience' },
  { id: 'electric', label: 'Electric', icon: '⚡', desc: 'Eco-friendly EVs' },
  { id: 'sports', label: 'Sports', icon: '🏎️', desc: 'High performance cars' },
];

const FEATURES_LIST = [
  'AC', 'GPS', 'Bluetooth', 'USB', 'Apple CarPlay', 'Android Auto',
  'Backup Camera', 'Heated Seats', 'Sunroof', 'Child Seat', 'Bike Rack',
  'Ski Rack', 'AWD', '4WD', 'Lane Keep Assist', 'Adaptive Cruise',
  'Premium Audio', 'Parking Sensors', 'Keyless Entry',
];

const ListCar: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [category, setCategory] = useState('');

  // Step 2
  const [seats, setSeats] = useState('5');
  const [transmission, setTransmission] = useState('auto');
  const [fuelType, setFuelType] = useState('gasoline');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState<string[]>([]);

  // Step 3
  const [photos, setPhotos] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);

  // Step 4
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [pickupInstructions, setPickupInstructions] = useState('');
  const [mapCoords, setMapCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const geocodeAddress = useCallback(async () => {
    const query = [address, city, state, zipcode].filter(Boolean).join(', ');
    if (!query || query.length < 5) return;
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data && data[0]) {
        setMapCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
      }
    } catch {
      // silently fail
    } finally {
      setGeocoding(false);
    }
  }, [address, city, state, zipcode]);

  useEffect(() => {
    if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
    geocodeTimer.current = setTimeout(geocodeAddress, 900);
    return () => { if (geocodeTimer.current) clearTimeout(geocodeTimer.current); };
  }, [geocodeAddress]);

  // Step 5
  const [dailyRate, setDailyRate] = useState('');
  const [instantBook, setInstantBook] = useState(true);
  const [advanceNotice, setAdvanceNotice] = useState('1');
  const [maxDuration, setMaxDuration] = useState('30');

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  const toggleFeature = (f: string) => {
    setFeatures(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  };

  const addSamplePhoto = () => {
    const urls = [
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=400&h=300&fit=crop',
    ];
    if (photos.length < 10) {
      setPhotos(prev => [...prev, urls[prev.length % urls.length]]);
    }
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!make || !model || !year || !color || !category) {
          toast.error('Please fill in all required fields'); return false;
        }
        break;
      case 2:
        if (!description || description.length < 50) {
          toast.error('Please write a description (at least 50 characters)'); return false;
        }
        break;
      case 3:
        if (photos.length < 3) {
          toast.error('Please add at least 3 photos'); return false;
        }
        break;
      case 4:
        if (!address || !city || !state || !zipcode) {
          toast.error('Please enter your car\'s full location including zip code'); return false;
        }
        break;
      case 5:
        if (!dailyRate || Number(dailyRate) < 20) {
          toast.error('Please set a daily rate (minimum $20)'); return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep(s => Math.min(s + 1, 6));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setStep(s => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 2000));
    toast.success('🎉 Your car has been submitted for review!');
    navigate('/host/dashboard');
    setSubmitting(false);
  };

  const estimatedEarnings = dailyRate ? Math.round(Number(dailyRate) * 15 * 0.85) : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-charcoal-900 pt-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-charcoal-900 dark:text-white mb-1">List your car</h1>
          <p className="text-muted-foreground">Share your car and start earning today</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-muted-foreground">Step {step} of {STEPS.length}</span>
            <span className="text-sm font-bold text-gold-600">{STEPS[step - 1].label}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold-500 to-gold-400 rounded-full transition-all duration-500"
              style={{ width: `${progress + (100 / STEPS.length)}%` }}
            />
          </div>

          {/* Step dots */}
          <div className="flex justify-between mt-3">
            {STEPS.map(s => {
              const Icon = s.icon;
              return (
                <div key={s.id} className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all text-xs ${
                    s.id < step ? 'bg-green-500 border-green-500 text-white'
                    : s.id === step ? 'bg-gold-500 border-gold-500 text-white'
                    : 'border-border text-muted-foreground'
                  }`}>
                    {s.id < step ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-xs text-muted-foreground hidden sm:block">{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white dark:bg-charcoal-900 rounded-2xl border shadow-sm p-6 sm:p-8">
          {/* STEP 1: Car Basics */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-extrabold mb-1">Tell us about your car</h2>
                <p className="text-muted-foreground text-sm">Basic information about the vehicle you want to list</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Make <span className="text-gold-600">*</span></Label>
                  <Input value={make} onChange={e => setMake(e.target.value)}
                    placeholder="Toyota" className="mt-1.5" />
                </div>
                <div>
                  <Label>Model <span className="text-gold-600">*</span></Label>
                  <Input value={model} onChange={e => setModel(e.target.value)}
                    placeholder="Camry" className="mt-1.5" />
                </div>
                <div>
                  <Label>Year <span className="text-gold-600">*</span></Label>
                  <Input value={year} onChange={e => setYear(e.target.value)}
                    placeholder="2023" type="number" min="2000" max="2025" className="mt-1.5" />
                </div>
                <div>
                  <Label>Color <span className="text-gold-600">*</span></Label>
                  <Input value={color} onChange={e => setColor(e.target.value)}
                    placeholder="Pearl White" className="mt-1.5" />
                </div>
                <div className="col-span-2">
                  <Label>License plate</Label>
                  <Input value={licensePlate} onChange={e => setLicensePlate(e.target.value)}
                    placeholder="ABC 1234" className="mt-1.5" />
                  <p className="text-xs text-muted-foreground mt-1">Only visible to confirmed renters</p>
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Category <span className="text-gold-600">*</span></Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        category === cat.id
                          ? 'border-gold-500 bg-yellow-50 dark:bg-yellow-900/20'
                          : 'border-border hover:border-gold-500/50'
                      }`}
                    >
                      <div className="text-xl mb-1">{cat.icon}</div>
                      <div className="font-bold text-sm">{cat.label}</div>
                      <div className="text-xs text-muted-foreground">{cat.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Car Details */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-extrabold mb-1">Car details</h2>
                <p className="text-muted-foreground text-sm">Help renters know what to expect</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Seats <span className="text-gold-600">*</span></Label>
                  <select value={seats} onChange={e => setSeats(e.target.value)}
                    className="mt-1.5 w-full border border-input rounded-xl px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-gold-400">
                    {[2, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n} seats</option>)}
                  </select>
                </div>
                <div>
                  <Label>Transmission <span className="text-gold-600">*</span></Label>
                  <select value={transmission} onChange={e => setTransmission(e.target.value)}
                    className="mt-1.5 w-full border border-input rounded-xl px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-gold-400">
                    <option value="auto">Automatic</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
                <div>
                  <Label>Fuel type <span className="text-gold-600">*</span></Label>
                  <select value={fuelType} onChange={e => setFuelType(e.target.value)}
                    className="mt-1.5 w-full border border-input rounded-xl px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-gold-400">
                    <option value="gasoline">Gasoline</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Description <span className="text-gold-600">*</span></Label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe your car — what makes it special, its condition, and what renters should know. Be specific and enthusiastic!"
                  className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                />
                <p className={`text-xs mt-1 ${description.length < 50 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                  {description.length}/50 minimum characters
                </p>
              </div>

              <div>
                <Label className="mb-3 block">Features & amenities</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {FEATURES_LIST.map(f => (
                    <label key={f} className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      features.includes(f) ? 'border-gold-500 bg-yellow-50 dark:bg-yellow-900/20' : 'border-border hover:border-gold-500/50'
                    }`}>
                      <div
                        onClick={() => toggleFeature(f)}
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          features.includes(f) ? 'bg-gold-500 border-gold-500' : 'border-muted-foreground'
                        }`}
                      >
                        {features.includes(f) && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <span className="text-xs font-medium">{f}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Photos */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-extrabold mb-1">Add photos</h2>
                <p className="text-muted-foreground text-sm">Great photos = more bookings. Add at least 3 clear photos.</p>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); addSamplePhoto(); }}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
                  dragging ? 'border-gold-500 bg-yellow-50 dark:bg-yellow-900/10' : 'border-border hover:border-gold-500/50 hover:bg-muted/50'
                }`}
                onClick={addSamplePhoto}
              >
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-bold mb-1">Drag and drop photos here</p>
                <p className="text-sm text-muted-foreground">or click to add sample photos ({photos.length}/10)</p>
                <p className="text-xs text-muted-foreground mt-2">JPG, PNG · Up to 10MB each</p>
              </div>

              {/* Photo grid */}
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {photos.map((url, i) => (
                    <div key={i} className="relative group rounded-xl overflow-hidden aspect-square">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      {i === 0 && (
                        <div className="absolute top-2 left-2 bg-charcoal-900 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          Cover
                        </div>
                      )}
                      <button
                        onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gold-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-sm text-blue-700 dark:text-blue-400">
                <strong>📸 Photo tips:</strong> Include exterior (front, sides, rear), interior (dashboard, seats), and any special features. Clean the car before shooting!
              </div>
            </div>
          )}

          {/* STEP 4: Location */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-extrabold mb-1">Where is your car?</h2>
                <p className="text-muted-foreground text-sm">Renters will see the general neighborhood, not your exact address</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Street address <span className="text-gold-600">*</span></Label>
                  <div className="relative mt-1.5">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input value={address} onChange={e => setAddress(e.target.value)}
                      placeholder="123 Main Street" className="pl-10" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <Label>City <span className="text-gold-600">*</span></Label>
                    <Input value={city} onChange={e => setCity(e.target.value)}
                      placeholder="Miami" className="mt-1.5" />
                  </div>
                  <div>
                    <Label>State <span className="text-gold-600">*</span></Label>
                    <Input value={state} onChange={e => setState(e.target.value.toUpperCase())}
                      placeholder="FL" className="mt-1.5" maxLength={2} />
                  </div>
                  <div>
                    <Label>ZIP Code <span className="text-gold-600">*</span></Label>
                    <Input value={zipcode} onChange={e => setZipcode(e.target.value)}
                      placeholder="33101" className="mt-1.5" maxLength={10} />
                  </div>
                </div>
                <div>
                  <Label>Pickup instructions</Label>
                  <textarea
                    value={pickupInstructions}
                    onChange={e => setPickupInstructions(e.target.value)}
                    rows={3}
                    placeholder="e.g. The car is parked in my driveway. Ring the doorbell to get the keys. Street parking available for your vehicle."
                    className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                  />
                </div>
              </div>

              {/* Live Map */}
              <div className="rounded-xl overflow-hidden border shadow-sm" style={{ height: 280 }}>
                {mapCoords ? (
                  <iframe
                    key={`${mapCoords.lat},${mapCoords.lon}`}
                    title="Car location map"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCoords.lon - 0.015},${mapCoords.lat - 0.015},${mapCoords.lon + 0.015},${mapCoords.lat + 0.015}&layer=mapnik&marker=${mapCoords.lat},${mapCoords.lon}`}
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-sm">
                    <div className="text-center">
                      {geocoding ? (
                        <>
                          <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          <p>Finding your location...</p>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-8 h-8 mx-auto mb-2 text-gold-500" />
                          <p>Start typing your address to see the map</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {mapCoords && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gold-500" />
                  Renters will only see the approximate neighborhood, not your exact address.
                </p>
              )}
            </div>
          )}

          {/* STEP 5: Pricing */}
          {step === 5 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-extrabold mb-1">Set your price</h2>
                <p className="text-muted-foreground text-sm">You can change your pricing anytime</p>
              </div>

              {/* Daily rate */}
              <div>
                <Label>Daily rate <span className="text-gold-600">*</span></Label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-lg">$</span>
                  <input
                    type="number"
                    value={dailyRate}
                    onChange={e => setDailyRate(e.target.value)}
                    placeholder="95"
                    min="20"
                    max="2000"
                    className="w-full border border-input rounded-xl pl-8 pr-16 py-3 text-2xl font-extrabold outline-none focus:ring-2 focus:ring-gold-400 bg-background"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">/day</span>
                </div>

                {dailyRate && Number(dailyRate) >= 20 && (
                  <div className="mt-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                    <p className="text-green-700 dark:text-green-400 font-bold text-sm">
                      💰 Estimated earnings: ${estimatedEarnings.toLocaleString()}/month
                    </p>
                    <p className="text-green-600 dark:text-green-500 text-xs mt-0.5">
                      Based on 15 trips/month after Arvana Rentals's 15% fee
                    </p>
                  </div>
                )}
              </div>

              {/* Instant book */}
              <div className="flex items-center justify-between p-4 border rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Instant book</p>
                    <p className="text-xs text-muted-foreground">Renters can book without your approval</p>
                  </div>
                </div>
                <button
                  onClick={() => setInstantBook(!instantBook)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${instantBook ? 'bg-gold-500' : 'bg-muted'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${instantBook ? 'translate-x-6' : ''}`} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Advance notice
                  </Label>
                  <select value={advanceNotice} onChange={e => setAdvanceNotice(e.target.value)}
                    className="mt-1.5 w-full border border-input rounded-xl px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-gold-400">
                    {[1, 2, 3, 5, 7].map(d => <option key={d} value={d}>{d} day{d > 1 ? 's' : ''} before</option>)}
                  </select>
                </div>
                <div>
                  <Label>Max trip duration</Label>
                  <select value={maxDuration} onChange={e => setMaxDuration(e.target.value)}
                    className="mt-1.5 w-full border border-input rounded-xl px-3 py-2 text-sm bg-background outline-none focus:ring-2 focus:ring-gold-400">
                    {[7, 14, 30, 60, 90].map(d => <option key={d} value={d}>{d} days</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Review & Submit */}
          {step === 6 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-extrabold mb-1">Review your listing</h2>
                <p className="text-muted-foreground text-sm">Double-check everything before submitting</p>
              </div>

              {photos.length > 0 && (
                <img src={photos[0]} alt="Cover"
                  className="w-full h-48 object-cover rounded-2xl" />
              )}

              <div className="space-y-4">
                {[
                  { title: 'Car', content: `${year} ${make} ${model} · ${color} · ${category}` },
                  { title: 'Details', content: `${seats} seats · ${transmission === 'auto' ? 'Automatic' : 'Manual'} · ${fuelType}` },
                  { title: 'Features', content: features.length > 0 ? features.slice(0, 5).join(', ') + (features.length > 5 ? ` +${features.length - 5} more` : '') : 'None selected' },
                  { title: 'Photos', content: `${photos.length} photo${photos.length !== 1 ? 's' : ''} added` },
                  { title: 'Location', content: `${address}, ${city}, ${state} ${zipcode}` },
                  { title: 'Daily rate', content: `$${dailyRate}/day · ${instantBook ? 'Instant book enabled' : 'Requires approval'}` },
                ].map(({ title, content }) => (
                  <div key={title} className="flex gap-4 py-3 border-b last:border-0">
                    <div className="text-sm font-bold text-muted-foreground w-24 flex-shrink-0">{title}</div>
                    <div className="text-sm font-semibold capitalize">{content}</div>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-500">
                <strong>🕐 Review process:</strong> After submission, our team will review your listing within 24 hours. You'll be notified by email when it's approved!
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8 pt-6 border-t">
            {step > 1 && (
              <Button variant="outline" size="lg" onClick={handleBack} className="flex-1">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            )}
            {step < 6 ? (
              <Button variant="default" size="lg" onClick={handleNext} className="flex-1 font-bold">
                Continue <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button variant="default" size="lg" onClick={handleSubmit}
                className="flex-1 font-bold" disabled={submitting}>
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-charcoal-900/30 border-t-charcoal-900 rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : (
                  <><Check className="w-4 h-4 mr-2" /> Submit listing</>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Save progress hint */}
        {step < 6 && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            Your progress is auto-saved. You can return to complete this later.
          </p>
        )}
      </div>
    </div>
  );
};

export default ListCar;
