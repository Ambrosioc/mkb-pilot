-- =====================================================
-- SCRIPT DE RÉORGANISATION DES IDs DE cars_v2
-- PostgreSQL / Supabase
-- =====================================================
-- 
-- ATTENTION: 
-- 1. SAUVEGARDEZ VOS DONNÉES AVANT D'EXÉCUTER CE SCRIPT
-- 2. EXÉCUTEZ D'ABORD LA SIMULATION (section 1)
-- 3. VÉRIFIEZ LES RÉSULTATS AVANT D'APPLIQUER LES CHANGEMENTS
-- 4. CE SCRIPT MET À JOUR LA TABLE advertisements.car_id
--
-- =====================================================

-- =====================================================
-- 1. SIMULATION - Voir les changements avant application
-- =====================================================
-- Exécutez cette section d'abord pour voir ce qui va changer

-- Afficher l'état actuel
SELECT 
    'État actuel' as info,
    MIN(id) as min_id,
    MAX(id) as max_id,
    COUNT(*) as total_records,
    MAX(id) - MIN(id) + 1 as range_size,
    COUNT(*) - (MAX(id) - MIN(id) + 1) as holes_count
FROM cars_v2;

-- Voir les premiers trous dans la séquence
WITH sequence_gaps AS (
    SELECT 
        id,
        LAG(id) OVER (ORDER BY id) as prev_id,
        id - LAG(id) OVER (ORDER BY id) as gap_size
    FROM cars_v2
    WHERE id > 1
)
SELECT 
    'Premiers trous détectés' as info,
    prev_id + 1 as gap_start,
    id - 1 as gap_end,
    gap_size - 1 as holes_in_gap
FROM sequence_gaps 
WHERE gap_size > 1
ORDER BY gap_start
LIMIT 10;

-- Simulation des nouveaux IDs
WITH reordered AS (
    SELECT 
        id as old_id,
        ROW_NUMBER() OVER (ORDER BY id) as new_id,
        reference,
        brand,
        model
    FROM cars_v2
)
SELECT 
    old_id,
    new_id,
    CASE 
        WHEN old_id = new_id THEN '✅ Pas de changement'
        ELSE '🔄 Changement'
    END as status,
    reference,
    brand,
    model
FROM reordered
ORDER BY old_id
LIMIT 20;

-- =====================================================
-- 2. VÉRIFICATION DES DÉPENDANCES
-- =====================================================

-- Vérifier les références dans advertisements
SELECT 
    'Références dans advertisements' as info,
    COUNT(*) as total_references,
    COUNT(DISTINCT car_id) as unique_car_ids,
    MIN(car_id) as min_car_id,
    MAX(car_id) as max_car_id
FROM advertisements
WHERE car_id IS NOT NULL;

-- Vérifier s'il y a des références orphelines
SELECT 
    'Références orphelines' as info,
    COUNT(*) as orphaned_references
FROM advertisements a
LEFT JOIN cars_v2 c ON a.car_id = c.id
WHERE a.car_id IS NOT NULL AND c.id IS NULL;

-- =====================================================
-- 3. SCRIPT PRINCIPAL DE RÉORGANISATION
-- =====================================================
-- ATTENTION: Exécutez ceci seulement après avoir vérifié la simulation

