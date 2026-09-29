-- ==============================================================================
-- Aurangabad Quick-Commerce Ecosystem: Supabase Database Schema
-- Project URL: https://wovfqutzuppauwretoiw.supabase.co
-- Tables: stores, dark_stores, riders, users, orders, order_items
-- ==============================================================================

-- 1. Enable PostGIS Extension (Optional, useful for geospatial queries)
CREATE EXTENSION IF NOT EXISTS postgis;

-- ------------------------------------------------------------------------------
-- 2. STORES / DARK STORES TABLE (12 Aurangabad Quick-Commerce Hubs)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT UNIQUE NOT NULL,
    store_name TEXT NOT NULL,
    brand TEXT DEFAULT 'Blinkit',
    coverage_area TEXT,
    manager_name TEXT,
    manager_phone TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    delivery_radius_km DOUBLE PRECISION DEFAULT 3.0,
    active_riders INT DEFAULT 8,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backward compatibility table for dark_stores
CREATE TABLE IF NOT EXISTS public.dark_stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT UNIQUE NOT NULL,
    store_name TEXT NOT NULL,
    coverage_area TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    delivery_radius_km DOUBLE PRECISION DEFAULT 3.0,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed stores (Upsert with ON CONFLICT)
INSERT INTO public.stores (store_id, store_name, brand, coverage_area, manager_name, manager_phone, latitude, longitude, delivery_radius_km, active_riders, status)
VALUES
    ('store-1-cidco', 'Store 1 - CIDCO Hub', 'Blinkit', 'CIDCO N-1 to N-7, Cannaught, Town Centre', 'Rajesh Sharma', '+91 98220 11223', 19.8735, 75.3621, 3.0, 12, 'Active'),
    ('store-2-garkheda', 'Store 2 - Garkheda Point', 'Zepto', 'Garkheda, Ulkanagari, Sutgirni Chowk', 'Sachin Kulkarni', '+91 98220 22334', 19.8596, 75.3512, 3.2, 10, 'Active'),
    ('store-3-nirala', 'Store 3 - Nirala Central', 'Blinkit', 'Nirala Bazar, Samarth Nagar, Khadkeshwar', 'Aniket Deshpande', '+91 98220 33445', 19.8821, 75.3245, 2.5, 9, 'Active'),
    ('store-4-waluj', 'Store 4 - Waluj Industrial', 'Instamart', 'Waluj MIDC, Ranjangaon, Kamlapur', 'Mahendra Pawar', '+91 98220 44556', 19.8327, 75.2285, 4.5, 14, 'Active'),
    ('store-5-chikalthana', 'Store 5 - Chikalthana Express', 'Blinkit', 'Chikalthana MIDC, Airport Road, Mukundwadi', 'Vikas Shinde', '+91 98220 55667', 19.8752, 75.3951, 3.5, 11, 'Active'),
    ('store-6-beedbypass', 'Store 6 - Beed Bypass Corridor', 'Zepto', 'Beed Bypass, MIT College, Satara Parisar', 'Sunil Jadhav', '+91 98220 66778', 19.8450, 75.3410, 3.5, 10, 'Active'),
    ('store-7-osmanpura', 'Store 7 - Osmanpura Hub', 'Blinkit', 'Osmanpura, Kranti Chowk, Station Road', 'Deepak More', '+91 98220 77889', 19.8680, 75.3230, 2.8, 8, 'Active'),
    ('store-8-sevenhills', 'Store 8 - Seven Hills Junction', 'Zepto', 'Seven Hills, Jalna Road, Akashwani', 'Pradeep Salve', '+91 98220 88990', 19.8722, 75.3540, 2.8, 9, 'Active'),
    ('store-9-hudco', 'Store 9 - HUDCO North', 'Instamart', 'HUDCO, TV Centre, N-8 to N-12', 'Rahul Wagh', '+91 98220 99001', 19.9050, 75.3480, 3.2, 8, 'Active'),
    ('store-10-railway', 'Store 10 - Railway Station / Vedant', 'Blinkit', 'Vedant Nagar, Padampura, Bansilal Nagar', 'Vinod Chavan', '+91 98220 00112', 19.8580, 75.3190, 2.8, 7, 'Active'),
    ('store-11-shahgunj', 'Store 11 - Shahgunj Old City', 'Zepto', 'Shahgunj, City Chowk, Gulmandi', 'Aslam Sheikh', '+91 98220 12345', 19.8860, 75.3340, 2.2, 8, 'Active'),
    ('store-12-shendra', 'Store 12 - Shendra DMIC (AURIC)', 'Blinkit', 'AURIC City, Shendra MIDC, Kumbhephal', 'Nitin Kale', '+91 98220 67890', 19.8850, 75.4850, 5.0, 6, 'Proposed')
