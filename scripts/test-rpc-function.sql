-- Script pour tester directement la fonction RPC create_user_profile
-- Ce script teste la fonction avec les vraies valeurs

BEGIN;

-- Nettoyer les données de test précédentes
DELETE FROM users WHERE email LIKE '%test%';
DELETE FROM auth.users WHERE email LIKE '%test%';

-- Créer un utilisateur de test dans auth.users
DO $$
DECLARE
    test_auth_id UUID := gen_random_uuid();
    test_email TEXT := 'test-rpc-' || extract(epoch from now())::text || '@example.com';
BEGIN
    -- Insérer un utilisateur de test dans auth.users
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
    VALUES (test_auth_id, test_email, 'dummy_hash', NOW(), NOW(), NOW());
    
    RAISE NOTICE '✅ Utilisateur créé dans auth.users: %', test_auth_id;
    
    -- Tester la fonction RPC avec les vraies valeurs
    RAISE NOTICE '🔧 Test de la fonction RPC avec prenom="Ambrosie", nom="CAZIMIRA"...';
    PERFORM create_user_profile(test_auth_id, 'Ambrosie', 'CAZIMIRA', test_email);
    
    -- Vérifier le résultat
    RAISE NOTICE '📊 Résultat dans la table users:';
    RAISE NOTICE '   - prenom: %', (SELECT prenom FROM users WHERE auth_user_id = test_auth_id);
    RAISE NOTICE '   - nom: %', (SELECT nom FROM users WHERE auth_user_id = test_auth_id);
    
    -- Vérifier que les valeurs sont correctes
    IF (SELECT prenom FROM users WHERE auth_user_id = test_auth_id) = 'Ambrosie' 
       AND (SELECT nom FROM users WHERE auth_user_id = test_auth_id) = 'CAZIMIRA' THEN
        RAISE NOTICE '✅ Test RPC: SUCCESS - Les valeurs sont correctes';
    ELSE
        RAISE NOTICE '❌ Test RPC: FAILED - Les valeurs sont incorrectes';
    END IF;
    
    -- Nettoyer
    DELETE FROM users WHERE auth_user_id = test_auth_id;
    DELETE FROM auth.users WHERE id = test_auth_id;
    RAISE NOTICE '🧹 Données de test nettoyées';
END $$;

COMMIT;

SELECT 'Test de la fonction RPC terminé!' as status; 