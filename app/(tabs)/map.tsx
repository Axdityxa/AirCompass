import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { SearchBar } from '../../components/SearchBar';
import { AirQualityMarker } from '../../components/AirQualityMarker';
import { AirQualityDetails } from '../../components/AirQualityDetails';
import { getAllAirQualityData, getAirQualityByCoordinates, getAirQualityData } from '../../services/air-quality-service';
import { AirQualityData, SearchLocation } from '../../types/air-quality';

// Default region for India
const INDIA_REGION: Region = {
  latitude: 23.5937,
  longitude: 80.9629,
  latitudeDelta: 30,
  longitudeDelta: 30,
};

export default function MapScreen() {
  const [region, setRegion] = useState<Region>(INDIA_REGION);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [airQualityData, setAirQualityData] = useState<AirQualityData[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<AirQualityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [markerSize, setMarkerSize] = useState<'small' | 'medium' | 'large'>('medium');
  const mapRef = useRef<MapView>(null);

  // Request location permission and get air quality data
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        // Request location permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission(status === 'granted');
        
        // Get user location if permission granted
        if (status === 'granted') {
          setIsLoadingLocation(true);
          const location = await Location.getCurrentPositionAsync({});
          setUserLocation(location);
          
          // Set map region to user location
          setRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          });
        }
        
        // Get all air quality data
        const allAirQualityData = getAllAirQualityData();
        setAirQualityData(allAirQualityData);
        
        // Log available AQI locations for debugging
        console.log('Available AQI locations:', allAirQualityData.map(data => ({
          name: data.location.name,
          coords: data.location.coordinates,
          aqi: data.aqi
        })));
      } catch (error) {
        console.error('Error initializing map:', error);
      } finally {
        setIsLoading(false);
        setIsLoadingLocation(false);
      }
    })();
  }, []);
  
  // Update marker size based on region delta
  useEffect(() => {
    if (region.latitudeDelta > 10) {
      setMarkerSize('small');
    } else if (region.latitudeDelta > 3) {
      setMarkerSize('medium');
    } else {
      setMarkerSize('large');
    }
  }, [region.latitudeDelta]);

  // Handle location search
  const handleLocationSelect = async (location: SearchLocation) => {
    try {
      console.log('Location selected:', location.name);
      
      // First try to find the location in our existing airQualityData
      let locationInData = airQualityData.find(
        data => data.location.name.toLowerCase() === location.name.toLowerCase()
      );
      
      // Handle Bengaluru/Bangalore case
      if (!locationInData && location.name.toLowerCase().includes('bengaluru')) {
        locationInData = airQualityData.find(
          data => data.location.name.toLowerCase() === 'bangalore'
        );
      } else if (!locationInData && location.name.toLowerCase().includes('bangalore')) {
        locationInData = airQualityData.find(
          data => data.location.name.toLowerCase() === 'bengaluru'
        );
      }
      
      if (locationInData) {
        console.log('Found location in existing data:', locationInData.location.name);
        setSelectedLocation(locationInData);
        
        // Animate map to selected location with appropriate zoom
        mapRef.current?.animateToRegion({
          latitude: locationInData.location.coordinates.latitude,
          longitude: locationInData.location.coordinates.longitude,
          latitudeDelta: 0.2, // Closer zoom to see the marker better
          longitudeDelta: 0.2,
        }, 1000);
        
        return;
      }
      
      // If not found in existing data, try to get air quality data by name
      let aqData = await getAirQualityData(location.name);
      
      // Handle Bengaluru/Bangalore special case
      if (!aqData && location.name.includes('Bengaluru')) {
        aqData = await getAirQualityData('Bangalore');
      }
      
      if (aqData) {
        console.log('Found AQ data for location:', aqData.location.name);
        setSelectedLocation(aqData);
        
        // Animate map to selected location with appropriate zoom
        mapRef.current?.animateToRegion({
          latitude: location.coordinates.latitude,
          longitude: location.coordinates.longitude,
          latitudeDelta: 0.2, // Closer zoom to see the marker better
          longitudeDelta: 0.2,
        }, 1000);
      } else {
        console.log('No exact match, trying coordinates');
        // If no exact match, try to get air quality by coordinates
        const coordData = await getAirQualityByCoordinates(
          location.coordinates.latitude,
          location.coordinates.longitude
        );
        
        if (coordData) {
          console.log('Found AQ data by coordinates');
          setSelectedLocation(coordData);
          
          // Animate map to selected location
          mapRef.current?.animateToRegion({
            latitude: location.coordinates.latitude,
            longitude: location.coordinates.longitude,
            latitudeDelta: 0.2,
            longitudeDelta: 0.2,
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error selecting location:', error);
    }
  };

  // Handle marker selection
  const handleMarkerPress = (location: AirQualityData) => {
    console.log('Marker pressed:', location.location.name);
    
    // Set selected location to show details
    setSelectedLocation(location);
    
    // Animate map to selected location with close zoom
    mapRef.current?.animateToRegion({
      latitude: location.location.coordinates.latitude,
      longitude: location.location.coordinates.longitude,
      latitudeDelta: 0.2,  // Closer zoom to see the marker clearly
      longitudeDelta: 0.2,
    }, 1000);
    
    // Log the AQI details for debugging
    console.log('AQI:', location.aqi);
    console.log('Pollutants:', JSON.stringify(location.pollutants));
  };

  // Center map on user's location
  const handleCenterOnUser = async () => {
    if (!userLocation) {
      // Try to get user location again if not available
      setIsLoadingLocation(true);
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setUserLocation(location);
          
          mapRef.current?.animateToRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          }, 1000);
        }
      } catch (error) {
        console.error('Error getting user location:', error);
      } finally {
        setIsLoadingLocation(false);
      }
    } else {
      // Center on existing user location
      mapRef.current?.animateToRegion({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      }, 1000);
    }
  };

  // Close details panel
  const handleCloseDetails = () => {
    console.log('Closing details panel');
    setSelectedLocation(null);
  };

  // Determine marker size based on zoom level
  const getMarkerSizeValue = (size: 'small' | 'medium' | 'large'): 'small' | 'medium' | 'large' => {
    return size;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      
      {/* Search bar */}
      <View style={styles.searchBarContainer}>
        <SearchBar onLocationSelect={handleLocationSelect} />
      </View>
      
      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      )}
      
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        loadingEnabled={true}
      >
        {/* Air quality markers */}
        {airQualityData.map((location, index) => (
          <Marker
            key={location.location.id}
            coordinate={{
              latitude: location.location.coordinates.latitude,
              longitude: location.location.coordinates.longitude,
            }}
            tracksViewChanges={false}
            onPress={() => handleMarkerPress(location)}
            zIndex={selectedLocation?.location.id === location.location.id ? 2 : 1}
          >
            <AirQualityMarker 
              aqi={location.aqi}
              size={selectedLocation?.location.id === location.location.id ? 'large' : 'medium'}
              isActive={selectedLocation?.location.id === location.location.id}
              onPress={() => handleMarkerPress(location)}
            />
          </Marker>
        ))}
      </MapView>
      
      {/* User location button */}
      <TouchableOpacity
        style={styles.myLocationButton}
        onPress={handleCenterOnUser}
        disabled={isLoadingLocation}
      >
        {isLoadingLocation ? (
          <ActivityIndicator size="small" color="#4F46E5" />
        ) : (
          <Ionicons name="locate" size={24} color="#4F46E5" />
        )}
      </TouchableOpacity>
      
      {/* Air quality details panel */}
      {selectedLocation && (
        <View style={styles.detailsContainer} testID="details-panel">
          <AirQualityDetails
            locationName={selectedLocation.location.name}
            aqi={selectedLocation.aqi}
            pollutants={selectedLocation.pollutants}
            timestamp={selectedLocation.timestamp}
            onClose={handleCloseDetails}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  searchBarContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  map: {
    flex: 1,
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 30,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  detailsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxHeight: '40%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 5,
  },
}); 