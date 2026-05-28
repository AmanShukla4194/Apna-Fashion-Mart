-- Apna Fashion Mart — PostgreSQL Schema for RDS Aurora
-- Run this once on a fresh database to set up all tables, indexes, and functions.

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- for gen_random_uuid()

-- ============================================================
-- TYPES
-- ============================================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'vendor', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'awaiting', 'paid', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('cod', 'razorpay', 'upi', 'card', 'netbanking');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE return_status AS ENUM ('requested', 'approved', 'rejected', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'order_placed', 'order_confirmed', 'order_shipped', 'order_delivered',
    'order_cancelled', 'return_requested', 'return_approved', 'review_posted',
    'promo', 'general'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- PROFILES (mirrors Cognito users; id = Cognito sub UUID)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  full_name     VARCHAR(255),
  phone         VARCHAR(20),
  avatar_url    TEXT,
  role          user_role NOT NULL DEFAULT 'customer',
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role  ON profiles(role);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(120) UNIQUE NOT NULL,
  description TEXT,
  image_url   TEXT,
  parent_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order  INTEGER DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_parent   ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug     ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active   ON categories(is_active);

-- ============================================================
-- SHOPS
-- ============================================================
CREATE TABLE IF NOT EXISTS shops (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
  name          VARCHAR(255) NOT NULL,
  description   TEXT,
  logo_url      TEXT,
  banner_url    TEXT,
  address       TEXT NOT NULL,
  city          VARCHAR(100) NOT NULL,
  state         VARCHAR(100),
  pincode       VARCHAR(10),
  phone         VARCHAR(20),
  email         VARCHAR(255),
  location      GEOMETRY(Point, 4326),   -- PostGIS: (longitude, latitude)
  rating        NUMERIC(3,2) DEFAULT 0,
  review_count  INTEGER DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  is_featured   BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shops_owner      ON shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_shops_category   ON shops(category_id);
CREATE INDEX IF NOT EXISTS idx_shops_active     ON shops(is_active);
CREATE INDEX IF NOT EXISTS idx_shops_featured   ON shops(is_featured);
CREATE INDEX IF NOT EXISTS idx_shops_location   ON shops USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_shops_name_trgm  ON shops USING GIN(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_shops_city       ON shops(city);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id         UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  price           NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  sale_price      NUMERIC(12,2) CHECK (sale_price >= 0),
  images          JSONB NOT NULL DEFAULT '[]',
  stock_quantity  INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  tags            JSONB NOT NULL DEFAULT '[]',
  avg_rating      NUMERIC(3,2) DEFAULT 0,
  review_count    INTEGER DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  is_featured     BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_shop        ON products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_category    ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active      ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured    ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_price       ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm   ON products USING GIN(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_tags        ON products USING GIN(tags);

-- ============================================================
-- ADDRESSES
-- ============================================================
CREATE TABLE IF NOT EXISTS addresses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label       VARCHAR(50) NOT NULL DEFAULT 'Home',
  street      TEXT NOT NULL,
  city        VARCHAR(100) NOT NULL,
  state       VARCHAR(100) NOT NULL DEFAULT '',
  pincode     VARCHAR(10) NOT NULL,
  is_default  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_one_default_per_user EXCLUDE USING btree (user_id WITH =) WHERE (is_default = true) DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  address_id            UUID REFERENCES addresses(id) ON DELETE SET NULL,
  status                order_status NOT NULL DEFAULT 'pending',
  total_amount          NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
  payment_method        payment_method NOT NULL DEFAULT 'cod',
  payment_status        payment_status NOT NULL DEFAULT 'pending',
  razorpay_order_id     VARCHAR(255),
  razorpay_payment_id   VARCHAR(255),
  notes                 TEXT,
  created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user      ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status    ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment   ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created   ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay  ON orders(razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  shop_id     UUID NOT NULL REFERENCES shops(id) ON DELETE RESTRICT,
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  unit_price  NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
  total_price NUMERIC(12,2) NOT NULL CHECK (total_price >= 0),
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order   ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_shop    ON order_items(shop_id);

-- ============================================================
-- CART ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS cart_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity    INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_cart_user_product UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_user    ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_product ON cart_items(product_id);

-- ============================================================
-- WISHLIST
-- ============================================================
CREATE TABLE IF NOT EXISTS wishlist (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_wishlist_user_product UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_user    ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product ON wishlist(product_id);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  shop_id     UUID REFERENCES shops(id) ON DELETE CASCADE,
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_review_target CHECK (
    (shop_id IS NOT NULL AND product_id IS NULL)
    OR (shop_id IS NULL AND product_id IS NOT NULL)
  ),
  CONSTRAINT uq_review_user_shop    UNIQUE (user_id, shop_id) DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT uq_review_user_product UNIQUE (user_id, product_id) DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS idx_reviews_user    ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_shop    ON reviews(shop_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating  ON reviews(rating);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type        notification_type NOT NULL DEFAULT 'general',
  title       VARCHAR(255) NOT NULL,
  message     TEXT,
  data        JSONB,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user       ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read       ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created    ON notifications(created_at DESC);

-- ============================================================
-- RETURNS
-- ============================================================
CREATE TABLE IF NOT EXISTS returns (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  order_item_id   UUID REFERENCES order_items(id) ON DELETE SET NULL,
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  reason          TEXT NOT NULL,
  description     TEXT,
  images          JSONB DEFAULT '[]',
  status          return_status NOT NULL DEFAULT 'requested',
  refund_amount   NUMERIC(12,2),
  admin_notes     TEXT,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_returns_order  ON returns(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_user   ON returns(user_id);
CREATE INDEX IF NOT EXISTS idx_returns_status ON returns(status);

-- ============================================================
-- FUNCTION: nearby_shops
-- Returns shops within radius_km of (lat, lng), sorted by distance.
-- Usage: SELECT * FROM nearby_shops(28.6139, 77.2090, 5.0);
-- ============================================================
CREATE OR REPLACE FUNCTION nearby_shops(
  lat       FLOAT,
  lng       FLOAT,
  radius_km FLOAT
)
RETURNS TABLE (
  id            UUID,
  name          VARCHAR(255),
  description   TEXT,
  logo_url      TEXT,
  banner_url    TEXT,
  address       TEXT,
  city          VARCHAR(100),
  state         VARCHAR(100),
  pincode       VARCHAR(10),
  phone         VARCHAR(20),
  rating        NUMERIC(3,2),
  review_count  INTEGER,
  category_id   UUID,
  owner_id      UUID,
  latitude      DOUBLE PRECISION,
  longitude     DOUBLE PRECISION,
  distance_km   NUMERIC
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    s.id,
    s.name,
    s.description,
    s.logo_url,
    s.banner_url,
    s.address,
    s.city,
    s.state,
    s.pincode,
    s.phone,
    s.rating,
    s.review_count,
    s.category_id,
    s.owner_id,
    ST_Y(s.location::geometry)     AS latitude,
    ST_X(s.location::geometry)     AS longitude,
    ROUND(
      (ST_Distance(
        s.location::geography,
        ST_MakePoint(lng, lat)::geography
      ) / 1000.0)::NUMERIC, 2
    ) AS distance_km
  FROM shops s
  WHERE
    s.is_active = true
    AND s.location IS NOT NULL
    AND ST_DWithin(
      s.location::geography,
      ST_MakePoint(lng, lat)::geography,
      radius_km * 1000
    )
  ORDER BY
    ST_Distance(s.location::geography, ST_MakePoint(lng, lat)::geography) ASC;
$$;

-- ============================================================
-- TRIGGERS: auto-update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DO $$ DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles', 'categories', 'shops', 'products',
    'addresses', 'orders', 'cart_items', 'reviews', 'returns'
  ]
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS set_updated_at ON %I;
      CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
    ', t, t);
  END LOOP;
END $$;

-- ============================================================
-- SEED: default categories
-- ============================================================
INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Men''s Clothing',    'mens-clothing',    'Shirts, trousers, suits and more for men',       1),
  ('Women''s Clothing',  'womens-clothing',  'Sarees, kurtis, dresses and more for women',     2),
  ('Kids'' Clothing',    'kids-clothing',    'Clothing for children of all ages',               3),
  ('Ethnic Wear',        'ethnic-wear',      'Traditional Indian ethnic wear',                  4),
  ('Western Wear',       'western-wear',     'Western-style fashion and casualwear',            5),
  ('Accessories',        'accessories',      'Belts, bags, jewellery, scarves and more',        6),
  ('Footwear',           'footwear',         'Shoes, sandals, chappals and boots',              7),
  ('Sportswear',         'sportswear',       'Activewear and sports clothing',                  8),
  ('Innerwear',          'innerwear',        'Undergarments and nightwear',                     9),
  ('Seasonal',           'seasonal',         'Festival specials and seasonal collections',     10)
ON CONFLICT (slug) DO NOTHING;
