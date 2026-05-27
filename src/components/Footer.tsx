import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube } from 'lucide-react';

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
  </svg>
);

const LINKS = [
  {
    title: 'Explore',
    links: [
      { label: 'Browse All Cars',     to: '/search' },
      { label: 'Economy Cars',        to: '/search?category=economy' },
      { label: 'Luxury Cars',         to: '/search?category=luxury' },
      { label: 'Electric Vehicles',   to: '/search?category=electric' },
      { label: 'Sports Cars',         to: '/search?category=sports' },
      { label: 'SUVs',                to: '/search?category=suv' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign Up',             to: '/signup' },
      { label: 'Log In',              to: '/login' },
      { label: 'My Trips',            to: '/dashboard?tab=trips' },
      { label: 'Saved Cars',          to: '/dashboard?tab=saved' },
      { label: 'Profile Settings',    to: '/dashboard?tab=profile' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us',            to: '/about' },
      { label: 'Careers',             to: '/careers' },
      { label: 'Blog',                to: '/blog' },
      { label: 'Press',               to: '/contact' },
      { label: 'Contact',             to: '/contact' },
    ],
  },
];

const SOCIALS = [
  { Icon: XIcon,     href: '#', label: 'X' },
  { Icon: Instagram, href: '#', label: 'Instagram' },
  { Icon: Facebook,  href: '#', label: 'Facebook' },
  { Icon: Youtube,   href: '#', label: 'YouTube' },
];

const Footer: React.FC = () => (
  <footer className="bg-charcoal-900 text-white">

    {/* Top gold accent line */}
    <div className="h-px bg-gold-gradient opacity-40" />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">

      {/* Main grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-12 border-b border-white/8">

        {/* Brand column */}
        <div className="lg:col-span-2">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-5 group">
            <span className="text-gold-gradient" style={{ fontFamily: '"Barlow Condensed", system-ui, sans-serif', fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.04em', lineHeight: 1 }}>AR</span>
            <span className="font-extrabold tracking-widest uppercase"
              style={{ fontFamily: '"Barlow Condensed", system-ui, sans-serif', fontSize: '1.35rem' }}>
              Arvana<span className="text-gold-400"> Rentals</span>
            </span>
          </Link>

          <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-xs">
            Florida's premier private car rental. Discover thousands of verified vehicles
            across the Sunshine State — book in minutes, drive in style.
          </p>

          {/* Social icons */}
          <div className="flex gap-3">
            {SOCIALS.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-9 h-9 rounded-xl bg-white/6 hover:bg-gold-500/20 border border-white/8 hover:border-gold-500/40 flex items-center justify-center text-white/50 hover:text-gold-400 transition-all duration-200"
              >
                <Icon className="w-3.5 h-3.5" />
              </a>
            ))}
          </div>

          {/* Trust badge */}
          <div className="mt-8 inline-flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-3 py-2">
            <span className="text-gold-400 text-sm">★★★★★</span>
            <span className="text-white/50 text-xs">Rated 4.9 by 50K+ Florida renters</span>
          </div>
        </div>

        {/* Link columns */}
        {LINKS.map(({ title, links }) => (
          <div key={title}>
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-gold-500/80 mb-5">
              {title}
            </h4>
            <ul className="space-y-3">
              {links.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-white/45 hover:text-gold-400 transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-white/30 text-xs">
          © {new Date().getFullYear()} Arvana Rentals, Inc. All rights reserved.
        </p>
        <div className="flex flex-wrap justify-center gap-5">
            {[
            { label: 'Privacy Policy', to: '/privacy' },
            { label: 'Terms of Service', to: '/terms' },
            { label: 'Cookie Policy', to: '/privacy' },
            { label: 'Accessibility', to: '/contact' },
          ].map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
