-- Migration pour ajouter les politiques RLS pour la gestion des rôles et pôles
-- Date: 2025-07-10
-- Description: Permet aux utilisateurs autorisés de gérer les rôles et pôles

-- Activer RLS sur les tables si ce n'est pas déjà fait
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE poles ENABLE ROW LEVEL SECURITY;

-- Politiques pour la table roles
-- Permettre la lecture à tous les utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to read roles" ON roles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Permettre l'insertion, modification et suppression aux utilisateurs avec un niveau de rôle élevé (G4 et CEO)
CREATE POLICY "Allow G4+ users to manage roles" ON roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.niveau <= 2  -- G4 et CEO
        )
    );

-- Politiques pour la table poles
-- Permettre la lecture à tous les utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to read poles" ON poles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Permettre l'insertion, modification et suppression aux utilisateurs avec un niveau de rôle élevé (G4 et CEO)
CREATE POLICY "Allow G4+ users to manage poles" ON poles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.niveau <= 2  -- G4 et CEO
        )
    );

-- Politiques pour la table user_roles (si elle n'en a pas déjà)
-- Permettre la lecture à tous les utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to read user_roles" ON user_roles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Permettre la gestion aux utilisateurs avec un niveau de rôle élevé
CREATE POLICY "Allow G4+ users to manage user_roles" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.niveau <= 2  -- G4 et CEO
        )
    );

-- Politiques pour la table user_poles (si elle n'en a pas déjà)
-- Permettre la lecture à tous les utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to read user_poles" ON user_poles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Permettre la gestion aux utilisateurs avec un niveau de rôle élevé
CREATE POLICY "Allow G4+ users to manage user_poles" ON user_poles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid()
            AND r.niveau <= 2  -- G4 et CEO
        )
    );

-- Log de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Migration add_roles_poles_rls_policies terminée avec succès';
    RAISE NOTICE 'Politiques RLS ajoutées pour la gestion des rôles et pôles';
END $$; 