ON CONFLICT (store_id) DO UPDATE 
SET 
    store_name = EXCLUDED.store_name,
    brand = EXCLUDED.brand,
    coverage_area = EXCLUDED.coverage_area,
    manager_name = EXCLUDED.manager_name,
    manager_phone = EXCLUDED.manager_phone,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    delivery_radius_km = EXCLUDED.delivery_radius_km,
    active_riders = EXCLUDED.active_riders,
    status = EXCLUDED.status;

-- Seed dark_stores mirror table
INSERT INTO public.dark_stores (store_id, store_name, coverage_area, latitude, longitude, delivery_radius_km, status)
SELECT store_id, store_name, coverage_area, latitude, longitude, delivery_radius_km, status FROM public.stores
ON CONFLICT (store_id) DO UPDATE 
SET 
    store_name = EXCLUDED.store_name,
    coverage_area = EXCLUDED.coverage_area,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    delivery_radius_km = EXCLUDED.delivery_radius_km,
    status = EXCLUDED.status;

-- ------------------------------------------------------------------------------
-- 3. RIDERS TABLE (Aurangabad Quick-Commerce Delivery Fleet)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.riders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rider_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    vehicle_type TEXT DEFAULT 'EV Scooter',
    vehicle_number TEXT,
    current_lat DOUBLE PRECISION,
    current_lon DOUBLE PRECISION,
    assigned_store_id TEXT REFERENCES public.stores(store_id),
    speed_kmh DOUBLE PRECISION DEFAULT 28.0,
    rating DOUBLE PRECISION DEFAULT 4.85,
    total_deliveries INT DEFAULT 0,
    active_orders_count INT DEFAULT 0,
    status TEXT DEFAULT 'available',           -- 'available', 'delivering', 'idle', 'offline'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Riders
INSERT INTO public.riders (rider_id, name, phone, vehicle_type, vehicle_number, current_lat, current_lon, assigned_store_id, speed_kmh, rating, total_deliveries, active_orders_count, status)
VALUES
    ('rider-101', 'Suresh Patil', '+91 98901 11001', 'EV Scooter', 'MH-20-EV-1024', 19.8738, 75.3625, 'store-1-cidco', 28.0, 4.92, 1420, 0, 'available'),
    ('rider-102', 'Ramesh Shinde', '+91 98901 11002', 'ICE Motorcycle', 'MH-20-CZ-4512', 19.8601, 75.3518, 'store-2-garkheda', 32.0, 4.88, 980, 1, 'delivering'),
    ('rider-103', 'Amit Kulkarni', '+91 98901 11003', 'EV Scooter', 'MH-20-EV-2048', 19.8825, 75.3250, 'store-3-nirala', 26.5, 4.95, 2150, 0, 'available'),
    ('rider-104', 'Rahul Deshmukh', '+91 98901 11004', 'ICE Motorcycle', 'MH-20-BK-7890', 19.8335, 75.2290, 'store-4-waluj', 34.0, 4.78, 840, 0, 'available'),
    ('rider-105', 'Pooja Jadhav', '+91 98901 11005', 'EV Scooter', 'MH-20-EV-3311', 19.8755, 75.3955, 'store-5-chikalthana', 29.0, 4.96, 1670, 0, 'available'),
    ('rider-106', 'Ganesh Kale', '+91 98901 11006', 'ICE Motorcycle', 'MH-20-DJ-1122', 19.8455, 75.3415, 'store-6-beedbypass', 30.0, 4.82, 610, 1, 'delivering'),
    ('rider-107', 'Santosh Gaikwad', '+91 98901 11007', 'EV Scooter', 'MH-20-EV-4422', 19.8685, 75.3235, 'store-7-osmanpura', 27.5, 4.91, 1890, 0, 'available'),
    ('rider-108', 'Ajay Sonawane', '+91 98901 11008', 'E-Bike', 'MH-20-EB-9901', 19.8725, 75.3545, 'store-8-sevenhills', 24.0, 4.87, 530, 0, 'available'),
    ('rider-109', 'Mahendra Chavan', '+91 98901 11009', 'EV Scooter', 'MH-20-EV-5533', 19.9055, 75.3485, 'store-9-hudco', 28.5, 4.84, 1120, 0, 'available'),
    ('rider-110', 'Nitin Pawar', '+91 98901 11010', 'ICE Motorcycle', 'MH-20-EF-6644', 19.8585, 75.3195, 'store-10-railway', 31.0, 4.79, 740, 0, 'available'),
    ('rider-111', 'Imran Khan', '+91 98901 11011', 'EV Scooter', 'MH-20-EV-7755', 19.8865, 75.3345, 'store-11-shahgunj', 25.0, 4.93, 1340, 0, 'available'),
    ('rider-112', 'Balaji Bhosale', '+91 98901 11012', 'ICE Motorcycle', 'MH-20-GH-8866', 19.8855, 75.4855, 'store-12-shendra', 33.0, 4.81, 420, 0, 'idle')
