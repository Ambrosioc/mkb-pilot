/*
  # Fix Sales Documents Columns

  This migration adds missing columns to the sales_documents table
  to match the expected structure in the application.
*/

-- Add missing columns to sales_documents if they don't exist
DO $$ 
BEGIN
  -- Add price_before_tax field if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'sales_documents' AND column_name = 'price_before_tax'
  ) THEN
    ALTER TABLE sales_documents ADD COLUMN price_before_tax REAL DEFAULT 0;
  END IF;

  -- Add total_price field if it doesn't exist (as alternative to final_price)
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'sales_documents' AND column_name = 'total_price'
  ) THEN
    ALTER TABLE sales_documents ADD COLUMN total_price REAL DEFAULT 0;
  END IF;

  -- Ensure final_price exists (should already exist from previous migration)
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
COMMENT ON COLUMN sales_documents.price_before_tax IS 'Price before tax (after discount)';
COMMENT ON COLUMN sales_documents.total_price IS 'Total price including tax (alternative to final_price)';
COMMENT ON COLUMN sales_documents.final_price IS 'Final price including tax';
COMMENT ON COLUMN sales_documents.pdf_url IS 'URL to the generated PDF document';
COMMENT ON COLUMN sales_documents.sent_by_email IS 'Whether the document has been sent by email'; 