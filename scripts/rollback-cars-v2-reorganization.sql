-- Script de rollback pour la réorganisation des IDs de cars_v2
-- ⚠️ ATTENTION: Ce script ne peut être utilisé que si vous avez sauvegardé l'état initial
-- et que vous avez les mappings d'origine

-- Ce script suppose que vous avez sauvegardé les données originales dans des tables de sauvegarde
-- Si vous n'avez pas de sauvegarde, ce rollback ne sera pas possible

-- 1. Vérifier si les tables de sauvegarde existent
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cars_v2_backup') THEN
        RAISE EXCEPTION 'Table de sauvegarde cars_v2_backup non trouvée. Rollback impossible.';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'advertisements_backup') THEN
        RAISE EXCEPTION 'Table de sauvegarde advertisements_backup non trouvée. Rollback impossible.';
    END IF;
    
    RAISE NOTICE 'Tables de sauvegarde trouvées. Rollback possible.';
END $$;

BEGIN;

-- 2. Créer une table temporaire pour stocker les mappings inverses
-- (Si vous avez sauvegardé les mappings d'origine)
CREATE TEMP TABLE rollback_mapping (
    current_id BIGINT,
    original_id BIGINT
);

-- 3. Remplir le mapping de rollback (ajustez selon votre sauvegarde)
-- Exemple: si vous avez sauvegardé les mappings dans une table
-- INSERT INTO rollback_mapping (current_id, original_id)
-- SELECT new_id, old_id FROM id_mapping_backup;

-- 4. Restaurer cars_v2 depuis la sauvegarde
DROP TABLE IF EXISTS cars_v2;
CREATE TABLE cars_v2 AS SELECT * FROM cars_v2_backup;

-- 5. Restaurer advertisements depuis la sauvegarde
DROP TABLE IF EXISTS advertisements;
CREATE TABLE advertisements AS SELECT * FROM advertisements_backup;

-- 6. Recréer les contraintes et index (ajustez selon votre configuration)
ALTER TABLE cars_v2 ADD CONSTRAINT cars_v2_pkey PRIMARY KEY (id);

-- Recréer la contrainte de clé étrangère si elle existait
-- ALTER TABLE advertisements ADD CONSTRAINT advertisements_car_id_fkey 
--     FOREIGN KEY (car_id) REFERENCES cars_v2(id);

-- 7. Réinitialiser la séquence
DO $$
DECLARE
    seq_name text;
BEGIN
    SELECT pg_get_serial_sequence('cars_v2', 'id') INTO seq_name;
    
    IF seq_name IS NOT NULL THEN
        EXECUTE format('SELECT setval(%L, (SELECT MAX(id) FROM cars_v2), true)', seq_name);
        RAISE NOTICE 'Séquence % restaurée', seq_name;
    END IF;
END $$;

-- 8. Vérifications post-rollback
SELECT 
    'Vérification post-rollback cars_v2' as check_type,
    COUNT(*) as total_records,
    MIN(id) as min_id,
    MAX(id) as max_id
FROM cars_v2;

SELECT 
    'Vérification post-rollback advertisements' as check_type,
    COUNT(*) as total_records,
    COUNT(DISTINCT car_id) as unique_references
FROM advertisements;

SELECT 
    'Vérification intégrité référentielle post-rollback' as check_type,
    COUNT(*) as orphaned_advertisements
FROM advertisements a
LEFT JOIN cars_v2 c ON a.car_id = c.id
WHERE c.id IS NULL;

-- 9. Nettoyer
DROP TABLE rollback_mapping;

COMMIT;

-- Message de confirmation
SELECT 'Rollback terminé avec succès!' as status;

-- Instructions pour nettoyer les tables de sauvegarde (optionnel)
-- DROP TABLE cars_v2_backup;
-- DROP TABLE advertisements_backup; 