-- Cleanup and reorganize migrations
-- Migration: 20250702235000_cleanup_and_reorganize

-- This migration cleans up any remaining conflicts from previous migrations
-- and ensures the database is in a clean state

-- Drop any duplicate or conflicting triggers
DROP TRIGGER IF EXISTS ensure_ref_auto_on_cars_v2 ON cars_v2;
DROP TRIGGER IF EXISTS ensure_reference_on_cars_v2 ON cars_v2;
DROP TRIGGER IF EXISTS set_ref_auto ON cars_v2;

-- Drop any duplicate or conflicting functions
DROP FUNCTION IF EXISTS split_full_name(text);

-- Ensure all sequences are properly set
SELECT setval('cars_v2_reference_seq', 1, false);

-- Add any missing constraints that might have been missed
DO $$
BEGIN
    -- Add unique constraint on cars_v2.reference if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'cars_v2_reference_key' 
        AND table_name = 'cars_v2'
    ) THEN
        ALTER TABLE cars_v2 ADD CONSTRAINT cars_v2_reference_key UNIQUE (reference);
    END IF;
END $$;

-- Ensure all tables have the correct structure
-- This is a safety check to make sure all required columns exist
DO $$
BEGIN
    -- Check if cars_v2 has all required columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cars_v2' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE cars_v2 ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cars_v2' AND column_name = 'location'
    ) THEN
        ALTER TABLE cars_v2 ADD COLUMN location TEXT DEFAULT 'FR';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cars_v2' AND column_name = 'status'
    ) THEN
        ALTER TABLE cars_v2 ADD COLUMN status TEXT DEFAULT 'disponible' CHECK (status IN ('disponible', 'vendue', 'en attente', 'annulée', 'prêt à poster'));
    END IF;
END $$;

-- Final verification and cleanup
COMMENT ON TABLE cars_v2 IS 'Table principale pour les véhicules avec toutes les informations nécessaires';
COMMENT ON TABLE advertisements IS 'Table pour les annonces liées aux véhicules';
COMMENT ON TABLE brands IS 'Table de référence pour les marques de véhicules';
COMMENT ON TABLE models IS 'Table de référence pour les modèles de véhicules';
COMMENT ON TABLE car_types IS 'Table de référence pour les types de véhicules';
COMMENT ON TABLE fuel_types IS 'Table de référence pour les types de carburant';
COMMENT ON TABLE dealers IS 'Table de référence pour les concessionnaires';
COMMENT ON TABLE dossier_types IS 'Table de référence pour les types de dossiers'; 