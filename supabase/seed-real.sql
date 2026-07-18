-- Arvana Rentals — REAL fleet seed (replaces the old fake seed.sql)
-- Run this AFTER schema.sql, and AFTER you've created your own login.
--
-- STEP 1: In the Supabase dashboard, go to Authentication > Users > Add User.
--   Create yourself an account (your real email + a password you'll remember).
--   Supabase will assign it a UUID — copy that UUID.
--
-- STEP 2: Replace every occurrence of  'YOUR-HOST-UUID-HERE'  below with that UUID.
--
-- STEP 3: Run this whole file in the SQL Editor.

-- Mark your own profile as the host (the profiles row is auto-created by the
-- handle_new_user trigger the moment your auth user exists).
UPDATE profiles
SET is_host = true,
    full_name = 'Daniel Mateo',
    driver_license_verified = true
WHERE id = 'YOUR-HOST-UUID-HERE';

-- ─────────────────────────────────────────
-- CAR-01: 2014 Toyota Corolla (White)
-- ─────────────────────────────────────────
INSERT INTO cars (
  host_id, make, model, year, color, license_plate, vin, description,
  category, daily_rate, weekly_rate, monthly_rate, location, city, state, seats, transmission, fuel_type,
  features, images, is_available, is_approved, rating, total_trips,
  odometer, gps_provider, purchase_price, purchase_date
) VALUES (
  'YOUR-HOST-UUID-HERE',
  'Toyota', 'Corolla', 2014, 'White', 'SPZQ90', '2T1BURHE4EC040001',
  'Clean, reliable daily driver. Great on gas and easy to park. Full pre-rental inspection completed before every trip.',
  'economy', 57.00, 400.00, 1600.00,
  'TBD', 'TBD', 'FL', 5, 'auto', 'gasoline',
  ARRAY['Bluetooth','Backup Camera','AC','USB'],
  ARRAY['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=500&fit=crop'],
  true, true, 0, 0,
  137000, 'Trackhawk', 4300.00, '2026-07-06'
);

-- ─────────────────────────────────────────
-- CAR-02: 2018 Toyota Camry (Black)
-- ─────────────────────────────────────────
INSERT INTO cars (
  host_id, make, model, year, color, license_plate, vin, description,
  category, daily_rate, weekly_rate, monthly_rate, location, city, state, seats, transmission, fuel_type,
  features, images, is_available, is_approved, rating, total_trips,
  odometer, gps_provider, purchase_price, purchase_date
) VALUES (
  'YOUR-HOST-UUID-HERE',
  'Toyota', 'Camry', 2018, 'Black', 'TBD', '4T1B11HK7JU023752',
  'Comfortable, roomy sedan. Recently acquired — full inspection scheduled before first rental.',
  'economy', 65.00, NULL, NULL,
  'TBD', 'TBD', 'FL', 5, 'auto', 'gasoline',
  ARRAY['Bluetooth','Backup Camera','AC','USB'],
  ARRAY['https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&h=500&fit=crop'],
  true, true, 0, 0,
  228400, 'Trackhawk', 7500.00, '2026-07-14'
);

-- ─────────────────────────────────────────
-- MAINTENANCE (mirrors the Turo Business Blueprint spreadsheet)
-- ─────────────────────────────────────────
INSERT INTO maintenance (car_id, service_type, mileage, next_due_date, next_due_miles, notes)
SELECT id, 'Pre-Rental Full Inspection', 137000, CURRENT_DATE, 137000,
  'High-mileage used car, first acquisition - check oil/fluids, brakes, tires, belts, timing chain & water pump history, spark plugs before first rental.'
FROM cars WHERE vin = '2T1BURHE4EC040001';

INSERT INTO maintenance (car_id, service_type, mileage, next_due_date, next_due_miles, notes)
SELECT id, 'Pre-Rental Full Inspection', 228400, CURRENT_DATE, 228400,
  'Second acquisition - check oil/fluids, brakes, tires, belts, timing chain & water pump history, spark plugs before first rental.'
FROM cars WHERE vin = '4T1B11HK7JU023752';

-- NOTE: 'TBD' fields (plate for Camry, location/city) and the daily rates are
-- placeholders — update them with real values once decided, either here in
-- SQL or later from the Fleet Manager admin page.
