import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Switch,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useHealthConditions } from '@/contexts/health-conditions-context';

interface HealthConditionOption {
  id: string;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const HEALTH_CONDITION_OPTIONS: HealthConditionOption[] = [
  {
    id: 'respiratory',
    label: 'Respiratory Issues',
    description: 'Asthma, COPD, or other respiratory conditions',
    icon: 'medical',
  },
  {
    id: 'cardiovascular',
    label: 'Cardiovascular Disease',
    description: 'Heart attacks, stroke, or other heart-related conditions',
    icon: 'heart',
  },
  {
    id: 'cancer',
    label: 'Cancer Risk',
    description: 'Increased risk of lung cancer or other cancers',
    icon: 'warning',
  },
];

export default function HealthConditionsScreen() {
  const [selectedConditions, setSelectedConditions] = useState<Record<string, boolean>>({
    respiratory: false,
    cardiovascular: false,
    cancer: false,
  });
  
  const { saveHealthConditions, isLoading, healthConditions } = useHealthConditions();
  const router = useRouter();

  // Initialize with user's current health conditions if available
  React.useEffect(() => {
    if (healthConditions) {
      setSelectedConditions({
        respiratory: healthConditions.hasRespiratoryIssues,
        cardiovascular: healthConditions.hasCardiovascularDisease,
        cancer: healthConditions.hasCancerRisk,
      });
    }
  }, [healthConditions]);

  const handleConditionToggle = (id: string) => {
    setSelectedConditions(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSaveConditions = async () => {
    await saveHealthConditions({
      hasRespiratoryIssues: selectedConditions.respiratory,
      hasCardiovascularDisease: selectedConditions.cardiovascular,
      hasCancerRisk: selectedConditions.cancer,
    });
    
    // Navigate to the main dashboard
    router.replace('/(tabs)');
  };

  const hasAnyCondition = Object.values(selectedConditions).some(Boolean);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInUp.delay(200).duration(700)} style={styles.header}>
          <Image 
            source={require('@/assets/images/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Health Conditions</Text>
          <Text style={styles.subtitle}>
            Please let us know if you have any of these health conditions so we can customize your air quality notifications
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(700)} style={styles.selectionContainer}>
          {HEALTH_CONDITION_OPTIONS.map((condition) => (
            <View key={condition.id} style={styles.conditionItem}>
              <View style={styles.conditionContent}>
                <View style={styles.iconContainer}>
                  <Ionicons name={condition.icon} size={24} color="#6366F1" />
                </View>
                <View style={styles.conditionInfo}>
                  <Text style={styles.conditionLabel}>{condition.label}</Text>
                  <Text style={styles.conditionDescription}>{condition.description}</Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: '#E5E7EB', true: '#C7D2FE' }}
                thumbColor={selectedConditions[condition.id] ? '#6366F1' : '#F9FAFB'}
                ios_backgroundColor="#E5E7EB"
                onValueChange={() => handleConditionToggle(condition.id)}
                value={selectedConditions[condition.id]}
              />
            </View>
          ))}
          
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color="#6B7280" style={styles.infoIcon} />
            <Text style={styles.infoText}>
              This information helps us provide more relevant air quality alerts and recommendations for your health needs.
            </Text>
          </View>
        </Animated.View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            isLoading && styles.disabledButton
          ]}
          onPress={handleSaveConditions}
          disabled={isLoading}
        >
          <Text style={styles.continueButtonText}>
            {isLoading ? 'Saving...' : hasAnyCondition ? 'Continue' : 'Skip'}
          </Text>
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
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: '85%',
    lineHeight: 22,
  },
  selectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  conditionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  conditionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  conditionInfo: {
    flex: 1,
  },
  conditionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  conditionDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#C7D2FE',
    shadowOpacity: 0.1,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 