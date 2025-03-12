import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

// Create a custom storage adapter that works on all platforms
const createCustomStorageAdapter = () => {
  // For React Native platforms (iOS, Android)
  if (Platform.OS !== 'web') {
    return AsyncStorage;
  }
  
  // For web platform, use localStorage with fallbacks for SSR
  return {
    getItem: async (key: string): Promise<string | null> => {
      if (typeof window === 'undefined') {
        return null;
      }
      return window.localStorage.getItem(key);
    },
    setItem: async (key: string, value: string): Promise<void> => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
    },
    removeItem: async (key: string): Promise<void> => {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    },
  };
};

// Initialize Supabase client with the custom storage adapter
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: createCustomStorageAdapter(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
}); 