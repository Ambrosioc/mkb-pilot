-- 🔁 Supprime la politique si elle existe déjà
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

-- ✅ Politique RLS pour autoriser l'insertion par l'utilisateur lui-même
CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);

-- 🧠 Supprime la fonction RPC si elle existe
DROP FUNCTION IF EXISTS create_user_profile(UUID, TEXT, TEXT, TEXT);

-- ✅ Fonction RPC : création propre d'un utilisateur
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
  INSERT INTO users (
    id, auth_user_id, prenom, nom, email, actif, date_creation
  )
  VALUES (
    auth_user_id, auth_user_id, prenom, nom, email, TRUE, NOW()
  );

  -- 👤 Ajout du rôle par défaut (N5 = Collaborateur simple)
  INSERT INTO public.user_roles (user_id, role_id)
  VALUES (auth_user_id, 5);
END;
$$;

-- 🧽 Supprime la fonction temporaire si déjà existante
DROP FUNCTION IF EXISTS split_full_name(TEXT);

-- 🧩 Fonction : découpe un full_name en prenom + nom
CREATE FUNCTION split_full_name(full_name TEXT)
RETURNS TABLE(prenom TEXT, nom TEXT) AS $$
BEGIN
  IF full_name IS NULL OR full_name = '' THEN
    RETURN QUERY SELECT ''::TEXT, ''::TEXT;
    RETURN;
  END IF;

  WITH name_parts AS (
    SELECT unnest(string_to_array(trim(full_name), ' ')) AS part
  ),
  parts_array AS (
    SELECT array_agg(part) AS parts FROM name_parts
  )
  SELECT 
    CASE 
      WHEN array_length(parts, 1) = 1 THEN parts[1]
      WHEN array_length(parts, 1) = 2 THEN parts[1]
      ELSE array_to_string(parts[1:array_length(parts, 1)-1], ' ')
    END AS prenom,
    CASE 
      WHEN array_length(parts, 1) = 1 THEN ''
      WHEN array_length(parts, 1) = 2 THEN parts[2]
      ELSE parts[array_length(parts, 1)]
    END AS nom
  FROM parts_array;
END;
$$ LANGUAGE plpgsql;

-- 🔄 Mise à jour des utilisateurs mal enregistrés (prenom = nom ou prenom = full_name)
UPDATE users 
SET 
  prenom = split.prenom,
  nom = split.nom
FROM (
  SELECT 
    u.id,
    s.prenom,
    s.nom
  FROM users u,
  LATERAL split_full_name(u.prenom) AS s
  WHERE u.prenom = u.nom OR u.nom = '' OR u.prenom LIKE '% %'
) split
WHERE users.id = split.id;

-- ✂️ Nettoyage des prénoms/noms avec espaces multiples
UPDATE users 
SET 
  prenom = trim(regexp_replace(prenom, '\s+', ' ', 'g')),
  nom = trim(regexp_replace(nom, '\s+', ' ', 'g'))
WHERE prenom IS NOT NULL OR nom IS NOT NULL;

-- 🧹 Supprime la fonction split après usage (optionnel)
DROP FUNCTION IF EXISTS split_full_name(TEXT);
