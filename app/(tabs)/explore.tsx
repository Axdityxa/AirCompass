import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import { RoutesService, RouteResponse, RouteRequest } from '@/services/routes-service';
import RouteNavigation from '@/components/RouteNavigation';

const TRANSPORT_MODES = [
  {
    id: 'walking',
    title: 'Walking',
    icon: 'walk-outline',
    color: '#F9EFD7', // Light beige background
    iconColor: '#F6DE9E', // Beige circle
  },
  {
    id: 'jogging',
    title: 'Jogging',
    icon: 'fitness-outline',
    color: '#F8E1ED', // Light pink background
    iconColor: '#F2BED5', // Pink circle
  },
  {
    id: 'cycling',
    title: 'Cycling',
    icon: 'bicycle-outline',
    color: '#DAF0E8', // Light mint background
    iconColor: '#B1E3D3', // Mint circle
  },
];

export default function ExploreScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [routeGenerated, setRouteGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [route, setRoute] = useState<RouteResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [navigationStarted, setNavigationStarted] = useState(false);

  // Request location permission and get current location on component mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      
      if (status === 'granted') {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setCurrentLocation(location);
        } catch (error) {
          console.error('Error getting location:', error);
          setErrorMessage('Could not get your current location');
        }
      } else {
        setErrorMessage('Location permission denied');
      }
    })();
  }, []);

  const handleSelectMode = async (modeId: string) => {
    setSelectedMode(modeId);
    setIsLoading(true);
    
    try {
      if (!currentLocation) {
        throw new Error('Current location not available');
      }
      
      // In a real app, we would let the user select a destination
      // For demo purposes, we'll generate a destination nearby
      const destination = {
        latitude: currentLocation.coords.latitude + 0.01 * (Math.random() - 0.5),
        longitude: currentLocation.coords.longitude + 0.01 * (Math.random() - 0.5),
      };
      
      const request: RouteRequest = {
        origin: {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        },
        destination,
        transportMode: modeId as 'walking' | 'jogging' | 'cycling',
        preferLowAQI: true,
      };
      
      // Generate route with good air quality
      const routeResponse = await RoutesService.generateRoute(request);
      setRoute(routeResponse);
      setRouteGenerated(true);
    } catch (error) {
      console.error('Error generating route:', error);
      setErrorMessage('Error generating route. Please try again.');
      setSelectedMode(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (routeGenerated) {
      setRouteGenerated(false);
      setSelectedMode(null);
      return;
    }
    if (selectedMode) {
      setSelectedMode(null);
      return;
    }
    router.back();
  };

  const handleStartRoute = () => {
    // Check if the device has location permissions before starting navigation
    if (!locationPermission) {
      Alert.alert(
        'Location Permission Required',
        'To start navigation, please grant location permissions in your device settings.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Start navigation
    setNavigationStarted(true);
  };

  const handleExitNavigation = () => {
    setNavigationStarted(false);
  };

  // If navigation is started and we have a route, show the navigation screen
  if (navigationStarted && route) {
    return (
      <RouteNavigation
        route={route.route}
        transportMode={selectedMode as 'walking' | 'jogging' | 'cycling'}
        onExit={handleExitNavigation}
      />
    );
  }

  // Mode selection screen (first screen)
  if (!selectedMode && !routeGenerated) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>Choose your mode</Text>
          <View style={styles.placeholder} />
        </View>
        
        <Text style={styles.subtitle}>What would you prefer?</Text>
        
        <View style={styles.modeCardsContainer}>
          {TRANSPORT_MODES.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={styles.modeCard}
              onPress={() => handleSelectMode(mode.id)}
              disabled={!locationPermission || !currentLocation}
              activeOpacity={0.7}
            >
              <View style={styles.modeCardContent}>
                <View style={styles.iconCircle}>
                  <Ionicons name={mode.icon as any} size={20} color="white" />
                </View>
                <Text style={styles.modeCardTitle}>{mode.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {!locationPermission && (
          <Text style={styles.permissionText}>
            Location permission is required to find routes with clean air.
          </Text>
        )}
      </SafeAreaView>
    );
  }

  // The rest of your component for route display and navigation remains the same
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {routeGenerated 
            ? 'Your Way to go!' 
            : selectedMode 
              ? 'Plan Your Route' 
              : 'Choose your mode'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      {/* Error Message */}
      {errorMessage && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity 
            style={styles.errorButton}
            onPress={() => setErrorMessage(null)}
          >
            <Text style={styles.errorButtonText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Route Generated Screen */}
      {selectedMode && routeGenerated && route && (
        <View style={styles.mapContainer}>
          <View style={styles.mapControls}>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="options-outline" size={20} color="#111827" />
            </TouchableOpacity>
          </View>

          {/* Map with route */}
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: (route.origin.latitude + route.destination.latitude) / 2,
              longitude: (route.origin.longitude + route.destination.longitude) / 2,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={route.origin}
              title="Start"
            >
              <View style={styles.markerContainer}>
                <Text style={styles.markerText}>A</Text>
              </View>
            </Marker>
            
            <Marker
              coordinate={route.destination}
              title="Destination"
            >
              <View style={styles.markerContainer}>
                <Text style={styles.markerText}>B</Text>
              </View>
            </Marker>
            
            <Polyline
              coordinates={route.points}
              strokeWidth={4}
              strokeColor="#3498db"
            />
          </MapView>

          {/* Route info card */}
          <BlurView
            intensity={80}
            tint="light"
            style={styles.routeInfoContainer}
          >
            <View style={styles.routeInfoHeader}>
              <View style={styles.smallIconContainer}>
                <Ionicons 
                  name={TRANSPORT_MODES.find(m => m.id === selectedMode)?.icon as any} 
                  size={24} 
                  color="white" 
                />
              </View>
              <Text style={styles.routeInfoTitle}>
                {TRANSPORT_MODES.find(m => m.id === selectedMode)?.title} Route
              </Text>
            </View>
            
            <View style={styles.routeDetails}>
              <View style={styles.routeDetailItem}>
                <Ionicons name="time-outline" size={18} color="#6B7280" />
                <Text style={styles.routeDetailText}>{route.duration}</Text>
              </View>
              
              <View style={styles.routeDetailItem}>
                <Ionicons name="resize-outline" size={18} color="#6B7280" />
                <Text style={styles.routeDetailText}>{route.distance}</Text>
              </View>
              
              <View style={styles.routeDetailItem}>
                <Ionicons name="leaf-outline" size={18} color="#6B7280" />
                <Text style={styles.routeDetailText}>{route.aqi}</Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartRoute}
            >
              <Text style={styles.startButtonText}>Start Route</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.startButtonIcon} />
            </TouchableOpacity>
          </BlurView>
        </View>
      )}

      {/* Loading State */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIconContainer}>
            {selectedMode ? (
              <Ionicons 
                name={TRANSPORT_MODES.find(m => m.id === selectedMode)?.icon as any} 
                size={24} 
                color="#FFFFFF" 
              />
            ) : null}
          </View>
          <Text style={styles.loadingText}>Finding the best route with clean air...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

// Helper function to create cross-platform shadow styles
const createShadow = () => {
  if (Platform.OS === 'web') {
    return {
      boxShadow: '0px 2px 15px rgba(0, 0, 0, 0.05)',
    };
  }
  
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#4B5563',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  modeCardsContainer: {
    paddingHorizontal: 20,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  modeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modeCardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  permissionText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 16,
    marginHorizontal: 20,
    marginBottom: 24,
    lineHeight: 22,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    color: '#991B1B',
    fontSize: 16,
    marginBottom: 8,
  },
  errorButton: {
    alignSelf: 'flex-end',
  },
  errorButtonText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapControls: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    ...createShadow(),
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    backgroundColor: '#F59E0B',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  markerText: {
    color: 'white',
    fontWeight: 'bold',
  },
  routeInfoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 20,
    ...createShadow(),
    overflow: 'hidden',
  },
  routeInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  smallIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  routeInfoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  routeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  routeDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeDetailText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 4,
  },
  startButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  startButtonIcon: {
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 28,
  },
});
