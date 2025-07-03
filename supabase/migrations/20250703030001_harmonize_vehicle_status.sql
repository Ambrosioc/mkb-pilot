-- Harmonize vehicle status values with frontend
-- Migration: 20250703030001_harmonize_vehicle_status

-- Drop the existing check constraint
ALTER TABLE cars_v2 DROP CONSTRAINT IF EXISTS cars_v2_status_check;

-- Add new check constraint with the frontend status values
ALTER TABLE cars_v2 ADD CONSTRAINT cars_v2_status_check 
    CHECK (status IN ('disponible', 'reserve', 'vendu', 'a-verifier'));

-- Update the default value to match frontend
ALTER TABLE cars_v2 ALTER COLUMN status SET DEFAULT 'disponible';

-- Add comment explaining the status values
COMMENT ON COLUMN cars_v2.status IS 'Status values: disponible, reserve (Réservé), vendu, a-verifier (À Vérifier)';

-- Update any existing data that might have old status values
UPDATE cars_v2 SET status = 'disponible' WHERE status NOT IN ('disponible', 'reserve', 'vendu', 'a-verifier'); 