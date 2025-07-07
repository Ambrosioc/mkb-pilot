-- Script SQL pour réorganiser les IDs de cars_v2 de manière transactionnelle
-- Ce script préserve l'intégrité référentielle avec la table advertisements

BEGIN;

-- Étape 1: Créer une table temporaire pour stocker les mappings d'anciens vers nouveaux IDs
CREATE TEMP TABLE id_mapping (
    old_id BIGINT,
    new_id BIGINT
);

-- Étape 2: Générer les nouveaux IDs consécutifs et stocker le mapping
INSERT INTO id_mapping (old_id, new_id)
SELECT 
    id as old_id,
    ROW_NUMBER() OVER (ORDER BY id) as new_id
FROM cars_v2
ORDER BY id;

-- Étape 3: Créer une nouvelle table cars_v2 avec la structure identique
CREATE TABLE cars_v2_new (
    LIKE cars_v2 INCLUDING ALL
);

-- Étape 4: Copier les données avec les nouveaux IDs
-- Utiliser une approche plus simple en copiant d'abord toutes les données
INSERT INTO cars_v2_new SELECT * FROM cars_v2;

-- Puis mettre à jour les IDs avec les nouveaux
UPDATE cars_v2_new 
SET id = m.new_id
FROM id_mapping m
WHERE cars_v2_new.id = m.old_id;

-- Étape 5: Désactiver temporairement la contrainte de clé étrangère
ALTER TABLE advertisements DROP CONSTRAINT IF EXISTS advertisements_car_id_fkey;

-- Étape 6: Mettre à jour les références dans advertisements
UPDATE advertisements 
SET car_id = m.new_id
FROM id_mapping m
WHERE advertisements.car_id = m.old_id;

-- Étape 7: Supprimer l'ancienne table et renommer la nouvelle
DROP TABLE cars_v2;
ALTER TABLE cars_v2_new RENAME TO cars_v2;

-- Étape 8: Recréer les contraintes et index (ajustez selon vos besoins)
-- Clé primaire
ALTER TABLE cars_v2 ADD CONSTRAINT cars_v2_pkey PRIMARY KEY (id);

-- Recréer la contrainte de clé étrangère
ALTER TABLE advertisements ADD CONSTRAINT advertisements_car_id_fkey 
    FOREIGN KEY (car_id) REFERENCES cars_v2(id);

-- Étape 9: Réinitialiser la séquence auto-incrémentée
-- Trouver le nom de la séquence (ajustez selon votre configuration)
SELECT setval('vehicles_id_seq', (SELECT MAX(id) FROM cars_v2), true);

-- Étape 10: Vérification (optionnel - commentez si vous voulez)
-- Vérifier que les IDs sont bien consécutifs
SELECT 
    'Vérification des IDs consécutifs' as check_type,
    COUNT(*) as total_records,
    MIN(id) as min_id,
    MAX(id) as max_id,
    MAX(id) - MIN(id) + 1 as expected_consecutive_count
FROM cars_v2;

-- Vérifier l'intégrité référentielle
SELECT 
    'Vérification intégrité référentielle' as check_type,
    COUNT(*) as orphaned_advertisements
FROM advertisements a
LEFT JOIN cars_v2 c ON a.car_id = c.id
WHERE c.id IS NULL;

-- Nettoyer la table temporaire
DROP TABLE id_mapping;

COMMIT;

-- Message de confirmation
SELECT 'Réorganisation des IDs terminée avec succès!' as status; 