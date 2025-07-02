-- Script pour corriger les noms et prénoms dupliqués dans la table users
-- Ce script nettoie les données existantes qui ont le problème de doublon

BEGIN;

-- 1. Afficher les utilisateurs avec des noms/prénoms dupliqués
SELECT 
    'Utilisateurs avec noms/prénoms dupliqués' as check_type,
    id,
    auth_user_id,
    prenom,
    nom,
    email,
    date_creation
FROM users
WHERE prenom LIKE '% %' OR nom LIKE '% %'
ORDER BY date_creation DESC;

-- 2. Corriger les noms et prénoms dupliqués
-- Exemple: "Ambrosie CAZIMIRA" devient "Ambrosie" pour prénom et "CAZIMIRA" pour nom
UPDATE users 
SET 
    prenom = CASE 
        WHEN prenom LIKE '% %' THEN 
            SPLIT_PART(prenom, ' ', 1)
        ELSE prenom
    END,
    nom = CASE 
        WHEN nom LIKE '% %' THEN 
            SPLIT_PART(nom, ' ', 2)
        WHEN nom LIKE '% %' AND SPLIT_PART(nom, ' ', 2) = '' THEN
            SPLIT_PART(nom, ' ', 1)
        ELSE nom
    END
WHERE prenom LIKE '% %' OR nom LIKE '% %';

-- 3. Vérifier les corrections
SELECT 
    'Utilisateurs après correction' as check_type,
    id,
    auth_user_id,
    prenom,
    nom,
    email,
    date_creation
FROM users
ORDER BY date_creation DESC
LIMIT 10;

-- 4. Statistiques après correction
SELECT 
    'Statistiques après correction' as info_type,
    COUNT(*) as total_users,
    COUNT(CASE WHEN prenom LIKE '% %' THEN 1 END) as users_with_duplicate_prenom,
    COUNT(CASE WHEN nom LIKE '% %' THEN 1 END) as users_with_duplicate_nom;

COMMIT;

-- Message de confirmation
SELECT 'Correction des noms/prénoms dupliqués terminée!' as status; 