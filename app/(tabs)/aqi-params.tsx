import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface AqiParam {
  id: string;
  name: string;
  value: number;
  color: string;
  unit: string;
  description: string;
}

const aqiParams: AqiParam[] = [
  {
    id: 'co',
    name: 'CO',
    value: 30.11,
    color: '#7C3AED',
    unit: 'mg/m³',
    description: 'Carbon Monoxide - A toxic gas produced by incomplete combustion'
  },
  {
    id: 'so2',
    name: 'SO₂',
    value: 29.7,
    color: '#7C3AED',
    unit: 'µg/m³',
    description: 'Sulfur Dioxide - Produced by burning fossil fuels'
  },
  {
    id: 'pm25',
    name: 'PM2.5/PM10',
    value: 54.7,
    color: '#EC4899',
    unit: 'µg/m³',
    description: 'Particulate Matter - Fine particles that can penetrate deep into lungs'
  },
  {
    id: 'o3',
    name: 'O₃',
    value: 56.4,
    color: '#F97316',
    unit: 'µg/m³',
    description: 'Ozone - A major component of smog'
  },
  {
    id: 'no2',
    name: 'NO₂',
    value: 11.90,
    color: '#F59E0B',
    unit: 'µg/m³',
    description: 'Nitrogen Dioxide - Produced by vehicles and power plants'
  }
];

export default function AqiParamsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AQI Parameters</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overall AQI Value */}
        <View style={styles.overallAqiContainer}>
          <View style={styles.aqiCircle}>
            <Text style={styles.aqiValue}>256</Text>
            <Text style={styles.aqiLabel}>Overall AQI Value</Text>
          </View>
        </View>

        {/* Parameters List */}
        <View style={styles.paramsList}>
          {aqiParams.map((param) => (
            <TouchableOpacity 
              key={param.id}
              style={styles.paramCard}
              onPress={() => {
                // Handle parameter details view
                console.log(`Show details for ${param.name}`);
              }}
            >
              <View style={[styles.paramIcon, { backgroundColor: param.color }]} />
              <View style={styles.paramInfo}>
                <Text style={styles.paramName}>{param.name}</Text>
                <Text style={styles.paramDescription}>{param.description}</Text>
              </View>
              <View style={styles.paramValue}>
                <Text style={styles.valueText}>{param.value}</Text>
                <Text style={styles.unitText}>{param.unit}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Preventive Measures Card */}
        <TouchableOpacity 
          style={styles.preventiveMeasuresCard}
          onPress={() => {
            // Use a relative path instead
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 12,
  },
  content: {
    flex: 1,
  },
  overallAqiContainer: {
    padding: 24,
    alignItems: 'center',
  },
  aqiCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  aqiValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111827',
  },
  aqiLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  paramsList: {
    padding: 16,
  },
  paramCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  paramIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  paramInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  paramName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  paramDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  paramValue: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  unitText: {
    fontSize: 12,
    color: '#6B7280',
  },
  preventiveMeasuresCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  preventiveIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  preventiveInfo: {
    flex: 1,
    marginLeft: 12,
  },
  preventiveTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  preventiveSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
}); 