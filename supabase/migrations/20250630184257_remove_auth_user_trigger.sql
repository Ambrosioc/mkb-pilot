/*
  # Remove auth.users trigger that interferes with custom user profile creation

  1. Changes
    - Remove trigger on_auth_user_created from auth.users
    - Remove handle_new_user function (optional)
    - This allows our API to handle user profile creation entirely
*/

-- Remove the trigger that automatically creates user profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Remove the function that was called by the trigger (optional cleanup)
DROP FUNCTION IF EXISTS handle_new_user();

-- Add comment for documentation
COMMENT ON TABLE users IS 'User profiles table - managed by custom API, not by auth triggers'; 