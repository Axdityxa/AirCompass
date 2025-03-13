import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/contexts/auth-context';
import AqiPreferenceCard from '@/components/AqiPreferenceCard';
import { ScrollView } from 'react-native-gesture-handler';

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.username}>{user?.email?.split('@')[0] || 'User'}</Text>
        </View>

        <AqiPreferenceCard />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Air Quality</Text>
          <View style={styles.airQualityCard}>
            <Text style={styles.airQualityValue}>42</Text>
            <View style={styles.airQualityInfo}>
              <Text style={styles.airQualityLabel}>GOOD</Text>
              <Text style={styles.airQualityLocation}>New York City</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Air Quality Forecast</Text>
          <View style={styles.forecastContainer}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => (
              <View key={day} style={styles.forecastDay}>
                <Text style={styles.forecastDayText}>{day}</Text>
                <View 
                  style={[
                    styles.forecastIndicator, 
                    { backgroundColor: getRandomAqiColor() }
                  ]} 
                />
                <Text style={styles.forecastValue}>{getRandomAqi()}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Tips</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Enjoy Outdoor Activities</Text>
            <Text style={styles.tipDescription}>
              Air quality is good today. It's a great time for outdoor activities and exercise.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper functions for demo purposes
function getRandomAqi() {
  return Math.floor(Math.random() * 150) + 20;
}

function getRandomAqiColor() {
  const colors = ['#00E400', '#92D050', '#FFFF00', '#FF7E00', '#FF0000'];
  return colors[Math.floor(Math.random() * 3)]; // Bias toward better air quality
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
    marginBottom: 24,
  },
  greeting: {
    fontSize: 18,
    color: '#6B7280',
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  airQualityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  airQualityValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#00E400',
    marginRight: 16,
  },
  airQualityInfo: {
    flex: 1,
  },
  airQualityLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  airQualityLocation: {
    fontSize: 14,
    color: '#6B7280',
  },
  forecastContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  forecastDay: {
    alignItems: 'center',
  },
  forecastDayText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  forecastIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: 4,
  },
  forecastValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  tipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  tipDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
});