-- Début de transaction (ROLLBACK en cas d'erreur)
BEGIN;

-- Créer une table temporaire avec le mapping old_id -> new_id
CREATE TEMP TABLE cars_v2_reorder AS
SELECT 
    id as old_id,
    ROW_NUMBER() OVER (ORDER BY id) as new_id
FROM cars_v2;

-- Afficher le mapping pour vérification
SELECT 
    'Mapping généré' as info,
    COUNT(*) as total_mappings,
    MIN(old_id) as min_old_id,
    MAX(old_id) as max_old_id,
    MIN(new_id) as min_new_id,
    MAX(new_id) as max_new_id
FROM cars_v2_reorder;

-- Mettre à jour les IDs dans cars_v2
UPDATE cars_v2 
SET id = r.new_id
FROM cars_v2_reorder r
WHERE cars_v2.id = r.old_id;

-- Vérifier la mise à jour
SELECT 
    'Après mise à jour cars_v2' as info,
    COUNT(*) as updated_records,
    MIN(id) as min_id,
    MAX(id) as max_id
FROM cars_v2;

-- Mettre à jour les références dans advertisements
UPDATE advertisements 
SET car_id = r.new_id
FROM cars_v2_reorder r
WHERE advertisements.car_id = r.old_id;

-- Vérifier la mise à jour des références
SELECT 
    'Après mise à jour advertisements' as info,
    COUNT(*) as updated_references,
    COUNT(DISTINCT car_id) as unique_car_ids,
    MIN(car_id) as min_car_id,
    MAX(car_id) as max_car_id
FROM advertisements
WHERE car_id IS NOT NULL;

-- =====================================================
-- 4. RÉINITIALISATION DE LA SÉQUENCE
-- =====================================================

-- Trouver le nom exact de la séquence
SELECT 
    'Nom de la séquence' as info,
    pg_get_serial_sequence('cars_v2', 'id') as sequence_name;

-- Réinitialiser la séquence (remplacez le nom si différent)
-- Note: Le nom est généralement 'cars_v2_id_seq'
SELECT setval(
    COALESCE(pg_get_serial_sequence('cars_v2', 'id'), 'cars_v2_id_seq'),
    (SELECT MAX(id) FROM cars_v2),
    true
);

-- Vérifier la séquence
SELECT 
    'Séquence après réinitialisation' as info,
    currval(COALESCE(pg_get_serial_sequence('cars_v2', 'id'), 'cars_v2_id_seq')) as current_value;

-- =====================================================
-- 5. VALIDATION FINALE
-- =====================================================

-- Vérifier l'état final
SELECT 
    'État final' as info,
    MIN(id) as min_id,
    MAX(id) as max_id,
    COUNT(*) as total_records,
    CASE 
        WHEN MIN(id) = 1 AND MAX(id) = COUNT(*) THEN '✅ Parfait'
        ELSE '❌ Problème détecté'
    END as status
FROM cars_v2;

-- Vérifier qu'il n'y a plus de trous
WITH sequence_check AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (ORDER BY id) as expected_id
    FROM cars_v2
)
SELECT 
    'Vérification des trous' as info,
    COUNT(*) as holes_count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Aucun trou'
        ELSE '❌ Trou(s) détecté(s)'
    END as status
FROM sequence_check
WHERE id != expected_id;

-- Vérifier l'intégrité des références
SELECT 
    'Intégrité des références' as info,
    COUNT(*) as total_references,
    COUNT(CASE WHEN c.id IS NOT NULL THEN 1 END) as valid_references,
    COUNT(CASE WHEN c.id IS NULL THEN 1 END) as invalid_references,
    CASE 
        WHEN COUNT(CASE WHEN c.id IS NULL THEN 1 END) = 0 THEN '✅ Toutes valides'
        ELSE '❌ Références invalides'
    END as status
FROM advertisements a
LEFT JOIN cars_v2 c ON a.car_id = c.id
WHERE a.car_id IS NOT NULL;

-- =====================================================
-- 6. NETTOYAGE
-- =====================================================

-- Supprimer la table temporaire
DROP TABLE cars_v2_reorder;

-- =====================================================
-- 7. TEST D'INSERTION
-- =====================================================

-- Test d'insertion pour vérifier que la séquence fonctionne
-- (Commentez cette section si vous ne voulez pas insérer de données de test)

/*
INSERT INTO cars_v2 (
    year, first_registration, mileage, color, gearbox, 
    din_power, nb_seats, nb_doors, average_consumption, 
    road_consumption, city_consumption, emissions, 
    location, fiscal_power, status, brand_id, model_id, 
    vehicle_type_id, fuel_type_id, brand, model, type, fuel_type
) VALUES (
    2024, '2024-01-01', 1000, 'BLANC', 'M', 
    100, 5, 5, 5.0, 4.5, 6.0, 120, 
    'Paris (75)', 8, 'disponible', 1, 1, 
    1, 1, 'TEST', 'SEQUENCE_TEST', 'BERLINE', 'ESSENCE'
) RETURNING id, reference, brand, model;
*/

-- =====================================================
-- FIN DE TRANSACTION
-- =====================================================

-- Si tout est OK, valider les changements
COMMIT;

-- Si vous voulez annuler, utilisez ROLLBACK à la place de COMMIT
-- ROLLBACK;

-- =====================================================
-- MESSAGES FINAUX
-- =====================================================

SELECT '✅ Script terminé avec succès!' as message;
SELECT '📋 Vérifiez les résultats ci-dessus avant de continuer' as reminder;
SELECT '🔄 La séquence est maintenant réorganisée de 1 à ' || (SELECT COUNT(*) FROM cars_v2) as summary; 