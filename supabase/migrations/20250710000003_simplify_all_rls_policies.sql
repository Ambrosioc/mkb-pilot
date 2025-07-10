-- Migration pour simplifier toutes les politiques RLS et éviter la récursion
-- Date: 2025-07-10
-- Description: Remplace toutes les politiques RLS par des politiques simples

-- Supprimer toutes les politiques existantes pour éviter les conflits
DROP POLICY IF EXISTS "Allow authenticated users to read roles" ON roles;
DROP POLICY IF EXISTS "Allow G4+ users to manage roles" ON roles;
DROP POLICY IF EXISTS "Allow authenticated users to read poles" ON poles;
DROP POLICY IF EXISTS "Allow G4+ users to manage poles" ON poles;
DROP POLICY IF EXISTS "Allow authenticated users to read user_roles" ON user_roles;
DROP POLICY IF EXISTS "Allow authenticated users to manage user_roles" ON user_roles;
DROP POLICY IF EXISTS "Allow authenticated users to read user_poles" ON user_poles;
DROP POLICY IF EXISTS "Allow authenticated users to manage user_poles" ON user_poles;

-- Politiques simples pour roles - permettre tout aux utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to manage roles" ON roles
    FOR ALL USING (auth.role() = 'authenticated');

-- Politiques simples pour poles - permettre tout aux utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to manage poles" ON poles
    FOR ALL USING (auth.role() = 'authenticated');

-- Politiques simples pour user_roles - permettre tout aux utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to manage user_roles" ON user_roles
    FOR ALL USING (auth.role() = 'authenticated');

-- Politiques simples pour user_poles - permettre tout aux utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to manage user_poles" ON user_poles
    FOR ALL USING (auth.role() = 'authenticated');

-- Log de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Migration simplify_all_rls_policies terminée avec succès';
    RAISE NOTICE 'Toutes les politiques RLS ont été simplifiées pour éviter la récursion';
END $$; 