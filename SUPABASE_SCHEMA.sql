-- SQL SCHEMA FOR SUPABASE
-- Run these in your Supabase SQL Editor to set up the database

-- 1. Create Products Table
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    price BIGINT NOT NULL,
    seller_price BIGINT,
    seller_name TEXT,
    description TEXT,
    location TEXT,
    category TEXT DEFAULT 'Furniture',
    image TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'available', -- 'available', 'reserved', 'sold', 'out_of_stock'
    delivery_timeframe TEXT,
    is_reserved BOOLEAN DEFAULT false
);

-- 2. Create Orders Table
CREATE TABLE orders (
    id TEXT PRIMARY KEY, -- Custom format: SR-2024-XXXX
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    product_id UUID REFERENCES products(id),
    product_name TEXT,
    product_image TEXT,
    seller_name TEXT,
    amount BIGINT NOT NULL,
    seller_agreed_price BIGINT,
    commission BIGINT,
    buyer_name TEXT NOT NULL,
    buyer_email TEXT,
    buyer_phone TEXT NOT NULL,
    buyer_address TEXT,
    payment_method TEXT, -- 'bank', 'paystack'
    delivery_method TEXT, -- 'assisted', 'self'
    status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'confirmed', 'shipped', 'delivered', 'completed'
    date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Enable Row Level Security (RLS)
-- Since this is an admin-managed app without auth for users:
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies (Allow all for anon for now, or set up Service Role)
CREATE POLICY "Allow public read access on products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on products" ON products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on products" ON products FOR DELETE USING (true);

CREATE POLICY "Allow public read access on orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on orders" ON orders FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on orders" ON orders FOR DELETE USING (true);