ON CONFLICT (rider_id) DO UPDATE
SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    vehicle_type = EXCLUDED.vehicle_type,
    vehicle_number = EXCLUDED.vehicle_number,
    current_lat = EXCLUDED.current_lat,
    current_lon = EXCLUDED.current_lon,
    assigned_store_id = EXCLUDED.assigned_store_id,
    speed_kmh = EXCLUDED.speed_kmh,
    rating = EXCLUDED.rating,
    total_deliveries = EXCLUDED.total_deliveries,
    active_orders_count = EXCLUDED.active_orders_count,
    status = EXCLUDED.status;

-- ------------------------------------------------------------------------------
-- 4. USERS TABLE (Aurangabad Quick-Commerce Registered Consumers)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT UNIQUE NOT NULL,
    primary_address TEXT,
    default_lat DOUBLE PRECISION,
    default_lon DOUBLE PRECISION,
    loyalty_tier TEXT DEFAULT 'Bronze',         -- 'Gold', 'Silver', 'Bronze'
    total_orders INT DEFAULT 0,
    wallet_balance DOUBLE PRECISION DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Users
INSERT INTO public.users (user_id, full_name, email, phone, primary_address, default_lat, default_lon, loyalty_tier, total_orders, wallet_balance)
VALUES
    ('user-001', 'Neel Belsare', 'neel.belsare@example.com', '+91 98765 43210', 'CIDCO N-4, Near Cannaught Garden, Aurangabad', 19.8760, 75.3640, 'Gold', 47, 350.0),
    ('user-002', 'Mansi Gaike', 'mansi.gaike@example.com', '+91 98765 43211', 'Nirala Bazar, Near City Pride, Aurangabad', 19.8830, 75.3260, 'Gold', 39, 240.0),
    ('user-003', 'Rohan Sharma', 'rohan.sharma@example.com', '+91 98765 43212', 'Garkheda Parisar, Near Sutgirni Chowk, Aurangabad', 19.8590, 75.3520, 'Silver', 22, 110.0),
    ('user-004', 'Priya Joshi', 'priya.joshi@example.com', '+91 98765 43213', 'Osmanpura, Near Station Road, Aurangabad', 19.8670, 75.3220, 'Silver', 18, 90.0),
    ('user-005', 'Vikram Patel', 'vikram.patel@example.com', '+91 98765 43214', 'Seven Hills, Jalna Road, Aurangabad', 19.8715, 75.3535, 'Bronze', 6, 0.0),
    ('user-006', 'Sneha Kulkarni', 'sneha.kulkarni@example.com', '+91 98765 43215', 'HUDCO N-9, TV Centre Road, Aurangabad', 19.9040, 75.3470, 'Bronze', 9, 45.0),
    ('user-007', 'Aditya Deshpande', 'aditya.deshpande@example.com', '+91 98765 43216', 'Beed Bypass, Near MIT College, Aurangabad', 19.8460, 75.3420, 'Silver', 15, 180.0)
ON CONFLICT (user_id) DO UPDATE
SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    primary_address = EXCLUDED.primary_address,
    default_lat = EXCLUDED.default_lat,
    default_lon = EXCLUDED.default_lon,
    loyalty_tier = EXCLUDED.loyalty_tier,
    total_orders = EXCLUDED.total_orders,
    wallet_balance = EXCLUDED.wallet_balance;

