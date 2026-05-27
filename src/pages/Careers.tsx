import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, Clock, ArrowRight, ChevronDown } from 'lucide-react';
import Footer from '@/components/Footer';

const OPENINGS = [
  { title: 'Senior Product Designer', dept: 'Design', location: 'Miami, FL', type: 'Full-time', remote: true },
  { title: 'Backend Engineer (Node.js)', dept: 'Engineering', location: 'Miami, FL', type: 'Full-time', remote: true },
  { title: 'Growth Marketing Manager', dept: 'Marketing', location: 'Orlando, FL', type: 'Full-time', remote: false },
  { title: 'Customer Experience Lead', dept: 'Operations', location: 'Remote', type: 'Full-time', remote: true },
  { title: 'Data Analyst', dept: 'Analytics', location: 'Miami, FL', type: 'Full-time', remote: true },
  { title: 'Trust & Safety Specialist', dept: 'Operations', location: 'Tampa, FL', type: 'Full-time', remote: false },
];

const PERKS = [
  { emoji: '🏥', title: 'Full Health Coverage', desc: 'Medical, dental, and vision for you and your family — 100% covered.' },
  { emoji: '🏖️', title: 'Unlimited PTO', desc: 'Take the time you need. We trust you to manage your schedule.' },
  { emoji: '💻', title: 'Remote-Friendly', desc: 'Most roles are fully remote. Work where you do your best thinking.' },
  { emoji: '📈', title: 'Equity', desc: 'Every full-time employee gets meaningful equity in Arvana Rentals.' },
  { emoji: '🚗', title: 'Free Rentals', desc: 'Monthly Arvana Rentals credits so you can experience the product firsthand.' },
  { emoji: '📚', title: 'Learning Budget', desc: '$2,000/year for courses, books, conferences, and professional growth.' },
];

const depts = ['All', ...Array.from(new Set(OPENINGS.map(j => j.dept)))];

const Careers: React.FC = () => {
  const navigate = useNavigate();
  const [activeDept, setActiveDept] = useState('All');

  const filtered = activeDept === 'All' ? OPENINGS : OPENINGS.filter(j => j.dept === activeDept);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative pt-32 pb-24 bg-charcoal-900 overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&h=600&fit=crop" alt="Team" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal-900/60 to-charcoal-900" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="section-label justify-center text-gold-400 mb-4">Join Our Team</div>
          <h1 className="display-xl font-serif text-white mb-6">
            Help us redefine<br />
            <span className="text-gold-gradient">how Florida moves.</span>
          </h1>
          <p className="text-white/60 text-xl max-w-2xl mx-auto leading-relaxed">
            We're a Florida-based team of builders, designers, and dreamers on a mission to make premium private car rentals the best experience in the Sunshine State.
          </p>
          <a href="#openings" className="inline-flex items-center gap-2 btn-gold px-8 py-3.5 rounded-xl font-bold mt-8">
            See Open Roles <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-sand dark:bg-charcoal-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '40+', label: 'Team Members' },
              { value: '20+', label: 'Florida Cities' },
              { value: '4.9★', label: 'Glassdoor Rating' },
              { value: '2021', label: 'Founded' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-3xl font-extrabold text-gold-gradient font-serif mb-1">{value}</div>
                <div className="text-muted-foreground text-sm font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="section-label justify-center">Why Arvana Rentals</div>
            <h2 className="display-lg font-serif text-foreground">Perks & Benefits</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PERKS.map(({ emoji, title, desc }) => (
              <div key={title} className="p-6 bg-card rounded-3xl border border-border hover:border-gold-300/50 hover:shadow-gold-sm transition-all duration-300">
                <div className="text-3xl mb-4">{emoji}</div>
                <h3 className="font-bold text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open roles */}
      <section id="openings" className="py-24 bg-sand dark:bg-charcoal-900/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="section-label justify-center">We're Hiring</div>
            <h2 className="display-lg font-serif text-foreground">Open Positions</h2>
          </div>

          {/* Dept filter */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {depts.map(d => (
              <button
                key={d}
                onClick={() => setActiveDept(d)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeDept === d
                    ? 'bg-gold-gradient text-charcoal-900 shadow-gold-sm'
                    : 'bg-card border border-border text-muted-foreground hover:border-gold-400 hover:text-foreground'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.map(({ title, dept, location, type, remote }) => (
              <div key={title} className="p-5 bg-card rounded-2xl border border-border hover:border-gold-300/50 hover:shadow-gold-sm transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group cursor-pointer"
                onClick={() => {}}>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-foreground">{title}</h3>
                    {remote && (
                      <span className="text-xs px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full font-semibold border border-emerald-200/50 dark:border-emerald-800/50">Remote OK</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{dept}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{location}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{type}</span>
                  </div>
                </div>
                <button className="flex items-center gap-2 text-sm font-bold text-gold-600 dark:text-gold-400 group-hover:gap-3 transition-all flex-shrink-0">
                  Apply <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <p className="text-center text-muted-foreground text-sm mt-8">
            Don't see the right role?{' '}
            <button onClick={() => navigate('/contact')} className="text-gold-600 dark:text-gold-400 font-semibold hover:underline">
              Send us your resume anyway →
            </button>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Careers;
