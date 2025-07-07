-- Script d'analyse préalable pour la réorganisation des IDs de cars_v2
-- Exécutez ce script AVANT de lancer la réorganisation pour vérifier l'état de vos données

-- 1. Analyse de la table cars_v2
SELECT 
    'cars_v2' as table_name,
    COUNT(*) as total_records,
    MIN(id) as min_id,
    MAX(id) as max_id,
    MAX(id) - MIN(id) + 1 as id_range,
    COUNT(*) - (MAX(id) - MIN(id) + 1) as gaps_count
FROM cars_v2;

-- 2. Analyse des gaps dans les IDs
WITH id_sequence AS (
    SELECT generate_series(
        (SELECT MIN(id) FROM cars_v2),
        (SELECT MAX(id) FROM cars_v2)
    ) as expected_id
)
SELECT 
    'Gaps dans les IDs' as analysis_type,
    COUNT(*) as missing_ids,
    array_agg(expected_id ORDER BY expected_id) as missing_id_list
FROM id_sequence
WHERE expected_id NOT IN (SELECT id FROM cars_v2);

-- 3. Analyse de la table advertisements
SELECT 
    'advertisements' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT car_id) as unique_car_references,
    COUNT(*) - COUNT(DISTINCT car_id) as duplicate_references
FROM advertisements;

-- 4. Vérification de l'intégrité référentielle actuelle
SELECT 
    'Intégrité référentielle' as analysis_type,
    COUNT(*) as orphaned_advertisements
FROM advertisements a
LEFT JOIN cars_v2 c ON a.car_id = c.id
WHERE c.id IS NULL;

-- 5. Analyse des références par car_id
SELECT 
    'Répartition des références' as analysis_type,
    car_id,
    COUNT(*) as reference_count
FROM advertisements
GROUP BY car_id
ORDER BY reference_count DESC
LIMIT 10;

-- 6. Vérification de la séquence auto-incrémentée
SELECT 
    'Séquence auto-incrémentée' as analysis_type,
    pg_get_serial_sequence('cars_v2', 'id') as sequence_name,
    currval(pg_get_serial_sequence('cars_v2', 'id')) as current_value,
    (SELECT MAX(id) FROM cars_v2) as max_id_in_table;

-- 7. Contraintes existantes sur cars_v2
SELECT 
    'Contraintes cars_v2' as analysis_type,
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'cars_v2'::regclass;

-- 8. Contraintes existantes sur advertisements
SELECT 
    'Contraintes advertisements' as analysis_type,
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'advertisements'::regclass;

-- 9. Index sur cars_v2
SELECT 
    'Index cars_v2' as analysis_type,
    indexname as index_name,
    indexdef as index_definition
FROM pg_indexes
WHERE tablename = 'cars_v2';

-- 10. Taille des tables
SELECT 
    'Taille des tables' as analysis_type,
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size
FROM pg_tables
WHERE tablename IN ('cars_v2', 'advertisements');

-- 11. Estimation de l'espace disque nécessaire
SELECT 
    'Estimation espace disque' as analysis_type,
    (SELECT COUNT(*) FROM cars_v2) as cars_v2_records,
    (SELECT COUNT(*) FROM advertisements) as advertisements_records,
    'Assurez-vous d''avoir suffisamment d''espace disque pour créer une copie temporaire' as recommendation; 