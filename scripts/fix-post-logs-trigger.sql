-- Script pour corriger le trigger post_logs qui fait référence à 'date_post'
-- Exécutez ce script dans Supabase SQL Editor

-- 1. Identifier le trigger problématique
SELECT 
  trigger_name,
  action_statement,
  action_timing,
  event_manipulation
FROM information_schema.triggers 
WHERE event_object_table = 'cars_v2'
AND trigger_name NOT LIKE 'RI_ConstraintTrigger%';

-- 2. Supprimer le trigger problématique (remplacez 'nom_du_trigger' par le nom réel)
-- DROP TRIGGER IF EXISTS nom_du_trigger ON cars_v2;

-- 3. Recréer le trigger avec la bonne colonne 'post_date'
CREATE OR REPLACE FUNCTION update_post_logs()
RETURNS TRIGGER AS $$
BEGIN
  -- Utiliser post_date au lieu de date_post
  INSERT INTO post_logs (car_id, user_id, post_date)
  VALUES (NEW.id, NEW.posted_by_user, NOW())
  ON CONFLICT (car_id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    post_date = EXCLUDED.post_date;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Créer le trigger
CREATE TRIGGER update_post_logs_trigger
  AFTER INSERT OR UPDATE ON cars_v2
  FOR EACH ROW
  WHEN (NEW.posted_by_user IS NOT NULL)
  EXECUTE FUNCTION update_post_logs();

-- 5. Vérifier que le trigger a été créé
SELECT 
  trigger_name,
  action_statement,
  action_timing,
  event_manipulation
FROM information_schema.triggers 
WHERE event_object_table = 'cars_v2'
AND trigger_name NOT LIKE 'RI_ConstraintTrigger%';

-- 6. Test de mise à jour
-- UPDATE cars_v2 SET brand_id = NULL WHERE id = 1; 