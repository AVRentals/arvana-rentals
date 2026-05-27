/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#0F0F1A',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        gold: {
          50:  '#FFFBF0',
          100: '#FEF3D0',
          200: '#FCE5A0',
          300: '#F9D060',
          400: '#F5BC35',
          500: '#C9A84C',
          600: '#A8832A',
          700: '#8A6820',
          800: '#6B5018',
          900: '#3D2E0D',
        },
        charcoal: {
          50:  '#F5F5F8',
          100: '#EAEAF0',
          200: '#D0D0DE',
          300: '#A8A8C0',
          400: '#78789A',
          500: '#555578',
          600: '#404060',
          700: '#2D2D4A',
          800: '#1A1A32',
          900: '#0F0F1A',
        },
        cream: '#FFFDF5',
        sand:  '#F5F0E8',
        // keep red for destructive/error states
        red: {
          DEFAULT: '#E94560',
          500: '#E94560',
          600: '#d63350',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans:  ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Barlow Condensed"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #F9D060 0%, #C9A84C 50%, #A8832A 100%)',
        'hero-dark':     'linear-gradient(to bottom, rgba(15,15,26,0.55) 0%, rgba(15,15,26,0.85) 100%)',
        'card-shine':    'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 60%)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: 0 },
        },
        fadeIn: {
          from: { opacity: 0, transform: 'translateY(16px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        fadeInLeft: {
          from: { opacity: 0, transform: 'translateX(-20px)' },
          to:   { opacity: 1, transform: 'translateX(0)' },
        },
        slideIn: {
          from: { transform: 'translateX(100%)' },
          to:   { transform: 'translateX(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        scaleIn: {
          from: { opacity: 0, transform: 'scale(0.95)' },
          to:   { opacity: 1, transform: 'scale(1)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        fadeIn:     'fadeIn 0.6s ease-out both',
        fadeInLeft: 'fadeInLeft 0.6s ease-out both',
        slideIn:    'slideIn 0.3s ease-out',
        shimmer:    'shimmer 2.5s linear infinite',
        float:      'float 4s ease-in-out infinite',
        scaleIn:    'scaleIn 0.4s ease-out both',
      },
      boxShadow: {
        'gold-sm': '0 2px 12px rgba(201,168,76,0.25)',
        'gold':    '0 4px 24px rgba(201,168,76,0.35)',
        'gold-lg': '0 8px 40px rgba(201,168,76,0.45)',
        'card':    '0 4px 24px rgba(15,15,26,0.08)',
        'card-hover': '0 12px 40px rgba(15,15,26,0.16)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
