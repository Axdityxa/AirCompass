import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface PreventiveMeasure {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  category: 'personal' | 'home' | 'community';
}

const MEASURES: Record<string, PreventiveMeasure[]> = {
  personal: [
    {
      id: 'p1',
      title: 'Wear a mask outdoors',
      description: 'Use N95 or KN95 masks when AQI exceeds 150 to filter out harmful particles.',
      icon: 'medical-outline',
      category: 'personal',
    },
    {
      id: 'p2',
      title: 'Limit outdoor activities',
      description: 'Reduce time spent outdoors, especially during peak pollution hours.',
      icon: 'time-outline',
      category: 'personal',
    },
    {
      id: 'p3',
      title: 'Stay hydrated',
      description: 'Drink plenty of water to help your body flush out toxins.',
      icon: 'water-outline',
      category: 'personal',
    },
    {
      id: 'p4',
      title: 'Take supplements',
      description: 'Consider antioxidants like Vitamin C, E, and Omega-3 fatty acids.',
      icon: 'fitness-outline',
      category: 'personal',
    },
  ],
  home: [
    {
      id: 'h1',
      title: 'Use air purifiers',
      description: 'HEPA air purifiers can remove up to 99.97% of airborne particles.',
      icon: 'ban-outline',
      category: 'home',
    },
    {
      id: 'h2',
      title: 'Keep windows closed',
      description: 'Prevent outdoor pollutants from entering your home during high AQI days.',
      icon: 'home-outline',
      category: 'home',
    },
    {
      id: 'h3',
      title: 'Maintain clean filters',
      description: 'Regularly clean or replace HVAC filters to improve indoor air quality.',
      icon: 'filter-outline',
      category: 'home',
    },
    {
      id: 'h4',
      title: 'Use indoor plants',
      description: 'Plants like Snake Plant and Peace Lily can help filter indoor air.',
      icon: 'leaf-outline',
      category: 'home',
    },
  ],
  community: [
    {
      id: 'c1',
      title: 'Carpool or use public transit',
      description: 'Reduce emissions by sharing rides or using public transportation.',
      icon: 'car-outline',
      category: 'community',
    },
    {
      id: 'c2',
      title: 'Support clean air policies',
      description: 'Advocate for regulations that reduce industrial and vehicle emissions.',
      icon: 'document-text-outline',
      category: 'community',
    },
    {
      id: 'c3',
      title: 'Plant trees',
      description: 'Participate in community tree planting initiatives to improve air quality.',
      icon: 'leaf-outline',
      category: 'community',
    },
    {
      id: 'c4',
      title: 'Report pollution sources',
      description: 'Alert local authorities about excessive smoke or pollution sources.',
      icon: 'megaphone-outline',
      category: 'community',
    },
  ],
};

export default function PreventiveMeasuresScreen() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<'personal' | 'home' | 'community'>('personal');

  const categoryColors = {
    personal: {
      bg: '#EEF2FF',
      icon: '#4F46E5',
      border: '#C7D2FE',
    },
    home: {
      bg: '#F0FDF4',
      icon: '#16A34A',
      border: '#BBF7D0',
    },
    community: {
      bg: '#FDF2F8',
      icon: '#DB2777',
      border: '#FBCFE8',
    },
  };

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
        <Text style={styles.headerTitle}>Preventive Measures</Text>
        <View style={styles.profileButton}>
          <Text style={styles.profileText}>
            {/* First letter of user's email */}
            A
          </Text>
        </View>
      </View>

      {/* Subtitle */}
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>
          Follow these measures to maintain a better Health!!
        </Text>
      </View>

      {/* Category Selector */}
      <View style={styles.categoryContainer}>
        <TouchableOpacity 
          style={[
            styles.categoryButton, 
            { 
              backgroundColor: activeCategory === 'personal' ? categoryColors.personal.bg : '#FFFFFF',
              borderColor: activeCategory === 'personal' ? categoryColors.personal.border : '#E5E7EB',
            }
          ]}
          onPress={() => setActiveCategory('personal')}
        >
          <View style={[styles.categoryIcon, { backgroundColor: categoryColors.personal.bg }]}>
            <Ionicons name="person" size={20} color={categoryColors.personal.icon} />
          </View>
          <Text style={styles.categoryText}>Personal</Text>
          <Ionicons 
            name="chevron-down" 
            size={16} 
            color="#6B7280" 
            style={styles.categoryArrow} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.categoryButton, 
            { 
              backgroundColor: activeCategory === 'home' ? categoryColors.home.bg : '#FFFFFF',
              borderColor: activeCategory === 'home' ? categoryColors.home.border : '#E5E7EB',
            }
          ]}
          onPress={() => setActiveCategory('home')}
        >
          <View style={[styles.categoryIcon, { backgroundColor: categoryColors.home.bg }]}>
            <Ionicons name="home" size={20} color={categoryColors.home.icon} />
          </View>
          <Text style={styles.categoryText}>Home</Text>
          <Ionicons 
            name="chevron-down" 
            size={16} 
            color="#6B7280" 
            style={styles.categoryArrow} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.categoryButton, 
            { 
              backgroundColor: activeCategory === 'community' ? categoryColors.community.bg : '#FFFFFF',
              borderColor: activeCategory === 'community' ? categoryColors.community.border : '#E5E7EB',
            }
          ]}
          onPress={() => setActiveCategory('community')}
        >
          <View style={[styles.categoryIcon, { backgroundColor: categoryColors.community.bg }]}>
            <Ionicons name="people" size={20} color={categoryColors.community.icon} />
          </View>
          <Text style={styles.categoryText}>Community</Text>
          <Ionicons 
            name="chevron-down" 
            size={16} 
            color="#6B7280" 
            style={styles.categoryArrow} 
          />
        </TouchableOpacity>
      </View>

      {/* Measures List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.measuresList}>
          {MEASURES[activeCategory].map((measure) => (
            <TouchableOpacity 
              key={measure.id}
              style={styles.measureCard}
              onPress={() => {
                // Handle measure details view
                console.log(`Show details for ${measure.title}`);
              }}
            >
              <View style={[
                styles.measureIcon, 
                { backgroundColor: categoryColors[measure.category].bg }
              ]}>
                <Ionicons 
                  name={measure.icon} 
                  size={24} 
                  color={categoryColors[measure.category].icon} 
                />
              </View>
              <View style={styles.measureInfo}>
                <Text style={styles.measureTitle}>{measure.title}</Text>
                <Text style={styles.measureDescription}>{measure.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Additional Resources */}
        <View style={styles.resourcesContainer}>
          <Text style={styles.resourcesTitle}>Additional Resources</Text>
          <TouchableOpacity style={styles.resourceCard}>
            <Ionicons name="document-text-outline" size={24} color="#1e88e5" />
            <Text style={styles.resourceText}>WHO Air Quality Guidelines</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resourceCard}>
            <Ionicons name="videocam-outline" size={24} color="#1e88e5" />
            <Text style={styles.resourceText}>Video: How to Use Air Purifiers</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EC4899',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitleContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
  },
  categoryContainer: {
    padding: 16,
    paddingTop: 8,
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 12,
  },
  categoryArrow: {
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  measuresList: {
    padding: 16,
    paddingTop: 8,
  },
  measureCard: {
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
  measureIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  measureInfo: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
  measureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  measureDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  resourcesContainer: {
    padding: 16,
    paddingTop: 8,
    marginBottom: 24,
  },
  resourcesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  resourceCard: {
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
  resourceText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginLeft: 16,
  },
}); 