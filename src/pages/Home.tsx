import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Calendar, Shield, Clock, Star,
  ArrowRight, Zap, CheckCircle2, ChevronRight, ChevronDown,
  Car as CarIcon, KeyRound, DollarSign, RotateCcw, FileText,
} from 'lucide-react';
import Footer from '@/components/Footer';
import { isSupabaseConfigured, createQuoteRequest, uploadQuoteDoc } from '@/lib/supabase';
import toast from 'react-hot-toast';

// ── Instant quote form (MMJ-style lead capture — no account needed) ──
const QuoteForm: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [isGigWorker, setIsGigWorker] = useState<boolean | null>(null);
  const [gigScreenshot, setGigScreenshot] = useState<File | null>(null);
  const [licensePhoto, setLicensePhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { toast.error('Please enter your name'); return; }
    if (!phone.trim()) { toast.error('Please enter your phone number'); return; }
    if (!email.trim()) { toast.error('Please enter your email'); return; }
    if (!pickupDate) { toast.error('Please select a pick-up date'); return; }
    if (!returnDate) { toast.error('Please select a return date'); return; }
    if (isGigWorker === null) { toast.error('Please tell us if you are an active gig worker'); return; }
    if (isGigWorker) {
      if (!gigScreenshot) { toast.error('Please upload a screenshot of your recent gig trips (last 30 days)'); return; }
      if (!licensePhoto) { toast.error("Please upload a photo of your driver's license"); return; }
    }

    setSubmitting(true);
    try {
      let gigPath: string | null = null;
      let licPath: string | null = null;
      if (isSupabaseConfigured) {
        if (gigScreenshot) {
          const { path } = await uploadQuoteDoc(gigScreenshot, 'gigscreenshot');
          gigPath = path;
        }
        if (licensePhoto) {
          const { path } = await uploadQuoteDoc(licensePhoto, 'license');
          licPath = path;
        }
        await createQuoteRequest({
          full_name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          pickup_date: pickupDate,
          pickup_time: pickupTime || null,
          return_date: returnDate,
          is_gig_worker: isGigWorker,
          gig_screenshot_path: gigPath,
          license_photo_path: licPath,
        });
      }
      setSubmitted(true);
      toast.success('Request received! We will reach out shortly.');
    } catch {
      toast.error('Something went wrong — please try again or call us.');
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl text-center">
        <div className="w-14 h-14 rounded-full bg-gold-gradient flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-7 h-7 text-charcoal-900" />
        </div>
        <h3 className="text-white font-extrabold text-xl mb-2">Request received!</h3>
        <p className="text-white/60 text-sm">We'll text or email you shortly with your quote and next steps.</p>
      </div>
    );
  }

  const inputClass = 'w-full bg-white/15 hover:bg-white/20 border border-white/10 focus:border-gold-400/60 rounded-xl px-3.5 py-2.5 text-sm outline-none placeholder:text-white/35 font-medium text-white transition-all [color-scheme:dark]';
  const labelClass = 'text-white/60 text-xs font-semibold uppercase tracking-wider px-1 mb-1 block text-left';

  return (
    <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 sm:p-6 shadow-2xl text-left">
      <h3 className="text-white font-extrabold text-lg mb-1 text-center">
        Get a <span className="text-gold-gradient">free instant quote</span>
      </h3>
      <p className="text-white/50 text-xs text-center mb-5">Book your rental car now — no account needed</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className={labelClass}>First & last name *</label>
          <input className={inputClass} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" />
        </div>
        <div>
          <label className={labelClass}>Phone number *</label>
          <input type="tel" className={inputClass} value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 000-0000" />
        </div>
      </div>

      <div className="mb-3">
        <label className={labelClass}>Email *</label>
        <input type="email" className={inputClass} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        <div>
          <label className={labelClass}>Pick-up date *</label>
          <input type="date" className={inputClass} value={pickupDate} onChange={e => setPickupDate(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Pick-up time</label>
          <input type="time" className={inputClass} value={pickupTime} onChange={e => setPickupTime(e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Return date *</label>
          <input type="date" className={inputClass} value={returnDate} onChange={e => setReturnDate(e.target.value)} />
        </div>
      </div>

      <div className="mb-3">
        <label className={labelClass}>Are you an active gig worker? *</label>
        <div className="flex gap-2">
          <button type="button" onClick={() => setIsGigWorker(true)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${isGigWorker === true ? 'bg-gold-500 border-gold-500 text-charcoal-900' : 'border-white/20 text-white/70 hover:border-gold-400/50'}`}>
            Yes
          </button>
          <button type="button" onClick={() => setIsGigWorker(false)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${isGigWorker === false ? 'bg-gold-500 border-gold-500 text-charcoal-900' : 'border-white/20 text-white/70 hover:border-gold-400/50'}`}>
            No
          </button>
        </div>
      </div>

      {isGigWorker === true && (
        <div className="space-y-3 mb-3">
          <div>
            <label className={labelClass}>Screenshot of your active gig account (trips within the last 30 days) *</label>
            <input type="file" accept="image/*" className="w-full text-xs text-white/70 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:bg-gold-500 file:text-charcoal-900 file:text-xs file:font-bold"
              onChange={e => setGigScreenshot(e.target.files?.[0] || null)} />
          </div>
          <div>
            <label className={labelClass}>Photo of your active driver's license *</label>
            <input type="file" accept="image/*" className="w-full text-xs text-white/70 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:bg-gold-500 file:text-charcoal-900 file:text-xs file:font-bold"
              onChange={e => setLicensePhoto(e.target.files?.[0] || null)} />
          </div>
        </div>
      )}

      <button type="submit" disabled={submitting}
        className="btn-gold w-full rounded-xl px-5 py-3 font-bold text-sm mt-2 disabled:opacity-60">
        {submitting ? 'Submitting…' : 'Book your car now'}
      </button>
      <p className="text-white/40 text-[11px] text-center mt-3">
        No payment taken now — we'll confirm availability and follow up within 24 hours.
      </p>
    </form>
  );
};

const CITIES = [
  { name: 'Miami',           img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=280&fit=crop' },
  { name: 'Orlando',         img: 'https://images.unsplash.com/photo-1575089776834-8be34696ffb9?w=400&h=280&fit=crop' },
  { name: 'Tampa',           img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=280&fit=crop' },
  { name: 'Fort Lauderdale', img: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=400&h=280&fit=crop' },
  { name: 'Jacksonville',    img: 'https://images.unsplash.com/photo-1587502537104-aac10f5fb6f7?w=400&h=280&fit=crop' },
  { name: 'Key West',        img: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=400&h=280&fit=crop' },
];

const STATS = [
  { value: '✓',    label: 'Every Car Hand-Picked' },
  { value: '100%', label: 'Personally Inspected' },
  { value: '24/7', label: 'Roadside Support' },
  { value: '2026', label: 'Locally Owned' },
];

const WHY = [
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Personally Vetted',
    desc: "We verify every renter's ID before handoff — no anonymous bookings.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Fast Response',
    desc: 'Submit a request and hear back from us within 24 hours, usually much sooner.',
  },
  {
    icon: <CheckCircle2 className="w-6 h-6" />,
    title: 'Inspected Fleet',
    desc: 'Every car gets a full inspection before it goes out for its first rental.',
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: 'Flexible Rentals',
    desc: 'Daily or weekly. You choose what fits your schedule.',
  },
];

// No reviews yet — this is a brand new operation. Once real trips happen,
// replace this with actual renter testimonials.
const TESTIMONIALS: { name: string; role: string; rating: number; text: string; avatar: string }[] = [];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">

      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">

        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1800&h=1100&fit=crop"
            alt="Luxury car"
            className="w-full h-full object-cover scale-105"
          />
          {/* Centered dark overlay */}
          <div className="absolute inset-0 bg-charcoal-900/65" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-transparent to-charcoal-900/40" />
        </div>

        {/* Hero content — headline left, instant quote form right */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

            {/* Left — headline */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-gold-500/15 border border-gold-400/30 rounded-full px-4 py-1.5 mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
                <span className="text-gold-300 text-xs font-bold uppercase tracking-widest">Private & Gig-Driver Car Rental</span>
              </div>

              <h1 className="display-xl font-serif text-white mb-5 leading-tight">
                Every journey<br />
                <span className="text-gold-gradient">deserves a great car.</span>
              </h1>

              <p className="text-white/60 text-lg max-w-lg mb-8 leading-relaxed mx-auto lg:mx-0">
                Affordable, flexible rentals for everyday drivers and gig workers alike —
                weekly and monthly rates built for Uber, Lyft, DoorDash & more.
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-x-5 gap-y-2 mb-8">
                {[
                  { icon: '🛡️', text: 'Locally owned & operated' },
                  { icon: '✓', text: 'Full inspection before every rental' },
                  { icon: '⚡', text: 'Response within 24 hours' },
                ].map(({ icon, text }) => (
                  <span key={text} className="flex items-center gap-1.5 text-white/50 text-xs font-medium">
                    <span className="text-gold-400">{icon}</span> {text}
                  </span>
                ))}
              </div>

              <button
                onClick={() => navigate('/search')}
                className="hidden lg:inline-flex items-center gap-2 text-sm font-bold text-gold-400 hover:text-gold-300 transition-colors"
              >
                <Search className="w-4 h-4" /> Or browse the fleet first <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right — instant quote form */}
            <div className="w-full max-w-xl mx-auto" id="quote">
              <QuoteForm />
            </div>
          </div>
        </div>
      </section>


      {/* ════════════════════════════════════════
          STATS BAR
      ════════════════════════════════════════ */}
      <section className="bg-charcoal-900 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, label }, i) => (
              <div key={label} className={`text-center animate-fade-in delay-${(i + 1) * 100}`}>
                <div className="text-3xl font-extrabold text-gold-gradient font-serif mb-1">{value}</div>
                <div className="text-white/50 text-sm font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          WHO WE SERVE (gig drivers + everyday renters)
      ════════════════════════════════════════ */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="section-label">Who we serve</div>
              <h2 className="display-lg font-serif text-foreground mb-4">
                Built for drivers who<br /><span className="text-gold-gradient">drive to earn.</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Our cars work for everyday renters — and they work hard for professional
                drivers. If you earn on the road, our weekly and monthly rates keep more
                of that money in your pocket.
              </p>
              <ul className="space-y-3">
                {[
                  { bold: 'Rideshare drivers:', rest: ' Uber, Lyft' },
                  { bold: 'Delivery drivers:', rest: ' Uber Eats, DoorDash, Amazon Flex, Instacart, Roadie & more' },
                  { bold: 'Full-time gig workers', rest: ' who need a dependable car every day' },
                  { bold: 'Everyday renters', rest: ' — trips, errands, in-between cars' },
                ].map(({ bold, rest }) => (
                  <li key={bold} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
                    <span><strong>{bold}</strong>{rest}</span>
                  </li>
                ))}
              </ul>
              <a href="#quote" className="btn-gold mt-8 px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2 w-fit font-bold">
                Get your free quote <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Requirements card */}
            <div className="bg-charcoal-900 rounded-3xl p-8 md:p-10">
              <div className="section-label text-gold-400">Our rental model</div>
              <h3 className="text-white font-serif display-md mb-6">Who can rent<br />& what's required</h3>
              <div className="space-y-4">
                {[
                  { icon: <FileText className="w-5 h-5" />, title: 'Valid driver\'s license', desc: 'Required for every rental, no exceptions.' },
                  { icon: <Shield className="w-5 h-5" />, title: 'Gig drivers: 25 or older', desc: 'Gig-work rentals require drivers age 25+.' },
                  { icon: <Calendar className="w-5 h-5" />, title: 'Gig drivers: 1-week minimum', desc: 'Weekly commitment keeps rates low and cars available.' },
                  { icon: <Zap className="w-5 h-5" />, title: 'Proof of active gig work', desc: 'A screenshot of trips completed in the last 30 days (gig rentals only).' },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center text-charcoal-900 flex-shrink-0">
                      {icon}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{title}</p>
                      <p className="text-white/50 text-xs mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          BROWSE BY CATEGORY
      ════════════════════════════════════════ */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Heading */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
            <div>
              <div className="section-label">Browse by Type</div>
              <h2 className="display-lg font-serif text-foreground">
                What are you<br /><span className="text-gold-gradient">driving today?</span>
              </h2>
            </div>
            <button
              onClick={() => navigate('/search')}
              className="flex items-center gap-2 text-sm font-bold text-gold-600 dark:text-gold-400 hover:gap-3 transition-all duration-200"
            >
              View all cars <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Category tiles — row 1: 3 cols, row 2: 2 cols */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-5">
            {[
              {
                id: 'economy',
                label: 'Economy',
                tagline: 'Smart & affordable',
                img: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&h=600&fit=crop',
              },
              {
                id: 'suv',
                label: 'SUV',
                tagline: 'Space & capability',
                img: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&h=600&fit=crop',
              },
              {
                id: 'luxury',
                label: 'Luxury',
                tagline: 'Elevated comfort',
                img: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600&fit=crop',
              },
            ].map((cat, i) => (
              <button
                key={cat.id}
                onClick={() => navigate(`/search?category=${cat.id}`)}
                className="group relative rounded-3xl overflow-hidden aspect-[4/3] text-left animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <img
                  src={cat.img}
                  alt={cat.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/90 via-charcoal-900/30 to-transparent" />
                {/* Gold ring on hover */}
                <div className="absolute inset-0 ring-2 ring-gold-400/0 group-hover:ring-gold-400/70 rounded-3xl transition-all duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">{cat.tagline}</p>
                      <h3 className="text-white font-extrabold uppercase tracking-wide"
                        style={{ fontFamily: '"Barlow Condensed", system-ui, sans-serif', fontSize: '2rem', lineHeight: 1 }}>
                        {cat.label}
                      </h3>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-gold-gradient flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <ArrowRight className="w-4 h-4 text-charcoal-900" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              {
                id: 'electric',
                label: 'Electric',
                tagline: 'Zero emissions, full power',
                img: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=900&h=550&fit=crop',
              },
              {
                id: 'sports',
                label: 'Sports',
                tagline: 'Performance unleashed',
                img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&h=550&fit=crop',
              },
            ].map((cat, i) => (
              <button
                key={cat.id}
                onClick={() => navigate(`/search?category=${cat.id}`)}
                className="group relative rounded-3xl overflow-hidden aspect-[16/7] text-left animate-fade-in"
                style={{ animationDelay: `${(i + 3) * 100}ms` }}
              >
                <img
                  src={cat.img}
                  alt={cat.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/90 via-charcoal-900/20 to-transparent" />
                <div className="absolute inset-0 ring-2 ring-gold-400/0 group-hover:ring-gold-400/70 rounded-3xl transition-all duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-7">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">{cat.tagline}</p>
                      <h3 className="text-white font-extrabold uppercase tracking-wide"
                        style={{ fontFamily: '"Barlow Condensed", system-ui, sans-serif', fontSize: '2.4rem', lineHeight: 1 }}>
                        {cat.label}
                      </h3>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-gold-gradient flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <ArrowRight className="w-4 h-4 text-charcoal-900" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════
          POPULAR CITIES
      ════════════════════════════════════════ */}
      <section className="py-20 bg-sand dark:bg-charcoal-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="section-label justify-center">Florida Locations</div>
            <h2 className="display-lg font-serif text-foreground">
              Where in Florida?
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CITIES.map((city, i) => (
              <button
                key={city.name}
                onClick={() => navigate(`/search?location=${city.name}`)}
                className={`group relative rounded-2xl overflow-hidden aspect-[3/4] animate-fade-in delay-${Math.min(i * 100, 500)}`}
              >
                <img
                  src={city.img}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-charcoal-900/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white font-bold text-sm">{city.name}</p>
                </div>
                <div className="absolute inset-0 ring-2 ring-gold-400/0 group-hover:ring-gold-400/60 rounded-2xl transition-all duration-300" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          WHY DRIVESHARE
      ════════════════════════════════════════ */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left — image collage */}
            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Main image */}
                <div className="absolute inset-8 rounded-3xl overflow-hidden shadow-card-hover">
                  <img
                    src="https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&h=600&fit=crop"
                    alt="Luxury car interior"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Gold ring decoration */}
                <div className="absolute inset-0 rounded-3xl border-2 border-gold-300/40 dark:border-gold-700/30" />
                {/* Floating badge */}
                <div className="absolute -bottom-4 -right-4 glass-card-light dark:glass-card rounded-2xl p-4 shadow-gold-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gold-gradient rounded-xl flex items-center justify-center">
                      <Star className="w-4 h-4 text-charcoal-900" fill="currentColor" />
                    </div>
                    <div>
                      <p className="font-extrabold text-sm leading-none">New</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Be one of our first renters</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — features */}
            <div>
              <div className="section-label">Why us</div>
              <h2 className="display-lg font-serif text-foreground mb-4">
                The smarter way<br />
                <span className="text-gold-gradient">to rent a car.</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-10">
                Skip the long lines and hidden fees. Arvana Rentals connects you
                with premium vehicles and makes the entire experience effortless.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {WHY.map((item, i) => (
                  <div
                    key={item.title}
                    className={`group p-5 rounded-2xl border border-border bg-card hover:border-gold-400/50 hover:shadow-gold-sm transition-all duration-300 animate-fade-in delay-${i * 100}`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gold-50 dark:bg-gold-900/20 flex items-center justify-center text-gold-600 dark:text-gold-400 mb-3 group-hover:bg-gold-gradient group-hover:text-charcoal-900 transition-all duration-300">
                      {item.icon}
                    </div>
                    <h3 className="font-bold text-sm mb-1">{item.title}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/search')}
                className="btn-gold mt-8 px-6 py-3 rounded-xl text-sm flex items-center gap-2 w-fit"
              >
                Explore all cars <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════ */}
      <section className="py-24 bg-charcoal-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="section-label justify-center text-gold-400">Easy rental process</div>
            <h2 className="display-lg font-serif text-white">
              On the road in<br /><span className="text-gold-gradient">five easy steps.</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-px bg-gradient-to-r from-gold-400/30 via-gold-400/60 to-gold-400/30" />

            {[
              { step: '01', icon: <FileText className="w-6 h-6" />, title: 'Apply Online', desc: 'Quick form — gig drivers add proof of recent activity.' },
              { step: '02', icon: <Search className="w-6 h-6" />, title: 'Choose Your Car', desc: 'Reliable, fuel-efficient cars ready for work or play.' },
              { step: '03', icon: <KeyRound className="w-6 h-6" />, title: 'Pick Up Your Car', desc: 'Fast and easy handoff once approved.' },
              { step: '04', icon: <DollarSign className="w-6 h-6" />, title: 'Drive & Earn', desc: 'Flexible rental — renew weekly or monthly as needed.' },
              { step: '05', icon: <RotateCcw className="w-6 h-6" />, title: 'Return or Extend', desc: 'Seamless process, your choice every week.' },
            ].map((s, i) => (
              <div key={s.step} className={`text-center animate-fade-in delay-${Math.min(i * 100, 500)}`}>
                <div className="relative inline-flex">
                  <div className="w-20 h-20 rounded-2xl bg-charcoal-800 border border-charcoal-700 flex items-center justify-center text-gold-400 mb-5 mx-auto">
                    {s.icon}
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gold-gradient text-charcoal-900 text-xs font-extrabold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-bold text-white mb-2 text-sm">{s.title}</h3>
                <p className="text-white/50 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <a href="#quote" className="btn-gold px-8 py-3.5 rounded-xl text-sm font-bold inline-flex items-center gap-2">
              Get started <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TESTIMONIALS (empty until real trips happen)
      ════════════════════════════════════════ */}
      {TESTIMONIALS.length > 0 && (
        <section className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <div className="section-label justify-center">Reviews</div>
              <h2 className="display-lg font-serif text-foreground">
                Loved by drivers<br /><span className="text-gold-gradient">everywhere.</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={t.name}
                  className={`relative p-6 rounded-3xl bg-card border border-border hover:border-gold-300/50 hover:shadow-gold-sm transition-all duration-300 animate-fade-in delay-${i * 150}`}
                >
                  {/* Quote mark */}
                  <div className="text-5xl font-serif text-gold-200 dark:text-gold-900/60 leading-none mb-4">"</div>
                  <p className="text-foreground/80 text-sm leading-relaxed mb-6">{t.text}</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-border">
                    <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-gold-300/50" />
                    <div>
                      <p className="font-bold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="w-3.5 h-3.5 text-gold-400" fill="currentColor" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════
          FAQ
      ════════════════════════════════════════ */}
      <section className="py-24 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="section-label justify-center">FAQ</div>
            <h2 className="display-lg font-serif text-foreground">
              Frequently asked<br /><span className="text-gold-gradient">questions.</span>
            </h2>
          </div>
          <div className="space-y-3">
            {[
              {
                q: 'Who is eligible to rent?',
                a: "Anyone with a valid driver's license can request a rental. For gig-work rentals (Uber, Lyft, DoorDash, etc.), you must be 25 or older, commit to at least 1 week, and show proof of trips completed in the last 30 days.",
              },
              {
                q: 'What is the minimum rental period?',
                a: 'Everyday rentals can be as short as one day. Gig-work rentals require a minimum 1-week commitment — that\'s how we keep the weekly rates low.',
              },
              {
                q: 'What cars do you offer?',
                a: 'Reliable, fuel-efficient Toyotas — inspected before every rental and ready for gig apps or personal use. Weekly and monthly rates available on every car.',
              },
              {
                q: 'Is insurance included?',
                a: "You'll need your own auto insurance or a non-owner policy (most of our renters use Direct Auto — also check Bristol West, National General, or Acceptance Insurance). We'll walk you through it before pickup.",
              },
              {
                q: 'Is there a deposit?',
                a: 'A refundable security deposit is held on your card (never cash) and released automatically after the car comes back clean.',
              },
              {
                q: 'Where do you operate?',
                a: "We're a locally owned Florida operation. Submit a quote request and we'll confirm pickup details for your area.",
              },
            ].map(({ q, a }, i) => (
              <div key={q} className="border border-border rounded-2xl bg-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="font-bold text-sm">{q}</span>
                  <ChevronDown className={`w-4 h-4 text-gold-500 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          FINAL CTA BANNER
      ════════════════════════════════════════ */}
      <section className="py-24 bg-sand dark:bg-charcoal-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative rounded-3xl overflow-hidden bg-charcoal-900 p-12 md:p-16">
            {/* Gold corner glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1 bg-gold-gradient rounded-b-full opacity-80" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="section-label justify-center text-gold-400 mb-4">Ready to drive?</div>
              <h2 className="display-lg font-serif text-white mb-4">
                Book your car today and<br />
                <span className="text-gold-gradient">start earning with confidence.</span>
              </h2>
              <p className="text-white/50 text-lg max-w-md mx-auto mb-10">
                Gig drivers: 1-week minimum, 25+, active drivers only. Everyday renters always welcome.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="#quote"
                  className="btn-gold px-8 py-4 rounded-xl text-base font-bold inline-flex items-center justify-center gap-2"
                >
                  Get a free quote <ArrowRight className="w-5 h-5" />
                </a>
                <button
                  onClick={() => navigate('/search')}
                  className="px-8 py-4 rounded-xl text-base font-bold border border-white/20 text-white hover:bg-white/10 transition-colors inline-flex items-center justify-center"
                >
                  Browse cars
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
