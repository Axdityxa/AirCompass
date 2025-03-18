import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAqiData } from '@/contexts/aqi-data-context';

interface PreventiveMeasure {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'personal' | 'home' | 'community';
}

export default function PreventiveMeasuresScreen() {
  const router = useRouter();
  const { aqiData, isLoading, error, refreshAqiData } = useAqiData();
  const [activeCategory, setActiveCategory] = useState<'personal' | 'home' | 'community'>('personal');
  const [refreshing, setRefreshing] = useState(false);
  const [measures, setMeasures] = useState<Record<string, PreventiveMeasure[]>>({
    personal: [],
    home: [],
    community: []
  });

  // Generate preventive measures based on AQI level
  useEffect(() => {
    if (aqiData) {
      const aqi = aqiData.aqi;
      const newMeasures: Record<string, PreventiveMeasure[]> = {
        personal: [],
        home: [],
        community: []
      };

      // Personal measures
      if (aqi <= 50) {
        // Good
        newMeasures.personal = [
          {
            id: 'p1',
            title: 'Enjoy Outdoor Activities',
            description: 'Air quality is good. It\'s a great time for outdoor activities.',
            icon: 'sunny',
            category: 'personal'
          },
          {
            id: 'p2',
            title: 'Stay Hydrated',
            description: 'Drink plenty of water when spending time outdoors.',
            icon: 'water',
            category: 'personal'
          },
          {
            id: 'p3',
            title: 'Regular Exercise',
            description: 'Maintain a regular exercise routine to boost your respiratory health.',
            icon: 'fitness',
            category: 'personal'
          },
          {
            id: 'p4',
            title: 'Monitor Health',
            description: 'Be aware of any changes in your respiratory health.',
            icon: 'pulse',
            category: 'personal'
          }
        ];
      } else if (aqi <= 100) {
        // Moderate
        newMeasures.personal = [
          {
            id: 'p1',
            title: 'Limit Prolonged Exertion',
            description: 'Unusually sensitive people should consider reducing prolonged outdoor exertion.',
            icon: 'time',
            category: 'personal'
          },
          {
            id: 'p2',
            title: 'Stay Hydrated',
            description: 'Drink plenty of water when spending time outdoors.',
            icon: 'water',
            category: 'personal'
          },
          {
            id: 'p3',
            title: 'Monitor Symptoms',
            description: 'Watch for respiratory symptoms like coughing or shortness of breath.',
            icon: 'medical',
            category: 'personal'
          },
          {
            id: 'p4',
            title: 'Early Morning Activities',
            description: 'Schedule outdoor activities in the early morning when air quality is better.',
            icon: 'sunny',
            category: 'personal'
          }
        ];
      } else if (aqi <= 150) {
        // Unhealthy for Sensitive Groups
        newMeasures.personal = [
          {
            id: 'p1',
            title: 'Wear Masks Outdoors',
            description: 'Consider wearing N95/KN95 masks when outdoors, especially if you have respiratory conditions.',
            icon: 'medkit',
            category: 'personal'
          },
          {
            id: 'p2',
            title: 'Reduce Outdoor Time',
            description: 'Limit time spent outdoors, especially during peak pollution hours.',
            icon: 'time',
            category: 'personal'
          },
          {
            id: 'p3',
            title: 'Take Medications',
            description: 'Keep rescue medications handy if you have asthma or other respiratory conditions.',
            icon: 'medical',
            category: 'personal'
          },
          {
            id: 'p4',
            title: 'Monitor Symptoms',
            description: 'Watch for symptoms like coughing, wheezing, or difficulty breathing.',
            icon: 'pulse',
            category: 'personal'
          }
        ];
      } else {
        // Unhealthy or worse
        newMeasures.personal = [
          {
            id: 'p1',
            title: 'Stay Indoors',
            description: 'Avoid outdoor activities. Stay inside with windows and doors closed.',
            icon: 'home',
            category: 'personal'
          },
          {
            id: 'p2',
            title: 'Wear N95 Masks',
            description: 'If you must go outside, wear N95/KN95 masks that can filter fine particles.',
            icon: 'medkit',
            category: 'personal'
          },
          {
            id: 'p3',
            title: 'Use Air Purifiers',
            description: 'Use portable air purifiers with HEPA filters when indoors.',
            icon: 'cloud',
            category: 'personal'
          },
          {
            id: 'p4',
            title: 'Seek Medical Help',
            description: 'If experiencing severe symptoms, seek medical attention immediately.',
            icon: 'medical',
            category: 'personal'
          }
        ];
      }

      // Home measures
      if (aqi <= 100) {
        // Good to Moderate
        newMeasures.home = [
          {
            id: 'h1',
            title: 'Natural Ventilation',
            description: 'Open windows to allow fresh air circulation when outdoor air quality is good.',
            icon: 'aperture',
            category: 'home'
          },
          {
            id: 'h2',
            title: 'Regular Cleaning',
            description: 'Dust and vacuum regularly to reduce indoor particulate matter.',
            icon: 'brush',
            category: 'home'
          },
          {
            id: 'h3',
            title: 'Indoor Plants',
            description: 'Keep air-purifying plants like spider plants or peace lilies.',
            icon: 'leaf',
            category: 'home'
          },
          {
            id: 'h4',
            title: 'Avoid Smoking Indoors',
            description: 'Don\'t allow smoking inside your home to maintain good indoor air quality.',
            icon: 'close-circle',
            category: 'home'
          }
        ];
      } else {
        // Unhealthy or worse
        newMeasures.home = [
          {
            id: 'h1',
            title: 'Keep Windows Closed',
            description: 'Keep windows and doors closed to prevent outdoor pollutants from entering.',
            icon: 'close',
            category: 'home'
          },
          {
            id: 'h2',
            title: 'Use Air Purifiers',
            description: 'Run HEPA air purifiers in main living areas to filter out pollutants.',
            icon: 'cloud',
            category: 'home'
          },
          {
            id: 'h3',
            title: 'Create Clean Room',
            description: 'Designate one room with an air purifier as a clean air room for sensitive individuals.',
            icon: 'bed',
            category: 'home'
          },
          {
            id: 'h4',
            title: 'Avoid Pollutant Sources',
            description: 'Don\'t burn candles, use fireplaces, or fry foods which can worsen indoor air quality.',
            icon: 'flame',
            category: 'home'
          }
        ];
      }

      // Community measures
      newMeasures.community = [
        {
          id: 'c1',
          title: 'Use Public Transport',
          description: 'Reduce air pollution by using public transportation, carpooling, or biking.',
          icon: 'bus',
          category: 'community'
        },
        {
          id: 'c2',
          title: 'Plant Trees',
          description: 'Participate in tree planting initiatives to improve air quality in your community.',
          icon: 'leaf',
          category: 'community'
        },
        {
          id: 'c3',
          title: 'Report Pollution',
          description: 'Report illegal burning or excessive industrial emissions to local authorities.',
          icon: 'alert-circle',
          category: 'community'
        },
        {
          id: 'c4',
          title: 'Conserve Energy',
          description: 'Reduce energy consumption to decrease power plant emissions.',
          icon: 'flash',
          category: 'community'
        }
      ];

      setMeasures(newMeasures);
    }
  }, [aqiData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAqiData();
    setRefreshing(false);
  };

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0288D1" />
        <Text style={styles.loadingText}>Loading air quality data...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshAqiData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'personal': return { light: '#E0EAFF', dark: '#4F46E5' };
      case 'home': return { light: '#DCFCE7', dark: '#16A34A' };
      case 'community': return { light: '#FCE7F3', dark: '#DB2777' };
      default: return { light: '#E0EAFF', dark: '#4F46E5' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preventive Measures</Text>
        <View style={styles.placeholder} />
      </View>
      
      {/* Current AQI Info */}
      <View style={styles.aqiInfoContainer}>
        <Text style={styles.aqiInfoTitle}>
          Current AQI: <Text style={styles.aqiValue}>{aqiData?.aqi || 'N/A'}</Text>
        </Text>
        <Text style={styles.aqiInfoSubtitle}>
          {aqiData?.nearestStation || 'Your Location'}
        </Text>
      </View>
      
      {/* Category Selector */}
      <View style={styles.categorySelector}>
        {['personal', 'home', 'community'].map((category) => {
          const isActive = activeCategory === category;
          const colors = getCategoryColor(category);
          
          return (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                isActive && { backgroundColor: colors.light }
              ]}
              onPress={() => setActiveCategory(category as 'personal' | 'home' | 'community')}
            >
              <Ionicons
                name={
                  category === 'personal' ? 'person' :
                  category === 'home' ? 'home' : 'people'
                }
                size={20}
                color={isActive ? colors.dark : '#6B7280'}
              />
              <Text
                style={[
                  styles.categoryText,
                  isActive && { color: colors.dark, fontWeight: '600' }
                ]}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Measures List */}
        <View style={styles.measuresList}>
          {measures[activeCategory].map((measure) => {
            const colors = getCategoryColor(activeCategory);
            
            return (
              <TouchableOpacity key={measure.id} style={styles.measureCard}>
                <View style={[styles.measureIcon, { backgroundColor: colors.light }]}>
                  <Ionicons name={measure.icon as any} size={24} color={colors.dark} />
                </View>
                <View style={styles.measureContent}>
                  <Text style={styles.measureTitle}>{measure.title}</Text>
                  <Text style={styles.measureDescription}>{measure.description}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        
        {/* Additional Resources */}
        <View style={styles.resourcesContainer}>
          <Text style={styles.resourcesTitle}>Additional Resources</Text>
          
          <TouchableOpacity
            style={styles.resourceLink}
            onPress={() => Linking.openURL('https://www.who.int/health-topics/air-pollution')}
          >
            <Ionicons name="globe-outline" size={20} color="#0288D1" />
            <Text style={styles.resourceLinkText}>WHO Air Pollution Guidelines</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.resourceLink}
            onPress={() => Linking.openURL('https://www.airnow.gov/aqi/aqi-basics/')}
          >
            <Ionicons name="information-circle-outline" size={20} color="#0288D1" />
            <Text style={styles.resourceLinkText}>Understanding AQI Levels</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.resourceLink}
            onPress={() => Linking.openURL('https://www.youtube.com/watch?v=MU-dYX_Iy9I')}
          >
            <Ionicons name="videocam-outline" size={20} color="#0288D1" />
            <Text style={styles.resourceLinkText}>Video: How to Protect Yourself from Air Pollution</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#0288D1',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#0288D1',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0288D1',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  aqiInfoContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  aqiInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  aqiValue: {
    color: '#0288D1',
  },
  aqiInfoSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  categorySelector: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  categoryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  scrollView: {
    flex: 1,
  },
  measuresList: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  measureCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  measureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  measureContent: {
    flex: 1,
  },
  measureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  measureDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 20,
  },
  resourcesContainer: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 24,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  resourcesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  resourceLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  resourceLinkText: {
    fontSize: 14,
    color: '#0288D1',
    marginLeft: 8,
  },
}); 