import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, ArrowRight } from 'lucide-react';
import Footer from '@/components/Footer';
import toast from 'react-hot-toast';

const FAQS = [
  { q: 'How do I cancel a booking?', a: 'You can cancel a booking from your Dashboard under My Trips. Free cancellation is available up to 24 hours before pickup.' },
  { q: 'Is insurance included?', a: 'Every trip includes $1M liability coverage automatically. You can add additional protection during checkout.' },
  { q: 'What if I have an issue during my trip?', a: 'Our 24/7 roadside assistance team is just a call away. You\'ll find the support number in your trip confirmation.' },
  { q: 'How do I know a car is safe?', a: 'Every vehicle passes a 150-point inspection before being listed. We verify ownership, registration, and service history.' },
];

const Contact: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success('Message sent! We\'ll get back to you within 24 hours.');
      setForm({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="pt-32 pb-20 bg-charcoal-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="section-label justify-center text-gold-400 mb-4">Get in Touch</div>
          <h1 className="display-xl font-serif text-white mb-4">
            We're here to <span className="text-gold-gradient">help.</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Have a question, issue, or just want to say hello? Our team typically responds within a few hours.
          </p>
        </div>
      </section>

      {/* Contact cards */}
      <section className="py-16 bg-sand dark:bg-charcoal-900/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: <Mail className="w-6 h-6" />, title: 'Email Us', value: 'info@arvanarentals.com', sub: 'Response within 24 hrs' },
              { icon: <Phone className="w-6 h-6" />, title: 'Call Us', value: '+1 (800) 555-0199', sub: 'Mon–Fri, 8am – 8pm ET' },
              { icon: <MessageCircle className="w-6 h-6" />, title: 'Live Chat', value: 'Chat in the app', sub: 'Available 24/7' },
            ].map(({ icon, title, value, sub }) => (
              <div key={title} className="p-6 bg-card rounded-3xl border border-border hover:border-gold-300/50 hover:shadow-gold-sm transition-all duration-300 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gold-50 dark:bg-gold-900/20 flex items-center justify-center text-gold-600 dark:text-gold-400 mx-auto mb-4">
                  {icon}
                </div>
                <h3 className="font-bold text-foreground mb-1">{title}</h3>
                <p className="font-semibold text-foreground text-sm mb-1">{value}</p>
                <p className="text-muted-foreground text-xs">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form + FAQ */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

            {/* Contact form */}
            <div>
              <div className="section-label mb-3">Send a Message</div>
              <h2 className="display-lg font-serif text-foreground mb-8">
                Tell us what's <span className="text-gold-gradient">on your mind.</span>
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Full name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="Alex Johnson"
                      required
                      className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-300 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Email address</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      required
                      className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-300 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Subject</label>
                  <select
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    required
                    className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-300 transition-all"
                  >
                    <option value="">Select a topic…</option>
                    <option>Booking Issue</option>
                    <option>Payment Question</option>
                    <option>Vehicle Condition</option>
                    <option>Account Help</option>
                    <option>General Inquiry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Message</label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    placeholder="Describe your issue or question in detail…"
                    required
                    rows={5}
                    className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-300 transition-all resize-none"
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-gold px-8 py-3.5 rounded-xl font-bold flex items-center gap-2">
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-charcoal-900/30 border-t-charcoal-900 rounded-full animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <><Send className="w-4 h-4" /> Send Message</>
                  )}
                </button>
              </form>
            </div>

            {/* FAQ */}
            <div>
              <div className="section-label mb-3">FAQs</div>
              <h2 className="display-lg font-serif text-foreground mb-8">
                Quick <span className="text-gold-gradient">answers.</span>
              </h2>
              <div className="space-y-4">
                {FAQS.map(({ q, a }) => (
                  <div key={q} className="p-5 bg-card rounded-2xl border border-border hover:border-gold-300/40 transition-colors">
                    <h3 className="font-bold text-foreground text-sm mb-2">{q}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>

              {/* Office */}
              <div className="mt-8 p-5 bg-card rounded-2xl border border-border">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold-50 dark:bg-gold-900/20 flex items-center justify-center text-gold-600 dark:text-gold-400 flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm mb-1">Our Headquarters</h3>
                    <p className="text-muted-foreground text-sm">1200 Brickell Avenue, Suite 500<br />Miami, FL 33131</p>
                    <div className="flex items-center gap-1.5 mt-2 text-muted-foreground text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      Mon–Fri, 9am – 6pm ET
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
