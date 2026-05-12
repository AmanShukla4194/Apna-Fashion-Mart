-- ============================================================
-- Apna Fashion Mart — Supabase PostgreSQL Schema
-- Run this in: Supabase Dashboard > SQL Editor
-- Or via: supabase db push
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";  -- Location-based queries

-- ── Profiles ─────────────────────────────────────────────────────────────────
-- Extends Supabase auth.users with app-specific fields

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'vendor', 'admin')),
  phone TEXT,
  city TEXT,
  address TEXT,
  avatar TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  preferences JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Stores (Vendor Shops) ─────────────────────────────────────────────────────

CREATE TABLE public.stores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location GEOGRAPHY(POINT, 4326),       -- PostGIS for geospatial search
  phone TEXT,
  email TEXT,
  website TEXT,
  category TEXT[],
  images TEXT[],
  logo TEXT,
  banner TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  operating_hours JSONB NOT NULL DEFAULT '{}',
  rating DOUBLE PRECISION NOT NULL DEFAULT 0,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  total_products INTEGER NOT NULL DEFAULT 0,
  commission_rate DOUBLE PRECISION NOT NULL DEFAULT 0.10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Geospatial index for fast nearby queries
CREATE INDEX stores_location_idx ON public.stores USING GIST (location);
CREATE INDEX stores_city_idx ON public.stores (city);
CREATE INDEX stores_vendor_idx ON public.stores (vendor_id);

-- ── Products ──────────────────────────────────────────────────────────────────

CREATE TABLE public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  price DOUBLE PRECISION NOT NULL,
  original_price DOUBLE PRECISION,
  discount_percentage INTEGER NOT NULL DEFAULT 0,
  images TEXT[],
  category TEXT,
  sub_category TEXT,
  gender TEXT CHECK (gender IN ('men', 'women', 'kids', 'unisex')),
  sizes JSONB NOT NULL DEFAULT '[]',
  colors JSONB NOT NULL DEFAULT '[]',
  stock INTEGER NOT NULL DEFAULT 0,
  sku TEXT,
  tags TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  rating DOUBLE PRECISION NOT NULL DEFAULT 0,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  total_orders INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX products_store_idx ON public.products (store_id);
CREATE INDEX products_category_idx ON public.products (category);
CREATE INDEX products_gender_idx ON public.products (gender);
CREATE INDEX products_price_idx ON public.products (price);

-- ── Addresses ─────────────────────────────────────────────────────────────────

CREATE TABLE public.addresses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX addresses_user_idx ON public.addresses (user_id);

-- ── Orders ────────────────────────────────────────────────────────────────────

CREATE TABLE public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.profiles(id),
  store_id UUID NOT NULL REFERENCES public.stores(id),
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DOUBLE PRECISION NOT NULL,
  taxes DOUBLE PRECISION NOT NULL,
  delivery_fee DOUBLE PRECISION NOT NULL DEFAULT 0,
  total DOUBLE PRECISION NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod', 'online')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled')),
  delivery_address JSONB NOT NULL,
  notes TEXT,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX orders_customer_idx ON public.orders (customer_id);
CREATE INDEX orders_store_idx ON public.orders (store_id);
CREATE INDEX orders_status_idx ON public.orders (order_status);

-- ── Cart ──────────────────────────────────────────────────────────────────────

CREATE TABLE public.cart (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  size TEXT,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id, size, color)
);

CREATE INDEX cart_user_idx ON public.cart (user_id);

-- ── Wishlist ──────────────────────────────────────────────────────────────────

CREATE TABLE public.wishlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX wishlist_user_idx ON public.wishlist (user_id);

-- ── Reviews ───────────────────────────────────────────────────────────────────

CREATE TABLE public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT,
  images TEXT[],
  is_verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX reviews_product_idx ON public.reviews (product_id);
CREATE INDEX reviews_store_idx ON public.reviews (store_id);

-- ── Inquiries ─────────────────────────────────────────────────────────────────

CREATE TABLE public.inquiries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.profiles(id),
  store_id UUID NOT NULL REFERENCES public.stores(id),
  product_id UUID REFERENCES public.products(id),
  type TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('size', 'stock', 'availability', 'delivery', 'other', 'general')),
  subject TEXT,
  message TEXT NOT NULL,
  response TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'responded', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX inquiries_customer_idx ON public.inquiries (customer_id);
CREATE INDEX inquiries_store_idx ON public.inquiries (store_id);

-- ── Categories ────────────────────────────────────────────────────────────────

CREATE TABLE public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image TEXT,
  parent_id UUID REFERENCES public.categories(id),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default fashion categories
