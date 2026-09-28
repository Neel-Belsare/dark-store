-- ==============================================================================
-- Aurangabad Quick-Commerce Ecosystem: Supabase Database Schema
-- Project URL: https://wovfqutzuppauwretoiw.supabase.co
-- ==============================================================================

-- 1. Enable PostGIS Extension (Optional, useful for geospatial queries)
CREATE EXTENSION IF NOT EXISTS postgis;

-- ------------------------------------------------------------------------------
-- 2. Dark Stores Table (12 Aurangabad Quick-Commerce Hubs)
-- ------------------------------------------------------------------------------
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

-- Seed Dark Stores (Upsert with ON CONFLICT)
INSERT INTO public.dark_stores (store_id, store_name, coverage_area, latitude, longitude, delivery_radius_km, status)
VALUES
    ('store-1-cidco', 'Store 1 - CIDCO Hub', 'CIDCO N-1 to N-7, Cannaught, Town Centre', 19.8735, 75.3621, 3.0, 'Active'),
    ('store-2-garkheda', 'Store 2 - Garkheda Point', 'Garkheda, Ulkanagari, Sutgirni Chowk', 19.8596, 75.3512, 3.2, 'Active'),
    ('store-3-nirala', 'Store 3 - Nirala Central', 'Nirala Bazar, Samarth Nagar, Khadkeshwar', 19.8821, 75.3245, 2.5, 'Active'),
    ('store-4-waluj', 'Store 4 - Waluj Industrial', 'Waluj MIDC, Ranjangaon, Kamlapur', 19.8327, 75.2285, 4.5, 'Active'),
    ('store-5-chikalthana', 'Store 5 - Chikalthana Express', 'Chikalthana MIDC, Airport Road, Mukundwadi', 19.8752, 75.3951, 3.5, 'Active'),
    ('store-6-beedbypass', 'Store 6 - Beed Bypass Corridor', 'Beed Bypass, MIT College, Satara Parisar', 19.8450, 75.3410, 3.5, 'Active'),
    ('store-7-osmanpura', 'Store 7 - Osmanpura Hub', 'Osmanpura, Kranti Chowk, Station Road', 19.8680, 75.3230, 2.8, 'Active'),
    ('store-8-sevenhills', 'Store 8 - Seven Hills Junction', 'Seven Hills, Jalna Road, Akashwani', 19.8722, 75.3540, 2.8, 'Active'),
    ('store-9-hudco', 'Store 9 - HUDCO North', 'HUDCO, TV Centre, N-8 to N-12', 19.9050, 75.3480, 3.2, 'Active'),
    ('store-10-railway', 'Store 10 - Railway Station / Vedant', 'Vedant Nagar, Padampura, Bansilal Nagar', 19.8580, 75.3190, 2.8, 'Active'),
    ('store-11-shahgunj', 'Store 11 - Shahgunj Old City', 'Shahgunj, City Chowk, Gulmandi', 19.8860, 75.3340, 2.2, 'Active'),
    ('store-12-shendra', 'Store 12 - Shendra DMIC (AURIC)', 'AURIC City, Shendra MIDC, Kumbhephal', 19.8850, 75.4850, 5.0, 'Proposed')
ON CONFLICT (store_id) DO UPDATE 
SET 
    store_name = EXCLUDED.store_name,
    coverage_area = EXCLUDED.coverage_area,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    delivery_radius_km = EXCLUDED.delivery_radius_km,
    status = EXCLUDED.status;

-- ------------------------------------------------------------------------------
-- 3. Orders Table (Single-Active Pipeline + Real-Time Telemetry)
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

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON public.orders(order_id);

-- ------------------------------------------------------------------------------
-- 4. Order Line Items Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT REFERENCES public.orders(order_id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DOUBLE PRECISION DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- ------------------------------------------------------------------------------
-- 5. Enable Supabase Realtime for Orders
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'orders'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 6. Row Level Security (RLS) & Policies
-- ------------------------------------------------------------------------------
ALTER TABLE public.dark_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Allow read access to all users (public)
CREATE POLICY "Public Read Dark Stores" ON public.dark_stores FOR SELECT USING (true);
CREATE POLICY "Public Read Orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public Read Order Items" ON public.order_items FOR SELECT USING (true);

-- Allow full access for anon & service_role
CREATE POLICY "Anon Full Access Orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon Full Access Order Items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service Role Full Access Stores" ON public.dark_stores FOR ALL USING (true) WITH CHECK (true);
