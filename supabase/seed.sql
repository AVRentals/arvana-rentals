-- DriveShare Seed Data
-- Run AFTER schema.sql in Supabase SQL Editor
-- Note: Replace host UUIDs with real auth.users IDs after creating test accounts

-- ─────────────────────────────────────────
-- SEED PROFILES (3 hosts)
-- ─────────────────────────────────────────
-- In production, profiles are auto-created via trigger.
-- For seeding, insert directly with known UUIDs:

INSERT INTO profiles (id, full_name, avatar_url, phone, bio, is_host, driver_license_verified, created_at) VALUES
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567801',
  'Michael Chen',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  '+1 (555) 012-3456',
  'Car enthusiast and entrepreneur. I love sharing my vehicles with travelers and locals alike. All my cars are meticulously maintained and fully detailed before every trip.',
  true,
  true,
  '2022-03-15T00:00:00Z'
),
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567802',
  'Sarah Williams',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
  '+1 (555) 987-6543',
  'Professional host with 3 years of experience on DriveShare. My cars are always spotless and ready to go. I respond to messages within minutes!',
  true,
  true,
  '2021-08-22T00:00:00Z'
),
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567803',
  'David Rodriguez',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  '+1 (555) 456-7890',
  'Passionate about cars and great customer service. I maintain my fleet to the highest standards. Each car comes with a full tank and a fresh detail.',
  true,
  true,
  '2022-01-10T00:00:00Z'
);

-- ─────────────────────────────────────────
-- SEED CARS (12 sample cars)
-- ─────────────────────────────────────────
INSERT INTO cars (id, host_id, make, model, year, color, license_plate, description, category, daily_rate, location, city, state, seats, transmission, fuel_type, features, images, is_available, is_approved, rating, total_trips, created_at) VALUES

-- Car 1: Tesla Model 3 (Electric)
(
  'c1000001-0000-0000-0000-000000000001',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567801',
  'Tesla', 'Model 3', 2023, 'Pearl White', 'TSLAM3',
  'Experience the future of driving with this pristine Tesla Model 3. Fully charged and ready for any adventure. Features Autopilot, a massive touchscreen, and premium audio. Superchargers nearby for long trips.',
  'electric', 129.00, 'Downtown Los Angeles', 'Los Angeles', 'CA', 5, 'auto', 'electric',
  ARRAY['Autopilot','Premium Audio','USB-C','Heated Seats','GPS','Bluetooth','Backup Camera'],
  ARRAY[
    'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1571127236794-81c6234f8b4a?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&h=500&fit=crop'
  ],
  true, true, 4.9, 87, '2023-01-15T00:00:00Z'
),

-- Car 2: BMW M4 Competition (Sports)
(
  'c1000001-0000-0000-0000-000000000002',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567802',
  'BMW', 'M4 Competition', 2022, 'Sao Paulo Yellow', 'BMWM4',
  'Turn heads in this stunning BMW M4 Competition. 503 horsepower from a hand-crafted twin-turbo inline-6. Track-tuned suspension and carbon ceramic brakes. Sport Chrono Pack included.',
  'sports', 285.00, 'Beverly Hills', 'Los Angeles', 'CA', 4, 'auto', 'gasoline',
  ARRAY['Heated Seats','Harman Kardon Audio','Carbon Fiber Trim','Adaptive Cruise','GPS','Bluetooth','Backup Camera','Sport Mode'],
  ARRAY[
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1617654112329-bf67c9fd1f8c?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=500&fit=crop'
  ],
  true, true, 4.8, 53, '2023-02-20T00:00:00Z'
),

-- Car 3: Range Rover Sport (SUV)
(
  'c1000001-0000-0000-0000-000000000003',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567803',
  'Land Rover', 'Range Rover Sport HSE', 2023, 'Santorini Black', 'RRSPORT',
  'Luxury meets adventure. Panoramic sunroof, massaging seats, and Meridian sound system make every journey a first-class experience. Perfect for mountain escapes or urban cruising.',
  'suv', 195.00, 'Santa Monica', 'Los Angeles', 'CA', 7, 'auto', 'gasoline',
  ARRAY['Panoramic Sunroof','Massaging Seats','Meridian Audio','Air Suspension','GPS','Bluetooth','Backup Camera','Heated Seats','4WD'],
  ARRAY[
    'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=500&fit=crop'
  ],
  true, true, 4.9, 124, '2022-11-05T00:00:00Z'
),

