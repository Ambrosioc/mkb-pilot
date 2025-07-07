-- Désactiver temporairement RLS sur la table advertisements
ALTER TABLE advertisements DISABLE ROW LEVEL SECURITY;

-- Optionnel : Créer une politique simple pour permettre l'insertion
-- CREATE POLICY "Allow insert advertisements" ON advertisements
--     FOR INSERT WITH CHECK (true);

-- Optionnel : Créer une politique pour permettre la lecture
-- CREATE POLICY "Allow select advertisements" ON advertisements
--     FOR SELECT USING (true); 