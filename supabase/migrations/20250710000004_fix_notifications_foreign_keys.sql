-- Fix notifications table foreign key constraints
-- This migration fixes the notifications table to properly reference the users table

-- First, drop the existing notifications table if it exists
DROP TABLE IF EXISTS notifications CASCADE;

-- Recreate the notifications table with correct foreign key references
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  category TEXT NOT NULL DEFAULT 'system' CHECK (category IN ('system', 'user', 'commercial', 'technique')),
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON notifications(sender_id);

-- Create the function to update updated_at
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger for updated_at
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (
    recipient_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create notifications" ON notifications
  FOR INSERT WITH CHECK (
    sender_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (
    recipient_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own notifications" ON notifications
  FOR DELETE USING (
    recipient_id IN (
      SELECT id FROM users WHERE auth_user_id = auth.uid()
    )
  );

-- Create utility functions
CREATE OR REPLACE FUNCTION get_unread_notifications_count(user_auth_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM notifications n
    JOIN users u ON n.recipient_id = u.id
    WHERE u.auth_user_id = user_auth_id AND n.read = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION mark_all_notifications_as_read(user_auth_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE notifications
  SET read = true, updated_at = NOW()
  WHERE recipient_id IN (
    SELECT id FROM users WHERE auth_user_id = user_auth_id
  ) AND read = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_system_notification(
  p_recipient_auth_id UUID,
  p_sender_auth_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT,
  p_category TEXT DEFAULT 'system'
)
RETURNS UUID AS $$
DECLARE
  recipient_user_id UUID;
  sender_user_id UUID;
  notification_id UUID;
BEGIN
  -- Get user IDs
  SELECT id INTO recipient_user_id FROM users WHERE auth_user_id = p_recipient_auth_id;
  SELECT id INTO sender_user_id FROM users WHERE auth_user_id = p_sender_auth_id;
  
  IF recipient_user_id IS NULL THEN
    RAISE EXCEPTION 'Recipient user not found';
  END IF;
  
  -- Insert notification
  INSERT INTO notifications (
    recipient_id,
    sender_id,
    title,
    message,
    type,
    category
  ) VALUES (
    recipient_user_id,
    sender_user_id,
    p_title,
    p_message,
    p_type,
    p_category
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 