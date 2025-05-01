import { supabase } from '@/lib/supabase';
import { clearSession, refreshSession, isSessionValid } from './session-helper';
import { initializeNotifications } from './notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ensureUserExists } from './user-helper';
import * as SplashScreen from 'expo-splash-screen';
import Constants from 'expo-constants';
import { 
  registerBackgroundFetchAsync, 
  registerBackgroundLocationAsync,
  isBackgroundFetchRegisteredAsync,
  isBackgroundLocationRegisteredAsync
} from './background-tasks';

// Set a maximum wait time for the splash screen (in milliseconds)
const MAX_SPLASH_WAIT_TIME = 5000; // 5 seconds

/**
 * Ensures that the splash screen is hidden after a maximum wait time
 * This is to prevent the app from being stuck on the splash screen
 */
export function ensureSplashScreenIsHidden(): void {
  // Set a timeout to hide the splash screen after MAX_SPLASH_WAIT_TIME
  setTimeout(() => {
    SplashScreen.hideAsync().catch(error => {
      console.warn('Error hiding splash screen:', error);
    });
  }, MAX_SPLASH_WAIT_TIME);
}

/**
 * Checks if a user is already signed in and has completed the onboarding process
 * @returns A promise that resolves to a boolean indicating if the user is an existing user
 */
export async function isExistingUser(): Promise<boolean> {
  try {
    // Check if there's a valid session
    const hasValidSession = await isSessionValid();
    if (!hasValidSession) return false;
    
    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) return false;
    
    // Check if the user has already set preferences and health conditions
    const { data, error } = await supabase
      .from('user_preferences')
      .select('preferred_aqi_category, has_explicitly_set_conditions')
      .eq('user_id', userData.user.id)
      .single();
    
    if (error) {
      console.error('Error checking user preferences:', error);
      return false;
    }
    
    // Check if both preferences and health conditions have been explicitly set
    return data && data.preferred_aqi_category !== null && data.has_explicitly_set_conditions === true;
    
  } catch (error) {
    console.error('Error checking existing user:', error);
    return false;
  }
}

/**
 * Register the background tasks if they are not already registered
 */
async function setupBackgroundTasks(): Promise<void> {
  try {
    // Check if background fetch is registered
    const isBackgroundFetchRegistered = await isBackgroundFetchRegisteredAsync();
    if (!isBackgroundFetchRegistered) {
      await registerBackgroundFetchAsync();
    }
    
    // Check notification settings
    const notificationSettingsString = await AsyncStorage.getItem('notification_settings');
    if (notificationSettingsString) {
      const notificationSettings = JSON.parse(notificationSettingsString);
      
      // Only register background location if location alerts are enabled
      if (notificationSettings.locationAlerts) {
        // Check if background location is registered
        const isBackgroundLocationRegistered = await isBackgroundLocationRegisteredAsync();
        if (!isBackgroundLocationRegistered) {
          await registerBackgroundLocationAsync();
        }
      }
    }
  } catch (error) {
    console.error('Error setting up background tasks:', error);
  }
}

/**
 * Initializes the app by checking and refreshing the session if needed
 * @returns A promise that resolves when initialization is complete
 */
export async function initializeApp(): Promise<void> {
  try {
    // Set up the safety net to ensure splash screen is hidden after a timeout
    ensureSplashScreenIsHidden();
    
    // Initialize notifications
    await initializeNotifications();
    
    // Check if there's a valid session
    const valid = await isSessionValid();
    
    if (!valid) {
      // Try to refresh the session
      const refreshed = await refreshSession();
      
      if (!refreshed) {
        // If refresh failed, clear the session
        await clearSession();
      } else {
        // If session was refreshed, ensure user exists
        await ensureUserExists();
        
        // Set up background tasks if user is authenticated
        await setupBackgroundTasks();
      }
    } else {
      // If session is valid, ensure user exists
      await ensureUserExists();
      
      // Set up background tasks if user is authenticated
      await setupBackgroundTasks();
    }
  } catch (error) {
    console.error('Error initializing app:', error);
    // If there's an error, clear the session to be safe
    await clearSession();
  }
}

/**
 * Resets the app to its initial state (for testing or troubleshooting)
 * @returns A promise that resolves when the reset is complete
 */
export async function resetAppState(): Promise<void> {
  try {
    // Get the current user
    const { data, error } = await supabase.auth.getUser();
    if (!error && data?.user) {
      // Reset the user's preferences in the database
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: data.user.id,
          preferred_aqi_category: null,
          has_respiratory_issues: false,
          has_cardiovascular_disease: false,
          has_cancer_risk: false,
          other_health_conditions: null,
          has_explicitly_set_conditions: false,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
    }
    
    // Clear session
    await clearSession();
    
    // Clear app started flag
    await AsyncStorage.removeItem('hasStartedApp');
    
    // Clear permissions flow flag
    await AsyncStorage.removeItem('skipPermissionsFlow');
    
    // Clear AQI preferences
    await AsyncStorage.removeItem('aqiPreferences');
    
    // Clear health conditions
    await AsyncStorage.removeItem('healthConditions');
    
    console.log('App state has been reset');
  } catch (error) {
    console.error('Error resetting app state:', error);
  }
}

/**
 * Handles token refresh errors
 * @param error The error to handle
 * @returns A promise that resolves when the error is handled
 */
export async function handleTokenRefreshError(error: any): Promise<void> {
  if (
    error.message?.includes('Invalid Refresh Token') ||
    error.message?.includes('Refresh Token Not Found')
  ) {
    console.warn('Token refresh error detected:', error.message);
    
    // Clear the session
    await clearSession();
    
    // Try to refresh the session one more time
    try {
      await refreshSession();
    } catch (refreshError) {
      console.error('Failed to refresh session after error:', refreshError);
    }
  }
} 