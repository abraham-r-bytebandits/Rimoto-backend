-- ============================================================
-- RIMOTO DATABASE DUMP — Full Reset + Dummy Data
-- DB: rimoto (MySQL)
-- Images served from: http://localhost:4000
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ─── WIPE ALL TABLES (FK-safe order) ────────────────────────
TRUNCATE TABLE `admin_logs`;
TRUNCATE TABLE `stories`;
TRUNCATE TABLE `rides`;
TRUNCATE TABLE `popular_routes`;
TRUNCATE TABLE `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 1. USERS
-- ============================================================
INSERT INTO `users`
  (`id`, `email`, `firstName`, `lastName`, `avatarUrl`, `role`, `passwordHash`,
   `clubAffiliation`, `contactNumber`, `isBanned`, `strikeCount`, `joinedAt`)
VALUES
(
  'a0000000-0000-0000-0000-000000000001',
  'admin@rimoto.in',
  'Rimoto', 'Admin',
  NULL, 'ADMIN',
  '$2b$12$ak/e9izygDpTKkpApuwb0e141gT.UMvTJ8OuqzvB7G8e.jUmHD83q',
  NULL, NULL, FALSE, 0, NOW()
),
(
  'b0000000-0000-0000-0000-000000000001',
  'raj.kumar@rimoto.in',
  'Raj', 'Kumar',
  'http://localhost:4000/uploads/posts/story1_nandi_hills.webp',
  'USER', NULL,
  'Bangalore Bikers Club', '+91 98765 43210',
  FALSE, 0, DATE_SUB(NOW(), INTERVAL 30 DAY)
),
(
  'b0000000-0000-0000-0000-000000000002',
  'priya.sharma@rimoto.in',
  'Priya', 'Sharma',
  'http://localhost:4000/uploads/posts/story2_coorg.webp',
  'USER', NULL,
  'Mysuru Cycling Group', '+91 87654 32109',
  FALSE, 0, DATE_SUB(NOW(), INTERVAL 60 DAY)
),
(
  'b0000000-0000-0000-0000-000000000003',
  'arjun.patel@rimoto.in',
  'Arjun', 'Patel',
  'http://localhost:4000/uploads/posts/story3_western_ghats.webp',
  'USER', NULL,
  'Western Ghats Riders', '+91 76543 21098',
  FALSE, 0, DATE_SUB(NOW(), INTERVAL 90 DAY)
),
(
  'b0000000-0000-0000-0000-000000000004',
  'meera.nair@rimoto.in',
  'Meera', 'Nair',
  'http://localhost:4000/uploads/posts/story4_hampi.webp',
  'USER', NULL,
  'Coastal Cruisers Kerala', '+91 65432 10987',
  FALSE, 0, DATE_SUB(NOW(), INTERVAL 15 DAY)
);

-- ============================================================
-- 2. RIDES
-- ============================================================
INSERT INTO `rides`
  (`id`, `title`, `startLocation`, `endLocation`, `dateScheduled`, `timeStart`,
   `distanceKm`, `skillLevel`, `bikeRequirement`, `whatsappGroupUrl`,
   `whatsappJoinsCount`, `status`, `featuredSlot`, `organizerId`, `imageUrls`, `createdAt`)
VALUES
(
  'c0000000-0000-0000-0000-000000000001',
  'Bangalore to Nandi Hills Sunrise Ride',
  'Hebbal Flyover, Bangalore',
  'Nandi Hills Summit, Chikkaballapur',
  DATE_ADD(NOW(), INTERVAL 7 DAY),
  '05:00 AM', 60.00, 'BEGINNER', 'All Bikes Welcome',
  'https://chat.whatsapp.com/rimoto-nandi-hills',
  142, 'APPROVED', 'HERO_BANNER',
  'b0000000-0000-0000-0000-000000000001',
  '["http://localhost:4000/uploads/rides/ride1_nandi_hills.webp","http://localhost:4000/uploads/rides/ride2_coorg_trail.webp"]',
  DATE_SUB(NOW(), INTERVAL 5 DAY)
),
(
  'c0000000-0000-0000-0000-000000000002',
  'Coorg Coffee Trail Weekend Adventure',
  'Mysuru Bus Stand, Mysuru',
  'Abbey Falls, Madikeri, Coorg',
  DATE_ADD(NOW(), INTERVAL 14 DAY),
  '06:30 AM', 130.50, 'INTERMEDIATE', 'Touring / Adventure Bikes',
  'https://chat.whatsapp.com/rimoto-coorg-trail',
  89, 'APPROVED', 'WEEKEND_PICK',
  'b0000000-0000-0000-0000-000000000002',
  '["http://localhost:4000/uploads/rides/ride2_coorg_trail.webp","http://localhost:4000/uploads/rides/ride3_hampi_tour.webp"]',
  DATE_SUB(NOW(), INTERVAL 10 DAY)
),
(
  'c0000000-0000-0000-0000-000000000003',
  'Hampi Heritage Cycling Expedition',
  'Hospet Railway Station, Bellary',
  'Virupaksha Temple, Hampi',
  DATE_ADD(NOW(), INTERVAL 21 DAY),
  '07:00 AM', 210.00, 'ADVANCED', 'Endurance / Road Bikes Only',
  'https://chat.whatsapp.com/rimoto-hampi-expedition',
  63, 'APPROVED', 'EDITORS_CHOICE',
  'b0000000-0000-0000-0000-000000000003',
  '["http://localhost:4000/uploads/rides/ride3_hampi_tour.webp","http://localhost:4000/uploads/rides/ride4_mysuru_loop.webp"]',
  DATE_SUB(NOW(), INTERVAL 15 DAY)
),
(
  'c0000000-0000-0000-0000-000000000004',
  'Mysuru Royal Palace Heritage Loop',
  'Chamundi Hills, Mysuru',
  'Mysuru Palace, Mysuru',
  DATE_ADD(NOW(), INTERVAL 3 DAY),
  '06:00 AM', 35.00, 'BEGINNER', 'All Bikes Welcome',
  'https://chat.whatsapp.com/rimoto-mysuru-loop',
  28, 'PENDING', NULL,
  'b0000000-0000-0000-0000-000000000004',
  '["http://localhost:4000/uploads/rides/ride4_mysuru_loop.webp"]',
  DATE_SUB(NOW(), INTERVAL 1 DAY)
),
(
  'c0000000-0000-0000-0000-000000000005',
  'Chikmagalur Coffee Estate Dawn Ride',
  'Chikmagalur Town Centre',
  'Mullayanagiri Peak, Chikmagalur',
  DATE_ADD(NOW(), INTERVAL 28 DAY),
  '05:30 AM', 88.00, 'INTERMEDIATE', 'Mountain / Hybrid Bikes',
  'https://chat.whatsapp.com/rimoto-chikmagalur',
  51, 'APPROVED', NULL,
  'b0000000-0000-0000-0000-000000000001',
  '["http://localhost:4000/uploads/rides/ride1_nandi_hills.webp","http://localhost:4000/uploads/rides/ride4_mysuru_loop.webp"]',
  DATE_SUB(NOW(), INTERVAL 7 DAY)
);

-- ============================================================
-- 3. STORIES
-- ============================================================
INSERT INTO `stories`
  (`id`, `title`, `destinationTag`, `flairType`, `contentBody`, `mediaUrls`,
   `mediaMeta`, `images`, `postType`, `ratingScore`, `voteCount`,
   `isPinned`, `status`, `authorId`, `createdAt`)
VALUES
(
  'd0000000-0000-0000-0000-000000000001',
  'Dawn at Nandi Hills: A Cyclists Paradise',
  'Nandi Hills',
  'SOLO_STORY',
  'There is something truly magical about watching the sun rise from the summit of Nandi Hills. As cyclists, we have a unique privilege — we earn every metre of elevation, and the reward is incomparable.\n\nThe route from Hebbal Flyover to Nandi Hills is one of Bangalore''s most beloved cycling corridors. The first 30 km are flat, cutting through the early morning mist of NH-44. Then the climb begins — a steady 10 km ascent that tests your lungs and your resolve. The gradient averages around 5–7%, with some steeper switchbacks near the top.\n\nAt the summit, the fog rolls through the trees like a slow tide. The temperature drops noticeably — bring a light jacket. The view from Tipu''s Drop looks out over the Deccan Plateau stretching endlessly to the horizon.\n\nBest time: October to February. Avoid summer — the exposed climb under harsh sun is unforgiving. Total distance: ~60 km round trip. Perfect for beginner to intermediate cyclists.',
  '["http://localhost:4000/uploads/posts/story1_nandi_hills.webp"]',
  '{"photos": 1, "videos": 0}',
  '["http://localhost:4000/uploads/posts/story1_nandi_hills.webp"]',
  'STORY', 4.9, 247,
  TRUE, 'APPROVED',
  'a0000000-0000-0000-0000-000000000001',
  DATE_SUB(NOW(), INTERVAL 20 DAY)
),
(
  'd0000000-0000-0000-0000-000000000002',
  'Coorg Coffee Trail: My Honest Review After 130 km',
  'Coorg',
  'TRIP_REVIEW',
  'I''ve done the Coorg coffee trail twice — once solo and once with the Rimoto crew — and both times it completely blew me away.\n\nThe route from Mysuru to Madikeri is around 130 km of absolute riding bliss. The first 60 km are fairly flat as you cross the Deccan Plateau. Then you enter the Western Ghats, and everything changes. The road narrows, coffee and cardamom plantations appear on either side, and the scent is incredible.\n\nThe toughest section is the last 30 km climb to Madikeri — multiple hairpin bends, steep gradients. Worth every drop of sweat.\n\nRoad condition: 8/10. Traffic: Moderate on weekdays, start by 6:30 AM. Highlights: Abbey Falls, Madikeri Fort, Raja''s Seat viewpoint.\n\nBest intermediate cycling route in Karnataka. Highly recommended.',
  '["http://localhost:4000/uploads/posts/story2_coorg.webp"]',
  '{"photos": 1, "videos": 0}',
  '["http://localhost:4000/uploads/posts/story2_coorg.webp"]',
  'REVIEW', 4.7, 183,
  FALSE, 'APPROVED',
  'b0000000-0000-0000-0000-000000000002',
  DATE_SUB(NOW(), INTERVAL 12 DAY)
),
(
  'd0000000-0000-0000-0000-000000000003',
  'Western Ghats Traverse: India''s Greatest Cycling Route',
  'Western Ghats',
  'EXPEDITION',
  'The Western Ghats — a UNESCO World Heritage Site — offer cycling experiences that simply cannot be matched anywhere else in India.\n\nStretching over 1,600 km along the western edge of the Deccan Plateau, the Ghats offer diverse terrain for every kind of cyclist. From the lush tea gardens of Wayanad to the wind-swept passes of the Nilgiris, from the coffee valleys of Coorg to the pristine Konkan coast.\n\nOur recommended traverse runs Hassan → Chikmagalur → Kudremukh → Sakleshpur → Mangalore. Total: ~280 km over 4 days.\n\nDay 1: Hassan to Chikmagalur (70 km) — rolling hills through coffee estates.\nDay 2: Chikmagalur to Kudremukh (65 km) — dense forest, waterfalls.\nDay 3: Kudremukh to Sakleshpur (80 km) — the legendary Ghati Road.\nDay 4: Sakleshpur to Mangalore (65 km) — dramatic descent to the coast.\n\nAdvanced territory. Proper gear and ideally a support vehicle are essential.',
  '["http://localhost:4000/uploads/posts/story3_western_ghats.webp","http://localhost:4000/uploads/posts/story2_coorg.webp"]',
  '{"photos": 2, "videos": 0}',
  '["http://localhost:4000/uploads/posts/story3_western_ghats.webp","http://localhost:4000/uploads/posts/story2_coorg.webp"]',
  'STORY', 5.0, 412,
  TRUE, 'APPROVED',
  'a0000000-0000-0000-0000-000000000001',
  DATE_SUB(NOW(), INTERVAL 45 DAY)
),
(
  'd0000000-0000-0000-0000-000000000004',
  'Hampi on Two Wheels: History, Heat, and Pure Grit',
  'Hampi',
  'TRIP_REVIEW',
  'Hampi is not just a cycling destination — it''s a time machine. Riding through the ruins of the Vijayanagara Empire, with boulders balancing impossibly and ancient temples rising out of the scrub, is one of the most surreal experiences I''ve ever had.\n\nThe route from Hospet to Hampi is only ~13 km, but once inside Hampi you''ll ride 80–100 km just exploring the 40 sq km ruins complex.\n\nChallenge: Rocky, uneven terrain. A hybrid or mountain bike is strongly recommended. Road bikes will struggle.\n\nWeather: Hampi is HOT. Go between October and February. I went in November — high 20s, perfect.\n\nMust-visit: Virupaksha Temple, Vijaya Vittala Temple stone chariot, Matanga Hill sunset, Hemakuta Hill sunrise.\n\nFor history lovers and adventure cyclists alike, Hampi is non-negotiable. 10/10.',
  '["http://localhost:4000/uploads/posts/story4_hampi.webp","http://localhost:4000/uploads/posts/story1_nandi_hills.webp"]',
  '{"photos": 2, "videos": 0}',
  '["http://localhost:4000/uploads/posts/story4_hampi.webp","http://localhost:4000/uploads/posts/story1_nandi_hills.webp"]',
  'REVIEW', 4.8, 156,
  FALSE, 'APPROVED',
  'b0000000-0000-0000-0000-000000000001',
  DATE_SUB(NOW(), INTERVAL 8 DAY)
),
(
  'd0000000-0000-0000-0000-000000000005',
  'Mullayanagiri: Conquering Karnataka''s Highest Peak',
  'Chikmagalur',
  'SOLO_STORY',
  'At 1,930 metres, Mullayanagiri is the highest peak in Karnataka — and cycling to its base is one of the most rewarding challenges in South India.\n\nThe approach from Chikmagalur town through the coffee estates is absolutely stunning. Morning fog clings to the eucalyptus trees lining the road. The air smells of coffee blossoms and wet earth.\n\nThe climb itself: 28 km of continuous ascent, gaining nearly 1,200 m of elevation. The road surface is in good condition up to about 15 km from the top, then gets rougher near the peak trail head.\n\nWe''d recommend starting no later than 5:30 AM from Chikmagalur to beat both traffic and afternoon clouds. Carry at least 3 litres of water — there are no refill points after the 10 km mark.\n\nThe descent is pure euphoria. Trust your brakes, take the hairpins wide, and savour every second.',
  '["http://localhost:4000/uploads/posts/story3_western_ghats.webp"]',
  '{"photos": 1, "videos": 0}',
  '["http://localhost:4000/uploads/posts/story3_western_ghats.webp"]',
  'STORY', 4.6, 98,
  FALSE, 'APPROVED',
  'a0000000-0000-0000-0000-000000000001',
  DATE_SUB(NOW(), INTERVAL 3 DAY)
);

-- ============================================================
-- 4. POPULAR ROUTES
-- ============================================================
INSERT INTO `popular_routes`
  (`id`, `orderNo`, `title`, `place`, `iframeUrl`, `createdAt`, `updatedAt`)
VALUES
(
  'e0000000-0000-0000-0000-000000000001',
  1,
  'Bangalore → Nandi Hills',
  'Nandi Hills, Chikkaballapur, Karnataka',
  '<iframe src="https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d248921.59049960785!2d77.49491066826697!3d13.211997596580638!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e1!4m5!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBengaluru%2C%20Karnataka!3m2!1d12.9715987!2d77.5945627!4m5!1s0x3bae1d7745570b77%3A0x1e5eb8e19e9e47c2!2sNandi%20Hills%2C%20Karnataka%20562103!3m2!1d13.370327!2d77.683697!5e0!3m2!1sen!2sin!4v1716000000000!5m2!1sen!2sin" width="100%" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
  NOW(), NOW()
),
(
  'e0000000-0000-0000-0000-000000000002',
  2,
  'Mysuru → Coorg Coffee Trail',
  'Madikeri, Coorg, Karnataka',
  '<iframe src="https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d504765.2614048789!2d75.47773937040046!3d12.424024485527637!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e1!4m5!1s0x3baf7783a3d84b25%3A0x7a263b7abf0bb7f1!2sMysuru%2C%20Karnataka!3m2!1d12.2958104!2d76.6393805!4m5!1s0x3bbce741e59d4ecb%3A0x5c2ef97d9ddf5478!2sMadikeri%2C%20Karnataka%20571201!3m2!1d12.421698!2d75.7379929!5e0!3m2!1sen!2sin!4v1716000000001!5m2!1sen!2sin" width="100%" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
  NOW(), NOW()
),
(
  'e0000000-0000-0000-0000-000000000003',
  3,
  'Mysuru → Ooty via Bandipur',
  'Ooty (Udhagamandalam), Tamil Nadu',
  '<iframe src="https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d503060.79049817915!2d76.17524736085524!3d11.839427484408088!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e1!4m5!1s0x3baf7783a3d84b25%3A0x7a263b7abf0bb7f1!2sMysuru%2C%20Karnataka!3m2!1d12.2958104!2d76.6393805!4m5!1s0x3ba0a1ac1c32d5e5%3A0xabc123abc!2sOoty%2C%20Tamil%20Nadu%20643001!3m2!1d11.4101672!2d76.695437!5e0!3m2!1sen!2sin!4v1716000000002!5m2!1sen!2sin" width="100%" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
  NOW(), NOW()
),
(
  'e0000000-0000-0000-0000-000000000004',
  4,
  'Hospet → Hampi Heritage Loop',
  'Hampi, Vijayanagara, Karnataka',
  '<iframe src="https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d61836.50218478384!2d76.41823366044922!3d15.305617195540048!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e1!4m5!1s0x3bb7ae4148c89a85%3A0x1d7a67a5e3e2a2b0!2sHospet%2C%20Karnataka%20583201!3m2!1d15.272498!2d76.386741!4m5!1s0x3bb76be7ab9a2a0f%3A0x1c8d6c9e4d4e4e4e!2sHampi%2C%20Karnataka%20583239!3m2!1d15.334935!2d76.4601!5e0!3m2!1sen!2sin!4v1716000000003!5m2!1sen!2sin" width="100%" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
  NOW(), NOW()
),
(
  'e0000000-0000-0000-0000-000000000005',
  5,
  'Chikmagalur → Mullayanagiri Peak',
  'Mullayanagiri, Chikmagalur, Karnataka',
  '<iframe src="https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d125765.94052699016!2d75.6776305!3d13.3378607!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e1!4m5!1s0x3bbaba5b53aa0c75%3A0x7a263b7abf0bb7f1!2sChikmagalur%2C%20Karnataka!3m2!1d13.3161188!2d75.7720437!4m5!1s0x3bbab5a6c2f8b3a1%3A0x5a6b7c8d9e0f1a2b!2sMullayanagiri%20Peak%2C%20Karnataka%20577142!3m2!1d13.3934567!2d75.7345678!5e0!3m2!1sen!2sin!4v1716000000004!5m2!1sen!2sin" width="100%" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>',
  NOW(), NOW()
);

-- ============================================================
-- 5. ADMIN LOGS
-- ============================================================
INSERT INTO `admin_logs`
  (`id`, `actionSeverity`, `actionType`, `message`, `createdAt`, `actorId`)
VALUES
(
  'f0000000-0000-0000-0000-000000000001',
  'SUCCESS', 'Approved',
  'Ride "Bangalore to Nandi Hills Sunrise Ride" was approved',
  DATE_SUB(NOW(), INTERVAL 4 DAY),
  'a0000000-0000-0000-0000-000000000001'
),
(
  'f0000000-0000-0000-0000-000000000002',
  'SUCCESS', 'Approved',
  'Ride "Coorg Coffee Trail Weekend Adventure" was approved',
  DATE_SUB(NOW(), INTERVAL 9 DAY),
  'a0000000-0000-0000-0000-000000000001'
),
(
  'f0000000-0000-0000-0000-000000000003',
  'SUCCESS', 'Approved',
  'Ride "Hampi Heritage Cycling Expedition" was approved',
  DATE_SUB(NOW(), INTERVAL 14 DAY),
  'a0000000-0000-0000-0000-000000000001'
),
(
  'f0000000-0000-0000-0000-000000000004',
  'SUCCESS', 'Featured Updated',
  'Featured ride slots updated: HERO_BANNER=Nandi Hills, WEEKEND_PICK=Coorg, EDITORS_CHOICE=Hampi',
  DATE_SUB(NOW(), INTERVAL 3 DAY),
  'a0000000-0000-0000-0000-000000000001'
),
(
  'f0000000-0000-0000-0000-000000000005',
  'SUCCESS', 'Approved',
  'Story "Dawn at Nandi Hills: A Cyclists Paradise" was approved and pinned',
  DATE_SUB(NOW(), INTERVAL 19 DAY),
  'a0000000-0000-0000-0000-000000000001'
),
(
  'f0000000-0000-0000-0000-000000000006',
  'SUCCESS', 'Approved',
  'Story "Western Ghats Traverse: India''s Greatest Cycling Route" was approved and pinned',
  DATE_SUB(NOW(), INTERVAL 44 DAY),
  'a0000000-0000-0000-0000-000000000001'
),
(
  'f0000000-0000-0000-0000-000000000007',
  'SUCCESS', 'Approved',
  'Ride "Chikmagalur Coffee Estate Dawn Ride" was approved',
  DATE_SUB(NOW(), INTERVAL 6 DAY),
  'a0000000-0000-0000-0000-000000000001'
),
(
  'f0000000-0000-0000-0000-000000000008',
  'WARNING', 'New story submitted',
  'New review "Hampi on Two Wheels" submitted by Raj Kumar — awaiting moderation',
  DATE_SUB(NOW(), INTERVAL 9 DAY),
  'a0000000-0000-0000-0000-000000000001'
);

-- ============================================================
-- END OF DUMP
-- ============================================================
