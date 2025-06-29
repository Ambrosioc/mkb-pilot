/*
  # Fix Advertisements Table Reference

  This migration fixes the foreign key reference in the advertisements table
  to point to cars_v2(id) instead of vehicles(id), since the project uses
  cars_v2 as the main vehicles table.
*/

-- First, drop the existing foreign key constraint if it exists
ALTER TABLE advertisements DROP CONSTRAINT IF EXISTS advertisements_car_id_fkey;

-- Add the correct foreign key constraint to cars_v2
ALTER TABLE advertisements 
ADD CONSTRAINT advertisements_car_id_fkey 
FOREIGN KEY (car_id) REFERENCES cars_v2(id) ON DELETE CASCADE;

-- Add comment to clarify the relationship
COMMENT ON COLUMN advertisements.car_id IS 'References cars_v2.id - the main vehicles table'; 