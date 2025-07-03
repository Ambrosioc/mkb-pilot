-- Simplify user references to use auth.uid() directly
-- Migration: 20250702235500_fix_postgrest_relations

-- 1. Supprimer toutes les politiques qui dépendent de cars_v2.user_id
DROP POLICY IF EXISTS "Users can insert advertisements for their vehicles" ON advertisements;
DROP POLICY IF EXISTS "Users can update advertisements for their vehicles" ON advertisements;
DROP POLICY IF EXISTS "Users can delete advertisements for their vehicles" ON advertisements;
DROP POLICY IF EXISTS "Users can insert their own vehicles" ON cars_v2;
DROP POLICY IF EXISTS "Users can update their own vehicles" ON cars_v2;
DROP POLICY IF EXISTS "Users can delete their own vehicles" ON cars_v2;
DROP POLICY IF EXISTS "Users can insert their own post logs" ON post_logs;

-- Remove foreign key constraints to auth.users since we'll use auth.uid() directly
ALTER TABLE cars_v2 DROP CONSTRAINT IF EXISTS cars_v2_user_id_fkey;
ALTER TABLE cars_v2 DROP CONSTRAINT IF EXISTS cars_v2_posted_by_user_fkey;
ALTER TABLE post_logs DROP CONSTRAINT IF EXISTS post_logs_user_id_fkey;

-- Change user_id columns to just store the UUID without foreign key constraint
-- This allows us to use auth.uid() directly in RLS policies
ALTER TABLE cars_v2 ALTER COLUMN user_id TYPE UUID;
ALTER TABLE cars_v2 ALTER COLUMN posted_by_user TYPE UUID;
ALTER TABLE post_logs ALTER COLUMN user_id TYPE UUID;

-- Recreate RLS policies using auth.uid() directly
CREATE POLICY "Users can insert their own vehicles" ON cars_v2
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own vehicles" ON cars_v2
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own vehicles" ON cars_v2
    FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own post logs" ON post_logs
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert advertisements for their vehicles" ON advertisements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM cars_v2 
            WHERE cars_v2.id = advertisements.car_id 
            AND cars_v2.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can update advertisements for their vehicles" ON advertisements
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM cars_v2 
            WHERE cars_v2.id = advertisements.car_id 
            AND cars_v2.user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can delete advertisements for their vehicles" ON advertisements
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM cars_v2 
            WHERE cars_v2.id = advertisements.car_id 
            AND cars_v2.user_id::text = auth.uid()::text
        )
    );

-- Add comments to clarify the relationship
COMMENT ON COLUMN cars_v2.user_id IS 'UUID of the user who owns this vehicle (from auth.uid())';
COMMENT ON COLUMN cars_v2.posted_by_user IS 'UUID of the user who posted this vehicle (from auth.uid())';
COMMENT ON COLUMN post_logs.user_id IS 'UUID of the user who created this post log (from auth.uid())';

-- Add comments for other foreign key relationships
COMMENT ON COLUMN cars_v2.brand_id IS '@foreignKey (brands.id)';
COMMENT ON COLUMN cars_v2.model_id IS '@foreignKey (models.id)';
COMMENT ON COLUMN cars_v2.car_type_id IS '@foreignKey (car_types.id)';
COMMENT ON COLUMN cars_v2.fuel_type_id IS '@foreignKey (fuel_types.id)';
COMMENT ON COLUMN cars_v2.dealer_id IS '@foreignKey (dealers.id)';
COMMENT ON COLUMN cars_v2.dossier_type_id IS '@foreignKey (dossier_types.id)';

COMMENT ON COLUMN models.brand_id IS '@foreignKey (brands.id)';

COMMENT ON COLUMN advertisements.car_id IS '@foreignKey (cars_v2.id)';
COMMENT ON COLUMN post_logs.car_id IS '@foreignKey (cars_v2.id)';

COMMENT ON COLUMN user_roles.role_id IS '@foreignKey (roles.id)';
COMMENT ON COLUMN historique_acces.ancien_role_id IS '@foreignKey (roles.id)';
COMMENT ON COLUMN historique_acces.nouveau_role_id IS '@foreignKey (roles.id)';

-- Add comments for sales_documents if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sales_documents') THEN
        EXECUTE 'COMMENT ON COLUMN sales_documents.vehicle_id IS ''@foreignKey (cars_v2.id)''';
    END IF;
END $$; 