INSERT INTO public.categories (name, slug, sort_order) VALUES
  ('Men',           'men',            1),
  ('Women',         'women',          2),
  ('Kids',          'kids',           3),
  ('Ethnic Wear',   'ethnic-wear',    4),
  ('Western Wear',  'western-wear',   5),
  ('Streetwear',    'streetwear',     6),
  ('Luxury Fashion','luxury-fashion', 7),
  ('Footwear',      'footwear',       8),
  ('Accessories',   'accessories',    9);

-- ── Geospatial: Update store.location from lat/lng ────────────────────────────

CREATE OR REPLACE FUNCTION update_store_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location = ST_SetSRID(
      ST_MakePoint(NEW.longitude, NEW.latitude),
      4326
    )::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_store_location
  BEFORE INSERT OR UPDATE OF latitude, longitude ON public.stores
  FOR EACH ROW EXECUTE FUNCTION update_store_location();

-- ── Geospatial: Find nearby stores (core marketplace feature) ─────────────────

CREATE OR REPLACE FUNCTION nearby_stores(
  user_lat   DOUBLE PRECISION,
  user_lng   DOUBLE PRECISION,
  radius_km  DOUBLE PRECISION DEFAULT 10
)
RETURNS SETOF public.stores
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT s.*
  FROM public.stores s
  WHERE s.location IS NOT NULL
    AND s.is_active = TRUE
    AND ST_DWithin(
      s.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_km * 1000   -- convert km to meters
    )
  ORDER BY ST_Distance(
    s.location,
    ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
  );
END;
$$;

-- ── Auto-update review ratings on products and stores ─────────────────────────

CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.products
  SET
    rating = (SELECT COALESCE(AVG(rating)::NUMERIC(3,2), 0) FROM public.reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)),
    total_reviews = (SELECT COUNT(*) FROM public.reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id))
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Auto-update updated_at on all tables
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_stores_updated_at      BEFORE UPDATE ON public.stores      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_products_updated_at    BEFORE UPDATE ON public.products    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_orders_updated_at      BEFORE UPDATE ON public.orders      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_profiles_updated_at    BEFORE UPDATE ON public.profiles    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_inquiries_updated_at   BEFORE UPDATE ON public.inquiries   FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Auto-create profile on signup ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE public.profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Profiles are viewable by all" ON public.profiles FOR SELECT USING (TRUE);
CREATE POLICY "Users can update own profile"  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Stores
CREATE POLICY "Stores viewable by all"    ON public.stores FOR SELECT USING (TRUE);
CREATE POLICY "Vendors can create stores" ON public.stores FOR INSERT WITH CHECK (
  auth.uid() = vendor_id AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'vendor')
);
CREATE POLICY "Vendors update own stores" ON public.stores FOR UPDATE USING (vendor_id = auth.uid());
CREATE POLICY "Vendors delete own stores" ON public.stores FOR DELETE USING (vendor_id = auth.uid());
CREATE POLICY "Admin manage all stores"   ON public.stores FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Products
CREATE POLICY "Products viewable by all"    ON public.products FOR SELECT USING (TRUE);
CREATE POLICY "Vendors manage own products" ON public.products FOR ALL USING (vendor_id = auth.uid());
CREATE POLICY "Admin manage all products"   ON public.products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Orders
CREATE POLICY "Customers view own orders"  ON public.orders FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Vendors view store orders"  ON public.orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND vendor_id = auth.uid())
);
CREATE POLICY "Customers create orders"    ON public.orders FOR INSERT WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Admin manage all orders"    ON public.orders FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Cart
CREATE POLICY "Users manage own cart" ON public.cart FOR ALL USING (user_id = auth.uid());

-- Wishlist
CREATE POLICY "Users manage own wishlist" ON public.wishlist FOR ALL USING (user_id = auth.uid());

-- Addresses
CREATE POLICY "Users manage own addresses" ON public.addresses FOR ALL USING (user_id = auth.uid());

-- Reviews
CREATE POLICY "Reviews viewable by all"  ON public.reviews FOR SELECT USING (TRUE);
CREATE POLICY "Users create reviews"     ON public.reviews FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own reviews" ON public.reviews FOR UPDATE USING (user_id = auth.uid());

-- Inquiries
CREATE POLICY "Customers view own inquiries" ON public.inquiries FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Vendors view store inquiries" ON public.inquiries FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND vendor_id = auth.uid())
);
CREATE POLICY "Customers create inquiries"   ON public.inquiries FOR INSERT WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Vendors respond to inquiries" ON public.inquiries FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.stores WHERE id = store_id AND vendor_id = auth.uid())
);

-- Categories (public read, admin write)
CREATE POLICY "Categories viewable by all" ON public.categories FOR SELECT USING (TRUE);
CREATE POLICY "Admin manage categories"    ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
