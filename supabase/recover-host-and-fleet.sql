-- ─────────────────────────────────────────────────────────────
-- RECOVERY: rebuild the owner profile and the fleet
--
-- Deleting an auth user cascades to its profiles row, and cars reference
-- profiles(id) ON DELETE CASCADE — so clearing out the auth users also
-- removed both cars. Applications, contact messages and uploaded documents
-- were untouched (nothing links them to a user).
--
-- BEFORE RUNNING: create the auth user first.
--   Authentication > Users > Add user > Create new user
--   Email: info@arvanarentals.com
--   Password: your choice
--   TICK "Auto Confirm User"
--
-- Then paste this whole file into the SQL Editor and Run. It looks the user
-- up by email, so there's no UUID to copy by hand. Safe to run twice.
-- ─────────────────────────────────────────────────────────────

-- 1. Owner profile. The signup trigger normally creates this row; recreate
--    it here in case it didn't fire, and mark it as the host either way.
INSERT INTO profiles (id, full_name, email, is_host, driver_license_verified)
SELECT id, 'Daniel Mateo', email, true, true
FROM auth.users
WHERE email = 'info@arvanarentals.com'
ON CONFLICT (id) DO UPDATE
  SET is_host = true,
      full_name = 'Daniel Mateo',
      driver_license_verified = true;

-- 2. CAR-01: 2014 Toyota Corolla (White)
INSERT INTO cars (
  host_id, make, model, year, color, license_plate, vin, description,
  category, daily_rate, weekly_rate, monthly_rate, location, city, state, seats, transmission, fuel_type,
  features, images, is_available, is_approved, rating, total_trips,
  odometer, gps_provider, purchase_price, purchase_date
)
SELECT
  p.id,
  'Toyota', 'Corolla', 2014, 'White', 'SPZQ90', '2T1BURHE4EC040001',
  'Clean, reliable daily driver. Great on gas and easy to park. Full pre-rental inspection completed before every trip.',
  'economy', 57.00, 400.00, 1600.00,
  'Miami, FL', 'Miami', 'FL', 5, 'auto', 'gasoline',
  ARRAY['Bluetooth','Backup Camera','AC','USB'],
  ARRAY['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=500&fit=crop'],
  true, true, 0, 0,
  137000, 'Trackhawk', 4300.00, '2026-07-06'
FROM profiles p
WHERE p.email = 'info@arvanarentals.com'
  AND NOT EXISTS (SELECT 1 FROM cars WHERE vin = '2T1BURHE4EC040001');

-- 3. CAR-02: 2018 Toyota Camry (Black)
INSERT INTO cars (
  host_id, make, model, year, color, license_plate, vin, description,
  category, daily_rate, weekly_rate, monthly_rate, location, city, state, seats, transmission, fuel_type,
  features, images, is_available, is_approved, rating, total_trips,
  odometer, gps_provider, purchase_price, purchase_date
)
SELECT
  p.id,
  'Toyota', 'Camry', 2018, 'Black', 'TBD', '4T1B11HK7JU023752',
  'Comfortable, roomy sedan. Recently acquired — full inspection scheduled before first rental.',
  'economy', 65.00, NULL, NULL,
  'Miami, FL', 'Miami', 'FL', 5, 'auto', 'gasoline',
  ARRAY['Bluetooth','Backup Camera','AC','USB'],
  ARRAY['https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&h=500&fit=crop'],
  true, true, 0, 0,
  228400, 'Trackhawk', 7500.00, '2026-07-14'
FROM profiles p
WHERE p.email = 'info@arvanarentals.com'
  AND NOT EXISTS (SELECT 1 FROM cars WHERE vin = '4T1B11HK7JU023752');

-- 4. Pre-rental inspections
INSERT INTO maintenance (car_id, service_type, mileage, next_due_date, next_due_miles, notes)
SELECT c.id, 'Pre-Rental Full Inspection', 137000, CURRENT_DATE, 137000,
  'High-mileage used car, first acquisition - check oil/fluids, brakes, tires, belts, timing chain & water pump history, spark plugs before first rental.'
FROM cars c
WHERE c.vin = '2T1BURHE4EC040001'
  AND NOT EXISTS (SELECT 1 FROM maintenance m WHERE m.car_id = c.id);

INSERT INTO maintenance (car_id, service_type, mileage, next_due_date, next_due_miles, notes)
SELECT c.id, 'Pre-Rental Full Inspection', 228400, CURRENT_DATE, 228400,
  'Second acquisition - check oil/fluids, brakes, tires, belts, timing chain & water pump history, spark plugs before first rental.'
FROM cars c
WHERE c.vin = '4T1B11HK7JU023752'
  AND NOT EXISTS (SELECT 1 FROM maintenance m WHERE m.car_id = c.id);

-- 5. Your new host UUID — copy this into VITE_HOST_ID in Vercel, then redeploy.
SELECT id AS copy_this_into_vercel_VITE_HOST_ID, email, is_host
FROM profiles
WHERE email = 'info@arvanarentals.com';
