-- UFL E-COMMERCE DATABASE SCHEMA (SUPABASE/POSTGRES)

-- 1. Create Products Table (FMCG Focus)
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price BIGINT NOT NULL,          -- Product price for SAP reconciliation
    category TEXT NOT NULL DEFAULT 'General', -- Gala, Supreme, Swan Water, etc.
    image_url TEXT,
    inventory_count INTEGER DEFAULT 0,
    is_best_seller BOOLEAN DEFAULT false,    -- For featured section
    sku_format TEXT DEFAULT 'carton',       -- 'carton', 'pack', 'piece'
    pickup_location TEXT,
    delivery_timeframe TEXT,
    status TEXT DEFAULT 'available',         -- 'available', 'out_of_stock'
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create Orders Table
CREATE TABLE orders (
    id TEXT PRIMARY KEY, -- Custom format: UFL-YYYYMMDD-XXXX (for SAP)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT,
    
    -- Financial tracking (Separation for SAP)
    total_amount BIGINT NOT NULL,           -- Product Price + Delivery Fee (Total Customer Pay)
    product_amount BIGINT NOT NULL,         -- Pure product revenue
    delivery_fee BIGINT NOT NULL,           -- Separated delivery fee
    
    payment_status TEXT DEFAULT 'pending',  -- 'pending', 'verified', 'failed'
    delivery_status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'shipped', 'delivered'
    payment_gateway_ref TEXT,               -- Monnify/OPay Transaction ID
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create Order Items (Multi-product support)
CREATE TABLE order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    name TEXT NOT NULL,                     -- Snapshot at time of order
    sku_format TEXT,                        -- Snapshot at time of order
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price BIGINT NOT NULL,
    total_price BIGINT NOT NULL             -- quantity * unit_price
);

-- 4. Create Delivery Pricing Table (Variable rates)
CREATE TABLE delivery_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    location_name TEXT NOT NULL UNIQUE,
    fee BIGINT NOT NULL
);

-- 5. Create Admin Table (Optional, for dashboard access)
CREATE TABLE admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    role TEXT DEFAULT 'staff' -- 'admin', 'staff'
);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_locations ENABLE ROW LEVEL SECURITY;

-- 7. Create Policies
-- Public view for products and locations
CREATE POLICY "Public Read Access Products" ON products FOR SELECT USING (true);
CREATE POLICY "Public Read Access Locations" ON delivery_locations FOR SELECT USING (true);

-- Public insert (orders and items)
CREATE POLICY "Public Insert Access Orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Access Order Items" ON order_items FOR INSERT WITH CHECK (true);

-- Admin only for updates and deletes (Assuming admin role check is handled via logic or specific policy)
-- For development, we allow all (Replace with proper Auth roles in production)
CREATE POLICY "Allow all for authenticated users" ON products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON orders FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON order_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all for authenticated users" ON delivery_locations FOR ALL USING (auth.role() = 'authenticated');
