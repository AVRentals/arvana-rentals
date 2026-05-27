import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star, MapPin, Users, Fuel, Settings2, Calendar,
  ChevronLeft, ChevronRight, Share2, Heart, Shield,
  MessageCircle, Check, Zap, Clock, X, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CarDetailSkeleton } from '@/components/LoadingSkeleton';
import CarCard from '@/components/CarCard';
import Footer from '@/components/Footer';
import { sampleCars, sampleReviews } from '@/data/sampleData';
import { Car, Review } from '@/types';
import {
  formatCurrency, formatDate, formatDateShort, getInitials,
  calculateDays, calculateBookingTotal, toggleSavedCar, isCarSaved
} from '@/lib/utils';
import toast from 'react-hot-toast';

const FEATURE_ICONS: Record<string, string> = {
  'AC': '❄️', 'GPS': '🗺️', 'Bluetooth': '📡', 'USB': '🔌', 'USB-C': '🔌',
  'Backup Camera': '📷', 'Sunroof': '☀️', 'Heated Seats': '🔥', 'Autopilot': '🤖',
  'Apple CarPlay': '🍎', 'Android Auto': '🤖', 'AWD': '🏔️', '4WD': '🏔️',
  'Sport Mode': '🏎️', 'Child Seat': '👶', 'Massaging Seats': '💆',
  'Panoramic Sunroof': '🌅', 'Night Vision': '🌙', 'Air Suspension': '🎈',
  'Sport Exhaust': '💨', 'Custom Exhaust': '💨', 'Lifting System': '🔧',
  'Premium Audio': '🎵', 'BOSE Audio': '🎵', 'Harman Kardon Audio': '🎵',
  'Meridian Audio': '🎵', 'Burmester Audio': '🎵', 'Bang & Olufsen Audio': '🎵',
  'Rock-Trac 4WD': '🏔️', 'Locking Differentials': '🔒', 'Trail-Rated': '⛰️',
  'Removable Doors': '🚪', 'Open Sky Freedom Top': '🌤️', 'Lane Keep Assist': '🛣️',
  'Adaptive Cruise': '🚗', 'Quattro AWD': '🏔️', 'Virtual Cockpit': '🖥️',
  'Drive Modes': '⚙️', 'Carbon Fiber Trim': '🏁', 'Carbon Ceramic Brakes': '🛑',
};

const CarDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [car, setCar] = useState<Car | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [saved, setSaved] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showMobileBooking, setShowMobileBooking] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      const found = sampleCars.find(c => c.id === id);
      if (found) {
        setCar(found);
        setSaved(isCarSaved(found.id));
        setReviews(sampleReviews.filter(r => r.car_id === id).slice(0, 5));
      }
      setLoading(false);
    }, 600);
    return () => clearTimeout(t);
  }, [id]);

  const totalDays = startDate && endDate ? calculateDays(startDate, endDate) : 0;
  const { subtotal, serviceFee, total } = totalDays > 0 && car
    ? calculateBookingTotal(car.daily_rate, totalDays)
    : { subtotal: 0, serviceFee: 0, total: 0 };

  const handleReserve = () => {
    if (!startDate || !endDate) { toast.error('Please select your trip dates'); return; }
    navigate(`/book/${car?.id}?start=${startDate}&end=${endDate}`);
  };

  const handleSave = () => {
    if (!car) return;
    const nowSaved = toggleSavedCar(car.id);
    setSaved(nowSaved);
    toast.success(nowSaved ? '❤️ Added to saved cars' : 'Removed from saved cars');
  };

  const similarCars = sampleCars.filter(c => c.id !== id && c.category === car?.category).slice(0, 4);

  if (loading) return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CarDetailSkeleton />
      </div>
    </div>
  );

  if (!car) return (
    <div className="min-h-screen pt-16 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🚗</div>
        <h2 className="text-2xl font-bold mb-2">Car not found</h2>
        <Button onClick={() => navigate('/search')}>Browse all cars</Button>
      </div>
    </div>
  );

  const BookingSidebar = () => (
    <div className="bg-card rounded-2xl border shadow-xl p-6">
      <div className="flex items-baseline justify-between mb-1">
        <div>
          <span className="text-3xl font-extrabold text-charcoal-900 dark:text-white">
            {formatCurrency(car.daily_rate)}
          </span>
          <span className="text-muted-foreground text-sm font-medium"> /day</span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <Star className="w-4 h-4 fill-gold-400 text-gold-400" />
          <span className="font-bold">{car.rating}</span>
          <span className="text-muted-foreground">({car.total_trips})</span>
        </div>
      </div>

      <div className="space-y-3 mt-5">
        <div className="grid grid-cols-2 gap-2">
          <div className="border-2 border-border rounded-xl p-3 focus-within:border-gold-400 transition-colors">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pick-up</label>
            <input
              type="date"
              value={startDate}
              min={today}
              onChange={e => { setStartDate(e.target.value); if (endDate && e.target.value >= endDate) setEndDate(''); }}
              className="w-full text-sm font-semibold outline-none bg-transparent mt-0.5"
            />
          </div>
          <div className="border-2 border-border rounded-xl p-3 focus-within:border-gold-400 transition-colors">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Return</label>
            <input
              type="date"
              value={endDate}
              min={startDate || today}
              onChange={e => setEndDate(e.target.value)}
              className="w-full text-sm font-semibold outline-none bg-transparent mt-0.5"
            />
          </div>
        </div>

        {totalDays > 0 && (
          <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{formatCurrency(car.daily_rate)} × {totalDays} day{totalDays > 1 ? 's' : ''}</span>
              <span className="font-semibold">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground flex items-center gap-1">
                Service fee <Info className="w-3 h-3" />
              </span>
              <span className="font-semibold">{formatCurrency(serviceFee)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-gold-600 dark:text-gold-400">{formatCurrency(total)}</span>
            </div>
          </div>
        )}

        <Button variant="default" size="lg" className="w-full font-bold text-base" onClick={handleReserve}>
          {totalDays > 0 ? `Reserve — ${formatCurrency(total)}` : 'Reserve'}
        </Button>

        <Button variant="outline" size="lg" className="w-full gap-2" onClick={() => navigate('/contact')}>
          <MessageCircle className="w-4 h-4" /> Message host
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-3">
        Free cancellation up to 24 hours before pick-up
      </p>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Shield className="w-3.5 h-3.5 text-green-500" />
        <span>$1M insurance included on every trip</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/search" className="hover:text-foreground">Search</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">{car.year} {car.make} {car.model}</span>
        </div>

        {/* Title + actions */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Badge variant={car.category as 'economy' | 'suv' | 'luxury' | 'electric' | 'sports'}>
                {car.category.charAt(0).toUpperCase() + car.category.slice(1)}
              </Badge>
              {car.fuel_type === 'electric' && <Badge variant="electric" className="gap-1"><Zap className="w-3 h-3" />Electric</Badge>}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              {car.year} {car.make} {car.model}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-gold-400 text-gold-400" />
                <span className="font-bold text-foreground">{car.rating.toFixed(1)}</span>
                <span>({car.total_trips} trips)</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {car.city}, {car.state}
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => toast('Link copied!')} className="p-2.5 rounded-full border border-border hover:bg-muted transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
            <button onClick={handleSave} className="p-2.5 rounded-full border border-border hover:bg-muted transition-colors">
              <Heart className={`w-4 h-4 transition-colors ${saved ? 'fill-gold-600 dark:fill-gold-400 text-gold-600 dark:text-gold-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Photo gallery */}
        <div className="relative rounded-3xl overflow-hidden bg-muted mb-8 group">
          <div className="relative h-72 sm:h-96 lg:h-[520px]">
            <img
              src={imgErrors[activeImage] ? 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&h=600&fit=crop' : car.images[activeImage]}
              alt={`${car.make} ${car.model}`}
              className="w-full h-full object-cover"
              onError={() => setImgErrors(e => ({ ...e, [activeImage]: true }))}
            />
            {/* Nav arrows */}
            {car.images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage(i => (i - 1 + car.images.length) % car.images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-charcoal-900 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setActiveImage(i => (i + 1) % car.images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-charcoal-900 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            {/* Image counter */}
            <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
              {activeImage + 1} / {car.images.length}
            </div>
          </div>

          {/* Thumbnails */}
          {car.images.length > 1 && (
            <div className="flex gap-2 p-3 bg-black/5">
              {car.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                    activeImage === i ? 'border-gold-500 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgErrors[i] ? 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200&h=150&fit=crop' : img}
                    alt="" className="w-full h-full object-cover"
                    onError={() => setImgErrors(e => ({ ...e, [i]: true }))} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: tabs */}
          <div className="lg:col-span-2">
            {/* Quick specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { icon: <Users className="w-5 h-5 text-gold-600 dark:text-gold-400" />, label: 'Seats', value: `${car.seats} passengers` },
                { icon: <Settings2 className="w-5 h-5 text-gold-600 dark:text-gold-400" />, label: 'Transmission', value: car.transmission === 'auto' ? 'Automatic' : 'Manual' },
                { icon: <Fuel className="w-5 h-5 text-gold-600 dark:text-gold-400" />, label: 'Fuel type', value: car.fuel_type.charAt(0).toUpperCase() + car.fuel_type.slice(1) },
                { icon: <Clock className="w-5 h-5 text-gold-600 dark:text-gold-400" />, label: 'Min. rental', value: '1 day' },
              ].map(({ icon, label, value }) => (
                <div key={label} className="bg-card rounded-xl border p-4 text-center">
                  <div className="flex justify-center mb-2">{icon}</div>
                  <div className="text-xs text-muted-foreground font-medium">{label}</div>
                  <div className="font-bold text-sm mt-0.5">{value}</div>
                </div>
              ))}
            </div>

            <Tabs defaultValue="overview">
              <TabsList className="w-full mb-6">
                <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                <TabsTrigger value="features" className="flex-1">Features</TabsTrigger>
                <TabsTrigger value="location" className="flex-1">Location</TabsTrigger>
                <TabsTrigger value="reviews" className="flex-1">
                  Reviews {reviews.length > 0 && `(${reviews.length})`}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-foreground leading-relaxed text-base">{car.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-6">
                  {[
                    ['Make', car.make], ['Model', car.model], ['Year', car.year],
                    ['Color', car.color], ['Category', car.category],
                    ['Transmission', car.transmission === 'auto' ? 'Automatic' : 'Manual'],
                    ['Fuel', car.fuel_type], ['Seats', car.seats],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="flex justify-between items-center py-3 border-b border-dashed last:border-0">
                      <span className="text-muted-foreground text-sm font-medium">{label}</span>
                      <span className="font-bold text-sm capitalize">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="features">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {car.features.map(feature => (
                    <div key={feature}
                      className="flex items-center gap-3 p-3 bg-muted rounded-xl border border-border">
                      <span className="text-xl">{FEATURE_ICONS[feature] || '✓'}</span>
                      <span className="text-sm font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="location">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <MapPin className="w-5 h-5 text-gold-600 dark:text-gold-400" />
                    {car.location}, {car.city}, {car.state}
                  </div>
                  <div className="rounded-2xl overflow-hidden border bg-muted" style={{ height: 300 }}>
                    <img
                      src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=300&fit=crop"
                      alt="Map"
                      className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-gold-500 text-black px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                        📍 {car.city}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Exact pickup location will be shared after booking confirmation.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="reviews">
                {reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="w-12 h-12 text-muted mx-auto mb-3" />
                    <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Average rating */}
                    <div className="flex items-center gap-6 p-6 bg-muted rounded-2xl">
                      <div className="text-center">
                        <div className="text-5xl font-extrabold text-charcoal-900 dark:text-white">{car.rating.toFixed(1)}</div>
                        <div className="flex items-center gap-0.5 mt-1 justify-center">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`w-4 h-4 ${s <= Math.round(car.rating) ? 'fill-gold-400 text-gold-400' : 'text-muted-foreground'}`} />
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{car.total_trips} trips</div>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {[5,4,3,2,1].map(s => (
                          <div key={s} className="flex items-center gap-2 text-xs">
                            <span className="w-3">{s}</span>
                            <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gold-400 rounded-full"
                                style={{ width: `${s === 5 ? 70 : s === 4 ? 20 : 5}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {reviews.map(review => (
                      <div key={review.id} className="border-b pb-6 last:border-0">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={review.reviewer?.avatar_url} />
                            <AvatarFallback>{review.reviewer?.full_name ? getInitials(review.reviewer.full_name) : 'U'}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-sm">{review.reviewer?.full_name}</p>
                              <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-0.5 mt-0.5">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'fill-gold-400 text-gold-400' : 'text-muted'}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: booking sidebar (desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <BookingSidebar />
              {/* Host card */}
              {car.host && (
                <div className="bg-card rounded-2xl border p-5 mt-4 shadow-sm">
                  <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-4">Your host</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-14 h-14">
                      <AvatarImage src={car.host.avatar_url} />
                      <AvatarFallback className="text-lg">{getInitials(car.host.full_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold">{car.host.full_name}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
                        <span>4.9 · {car.total_trips} trips</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Member since {new Date(car.host.created_at).getFullYear()}
                      </p>
                    </div>
                  </div>
                  {car.host.bio && (
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{car.host.bio}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-green-600 font-semibold">
                    <Check className="w-3.5 h-3.5" /> Identity verified
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Similar cars */}
        {similarCars.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-extrabold mb-6">Similar {car.category} cars</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarCars.map(c => <CarCard key={c.id} car={c} />)}
            </div>
          </section>
        )}
      </div>

      {/* Mobile sticky booking bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t shadow-lg">
        {showMobileBooking ? (
          <div className="max-h-[80vh] overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Book this car</h3>
              <button onClick={() => setShowMobileBooking(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <BookingSidebar />
          </div>
        ) : (
          <div className="p-4 flex items-center justify-between gap-4">
            <div>
              <span className="text-2xl font-extrabold">{formatCurrency(car.daily_rate)}</span>
              <span className="text-muted-foreground text-sm"> /day</span>
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
                <span className="font-bold">{car.rating}</span>
                <span className="text-muted-foreground">({car.total_trips})</span>
              </div>
            </div>
            <Button variant="default" size="lg" className="flex-1" onClick={() => setShowMobileBooking(true)}>
              <Calendar className="w-4 h-4 mr-2" /> Reserve
            </Button>
          </div>
        )}
      </div>

      <div className="pb-24 lg:pb-0">
        <Footer />
      </div>
    </div>
  );
};

export default CarDetail;
