# DriveShare 🚗

**Your car. Their adventure.**

A full-stack peer-to-peer car rental marketplace built with React + TypeScript, Tailwind CSS, Supabase, and Stripe — inspired by Turo and Airbnb.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui + Radix UI |
| Auth & Database | Supabase (PostgreSQL) |
| Payments | Stripe |
| Charts | Recharts |
| Routing | React Router v6 |
| Forms | React Hook Form + Zod |
| Toasts | React Hot Toast |

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
```
Edit `.env` with your credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-key
```

### 3. Set up Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase/schema.sql`
3. Then run `supabase/seed.sql` to populate sample data
4. Enable **Google OAuth** in Authentication → Providers

### 4. Set up Stripe (optional for demo)
1. Create an account at [stripe.com](https://stripe.com)
2. Copy your publishable key to `.env`
3. For real payments, add a Stripe webhook endpoint

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Pages & Routes

| Route | Description |
|-------|-------------|
| `/` | Home page with hero, search, car grid |
| `/search` | Search results with filters + map |
| `/cars/:id` | Car detail with gallery & booking |
| `/book/:carId` | 3-step booking flow |
| `/bookings/:id` | Booking confirmation |
| `/login` | Login page |
| `/signup` | Sign up page |
| `/dashboard` | Renter dashboard |
| `/host/dashboard` | Host dashboard |
| `/host/list-car` | Multi-step car listing form |

---

## Features

### For Renters
- Browse & search 12+ cars across 5 categories
- Filter by price, category, seats, transmission, fuel type
- Save favorites to localStorage (❤️)
- 3-step booking with Stripe payment
- Booking confirmation with trip details
- Renter dashboard: trips, saved cars, messages, profile

### For Hosts
- Multi-step car listing wizard (6 steps)
- Host dashboard: overview, cars, bookings, earnings, messages
- Revenue chart with Recharts
- Accept/decline pending bookings
- In-app messaging with renters
- Earnings tracking & payout history

### Global
- Dark mode toggle (persisted in localStorage)
- Toast notifications for all actions
- Loading skeletons on data-fetching pages
- Responsive on mobile, tablet, desktop
- 404 page

---

## Project Structure

```
src/
├── components/
│   ├── ui/          # shadcn/ui components (Button, Card, etc.)
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── CarCard.tsx
│   └── LoadingSkeleton.tsx
├── context/
│   └── AuthContext.tsx
├── data/
│   └── sampleData.ts  # Sample cars, hosts, reviews
├── lib/
│   ├── supabase.ts    # Supabase client & helpers
│   └── utils.ts       # Utility functions
├── pages/
│   ├── Home.tsx
│   ├── Search.tsx
│   ├── CarDetail.tsx
│   ├── Book.tsx
│   ├── BookingConfirmation.tsx
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── Dashboard.tsx
│   ├── HostDashboard.tsx
│   ├── ListCar.tsx
│   └── NotFound.tsx
├── types/
│   └── index.ts       # TypeScript interfaces
├── App.tsx
└── main.tsx
supabase/
├── schema.sql         # Full database schema with RLS
└── seed.sql           # 12 cars, 3 hosts, 5 bookings, 10 reviews
```

---

## Connecting to Supabase

The app works with **sample data** from `src/data/sampleData.ts` without any backend. To connect to Supabase:

1. Add your credentials to `.env`
2. Update the data fetching in each page to use `supabase` client instead of sample data
3. The helper functions in `src/lib/supabase.ts` are ready to use

---

## Design System

| Color | Hex | Usage |
|-------|-----|-------|
| Deep Navy | `#1A1A2E` | Primary, backgrounds |
| Vivid Red | `#E94560` | Accent, CTAs, badges |
| Amber | `#F5A623` | Secondary CTAs, stars |
| Font | Plus Jakarta Sans | All text |

---

## Building for Production

```bash
npm run build
```

Deploy to Vercel, Netlify, or any static host. Set environment variables in your deployment dashboard.

---

## License

MIT — built with ❤️ by DriveShare
