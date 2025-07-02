/*
  # Fix user role assignment for new users

  1. Changes
    - Update create_user_profile function to assign default role
    - Assign role_id 5 (Collaborateur simple) to new users
    - Add role assignment to existing users without roles
*/

-- Update the create_user_profile function to include role assignment
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
  -- Insert user profile, ignore if already exists
  INSERT INTO users (id, auth_user_id, prenom, nom, email, actif, date_creation)
  VALUES (auth_user_id, auth_user_id, prenom, nom, email, true, NOW())
  ON CONFLICT (id) DO NOTHING;
  
  -- Assign default role (5 = Collaborateur simple) if not already assigned
  INSERT INTO user_roles (user_id, role_id)
  VALUES (auth_user_id, 5)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Log the operation
  RAISE NOTICE 'User profile created for auth_user_id: % with prenom: % and nom: %', auth_user_id, prenom, nom;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_user_profile(UUID, TEXT, TEXT, TEXT) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION create_user_profile(UUID, TEXT, TEXT, TEXT) IS 'Creates a user profile in the users table and assigns default role (Collaborateur simple)';

-- Fix existing users without roles by assigning them the default role
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, 5
FROM users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE ur.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING; 