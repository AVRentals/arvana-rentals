import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Calendar, Shield, Clock, Star,
  ArrowRight, Zap, CheckCircle2, ChevronRight,
} from 'lucide-react';
import Footer from '@/components/Footer';

const CITIES = [
  { name: 'Miami',           img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=280&fit=crop' },
  { name: 'Orlando',         img: 'https://images.unsplash.com/photo-1575089776834-8be34696ffb9?w=400&h=280&fit=crop' },
  { name: 'Tampa',           img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=280&fit=crop' },
  { name: 'Fort Lauderdale', img: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=400&h=280&fit=crop' },
  { name: 'Jacksonville',    img: 'https://images.unsplash.com/photo-1587502537104-aac10f5fb6f7?w=400&h=280&fit=crop' },
  { name: 'Key West',        img: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=400&h=280&fit=crop' },
];

const STATS = [
  { value: '2',    label: 'Cars in Our Fleet' },
  { value: '100%', label: 'Personally Inspected' },
  { value: '24/7', label: 'GPS Monitored' },
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
  const [location, setLocation]     = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    navigate(`/search?${params.toString()}`);
  };

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

        {/* Hero content — centered */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full flex flex-col items-center text-center">
          <div className="max-w-2xl w-full">

            {/* Label chip */}
            <div className="inline-flex items-center gap-2 bg-gold-500/15 border border-gold-400/30 rounded-full px-4 py-1.5 mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
              <span className="text-gold-300 text-xs font-bold uppercase tracking-widest">Premium Car Rental</span>
            </div>

            <h1 className="display-xl font-serif text-white mb-5 leading-tight">
              Every journey<br />
              <span className="text-gold-gradient">deserves a great car.</span>
            </h1>

            <p className="text-white/60 text-lg max-w-lg mb-10 leading-relaxed text-center mx-auto">
              Florida's premier private car rental. From Miami to Key West — book in minutes, drive in style.
            </p>

            {/* ── Search card ── */}
            <form onSubmit={handleSearch} className="w-full max-w-2xl">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-3">

                  {/* Location */}
                  <div className="flex flex-col gap-1">
                    <label className="text-white/50 text-xs font-semibold uppercase tracking-wider px-1">Location</label>
                    <div className="flex items-center gap-2.5 bg-white/15 hover:bg-white/20 border border-white/10 focus-within:border-gold-400/60 rounded-xl px-3.5 py-2.5 transition-all">
                      <MapPin className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
                      <input
                        type="text"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder="City or airport…"
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/35 font-medium text-white min-w-0"
                      />
                    </div>
                  </div>

                  {/* Pickup date */}
                  <div className="flex flex-col gap-1 sm:w-36">
                    <label className="text-white/50 text-xs font-semibold uppercase tracking-wider px-1">Pick-up</label>
                    <div className="bg-white/15 hover:bg-white/20 border border-white/10 focus-within:border-gold-400/60 rounded-xl px-3.5 py-2.5 transition-all">
                      <input
                        type="date"
                        value={pickupDate}
                        onChange={e => setPickupDate(e.target.value)}
                        className="w-full bg-transparent text-sm outline-none text-white/80 [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  {/* Return date */}
                  <div className="flex flex-col gap-1 sm:w-36">
                    <label className="text-white/50 text-xs font-semibold uppercase tracking-wider px-1">Return</label>
                    <div className="bg-white/15 hover:bg-white/20 border border-white/10 focus-within:border-gold-400/60 rounded-xl px-3.5 py-2.5 transition-all">
                      <input
                        type="date"
                        value={returnDate}
                        onChange={e => setReturnDate(e.target.value)}
                        className="w-full bg-transparent text-sm outline-none text-white/80 [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="flex flex-col gap-1 sm:w-auto">
                    <label className="text-transparent text-xs select-none hidden sm:block">&nbsp;</label>
                    <button type="submit" className="btn-gold rounded-xl px-5 py-2.5 flex items-center justify-center gap-2 font-bold text-sm whitespace-nowrap h-full">
                      <Search className="w-4 h-4" />
                      Search
                    </button>
                  </div>

                </div>

                {/* Trust badges row */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 pt-3 border-t border-white/10">
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
              </div>
            </form>

            {/* Quick city links */}
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-5">
              <span className="text-white/35 text-xs pt-0.5">Popular:</span>
              {['Miami', 'Orlando', 'Tampa', 'Key West'].map(city => (
                <button
                  key={city}
                  onClick={() => navigate(`/search?location=${city}`)}
                  className="text-xs text-white/55 hover:text-gold-400 transition-colors font-medium hover:underline underline-offset-2"
                >
                  {city}
                </button>
              ))}
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
            <div className="section-label justify-center text-gold-400">Simple process</div>
            <h2 className="display-lg font-serif text-white">
              On the road in<br /><span className="text-gold-gradient">three easy steps.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-px bg-gradient-to-r from-gold-400/30 via-gold-400/60 to-gold-400/30" />

            {[
              { step: '01', icon: <Search className="w-6 h-6" />, title: 'Choose Your Car', desc: 'Browse our fleet and pick your dates. No hidden fees, no surprises.' },
              { step: '02', icon: <Calendar className="w-6 h-6" />, title: 'Submit a Request', desc: "We verify your ID, send a rental agreement to sign, and confirm within 24 hours." },
              { step: '03', icon: <MapPin className="w-6 h-6" />, title: 'Pick Up & Drive', desc: 'Once approved and paid, get your pickup details and hit the road.' },
            ].map((s, i) => (
              <div key={s.step} className={`text-center animate-fade-in delay-${i * 200}`}>
                <div className="relative inline-flex">
                  <div className="w-20 h-20 rounded-2xl bg-charcoal-800 border border-charcoal-700 flex items-center justify-center text-gold-400 mb-5 mx-auto">
                    {s.icon}
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gold-gradient text-charcoal-900 text-xs font-extrabold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-bold text-white mb-2">{s.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/search')}
              className="btn-gold px-8 py-3.5 rounded-xl text-sm font-bold inline-flex items-center gap-2"
            >
              Get started <ChevronRight className="w-4 h-4" />
            </button>
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
              <div className="section-label justify-center text-gold-400 mb-4">Start now</div>
              <h2 className="display-lg font-serif text-white mb-4">
                Your next adventure<br />
                <span className="text-gold-gradient">starts here.</span>
              </h2>
              <p className="text-white/50 text-lg max-w-md mx-auto mb-10">
                Thousands of cars waiting. No memberships, no subscriptions. Just drive.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate('/search')}
                  className="btn-gold px-8 py-4 rounded-xl text-base font-bold inline-flex items-center justify-center gap-2"
                >
                  Browse Cars <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-8 py-4 rounded-xl text-base font-bold border border-white/20 text-white hover:bg-white/10 transition-colors inline-flex items-center justify-center"
                >
                  Create free account
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
