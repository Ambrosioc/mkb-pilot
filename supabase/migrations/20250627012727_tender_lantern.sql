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
    max_attempts INT := 10;
    attempt INT := 0;
    ref_exists BOOLEAN;
BEGIN
    -- Try up to max_attempts times to generate a unique reference
    WHILE attempt < max_attempts LOOP
        attempt := attempt + 1;
        
        -- Get next value from sequence
        SELECT nextval('vehicle_ref_sequence') INTO seq_val;
        
        -- Calculate which prefix we're on (each prefix handles 100,000 values)
        -- AB = 0-99999, AC = 100000-199999, etc.
        prefix_num := FLOOR(seq_val / 100000);
        
        -- Calculate the numeric part (modulo 100000, then add 1 to start from 00001)
        suffix := (seq_val % 100000) + 1;
        
        -- Calculate the two letters for the prefix
        -- First letter: A (fixed for AB series)
        -- Second letter: B + (prefix_num % 26) to start with AB
        first_letter := 'A';
        second_letter := CHR(66 + (prefix_num % 26)); -- 66 = 'B' in ASCII
        
        -- Combine to form the prefix
        prefix := first_letter || second_letter;
        
        -- Check if this reference already exists
        SELECT EXISTS(
            SELECT 1 FROM cars_v2 
            WHERE ref_auto = prefix || LPAD(suffix::TEXT, 5, '0')
        ) INTO ref_exists;
        
        -- If reference doesn't exist, return it
        IF NOT ref_exists THEN
            RETURN prefix || LPAD(suffix::TEXT, 5, '0');
        END IF;
        
        -- If we get here, the reference exists, so we'll try again
        -- The sequence will automatically increment for the next attempt
    END LOOP;
    
    -- If we've exhausted all attempts, raise an error
    RAISE EXCEPTION 'Unable to generate unique vehicle reference after % attempts', max_attempts;
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