-- Create a trigger to automatically create a user record when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    auth_user_id,
    prenom,
    nom,
    email,
    date_creation
  ) VALUES (
    NEW.id,
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    NOW()
  );
  
  -- Assign default role (5 = 'Collaborateur simple')
  INSERT INTO public.user_roles (
    user_id,
    role_id
  ) VALUES (
    NEW.id,
    5
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add a comment explaining the trigger
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a record in public.users when a new user signs up, and assigns the default role';