/*
  # Add purchase_price field to cars_v2 table

  1. Changes
    - Add purchase_price column to cars_v2 table
    - Set numeric type with precision for currency values
*/

-- Add purchase_price column to cars_v2 table if it doesn't exist
DO $$ 
BEGIN
  -- Check if cars_v2 table exists first
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'cars_v2'
  ) THEN
    -- Then check if purchase_price column doesn't exist
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'cars_v2' AND column_name = 'purchase_price'
    ) THEN
      ALTER TABLE cars_v2 ADD COLUMN purchase_price numeric(12, 2);
    END IF;
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN cars_v2.purchase_price IS 'Purchase price of the vehicle';