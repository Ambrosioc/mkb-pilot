/*
  # Create sales_documents table

  1. New Tables
    - `sales_documents`
      - `id` (uuid, primary key)
      - `vehicle_id` (uuid, foreign key to cars_v2)
      - `contact_id` (uuid, foreign key to contacts)
      - `type` (text, 'devis' or 'facture')
      - `date` (date)
      - `base_price` (numeric)
      - `discount_percentage` (numeric)
      - `discount_amount` (numeric)
      - `price_before_tax` (numeric)
      - `vat_rate` (numeric)
      - `vat_amount` (numeric)
      - `total_price` (numeric)
      - `notes` (text)
      - `status` (text)
      - `pdf_url` (text)
      - `sent_by_email` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  2. Security
    - Enable RLS on `sales_documents` table
    - Add policy for authenticated users to read/write their own data
*/

CREATE TABLE IF NOT EXISTS sales_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES cars_v2(id),
  contact_id uuid REFERENCES contacts(id),
  type text NOT NULL CHECK (type IN ('devis', 'facture')),
  date date NOT NULL,
  base_price numeric NOT NULL DEFAULT 0,
  discount_percentage numeric NOT NULL DEFAULT 0,
  discount_amount numeric NOT NULL DEFAULT 0,
  price_before_tax numeric NOT NULL DEFAULT 0,
  vat_rate numeric NOT NULL DEFAULT 20,
  vat_amount numeric NOT NULL DEFAULT 0,
  total_price numeric NOT NULL DEFAULT 0,
  notes text,
  status text NOT NULL DEFAULT 'created',
  pdf_url text,
  sent_by_email boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE sales_documents ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Users can read/write their own sales_documents"
  ON sales_documents
  FOR ALL
  TO authenticated
  USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS sales_documents_vehicle_id_idx ON sales_documents(vehicle_id);
CREATE INDEX IF NOT EXISTS sales_documents_contact_id_idx ON sales_documents(contact_id);
CREATE INDEX IF NOT EXISTS sales_documents_type_idx ON sales_documents(type);
CREATE INDEX IF NOT EXISTS sales_documents_status_idx ON sales_documents(status);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sales_documents_updated_at
BEFORE UPDATE ON sales_documents
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();