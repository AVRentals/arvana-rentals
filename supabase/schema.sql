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
  email                   TEXT,
  avatar_url              TEXT,
  phone                   TEXT,
  bio                     TEXT,
  is_host                 BOOLEAN DEFAULT false,
  driver_license_verified BOOLEAN DEFAULT false,
  role                    TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner','staff')),
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, is_host, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
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
  vin           TEXT,
  description   TEXT NOT NULL,
  category      TEXT NOT NULL CHECK (category IN ('economy','suv','luxury','electric','sports')),
  daily_rate    NUMERIC(10,2) NOT NULL CHECK (daily_rate > 0),
  weekly_rate   NUMERIC(10,2),
  monthly_rate  NUMERIC(10,2),
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
  odometer      INTEGER,
  gps_provider  TEXT,
  purchase_price NUMERIC(10,2),
  purchase_date  DATE,
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
  deposit_amount            NUMERIC(10,2),
  deposit_stripe_intent_id  TEXT,
  deposit_status            TEXT DEFAULT 'none'
                              CHECK (deposit_status IN ('none','held','captured','released','forfeited')),
  identity_verification_status TEXT DEFAULT 'not_started'
                              CHECK (identity_verification_status IN ('not_started','pending','verified','failed')),
  stripe_identity_session_id TEXT,
  renter_has_insurance      BOOLEAN,
  renter_insurance_company  TEXT,
  renter_insurance_policy_number TEXT,
  order_stage               TEXT NOT NULL DEFAULT 'reserved'
                              CHECK (order_stage IN ('reserved','picked_up','returned')),
  coupon_code               TEXT,
  discount_amount           NUMERIC(10,2) DEFAULT 0,
  refund_amount             NUMERIC(10,2),
  refund_status             TEXT DEFAULT 'none'
                              CHECK (refund_status IN ('none','requested','issued')),
  refunded_at               TIMESTAMPTZ,
  balance_due               NUMERIC(10,2),
  custom_field_responses    JSONB DEFAULT '{}',
  is_gig_worker             BOOLEAN DEFAULT false,
  gig_platform              TEXT,
  date_of_birth             DATE,
  license_photo_path        TEXT,
  gig_screenshot_path       TEXT,
  insurance_doc_path        TEXT,
  wants_provided_insurance  BOOLEAN DEFAULT false,
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (end_date > start_date)
);

-- ─────────────────────────────────────────
-- AGREEMENTS (e-signed rental contracts)
-- ─────────────────────────────────────────
CREATE TABLE agreements (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id      UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  signer_name     TEXT NOT NULL,
  signer_email    TEXT,
  contract_version TEXT NOT NULL DEFAULT 'v1',
  contract_text   TEXT NOT NULL,
  signed_at       TIMESTAMPTZ DEFAULT NOW(),
  ip_address      TEXT,
  user_agent      TEXT
);

ALTER TABLE agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Renters and hosts can view agreements on their bookings"
  ON agreements FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM bookings
    WHERE bookings.id = agreements.booking_id
    AND (bookings.renter_id = auth.uid() OR bookings.host_id = auth.uid())
  ));

CREATE POLICY "Renters can sign their own booking's agreement"
  ON agreements FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM bookings
    WHERE bookings.id = agreements.booking_id
    AND bookings.renter_id = auth.uid()
  ));

CREATE INDEX idx_agreements_booking_id ON agreements(booking_id);

