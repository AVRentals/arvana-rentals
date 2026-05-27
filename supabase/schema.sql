-- DriveShare Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────
CREATE TABLE profiles (
  id                      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name               TEXT,
  avatar_url              TEXT,
  phone                   TEXT,
  bio                     TEXT,
  is_host                 BOOLEAN DEFAULT false,
  driver_license_verified BOOLEAN DEFAULT false,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, is_host, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    (NEW.raw_user_meta_data->>'is_host')::boolean,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────
-- CARS
-- ─────────────────────────────────────────
CREATE TABLE cars (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  make          TEXT NOT NULL,
  model         TEXT NOT NULL,
  year          INTEGER NOT NULL,
  color         TEXT NOT NULL,
  license_plate TEXT,
  description   TEXT NOT NULL,
  category      TEXT NOT NULL CHECK (category IN ('economy','suv','luxury','electric','sports')),
  daily_rate    NUMERIC(10,2) NOT NULL CHECK (daily_rate > 0),
  location      TEXT NOT NULL,
  city          TEXT NOT NULL,
  state         TEXT NOT NULL,
  seats         INTEGER NOT NULL DEFAULT 5,
  transmission  TEXT NOT NULL DEFAULT 'auto' CHECK (transmission IN ('auto','manual')),
  fuel_type     TEXT NOT NULL DEFAULT 'gasoline' CHECK (fuel_type IN ('gasoline','diesel','electric','hybrid')),
  features      TEXT[] DEFAULT '{}',
  images        TEXT[] DEFAULT '{}',
  is_available  BOOLEAN DEFAULT true,
  is_approved   BOOLEAN DEFAULT false,
  rating        NUMERIC(3,2) DEFAULT 0,
  total_trips   INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- BOOKINGS
-- ─────────────────────────────────────────
CREATE TABLE bookings (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  car_id                    UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  renter_id                 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  host_id                   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_date                DATE NOT NULL,
  end_date                  DATE NOT NULL,
  total_days                INTEGER NOT NULL,
  daily_rate                NUMERIC(10,2) NOT NULL,
  subtotal                  NUMERIC(10,2) NOT NULL,
  service_fee               NUMERIC(10,2) NOT NULL,
  total_amount              NUMERIC(10,2) NOT NULL,
  status                    TEXT NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending','confirmed','active','completed','cancelled')),
  pickup_location           TEXT NOT NULL,
  dropoff_location          TEXT,
  stripe_payment_intent_id  TEXT,
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (end_date > start_date)
);

-- ─────────────────────────────────────────
-- REVIEWS
-- ─────────────────────────────────────────
CREATE TABLE reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id  UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  car_id      UUID REFERENCES cars(id) ON DELETE SET NULL,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('car','host','renter')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(booking_id, reviewer_id, type)
);

-- Auto-update car rating when review is added/updated
CREATE OR REPLACE FUNCTION update_car_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE cars
  SET
    rating = (
      SELECT ROUND(AVG(rating)::NUMERIC, 2)
      FROM reviews
      WHERE car_id = NEW.car_id AND type = 'car'
    ),
    total_trips = (
      SELECT COUNT(DISTINCT booking_id)
      FROM reviews
      WHERE car_id = NEW.car_id AND type = 'car'
    )
  WHERE id = NEW.car_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_created
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_car_rating();

-- ─────────────────────────────────────────
-- MESSAGES
-- ─────────────────────────────────────────
CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id  UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  is_read     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, own write
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Cars: Public read for available/approved, host full access
CREATE POLICY "Anyone can view approved available cars"
  ON cars FOR SELECT USING (is_available = true AND is_approved = true);

CREATE POLICY "Hosts can view all their cars"
  ON cars FOR SELECT USING (auth.uid() = host_id);

CREATE POLICY "Hosts can insert their own cars"
  ON cars FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their own cars"
  ON cars FOR UPDATE USING (auth.uid() = host_id);

CREATE POLICY "Hosts can delete their own cars"
  ON cars FOR DELETE USING (auth.uid() = host_id);

-- Bookings: Renters and hosts can view/manage their bookings
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = renter_id OR auth.uid() = host_id);

CREATE POLICY "Authenticated users can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = renter_id);

CREATE POLICY "Hosts and renters can update booking status"
  ON bookings FOR UPDATE
  USING (auth.uid() = renter_id OR auth.uid() = host_id);

-- Reviews: Public read, own write
CREATE POLICY "Anyone can read reviews"
  ON reviews FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

-- Messages: Only participants can see them
CREATE POLICY "Participants can view their messages"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Authenticated users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Receivers can mark messages as read"
  ON messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- ─────────────────────────────────────────
-- INDEXES for performance
-- ─────────────────────────────────────────
CREATE INDEX idx_cars_host_id ON cars(host_id);
CREATE INDEX idx_cars_city ON cars(city);
CREATE INDEX idx_cars_category ON cars(category);
CREATE INDEX idx_cars_is_available ON cars(is_available);
CREATE INDEX idx_bookings_car_id ON bookings(car_id);
CREATE INDEX idx_bookings_renter_id ON bookings(renter_id);
CREATE INDEX idx_bookings_host_id ON bookings(host_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_reviews_car_id ON reviews(car_id);
CREATE INDEX idx_messages_booking_id ON messages(booking_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
