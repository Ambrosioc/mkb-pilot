-- Add INSERT policies for brands and models tables
-- Migration: 20250703030000_add_brands_models_insert_policies

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all users to read brands" ON brands;
DROP POLICY IF EXISTS "Allow all users to read models" ON models;

-- Recreate SELECT policies
CREATE POLICY "Allow all users to read brands" ON brands FOR SELECT USING (true);
CREATE POLICY "Allow all users to read models" ON models FOR SELECT USING (true);

-- Add INSERT policies for authenticated users
CREATE POLICY "Allow authenticated users to insert brands" ON brands 
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert models" ON models 
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Add UPDATE policies for authenticated users
CREATE POLICY "Allow authenticated users to update brands" ON brands 
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update models" ON models 
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Add DELETE policies for authenticated users
CREATE POLICY "Allow authenticated users to delete brands" ON brands 
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete models" ON models 
    FOR DELETE USING (auth.role() = 'authenticated');

-- Add comments explaining the policies
COMMENT ON POLICY "Allow all users to read brands" ON brands IS 'Allows all users to read brand information';
COMMENT ON POLICY "Allow authenticated users to insert brands" ON brands IS 'Allows authenticated users to create new brands';
COMMENT ON POLICY "Allow authenticated users to update brands" ON brands IS 'Allows authenticated users to update brand information';
COMMENT ON POLICY "Allow authenticated users to delete brands" ON brands IS 'Allows authenticated users to delete brands';

COMMENT ON POLICY "Allow all users to read models" ON models IS 'Allows all users to read model information';
COMMENT ON POLICY "Allow authenticated users to insert models" ON models IS 'Allows authenticated users to create new models';
COMMENT ON POLICY "Allow authenticated users to update models" ON models IS 'Allows authenticated users to update model information';
COMMENT ON POLICY "Allow authenticated users to delete models" ON models IS 'Allows authenticated users to delete models'; 