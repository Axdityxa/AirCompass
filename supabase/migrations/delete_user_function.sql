-- Function to allow users to delete their own account
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id uuid;
BEGIN
  -- Get the authenticated user's ID
  user_id := auth.uid();
  
  -- Make sure we have a valid user ID
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Delete user data from all tables that might contain user data
  -- Add more tables here as your schema grows
  DELETE FROM public.users WHERE id = user_id;
  -- Add other tables that contain user data
  -- DELETE FROM public.user_preferences WHERE user_id = user_id;
  -- DELETE FROM public.user_locations WHERE user_id = user_id;
  
  -- Use Supabase's auth.users management to delete the auth user
  -- This will be executed via the Supabase client
  RETURN;
END;
$$;

-- Set appropriate permissions
ALTER FUNCTION public.delete_user() OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.delete_user() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.delete_user() FROM service_role; 