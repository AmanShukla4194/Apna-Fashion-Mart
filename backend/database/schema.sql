-- =============================================================================
-- Apna Fashion Mart — PostgreSQL Schema
-- Database: afm_db  |  Region: ap-south-1  |  Engine: Aurora Serverless v2
-- =============================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- trigram search on product names
CREATE EXTENSION IF NOT EXISTS "postgis";       -- geospatial queries for nearby shops

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE user_role        AS ENUM ('customer', 'vendor', 'admin');
CREATE TYPE order_status     AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_status   AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE payment_method   AS ENUM ('razorpay', 'cod', 'upi', 'card', 'netbanking');
CREATE TYPE return_status    AS ENUM ('requested', 'approved', 'picked_up', 'refunded', 'rejected');
CREATE TYPE return_reason    AS ENUM ('wrong_item', 'damaged', 'not_as_described', 'size_issue', 'changed_mind', 'other');
CREATE TYPE shop_status      AS ENUM ('pending', 'active', 'suspended', 'closed');
CREATE TYPE product_status   AS ENUM ('draft', 'active', 'out_of_stock', 'archived');
CREATE TYPE notification_type AS ENUM ('order', 'promo', 'system', 'return', 'wishlist');
CREATE TYPE address_type     AS ENUM ('home', 'work', 'other');

-- =============================================================================
-- USERS / AUTH
-- (Cognito is the source of truth for auth; this mirrors user profile data)
-- =============================================================================

CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cognito_sub         VARCHAR(128) UNIQUE NOT NULL,   -- Cognito User Pool "sub" claim
    email               VARCHAR(320) UNIQUE NOT NULL,
    full_name           VARCHAR(200) NOT NULL,
    phone               VARCHAR(20),
    role                user_role NOT NULL DEFAULT 'customer',
    avatar_url          TEXT,
    city                VARCHAR(100),
    style_preferences   TEXT[],                         -- e.g. ['ethnic','western']
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_cognito_sub ON users(cognito_sub);
CREATE INDEX idx_users_email       ON users(email);
CREATE INDEX idx_users_role        ON users(role);

-- =============================================================================
-- CATEGORIES
-- =============================================================================

CREATE TABLE categories (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) UNIQUE NOT NULL,
    slug        VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    image_url   TEXT,
    parent_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
    sort_order  INT NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_slug      ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);

-- =============================================================================
-- SHOPS (Vendor stores)
-- =============================================================================

CREATE TABLE shops (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    slug            VARCHAR(200) UNIQUE NOT NULL,
    description     TEXT,
    logo_url        TEXT,
    banner_url      TEXT,
    phone           VARCHAR(20),
    email           VARCHAR(320),
    address_line1   VARCHAR(300),
    address_line2   VARCHAR(300),
    city            VARCHAR(100) NOT NULL,
    state           VARCHAR(100),
    pincode         VARCHAR(10),
    location        GEOGRAPHY(POINT, 4326),             -- PostGIS point (lng, lat)
    opening_hours   JSONB,                              -- {"mon":"10:00-20:00", ...}
    tags            TEXT[],
    status          shop_status NOT NULL DEFAULT 'pending',
    is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
    avg_rating      NUMERIC(3,2) NOT NULL DEFAULT 0,
    review_count    INT NOT NULL DEFAULT 0,
    product_count   INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shops_vendor_id ON shops(vendor_id);
CREATE INDEX idx_shops_city      ON shops(city);
CREATE INDEX idx_shops_status    ON shops(status);
CREATE INDEX idx_shops_location  ON shops USING GIST(location);
CREATE INDEX idx_shops_slug      ON shops(slug);

-- =============================================================================
-- PRODUCTS
-- =============================================================================

CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id         UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
    name            VARCHAR(300) NOT NULL,
    slug            VARCHAR(300) NOT NULL,
    description     TEXT,
    price           INT NOT NULL CHECK (price >= 0),    -- in paise (₹1 = 100 paise)
    compare_price   INT CHECK (compare_price >= 0),     -- original/MRP price
    sku             VARCHAR(100),
    images          TEXT[],                             -- S3/CloudFront URLs
    sizes           TEXT[],                             -- ['XS','S','M','L','XL','XXL']
    colors          TEXT[],
    material        VARCHAR(200),
    gender          VARCHAR(20),                        -- 'women','men','kids','unisex'
    tags            TEXT[],
    attributes      JSONB,                              -- flexible key-value pairs
    stock_quantity  INT NOT NULL DEFAULT 0,
    status          product_status NOT NULL DEFAULT 'draft',
    avg_rating      NUMERIC(3,2) NOT NULL DEFAULT 0,
    review_count    INT NOT NULL DEFAULT 0,
    is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(shop_id, slug)
);

