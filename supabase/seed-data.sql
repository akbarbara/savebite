-- Script untuk memasukkan data contoh (Mitra & Makanan) ke database
-- Jalankan script ini di menu SQL Editor Supabase

-- Hapus data lama jika ada (opsional, untuk mencegah duplikat)
-- DELETE FROM rescue_bags;
-- DELETE FROM partners;

-- ============================================
-- 1. SEED Kopi Kenangan (Kafe)
-- ============================================
WITH new_user AS (
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'kopi@kenangan.test', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Kopi Kenangan"}', now(), now())
  RETURNING id
),
new_profile AS (
  INSERT INTO profiles (id, full_name, role)
  SELECT id, 'Kopi Kenangan', 'mitra' FROM new_user
  RETURNING id
),
new_partner AS (
  INSERT INTO partners (user_id, business_name, description, address, city, category_id, status, avg_rating)
  SELECT id, 'Kopi Kenangan', 'Kafe modern dengan berbagai pilihan kopi dan pastri segar setiap hari.', 'Jl. Sudirman No. 45', 'Jakarta', (SELECT id FROM categories WHERE slug = 'kafe' LIMIT 1), 'active', 4.6 FROM new_profile
  RETURNING id
)
INSERT INTO rescue_bags (partner_id, name, description, content_hint, original_price, rescue_price, quantity_total, pickup_start, pickup_end, available_date)
SELECT id, 'Mystery Coffee Bag', 'Paket kejutan berisi aneka minuman kopi dan pastri pilihan barista kami.', 'Perkiraan isi: 2 minuman kopi + 1-2 pastri', 85000, 35000, 10, '18:00', '20:00', CURRENT_DATE FROM new_partner;

-- ============================================
-- 2. SEED Warung Nasi Padang (Restoran)
-- ============================================
WITH new_user AS (
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'padang@sederhana.test', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Nasi Padang Sederhana"}', now(), now())
  RETURNING id
),
new_profile AS (
  INSERT INTO profiles (id, full_name, role)
  SELECT id, 'Nasi Padang Sederhana', 'mitra' FROM new_user
  RETURNING id
),
new_partner AS (
  INSERT INTO partners (user_id, business_name, description, address, city, category_id, status, avg_rating)
  SELECT id, 'Warung Nasi Padang Sederhana', 'Masakan padang autentik dengan bumbu rempah pilihan.', 'Jl. Kebon Sirih No. 7', 'Jakarta', (SELECT id FROM categories WHERE slug = 'restoran' LIMIT 1), 'active', 4.5 FROM new_profile
  RETURNING id
)
INSERT INTO rescue_bags (partner_id, name, description, content_hint, original_price, rescue_price, quantity_total, pickup_start, pickup_end, available_date)
SELECT id, 'Nasi Padang Komplit', 'Paket nasi padang lengkap dengan lauk pilihan chef yang belum terjual.', 'Perkiraan isi: Nasi + rendang/ayam pop + sayur + sambal', 55000, 20000, 15, '19:00', '21:00', CURRENT_DATE FROM new_partner;

-- ============================================
-- 3. SEED Roti Bakar 88 (Bakeri)
-- ============================================
WITH new_user AS (
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'roti88@bakar.test', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Roti Bakar 88"}', now(), now())
  RETURNING id
),
new_profile AS (
  INSERT INTO profiles (id, full_name, role)
  SELECT id, 'Roti Bakar 88', 'mitra' FROM new_user
  RETURNING id
),
new_partner AS (
  INSERT INTO partners (user_id, business_name, description, address, city, category_id, status, avg_rating)
  SELECT id, 'Roti Bakar 88', 'Bakeri tradisional yang menyajikan roti, kue, dan pastri artisan berkualitas tinggi.', 'Jl. Gatot Subroto No. 12', 'Jakarta', (SELECT id FROM categories WHERE slug = 'bakeri' LIMIT 1), 'active', 4.8 FROM new_profile
  RETURNING id
)
INSERT INTO rescue_bags (partner_id, name, description, content_hint, original_price, rescue_price, quantity_total, pickup_start, pickup_end, available_date)
SELECT id, 'Roti Assorted Box', 'Koleksi roti dan pastri segar yang dipanggang hari ini.', 'Perkiraan isi: 4-6 potong roti', 65000, 25000, 20, '17:00', '19:30', CURRENT_DATE FROM new_partner;
