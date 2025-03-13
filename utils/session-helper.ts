import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

// Storage keys
export const SESSION_KEY = 'supabase.auth.token';

/**
 * Clears the session from storage
 */
export async function clearSession(): Promise<void> {
  try {
    if (Platform.OS !== 'web') {
      await AsyncStorage.removeItem(SESSION_KEY);
    } else if (typeof window !== 'undefined') {
      window.localStorage.removeItem(SESSION_KEY);
    }
  } catch (error) {
    console.error('Error clearing session:', error);
  }
}

/**
 * Refreshes the session token
 * @returns A promise that resolves to a boolean indicating if the refresh was successful
 */
export async function refreshSession(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.warn('Error refreshing session:', error.message);
      return false;
    }
    
    if (data?.session) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Exception refreshing session:', error);
    return false;
  }
}

/**
 * Checks if the current session is valid
 * @returns A promise that resolves to a boolean indicating if the session is valid
 */
export async function isSessionValid(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.warn('Error getting session:', error.message);
      return false;
    }
    
    return !!data?.session;
  } catch (error) {
    console.error('Exception checking session:', error);
    return false;
  }
} 