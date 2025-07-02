-- Script pour nettoyer les utilisateurs de test
-- ⚠️ ATTENTION: Ce script supprime les utilisateurs de test

BEGIN;

-- Afficher les utilisateurs avant suppression
SELECT 
    'Utilisateurs avant suppression' as info,
    id,
    auth_user_id,
    prenom,
    nom,
    email,
    date_creation
FROM users
ORDER BY date_creation DESC;

-- Supprimer les utilisateurs de test (email contenant 'test' ou 'example')
DELETE FROM users 
WHERE email LIKE '%test%' 
   OR email LIKE '%example%'
   OR email = 'a.cazimira@gmail.com'; -- Utilisateur de test spécifique

-- Supprimer les utilisateurs correspondants dans auth.users
DELETE FROM auth.users 
WHERE email LIKE '%test%' 
   OR email LIKE '%example%'
   OR email = 'a.cazimira@gmail.com'; -- Utilisateur de test spécifique

-- Afficher les utilisateurs après suppression
SELECT 
    'Utilisateurs après suppression' as info,
    id,
    auth_user_id,
    prenom,
    nom,
    email,
    date_creation
FROM users
ORDER BY date_creation DESC;

-- Statistiques finales
SELECT 
    'Statistiques finales' as info,
    (SELECT COUNT(*) FROM auth.users) as auth_users_count,
    (SELECT COUNT(*) FROM users) as users_count;

COMMIT;

SELECT 'Nettoyage terminé!' as status; 