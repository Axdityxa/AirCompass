import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AqiCategory } from '@/types/aqi';
import { NotificationSettings } from '@/contexts/notification-context';
import { fetchAqiData } from '@/utils/api-service';

// Notification channels for Android
export const CHANNELS = {
  AQI_ALERTS: 'aqi-alerts',
  DAILY_SUMMARIES: 'daily-summaries',
  HEALTH_ALERTS: 'health-alerts',
  LOCATION_ALERTS: 'location-alerts'
};

// Initialize notifications with proper settings
export async function initializeNotifications() {
  if (Platform.OS === 'android') {
    await createAndroidChannels();
  }

  // Configure how notifications appear when the app is in foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  // Listen for notifications
  const subscription = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification received:', notification);
    // You can add additional handling here
  });

  return subscription;
}

// Create notification channels for Android
async function createAndroidChannels() {
  await Notifications.setNotificationChannelAsync(CHANNELS.AQI_ALERTS, {
    name: 'Air Quality Alerts',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
    description: 'Notifications when air quality exceeds your preferred threshold',
  });

  await Notifications.setNotificationChannelAsync(CHANNELS.DAILY_SUMMARIES, {
    name: 'Daily Summaries',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
    description: 'Daily summary of air quality in your area',
  });

  await Notifications.setNotificationChannelAsync(CHANNELS.HEALTH_ALERTS, {
    name: 'Health-Based Alerts',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
    description: 'Health-based alerts based on your conditions',
  });

  await Notifications.setNotificationChannelAsync(CHANNELS.LOCATION_ALERTS, {
    name: 'Location Alerts',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
    description: 'Alerts for your saved locations',
  });
}

// Request permission for push notifications
export async function registerForPushNotificationsAsync() {
  let token;
  
  // Check if device is physical (not an emulator/simulator)
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    // Exit if permission not granted
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    
    // Get Expo push token
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    })).data;
    
    // Store token for later reference - using both keys for backward compatibility
    await AsyncStorage.setItem('push_token', token);
    await AsyncStorage.setItem('expoPushToken', JSON.stringify(token));
    
    console.log(`Stored push token: ${token}`);
    
    // If user is authenticated, store the token in Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await storeUserPushToken(user.id, token);
      }
    } catch (error) {
      console.error('Error storing push token:', error);
    }
  } else {
    console.log('Must use physical device for push notifications');
  }

  return token;
}

// Store user's push token in Supabase
async function storeUserPushToken(userId: string, token: string) {
  const { error } = await supabase
    .from('user_push_tokens')
    .upsert({
      user_id: userId,
      push_token: token,
      device_type: Platform.OS,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,push_token' });
  
  if (error) {
    console.error('Error storing push token in Supabase:', error);
  }
}

// Send a local notification
export async function sendLocalNotification({
  title,
  body,
  data = {},
  channelId = CHANNELS.AQI_ALERTS,
}: {
  title: string;
  body: string;
  data?: Record<string, any>;
  channelId?: string;
}) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
      ...(Platform.OS === 'android' ? { channelId } : {}),
    },
    trigger: null, // Immediately
  });
}

// Schedule a notification for later
export async function scheduleNotification({
  title,
  body,
  data = {},
  channelId = CHANNELS.AQI_ALERTS,
  trigger = null, // null for immediate, or a DateTrigger object
}: {
  title: string;
  body: string;
  data?: Record<string, any>;
  channelId?: string;
  trigger?: Notifications.NotificationTriggerInput | null;
}) {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
      ...(Platform.OS === 'android' ? { channelId } : {}),
    },
    trigger,
  });
  return id;
}

// API-efficient check for air quality
export async function checkAirQualityForNotification(
  latitude: number, 
  longitude: number, 
  aqiThreshold: number, 
  timeLastChecked: number | null
) {
  // Only make API call if it's been at least 1 hour since last check or if forced for testing
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;
  
  if (!timeLastChecked || (now - timeLastChecked > ONE_HOUR)) {
    try {
      // Log that we're checking AQI to help with debugging
      console.log(`[AQI Check] Checking AQI at lat: ${latitude}, lon: ${longitude}`);
      
      // Get notification frequency setting to determine force check
      const settings = await getNotificationSettings();
      const isHighFrequency = settings?.frequency === 'high';
      
      // Use the same fetch function as the main app
      console.log('[AQI Check] Fetching from API using shared service');
      const aqiData = await fetchAqiData(latitude, longitude);
      
      // Store the time of this check
      await AsyncStorage.setItem('last_aqi_check', now.toString());
      
      // Log the received AQI data
      console.log(`[AQI Check] Received AQI: ${aqiData.aqi || 'N/A'}`);
      
      // Convert the data to the format expected by the notification system
      return {
        aqi: aqiData.aqi,
        time: now,
        pollutants: {
          pm25: aqiData.sources[0]?.pollutants.pm25 || 0,
          pm10: aqiData.sources[0]?.pollutants.pm10 || 0,
          o3: aqiData.sources[0]?.pollutants.o3 || 0
        }
      };
    } catch (error) {
      console.error('[AQI Check] Error fetching AQI data:', error);
      
      // In case of error in production, don't send notifications
      if (!__DEV__) return null;
      
      // In development, use test data to ensure notifications work
      return {
        aqi: aqiThreshold + 20, // Above threshold to trigger notification
        time: now,
        pollutants: {
          pm25: 30,
          pm10: 50,
          o3: 100
        }
      };
    }
  }
  
  // If we've checked recently and don't need to force another check, return null
  console.log('[AQI Check] Skipping check, last check was too recent');
  return null;
}

