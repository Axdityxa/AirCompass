import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { fetchAqiData, AqiData } from '@/utils/api-service';
import { Alert } from 'react-native';

interface AqiDataContextProps {
  aqiData: AqiData | null;
  isLoading: boolean;
  error: string | null;
  refreshAqiData: () => Promise<void>;
  userLocation: { latitude: number; longitude: number } | null;
}

// Default AQI data to use as fallback
const defaultAqiData: AqiData = {
  aqi: 50,
  confidence: 'low',
  recommendations: {
    jogging: { suitable: true },
    walking: { suitable: true },
    cycling: { suitable: true },
    bestTime: 'Morning (6-8 AM)',
    alternatives: ['Indoor gym', 'Swimming pool']
  },
  nearestStation: 'Default Station',
  sources: [
    {
      name: 'Default',
      aqi: 50,
      distance: 0,
      station: 'Default Station',
      pollutants: {
        pm25: 15,
        pm10: 30,
        o3: 20,
        no2: 10,
        so2: 5,
        co: 0.5
      }
    }
  ]
};

const AqiDataContext = createContext<AqiDataContextProps | undefined>(undefined);

export function useAqiData() {
  const context = useContext(AqiDataContext);
  if (context === undefined) {
    throw new Error('useAqiData must be used within an AqiDataProvider');
  }
  return context;
}

export function AqiDataProvider({ children }: { children: React.ReactNode }) {
  const [aqiData, setAqiData] = useState<AqiData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  // Function to get the user's location
  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('Location permission denied, using default location');
        setError('Permission to access location was denied. Using default location.');
        setIsLoading(false);
        // Use default location (Bangalore) if permission is denied
        return { latitude: 12.9716, longitude: 77.5946 };
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });
      
      const { latitude, longitude } = location.coords;
      console.log(`Got user location: ${latitude}, ${longitude}`);
      setUserLocation({ latitude, longitude });
      return { latitude, longitude };
    } catch (error) {
      console.error('Error getting location:', error);
      setError('Failed to get your location. Using default location.');
      setIsLoading(false);
      // Use default location (Bangalore) if there's an error
      return { latitude: 12.9716, longitude: 77.5946 };
    }
  };

  // Function to fetch AQI data
  const fetchData = async (latitude: number, longitude: number) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log(`Fetching AQI data for: ${latitude}, ${longitude}`);
      const data = await fetchAqiData(latitude, longitude);
      console.log('AQI data fetched successfully:', data.aqi);
      setAqiData(data);
      setRetryCount(0); // Reset retry count on success
    } catch (error: any) {
      console.error('Error in fetchData:', error);
      
      // Check if we've already retried too many times
      if (retryCount >= 3) {
        console.log('Too many retries, using default data');
        setError('Failed to fetch AQI data after multiple attempts. Using default data.');
        setAqiData(defaultAqiData);
      } else {
        setRetryCount(prev => prev + 1);
        setError(`Failed to fetch AQI data: ${error.message || 'Unknown error'}. Retrying...`);
        
        // Retry after a delay
        setTimeout(() => {
          fetchData(latitude, longitude);
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh AQI data
  const refreshAqiData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setRetryCount(0); // Reset retry count on manual refresh
      const location = await getUserLocation();
      if (location) {
        await fetchData(location.latitude, location.longitude);
      }
    } catch (error: any) {
      console.error('Error refreshing AQI data:', error);
      setError(`Failed to refresh AQI data: ${error.message || 'Unknown error'}`);
      setIsLoading(false);
      
      // Show alert for refresh errors
      Alert.alert(
        'Refresh Failed',
        'Could not refresh AQI data. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Initial data fetch
  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log('Initializing AQI data...');
        const location = await getUserLocation();
        if (location) {
          await fetchData(location.latitude, location.longitude);
        }
      } catch (error: any) {
        console.error('Error initializing data:', error);
        setError(`Failed to initialize app data: ${error.message || 'Unknown error'}`);
        setIsLoading(false);
        setAqiData(defaultAqiData); // Use default data on initialization error
      }
    };

    initializeData();
  }, []);

  return (
    <AqiDataContext.Provider
      value={{
        aqiData,
        isLoading,
        error,
        refreshAqiData,
        userLocation
      }}
    >
      {children}
    </AqiDataContext.Provider>
  );
} 