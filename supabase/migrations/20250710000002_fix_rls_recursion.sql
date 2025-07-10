-- Migration pour corriger la récursion infinie dans les politiques RLS
-- Date: 2025-07-10
-- Description: Supprime les politiques problématiques et les remplace par des politiques plus simples

-- Supprimer les politiques problématiques qui causent la récursion
DROP POLICY IF EXISTS "Allow G4+ users to manage user_roles" ON user_roles;
DROP POLICY IF EXISTS "Allow G4+ users to manage user_poles" ON user_poles;

-- Créer des politiques plus simples pour user_roles
-- Permettre la lecture à tous les utilisateurs authentifiés
DROP POLICY IF EXISTS "Allow authenticated users to read user_roles" ON user_roles;
CREATE POLICY "Allow authenticated users to read user_roles" ON user_roles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Permettre la gestion aux utilisateurs authentifiés (temporairement, pour éviter la récursion)
CREATE POLICY "Allow authenticated users to manage user_roles" ON user_roles
    FOR ALL USING (auth.role() = 'authenticated');

-- Créer des politiques plus simples pour user_poles
-- Permettre la lecture à tous les utilisateurs authentifiés
DROP POLICY IF EXISTS "Allow authenticated users to read user_poles" ON user_poles;
CREATE POLICY "Allow authenticated users to read user_poles" ON user_poles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Permettre la gestion aux utilisateurs authentifiés (temporairement, pour éviter la récursion)
CREATE POLICY "Allow authenticated users to manage user_poles" ON user_poles
    FOR ALL USING (auth.role() = 'authenticated');

-- Log de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Migration fix_rls_recursion terminée avec succès';
    RAISE NOTICE 'Politiques RLS corrigées pour éviter la récursion infinie';
END $$; 