-- ============================================
-- AUTH & USERS
-- ============================================

-- profiles: extend auth.users Supabase
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  phone       TEXT,
  avatar_url  TEXT,
  role        TEXT NOT NULL CHECK (role IN ('customer', 'mitra', 'admin')),
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MITRA / PARTNER
-- ============================================

CREATE TABLE categories (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name      TEXT NOT NULL UNIQUE,
  icon      TEXT,  -- icon name dari Lucide
  slug      TEXT NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE partners (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  business_name   TEXT NOT NULL,
  description     TEXT,
  address         TEXT NOT NULL,
  city            TEXT NOT NULL,
  latitude        DECIMAL(10, 8),
  longitude       DECIMAL(11, 8),
  phone           TEXT,
  logo_url        TEXT,
  banner_url      TEXT,
  category_id     UUID REFERENCES categories(id),
  operational_hours JSONB,  -- {"mon": {"open": "08:00", "close": "21:00"}, ...}
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'rejected')),
  rejection_reason TEXT,
  avg_rating      DECIMAL(3,2) DEFAULT 0,
  total_reviews   INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data kategori
INSERT INTO categories (name, icon, slug, sort_order) VALUES
('Restoran', 'utensils', 'restoran', 1),
('Bakeri & Pastri', 'croissant', 'bakeri', 2),
('Kafe & Minuman', 'coffee', 'kafe', 3),
('Makanan Sehat', 'salad', 'sehat', 4),
('Fast Food', 'hamburger', 'fast-food', 5),
('Asian Food', 'bowl-steaming', 'asian', 6);

-- ============================================
-- RESCUE BAGS
-- ============================================

CREATE TABLE rescue_bags (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id      UUID REFERENCES partners(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  content_hint    TEXT,  -- "Perkiraan isi: roti, croissant, atau pastri assorted"
  image_url       TEXT,
  original_price  INTEGER NOT NULL,  -- dalam Rupiah
  rescue_price    INTEGER NOT NULL,  -- dalam Rupiah
  quantity_total  INTEGER NOT NULL DEFAULT 1,
  quantity_sold   INTEGER DEFAULT 0,
  pickup_start    TIME NOT NULL,  -- e.g., "18:00"
  pickup_end      TIME NOT NULL,  -- e.g., "20:00"
  available_date  DATE NOT NULL,
  status          TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold_out', 'cancelled', 'expired')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  
  -- Computed / denormalized
  quantity_remaining INTEGER GENERATED ALWAYS AS (quantity_total - quantity_sold) STORED
);

-- ============================================
-- ORDERS
-- ============================================

CREATE TABLE orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     UUID REFERENCES profiles(id),
  partner_id      UUID REFERENCES partners(id),
  bag_id          UUID REFERENCES rescue_bags(id),
  quantity        INTEGER NOT NULL DEFAULT 1,
  unit_price      INTEGER NOT NULL,
  total_price     INTEGER NOT NULL,
  pickup_code     TEXT NOT NULL UNIQUE,  -- 6-digit alphanumeric
  qr_code_url     TEXT,
  status          TEXT DEFAULT 'pending' CHECK (
                    status IN ('pending', 'confirmed', 'ready', 'completed', 'cancelled')
                  ),
  payment_method  TEXT,
  payment_status  TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  notes           TEXT,
  completed_at    TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ,
  cancel_reason   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REVIEWS
-- ============================================

CREATE TABLE reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID REFERENCES orders(id) UNIQUE,
  customer_id UUID REFERENCES profiles(id),
  partner_id  UUID REFERENCES partners(id),
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  is_flagged  BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id),
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  type        TEXT,  -- 'order', 'promo', 'system', 'review'
  is_read     BOOLEAN DEFAULT false,
  data        JSONB,  -- payload tambahan (e.g., order_id)
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PLATFORM STATS (untuk impact counter)
-- ============================================

CREATE TABLE platform_stats (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date                DATE NOT NULL UNIQUE DEFAULT CURRENT_DATE,
  bags_rescued        INTEGER DEFAULT 0,
  kg_food_saved       DECIMAL(10,2) DEFAULT 0,
  co2_avoided_kg      DECIMAL(10,2) DEFAULT 0,
  total_transactions  INTEGER DEFAULT 0,
  total_revenue       BIGINT DEFAULT 0
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE rescue_bags ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Untuk development/MVP, kita buat policy public/open sementara agar frontend mudah dibuat
-- Nanti kita akan kunci lagi sesuai kebutuhan
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Partners are viewable by everyone." ON partners FOR SELECT USING (true);
CREATE POLICY "Mitra can insert own partner." ON partners FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Mitra can update own partner." ON partners FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Categories are viewable by everyone." ON categories FOR SELECT USING (true);

CREATE POLICY "Rescue bags are viewable by everyone." ON rescue_bags FOR SELECT USING (true);
CREATE POLICY "Mitra can insert own bags." ON rescue_bags FOR INSERT WITH CHECK (partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid()));
CREATE POLICY "Mitra can update own bags." ON rescue_bags FOR UPDATE USING (partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own orders." ON orders FOR SELECT USING (auth.uid() = customer_id OR partner_id IN (SELECT id FROM partners WHERE user_id = auth.uid()));
CREATE POLICY "Customers can create orders." ON orders FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Reviews viewable by everyone." ON reviews FOR SELECT USING (true);
CREATE POLICY "Customers can create reviews." ON reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);
