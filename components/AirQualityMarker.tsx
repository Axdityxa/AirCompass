import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';

interface AirQualityMarkerProps {
  aqi: number;
  size?: 'small' | 'medium' | 'large';
  isActive?: boolean;
  onPress?: () => void;
}

export function AirQualityMarker({ 
  aqi, 
  size = 'medium', 
  isActive = false,
  onPress 
}: AirQualityMarkerProps) {
  // Get color based on AQI
  const getColor = (aqi: number): string => {
    if (aqi <= 50) return '#4CAF50'; // Good - Green
    if (aqi <= 100) return '#FFEB3B'; // Moderate - Yellow
    if (aqi <= 150) return '#FF9800'; // Unhealthy for Sensitive Groups - Orange
    if (aqi <= 200) return '#F44336'; // Unhealthy - Red
    if (aqi <= 300) return '#9C27B0'; // Very Unhealthy - Purple
    return '#7D0023'; // Hazardous - Maroon
  };

  const color = getColor(aqi);
  
  // Size mapping for consistent dimensions
  const sizeMap = {
    small: { container: 28, text: 11, zIndex: 1 },
    medium: { container: 36, text: 13, zIndex: 2 },
    large: { container: 44, text: 16, zIndex: 3 },
  };
  
  const dimensions = sizeMap[size];
  
  // Increase zIndex for active marker
  const zIndex = isActive ? dimensions.zIndex + 10 : dimensions.zIndex;
  
  const markerContent = (
    <View
      style={[
        styles.container,
        {
          width: dimensions.container,
          height: dimensions.container,
          backgroundColor: color,
          zIndex,
          shadowOpacity: isActive ? 0.3 : 0.2,
          shadowRadius: isActive ? 10 : 5,
          elevation: isActive ? 10 : 5,
          borderWidth: isActive ? 2 : 1,
          borderColor: 'white',
        },
      ]}
    >
      <Text style={[styles.text, { fontSize: dimensions.text }]}>{aqi}</Text>
    </View>
  );
  
  if (onPress) {
    return (
      <TouchableOpacity 
        onPress={onPress}
        activeOpacity={0.7}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
        {markerContent}
      </TouchableOpacity>
    );
  }
  
  return markerContent;
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowRadius: 2,
    textShadowOffset: { width: 0, height: 1 },
  },
}); 