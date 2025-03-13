import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { AqiCategory } from '@/types/aqi';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Initialize notifications for the app
 */
export async function initializeNotifications(): Promise<boolean> {
  try {
    // Check if we have permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    // If we don't have permission, return false
    if (existingStatus !== 'granted') {
      return false;
    }
    
    // Configure notification categories and actions
    if (Platform.OS === 'ios') {
      await Notifications.setNotificationCategoryAsync('aqi_alert', [
        {
          identifier: 'view',
          buttonTitle: 'View Details',
          options: {
            isDestructive: false,
            isAuthenticationRequired: false,
          },
        },
        {
          identifier: 'dismiss',
          buttonTitle: 'Dismiss',
          options: {
            isDestructive: true,
            isAuthenticationRequired: false,
          },
        },
      ]);
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing notifications:', error);
    return false;
  }
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
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling notifications:', error);
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