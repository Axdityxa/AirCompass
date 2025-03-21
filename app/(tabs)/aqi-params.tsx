import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AqiCircularIndicator } from '@/components/AqiCircularIndicator';
import { useAqiData } from '@/contexts/aqi-data-context';

interface AqiParam {
  id: string;
  name: string;
  value: number | null;
  color: string;
  unit: string;
  description: string;
  subscript?: string;
}

export default function AqiParamsScreen() {
  const router = useRouter();
  const { aqiData, isLoading, error, refreshAqiData } = useAqiData();
  const [refreshing, setRefreshing] = useState(false);
  const [aqiParams, setAqiParams] = useState<AqiParam[]>([]);

  // Function to get color based on AQI value
  const getAqiColor = (value: number | null): string => {
    if (value === null) return '#9CA3AF'; // Gray for null values
    if (value <= 50) return '#4CAF50'; // Good - Green
    if (value <= 100) return '#FFEB3B'; // Moderate - Yellow
    if (value <= 150) return '#FF9800'; // Unhealthy for Sensitive Groups - Orange
    if (value <= 200) return '#F44336'; // Unhealthy - Red
    if (value <= 300) return '#9C27B0'; // Very Unhealthy - Purple
    return '#7D0023'; // Hazardous - Maroon
  };

  // Update AQI parameters when data changes
  useEffect(() => {
    if (aqiData && aqiData.sources.length > 0) {
      // Use the first source (combined source) that has prioritized WAQI data
      const pollutants = aqiData.sources[0].pollutants;
      
      console.log('Using pollutants data:', pollutants);

      const params: AqiParam[] = [
        {
          id: 'pm25',
          name: 'PM',
          value: pollutants.pm25,
          color: getAqiColor(pollutants.pm25),
          unit: 'μg/m³',
          description: 'Fine particulate matter that can penetrate deep into the lungs',
          subscript: '2.5'
        },
        {
          id: 'pm10',
          name: 'PM',
          value: pollutants.pm10,
          color: getAqiColor(pollutants.pm10),
          unit: 'μg/m³',
          description: 'Coarse particulate matter from dust, pollen, and mold',
          subscript: '10'
        },
        {
          id: 'o3',
          name: 'O',
          value: pollutants.o3,
          color: getAqiColor(pollutants.o3),
          unit: 'ppb',
          description: 'Ground-level ozone formed by chemical reactions between oxides of nitrogen and volatile organic compounds',
          subscript: '3'
        },
        {
          id: 'no2',
          name: 'NO',
          value: pollutants.no2,
          color: getAqiColor(pollutants.no2),
          unit: 'ppb',
          description: 'Nitrogen dioxide from burning of fossil fuels, especially in vehicles',
          subscript: '2'
        },
        {
          id: 'so2',
          name: 'SO',
          value: pollutants.so2,
          color: getAqiColor(pollutants.so2),
          unit: 'ppb',
          description: 'Sulfur dioxide from burning of fossil fuels containing sulfur',
          subscript: '2'
        },
        {
          id: 'co',
          name: 'CO',
          value: pollutants.co,
          color: getAqiColor(pollutants.co),
          unit: 'ppm',
          description: 'Carbon monoxide from incomplete combustion of fossil fuels'
        }
      ];

      setAqiParams(params);
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
        <Text style={styles.loadingText}>Loading AQI data...</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AQI Parameters</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* AQI Value */}
        <View style={styles.aqiContainer}>
          <Text style={styles.aqiTitle}>Current Air Quality</Text>
          <Text style={styles.aqiSubtitle}>
            {aqiData?.nearestStation || 'Your Location'}
          </Text>
          
          <View style={styles.aqiIndicatorContainer}>
            <AqiCircularIndicator 
              value={aqiData?.aqi || 0} 
              size={200}
              strokeWidth={15}
            />
          </View>
        </View>
        
        {/* Parameters */}
        <Text style={styles.sectionTitle}>Parameters</Text>
        <View style={styles.paramsContainer}>
          {aqiParams.map((param) => (
            <TouchableOpacity key={param.id} style={styles.paramCard}>
              <View style={[styles.paramColorIndicator, { backgroundColor: param.color }]} />
              <View style={styles.paramContent}>
                <View style={styles.paramNameContainer}>
                  <Text style={styles.paramName}>{param.name}</Text>
                  {param.subscript && (
                    <Text style={styles.paramSubscript}>{param.subscript}</Text>
                  )}
                </View>
                <Text style={styles.paramValue}>
                  {param.value !== null ? param.value : 'N/A'} {param.value !== null ? param.unit : ''}
                </Text>
              </View>
              <Ionicons name="information-circle-outline" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Preventive Measures Card */}
        <TouchableOpacity 
          style={styles.preventiveMeasuresCard}
          onPress={() => {
            router.navigate('../preventive-measures');
          }}
        >
          <View style={[styles.preventiveIcon, { backgroundColor: '#E1F5FE' }]}>
            <Ionicons name="shield-checkmark" size={24} color="#0288D1" />
          </View>
          <View style={styles.preventiveInfo}>
            <Text style={styles.preventiveTitle}>Preventive Measures</Text>
            <Text style={styles.preventiveSubtitle}>Learn how to protect yourself</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
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
  scrollView: {
    flex: 1,
  },
  aqiContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  aqiTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  aqiSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  aqiIndicatorContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  paramsContainer: {
    marginHorizontal: 16,
  },
  paramCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  paramColorIndicator: {
    width: 12,
    height: 40,
    borderRadius: 6,
    marginRight: 16,
  },
  paramContent: {
    flex: 1,
  },
  paramNameContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  paramName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  paramSubscript: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 1,
  },
  paramValue: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  preventiveMeasuresCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  preventiveIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  preventiveInfo: {
    flex: 1,
  },
  preventiveTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  preventiveSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
});