-- Fonction pour mettre à jour un utilisateur (contourne RLS)
CREATE OR REPLACE FUNCTION update_user_info(
  p_user_id UUID,
  p_prenom TEXT DEFAULT NULL,
  p_nom TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_telephone TEXT DEFAULT NULL,
  p_role_id INTEGER DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_old_role_id INTEGER;
BEGIN
  -- Mettre à jour les informations de base de l'utilisateur
  IF p_prenom IS NOT NULL OR p_nom IS NOT NULL OR p_email IS NOT NULL OR p_telephone IS NOT NULL THEN
    UPDATE users 
    SET 
      prenom = COALESCE(p_prenom, prenom),
      nom = COALESCE(p_nom, nom),
      email = COALESCE(p_email, email),
      telephone = COALESCE(p_telephone, telephone)
    WHERE id = p_user_id;
  END IF;

  -- Mettre à jour le rôle si spécifié
  IF p_role_id IS NOT NULL THEN
    -- Récupérer l'ancien rôle
    SELECT role_id INTO v_old_role_id
    FROM user_roles
    WHERE user_id = p_user_id
    LIMIT 1;

    -- Supprimer l'ancien rôle s'il existe
    IF v_old_role_id IS NOT NULL THEN
      DELETE FROM user_roles WHERE user_id = p_user_id;
      
      -- Enregistrer dans l'historique
      INSERT INTO historique_acces (user_id, ancien_role_id, nouveau_role_id)
      VALUES (p_user_id, v_old_role_id, p_role_id);
    END IF;

    -- Insérer le nouveau rôle
    INSERT INTO user_roles (user_id, role_id, date_attribution)
    VALUES (p_user_id, p_role_id, NOW());
  END IF;
END;
$$;

-- Fonction pour créer un utilisateur (contourne RLS)
CREATE OR REPLACE FUNCTION create_user_with_role(
  p_auth_user_id UUID,
  p_prenom TEXT,
  p_nom TEXT,
  p_email TEXT,
  p_telephone TEXT DEFAULT NULL,
  p_role_id INTEGER DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Créer l'utilisateur dans la table users
  INSERT INTO users (
    id,
    auth_user_id,
    prenom,
    nom,
    email,
    telephone,
    actif,
    date_creation
  ) VALUES (
    p_auth_user_id,
    p_auth_user_id,
    p_prenom,
    p_nom,
    p_email,
    p_telephone,
    true,
    NOW()
  );

  -- Assigner le rôle
  INSERT INTO user_roles (user_id, role_id, date_attribution)
  VALUES (p_auth_user_id, p_role_id, NOW());
END;
$$;

-- Fonction pour mettre à jour le statut d'un utilisateur (contourne RLS)
CREATE OR REPLACE FUNCTION update_user_status(
  p_user_id UUID,
  p_actif BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE users 
  SET actif = p_actif
  WHERE id = p_user_id;
END;
$$;

-- Fonction pour réinitialiser le mot de passe d'un utilisateur (contourne RLS)
CREATE OR REPLACE FUNCTION reset_user_password(
  p_user_id UUID,
  p_new_password TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Cette fonction sera appelée depuis le service avec les privilèges admin
  -- La mise à jour du mot de passe se fait via l'API auth.admin
  -- Cette fonction sert juste de placeholder pour la cohérence
  NULL;
END;
$$;

-- Donner les permissions d'exécution aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION update_user_info(UUID, TEXT, TEXT, TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_with_role(UUID, TEXT, TEXT, TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_status(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION reset_user_password(UUID, TEXT) TO authenticated; 