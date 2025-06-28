/*
  # AB Series Vehicle References

  1. Changes
    - Reset vehicle reference sequence to start AB series
    - Ensure new vehicles get AB00001, AB00002, etc.
    - Keep existing AA series references unchanged
    - Handle potential duplicate key conflicts
*/

-- Get the current maximum ref_auto number to avoid conflicts
DO $$
DECLARE
    max_ref_num INTEGER := 0;
    current_ref TEXT;
BEGIN
    -- Find the highest numeric part from existing ref_auto values
    SELECT COALESCE(MAX(CAST(SUBSTRING(ref_auto FROM 3) AS INTEGER)), 0)
    INTO max_ref_num
    FROM cars_v2
    WHERE ref_auto ~ '^[A-Z]{2}[0-9]{5}$';
    
    -- Set the sequence to start after the highest existing number
    -- This ensures we don't get duplicate key violations
    PERFORM setval('vehicle_ref_sequence', GREATEST(max_ref_num, 1), false);
    
    RAISE NOTICE 'Sequence set to start from: %', GREATEST(max_ref_num, 1);
END $$;

-- Update the comment to reflect the new AB series
COMMENT ON FUNCTION generate_vehicle_ref() IS 'Generate vehicle references in AB series format (AB00001, AB00002, etc.)';

-- Add a comment to the sequence
COMMENT ON SEQUENCE vehicle_ref_sequence IS 'Sequence for AB series vehicle references (AB00001-AB99999, then AC00001, etc.)'; 