-- Fonction pour réinitialiser le mot de passe d'un utilisateur (contourne les restrictions d'API)
CREATE OR REPLACE FUNCTION reset_user_password_rpc(
  p_user_id UUID,
  p_new_password TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Cette fonction utilise les privilèges du service role pour mettre à jour le mot de passe
  -- Elle sera appelée depuis le frontend avec les privilèges appropriés
  
  -- Note: La mise à jour du mot de passe se fait via l'API auth.admin
  -- Cette fonction sert de wrapper pour contourner les restrictions RLS
  
  -- Pour l'instant, on ne fait que valider que l'utilisateur existe
  IF NOT EXISTS (SELECT 1 FROM users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'Utilisateur non trouvé';
  END IF;
  
  -- Le mot de passe sera mis à jour via l'API auth.admin dans le service
  -- Cette fonction RPC sert principalement à valider l'existence de l'utilisateur
END;
$$;

-- Donner les permissions d'exécution aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION reset_user_password_rpc(UUID, TEXT) TO authenticated;

-- Créer la table de log si elle n'existe pas
CREATE TABLE IF NOT EXISTS user_actions_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_details JSONB,
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Politique RLS pour la table de log
ALTER TABLE user_actions_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own action logs" ON user_actions_log
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = performed_by);

CREATE POLICY "Admins can view all action logs" ON user_actions_log
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.niveau <= 3
    )
  ); 