-- Car 4: Porsche 911 Carrera S (Sports)
(
  'c1000001-0000-0000-0000-000000000004',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567801',
  'Porsche', '911 Carrera S', 2022, 'GT Silver Metallic', 'PRSCH911',
  'The iconic Porsche 911 — refined, powerful, timeless. 450hp flat-six with Sport Chrono Package. PDK transmission for the purest driving experience. Canyon roads await.',
  'sports', 350.00, 'West Hollywood', 'Los Angeles', 'CA', 4, 'auto', 'gasoline',
  ARRAY['Sport Chrono','BOSE Audio','Leather Interior','Sport Exhaust','GPS','Bluetooth','Heated Seats','Sunroof'],
  ARRAY[
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1611859266238-4b98091d9d9b?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1621135802920-133df287f89c?w=800&h=500&fit=crop'
  ],
  true, true, 5.0, 31, '2023-03-01T00:00:00Z'
),

-- Car 5: Toyota Camry (Economy)
(
  'c1000001-0000-0000-0000-000000000005',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567802',
  'Toyota', 'Camry SE', 2023, 'Midnight Black', 'TOYCAM',
  'Reliable, comfortable, and fuel-efficient. Perfect for business travel or everyday use. Fresh oil change, recently detailed. Great gas mileage for long trips to San Francisco or San Diego.',
  'economy', 58.00, 'Culver City', 'Los Angeles', 'CA', 5, 'auto', 'gasoline',
  ARRAY['Bluetooth','Backup Camera','Apple CarPlay','Android Auto','USB','AC','Lane Keep Assist'],
  ARRAY[
    'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=500&fit=crop'
  ],
  true, true, 4.7, 213, '2022-06-18T00:00:00Z'
),

-- Car 6: Mercedes S-Class (Luxury)
(
  'c1000001-0000-0000-0000-000000000006',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567803',
  'Mercedes-Benz', 'S-Class S580', 2023, 'Diamond White', 'MBSCLASS',
  'The pinnacle of automotive luxury. Massage seats with 17 positions, MBUX with augmented reality, and a 30-speaker Burmester 4D surround sound. Arrive in absolute comfort.',
  'luxury', 320.00, 'Beverly Hills', 'Los Angeles', 'CA', 5, 'auto', 'gasoline',
  ARRAY['Massaging Seats','Burmester Audio','MBUX AR','Heated/Cooled Seats','GPS','Bluetooth','Panoramic Sunroof','Ambient Lighting','Night Vision'],
  ARRAY[
    'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&h=500&fit=crop'
  ],
  true, true, 4.9, 67, '2022-09-12T00:00:00Z'
),

-- Car 7: Ford Mustang GT (Sports)
(
  'c1000001-0000-0000-0000-000000000007',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567801',
  'Ford', 'Mustang GT', 2022, 'Race Red', 'FRDMSTNG',
  'Iconic American muscle with 460 horsepower from a Coyote V8. Pure driving excitement. Custom Borla exhaust roars. Perfect for a weekend cruise down the PCH or canyon carving.',
  'sports', 145.00, 'Long Beach', 'Los Angeles', 'CA', 4, 'manual', 'gasoline',
  ARRAY['Bluetooth','Backup Camera','SYNC 3','GPS','USB','Sport Mode','Custom Exhaust'],
  ARRAY[
    'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1612825173281-9a193378527e?w=800&h=500&fit=crop'
  ],
  true, true, 4.6, 78, '2023-01-28T00:00:00Z'
),

-- Car 8: Toyota RAV4 Hybrid (SUV)
(
  'c1000001-0000-0000-0000-000000000008',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567802',
  'Toyota', 'RAV4 Hybrid', 2023, 'Lunar Rock', 'TOYRAV4',
  'The perfect family adventure vehicle. Excellent fuel economy with the capability for any terrain. Spacious cargo area, AWD, and a smooth ride. The ultimate road trip companion.',
  'suv', 95.00, 'Pasadena', 'Los Angeles', 'CA', 5, 'auto', 'hybrid',
  ARRAY['Apple CarPlay','Android Auto','AWD','Backup Camera','GPS','Bluetooth','USB','AC','Heated Seats'],
  ARRAY[
    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=500&fit=crop'
  ],
  true, true, 4.8, 156, '2022-07-04T00:00:00Z'
),

-- Car 9: Audi e-tron GT (Electric)
(
  'c1000001-0000-0000-0000-000000000009',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567803',
  'Audi', 'e-tron GT', 2023, 'Kemora Gray', 'AUDIETGT',
  'Audi''s electric masterpiece. 637hp with 238-mile range. Quattro AWD, air suspension, and Bang & Olufsen 3D sound. 800V charging for rapid top-ups. Luxury and sustainability united.',
  'electric', 220.00, 'Marina del Rey', 'Los Angeles', 'CA', 4, 'auto', 'electric',
  ARRAY['Bang & Olufsen Audio','Virtual Cockpit','Quattro AWD','Air Suspension','GPS','Bluetooth','Massaging Seats','Sunroof'],
  ARRAY[
    'https://images.unsplash.com/photo-1617654112329-bf67c9fd1f8c?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1571127236794-81c6234f8b4a?w=800&h=500&fit=crop'
  ],
  true, true, 4.9, 42, '2023-02-14T00:00:00Z'
),

