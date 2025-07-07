-- Script SQL robuste pour réorganiser les IDs de cars_v2
-- Version alternative avec meilleure gestion des contraintes et index

BEGIN;

-- Étape 1: Créer une table temporaire pour stocker les mappings
CREATE TEMP TABLE id_mapping (
    old_id BIGINT,
    new_id BIGINT
);

-- Étape 2: Générer les nouveaux IDs consécutifs
INSERT INTO id_mapping (old_id, new_id)
SELECT 
    id as old_id,
    ROW_NUMBER() OVER (ORDER BY id) as new_id
FROM cars_v2
ORDER BY id;

-- Étape 3: Désactiver temporairement les contraintes de clé étrangère
ALTER TABLE advertisements DROP CONSTRAINT IF EXISTS advertisements_car_id_fkey;

-- Étape 4: Créer une nouvelle table avec la structure complète
CREATE TABLE cars_v2_new (
    LIKE cars_v2 INCLUDING ALL
);

-- Étape 5: Copier les données avec les nouveaux IDs
-- Utiliser une approche plus simple en copiant d'abord toutes les données
INSERT INTO cars_v2_new SELECT * FROM cars_v2;

-- Puis mettre à jour les IDs avec les nouveaux
UPDATE cars_v2_new 
SET id = m.new_id
FROM id_mapping m
WHERE cars_v2_new.id = m.old_id;

-- Étape 6: Mettre à jour les références dans advertisements
UPDATE advertisements 
SET car_id = m.new_id
FROM id_mapping m
WHERE advertisements.car_id = m.old_id;

-- Étape 7: Supprimer l'ancienne table et renommer la nouvelle
DROP TABLE cars_v2;
ALTER TABLE cars_v2_new RENAME TO cars_v2;

-- Étape 8: Recréer les contraintes principales
ALTER TABLE cars_v2 ADD CONSTRAINT cars_v2_pkey PRIMARY KEY (id);

-- Étape 9: Recréer la contrainte de clé étrangère
ALTER TABLE advertisements ADD CONSTRAINT advertisements_car_id_fkey 
    FOREIGN KEY (car_id) REFERENCES cars_v2(id) ON DELETE CASCADE;

-- Étape 10: Réinitialiser la séquence
-- Vérifier d'abord le nom exact de la séquence
DO $$
DECLARE
    seq_name text;
BEGIN
    -- Trouver le nom de la séquence associée à la colonne id de cars_v2
    SELECT pg_get_serial_sequence('cars_v2', 'id') INTO seq_name;
    
    IF seq_name IS NOT NULL THEN
        EXECUTE format('SELECT setval(%L, (SELECT MAX(id) FROM cars_v2), true)', seq_name);
        RAISE NOTICE 'Séquence % réinitialisée', seq_name;
    ELSE
        RAISE NOTICE 'Aucune séquence trouvée pour cars_v2.id';
    END IF;
END $$;

-- Étape 11: Vérifications de sécurité
-- Vérifier que les IDs sont consécutifs
DO $$
DECLARE
    total_count integer;
    min_id bigint;
    max_id bigint;
    expected_count bigint;
BEGIN
    SELECT COUNT(*), MIN(id), MAX(id) 
    INTO total_count, min_id, max_id
    FROM cars_v2;
    
    expected_count := max_id - min_id + 1;
    
    IF total_count != expected_count THEN
        RAISE EXCEPTION 'Les IDs ne sont pas consécutifs! Total: %, Attendu: %', total_count, expected_count;
    ELSE
        RAISE NOTICE 'Vérification des IDs consécutifs: OK (Total: %, Min: %, Max: %)', total_count, min_id, max_id;
    END IF;
END $$;

-- Vérifier l'intégrité référentielle
DO $$
DECLARE
    orphaned_count integer;
BEGIN
    SELECT COUNT(*) INTO orphaned_count
    FROM advertisements a
    LEFT JOIN cars_v2 c ON a.car_id = c.id
    WHERE c.id IS NULL;
    
    IF orphaned_count > 0 THEN
        RAISE EXCEPTION 'Intégrité référentielle compromise! % advertisements orphelins', orphaned_count;
    ELSE
        RAISE NOTICE 'Vérification intégrité référentielle: OK';
    END IF;
END $$;

-- Nettoyer
DROP TABLE id_mapping;

COMMIT;

-- Message final
SELECT 'Réorganisation des IDs terminée avec succès!' as status; 