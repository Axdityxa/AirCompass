import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAqiPreferences } from '@/contexts/aqi-preferences-context';

interface AqiPreferenceCardProps {
  showEditButton?: boolean;
  onEditPress?: () => void;
}

export default function AqiPreferenceCard({ 
  showEditButton = true,
  onEditPress
}: AqiPreferenceCardProps) {
  const { preferredAqiCategory } = useAqiPreferences();
  const router = useRouter();

  if (!preferredAqiCategory) {
    return null;
  }

  const handleEditPress = () => {
    if (onEditPress) {
      onEditPress();
    } else {
      router.push('/(tabs)/select-air');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Air Preference</Text>
        {showEditButton && (
          <TouchableOpacity onPress={handleEditPress} style={styles.editButton}>
            <Ionicons name="pencil" size={16} color="#6366F1" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <View style={[styles.categoryIndicator, { backgroundColor: preferredAqiCategory.color }]} />
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryLabel}>{preferredAqiCategory.label}</Text>
          <Text style={styles.categoryRange}>AQI: {preferredAqiCategory.range}</Text>
        </View>
      </View>

      <Text style={styles.description}>
        {preferredAqiCategory.description}
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
  categoryIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  categoryRange: {
    fontSize: 14,
    color: '#6B7280',
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
}); 