-- Car 10: Honda Civic Sport (Economy)
(
  'c1000001-0000-0000-0000-000000000010',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567801',
  'Honda', 'Civic Sport', 2023, 'Sonic Gray Pearl', 'HNDCVCS',
  'Sporty, efficient, and fun to drive. Turbocharged engine with responsive handling. Great fuel economy for longer trips. Perfect for airport runs or exploring the city.',
  'economy', 52.00, 'Koreatown', 'Los Angeles', 'CA', 5, 'manual', 'gasoline',
  ARRAY['Apple CarPlay','Android Auto','Backup Camera','Bluetooth','USB','AC','Lane Assist'],
  ARRAY[
    'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=500&fit=crop'
  ],
  true, true, 4.5, 198, '2022-04-22T00:00:00Z'
),

-- Car 11: Lamborghini Huracán EVO (Luxury/Sports)
(
  'c1000001-0000-0000-0000-000000000011',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567802',
  'Lamborghini', 'Huracán EVO', 2022, 'Giallo Orion', 'LAMBHEV',
  'Make an unforgettable impression. 640 naturally aspirated horsepower, AWD, and a roar that turns heads for blocks. A once-in-a-lifetime driving experience. Memories guaranteed.',
  'luxury', 1200.00, 'Beverly Hills', 'Los Angeles', 'CA', 2, 'auto', 'gasoline',
  ARRAY['Lifting System','Alcantara Interior','Carbon Ceramic Brakes','Sport Exhaust','GPS','Bluetooth','Rear Camera','Drive Modes'],
  ARRAY[
    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1611859266238-4b98091d9d9b?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=500&fit=crop'
  ],
  true, true, 5.0, 19, '2023-03-10T00:00:00Z'
),

-- Car 12: Jeep Wrangler Rubicon (SUV)
(
  'c1000001-0000-0000-0000-000000000012',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567803',
  'Jeep', 'Wrangler Rubicon', 2022, 'Sarge Green', 'JEEPWRB',
  'Adventure awaits! Trail-rated and road-ready. Removable doors and roof for open-air driving. Locking differentials, 33" tires for serious off-roading. Joshua Tree, Big Bear, or beach cruising.',
  'suv', 115.00, 'Glendale', 'Los Angeles', 'CA', 5, 'manual', 'gasoline',
  ARRAY['Removable Doors','Open Sky Freedom Top','Rock-Trac 4WD','Locking Differentials','GPS','Bluetooth','USB','Trail-Rated'],
  ARRAY[
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&h=500&fit=crop',
    'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&h=500&fit=crop'
  ],
  true, true, 4.7, 89, '2022-08-30T00:00:00Z'
);

-- ─────────────────────────────────────────
-- SEED BOOKINGS (5 sample bookings)
-- ─────────────────────────────────────────
-- Note: renter_id should be real user UUIDs in production
INSERT INTO bookings (id, car_id, renter_id, host_id, start_date, end_date, total_days, daily_rate, subtotal, service_fee, total_amount, status, pickup_location, created_at) VALUES
(
  'b1000001-0000-0000-0000-000000000001',
  'c1000001-0000-0000-0000-000000000001',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567802', -- Sarah renting from Michael
  'a1b2c3d4-e5f6-7890-abcd-ef1234567801',
  '2024-03-15', '2024-03-18', 3, 129.00, 387.00, 46.44, 433.44,
  'completed', 'Downtown Los Angeles, CA', '2024-03-10T00:00:00Z'
),
(
  'b1000001-0000-0000-0000-000000000002',
  'c1000001-0000-0000-0000-000000000003',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567802',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567803',
  '2024-04-20', '2024-04-22', 2, 195.00, 390.00, 46.80, 436.80,
  'confirmed', 'Santa Monica, CA', '2024-04-15T00:00:00Z'
),
(
  'b1000001-0000-0000-0000-000000000003',
  'c1000001-0000-0000-0000-000000000005',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567803',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567802',
  '2024-03-01', '2024-03-07', 6, 58.00, 348.00, 41.76, 389.76,
  'completed', 'Culver City, CA', '2024-02-25T00:00:00Z'
),
(
  'b1000001-0000-0000-0000-000000000004',
  'c1000001-0000-0000-0000-000000000004',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567803',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567801',
  '2024-05-10', '2024-05-12', 2, 350.00, 700.00, 84.00, 784.00,
  'pending', 'West Hollywood, CA', '2024-05-08T00:00:00Z'
),
(
  'b1000001-0000-0000-0000-000000000005',
  'c1000001-0000-0000-0000-000000000009',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567801',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567803',
  '2024-04-05', '2024-04-08', 3, 220.00, 660.00, 79.20, 739.20,
  'completed', 'Marina del Rey, CA', '2024-04-01T00:00:00Z'
);