-- ------------------------------------------------------------------------------
-- 5. ORDERS TABLE (Single-Active Pipeline + Real-Time Telemetry)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active',              -- 'active', 'completed', 'cancelled'
    customer_name TEXT DEFAULT 'Neel Belsare',
    customer_phone TEXT DEFAULT '+91 98765 43210',
    delivery_address TEXT DEFAULT 'CIDCO, Aurangabad',
    cust_lat DOUBLE PRECISION NOT NULL,
    cust_lon DOUBLE PRECISION NOT NULL,
    assigned_store TEXT NOT NULL,
    store_lat DOUBLE PRECISION,
    store_lon DOUBLE PRECISION,
    coverage_area TEXT,
    distance_km DOUBLE PRECISION,
    base_eta_mins DOUBLE PRECISION,
    eta_mins DOUBLE PRECISION,
    weather TEXT DEFAULT 'Clear',
    traffic TEXT DEFAULT 'Moderate',
    order_val DOUBLE PRECISION DEFAULT 320.0,
    rider TEXT DEFAULT 'Suresh Patil (Speed: 28 km/h)',
    delivery_notes TEXT DEFAULT 'Leave at door',
    substitution_preference TEXT DEFAULT 'similar',
    items JSONB DEFAULT '[]'::jsonb,
    warehouse_pick_plan JSONB DEFAULT '{}'::jsonb,
    source TEXT DEFAULT 'Mobile App (GPS Live)',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Seed Sample Orders (Past completed orders)
