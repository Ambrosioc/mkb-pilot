/*
  # Add VAT Columns to Sales Documents

  This migration adds the missing VAT columns to the sales_documents table
  that were supposed to be added in the previous migration.
*/

-- Add missing VAT columns to sales_documents if they don't exist
DO $$ 
BEGIN
  -- Add vat_rate field if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'sales_documents' AND column_name = 'vat_rate'
  ) THEN
    ALTER TABLE sales_documents ADD COLUMN vat_rate REAL DEFAULT 20;
  END IF;

  -- Add vat_amount field if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'sales_documents' AND column_name = 'vat_amount'
  ) THEN
    ALTER TABLE sales_documents ADD COLUMN vat_amount REAL DEFAULT 0;
  END IF;

  -- Add discount_percentage field if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'sales_documents' AND column_name = 'discount_percentage'
  ) THEN
    ALTER TABLE sales_documents ADD COLUMN discount_percentage REAL DEFAULT 0;
  END IF;

  -- Add discount_amount field if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'sales_documents' AND column_name = 'discount_amount'
  ) THEN
    ALTER TABLE sales_documents ADD COLUMN discount_amount REAL DEFAULT 0;
  END IF;

  -- Add price_before_tax field if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'sales_documents' AND column_name = 'price_before_tax'
  ) THEN
    ALTER TABLE sales_documents ADD COLUMN price_before_tax REAL DEFAULT 0;
  END IF;

  -- Add final_price field if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'sales_documents' AND column_name = 'final_price'
  ) THEN
    ALTER TABLE sales_documents ADD COLUMN final_price REAL DEFAULT 0;
  END IF;

  -- Add pdf_url field if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'sales_documents' AND column_name = 'pdf_url'
  ) THEN
    ALTER TABLE sales_documents ADD COLUMN pdf_url TEXT;
  END IF;

  -- Add sent_by_email field if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'sales_documents' AND column_name = 'sent_by_email'
  ) THEN
    ALTER TABLE sales_documents ADD COLUMN sent_by_email BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN sales_documents.vat_rate IS 'VAT rate percentage (e.g., 20 for 20%)';
COMMENT ON COLUMN sales_documents.vat_amount IS 'VAT amount in currency';
COMMENT ON COLUMN sales_documents.discount_percentage IS 'Discount percentage (e.g., 10 for 10%)';
COMMENT ON COLUMN sales_documents.discount_amount IS 'Discount amount in currency';
COMMENT ON COLUMN sales_documents.price_before_tax IS 'Price before tax (after discount)';
COMMENT ON COLUMN sales_documents.final_price IS 'Final price including tax';
COMMENT ON COLUMN sales_documents.pdf_url IS 'URL to the generated PDF document';
COMMENT ON COLUMN sales_documents.sent_by_email IS 'Whether the document has been sent by email'; 