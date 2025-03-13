import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/contexts/auth-context';
import { ScrollView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useAqiPreferences } from '@/contexts/aqi-preferences-context';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { user } = useAuth();
  const { preferredAqiCategory } = useAqiPreferences();
  const router = useRouter();

  // Get current date
  const today = new Date();
  const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const dayOfMonth = today.getDate();
  const month = today.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

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
            <Image 
              source={require('@/assets/images/profile-pic.png')} 
              style={styles.profilePic}
            />
          </TouchableOpacity>
        </View>

        {/* Date display */}
        <View style={styles.dateContainer}>
          <Ionicons name="sunny" size={20} color="#1e88e5" />
          <Text style={styles.dateText}>{dayOfWeek} {dayOfMonth}th {month}</Text>
        </View>

        {/* Overview section */}
        <Text style={styles.sectionTitle}>Overview</Text>
        
        {/* AQI Card */}
        <View style={styles.aqiCard}>
          <View style={styles.aqiInfo}>
            <Text style={styles.aqiLabel}>AQI Value</Text>
            <Text style={styles.locationText}>Location name</Text>
          </View>
          <View style={styles.aqiValueContainer}>
            <Text style={styles.aqiValue}>50</Text>
            <TouchableOpacity>
              <Text style={styles.tellMeMoreText}>Tell me more ›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Preventive Measures Link */}
        <TouchableOpacity style={styles.preventiveMeasuresLink}>
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
        <TouchableOpacity style={styles.mapContainer}>
          <Image 
            source={require('@/assets/images/map-preview.png')} 
            style={styles.mapImage}
            resizeMode="cover"
          />
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
  },
  profilePic: {
    width: '100%',
    height: '100%',
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
    backgroundColor: '#F87171',
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
  tellMeMoreText: {
    fontSize: 10,
    color: '#FFFFFF',
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
    borderRadius: 16,
    overflow: 'hidden',
    height: 150,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
});
