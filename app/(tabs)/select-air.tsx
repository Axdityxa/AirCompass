import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Image,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useAqiPreferences, AQI_CATEGORIES } from '@/contexts/aqi-preferences-context';

export default function SelectAirScreen() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const { savePreference, isLoading, preferredAqiCategory } = useAqiPreferences();
  const router = useRouter();

  // Initialize with the user's current preference if available
  React.useEffect(() => {
    if (preferredAqiCategory) {
      setSelectedCategory(preferredAqiCategory.id);
    }
  }, [preferredAqiCategory]);

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategory(categoryId);
  };

  const handleSavePreference = async () => {
    if (!selectedCategory) return;
    
    await savePreference(selectedCategory);
    
    // Navigate to the health conditions screen
    router.replace('/(tabs)/health-conditions');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInUp.delay(200).duration(700)} style={styles.header}>
          <Image 
            source={require('@/assets/images/cloud.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Select Your Air</Text>
          <Text style={styles.subtitle}>
            Choose the air quality range you prefer to breathe
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(700)} style={styles.selectionContainer}>
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownLabel}>Range</Text>
            <Ionicons name="chevron-down" size={20} color="#6366F1" style={styles.dropdownIcon} />
          </View>

          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.checkboxColumn]}>Check</Text>
            <Text style={[styles.tableHeaderText, styles.indexColumn]}>Air Quality Index</Text>
            <Text style={[styles.tableHeaderText, styles.categoryColumn]}>Category</Text>
          </View>

          {AQI_CATEGORIES.map((category) => (
            <Pressable
              key={category.id}
              style={[
                styles.categoryRow,
                selectedCategory === category.id && styles.selectedRow
              ]}
              onPress={() => handleCategorySelect(category.id)}
            >
              <View style={styles.checkboxColumn}>
                <View style={[
                  styles.checkbox,
                  selectedCategory !== category.id && { backgroundColor: 'transparent' }
                ]}>
                  {selectedCategory === category.id && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
              </View>
              <Text style={[styles.rangeText, styles.indexColumn]}>{category.range}</Text>
              <Text 
                style={[
                  styles.categoryText, 
                  styles.categoryColumn,
                  { color: category.color }
                ]}
              >
                {category.label}
              </Text>
            </Pressable>
          ))}

          {selectedCategory && (
            <Animated.View 
              entering={FadeInUp.duration(500)} 
              style={styles.descriptionContainer}
            >
              <Text style={styles.descriptionTitle}>Description:</Text>
              <Text style={styles.descriptionText}>
                {AQI_CATEGORIES.find(c => c.id === selectedCategory)?.description}
              </Text>
            </Animated.View>
          )}
        </Animated.View>

        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedCategory || isLoading) && styles.disabledButton
          ]}
          onPress={handleSavePreference}
          disabled={!selectedCategory || isLoading}
        >
          <Text style={styles.continueButtonText}>
            {isLoading ? 'Saving...' : 'Continue'}
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
    maxWidth: '80%',
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
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  dropdownLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6366F1',
  },
  dropdownIcon: {
    marginLeft: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 8,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  checkboxColumn: {
    width: '15%',
    alignItems: 'center',
  },
  indexColumn: {
    width: '40%',
  },
  categoryColumn: {
    width: '45%',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedRow: {
    backgroundColor: '#F9FAFB',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#6366F1',
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rangeText: {
    fontSize: 15,
    color: '#374151',
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '600',
  },
  descriptionContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6366F1',
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#A5B4FC',
    opacity: 0.7,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 