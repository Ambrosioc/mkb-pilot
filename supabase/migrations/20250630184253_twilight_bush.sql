/*
  # Email System Setup

  1. New Tables
    - `email_logs` - Track all emails sent through the system
    - `sales_documents` - Enhanced with email tracking fields

  2. Changes
    - Add email tracking fields to sales_documents
    - Create email_logs table for comprehensive email tracking
*/

-- Create email_logs table to track all emails sent
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  document_id UUID REFERENCES sales_documents(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  document_type TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add email tracking fields to sales_documents if they don't exist
DO $$ 
BEGIN
  -- Add sent_by_email field
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'sales_documents' AND column_name = 'sent_by_email'
  ) THEN
    ALTER TABLE sales_documents ADD COLUMN sent_by_email BOOLEAN DEFAULT false;
  END IF;

  -- Add sent_at field
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'sales_documents' AND column_name = 'sent_at'
  ) THEN
    ALTER TABLE sales_documents ADD COLUMN sent_at TIMESTAMPTZ;
  END IF;

  -- Add pdf_content field to store the PDF content
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'sales_documents' AND column_name = 'pdf_content'
  ) THEN
    ALTER TABLE sales_documents ADD COLUMN pdf_content TEXT;
  END IF;

  -- Add created_by field
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'sales_documents' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE sales_documents ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  -- Add number field if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'sales_documents' AND column_name = 'number'
  ) THEN
    ALTER TABLE sales_documents ADD COLUMN number TEXT;
  END IF;

  -- Add due_date field if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'sales_documents' AND column_name = 'due_date'
  ) THEN
    ALTER TABLE sales_documents ADD COLUMN due_date TIMESTAMPTZ;
  END IF;

  -- Add payment_terms field if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'sales_documents' AND column_name = 'payment_terms'
  ) THEN
    ALTER TABLE sales_documents ADD COLUMN payment_terms TEXT;
  END IF;

  -- Rename columns for consistency if they exist
  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'sales_documents' AND column_name = 'tva_rate'
  ) THEN
    ALTER TABLE sales_documents RENAME COLUMN tva_rate TO vat_rate;
  END IF;

  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'sales_documents' AND column_name = 'tva_amount'
  ) THEN
    ALTER TABLE sales_documents RENAME COLUMN tva_amount TO vat_amount;
  END IF;

  IF EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'sales_documents' AND column_name = 'discount'
  ) THEN
    ALTER TABLE sales_documents RENAME COLUMN discount TO discount_amount;
  END IF;

  -- Add discount_percentage field if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'sales_documents' AND column_name = 'discount_percentage'
  ) THEN
    ALTER TABLE sales_documents ADD COLUMN discount_percentage REAL DEFAULT 0;
  END IF;
END $$;

-- Create indexes for email_logs
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_document_id ON email_logs(document_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient_email ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);

-- Create indexes for sales_documents
CREATE INDEX IF NOT EXISTS idx_sales_documents_number ON sales_documents(number);
CREATE INDEX IF NOT EXISTS idx_sales_documents_created_by ON sales_documents(created_by);
CREATE INDEX IF NOT EXISTS idx_sales_documents_sent_by_email ON sales_documents(sent_by_email);

-- Enable Row Level Security on email_logs
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for email_logs
CREATE POLICY "Authenticated users can read all email_logs"
  ON email_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert email_logs"
  ON email_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add comments for documentation
COMMENT ON TABLE email_logs IS 'Tracks all emails sent through the system';
COMMENT ON COLUMN email_logs.user_id IS 'User who sent the email';
COMMENT ON COLUMN email_logs.document_id IS 'Related document ID if applicable';
COMMENT ON COLUMN email_logs.recipient_email IS 'Email address of the recipient';
COMMENT ON COLUMN email_logs.document_type IS 'Type of document (devis, facture, autre)';
COMMENT ON COLUMN email_logs.success IS 'Whether the email was sent successfully';
COMMENT ON COLUMN email_logs.error_message IS 'Error message if the email failed to send';
COMMENT ON COLUMN email_logs.sent_at IS 'When the email was sent';

COMMENT ON COLUMN sales_documents.sent_by_email IS 'Whether the document has been sent by email';
COMMENT ON COLUMN sales_documents.sent_at IS 'When the document was sent by email';
COMMENT ON COLUMN sales_documents.pdf_content IS 'Base64 encoded PDF content';
COMMENT ON COLUMN sales_documents.created_by IS 'User who created the document';
COMMENT ON COLUMN sales_documents.number IS 'Document number (e.g., F202401-001)';
COMMENT ON COLUMN sales_documents.due_date IS 'Payment due date for invoices';
COMMENT ON COLUMN sales_documents.payment_terms IS 'Payment terms for the document';