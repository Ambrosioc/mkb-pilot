-- Script pour tester l'inscription directement dans la base de données
-- Ce script simule le processus d'inscription complet

BEGIN;

-- 1. Créer un utilisateur de test dans auth.users
DO $$
DECLARE
    test_auth_id UUID := gen_random_uuid();
    test_email TEXT := 'test-' || extract(epoch from now())::text || '@example.com';
    test_password_hash TEXT := 'dummy_hash_for_testing';
BEGIN
    -- Insérer un utilisateur de test dans auth.users
    INSERT INTO auth.users (
        id, 
        email, 
        encrypted_password, 
        email_confirmed_at, 
        created_at, 
        updated_at,
        raw_user_meta_data
    )
    VALUES (
        test_auth_id, 
        test_email, 
        test_password_hash, 
        NOW(), 
        NOW(), 
        NOW(),
        '{"full_name": "Test User", "role": "user"}'::jsonb
    );
    
    RAISE NOTICE '✅ Utilisateur créé dans auth.users: %', test_auth_id;
    
    -- 2. Tester la fonction create_user_profile
    RAISE NOTICE '🔧 Test de la fonction create_user_profile...';
    PERFORM create_user_profile(test_auth_id, 'Test', 'User', test_email);
    
    -- 3. Vérifier que le profil a été créé
    IF EXISTS (SELECT 1 FROM users WHERE auth_user_id = test_auth_id) THEN
        RAISE NOTICE '✅ Profil utilisateur créé avec succès';
        
        -- Afficher les données créées
        RAISE NOTICE '📊 Données créées:';
        RAISE NOTICE '   - auth.users: %', test_auth_id;
        RAISE NOTICE '   - users: %', (SELECT id FROM users WHERE auth_user_id = test_auth_id);
        RAISE NOTICE '   - prenom: %', (SELECT prenom FROM users WHERE auth_user_id = test_auth_id);
        RAISE NOTICE '   - nom: %', (SELECT nom FROM users WHERE auth_user_id = test_auth_id);
        RAISE NOTICE '   - Paramètres passés: prenom="Test", nom="User"';
    ELSE
        RAISE NOTICE '❌ Échec de la création du profil utilisateur';
    END IF;
    
    -- 4. Nettoyer (optionnel - commentez pour garder les données de test)
    -- DELETE FROM users WHERE auth_user_id = test_auth_id;
    -- DELETE FROM auth.users WHERE id = test_auth_id;
    -- RAISE NOTICE '🧹 Données de test nettoyées';
END $$;

-- 5. Afficher les résultats
SELECT 
    'Résultats du test' as test_type,
    (SELECT COUNT(*) FROM auth.users) as auth_users_count,
    (SELECT COUNT(*) FROM users) as users_count;

-- 6. Afficher les données créées
SELECT 
    'Données auth.users' as source,
    id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 3;

SELECT 
    'Données users' as source,
    id,
    auth_user_id,
    prenom,
    nom,
    email,
    actif,
    date_creation
FROM users
ORDER BY date_creation DESC
LIMIT 3;

COMMIT;

SELECT 'Test d\'inscription terminé!' as status; 