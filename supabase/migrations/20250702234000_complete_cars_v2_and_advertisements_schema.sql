-- Complete schema for cars_v2 and advertisements tables
-- Migration: 20250702234000_complete_cars_v2_and_advertisements_schema

-- Create sequence for reference generation (starting from 1 for AB00001)
CREATE SEQUENCE IF NOT EXISTS cars_v2_reference_seq START WITH 1;

-- Drop existing tables if they exist (for clean slate)
DROP TABLE IF EXISTS advertisements CASCADE;
DROP TABLE IF EXISTS cars_v2 CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS models CASCADE;
DROP TABLE IF EXISTS car_types CASCADE;
DROP TABLE IF EXISTS fuel_types CASCADE;
DROP TABLE IF EXISTS dealers CASCADE;
DROP TABLE IF EXISTS dossier_types CASCADE;

-- Create reference tables first
CREATE TABLE brands (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE models (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER REFERENCES brands(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(brand_id, name)
);

CREATE TABLE car_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE fuel_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE dealers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    address TEXT,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE dossier_types (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cars_v2 table with all necessary columns
CREATE TABLE cars_v2 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reference TEXT UNIQUE DEFAULT 'AB' || lpad(nextval('cars_v2_reference_seq'::regclass)::text, 5, '0'),
    brand_id INTEGER REFERENCES brands(id) ON DELETE SET NULL,
    model_id INTEGER REFERENCES models(id) ON DELETE SET NULL,
    year INTEGER NOT NULL CHECK (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 1),
    first_registration TEXT, -- Format: MM/YYYY
    mileage INTEGER DEFAULT 0 CHECK (mileage >= 0),
    color TEXT,
    car_type_id INTEGER REFERENCES car_types(id) ON DELETE SET NULL,
    fuel_type_id INTEGER REFERENCES fuel_types(id) ON DELETE SET NULL,
    dealer_id INTEGER REFERENCES dealers(id) ON DELETE SET NULL,
    dossier_type_id INTEGER REFERENCES dossier_types(id) ON DELETE SET NULL,
    nb_doors INTEGER DEFAULT 5 CHECK (nb_doors IN (3, 4, 5)),
    nb_seats INTEGER DEFAULT 5 CHECK (nb_seats >= 2 AND nb_seats <= 9),
    gearbox TEXT CHECK (gearbox IN ('Manuelle', 'Automatique', 'Semi-automatique', 'Séquentielle')),
    din_power INTEGER CHECK (din_power >= 0),
    fiscal_power INTEGER CHECK (fiscal_power >= 0),
    price DECIMAL(10,2) DEFAULT 0 CHECK (price >= 0),
    purchase_price DECIMAL(10,2) DEFAULT 0 CHECK (purchase_price >= 0),
    location TEXT DEFAULT 'FR',
    description TEXT,
    status TEXT DEFAULT 'disponible' CHECK (status IN ('disponible', 'vendue', 'en attente', 'annulée', 'prêt à poster')),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    posted_by_user UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create advertisements table
CREATE TABLE advertisements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    car_id UUID REFERENCES cars_v2(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) DEFAULT 0 CHECK (price >= 0),
    photos TEXT[], -- Array of photo URLs/paths
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create post_logs table for tracking posts
CREATE TABLE IF NOT EXISTS post_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    car_id UUID REFERENCES cars_v2(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    post_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    platform TEXT, -- Optional: which platform was posted to
    status TEXT DEFAULT 'posted' CHECK (status IN ('posted', 'failed', 'pending'))
);

-- Create indexes for better performance
CREATE INDEX idx_brands_name ON brands(name);
CREATE INDEX idx_models_brand_id ON models(brand_id);
CREATE INDEX idx_models_name ON models(name);
CREATE INDEX idx_car_types_name ON car_types(name);
CREATE INDEX idx_fuel_types_name ON fuel_types(name);
CREATE INDEX idx_dealers_name ON dealers(name);
CREATE INDEX idx_dossier_types_name ON dossier_types(name);

CREATE INDEX idx_cars_v2_brand_id ON cars_v2(brand_id);
CREATE INDEX idx_cars_v2_model_id ON cars_v2(model_id);
CREATE INDEX idx_cars_v2_user_id ON cars_v2(user_id);
CREATE INDEX idx_cars_v2_status ON cars_v2(status);
CREATE INDEX idx_cars_v2_created_at ON cars_v2(created_at);
CREATE INDEX idx_cars_v2_price ON cars_v2(price);
CREATE INDEX idx_cars_v2_purchase_price ON cars_v2(purchase_price);
CREATE INDEX idx_cars_v2_reference ON cars_v2(reference);

CREATE INDEX idx_advertisements_car_id ON advertisements(car_id);
CREATE INDEX idx_advertisements_status ON advertisements(status);
CREATE INDEX idx_advertisements_created_at ON advertisements(created_at);

CREATE INDEX idx_post_logs_car_id ON post_logs(car_id);
CREATE INDEX idx_post_logs_user_id ON post_logs(user_id);
CREATE INDEX idx_post_logs_post_date ON post_logs(post_date);

-- Enable Row Level Security
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE dealers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dossier_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view all vehicles" ON cars_v2;
DROP POLICY IF EXISTS "Users can insert their own vehicles" ON cars_v2;
DROP POLICY IF EXISTS "Users can update their own vehicles" ON cars_v2;
DROP POLICY IF EXISTS "Users can delete their own vehicles" ON cars_v2;

DROP POLICY IF EXISTS "Users can view all advertisements" ON advertisements;
DROP POLICY IF EXISTS "Users can insert advertisements for their vehicles" ON advertisements;
DROP POLICY IF EXISTS "Users can update advertisements for their vehicles" ON advertisements;
DROP POLICY IF EXISTS "Users can delete advertisements for their vehicles" ON advertisements;

DROP POLICY IF EXISTS "Users can view all post logs" ON post_logs;
DROP POLICY IF EXISTS "Users can insert their own post logs" ON post_logs;

-- RLS Policies for reference tables (allow all authenticated users to read)
CREATE POLICY "Allow all users to read brands" ON brands FOR SELECT USING (true);
CREATE POLICY "Allow all users to read models" ON models FOR SELECT USING (true);
CREATE POLICY "Allow all users to read car_types" ON car_types FOR SELECT USING (true);
CREATE POLICY "Allow all users to read fuel_types" ON fuel_types FOR SELECT USING (true);
CREATE POLICY "Allow all users to read dealers" ON dealers FOR SELECT USING (true);
CREATE POLICY "Allow all users to read dossier_types" ON dossier_types FOR SELECT USING (true);

-- RLS Policies for cars_v2
CREATE POLICY "Users can view all vehicles" ON cars_v2
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own vehicles" ON cars_v2
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vehicles" ON cars_v2
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vehicles" ON cars_v2
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for advertisements
CREATE POLICY "Users can view all advertisements" ON advertisements
    FOR SELECT USING (true);

CREATE POLICY "Users can insert advertisements for their vehicles" ON advertisements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM cars_v2 
            WHERE cars_v2.id = advertisements.car_id 
            AND cars_v2.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update advertisements for their vehicles" ON advertisements
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM cars_v2 
            WHERE cars_v2.id = advertisements.car_id 
            AND cars_v2.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete advertisements for their vehicles" ON advertisements
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM cars_v2 
            WHERE cars_v2.id = advertisements.car_id 
            AND cars_v2.user_id = auth.uid()
        )
    );

-- RLS Policies for post_logs
CREATE POLICY "Users can view all post logs" ON post_logs
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own post logs" ON post_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_brands_updated_at 
    BEFORE UPDATE ON brands 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_models_updated_at 
    BEFORE UPDATE ON models 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_car_types_updated_at 
    BEFORE UPDATE ON car_types 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fuel_types_updated_at 
    BEFORE UPDATE ON fuel_types 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dealers_updated_at 
    BEFORE UPDATE ON dealers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dossier_types_updated_at 
    BEFORE UPDATE ON dossier_types 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cars_v2_updated_at 
    BEFORE UPDATE ON cars_v2 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advertisements_updated_at 
    BEFORE UPDATE ON advertisements 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate reference
CREATE OR REPLACE FUNCTION generate_car_reference()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.reference IS NULL OR NEW.reference = '' THEN
        NEW.reference := 'AB' || lpad(nextval('cars_v2_reference_seq'::regclass)::text, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for reference generation
CREATE TRIGGER generate_car_reference_trigger
    BEFORE INSERT ON cars_v2
    FOR EACH ROW EXECUTE FUNCTION generate_car_reference();

-- Insert some sample data for testing (optional)
-- INSERT INTO brands (name) VALUES ('Peugeot'), ('Renault'), ('Citroën'), ('Volkswagen'), ('BMW'), ('Mercedes');
-- INSERT INTO car_types (name) VALUES ('Berline'), ('SUV'), ('Break'), ('Citadine'), ('Utilitaire');
-- INSERT INTO fuel_types (name) VALUES ('Essence'), ('Diesel'), ('Électrique'), ('Hybride'), ('GPL');
-- INSERT INTO dealers (name) VALUES ('Concessionnaire Auto'), ('Garage Central'), ('Auto Plus');
-- INSERT INTO dossier_types (name) VALUES ('Standard'), ('Premium'), ('VIP'); 