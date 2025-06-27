/*
  # Automatic Vehicle Reference Generation

  1. New Features
    - Add ref_auto column to cars_v2 table
    - Create sequence for vehicle reference numbers
    - Create function to generate vehicle references in format AB00001
    - Set default value for ref_auto column to use the generator function
    - Add uniqueness constraint to ref_auto column

  2. Changes
    - Modify cars_v2 table structure
    - Add trigger to handle reference generation on insert
*/

-- Create sequence for vehicle reference numbers if it doesn't exist
CREATE SEQUENCE IF NOT EXISTS vehicle_ref_sequence;

-- Create function to generate vehicle references
CREATE OR REPLACE FUNCTION generate_vehicle_ref()
RETURNS TEXT AS $$
DECLARE
    seq_val BIGINT;
    prefix_num INT;
    prefix TEXT;
    suffix INT;
    first_letter CHAR;
    second_letter CHAR;
BEGIN
    -- Get next value from sequence
    SELECT nextval('vehicle_ref_sequence') INTO seq_val;
    
    -- Calculate which prefix we're on (each prefix handles 100,000 values)
    -- AB = 0-99999, AC = 100000-199999, etc.
    prefix_num := FLOOR(seq_val / 100000);
    
    -- Calculate the numeric part (modulo 100000, then add 1 to start from 00001)
    suffix := (seq_val % 100000) + 1;
    
    -- Calculate the two letters for the prefix
    -- First letter: A + (prefix_num / 26)
    -- Second letter: A + (prefix_num % 26)
    first_letter := CHR(65 + (prefix_num / 26)::INT);
    second_letter := CHR(65 + (prefix_num % 26)::INT);
    
    -- Combine to form the prefix
    prefix := first_letter || second_letter;
    
    -- Return the formatted reference (prefix + 5-digit number with leading zeros)
    RETURN prefix || LPAD(suffix::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Add ref_auto column to cars_v2 table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'cars_v2' AND column_name = 'ref_auto'
    ) THEN
        -- Add the column with default value from the generator function
        ALTER TABLE cars_v2 ADD COLUMN ref_auto TEXT DEFAULT generate_vehicle_ref();
        
        -- Add uniqueness constraint
        ALTER TABLE cars_v2 ADD CONSTRAINT cars_v2_ref_auto_unique UNIQUE (ref_auto);
    END IF;
END $$;

-- Create trigger to ensure ref_auto is set on insert if not provided
CREATE OR REPLACE FUNCTION set_ref_auto_if_null()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ref_auto IS NULL THEN
        NEW.ref_auto := generate_vehicle_ref();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS ensure_ref_auto_on_cars_v2 ON cars_v2;

-- Create the trigger
CREATE TRIGGER ensure_ref_auto_on_cars_v2
    BEFORE INSERT ON cars_v2
    FOR EACH ROW
    EXECUTE FUNCTION set_ref_auto_if_null();

-- Add comment explaining the column
COMMENT ON COLUMN cars_v2.ref_auto IS 'Unique vehicle reference in format AB00001, automatically generated';