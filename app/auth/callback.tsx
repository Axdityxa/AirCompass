import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert, Linking } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Colors from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

// Ensure any lingering browser sessions are completed
WebBrowser.maybeCompleteAuthSession();

export default function CallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Parse URL parameters
    const handleDeepLink = async (url: string | null) => {
      console.log('Processing deep link:', url);
      if (!url) return;

      try {
        // Extract the parameters from the URL
        const urlObj = new URL(url);
        const errorParam = urlObj.searchParams.get('error');
        const errorDescription = urlObj.searchParams.get('error_description');
        const stateParam = urlObj.searchParams.get('state');
        const authCode = urlObj.searchParams.get('code');

        if (errorParam) {
          setStatus('error');
          setErrorMessage(errorDescription || 'OAuth authentication error');
          return;
        }

        // Verify the state if needed
        if (stateParam) {
          const savedState = await AsyncStorage.getItem('oauth_state');
          if (savedState && stateParam !== savedState) {
            setStatus('error');
            setErrorMessage('Invalid authentication state. Please try again.');
            return;
          }

          // Clean up the saved state
          await AsyncStorage.removeItem('oauth_state');
        }

        // Get session
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          setStatus('error');
          setErrorMessage(error.message);
          return;
        }

        if (data?.session) {
          setStatus('success');
          console.log('OAuth sign-in successful, redirecting to home');
          
          // Give user a moment to see success message before redirecting
          setTimeout(() => {
            router.replace('/(tabs)');
          }, 1000);
        } else {
          setStatus('error');
          setErrorMessage('Authentication was initiated but no session was established.');
        }
      } catch (error) {
        console.error('Error in OAuth callback:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
      }
    };

    // Handle the OAuth callback from URL params
    const processInitialURL = async () => {
      try {
        // First try the Expo Router params
        if (params.error) {
          setStatus('error');
          setErrorMessage(String(params.error_description) || 'OAuth authentication error');
          return;
        }

        // Check if we have URL parameters from a deep link
        const url = await Linking.getInitialURL();
        if (url) {
          console.log('Initial URL detected:', url);
          await handleDeepLink(url);
          return;
        }

        // Otherwise, check Supabase session directly
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setStatus('error');
          setErrorMessage(error.message);
          return;
        }

        if (data?.session) {
          setStatus('success');
          console.log('Session found, redirecting to home');
          // Give user a moment to see success message before redirecting
          setTimeout(() => {
            router.replace('/(tabs)');
          }, 1000);
        } else {
          setStatus('error');
          setErrorMessage('No authentication data found. Please try signing in again.');
        }
      } catch (error) {
        console.error('Error processing initial URL:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
      }
    };

    // Set up a listener for URL changes
    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('URL event received:', url);
      handleDeepLink(url);
    });

    // Process initial URL or params
    processInitialURL();

    // Clean up
    return () => {
      subscription.remove();
    };
  }, [router, params]);

  const handleRetry = () => {
    router.replace('/auth/sign-in');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Authentication', headerShown: false }} />
      <View style={styles.content}>
        {status === 'loading' && (
          <>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.text}>Completing sign in...</Text>
          </>
        )}

        {status === 'success' && (
          <>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.successText}>Sign in successful!</Text>
            <Text style={styles.text}>Redirecting to home...</Text>
          </>
        )}

        {status === 'error' && (
          <>
            <Text style={styles.errorTitle}>Authentication Failed</Text>
            <Text style={styles.errorText}>{errorMessage || 'An error occurred during sign in'}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Return to Sign In</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  successText: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 