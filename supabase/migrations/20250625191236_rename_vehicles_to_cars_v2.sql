/*
  # Rename vehicles table to cars_v2

  1. Changes
    - Rename vehicles table to cars_v2
    - Update foreign key references
    - Update indexes
    - Update triggers
*/

-- Rename vehicles table to cars_v2
ALTER TABLE IF EXISTS vehicles RENAME TO cars_v2;

-- Update foreign key references in advertisements table
ALTER TABLE IF EXISTS advertisements 
DROP CONSTRAINT IF EXISTS advertisements_car_id_fkey;

ALTER TABLE IF EXISTS advertisements 
ADD CONSTRAINT advertisements_car_id_fkey 
FOREIGN KEY (car_id) REFERENCES cars_v2(id) ON DELETE CASCADE;

-- Update foreign key references in sales_documents table
ALTER TABLE IF EXISTS sales_documents 
DROP CONSTRAINT IF EXISTS sales_documents_vehicle_id_fkey;

ALTER TABLE IF EXISTS sales_documents 
ADD CONSTRAINT sales_documents_vehicle_id_fkey 
FOREIGN KEY (vehicle_id) REFERENCES cars_v2(id) ON DELETE SET NULL;

-- Update indexes
DROP INDEX IF EXISTS idx_advertisements_car_id;
CREATE INDEX IF NOT EXISTS idx_advertisements_car_id ON advertisements(car_id);

DROP INDEX IF EXISTS idx_sales_documents_vehicle_id;
CREATE INDEX IF NOT EXISTS idx_sales_documents_vehicle_id ON sales_documents(vehicle_id);

DROP INDEX IF EXISTS idx_vehicles_status;
CREATE INDEX IF NOT EXISTS idx_cars_v2_status ON cars_v2(status);

-- Update triggers
DROP TRIGGER IF EXISTS update_vehicles_updated_at ON cars_v2;
CREATE TRIGGER update_cars_v2_updated_at
BEFORE UPDATE ON cars_v2
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Add comment for documentation
COMMENT ON TABLE cars_v2 IS 'Main vehicles table (renamed from vehicles)'; 