INSERT INTO public.orders (order_id, status, customer_name, customer_phone, delivery_address, cust_lat, cust_lon, assigned_store, store_lat, store_lon, coverage_area, distance_km, base_eta_mins, eta_mins, weather, traffic, order_val, rider, items, source, created_at, completed_at)
VALUES
    ('CSN-HIST-1001', 'completed', 'Neel Belsare', '+91 98765 43210', 'CIDCO N-4, Near Cannaught, Aurangabad', 19.8760, 75.3640, 'Store 1 - CIDCO Hub', 19.8735, 75.3621, 'CIDCO N-1 to N-7', 0.95, 6.2, 7.0, 'Clear', 'Low', 450.0, 'Suresh Patil', '[{"name": "Amul Taaza Toned Milk", "quantity": 2, "price": 27.0}, {"name": "Britannia Whole Wheat Bread", "quantity": 1, "price": 45.0}]'::jsonb, 'Mobile App (GPS Live)', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 48 minutes'),
    ('CSN-HIST-1002', 'completed', 'Mansi Gaike', '+91 98765 43211', 'Nirala Bazar, Samarth Nagar, Aurangabad', 19.8830, 75.3260, 'Store 3 - Nirala Central', 19.8821, 75.3245, 'Nirala Bazar', 0.65, 5.0, 6.0, 'Clear', 'Moderate', 680.0, 'Amit Kulkarni', '[{"name": "Aashirvaad Atta 5kg", "quantity": 1, "price": 260.0}, {"name": "Tata Tea Gold 500g", "quantity": 1, "price": 310.0}]'::jsonb, 'Mobile App (Netlify Web/Expo)', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '51 minutes')
ON CONFLICT (order_id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 6. ORDER LINE ITEMS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT REFERENCES public.orders(order_id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DOUBLE PRECISION DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed sample items
INSERT INTO public.order_items (order_id, item_name, quantity, unit_price)
VALUES
    ('CSN-HIST-1001', 'Amul Taaza Toned Milk', 2, 27.0),
    ('CSN-HIST-1001', 'Britannia Whole Wheat Bread', 1, 45.0),
    ('CSN-HIST-1002', 'Aashirvaad Atta 5kg', 1, 260.0),
    ('CSN-HIST-1002', 'Tata Tea Gold 500g', 1, 310.0)
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------------------------
-- 7. Indexes
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_stores_status ON public.stores(status);
CREATE INDEX IF NOT EXISTS idx_riders_status ON public.riders(status);
CREATE INDEX IF NOT EXISTS idx_riders_assigned_store ON public.riders(assigned_store_id);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON public.orders(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- ------------------------------------------------------------------------------
-- 8. Enable Realtime Publications
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'riders'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.riders;
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 9. Row Level Security (RLS) & Policies
-- ------------------------------------------------------------------------------
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dark_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all tables
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public Read Stores" ON public.stores;
    DROP POLICY IF EXISTS "Public Read Dark Stores" ON public.dark_stores;
    DROP POLICY IF EXISTS "Public Read Riders" ON public.riders;
    DROP POLICY IF EXISTS "Public Read Users" ON public.users;
    DROP POLICY IF EXISTS "Public Read Orders" ON public.orders;
    DROP POLICY IF EXISTS "Public Read Order Items" ON public.order_items;
    DROP POLICY IF EXISTS "Anon Full Access Orders" ON public.orders;
    DROP POLICY IF EXISTS "Anon Full Access Order Items" ON public.order_items;
    DROP POLICY IF EXISTS "Anon Full Access Users" ON public.users;
    DROP POLICY IF EXISTS "Anon Full Access Riders" ON public.riders;
    DROP POLICY IF EXISTS "Service Role Full Access Stores" ON public.stores;
    DROP POLICY IF EXISTS "Service Role Full Access Dark Stores" ON public.dark_stores;
END $$;

CREATE POLICY "Public Read Stores" ON public.stores FOR SELECT USING (true);
CREATE POLICY "Public Read Dark Stores" ON public.dark_stores FOR SELECT USING (true);
CREATE POLICY "Public Read Riders" ON public.riders FOR SELECT USING (true);
CREATE POLICY "Public Read Users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Public Read Orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public Read Order Items" ON public.order_items FOR SELECT USING (true);

-- Allow full access for anon & service_role
CREATE POLICY "Anon Full Access Orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon Full Access Order Items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon Full Access Users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon Full Access Riders" ON public.riders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access Stores" ON public.stores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access Dark Stores" ON public.dark_stores FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 10. SMART INVENTORY & STOCKOUT ALERTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id TEXT,
    store_name TEXT NOT NULL,
    sku_id TEXT NOT NULL,
    sku_name TEXT NOT NULL,
    category TEXT,
    unit TEXT,
    unit_price NUMERIC(10, 2) DEFAULT 0.00,
    current_stock INT NOT NULL DEFAULT 50,
    critical_threshold INT NOT NULL DEFAULT 10,
    low_stock_threshold INT NOT NULL DEFAULT 20,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_store_sku UNIQUE (store_name, sku_id)
);

-- Seed initial inventory for CIDCO Hub & core stores
INSERT INTO public.store_inventory (store_name, sku_id, sku_name, category, unit, unit_price, current_stock, critical_threshold, low_stock_threshold)
VALUES
    ('Store 1 - CIDCO Hub', 'SKU-MILK-500', 'Amul Taaza Toned Fresh Milk', 'Dairy & Breakfast', '500ml', 27.00, 60, 12, 25),
    ('Store 1 - CIDCO Hub', 'SKU-BREAD-400', 'Britannia 100% Whole Wheat Bread', 'Bakery', '400g', 45.00, 45, 10, 20),
    ('Store 1 - CIDCO Hub', 'SKU-ATTA-5KG', 'Aashirvaad Superior MP Sharbati Atta', 'Staples & Grains', '5kg', 260.00, 35, 8, 16),
    ('Store 1 - CIDCO Hub', 'SKU-TEA-500', 'Tata Tea Gold Leaf Tea', 'Beverages', '500g', 310.00, 40, 10, 20),
    ('Store 1 - CIDCO Hub', 'SKU-CHIPS-50', 'Lay''s India''s Magic Masala Chips', 'Snacks & Munchies', '50g', 20.00, 80, 18, 35),
    ('Store 1 - CIDCO Hub', 'SKU-OIL-1L', 'Fortune Sunlite Refined Sunflower Oil', 'Cooking Oils', '1L', 145.00, 50, 10, 22),
    ('Store 1 - CIDCO Hub', 'SKU-EGGS-6', 'Eggoz Farm Fresh White Eggs', 'Dairy & Breakfast', '6 pcs', 75.00, 45, 10, 20),
    ('Store 1 - CIDCO Hub', 'SKU-COLA-750', 'Coca-Cola Original Taste', 'Beverages & Cold Drinks', '750ml', 40.00, 70, 15, 30)
ON CONFLICT (store_name, sku_id) DO UPDATE
SET 
    current_stock = EXCLUDED.current_stock,
    updated_at = NOW();

-- Enable RLS and add public access policies for store_inventory
ALTER TABLE public.store_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Store Inventory" ON public.store_inventory FOR SELECT USING (true);
CREATE POLICY "Anon Full Access Store Inventory" ON public.store_inventory FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime publication for store_inventory
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'store_inventory'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.store_inventory;
    END IF;
END $$;
