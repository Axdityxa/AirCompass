import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AqiCategory } from '@/types/aqi';
import { NotificationSettings } from '@/contexts/notification-context';

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
    
    // Store token for later reference
    await AsyncStorage.setItem('push_token', token);
    
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
  // Only make API call if it's been at least 1 hour since last check
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;
  
  if (!timeLastChecked || (now - timeLastChecked > ONE_HOUR)) {
    // Make the API call to your AQI endpoint
    // This is where you'd implement batching logic if you have a backend
    
    // For now, pretend we're getting data and returning it
    // In a real implementation, this would be your actual API call
    
    // Store the time of this check
    await AsyncStorage.setItem('last_aqi_check', now.toString());
    
    // Return mock data for now - replace with actual API call
    return {
      aqi: 75, 
      time: now,
      pollutants: {
        pm25: 15,
        pm10: 30,
        o3: 45
      }
    };
  }
  
  // If we've checked recently, return null to indicate no new check was made
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