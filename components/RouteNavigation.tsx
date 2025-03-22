import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Route } from '@/services/routes-service';
import {
  calculateDistance,
  findClosestPointOnRoute,
  formatDistance,
  formatDuration,
  calculateProgress,
  getAqiColor,
  getAqiCategory,
  getNextInstruction,
} from '@/utils/route-helpers';
import {
  createPulseAnimation,
  createSlideAnimation,
  createFadeAnimation,
  createProgressAnimation,
} from '@/utils/animation-helpers';

interface RouteNavigationProps {
  route: Route;
  transportMode: 'walking' | 'jogging' | 'cycling';
  onExit: () => void;
}

const { width, height } = Dimensions.get('window');

export default function RouteNavigation({ route, transportMode, onExit }: RouteNavigationProps) {
  const mapRef = useRef<MapView>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [distanceTraveled, setDistanceTraveled] = useState(0);
  const [distanceRemaining, setDistanceRemaining] = useState(
    route.distance || route.points.reduce((acc, curr, i) => {
      if (i === 0) return acc;
      return acc + calculateDistance(route.points[i - 1], route.points[i]);
    }, 0)
  );
  const [timeRemaining, setTimeRemaining] = useState(route.duration || 0);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [currentAqi, setCurrentAqi] = useState(route.points[0]?.aqi || 0);
  const [followUser, setFollowUser] = useState(true);
  
  // Animation values
  const progressWidth = useRef(new Animated.Value(0)).current;
  const instructionTranslateY = useRef(new Animated.Value(-100)).current;
  const infoFade = useRef(new Animated.Value(0)).current;
  const destinationScale = useRef(new Animated.Value(1)).current;
  
  // Create animation functions with correct parameters
  const slideInInstruction = createSlideAnimation(instructionTranslateY, -100, 0, 500);
  const fadeInInfo = createFadeAnimation(infoFade, 0, 1, 800);
  const pulseDestination = createPulseAnimation(destinationScale, 0.95, 1.05, 1000);
  const animateProgress = (progressValue: number) => {
    createProgressAnimation(progressWidth, progressValue, 500)();
  };

  useEffect(() => {
    // Start initial animations
    slideInInstruction();
    fadeInInfo();
    pulseDestination();
    animateProgress(0.01); // Start with 1% progress
    
    // Request permission and track location
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is needed for navigation.',
          [{ text: 'OK', onPress: onExit }]
        );
        return;
      }

      const locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          distanceInterval: 5, // Update every 5 meters
          timeInterval: 1000, // or every second
        },
        (location) => {
          setUserLocation(location);
          updateNavigationInfo(location);
          
          if (followUser && mapRef.current) {
            mapRef.current.animateCamera({
              center: {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              },
              zoom: 16,
              heading: location.coords.heading || 0,
            });
          }
        }
      );

      return () => {
        locationSubscription.remove();
      };
    })();
  }, []);

  // Update navigation information based on user's position
  const updateNavigationInfo = (location: Location.LocationObject) => {
    if (!route.points.length) return;
    
    try {
      // Find closest point on route
      const { point, index, distance } = findClosestPointOnRoute(location, route.points);
      
      // Update current segment index if needed
      if (index !== currentSegmentIndex) {
        setCurrentSegmentIndex(index);
        // Animate instruction change
        instructionTranslateY.setValue(-100);
        slideInInstruction();
      }
      
      // Calculate progress
      const progress = calculateProgress(index, route.points.length);
      animateProgress(progress / 100); // Convert to 0-1 range
      
      // Calculate distance traveled and remaining
      const totalDistance = route.distance || 0;
      const traveled = totalDistance * (progress / 100);
      const remaining = totalDistance - traveled;
      
      setDistanceTraveled(traveled);
      setDistanceRemaining(remaining);
      
      // Update time remaining
      const locationSpeed = location.coords.speed;
      const speed = locationSpeed !== null && locationSpeed !== undefined && locationSpeed > 0 
        ? locationSpeed 
        : getAverageSpeed(transportMode);
      
      setTimeRemaining(remaining / speed);
      
      // Update current AQI
      setCurrentAqi(point.aqi || getInterpolatedAqi(location, route.points, index));
      
    } catch (error) {
      console.error('Error updating navigation info:', error);
    }
  };

  // Get average speed based on transport mode (m/s)
  const getAverageSpeed = (mode: string): number => {
    switch (mode) {
      case 'cycling': return 4.2; // ~15 km/h
      case 'jogging': return 2.8; // ~10 km/h
      case 'walking': return 1.4; // ~5 km/h
      default: return 1.4;
    }
  };
  
  // Interpolate AQI between two route points
  const getInterpolatedAqi = (
    location: Location.LocationObject,
    routePoints: any[],
    closestIndex: number
  ): number => {
    if (!routePoints[closestIndex].aqi) return 50; // Default
    
    // If at the end of the route, return the AQI of the closest point
    if (closestIndex >= routePoints.length - 1) {
      return routePoints[closestIndex].aqi;
    }
    
    // Calculate interpolation factor based on position between points
    const point1 = routePoints[closestIndex];
    const point2 = routePoints[closestIndex + 1];
    
    const dist1 = calculateDistance(
      { latitude: location.coords.latitude, longitude: location.coords.longitude },
      point1
    );
    const dist2 = calculateDistance(
      { latitude: location.coords.latitude, longitude: location.coords.longitude },
      point2
    );
    
    const totalDist = dist1 + dist2;
    const factor = dist1 / totalDist;
    
    // Interpolate AQI
    const aqi1 = point1.aqi || 50;
    const aqi2 = point2.aqi || 50;
    
    return aqi1 + factor * (aqi2 - aqi1);
  };
  
  // Handle exit navigation
  const handleExitNavigation = () => {
    Alert.alert(
      'Exit Navigation',
      'Are you sure you want to stop navigation?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: onExit }
      ]
    );
  };
  
  // Get appropriate icon for transport mode
  const getTransportIcon = () => {
    switch (transportMode) {
      case 'walking': return 'walk-outline';
      case 'jogging': return 'fitness-outline';
      case 'cycling': return 'bicycle-outline';
      default: return 'walk-outline';
    }
  };
  
  // Get next instruction based on current segment
  const getCurrentInstruction = () => {
    if (currentSegmentIndex >= route.points.length - 1) {
      return "You've reached your destination!";
    }
    
    const instruction = getNextInstruction(currentSegmentIndex, route.points);
    return instruction || "Continue on route";
  };

  if (!route || !route.points.length) {
    return (
      <View style={styles.container}>
        <Text>No route data available</Text>
        <TouchableOpacity onPress={onExit} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map View */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: route.points[0].latitude,
          longitude: route.points[0].longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
        showsCompass
        showsScale
        zoomEnabled
        rotateEnabled
        pitchEnabled
      >
        {/* Route Polyline */}
        <Polyline
          coordinates={route.points}
          strokeWidth={5}
          strokeColor="#3498db"
          lineDashPattern={[1]}
        />
        
        {/* Start Marker */}
        <Marker
          coordinate={route.points[0]}
          title="Start"
          pinColor="green"
        >
          <View style={styles.markerContainer}>
            <Ionicons name="flag" size={24} color="green" />
          </View>
        </Marker>
        
        {/* Destination Marker */}
        <Marker
          coordinate={route.points[route.points.length - 1]}
          title="Destination"
        >
          <Animated.View 
            style={[
              styles.markerContainer, 
              { transform: [{ scale: destinationScale }] }
            ]}
          >
            <Ionicons name="location" size={32} color="red" />
          </Animated.View>
        </Marker>
      </MapView>
      
      {/* Navigation Controls */}
      <View style={styles.topControls}>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={handleExitNavigation}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
        
        <View style={styles.transportModeContainer}>
          <Ionicons name={getTransportIcon() as any} size={24} color="white" />
          <Text style={styles.transportModeText}>
            {transportMode.charAt(0).toUpperCase() + transportMode.slice(1)}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.followButton, 
            followUser ? styles.followButtonActive : {}
          ]} 
          onPress={() => setFollowUser(!followUser)}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={followUser ? "navigate" : "navigate-outline"} 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
      </View>
      
      {/* Navigation Instructions */}
      <Animated.View 
        style={[
          styles.instructionContainer,
          { transform: [{ translateY: instructionTranslateY }] }
        ]}
      >
        <BlurView intensity={80} style={styles.instructionBlur}>
          <LinearGradient
            colors={['rgba(52, 152, 219, 0.9)', 'rgba(41, 128, 185, 0.85)']}
            style={styles.instructionGradient}
          >
            <Text style={styles.instructionText}>
              {getCurrentInstruction()}
            </Text>
          </LinearGradient>
        </BlurView>
      </Animated.View>
      
      {/* Bottom Info Panel */}
      <Animated.View 
        style={[
          styles.bottomPanel,
          { opacity: infoFade }
        ]}
      >
        <BlurView intensity={90} style={styles.bottomBlur}>
          <View style={styles.progressContainer}>
            <Animated.View 
              style={[
                styles.progressBar,
                { width: progressWidth.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                })}
              ]}
            />
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color="#3498db" />
              <Text style={styles.infoLabel}>Time Left</Text>
              <Text style={styles.infoValue}>
                {formatDuration(timeRemaining)}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={20} color="#3498db" />
              <Text style={styles.infoLabel}>Distance</Text>
              <Text style={styles.infoValue}>
                {formatDistance(distanceRemaining)}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <MaterialIcons name="air" size={20} color={getAqiColor(currentAqi)} />
              <Text style={styles.infoLabel}>Air Quality</Text>
              <Text 
                style={[
                  styles.infoValue, 
                  { color: getAqiColor(currentAqi) }
                ]}
              >
                {getAqiCategory(currentAqi)}
              </Text>
            </View>
          </View>
        </BlurView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  topControls: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  transportModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  transportModeText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '600',
  },
  followButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  followButtonActive: {
    backgroundColor: '#3498db',
  },
  instructionContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : 90,
    left: 20,
    right: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  instructionBlur: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  instructionGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  instructionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    left: 16,
    right: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bottomBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  progressContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#3498db',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    color: '#7f8c8d',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 2,
  },
  infoValue: {
    color: '#2c3e50',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    backgroundColor: '#3498db',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 