-- ─────────────────────────────────────────
-- MAINTENANCE
-- ─────────────────────────────────────────
CREATE TABLE maintenance (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  car_id          UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  service_type    TEXT NOT NULL,
  date_done       DATE,
  mileage         INTEGER,
  cost            NUMERIC(10,2),
  shop            TEXT,
  next_due_date   DATE,
  next_due_miles  INTEGER,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hosts can manage maintenance on their own cars"
  ON maintenance FOR ALL
  USING (EXISTS (SELECT 1 FROM cars WHERE cars.id = maintenance.car_id AND cars.host_id = auth.uid()));

CREATE INDEX idx_maintenance_car_id ON maintenance(car_id);

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
-- COUPONS
-- ─────────────────────────────────────────
CREATE TABLE coupons (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  code          TEXT NOT NULL,
  discount_type TEXT NOT NULL DEFAULT 'percent' CHECK (discount_type IN ('percent','fixed')),
  discount_value NUMERIC(10,2) NOT NULL,
  max_uses      INTEGER,
  times_used    INTEGER NOT NULL DEFAULT 0,
  expires_at    DATE,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(host_id, code)
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hosts can manage their own coupons"
  ON coupons FOR ALL USING (auth.uid() = host_id);

CREATE POLICY "Anyone can look up an active coupon by code"
  ON coupons FOR SELECT USING (is_active = true);

CREATE INDEX idx_coupons_host_id ON coupons(host_id);
CREATE INDEX idx_coupons_code ON coupons(code);

-- ─────────────────────────────────────────
-- MESSAGE TEMPLATES (automated messaging)
-- ─────────────────────────────────────────
CREATE TABLE message_templates (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL CHECK (event_type IN (
                'booking_confirmed','pickup_reminder','return_reminder','booking_requested'
              )),
  channel     TEXT NOT NULL DEFAULT 'email' CHECK (channel IN ('email','sms')),
  subject     TEXT,
  body        TEXT NOT NULL,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(host_id, event_type, channel)
);

ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hosts can manage their own message templates"
  ON message_templates FOR ALL USING (auth.uid() = host_id);

CREATE INDEX idx_message_templates_host_id ON message_templates(host_id);

-- ─────────────────────────────────────────
-- CUSTOMER NOTES (lightweight CRM)
-- ─────────────────────────────────────────
CREATE TABLE customer_notes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  renter_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  note        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(host_id, renter_id)
);

ALTER TABLE customer_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hosts can manage their own customer notes"
  ON customer_notes FOR ALL USING (auth.uid() = host_id);

CREATE INDEX idx_customer_notes_host_id ON customer_notes(host_id);
CREATE INDEX idx_customer_notes_renter_id ON customer_notes(renter_id);

-- ─────────────────────────────────────────
-- CUSTOM CHECKOUT FIELDS
-- ─────────────────────────────────────────
CREATE TABLE custom_checkout_fields (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  host_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  field_type  TEXT NOT NULL DEFAULT 'text' CHECK (field_type IN ('text','select','checkbox')),
  options     TEXT[] DEFAULT '{}',
  is_required BOOLEAN DEFAULT false,
  is_active   BOOLEAN DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE custom_checkout_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hosts can manage their own checkout fields"
  ON custom_checkout_fields FOR ALL USING (auth.uid() = host_id);

CREATE POLICY "Anyone can view active checkout fields"
  ON custom_checkout_fields FOR SELECT USING (is_active = true);

CREATE INDEX idx_checkout_fields_host_id ON custom_checkout_fields(host_id);

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
-- QUOTE REQUESTS (homepage instant-quote lead form — no login required)
-- ─────────────────────────────────────────
CREATE TABLE quote_requests (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name           TEXT NOT NULL,
  phone               TEXT NOT NULL,
  email               TEXT NOT NULL,
  pickup_date         DATE,
  pickup_time         TEXT,
  return_date         DATE,
  is_gig_worker       BOOLEAN,
  gig_screenshot_path TEXT,
  license_photo_path  TEXT,
  status              TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','closed')),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Anyone (even not logged in) can submit a quote request from the homepage
CREATE POLICY "Anyone can submit a quote request"
  ON quote_requests FOR INSERT
  WITH CHECK (true);

-- Only logged-in hosts can read/manage leads
CREATE POLICY "Hosts can view quote requests"
  ON quote_requests FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_host = true));

CREATE POLICY "Hosts can update quote requests"
  ON quote_requests FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_host = true));

CREATE INDEX idx_quote_requests_status ON quote_requests(status);

-- Storage bucket for quote-form uploads (anonymous visitors)
insert into storage.buckets (id, name, public)
values ('quote-docs', 'quote-docs', false)
on conflict (id) do nothing;

create policy "Anyone can upload quote docs"
  on storage.objects for insert
  with check (bucket_id = 'quote-docs');

create policy "Hosts can view quote docs"
  on storage.objects for select
  using (
    bucket_id = 'quote-docs' and exists (
      select 1 from profiles where profiles.id = auth.uid() and profiles.is_host = true
    )
  );

-- ─────────────────────────────────────────
-- STORAGE: verification-docs (gig-worker license photo + trip screenshot)
-- ─────────────────────────────────────────
-- Private bucket — files are only readable by the renter who uploaded them
-- and the host of the booking they belong to, never public.
-- Path convention: {renter_auth_uid}/{timestamp}-license.jpg or -gigscreenshot.jpg
insert into storage.buckets (id, name, public)
values ('verification-docs', 'verification-docs', false)
on conflict (id) do nothing;

create policy "Renters can upload their own verification docs"
  on storage.objects for insert
  with check (bucket_id = 'verification-docs' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Renters can view their own verification docs"
  on storage.objects for select
  using (bucket_id = 'verification-docs' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Hosts can view verification docs for their bookings"
  on storage.objects for select
  using (
    bucket_id = 'verification-docs' and exists (
      select 1 from bookings
      where bookings.renter_id::text = (storage.foldername(name))[1]
      and bookings.host_id = auth.uid()
    )
  );

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
