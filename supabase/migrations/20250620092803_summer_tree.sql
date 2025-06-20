/*
  # Create contact_interactions table

  1. New Tables
    - `contact_interactions`
      - `id` (uuid, primary key)
      - `contact_id` (uuid, foreign key to contacts)
      - `type` (text, e.g., 'email', 'call', 'meeting')
      - `date` (date)
      - `description` (text)
      - `user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `contact_interactions` table
    - Add policy for authenticated users
*/

-- Create contact_interactions table
CREATE TABLE IF NOT EXISTS contact_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE contact_interactions ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Users can read/write contact_interactions"
  ON contact_interactions
  FOR ALL
  TO authenticated
  USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS contact_interactions_contact_id_idx ON contact_interactions(contact_id);
CREATE INDEX IF NOT EXISTS contact_interactions_type_idx ON contact_interactions(type);
CREATE INDEX IF NOT EXISTS contact_interactions_date_idx ON contact_interactions(date);