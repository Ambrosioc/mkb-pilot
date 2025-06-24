-- Migration pour corriger les noms d'utilisateurs
-- Cette migration sépare les full_name en prenom et nom

-- Politique RLS alternative pour permettre l'insertion de nouveaux utilisateurs
-- (à utiliser si on ne veut pas utiliser la fonction RPC)
CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);

-- Fonction RPC pour créer un utilisateur (contourne RLS)
CREATE OR REPLACE FUNCTION create_user_profile(
  auth_user_id UUID,
  prenom TEXT,
  nom TEXT,
  email TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO users (auth_user_id, prenom, nom, email, actif, date_creation)
  VALUES (auth_user_id, prenom, nom, email, true, now());
END;
$$;

-- Fonction pour nettoyer et séparer les noms
CREATE OR REPLACE FUNCTION split_full_name(full_name TEXT)
RETURNS TABLE(prenom TEXT, nom TEXT) AS $$
BEGIN
  -- Si le nom est vide ou null, retourner des valeurs par défaut
  IF full_name IS NULL OR full_name = '' THEN
    RETURN QUERY SELECT ''::TEXT, ''::TEXT;
    RETURN;
  END IF;

  -- Diviser le nom complet en parties
  -- Prendre le dernier mot comme nom de famille, le reste comme prénom
  WITH name_parts AS (
    SELECT unnest(string_to_array(trim(full_name), ' ')) as part
  ),
  parts_array AS (
    SELECT array_agg(part) as parts FROM name_parts
  )
  SELECT 
    CASE 
      WHEN array_length(parts, 1) = 1 THEN parts[1]
      WHEN array_length(parts, 1) = 2 THEN parts[1]
      ELSE array_to_string(parts[1:array_length(parts, 1)-1], ' ')
    END as prenom,
    CASE 
      WHEN array_length(parts, 1) = 1 THEN ''
      WHEN array_length(parts, 1) = 2 THEN parts[2]
      ELSE parts[array_length(parts, 1)]
    END as nom
  FROM parts_array;
END;
$$ LANGUAGE plpgsql;

-- Mettre à jour les utilisateurs existants qui ont des données incorrectes
UPDATE users 
SET 
  prenom = split.prenom,
  nom = split.nom
FROM (
  SELECT 
    u.id,
    (split_full_name(u.prenom)).prenom as prenom,
    (split_full_name(u.prenom)).nom as nom
  FROM users u
  WHERE u.prenom = u.nom OR u.nom = '' OR u.prenom LIKE '% %'
) split
WHERE users.id = split.id;

-- Nettoyer les noms qui pourraient contenir des espaces multiples
UPDATE users 
SET 
  prenom = trim(regexp_replace(prenom, '\s+', ' ', 'g')),
  nom = trim(regexp_replace(nom, '\s+', ' ', 'g'))
WHERE prenom IS NOT NULL OR nom IS NOT NULL;

-- Supprimer la fonction temporaire
DROP FUNCTION split_full_name(TEXT); 