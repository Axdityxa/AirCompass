import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/contexts/auth-context';
import { ScrollView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useAqiPreferences } from '@/contexts/aqi-preferences-context';
import { useRouter } from 'expo-router';
import { usePermissions } from '@/contexts/permissions-context';
import { getCurrentLocation, getFormattedAddress } from '@/utils/location';
import { LocationData } from '@/utils/location';
import AqiPreferenceCard from '@/components/AqiPreferenceCard';

export default function HomeScreen() {
  const { user } = useAuth();
  const { preferredAqiCategory } = useAqiPreferences();
  const { hasLocationPermission } = usePermissions();
  const router = useRouter();
  
  const [location, setLocation] = useState<LocationData | null>(null);
  const [address, setAddress] = useState<string>('');
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);

  // Get current date
  const today = new Date();
  const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const dayOfMonth = today.getDate();
  const month = today.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

  // Get user's location
  useEffect(() => {
    const fetchLocation = async () => {
      if (hasLocationPermission) {
        setIsLoadingLocation(true);
        try {
          const locationData = await getCurrentLocation();
          setLocation(locationData);
          
          if (locationData) {
            const formattedAddress = await getFormattedAddress(
              locationData.latitude,
              locationData.longitude
            );
            setAddress(formattedAddress || 'Unknown location');
          }
        } catch (error) {
          console.error('Error fetching location:', error);
        } finally {
          setIsLoadingLocation(false);
        }
      }
    };

    fetchLocation();
  }, [hasLocationPermission]);

  // Mock AQI data (replace with actual API call)
  const mockAqiValue = 50;
  const mockAqiCategory = {
    name: 'Good',
    color: '#4CAF50',
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header with logo and profile */}
        <View style={styles.header}>
          <Image 
            source={require('@/assets/images/logo.png')} 
            style={styles.logo}
          />
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <View style={styles.profilePic}>
              <Text style={styles.avatarText}>
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Date display */}
        <View style={styles.dateContainer}>
          <Ionicons name="sunny" size={20} color="#1e88e5" />
          <Text style={styles.dateText}>{dayOfWeek} {dayOfMonth}th {month}</Text>
        </View>

        {/* Overview section */}
        <Text style={styles.sectionTitle}>Current Air Quality</Text>
        
        {/* AQI Card */}
        <View style={styles.aqiCard}>
          <View style={styles.aqiInfo}>
            <Text style={styles.aqiLabel}>AQI Value</Text>
            <Text style={styles.locationText}>
              {isLoadingLocation ? 'Loading location...' : (address || 'Location unavailable')}
            </Text>
          </View>
          <View style={[styles.aqiValueContainer, { backgroundColor: mockAqiCategory.color }]}>
            {isLoadingLocation ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.aqiValue}>{mockAqiValue}</Text>
                <Text style={styles.aqiCategoryText}>{mockAqiCategory.name}</Text>
              </>
            )}
          </View>
        </View>

        {/* Preventive Measures Link */}
        <TouchableOpacity 
          style={styles.preventiveMeasuresLink}
          onPress={() => router.push('/(tabs)/aqi-params')}
        >
          <Text style={styles.preventiveMeasuresText}>Preventive Measures</Text>
          <Text style={styles.viewMoreText}>View more ›</Text>
        </TouchableOpacity>

        {/* Highlights section */}
        <Text style={styles.sectionTitle}>Highlights</Text>
        <View style={styles.highlightsContainer}>
          <TouchableOpacity style={styles.highlightCard}>
            <Image 
              source={require('@/assets/images/air-pollution.png')} 
              style={styles.highlightImage}
            />
            <View style={styles.highlightContent}>
              <Text style={styles.highlightTitle}>More about Air Pollution</Text>
              <Text style={styles.highlightLink}>Know more..</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.highlightCard}>
            <Image 
              source={require('@/assets/images/science-time.png')} 
              style={styles.highlightImage}
            />
            <View style={styles.highlightContent}>
              <Text style={styles.highlightTitle}>The science of using time</Text>
              <Text style={styles.highlightLink}>Know more..</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* View more link for highlights */}
        <TouchableOpacity style={styles.viewMoreLink}>
          <Text style={styles.viewMoreText}>View more ›</Text>
        </TouchableOpacity>

        {/* Previous Locations section */}
        <Text style={styles.sectionTitle}>Previous Locations</Text>
        <TouchableOpacity 
          style={styles.mapContainer}
          onPress={() => router.push('/(tabs)/map')}
        >
          <Image 
            source={require('@/assets/images/map-preview.png')} 
            style={styles.mapImage}
            resizeMode="cover"
          />
          {location && (
            <View style={styles.currentLocationMarker}>
              <Ionicons name="location" size={24} color="#1e88e5" />
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 40,
    height: 40,
    tintColor: '#1e88e5',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1e88e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePic: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dateText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    marginTop: 24,
  },
  aqiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  aqiInfo: {
    flex: 1,
  },
  aqiLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  aqiValueContainer: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aqiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  aqiCategoryText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  preventiveMeasuresLink: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  preventiveMeasuresText: {
    fontSize: 14,
    color: '#6366F1',
  },
  viewMoreText: {
    fontSize: 14,
    color: '#6B7280',
  },
  highlightsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  highlightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '48%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  highlightImage: {
    width: '100%',
    height: 100,
  },
  highlightContent: {
    padding: 12,
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  highlightLink: {
    fontSize: 12,
    color: '#6366F1',
  },
  viewMoreLink: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  mapContainer: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  currentLocationMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -12,
    marginTop: -24,
  },
});
