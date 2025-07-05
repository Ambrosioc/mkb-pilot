-- Fix sales_documents vehicle_id column type to match cars_v2 UUID type
-- This migration changes the vehicle_id column from BIGINT to UUID to match the cars_v2 table

-- First, drop the existing foreign key constraint
ALTER TABLE IF EXISTS sales_documents 
DROP CONSTRAINT IF EXISTS sales_documents_vehicle_id_fkey;

-- Change the column type from BIGINT to UUID
ALTER TABLE IF EXISTS sales_documents 
ALTER COLUMN vehicle_id TYPE UUID USING vehicle_id::text::uuid;

-- Add the correct foreign key constraint to cars_v2 table
ALTER TABLE IF EXISTS sales_documents 
ADD CONSTRAINT sales_documents_vehicle_id_fkey 
FOREIGN KEY (vehicle_id) REFERENCES cars_v2(id) ON DELETE SET NULL;

-- Recreate the index for the new UUID type
DROP INDEX IF EXISTS idx_sales_documents_vehicle_id;
CREATE INDEX IF NOT EXISTS idx_sales_documents_vehicle_id ON sales_documents(vehicle_id);

-- Add comment to clarify the relationship
COMMENT ON COLUMN sales_documents.vehicle_id IS 'Reference to cars_v2 table (UUID)';
