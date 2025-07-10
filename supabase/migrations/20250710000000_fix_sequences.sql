-- Migration pour corriger les séquences d'auto-incrémentation
-- Date: 2025-07-10
-- Description: Corrige les séquences d'ID pour éviter les erreurs de clé dupliquée

-- Fixe la séquence d'auto-incrémentation de la table roles
SELECT setval('roles_id_seq', (SELECT COALESCE(MAX(id), 1) FROM roles) + 1, false);

-- Fixe la séquence d'auto-incrémentation de la table poles
SELECT setval('poles_id_seq', (SELECT COALESCE(MAX(id), 1) FROM poles) + 1, false);

-- Note: Les tables suivantes utilisent des UUIDs, pas des séquences d'auto-incrémentation
-- - cars_v2 (UUID)
-- - advertisements (UUID) 
-- - contacts (UUID)
-- - sales_documents (UUID)
-- - brands (UUID)
-- - models (UUID)
-- - contact_interactions (UUID)
-- - user_roles (UUID)
-- - user_poles (UUID)

-- Log de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Migration fix_sequences terminée avec succès';
    RAISE NOTICE 'Toutes les séquences d''auto-incrémentation ont été corrigées';
END $$; 