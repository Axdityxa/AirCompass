import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useHealthConditions } from '@/contexts/health-conditions-context';

interface HealthConditionsCardProps {
  showEditButton?: boolean;
  onEditPress?: () => void;
}

export default function HealthConditionsCard({ 
  showEditButton = true,
  onEditPress
}: HealthConditionsCardProps) {
  const { healthConditions } = useHealthConditions();
  const router = useRouter();

  if (!healthConditions) {
    return null;
  }

  const handleEditPress = () => {
    if (onEditPress) {
      onEditPress();
    } else {
      router.push('/(tabs)/health-conditions');
    }
  };

  // Get count of active conditions
  const standardConditionsCount = 
    (healthConditions.hasRespiratoryIssues ? 1 : 0) +
    (healthConditions.hasCardiovascularDisease ? 1 : 0) +
    (healthConditions.hasCancerRisk ? 1 : 0);
  
  const hasOtherCondition = !!healthConditions.otherConditions;
  const activeConditionsCount = standardConditionsCount + (hasOtherCondition ? 1 : 0);
  
  // Get list of active condition names
  const activeConditions = [];
  if (healthConditions.hasRespiratoryIssues) activeConditions.push('Respiratory Issues');
  if (healthConditions.hasCardiovascularDisease) activeConditions.push('Cardiovascular Disease');
  if (healthConditions.hasCancerRisk) activeConditions.push('Cancer Risk');
  if (hasOtherCondition) activeConditions.push('Other Conditions');

  // Create a description based on the active conditions
  let description = 'No health conditions selected.';
  if (activeConditionsCount > 0) {
    description = 'You have indicated that you have the following health conditions that may be affected by air quality: ' + 
      activeConditions.join(', ') + '.';
    
    // Add other conditions details if present
    if (hasOtherCondition) {
      description += ` Your other condition(s): ${healthConditions.otherConditions}.`;
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Conditions</Text>
        {showEditButton && (
          <TouchableOpacity onPress={handleEditPress} style={styles.editButton}>
            <Ionicons name="pencil" size={16} color="#6366F1" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <View style={[
          styles.indicatorContainer,
          { backgroundColor: activeConditionsCount > 0 ? '#FEE2E2' : '#E5E7EB' }
        ]}>
          <Ionicons 
            name="medical" 
            size={18} 
            color={activeConditionsCount > 0 ? '#EF4444' : '#9CA3AF'} 
          />
        </View>
        <View style={styles.conditionInfo}>
          <Text style={styles.conditionLabel}>
            {activeConditionsCount > 0 
              ? `${activeConditionsCount} condition${activeConditionsCount > 1 ? 's' : ''}` 
              : 'No conditions'}
          </Text>
          <Text style={styles.conditionDetails}>
            {activeConditionsCount > 0 
              ? activeConditions.join(', ') 
              : 'No health conditions selected'}
          </Text>
        </View>
      </View>

      <Text style={styles.description}>
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    color: '#6366F1',
    marginLeft: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  indicatorContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  conditionInfo: {
    flex: 1,
  },
  conditionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  conditionDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
}); 