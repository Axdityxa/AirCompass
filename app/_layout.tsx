import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { AqiPreferencesProvider, useAqiPreferences } from '@/contexts/aqi-preferences-context';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// This function ensures users are redirected to the right screen based on auth state
function RootLayoutNav() {
  const { user, isLoading: authLoading } = useAuth();
  const { hasSetPreference, isLoading: preferencesLoading } = useAqiPreferences();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (authLoading || preferencesLoading) return;

    // Only redirect if the user is authenticated and trying to access auth screens
    // This allows the launch and permissions screens to be shown first
    const inAuthGroup = segments[0] === 'auth';
    const inTabsGroup = segments[0] === '(tabs)';
    const isSelectAirScreen = segments[1] === 'select-air';
    
    // If user is authenticated and on an auth screen, redirect to main app or select-air
    if (user && inAuthGroup) {
      if (!hasSetPreference) {
        router.replace('/(tabs)/select-air');
      } else {
        router.replace('/(tabs)');
      }
    }
    
    // If user is authenticated but hasn't set preferences, redirect to select-air
    // unless they're already on the select-air screen
    if (user && !hasSetPreference && inTabsGroup && !isSelectAirScreen) {
      router.replace('/(tabs)/select-air');
    }
    
    // If user is not authenticated and trying to access protected tabs, redirect to auth
    if (!user && inTabsGroup) {
      router.replace('/auth/sign-in');
    }
  }, [user, segments, authLoading, preferencesLoading, hasSetPreference]);

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
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AqiPreferencesProvider>
          <RootLayoutNav />
        </AqiPreferencesProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