CREATE INDEX idx_products_shop_id     ON products(shop_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status      ON products(status);
CREATE INDEX idx_products_is_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_price       ON products(price);
CREATE INDEX idx_products_name_trgm   ON products USING GIN(name gin_trgm_ops);  -- fuzzy search

-- =============================================================================
-- ADDRESSES
-- =============================================================================

CREATE TABLE addresses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            address_type NOT NULL DEFAULT 'home',
    full_name       VARCHAR(200) NOT NULL,
    phone           VARCHAR(20) NOT NULL,
    line1           VARCHAR(300) NOT NULL,
    line2           VARCHAR(300),
    city            VARCHAR(100) NOT NULL,
    state           VARCHAR(100) NOT NULL,
    pincode         VARCHAR(10) NOT NULL,
    country         VARCHAR(100) NOT NULL DEFAULT 'India',
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_addresses_user_id ON addresses(user_id);

-- =============================================================================
-- ORDERS
-- =============================================================================

CREATE TABLE orders (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number        VARCHAR(20) UNIQUE NOT NULL,    -- e.g. AFM-20260001
    user_id             UUID NOT NULL REFERENCES users(id),
    shop_id             UUID NOT NULL REFERENCES shops(id),
    address_id          UUID REFERENCES addresses(id) ON DELETE SET NULL,
    -- Snapshot of address at order time
    shipping_address    JSONB NOT NULL,
    status              order_status NOT NULL DEFAULT 'pending',
    payment_status      payment_status NOT NULL DEFAULT 'pending',
    payment_method      payment_method,
    razorpay_order_id   VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    subtotal            INT NOT NULL,                   -- in paise
    delivery_fee        INT NOT NULL DEFAULT 0,
    discount            INT NOT NULL DEFAULT 0,
    total               INT NOT NULL,
    notes               TEXT,
    cancelled_reason    TEXT,
    delivered_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id       ON orders(user_id);
CREATE INDEX idx_orders_shop_id       ON orders(shop_id);
CREATE INDEX idx_orders_status        ON orders(status);
CREATE INDEX idx_orders_order_number  ON orders(order_number);
CREATE INDEX idx_orders_created_at    ON orders(created_at DESC);

-- =============================================================================
-- ORDER ITEMS
-- =============================================================================

CREATE TABLE order_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id),
    -- Snapshot of product at order time
    product_name    VARCHAR(300) NOT NULL,
    product_image   TEXT,
    size            VARCHAR(20),
    color           VARCHAR(50),
    quantity        INT NOT NULL CHECK (quantity > 0),
    unit_price      INT NOT NULL,                       -- in paise at time of order
    total_price     INT NOT NULL
);

CREATE INDEX idx_order_items_order_id   ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- =============================================================================
-- REVIEWS
-- =============================================================================

CREATE TABLE reviews (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id),
    order_id    UUID REFERENCES orders(id) ON DELETE SET NULL,
    rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title       VARCHAR(200),
    body        TEXT,
    images      TEXT[],
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,         -- verified purchase
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(product_id, user_id, order_id)
);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id    ON reviews(user_id);
CREATE INDEX idx_reviews_rating     ON reviews(rating);

-- =============================================================================
-- WISHLIST
-- =============================================================================

CREATE TABLE wishlist (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE INDEX idx_wishlist_user_id ON wishlist(user_id);

-- =============================================================================
-- RETURNS
-- =============================================================================

CREATE TABLE returns (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id        UUID NOT NULL REFERENCES orders(id),
    order_item_id   UUID NOT NULL REFERENCES order_items(id),
    user_id         UUID NOT NULL REFERENCES users(id),
    reason          return_reason NOT NULL,
    description     TEXT,
    images          TEXT[],
    status          return_status NOT NULL DEFAULT 'requested',
    refund_amount   INT,                                -- in paise
    refund_id       VARCHAR(100),                       -- Razorpay refund ID
    resolved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_returns_order_id  ON returns(order_id);
CREATE INDEX idx_returns_user_id   ON returns(user_id);
CREATE INDEX idx_returns_status    ON returns(status);

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================

CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        notification_type NOT NULL,
    title       VARCHAR(200) NOT NULL,
    body        TEXT NOT NULL,
    data        JSONB,                                  -- deep-link payload
    is_read     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id   ON notifications(user_id);
CREATE INDEX idx_notifications_is_read   ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created   ON notifications(created_at DESC);

-- =============================================================================
-- CART ITEMS (server-side cart sync — mobile also keeps local copy)
-- =============================================================================

CREATE TABLE cart_items (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size        VARCHAR(20),
    color       VARCHAR(50),
    quantity    INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, product_id, size, color)
);

CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);

-- =============================================================================
-- TRIGGERS — auto-update updated_at
-- =============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at        BEFORE UPDATE ON users        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_shops_updated_at        BEFORE UPDATE ON shops        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_products_updated_at     BEFORE UPDATE ON products     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_orders_updated_at       BEFORE UPDATE ON orders       FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_addresses_updated_at    BEFORE UPDATE ON addresses    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_reviews_updated_at      BEFORE UPDATE ON reviews      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_returns_updated_at      BEFORE UPDATE ON returns      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_cart_items_updated_at   BEFORE UPDATE ON cart_items   FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- TRIGGERS — auto-update shop ratings and product counts
-- =============================================================================

CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products SET
        avg_rating   = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)),
        review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id))
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reviews_update_product_rating
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_product_rating();

CREATE OR REPLACE FUNCTION update_shop_product_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE shops SET
        product_count = (SELECT COUNT(*) FROM products WHERE shop_id = COALESCE(NEW.shop_id, OLD.shop_id) AND status = 'active')
    WHERE id = COALESCE(NEW.shop_id, OLD.shop_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_update_shop_count
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW EXECUTE FUNCTION update_shop_product_count();

-- =============================================================================
-- SEED — default categories
-- =============================================================================

INSERT INTO categories (name, slug, sort_order) VALUES
    ('Kurtas & Suits',  'kurtas-suits',  1),
    ('Sarees',          'sarees',        2),
    ('Lehengas',        'lehengas',      3),
    ('Anarkalis',       'anarkalis',     4),
    ('Dupattas',        'dupattas',      5),
    ('Bottoms',         'bottoms',       6),
    ('Tops & Tunics',   'tops-tunics',   7),
    ('Ethnic Sets',     'ethnic-sets',   8),
    ('Men''s Kurtas',   'mens-kurtas',   9),
    ('Sherwanis',       'sherwanis',     10),
    ('Indo-Western',    'indo-western',  11),
    ('Accessories',     'accessories',   12),
    ('Footwear',        'footwear',      13),
    ('Jewellery',       'jewellery',     14),
    ('Kids'' Wear',     'kids-wear',     15);
