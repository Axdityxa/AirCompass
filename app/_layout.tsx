import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { AqiPreferencesProvider, useAqiPreferences } from '@/contexts/aqi-preferences-context';
import { PermissionsProvider, usePermissions } from '@/contexts/permissions-context';
import { initializeApp } from '@/utils/app-initializer';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// This function ensures users are redirected to the right screen based on auth state
function RootLayoutNav() {
  const { user, isLoading: authLoading } = useAuth();
  const { hasSetPreference, isLoading: preferencesLoading } = useAqiPreferences();
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
    if (authLoading || preferencesLoading || permissionsLoading) return;

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
        // If user is authenticated and on an auth screen, redirect to main app or select-air
        if (user) {
          if (!hasSetPreference) {
            router.replace('/(tabs)/select-air');
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
    permissionsLoading,
    hasSetPreference, 
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
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    // Initialize the app when it loads
    const init = async () => {
      try {
        // Initialize the app and handle any token refresh issues
        await initializeApp();
      } catch (error) {
        console.error('Error during app initialization:', error);
      } finally {
        // Hide the splash screen once initialization is complete
        if (loaded) {
          SplashScreen.hideAsync();
        }
      }
    };

    init();
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
              <RootLayoutNav />
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
