-- Fixer les politiques RLS pour permettre l'accès Realtime
-- Cette migration ajoute une politique permissive pour l'accès anonyme nécessaire à Realtime

-- Supprimer les anciennes politiques restrictives
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can create notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;

-- Créer des politiques plus permissives pour Realtime
-- Politique pour permettre la lecture anonyme (nécessaire pour Realtime)
CREATE POLICY "Allow anonymous read for realtime" ON notifications
  FOR SELECT USING (true);

-- Politique pour permettre la création (plus permissive)
CREATE POLICY "Allow notification creation" ON notifications
  FOR INSERT WITH CHECK (true);

-- Politique pour permettre la mise à jour
CREATE POLICY "Allow notification updates" ON notifications
  FOR UPDATE USING (true);

-- Politique pour permettre la suppression
CREATE POLICY "Allow notification deletion" ON notifications
  FOR DELETE USING (true);

-- Vérifier que les politiques sont créées
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'notifications'; 