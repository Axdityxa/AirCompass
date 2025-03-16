import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAqiPreferences } from '@/contexts/aqi-preferences-context';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { preferredAqiCategory } = useAqiPreferences();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'My Air',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <Ionicons name="compass" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <Ionicons name="map" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color }) => <Ionicons name="people" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
          // Hide this tab from the tab bar since it's accessed from the profile button
          href: null,
        }}
      />
      <Tabs.Screen
        name="select-air"
        options={{
          title: 'Air Quality',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="wind" color={color} />,
          // Hide this tab from the tab bar since it's only for onboarding
          href: null,
        }}
      />
      <Tabs.Screen
        name="aqi-params"
        options={{
          title: 'AQI Parameters',
          tabBarIcon: ({ color }) => <Ionicons name="analytics" size={24} color={color} />,
          // Hide this tab from the tab bar since it's accessed from other screens
          href: null,
        }}
      />
      <Tabs.Screen
        name="preventive-measures"
        options={{
          title: 'Preventive Measures',
          tabBarIcon: ({ color }) => <Ionicons name="shield-checkmark" size={24} color={color} />,
          // Hide this tab from the tab bar since it's accessed from other screens
          href: null,
        }}
      />
    </Tabs>
  );
}
