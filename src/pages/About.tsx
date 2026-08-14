import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Star, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import Footer from '@/components/Footer';
import { ABOUT_STATS, HOME_CITY, SERVICE_AREA } from '@/data/companyStats';

const VALUES = [
  { icon: <Shield className="w-6 h-6" />, title: 'Every Renter Vetted', desc: 'We verify a valid license, insurance, and gig-work history before any keys change hands. No anonymous bookings.' },
  { icon: <Star className="w-6 h-6" />, title: 'Cars We Actually Maintain', desc: 'Every car in the fleet is inspected and serviced on schedule by us — not left to a third party.' },
  { icon: <Users className="w-6 h-6" />, title: 'You Deal With The Owner', desc: 'No call center, no ticket queue. You text the person who owns the car and get a real answer.' },
  { icon: <MapPin className="w-6 h-6" />, title: 'Built For Florida Drivers', desc: `Based in ${HOME_CITY} and built around how people actually earn here — rideshare, delivery, and everyday driving.` },
];

const About: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative pt-32 pb-24 bg-charcoal-900 overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1600&h=700&fit=crop" alt="About Arvana Rentals" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal-900/60 to-charcoal-900" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="section-label justify-center text-gold-400 mb-4">Our Story</div>
          <h1 className="display-xl font-serif text-white mb-6">
            We believe every journey<br />
            <span className="text-gold-gradient">deserves a great car.</span>
          </h1>
          <p className="text-white/60 text-xl max-w-2xl mx-auto leading-relaxed">
            Arvana Rentals is a locally owned rental company in {HOME_CITY}, built for gig drivers and everyday renters who want a straight deal from a real person.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-sand dark:bg-charcoal-900/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {ABOUT_STATS.map(({ value, label }) => (
              <div key={label}>
                <div className="text-3xl font-extrabold text-gold-gradient font-serif mb-1">{value}</div>
                <div className="text-muted-foreground text-sm font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="section-label">Our Mission</div>
              <h2 className="display-lg font-serif text-foreground mb-6">
                A rental you can<br />
                <span className="text-gold-gradient">actually trust.</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                We started Arvana Rentals because renting a car for work shouldn't mean surprise fees, a two-hour counter line, or an app that treats you like a number. Drivers here deserve better than that.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                So we keep it simple: a small, hand-picked fleet we maintain ourselves, weekly and monthly rates that make sense for people earning behind the wheel, and one person you can call when something comes up.
              </p>
              <div className="space-y-3">
                {['No hidden fees, ever', 'Every car inspected before it goes out', 'Weekly & monthly rates for gig drivers', 'Insurance options available if you need coverage'].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-gold-500 flex-shrink-0" />
                    <span className="text-foreground font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative rounded-3xl overflow-hidden aspect-square max-w-lg mx-auto lg:mx-0">
              <img
                src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=700&h=700&fit=crop"
                alt="Premium car"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 ring-2 ring-gold-300/30 rounded-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-sand dark:bg-charcoal-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="section-label justify-center">What We Stand For</div>
            <h2 className="display-lg font-serif text-foreground">Our values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v, i) => (
              <div key={v.title} className={`p-6 rounded-3xl bg-card border border-border hover:border-gold-300/50 hover:shadow-gold-sm transition-all duration-300 animate-fade-in delay-${i * 100}`}>
                <div className="w-12 h-12 rounded-2xl bg-gold-50 dark:bg-gold-900/20 flex items-center justify-center text-gold-600 dark:text-gold-400 mb-4">
                  {v.icon}
                </div>
                <h3 className="font-bold text-foreground mb-2">{v.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who you're renting from */}
      <section className="py-24 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="section-label justify-center">The People</div>
          <h2 className="display-lg font-serif text-foreground mb-6">
            You're renting from<br />
            <span className="text-gold-gradient">an owner, not an app.</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-4">
            Arvana Rentals is owner-operated out of {HOME_CITY}. The same person who
            screens your application hands you the keys, answers your texts, and
            keeps the cars serviced.
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed">
            That's on purpose. A small fleet means every renter gets looked after
            personally, and every car gets attention a 500-car lot could never give it.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-charcoal-900">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="display-lg font-serif text-white mb-4">
            Ready to <span className="text-gold-gradient">drive?</span>
          </h2>
          <p className="text-white/50 mb-8">Serving {SERVICE_AREA}. Apply online — we'll get right back to you.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('/search')} className="btn-gold px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2">
              Browse Cars <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/contact')} className="px-8 py-3.5 rounded-xl font-bold border border-white/20 text-white hover:bg-white/10 transition-colors">
              Get in Touch
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
