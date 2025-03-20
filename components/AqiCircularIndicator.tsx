import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface AqiCircularIndicatorProps {
  value: number;
  size: number;
  strokeWidth: number;
}

export function AqiCircularIndicator({ value, size, strokeWidth }: AqiCircularIndicatorProps) {
  // Get color based on AQI value
  const getAqiColor = (aqi: number): string => {
    if (aqi <= 50) return '#4CAF50'; // Good - Green
    if (aqi <= 100) return '#FFEB3B'; // Moderate - Yellow
    if (aqi <= 150) return '#FF9800'; // Unhealthy for Sensitive Groups - Orange
    if (aqi <= 200) return '#F44336'; // Unhealthy - Red
    if (aqi <= 300) return '#9C27B0'; // Very Unhealthy - Purple
    return '#7D0023'; // Hazardous - Maroon
  };

  // Get category text based on AQI value
  const getAqiCategory = (aqi: number): string => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const color = getAqiColor(value);
  const category = getAqiCategory(value);
  
  // Calculate stroke dash offset based on AQI value (0-500 scale)
  // 500 is the maximum AQI value in the standard scale
  const maxAqi = 500;
  const strokeDashoffset = circumference - (value / maxAqi) * circumference;

  // Calculate a safe width for the content inside the circle
  const contentWidth = Math.max(radius * 1.4, size * 0.6);

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle
          stroke="#E5E7EB"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        
        {/* Progress Circle */}
        <Circle
          stroke={color}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
      </Svg>
      
      <View style={[styles.valueContainer, { width: contentWidth }]}>
        <Text style={[styles.value, { color }]}>{value}</Text>
        <Text style={styles.label}>AQI</Text>
        <Text style={[styles.category, { color }]} numberOfLines={2} ellipsizeMode="tail">{category}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  category: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
}); 