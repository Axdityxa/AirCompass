import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments, usePathname, ErrorBoundary } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import * as WebBrowser from 'expo-web-browser';
import { useAuthRequest } from 'expo-auth-session';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { AqiPreferencesProvider, useAqiPreferences } from '@/contexts/aqi-preferences-context';
import { HealthConditionsProvider, useHealthConditions } from '@/contexts/health-conditions-context';
import { PermissionsProvider, usePermissions } from '@/contexts/permissions-context';
import { AqiDataProvider } from '@/contexts/aqi-data-context';
import { initializeApp } from '@/utils/app-initializer';

// Initialize web browser for OAuth
WebBrowser.maybeCompleteAuthSession();

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

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

  useEffect(() => {
    if (authLoading || preferencesLoading || permissionsLoading || healthConditionsLoading) return;

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
        // Don't automatically navigate away from the launch screen
        // Let the user press the continue button
        return;
      } else if (isPermissionsScreen) {
        // If permissions are already granted or skipped, move to auth
        if (skipPermissionsFlow || (hasLocationPermission && hasNotificationPermission)) {
          router.replace('/auth/sign-in');
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

    checkNavigation();
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
    hasNotificationPermission
  ]);

  const colorScheme = useColorScheme();

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
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
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