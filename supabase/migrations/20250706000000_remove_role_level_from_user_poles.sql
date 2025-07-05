-- Migration pour supprimer role_level de user_poles et simplifier le système
-- Migration: 20250706000000_remove_role_level_from_user_poles

-- 1. Supprimer les politiques RLS qui dépendent de role_level
DROP POLICY IF EXISTS "Users can see their pole rights" ON user_poles;
DROP POLICY IF EXISTS "Managers can manage pole assignments" ON user_poles;

-- 2. Supprimer les fonctions qui utilisent role_level dans user_poles
DROP FUNCTION IF EXISTS get_user_pole_access(UUID, TEXT);
DROP FUNCTION IF EXISTS get_user_poles(UUID);

-- 3. Supprimer le champ role_level de la table user_poles
ALTER TABLE user_poles DROP COLUMN IF EXISTS role_level;

-- 3. Mettre à jour la table user_poles pour utiliser le système de rôles hiérarchiques
-- Ajouter une contrainte pour s'assurer qu'un utilisateur ne peut être affecté qu'une fois à un pôle
ALTER TABLE user_poles ADD CONSTRAINT unique_user_pole UNIQUE(user_id, pole_id);

-- 4. Créer une nouvelle fonction qui utilise le système de rôles hiérarchiques
CREATE OR REPLACE FUNCTION get_user_pole_access(
  p_user_id UUID,
  p_pole_name TEXT
)
RETURNS TABLE (
  role_level INTEGER,
  can_read BOOLEAN,
  can_write BOOLEAN,
  can_manage BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.niveau as role_level,
    CASE 
      WHEN r.niveau <= 5 THEN TRUE
      ELSE FALSE
    END as can_read,
    CASE 
      WHEN r.niveau <= 4 THEN TRUE
      ELSE FALSE
    END as can_write,
    CASE 
      WHEN r.niveau <= 3 THEN TRUE
      ELSE FALSE
    END as can_manage
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  JOIN user_poles up ON ur.user_id = up.user_id
  JOIN poles p ON up.pole_id = p.id
  WHERE ur.user_id = p_user_id 
  AND p.name = p_pole_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Créer une fonction pour obtenir tous les pôles d'un utilisateur avec ses permissions
CREATE OR REPLACE FUNCTION get_user_poles(p_user_id UUID)
RETURNS TABLE (
  pole_id INTEGER,
  pole_name TEXT,
  pole_description TEXT,
  role_level INTEGER,
  can_read BOOLEAN,
  can_write BOOLEAN,
  can_manage BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as pole_id,
    p.name as pole_name,
    p.description as pole_description,
    r.niveau as role_level,
    CASE 
      WHEN r.niveau <= 5 THEN TRUE
      ELSE FALSE
    END as can_read,
    CASE 
      WHEN r.niveau <= 4 THEN TRUE
      ELSE FALSE
    END as can_write,
    CASE 
      WHEN r.niveau <= 3 THEN TRUE
      ELSE FALSE
    END as can_manage
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  JOIN user_poles up ON ur.user_id = up.user_id
  JOIN poles p ON up.pole_id = p.id
  WHERE ur.user_id = p_user_id
  ORDER BY p.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Créer une fonction pour vérifier si un utilisateur a accès à un pôle
CREATE OR REPLACE FUNCTION has_pole_access(
  p_user_id UUID,
  p_pole_name TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_poles up
    JOIN poles p ON up.pole_id = p.id
    WHERE up.user_id = p_user_id 
    AND p.name = p_pole_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Créer une fonction pour obtenir le niveau d'accès d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_access_level(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  user_level INTEGER;
BEGIN
  SELECT r.niveau INTO user_level
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = p_user_id;
  
  RETURN COALESCE(user_level, 5); -- Par défaut niveau 5 si aucun rôle
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Mettre à jour les commentaires
COMMENT ON FUNCTION get_user_pole_access IS 'Obtient le niveau d''accès d''un utilisateur à un pôle spécifique (utilise le système de rôles hiérarchiques)';
COMMENT ON FUNCTION get_user_poles IS 'Obtient tous les pôles et niveaux d''accès d''un utilisateur (utilise le système de rôles hiérarchiques)';
COMMENT ON FUNCTION has_pole_access IS 'Vérifie si un utilisateur a accès à un pôle spécifique';
COMMENT ON FUNCTION get_user_access_level IS 'Obtient le niveau d''accès global d''un utilisateur';

-- 9. Mettre à jour les politiques RLS pour user_poles
-- Politique pour permettre aux utilisateurs de voir leurs affectations de pôles
CREATE POLICY "Users can see their pole assignments"
ON user_poles
FOR SELECT
USING (auth.uid() = user_id);

-- Politique pour permettre aux managers (niveau 1-3) de gérer les affectations
CREATE POLICY "Managers can manage pole assignments"
ON user_poles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.niveau <= 3
  )
);

-- 10. Ajouter des commentaires pour documenter les changements
COMMENT ON TABLE user_poles IS 'Affectation des utilisateurs aux pôles (sans niveau d''accès - utilise le système de rôles hiérarchiques)';
COMMENT ON COLUMN user_poles.user_id IS 'UUID de l''utilisateur affecté au pôle';
COMMENT ON COLUMN user_poles.pole_id IS 'ID du pôle auquel l''utilisateur est affecté'; 