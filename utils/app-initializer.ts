import { supabase } from '@/lib/supabase';
import { clearSession, refreshSession, isSessionValid } from './session-helper';
import { initializeNotifications } from './notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Initializes the app by checking and refreshing the session if needed
 * @returns A promise that resolves when initialization is complete
 */
export async function initializeApp(): Promise<void> {
  try {
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
      }
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
    // Clear session
    await clearSession();
    
    // Clear app started flag
    await AsyncStorage.removeItem('hasStartedApp');
    
    // Clear permissions flow flag
    await AsyncStorage.removeItem('skipPermissionsFlow');
    
    // Clear AQI preferences
    await AsyncStorage.removeItem('aqiPreferences');
    
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