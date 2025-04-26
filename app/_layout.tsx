import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments, usePathname, ErrorBoundary } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, Text, View, Alert, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as WebBrowser from 'expo-web-browser';
import { useAuthRequest } from 'expo-auth-session';
import Constants from 'expo-constants';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { AqiPreferencesProvider, useAqiPreferences } from '@/contexts/aqi-preferences-context';
import { HealthConditionsProvider, useHealthConditions } from '@/contexts/health-conditions-context';
import { PermissionsProvider, usePermissions } from '@/contexts/permissions-context';
import { AqiDataProvider } from '@/contexts/aqi-data-context';
import { initializeApp, ensureSplashScreenIsHidden, isExistingUser } from '@/utils/app-initializer';
import LoadingScreen from '@/components/LoadingScreen';

// Initialize web browser for OAuth
WebBrowser.maybeCompleteAuthSession();

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(err => {
  console.warn('Error preventing splash screen auto hide:', err);
});

// Set safety timeout to ensure splash screen is hidden
ensureSplashScreenIsHidden();

SplashScreen.setOptions({
  duration:1000,
  fade:true,
});

// This function ensures users are redirected to the right screen based on auth state
function RootLayoutNav() {
  const { user, isLoading: authLoading } = useAuth();
  const { hasSetPreference, isLoading: preferencesLoading } = useAqiPreferences();
  const { hasSetHealthConditions, hasExplicitlySetConditions, isLoading: healthConditionsLoading } = useHealthConditions();
  const { 
    skipPermissionsFlow, 
    hasLocationPermission, 
    hasNotificationPermission, 
    isLoading: permissionsLoading 
  } = usePermissions();
  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();
  const [navErrorOccurred, setNavErrorOccurred] = useState(false);
  const [isInitiallyLoading, setIsInitiallyLoading] = useState(true);

  // Initial load check - this will hide splash screen and show a loading indicator
  // before determining where to route the user
  useEffect(() => {
    const initialCheck = async () => {
      try {
        if (authLoading || preferencesLoading || permissionsLoading || healthConditionsLoading) {
          return;
        }
        
        // Check if the user is an existing user
        const isExisting = await isExistingUser();
        
        // If we have a user, they should skip launch screen and onboarding
        if (user) {
          // For existing users who have completed onboarding, go directly to main screen
          if (isExisting) {
            router.replace('/(tabs)');
          } 
          // For users who might be missing some onboarding steps
          else {
            // Check if user needs to set preferences or health conditions
            if (!hasSetPreference) {
              router.replace('/(tabs)/select-air');
            } else if (!hasExplicitlySetConditions) {
              router.replace('/(tabs)/health-conditions');
            } else {
              router.replace('/(tabs)');
            }
          }
        } else if (pathname === '/') {
          // We're on the launch screen but not authenticated
          // We'll let the user initiate the flow by pressing the Get Started button
        }
        
        setIsInitiallyLoading(false);
      } catch (error) {
        console.error('Error in initial navigation check:', error);
        setIsInitiallyLoading(false);
      }
    };

    initialCheck();
  }, [user, authLoading, preferencesLoading, permissionsLoading, healthConditionsLoading]);

  useEffect(() => {
    if (authLoading || preferencesLoading || permissionsLoading || healthConditionsLoading || isInitiallyLoading) return;

    try {
      const checkNavigation = async () => {
        // Check if we're on the launch screen (root index)
        const isLaunchScreen = pathname === '/';
        
        // Check if we're on the permissions screen
        const isPermissionsScreen = pathname === '/permissions';
        
        // Check if we're in the auth group
        const inAuthGroup = segments.length > 0 && segments[0] === 'auth';
        
        // Check if we're in the tabs group
        const inTabsGroup = segments.length > 0 && segments[0] === '(tabs)';
        
        // Check if we're on the select-air screen
        const isSelectAirScreen = segments.length > 1 && segments[1] === 'select-air';

        // Check if we're on the health-conditions screen
        const isHealthConditionsScreen = segments.length > 1 && segments[1] === 'health-conditions';

        // Check if user has pressed the continue button on launch screen
        const hasStartedApp = await AsyncStorage.getItem('hasStartedApp');

        // Handle navigation based on permissions and auth state
        if (isLaunchScreen) {
          // If user is already authenticated, redirect to main screen
          if (user) {
            if (!hasSetPreference) {
              router.replace('/(tabs)/select-air');
            } else if (!hasExplicitlySetConditions) {
              router.replace('/(tabs)/health-conditions');
            } else {
              router.replace('/(tabs)');
            }
            return;
          }
          // Don't automatically navigate away from the launch screen for new users
          // Let the user press the continue button
          return;
        } else if (isPermissionsScreen) {
          // If permissions are already granted or skipped, move to auth
          if (skipPermissionsFlow || (hasLocationPermission && hasNotificationPermission)) {
            // If user is authenticated, skip auth screens
            if (user) {
              if (!hasSetPreference) {
                router.replace('/(tabs)/select-air');
              } else if (!hasExplicitlySetConditions) {
                router.replace('/(tabs)/health-conditions');
              } else {
                router.replace('/(tabs)');
              }
            } else {
              router.replace('/auth/sign-in');
            }
          }
        } else if (inAuthGroup) {
          // If user is authenticated and on an auth screen, check if they need to set preferences or health conditions
          if (user) {
            if (!hasSetPreference) {
              router.replace('/(tabs)/select-air');
            } else if (!hasExplicitlySetConditions) {
              router.replace('/(tabs)/health-conditions');
            } else {
              router.replace('/(tabs)');
            }
          }
        } else if (inTabsGroup) {
          // If user is authenticated but hasn't set preferences, redirect to select-air
          // unless they're already on the select-air screen
          if (user && !hasSetPreference && !isSelectAirScreen) {
            router.replace('/(tabs)/select-air');
          }
          
          // If user has set preferences but hasn't set health conditions, redirect to health-conditions
          // unless they're already on the health-conditions screen
          if (user && hasSetPreference && !hasExplicitlySetConditions && !isHealthConditionsScreen) {
            router.replace('/(tabs)/health-conditions');
          }
          
          // If user is not authenticated and trying to access protected tabs, redirect to auth
          if (!user) {
            router.replace('/auth/sign-in');
          }
        }
      };

      checkNavigation().catch(err => {
        console.error('Navigation error:', err);
        setNavErrorOccurred(true);
      });
    } catch (err) {
      console.error('Error in navigation effect:', err);
      setNavErrorOccurred(true);
    }
  }, [
    user, 
    segments, 
    pathname,
    authLoading, 
    preferencesLoading, 
    healthConditionsLoading,
    permissionsLoading,
    hasSetPreference, 
    hasSetHealthConditions,
    hasExplicitlySetConditions,
    skipPermissionsFlow, 
    hasLocationPermission, 
    hasNotificationPermission,
    isInitiallyLoading
  ]);

  const colorScheme = useColorScheme();

  if (navErrorOccurred) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, marginBottom: 20, textAlign: 'center' }}>
          We encountered a navigation error. Please restart the app.
        </Text>
      </View>
    );
  }

  // Show loading indicator while we check auth state
  if (isInitiallyLoading || authLoading) {
    return <LoadingScreen message="Getting things ready..." />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="permissions" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  // Try to load fonts but handle errors gracefully
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const [appInitialized, setAppInitialized] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) {
      console.error('Font loading error:', error);
      // Continue anyway after logging the error
      setAppInitialized(true);
    }
  }, [error]);

  useEffect(() => {
    async function initApp() {
      try {
        // Initialize the app
        await initializeApp();
        
        // Check if Supabase env vars are present
        const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || Constants.expoConfig?.extra?.SUPABASE_URL;
        const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || Constants.expoConfig?.extra?.SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseAnonKey) {
          console.error('Missing Supabase environment variables');
          setInitError(new Error('Missing Supabase environment variables'));
        }
        
        setAppInitialized(true);
      } catch (e) {
        console.error('App initialization error:', e);
        setInitError(e instanceof Error ? e : new Error(String(e)));
        setAppInitialized(true);
      }
    }
    
    initApp();
  }, []);

  useEffect(() => {
    if ((loaded && appInitialized) || initError) {
      // Hide splash screen even if there was an error
      SplashScreen.hideAsync().catch(e => {
        console.warn('Error hiding splash screen:', e);
      });
    }
  }, [loaded, appInitialized, initError]);

  // Show error screen if initialization failed
  if (initError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, marginBottom: 20, textAlign: 'center' }}>
          Error initializing app: {initError.message}
        </Text>
        <Text style={{ fontSize: 14, textAlign: 'center', opacity: 0.7 }}>
          Please check your configuration and restart.
        </Text>
      </View>
    );
  }

  // Show nothing until loaded
  if (!loaded || !appInitialized) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <PermissionsProvider>
          <AuthProvider>
            <AqiPreferencesProvider>
              <HealthConditionsProvider>
                <AqiDataProvider>
                  <RootLayoutNav />
                </AqiDataProvider>
              </HealthConditionsProvider>
            </AqiPreferencesProvider>
          </AuthProvider>
        </PermissionsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
};

export const unstable_settings = {
  // Ensure that reloading on certain routes works correctly.
  initialRouteName: '(tabs)',
};