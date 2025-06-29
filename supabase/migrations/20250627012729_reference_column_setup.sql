/*
  # Setup Reference Column for cars_v2

  1. Changes
    - Create function to generate vehicle references for the 'reference' column
    - Create trigger to automatically fill 'reference' column on INSERT
    - Ensure 'reference' column works exactly like 'ref_auto'
    - Use the same sequence and logic as ref_auto
    - Add uniqueness constraint to 'reference' column

  2. Goal
    - Replace ref_auto functionality with reference column
    - Maintain the same AB00001, AB00002 format
    - Keep the same uniqueness and retry logic
*/

-- Create function to generate vehicle references for the 'reference' column
-- This function is identical to generate_vehicle_ref() but specifically for the 'reference' column
CREATE OR REPLACE FUNCTION generate_vehicle_reference()
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
        
        -- Get next value from sequence (using the same sequence as ref_auto)
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
        
        -- Check if this reference already exists in the 'reference' column
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

-- Add reference column to cars_v2 table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'cars_v2' AND column_name = 'reference'
    ) THEN
        -- Add the column with default value from the generator function
        ALTER TABLE cars_v2 ADD COLUMN reference TEXT DEFAULT generate_vehicle_reference();
        
        -- Add uniqueness constraint
        ALTER TABLE cars_v2 ADD CONSTRAINT cars_v2_reference_unique UNIQUE (reference);
    END IF;
END $$;

-- Create trigger function to ensure reference is set on insert if not provided
CREATE OR REPLACE FUNCTION set_reference_if_null()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.reference IS NULL THEN
        NEW.reference := generate_vehicle_reference();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS ensure_reference_on_cars_v2 ON cars_v2;

-- Create the trigger
CREATE TRIGGER ensure_reference_on_cars_v2
    BEFORE INSERT ON cars_v2
    FOR EACH ROW
    EXECUTE FUNCTION set_reference_if_null();

-- Add comment explaining the column
COMMENT ON COLUMN cars_v2.reference IS 'Unique vehicle reference in format AB00001, automatically generated (replaces ref_auto)';
COMMENT ON FUNCTION generate_vehicle_reference() IS 'Generate vehicle references in AB series format (AB00001, AB00002, etc.) for the reference column';

-- Update existing records to have a reference if they don't have one
-- This ensures all existing cars have a reference value
DO $$
DECLARE
    car_record RECORD;
    new_reference TEXT;
BEGIN
    -- Loop through all cars that don't have a reference
    FOR car_record IN 
        SELECT id FROM cars_v2 WHERE reference IS NULL OR reference = ''
    LOOP
        -- Generate a new reference for this car
        SELECT generate_vehicle_reference() INTO new_reference;
        
        -- Update the car with the new reference
        UPDATE cars_v2 
        SET reference = new_reference 
        WHERE id = car_record.id;
        
        RAISE NOTICE 'Updated car ID % with reference: %', car_record.id, new_reference;
    END LOOP;
END $$; 