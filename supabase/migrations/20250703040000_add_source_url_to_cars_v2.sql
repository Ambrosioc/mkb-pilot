-- Add source_url column to cars_v2 table
-- Migration: 20250703040000_add_source_url_to_cars_v2

-- Add source_url column
ALTER TABLE cars_v2 
ADD COLUMN source_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN cars_v2.source_url IS 'URL source du véhicule (obligatoire pour les véhicules ajoutés depuis le stock)'; 