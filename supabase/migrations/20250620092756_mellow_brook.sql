/*
  # Update contacts table

  1. Changes
    - Add `status` column with default 'actif'
    - Ensure `tags` column exists as an array of text
  2. Security
    - Ensure RLS is enabled
*/

-- Add status column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contacts' AND column_name = 'status'
  ) THEN
    ALTER TABLE contacts ADD COLUMN status TEXT NOT NULL DEFAULT 'actif';
  END IF;
END $$;

-- Ensure tags column exists as an array of text
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contacts' AND column_name = 'tags'
  ) THEN
    ALTER TABLE contacts ADD COLUMN tags TEXT[] DEFAULT '{}';
  END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'contacts' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE contacts ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- Create or replace function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_contacts_updated_at'
  ) THEN
    CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
  END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'contacts' AND policyname = 'Users can read/write contacts'
  ) THEN
    CREATE POLICY "Users can read/write contacts"
      ON contacts
      FOR ALL
      TO authenticated
      USING (true);
  END IF;
END $$;