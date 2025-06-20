/*
  # Create contact_tags table

  1. New Tables
    - `contact_tags`
      - `id` (uuid, primary key)
      - `contact_id` (uuid, foreign key to contacts)
      - `tag` (text)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `contact_tags` table
    - Add policy for authenticated users
*/

-- Create contact_tags table
CREATE TABLE IF NOT EXISTS contact_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE contact_tags ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Users can read/write contact_tags"
  ON contact_tags
  FOR ALL
  TO authenticated
  USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS contact_tags_contact_id_idx ON contact_tags(contact_id);
CREATE INDEX IF NOT EXISTS contact_tags_tag_idx ON contact_tags(tag);