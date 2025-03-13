import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Storage keys for permissions
const LOCATION_PERMISSION_KEY = 'aircompass.permissions.location';
const NOTIFICATION_PERMISSION_KEY = 'aircompass.permissions.notification';

interface PermissionsContextType {
  hasLocationPermission: boolean;
  hasNotificationPermission: boolean;
  skipPermissionsFlow: boolean;
  isLoading: boolean;
  requestLocationPermission: () => Promise<boolean>;
  requestNotificationPermission: () => Promise<boolean>;
  setSkipPermissionsFlow: (skip: boolean) => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

interface PermissionsProviderProps {
  children: ReactNode;
}

export function PermissionsProvider({ children }: PermissionsProviderProps) {
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean>(false);
  const [hasNotificationPermission, setHasNotificationPermission] = useState<boolean>(false);
  const [skipPermissionsFlow, setSkipPermissionsFlowState] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check permissions on mount
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        // Check if user has chosen to skip the permissions flow
        const skipFlow = await AsyncStorage.getItem('skipPermissionsFlow');
        setSkipPermissionsFlowState(skipFlow === 'true');

        // Check location permission
        const locationStatus = await Location.getForegroundPermissionsAsync();
        setHasLocationPermission(locationStatus.status === 'granted');

        // Check notification permission
        const notificationStatus = await Notifications.getPermissionsAsync();
        setHasNotificationPermission(notificationStatus.status === 'granted');
      } catch (error) {
        console.error('Error checking permissions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkPermissions();
  }, []);

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setHasLocationPermission(granted);
      return granted;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === 'granted';
      setHasNotificationPermission(granted);
      return granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const setSkipPermissionsFlow = async (skip: boolean): Promise<void> => {
    try {
      await AsyncStorage.setItem('skipPermissionsFlow', skip.toString());
      setSkipPermissionsFlowState(skip);
    } catch (error) {
      console.error('Error setting skip permissions flow:', error);
    }
  };

  const value = {
    hasLocationPermission,
    hasNotificationPermission,
    skipPermissionsFlow,
    isLoading,
    requestLocationPermission,
    requestNotificationPermission,
    setSkipPermissionsFlow,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions(): PermissionsContextType {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
} 