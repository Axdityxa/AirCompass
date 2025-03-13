import { supabase } from '@/lib/supabase';

/**
 * Ensures that the current user exists in the users table
 * This is a fallback in case the database trigger didn't work
 * @returns A promise that resolves to true if the user exists or was created
 */
export async function ensureUserExists(): Promise<boolean> {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No authenticated user found');
      return false;
    }
    
    // Check if the user exists in the users table
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      // An error occurred other than "no rows returned"
      console.error('Error checking if user exists:', checkError);
      return false;
    }
    
    if (existingUser) {
      // User already exists
      console.log('User already exists in users table');
      return true;
    }
    
    // User doesn't exist, create them
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email
      });
    
    if (insertError) {
      console.error('Error creating user in users table:', insertError);
      return false;
    }
    
    console.log('User created in users table');
    return true;
  } catch (error) {
    console.error('Error ensuring user exists:', error);
    return false;
  }
} 