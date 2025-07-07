-- Script de sauvegarde automatique avant la réorganisation des IDs de cars_v2
-- Exécutez ce script AVANT de lancer la réorganisation pour créer une sauvegarde de sécurité

BEGIN;

-- 1. Créer une sauvegarde de la table cars_v2
CREATE TABLE cars_v2_backup AS SELECT * FROM cars_v2;

-- 2. Créer une sauvegarde de la table advertisements
CREATE TABLE advertisements_backup AS SELECT * FROM advertisements;

-- 3. Créer une table de sauvegarde pour les mappings d'ID (pour le rollback)
CREATE TABLE id_mapping_backup AS
SELECT 
    id as old_id,
    ROW_NUMBER() OVER (ORDER BY id) as new_id
FROM cars_v2
ORDER BY id;

-- 4. Créer des index sur les tables de sauvegarde pour optimiser les performances
CREATE INDEX idx_cars_v2_backup_id ON cars_v2_backup(id);
CREATE INDEX idx_advertisements_backup_car_id ON advertisements_backup(car_id);
CREATE INDEX idx_id_mapping_backup_old_id ON id_mapping_backup(old_id);
CREATE INDEX idx_id_mapping_backup_new_id ON id_mapping_backup(new_id);

-- 5. Vérifier que les sauvegardes sont complètes
DO $$
DECLARE
    cars_v2_count integer;
    cars_v2_backup_count integer;
    advertisements_count integer;
    advertisements_backup_count integer;
BEGIN
    SELECT COUNT(*) INTO cars_v2_count FROM cars_v2;
    SELECT COUNT(*) INTO cars_v2_backup_count FROM cars_v2_backup;
    SELECT COUNT(*) INTO advertisements_count FROM advertisements;
    SELECT COUNT(*) INTO advertisements_backup_count FROM advertisements_backup;
    
    IF cars_v2_count != cars_v2_backup_count THEN
        RAISE EXCEPTION 'Sauvegarde cars_v2 incomplète! Original: %, Sauvegarde: %', cars_v2_count, cars_v2_backup_count;
    END IF;
    
    IF advertisements_count != advertisements_backup_count THEN
        RAISE EXCEPTION 'Sauvegarde advertisements incomplète! Original: %, Sauvegarde: %', advertisements_count, advertisements_backup_count;
    END IF;
    
    RAISE NOTICE 'Sauvegardes créées avec succès: cars_v2 (% records), advertisements (% records)', 
                 cars_v2_backup_count, advertisements_backup_count;
END $$;

-- 6. Créer un fichier de métadonnées de sauvegarde
CREATE TABLE backup_metadata (
    backup_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cars_v2_records INTEGER,
    advertisements_records INTEGER,
    cars_v2_min_id BIGINT,
    cars_v2_max_id BIGINT,
    sequence_name TEXT,
    sequence_current_value BIGINT
);

INSERT INTO backup_metadata (
    cars_v2_records,
    advertisements_records,
    cars_v2_min_id,
    cars_v2_max_id,
    sequence_name,
    sequence_current_value
)
SELECT 
    (SELECT COUNT(*) FROM cars_v2),
    (SELECT COUNT(*) FROM advertisements),
    (SELECT MIN(id) FROM cars_v2),
    (SELECT MAX(id) FROM cars_v2),
    pg_get_serial_sequence('cars_v2', 'id'),
    currval(pg_get_serial_sequence('cars_v2', 'id'))
WHERE pg_get_serial_sequence('cars_v2', 'id') IS NOT NULL;

-- 7. Afficher un résumé de la sauvegarde
SELECT 
    'Sauvegarde créée avec succès' as status,
    backup_timestamp,
    cars_v2_records,
    advertisements_records,
    cars_v2_min_id,
    cars_v2_max_id,
    sequence_name,
    sequence_current_value
FROM backup_metadata
ORDER BY backup_timestamp DESC
LIMIT 1;

-- 8. Instructions pour la suite
SELECT 
    'Prochaines étapes:' as instruction_type,
    '1. Vérifiez que les sauvegardes sont correctes' as step_1,
    '2. Exécutez le script d''analyse: analyze-cars-v2-before-reorganization.sql' as step_2,
    '3. Si tout est OK, lancez la réorganisation: reorganize-cars-v2-ids-robust.sql' as step_3,
    '4. En cas de problème, utilisez le rollback: rollback-cars-v2-reorganization.sql' as step_4;

COMMIT;

-- Tables de sauvegarde créées:
-- - cars_v2_backup
-- - advertisements_backup  
-- - id_mapping_backup
-- - backup_metadata 