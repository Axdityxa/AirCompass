import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { checkAirQualityForNotification, scheduleAqiNotification } from './notifications';
import { getAqiCategory } from '@/utils/aqi-utils';
import { fetchAqiData } from '@/utils/api-service';

// Define task names
export const BACKGROUND_FETCH_TASK = 'background-fetch-aqi';
export const LOCATION_TASK = 'background-location-task';

// Define how often the background fetch should run (in minutes)
const BACKGROUND_FETCH_INTERVAL = 10; // 10 minutes instead of 15

// Register the background fetch task
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async ({ data, error }) => {
  try {
    console.log('[BackgroundFetch] Running background fetch task');
    
    if (error) {
      console.error('[BackgroundFetch] Error in background fetch task:', error);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
    
    // Get notification settings
    const notificationSettingsString = await AsyncStorage.getItem('notification_settings');
    if (!notificationSettingsString) {
      console.log('[BackgroundFetch] No notification settings found');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
    
    const notificationSettings = JSON.parse(notificationSettingsString);
    
    // Check if AQI alerts are enabled
    if (!notificationSettings.aqiAlerts) {
      console.log('[BackgroundFetch] AQI alerts are disabled');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
    
    // Get AQI preferences
    const aqiPreferencesString = await AsyncStorage.getItem('aqi_preferences');
    if (!aqiPreferencesString) {
      console.log('[BackgroundFetch] No AQI preferences found');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
    
    const aqiPreferences = JSON.parse(aqiPreferencesString);
    const aqiThreshold = aqiPreferences.aqiThreshold || 100; // Default to 100 if not set
    
    // Get last location
    const lastLocationString = await AsyncStorage.getItem('last_location');
    if (!lastLocationString) {
      console.log('[BackgroundFetch] No last location found');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
    
    const lastLocation = JSON.parse(lastLocationString);
    const { latitude, longitude } = lastLocation;
    
    // Get last AQI check time
    const lastAqiCheckString = await AsyncStorage.getItem('last_aqi_check');
    const lastAqiCheck = lastAqiCheckString ? parseInt(lastAqiCheckString, 10) : null;
    
    // Check AQI and send notification if needed
    try {
      console.log(`[BackgroundFetch] Checking AQI at lat: ${latitude}, lon: ${longitude}`);
      const aqiData = await fetchAqiData(latitude, longitude);
      
      // Store the time of this check
      await AsyncStorage.setItem('last_aqi_check', Date.now().toString());
      
      if (aqiData) {
        console.log(`[BackgroundFetch] Got AQI data: ${aqiData.aqi}`);
        
        // If AQI exceeds threshold, send notification
        if (aqiData.aqi >= aqiThreshold) {
          const aqiCategory = getAqiCategory(aqiData.aqi);
          
          if (aqiCategory) {
            // Schedule a user-visible notification
            await scheduleAqiNotification(
              aqiData.aqi,
              aqiCategory,
              'your current location'
            );
            console.log('[BackgroundFetch] Sent AQI notification');
          }
        }
        
        return BackgroundFetch.BackgroundFetchResult.NewData;
      }
    } catch (fetchError) {
      console.error('[BackgroundFetch] Error fetching AQI data:', fetchError);
      // Continue execution - we don't want to fail the task just because of a fetch error
    }
    
    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (error) {
    console.error('[BackgroundFetch] Error in background fetch task:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Register the background location task
TaskManager.defineTask(LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('[LocationTask] Error in background location task:', error);
    return;
  }
  
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const location = locations[0];
    
    if (location) {
      // Store the last location
      await AsyncStorage.setItem('last_location', JSON.stringify({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp,
      }));
      
      console.log('[LocationTask] Updated location in background');
    }
  }
});

/**
 * Register the background fetch task with the system
 */
export async function registerBackgroundFetchAsync() {
  try {
    // First, check if task is already registered and unregister it to ensure fresh registration
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
    if (isRegistered) {
      console.log('Unregistering existing background fetch task before re-registering');
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    }
    
    // Register with shorter interval to improve reliability
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: BACKGROUND_FETCH_INTERVAL * 60, // Convert minutes to seconds
      stopOnTerminate: false,
      startOnBoot: true,
    });
    
    console.log(`Background fetch task registered with ${BACKGROUND_FETCH_INTERVAL} minute interval`);
    
    // Store the registration time to track if it's working
    await AsyncStorage.setItem('background_fetch_registered_at', new Date().toISOString());
    
    // On Android, we can try a workaround to "wake up" the scheduler
    if (Platform.OS === 'android') {
      // Schedule a one-time notification to help "wake up" the background task system
      const ONE_MINUTE = 60 * 1000;
      console.log('Setting initial trigger notification to help wake up background system');
      
      // Import the scheduleNotification function
      const { scheduleNotification } = require('./notifications');
      
      // Schedule a silent notification to trigger after 1 minute
      scheduleNotification({
        title: 'AirCompass is monitoring air quality',
        body: 'Background monitoring has been activated',
        data: { type: 'background-activation' },
        trigger: { seconds: 60 },
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error registering background fetch task:', error);
    return false;
  }
}

/**
 * Unregister the background fetch task
 */
export async function unregisterBackgroundFetchAsync() {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    console.log('Background fetch task unregistered');
    return true;
  } catch (error) {
    console.error('Error unregistering background fetch task:', error);
    return false;
  }
}

/**
 * Check if the background fetch task is registered
 */
export async function isBackgroundFetchRegisteredAsync() {
  try {
    return await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
  } catch (error) {
    console.error('Error checking if background fetch task is registered:', error);
    return false;
  }
}

/**
 * Register for background location updates
 */
export async function registerBackgroundLocationAsync() {
  try {
    // Check if location permissions are granted
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Location permission not granted');
      return false;
    }
    
    // On iOS, we need to request additional background permissions
    if (Platform.OS === 'ios') {
      const { status: backgroundStatus } = await Location.getBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        console.log('Background location permission not granted for iOS');
        return false;
      }
    }
    
    // Start the location task
    await Location.startLocationUpdatesAsync(LOCATION_TASK, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 5 * 60 * 1000, // 5 minutes
      distanceInterval: 100, // 100 meters
      deferredUpdatesInterval: 15 * 60 * 1000, // 15 minutes
      deferredUpdatesDistance: 500, // 500 meters
      foregroundService: {
        notificationTitle: 'AirCompass is monitoring air quality',
        notificationBody: 'Your location is being used to provide air quality alerts',
      },
      pausesUpdatesAutomatically: true,
    });
    
    console.log('Background location task registered');
    return true;
  } catch (error) {
    console.error('Error registering background location task:', error);
    return false;
  }
}

/**
 * Unregister background location updates
 */
export async function unregisterBackgroundLocationAsync() {
  try {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK);
    console.log('Background location task unregistered');
    return true;
  } catch (error) {
    console.error('Error unregistering background location task:', error);
    return false;
  }
}

/**
 * Check if the background location task is registered
 */
export async function isBackgroundLocationRegisteredAsync() {
  try {
    return await TaskManager.isTaskRegisteredAsync(LOCATION_TASK);
  } catch (error) {
    console.error('Error checking if background location task is registered:', error);
    return false;
  }
}

/**
 * Perform a background AQI check and send a notification if needed.
 * This is designed to be called from a background task or other scheduling mechanism.
 */
export async function performBackgroundAqiCheck(): Promise<boolean> {
  try {
    console.log('[BackgroundCheck] Starting background AQI check');
    
    // Get notification settings
    const notificationSettingsString = await AsyncStorage.getItem('notification_settings');
    if (!notificationSettingsString) {
      console.log('[BackgroundCheck] No notification settings found');
      return false;
    }
    
    const notificationSettings = JSON.parse(notificationSettingsString);
    
    // Check if AQI alerts are enabled
    if (!notificationSettings.aqiAlerts) {
      console.log('[BackgroundCheck] AQI alerts are disabled');
      return false;
    }
    
    // Get AQI preferences
    const aqiPreferencesString = await AsyncStorage.getItem('aqi_preferences');
    if (!aqiPreferencesString) {
      console.log('[BackgroundCheck] No AQI preferences found');
      return false;
    }
    
    const aqiPreferences = JSON.parse(aqiPreferencesString);
    const aqiThreshold = aqiPreferences.aqiThreshold || 100; // Default to 100 if not set
    
    // Get last location
    const lastLocationString = await AsyncStorage.getItem('last_location');
    if (!lastLocationString) {
      console.log('[BackgroundCheck] No last location found');
      return false;
    }
    
    const lastLocation = JSON.parse(lastLocationString);
    const { latitude, longitude } = lastLocation;
    
    // Get last AQI check time
    const lastAqiCheckString = await AsyncStorage.getItem('last_aqi_check');
    const lastAqiCheck = lastAqiCheckString ? parseInt(lastAqiCheckString, 10) : null;
    const now = Date.now();
    
    // Only check if we haven't checked in the last hour
    const ONE_HOUR = 60 * 60 * 1000;
    if (lastAqiCheck && now - lastAqiCheck < ONE_HOUR) {
      console.log('[BackgroundCheck] Skipping check, last check was less than an hour ago');
      return false;
    }
    
    // Fetch AQI data
    console.log(`[BackgroundCheck] Checking AQI at lat: ${latitude}, lon: ${longitude}`);
    const aqiData = await fetchAqiData(latitude, longitude);
    
    // Store the time of this check
    await AsyncStorage.setItem('last_aqi_check', now.toString());
    
    if (aqiData) {
      console.log(`[BackgroundCheck] Got AQI data: ${aqiData.aqi}`);
      
      // If AQI exceeds threshold, send notification
      if (aqiData.aqi >= aqiThreshold) {
        const aqiCategory = getAqiCategory(aqiData.aqi);
        
        if (aqiCategory) {
          await scheduleAqiNotification(
            aqiData.aqi,
            aqiCategory,
            'your current location'
          );
          console.log('[BackgroundCheck] Sent AQI notification');
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('[BackgroundCheck] Error performing background AQI check:', error);
    return false;
  }
} 