-- ─────────────────────────────────────────
-- SEED REVIEWS (10 sample reviews)
-- ─────────────────────────────────────────
INSERT INTO reviews (id, booking_id, reviewer_id, reviewee_id, car_id, rating, comment, type, created_at) VALUES
(
  'r1000001-0000-0000-0000-000000000001',
  'b1000001-0000-0000-0000-000000000001',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567802',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567801',
  'c1000001-0000-0000-0000-000000000001',
  5,
  'The Tesla was absolutely fantastic! Fully charged, immaculate interior, and Michael was incredibly responsive. Autopilot made the highway drive so smooth. Will definitely book again!',
  'car', '2024-01-15T00:00:00Z'
),
(
  'r1000001-0000-0000-0000-000000000002',
  'b1000001-0000-0000-0000-000000000001',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567802',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567801',
  NULL,
  5,
  'Michael is an excellent host. Car was ready exactly on time, super clean, and he was very helpful with tips for charging stations. 5 stars!',
  'host', '2024-01-15T00:00:00Z'
),
(
  'r1000001-0000-0000-0000-000000000003',
  'b1000001-0000-0000-0000-000000000002',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567802',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567803',
  'c1000001-0000-0000-0000-000000000003',
  5,
  'The Range Rover was the perfect family vehicle for our Big Bear trip. David was so accommodating — even allowed an early pickup. The car performed flawlessly on mountain roads.',
  'car', '2024-02-05T00:00:00Z'
),
(
  'r1000001-0000-0000-0000-000000000004',
  'b1000001-0000-0000-0000-000000000003',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567803',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567802',
  'c1000001-0000-0000-0000-000000000005',
  4,
  'Great value for the price! The Camry was clean, comfortable, and got incredible mileage for our road trip to San Francisco. Sarah was easy to work with. Would definitely book again.',
  'car', '2024-02-18T00:00:00Z'
),
(
  'r1000001-0000-0000-0000-000000000005',
  'b1000001-0000-0000-0000-000000000005',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567801',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567803',
  'c1000001-0000-0000-0000-000000000009',
  5,
  'The Audi e-tron GT is a dream. Insane performance, beautiful interior, and charged up perfectly. David recommended some great coastal roads. This car made our anniversary trip unforgettable!',
  'car', '2024-03-10T00:00:00Z'
),
(
  'r1000001-0000-0000-0000-000000000006',
  'b1000001-0000-0000-0000-000000000005',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567801',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567803',
  NULL,
  5,
  'David is a top-tier host. Incredibly responsive, car was perfectly detailed, and he sent check-in instructions 24 hours in advance. The gold standard for DriveShare hosting!',
  'host', '2024-03-10T00:00:00Z'
),
-- Host reviews for renters
(
  'r1000001-0000-0000-0000-000000000007',
  'b1000001-0000-0000-0000-000000000001',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567801',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567802',
  NULL, 5,
  'Excellent renter! Sarah returned the car exactly on time, spotlessly clean, and communicated perfectly throughout. Would happily host her again!',
  'renter', '2024-01-16T00:00:00Z'
),
(
  'r1000001-0000-0000-0000-000000000008',
  'b1000001-0000-0000-0000-000000000003',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567802',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567803',
  NULL, 4,
  'David was a great renter. Returned the car on time and in great condition. Very communicative. Would host again.',
  'renter', '2024-03-08T00:00:00Z'
),
(
  'r1000001-0000-0000-0000-000000000009',
  'b1000001-0000-0000-0000-000000000002',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567803',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567802',
  'c1000001-0000-0000-0000-000000000003',
  5,
  'Incredible SUV for our family camping trip to Big Bear! Handled the mountain roads with ease. Seven seats fit our whole crew. Highly recommend.',
  'car', '2024-02-28T00:00:00Z'
),
(
  'r1000001-0000-0000-0000-000000000010',
  'b1000001-0000-0000-0000-000000000005',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567803',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567801',
  NULL, 5,
  'Michael is an outstanding renter. Car came back cleaner than when it left — he even left a thank-you note. Book him without hesitation!',
  'renter', '2024-03-11T00:00:00Z'
);
