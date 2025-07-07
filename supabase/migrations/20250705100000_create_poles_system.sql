-- Migration pour créer le système de pôles métiers
-- Migration: 20250705100000_create_poles_system

-- Créer la table poles
CREATE TABLE IF NOT EXISTS poles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer la table user_poles (relation utilisateur ↔ pôle)
CREATE TABLE IF NOT EXISTS user_poles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(auth_user_id) ON DELETE CASCADE,
  pole_id INTEGER REFERENCES poles(id) ON DELETE CASCADE,
  role_level INTEGER NOT NULL CHECK (role_level BETWEEN 1 AND 5),
  granted_by UUID REFERENCES users(auth_user_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, pole_id) -- Un utilisateur ne peut être affecté qu'une fois à un pôle
);

-- Créer les index pour l'accès rapide
CREATE INDEX IF NOT EXISTS idx_user_poles_user_id ON user_poles (user_id);
CREATE INDEX IF NOT EXISTS idx_user_poles_pole_id ON user_poles (pole_id);

-- Insérer les pôles de base
INSERT INTO poles (name, description) VALUES 
  ('Pricing', 'Gestion du pricing des véhicules pour chaque marché'),
  ('Marketing', 'Gestion des campagnes marketing et communication'),
  ('Technique', 'Gestion technique et maintenance des véhicules'),
  ('Commercial', 'Gestion commerciale et relation client'),
  ('Direction', 'Direction générale et administration'),
  ('Stock', 'Gestion du stock et inventaire'),
  ('Transport', 'Gestion des transports et logistique'),
  ('Entretien', 'Gestion des entretiens et réparations'),
  ('IT', 'Gestion informatique et systèmes'),
  ('ACSG', 'Gestion administrative, comptable, sociale et générale')
ON CONFLICT (name) DO NOTHING;

-- Créer une fonction pour obtenir le niveau d'accès d'un utilisateur à un pôle
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
    up.role_level,
    CASE 
      WHEN up.role_level <= 5 THEN TRUE
      ELSE FALSE
    END as can_read,
    CASE 
      WHEN up.role_level <= 4 THEN TRUE
      ELSE FALSE
    END as can_write,
    CASE 
      WHEN up.role_level <= 3 THEN TRUE
      ELSE FALSE
    END as can_manage
  FROM user_poles up
  JOIN poles p ON up.pole_id = p.id
  WHERE up.user_id = p_user_id 
  AND p.name = p_pole_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer une fonction pour obtenir tous les pôles d'un utilisateur
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
    up.role_level,
    CASE 
      WHEN up.role_level <= 5 THEN TRUE
      ELSE FALSE
    END as can_read,
    CASE 
      WHEN up.role_level <= 4 THEN TRUE
      ELSE FALSE
    END as can_write,
    CASE 
      WHEN up.role_level <= 3 THEN TRUE
      ELSE FALSE
    END as can_manage
  FROM user_poles up
  JOIN poles p ON up.pole_id = p.id
  WHERE up.user_id = p_user_id
  ORDER BY p.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Activer RLS sur user_poles
ALTER TABLE user_poles ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir leurs droits de pôle
CREATE POLICY "Users can see their pole rights"
ON user_poles
FOR SELECT
USING (auth.uid() = user_id);

-- Politique pour permettre aux managers (niveau 1-3) de gérer les affectations
CREATE POLICY "Managers can manage pole assignments"
ON user_poles
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_poles up2
    JOIN poles p ON up2.pole_id = p.id
    WHERE up2.user_id = auth.uid()
    AND up2.role_level <= 3
  )
);

-- Commentaires pour documenter
COMMENT ON TABLE poles IS 'Pôles métiers de l''entreprise';
COMMENT ON TABLE user_poles IS 'Affectation des utilisateurs aux pôles avec niveau d''accès';
COMMENT ON FUNCTION get_user_pole_access IS 'Obtient le niveau d''accès d''un utilisateur à un pôle spécifique';
COMMENT ON FUNCTION get_user_poles IS 'Obtient tous les pôles et niveaux d''accès d''un utilisateur'; 