/*
  # Remove ref_auto column and related elements

  1. Changes
    - Drop ref_auto column from cars_v2 table
    - Drop ref_auto trigger and function
    - Keep only the reference column functionality
    - Clean up any remaining ref_auto references

  2. Goal
    - Simplify the table structure
    - Remove duplicate functionality
    - Keep only the reference column working
*/

-- Drop ALL triggers that depend on ref_auto column
DROP TRIGGER IF EXISTS ensure_ref_auto_on_cars_v2 ON cars_v2;
DROP TRIGGER IF EXISTS set_ref_auto ON cars_v2;

-- Drop the ref_auto trigger function
DROP FUNCTION IF EXISTS set_ref_auto_if_null();

-- Drop the ref_auto uniqueness constraint
ALTER TABLE cars_v2 DROP CONSTRAINT IF EXISTS cars_v2_ref_auto_unique;

-- Drop the ref_auto column (now safe to do)
ALTER TABLE cars_v2 DROP COLUMN IF EXISTS ref_auto;

-- Update the generate_vehicle_ref function to work only with reference column
-- (This function is now only used by generate_vehicle_reference)
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
        
        -- Check if this reference already exists in the reference column
        SELECT EXISTS(
            SELECT 1 FROM cars_v2 
            WHERE reference = prefix || LPAD(suffix::TEXT, 5, '0')
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

-- Update comments to reflect the changes
COMMENT ON COLUMN cars_v2.reference IS 'Unique vehicle reference in format AB00001, automatically generated';
COMMENT ON FUNCTION generate_vehicle_ref() IS 'Generate vehicle references in AB series format (AB00001, AB00002, etc.)';
COMMENT ON FUNCTION generate_vehicle_reference() IS 'Generate vehicle references in AB series format (AB00001, AB00002, etc.) for the reference column';

-- Verify that the reference column still has its constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'cars_v2' 
        AND constraint_name = 'cars_v2_reference_unique'
        AND constraint_type = 'UNIQUE'
    ) THEN
        -- Add the constraint if it doesn't exist
        ALTER TABLE cars_v2 ADD CONSTRAINT cars_v2_reference_unique UNIQUE (reference);
        RAISE NOTICE 'Added missing uniqueness constraint on reference column';
    END IF;
END $$;

-- Verify that the reference trigger still exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE event_object_table = 'cars_v2' 
        AND trigger_name = 'ensure_reference_on_cars_v2'
    ) THEN
        RAISE NOTICE 'Warning: ensure_reference_on_cars_v2 trigger not found';
    END IF;
END $$; 