// Get notification settings
export async function getNotificationSettings() {
  try {
    const settings = await AsyncStorage.getItem('notification_settings');
    if (settings) {
      return JSON.parse(settings);
    }
    // Default settings if none found
    return {
      aqiAlerts: true,
      dailySummaries: true,
      healthAlerts: true,
      locationAlerts: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '07:00'
      },
      frequency: 'normal' // 'low', 'normal', 'high'
    };
  } catch (error) {
    console.error('Error getting notification settings:', error);
    return null;
  }
}

// Save notification settings
export async function saveNotificationSettings(settings: NotificationSettings) {
  try {
    await AsyncStorage.setItem('notification_settings', JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving notification settings:', error);
    return false;
  }
}

// Cancel all scheduled notifications
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Determine if a notification should be sent based on current settings and time
export function shouldSendNotification(settings: NotificationSettings | null) {
  if (!settings) return false;
  
  // Check quiet hours
  if (settings.quietHours && settings.quietHours.enabled) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    const startTime = settings.quietHours.start;
    const endTime = settings.quietHours.end;
    
    // Check if current time is within quiet hours
    if (startTime <= endTime) {
      // Simple case: quiet hours within same day
      if (currentTime >= startTime && currentTime <= endTime) {
        return false;
      }
    } else {
      // Complex case: quiet hours span midnight
      if (currentTime >= startTime || currentTime <= endTime) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Schedule a notification for AQI alert
 * @param aqiValue The current AQI value
 * @param aqiCategory The AQI category
 * @param location The location name
 */
export async function scheduleAqiNotification(
  aqiValue: number,
  aqiCategory: AqiCategory,
  location: string = 'your area'
): Promise<string | null> {
  try {
    // Check if we have permission
    const { status } = await Notifications.getPermissionsAsync();
    
    if (status !== 'granted') {
      console.log('Notification permission not granted');
      return null;
    }
    
    // Create notification content
    const title = `Air Quality Alert: ${aqiCategory.name}`;
    const body = `The current AQI in ${location} is ${aqiValue} (${aqiCategory.name}). ${aqiCategory.healthImplications}`;
    
    // Schedule the notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: {
          aqiValue,
          aqiCategory: aqiCategory.name,
          location,
        },
        color: aqiCategory.color,
        categoryIdentifier: 'aqi_alert',
      },
      trigger: null, // Send immediately
    });
    
    return notificationId;
  } catch (error) {
    console.error('Error scheduling AQI notification:', error);
    return null;
  }
}

/**
 * Add a notification listener
 * @param listener The notification listener function
 * @returns A subscription that can be used to remove the listener
 */
export function addNotificationListener(
  listener: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(listener);
}

/**
 * Add a notification response listener
 * @param listener The notification response listener function
 * @returns A subscription that can be used to remove the listener
 */
export function addNotificationResponseListener(
  listener: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(listener);
}

/**
 * Sends a data-only push notification to trigger background processing
 * This type of notification will not appear in the notification tray
 * but will trigger the background task if the app is in the background
 * @param expoPushToken Expo push token to send the notification to
 * @param data Data to include in the notification
 */
export async function sendBackgroundDataNotification(expoPushToken: string, data: Record<string, any>): Promise<boolean> {
  try {
    const message = {
      to: expoPushToken,
      data: data,
      // Required for iOS background processing
      _contentAvailable: true,
      // If you need to priority (default is 'default')
      priority: 'high',
    };
    
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    
    const responseData = await response.json();
    console.log('Background notification sent:', responseData);
    return responseData.data && responseData.data.status === 'ok';
  } catch (error) {
    console.error('Error sending background notification:', error);
    return false;
  }
}

/**
 * Sends a visible push notification with title and body that will appear in the notification tray
 * @param expoPushToken Expo push token to send the notification to
 * @param title Notification title
 * @param body Notification body
 * @param data Additional data to include in the notification
 */
export async function sendVisiblePushNotification(
  expoPushToken: string, 
  title: string, 
  body: string, 
  data: Record<string, any> = {}
): Promise<boolean> {
  try {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title: title,
      body: body,
      data: data,
    };
    
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    
    const responseData = await response.json();
    console.log('Visible notification sent:', responseData);
    return responseData.data && responseData.data.status === 'ok';
  } catch (error) {
    console.error('Error sending visible notification:', error);
    return false;
  }
} 