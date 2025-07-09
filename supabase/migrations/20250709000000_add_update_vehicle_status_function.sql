-- Migration: Ajouter une fonction RPC pour mettre à jour le statut des véhicules
-- Date: 2025-07-09

-- Fonction pour mettre à jour le statut d'un véhicule
-- Cette fonction contourne RLS et permet aux utilisateurs authentifiés de mettre à jour le statut
CREATE OR REPLACE FUNCTION update_vehicle_status(
  vehicle_id_param uuid,
  new_status_param text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Exécute avec les privilèges du créateur de la fonction
AS $$
DECLARE
  result json;
BEGIN
  -- Vérifier que l'utilisateur est authentifié
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;

  -- Mettre à jour le statut du véhicule
  UPDATE cars_v2 
  SET 
    status = new_status_param,
    updated_at = NOW()
  WHERE id = vehicle_id_param;

  -- Vérifier si la mise à jour a affecté une ligne
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Véhicule non trouvé avec l''ID: %', vehicle_id_param;
  END IF;

  -- Retourner les informations de mise à jour
  SELECT json_build_object(
    'success', true,
    'vehicle_id', vehicle_id_param,
    'new_status', new_status_param,
    'updated_at', NOW()
  ) INTO result;

  RETURN result;
END;
$$;

-- Donner les permissions d'exécution
GRANT EXECUTE ON FUNCTION update_vehicle_status TO authenticated;
GRANT EXECUTE ON FUNCTION update_vehicle_status TO anon;

-- Commentaire pour documenter la fonction
COMMENT ON FUNCTION update_vehicle_status IS 'Fonction pour mettre à jour le statut d''un véhicule. Contourne RLS et permet aux utilisateurs authentifiés de mettre à jour le statut de n''importe quel véhicule.'; 