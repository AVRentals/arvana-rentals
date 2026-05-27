import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Star, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import Footer from '@/components/Footer';

const TEAM = [
  { name: 'Marcus Rivera', role: 'CEO & Co-Founder', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face' },
  { name: 'Sophia Chen', role: 'CTO & Co-Founder', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face' },
  { name: 'James Okafor', role: 'Head of Operations', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face' },
  { name: 'Elena Torres', role: 'Head of Design', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face' },
];

const VALUES = [
  { icon: <Shield className="w-6 h-6" />, title: 'Safety First', desc: 'Every vehicle and driver is thoroughly verified. We never compromise on safety.' },
  { icon: <Star className="w-6 h-6" />, title: 'Premium Quality', desc: 'We curate only the best cars so every rental feels like a premium experience.' },
  { icon: <Users className="w-6 h-6" />, title: 'Community Driven', desc: 'Built on trust between renters and a community of passionate car owners.' },
  { icon: <MapPin className="w-6 h-6" />, title: 'Florida Focused', desc: 'Built for the Sunshine State — from Miami to Jacksonville, we know Florida\'s roads.' },
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
            Arvana Rentals was founded in Miami with a simple mission: make premium private car rentals accessible to everyone across the Sunshine State.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-sand dark:bg-charcoal-900/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '2021', label: 'Founded in Miami' },
              { value: '2,500+', label: 'Verified Cars' },
              { value: '50K+', label: 'Happy Renters' },
              { value: '20+', label: 'Florida Cities' },
            ].map(({ value, label }) => (
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
                Redefining how Florida<br />
                <span className="text-gold-gradient">moves.</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                We started Arvana Rentals because we were frustrated with the traditional car rental experience — hidden fees, long queues, and boring fleets. Florida deserved something better.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Today, Arvana Rentals connects renters with thousands of unique, verified vehicles across Florida. Whether you need a practical daily driver in Orlando or a dream car for a Miami weekend, we've got you covered.
              </p>
              <div className="space-y-3">
                {['No hidden fees, ever', '150-point vehicle inspection', '24/7 roadside assistance', '$1M insurance on every trip'].map(item => (
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

      {/* Team */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="section-label justify-center">The People</div>
            <h2 className="display-lg font-serif text-foreground">Meet the team</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TEAM.map((member, i) => (
              <div key={member.name} className={`text-center animate-fade-in delay-${i * 100}`}>
                <div className="relative mx-auto w-28 h-28 rounded-2xl overflow-hidden mb-4 ring-2 ring-gold-200/50 dark:ring-gold-800/30">
                  <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-bold text-foreground text-sm">{member.name}</h3>
                <p className="text-muted-foreground text-xs mt-0.5">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-charcoal-900">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="display-lg font-serif text-white mb-4">
            Ready to <span className="text-gold-gradient">drive?</span>
          </h2>
          <p className="text-white/50 mb-8">Join thousands of happy renters across Florida.</p>
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
