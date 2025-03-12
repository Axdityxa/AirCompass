import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Platform } from 'react-native';

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
  if (Platform.OS !== 'web') {
    return `aircompass://auth/${path}`;
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

  useEffect(() => {
    // Skip auth initialization during SSR on web platform
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    // Check for active session on mount
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!error && data?.session) {
          setSession(data.session);
          setUser(data.session.user);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
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
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const googleSignIn = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getRedirectUrl('callback'),
        },
      });
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