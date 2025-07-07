/*
  # Create user profile function

  1. Changes
    - Create RPC function create_user_profile
    - Function creates user profile in users table
    - Handles duplicate entries gracefully
*/

-- Create function to create user profile
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
  
  -- Log the operation
  RAISE NOTICE 'User profile created for auth_user_id: % with prenom: % and nom: %', auth_user_id, prenom, nom;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_user_profile(UUID, TEXT, TEXT, TEXT) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION create_user_profile(UUID, TEXT, TEXT, TEXT) IS 'Creates a user profile in the users table from auth.users data'; 