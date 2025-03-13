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
    return {
      getItem: async (key: string): Promise<string | null> => {
        try {
          return await AsyncStorage.getItem(key);
        } catch (error) {
          console.error('AsyncStorage getItem error:', error);
          return null;
        }
      },
      setItem: async (key: string, value: string): Promise<void> => {
        try {
          await AsyncStorage.setItem(key, value);
        } catch (error) {
          console.error('AsyncStorage setItem error:', error);
        }
      },
      removeItem: async (key: string): Promise<void> => {
        try {
          await AsyncStorage.removeItem(key);
        } catch (error) {
          console.error('AsyncStorage removeItem error:', error);
        }
      },
    };
  }
  
  // For web platform, use localStorage with fallbacks for SSR
  return {
    getItem: async (key: string): Promise<string | null> => {
      if (typeof window === 'undefined') {
        return null;
      }
      try {
        return window.localStorage.getItem(key);
      } catch (error) {
        console.error('localStorage getItem error:', error);
        return null;
      }
    },
    setItem: async (key: string, value: string): Promise<void> => {
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(key, value);
        } catch (error) {
          console.error('localStorage setItem error:', error);
        }
      }
    },
    removeItem: async (key: string): Promise<void> => {
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.removeItem(key);
        } catch (error) {
          console.error('localStorage removeItem error:', error);
        }
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
    flowType: 'pkce',
  },
  global: {
    headers: {
      'X-Client-Info': `AirCompass@${Platform.OS}`,
    },
  },
}); 