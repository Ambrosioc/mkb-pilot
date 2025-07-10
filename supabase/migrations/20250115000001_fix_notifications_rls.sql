-- Corriger les politiques RLS pour les notifications
-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can create notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;

-- Créer de nouvelles politiques plus permissives pour les notifications système
-- Politique pour que les utilisateurs puissent voir leurs propres notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = recipient_id);

-- Politique pour permettre la création de notifications (plus permissive pour les notifications système)
CREATE POLICY "Users can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Politique pour que les utilisateurs puissent mettre à jour leurs propres notifications
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = recipient_id);

-- Politique pour que les utilisateurs puissent supprimer leurs propres notifications
CREATE POLICY "Users can delete their own notifications" ON notifications
  FOR DELETE USING (auth.uid() = recipient_id);

-- Fonction pour créer des notifications système (bypass RLS)
CREATE OR REPLACE FUNCTION create_system_notification(
  p_recipient_id UUID,
  p_sender_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT,
  p_category TEXT DEFAULT 'system'
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (
    recipient_id,
    sender_id,
    title,
    message,
    type,
    category
  ) VALUES (
    p_recipient_id,
    p_sender_id,
    p_title,
    p_message,
    p_type,
    p_category
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 