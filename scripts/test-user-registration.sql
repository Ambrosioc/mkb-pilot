-- Script de test pour vérifier l'inscription utilisateur
-- Exécutez ce script après avoir testé l'inscription via l'interface

-- 1. Vérifier les utilisateurs dans auth.users
SELECT 
    'auth.users' as table_name,
    id,
    email,
    created_at,
    updated_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 2. Vérifier les profils utilisateurs dans users
SELECT 
    'users' as table_name,
    id,
    auth_user_id,
    prenom,
    nom,
    email,
    actif,
    date_creation
FROM users
ORDER BY date_creation DESC
LIMIT 5;

-- 3. Vérifier la correspondance entre auth.users et users
SELECT 
    'Correspondance auth.users ↔ users' as check_type,
    au.id as auth_user_id,
    au.email as auth_email,
    u.id as user_id,
    u.prenom,
    u.nom,
    u.email as user_email,
    CASE 
        WHEN u.id IS NULL THEN '❌ Profil manquant'
        WHEN au.id IS NULL THEN '❌ Auth manquant'
        ELSE '✅ OK'
    END as status
FROM auth.users au
LEFT JOIN users u ON au.id = u.auth_user_id
ORDER BY au.created_at DESC
LIMIT 10;

-- 4. Vérifier les utilisateurs orphelins (auth.users sans profil)
SELECT 
    'Utilisateurs orphelins (auth.users sans profil)' as check_type,
    COUNT(*) as count
FROM auth.users au
LEFT JOIN users u ON au.id = u.auth_user_id
WHERE u.id IS NULL;

-- 5. Vérifier les profils orphelins (users sans auth.users)
SELECT 
    'Profils orphelins (users sans auth.users)' as check_type,
    COUNT(*) as count
FROM users u
LEFT JOIN auth.users au ON u.auth_user_id = au.id
WHERE au.id IS NULL;

-- 6. Tester la fonction RPC create_user_profile
DO $$
DECLARE
    test_auth_id UUID := gen_random_uuid();
    test_email TEXT := 'test-' || extract(epoch from now())::text || '@example.com';
BEGIN
    -- Insérer un utilisateur de test dans auth.users
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (test_auth_id, test_email, 'dummy_hash', NOW(), NOW(), NOW());
    
    -- Tester la fonction create_user_profile
    PERFORM create_user_profile(test_auth_id, 'Test', 'User', test_email);
    
    -- Vérifier que le profil a été créé
    IF EXISTS (SELECT 1 FROM users WHERE auth_user_id = test_auth_id) THEN
        RAISE NOTICE '✅ Test create_user_profile: SUCCESS';
    ELSE
        RAISE NOTICE '❌ Test create_user_profile: FAILED';
    END IF;
    
    -- Nettoyer
    DELETE FROM users WHERE auth_user_id = test_auth_id;
    DELETE FROM auth.users WHERE id = test_auth_id;
END $$;

-- 7. Statistiques générales
SELECT 
    'Statistiques' as info_type,
    (SELECT COUNT(*) FROM auth.users) as auth_users_count,
    (SELECT COUNT(*) FROM users) as users_count,
    (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NOT NULL) as confirmed_users_count,
    (SELECT COUNT(*) FROM users WHERE actif = true) as active_users_count; 