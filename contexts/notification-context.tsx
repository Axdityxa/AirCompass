import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './auth-context';
import { useAqiPreferences } from './aqi-preferences-context';
import { useHealthConditions } from './health-conditions-context';
import { usePermissions } from './permissions-context';
import { useAqiData } from './aqi-data-context';
import * as Notifications from 'expo-notifications';
import {
  initializeNotifications,
  registerForPushNotificationsAsync,
  sendLocalNotification,
  getNotificationSettings,
  saveNotificationSettings,
  CHANNELS,
  shouldSendNotification
} from '@/utils/notifications';

// Notification settings interface
export interface NotificationSettings {
  aqiAlerts: boolean;
  dailySummaries: boolean;
  healthAlerts: boolean;
  locationAlerts: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  frequency: 'low' | 'normal' | 'high';
}

interface NotificationContextProps {
  hasPermission: boolean;
  isLoading: boolean;
  settings: NotificationSettings | null;
  pushToken: string | null;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<boolean>;
  requestPermission: () => Promise<boolean>;
  sendTestNotification: () => Promise<boolean>;
  lastNotificationTime: number | null;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [lastNotificationTime, setLastNotificationTime] = useState<number | null>(null);
  const [notificationListener, setNotificationListener] = useState<any>(null);
  
  const { user } = useAuth();
  const { preferredAqiCategory } = useAqiPreferences();
  const { healthConditions } = useHealthConditions();
  const { hasLocationPermission } = usePermissions();
  const { aqiData } = useAqiData();

  // Initialize notifications
  useEffect(() => {
    async function initialize() {
      try {
        // Initialize notifications
        const listener = await initializeNotifications();
        setNotificationListener(listener);
        
        // Check permission status
        const { status } = await Notifications.getPermissionsAsync();
        setHasPermission(status === 'granted');
        
        // Load notification settings
        const storedSettings = await getNotificationSettings();
        setSettings(storedSettings);
        
        // Load last notification time
        const lastTime = await AsyncStorage.getItem('last_notification_time');
        if (lastTime) {
          setLastNotificationTime(parseInt(lastTime, 10));
        }
        
        // Get push token if we have permission
        if (status === 'granted') {
          const token = await registerForPushNotificationsAsync();
          if (token !== undefined) {
            setPushToken(token);
          }
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    initialize();
    
    // Cleanup
    return () => {
      if (notificationListener) {
        notificationListener.remove();
      }
    };
  }, []);

  // When user AQI preferences or health conditions change, update notification thresholds
  useEffect(() => {
    if (!user || !hasPermission || !settings || !settings.aqiAlerts) return;
    
    // This would be where we'd update any server-side notification preferences
    // For now, we'll just log this event
    console.log('Notification preferences may need updating based on user preferences');
    
  }, [user, preferredAqiCategory, healthConditions, hasPermission, settings]);
  
  // Check AQI data for threshold crossing and send notifications
  useEffect(() => {
    if (!aqiData || !preferredAqiCategory || !settings || !hasPermission) return;
    
    // Only send notifications if user has opted in for AQI alerts
    if (!settings.aqiAlerts) return;
    
    // Check if we should send a notification
    if (!shouldSendNotification(settings)) return;
    
    // Check notification frequency setting
    const frequency = settings.frequency;
    const now = Date.now();
    const HOUR = 60 * 60 * 1000;
    
    // Determine minimum time between notifications based on frequency setting
    let minimumTimeBetweenNotifications = 6 * HOUR; // Default: 6 hours for 'normal'
    if (frequency === 'low') {
      minimumTimeBetweenNotifications = 12 * HOUR; // 12 hours for 'low'
    } else if (frequency === 'high') {
      minimumTimeBetweenNotifications = 2 * HOUR; // 2 hours for 'high'
    }
    
    // Check if enough time has passed since last notification
    if (lastNotificationTime && (now - lastNotificationTime < minimumTimeBetweenNotifications)) {
      return;
    }
    
    // Check if current AQI exceeds preferred threshold
    const currentAqi = aqiData.aqi || 0;
    const preferredThreshold = getAqiThresholdFromCategory(preferredAqiCategory.id);
    
    if (currentAqi > preferredThreshold) {
      // Trigger notification
      sendAqiAlert(currentAqi, preferredAqiCategory.label);
      
      // Update last notification time
      setLastNotificationTime(now);
      AsyncStorage.setItem('last_notification_time', now.toString());
    }
  }, [aqiData, preferredAqiCategory, settings, hasPermission, lastNotificationTime]);
  
  // Helper function to get AQI threshold from category ID
  const getAqiThresholdFromCategory = (categoryId: number): number => {
    // These thresholds correspond to the upper limits of each category
    switch (categoryId) {
      case 1: return 50;  // GOOD
      case 2: return 100; // SATISFACTORY
      case 3: return 200; // MODERATE
      case 4: return 300; // POOR
      case 5: return 400; // VERY POOR
      case 6: return 500; // SEVERE
      default: return 100;
    }
  };
  
  // Send AQI alert notification
  const sendAqiAlert = async (aqi: number, categoryName: string) => {
    try {
      await sendLocalNotification({
        title: 'Air Quality Alert',
        body: `Current AQI is ${aqi} (${categoryName}), which exceeds your preference.`,
        data: { 
          type: 'aqi_alert',
          aqi,
          category: categoryName
        },
        channelId: CHANNELS.AQI_ALERTS
      });
      return true;
    } catch (error) {
      console.error('Error sending AQI alert:', error);
      return false;
    }
  };
  
  // Request notification permission
  const requestPermission = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status === 'granted') {
        const token = await registerForPushNotificationsAsync();
        if (token !== undefined) {
          setPushToken(token);
        }
      }
      
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };
  
  // Update notification settings
  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      if (!settings) return false;
      
      const updatedSettings = {
        ...settings,
        ...newSettings
      };
      
      setSettings(updatedSettings);
      await saveNotificationSettings(updatedSettings);
      return true;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return false;
    }
  };
  
  // Send a test notification
  const sendTestNotification = async () => {
    try {
      await sendLocalNotification({
        title: 'Test Notification',
        body: 'This is a test notification from AirCompass.',
        data: { type: 'test' },
      });
      return true;
    } catch (error) {
      console.error('Error sending test notification:', error);
      return false;
    }
  };
  
  const value = {
    hasPermission,
    isLoading,
    settings,
    pushToken,
    updateSettings,
    requestPermission,
    sendTestNotification,
    lastNotificationTime
  };
  
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
} 