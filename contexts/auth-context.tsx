import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { clearSession, SESSION_KEY, refreshSession, isSessionValid } from '@/utils/session-helper';
import { ensureUserExists } from '@/utils/user-helper';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import Constants from 'expo-constants';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string) => Promise<{ error: any | null, data: any | null }>;
  signOut: () => Promise<void>;
  googleSignIn: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any | null }>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Helper function to get redirect URL safely
const getRedirectUrl = (path: string) => {
  // For mobile, use deep linking with the scheme from app.json
  if (Platform.OS !== 'web') {
    const redirectUri = makeRedirectUri({
      scheme: 'aircompass',
      path: path,
      preferLocalhost: false,
    });
    console.log('Mobile redirect URI:', redirectUri);
    return redirectUri;
  }
  
  // For web, check if window is defined (for SSR)
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/${path}`;
  }
  
  // Fallback for SSR
  return `/auth/${path}`;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshAttempted, setRefreshAttempted] = useState(false);

  // Handle refresh token errors
  const handleRefreshError = async (error: any) => {
    console.warn('Session refresh error:', error.message);
    
    // If we get a refresh token error, clear the session
    if (error.message.includes('Refresh Token') || error.message.includes('Invalid Refresh Token')) {
      await clearSession();
      
      // Reset state
      setUser(null);
      setSession(null);
    }
  };

  useEffect(() => {
    // Skip auth initialization during SSR on web platform
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    // Check for active session on mount
    const initializeAuth = async () => {
      try {
        // First check if the session is valid
        const valid = await isSessionValid();
        
        if (!valid) {
          // Try to refresh the session
          const refreshed = await refreshSession();
          
          if (!refreshed) {
            // If refresh failed, clear the session
            await clearSession();
            setUser(null);
            setSession(null);
          } else {
            await ensureUserExists();
          }
        } else {
          // If session is valid, get it
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            await handleRefreshError(error);
          } else if (data?.session) {
            setSession(data.session);
            setUser(data.session.user);
            await ensureUserExists();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        await handleRefreshError(error);
      } finally {
        setIsLoading(false);
        setRefreshAttempted(true);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state changed:', event);
      
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully');
      }
      
      if (event === 'SIGNED_OUT') {
        // Clear any stored session data on sign out
        await clearSession();
      }
      
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        await ensureUserExists();
      }
      
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (!error) {
        await ensureUserExists();
      }
      
      return { error };
    } catch (error) {
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      if (!error) {
        await ensureUserExists();
      }
      
      return { data, error };
    } catch (error) {
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
      
      // Ensure we clear the user and session state regardless of API success
      setUser(null);
      setSession(null);
      
      // Clear any stored session data
      await clearSession();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const googleSignIn = async () => {
    try {
      // Generate a random state for security
      const state = Crypto.randomUUID();
      
      // Get the appropriate redirect URL for the platform
      const redirectUrl = getRedirectUrl('callback');
      console.log('Using redirect URL:', redirectUrl);
      
      // Start the OAuth flow
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });
      
      if (error) {
        console.error('Error starting Google sign in:', error);
        return;
      }
      
      if (data?.url) {
        // Save the state to verify later
        await AsyncStorage.setItem('oauth_state', state);
        
        // Open the URL in a browser session
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl,
          {
            showInRecents: true,
            createTask: true,
          }
        );
        
        if (result.type === 'success') {
          // The redirect happened and we're back in the app
          const { url } = result;
          console.log('Auth successful, redirected to:', url);
        } else {
          console.log('Auth session result:', result.type);
        }
      }
    } catch (error) {
      console.error('Error with Google sign in:', error);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getRedirectUrl('reset-password'),
      });
      return { error };
    } catch (error) {
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    googleSignIn,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 