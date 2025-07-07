/*
  # Add purchase fields to cars_v2 and remove price from advertisements

  1. Changes
    - Add purchase_date column to cars_v2 table
    - Add price column to cars_v2 table (moved from advertisements)
    - Remove price column from advertisements table
    - Update related schemas and types
*/

-- Add purchase_date column to cars_v2 table
DO $$ 
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'cars_v2'
  ) THEN
    -- Add purchase_date if it doesn't exist
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'cars_v2' AND column_name = 'purchase_date'
    ) THEN
      ALTER TABLE cars_v2 ADD COLUMN purchase_date DATE;
    END IF;
    
    -- Add price column to cars_v2 (moved from advertisements)
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'cars_v2' AND column_name = 'price'
    ) THEN
      ALTER TABLE cars_v2 ADD COLUMN price numeric(12, 2);
    END IF;
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN cars_v2.purchase_date IS 'Date when the vehicle was purchased';
COMMENT ON COLUMN cars_v2.price IS 'Price of the vehicle (moved from advertisements table)';

-- Remove price column from advertisements table
DO $$ 
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'advertisements'
  ) THEN
    -- Check if price column exists before removing
    IF EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'advertisements' AND column_name = 'price'
    ) THEN
      ALTER TABLE advertisements DROP COLUMN price;
    END IF;
  END IF;
END $$;

-- Add comment to clarify the change
COMMENT ON TABLE advertisements IS 'Vehicle advertisements - price moved to cars_v2 table'; 