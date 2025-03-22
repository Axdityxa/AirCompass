import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Animated, PanResponder, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Pollutants, getHealthImplications, getPollutantInfo } from '../types/air-quality';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MIN_PANEL_HEIGHT = 200;
const MAX_PANEL_HEIGHT = SCREEN_HEIGHT - 100;

interface AirQualityDetailsProps {
  locationName: string;
  aqi: number;
  pollutants: Pollutants;
  timestamp: string;
  onClose?: () => void;
}

export function AirQualityDetails({
  locationName,
  aqi,
  pollutants,
  timestamp,
  onClose,
}: AirQualityDetailsProps) {
  // Animation values
  const pan = useRef(new Animated.ValueXY()).current;
  const panelHeight = useRef(new Animated.Value(MIN_PANEL_HEIGHT)).current;
  const [currentHeight, setCurrentHeight] = useState(MIN_PANEL_HEIGHT);
  const [isDragging, setIsDragging] = useState(false);

  // Pan responder for drag gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true);
        pan.setOffset({
          x: 0,
          y: 0,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow vertical movement (negative values move up, positive move down)
        const newHeight = Math.max(
          MIN_PANEL_HEIGHT,
          Math.min(MAX_PANEL_HEIGHT, currentHeight - gestureState.dy)
        );
        panelHeight.setValue(newHeight);
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsDragging(false);
        
        // Calculate new height based on gesture velocity and direction
        let newHeight;
        
        if (Math.abs(gestureState.vy) > 0.5) {
          // If velocity is high, snap to min or max based on direction
          newHeight = gestureState.vy > 0 
            ? MIN_PANEL_HEIGHT // Moving down fast
            : MAX_PANEL_HEIGHT; // Moving up fast
        } else {
          // Otherwise adjust based on current position
          newHeight = Math.max(
            MIN_PANEL_HEIGHT,
            Math.min(MAX_PANEL_HEIGHT, currentHeight - gestureState.dy)
          );
          
          // Snap to 40% height if in the middle zone
          const midPoint = MIN_PANEL_HEIGHT + (MAX_PANEL_HEIGHT - MIN_PANEL_HEIGHT) * 0.5;
          if (newHeight > MIN_PANEL_HEIGHT + 100 && newHeight < midPoint) {
            newHeight = MIN_PANEL_HEIGHT + (MAX_PANEL_HEIGHT - MIN_PANEL_HEIGHT) * 0.4;
          } else if (newHeight >= midPoint && newHeight < MAX_PANEL_HEIGHT - 100) {
            newHeight = MAX_PANEL_HEIGHT * 0.7;
          }
        }
        
        // Animate to the new height
        Animated.spring(panelHeight, {
          toValue: newHeight,
          useNativeDriver: false,
          friction: 8,
          tension: 40,
        }).start();
        
        setCurrentHeight(newHeight);
      },
    })
  ).current;

  const formattedPollutants = Object.entries(pollutants).map(([key, value]) => {
    const info = getPollutantInfo(key as keyof Pollutants);
    return {
      name: info.name,
      value,
      unit: info.unit,
      icon: info.icon as keyof typeof Ionicons.glyphMap,
      description: info.description,
    };
  });

  const formattedDate = new Date(timestamp).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

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

  const aqiColor = getAqiColor(aqi);
  const aqiCategory = getAqiCategory(aqi);
  
  // Determine if panel is expanded based on current height
  const isExpanded = currentHeight > MIN_PANEL_HEIGHT + 100;

  return (
    <Animated.View style={[styles.container, { height: panelHeight }]}>
      {/* Draggable handle for panel */}
      <View 
        style={styles.handleContainer} 
        {...panResponder.panHandlers}
      >
        <View style={[styles.handle, isDragging && styles.handleActive]} />
      </View>

      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{locationName}</Text>
        <TouchableOpacity 
          onPress={handleClose} 
          style={styles.closeButton}
          activeOpacity={0.7}
          hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
        >
          <View style={styles.closeButtonInner}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={true}
        scrollEnabled={!isDragging} // Disable scrolling while dragging
      >
        {/* AQI Value Panel */}
        <View style={styles.aqiPanel}>
          <View style={styles.aqiValueContainer}>
            <Text style={[styles.aqiValue, { color: aqiColor }]}>{aqi}</Text>
            <Text style={styles.aqiLabel}>AQI</Text>
          </View>
          <View style={styles.aqiInfoContainer}>
            <Text style={[styles.aqiCategory, { color: aqiColor }]}>{aqiCategory}</Text>
            <Text style={styles.updated}>Updated: {formattedDate}</Text>
          </View>
        </View>

        {/* Health Information - Only visible when expanded */}
        {isExpanded && (
          <View style={styles.healthContainer}>
            <Text style={styles.healthTitle}>Health Implications</Text>
            <Text style={styles.healthText}>{getHealthImplications(aqi)}</Text>
          </View>
        )}

        {/* Pollutants Section */}
        <Text style={styles.sectionTitle}>Pollutants</Text>
        <View style={styles.pollutantsContainer}>
          {formattedPollutants.map((pollutant) => (
            <View key={pollutant.name} style={styles.pollutantItem}>
              <View style={styles.pollutantHeader}>
                <View style={styles.pollutantIconContainer}>
                  <Ionicons name={pollutant.icon} size={18} color="#4F46E5" />
                </View>
                <Text style={styles.pollutantName}>{pollutant.name}</Text>
              </View>
              <Text style={styles.pollutantValue}>
                {pollutant.value} <Text style={styles.pollutantUnit}>{pollutant.unit}</Text>
              </Text>
            </View>
          ))}
        </View>
        
        {/* Description text - Only visible when expanded */}
        {isExpanded && formattedPollutants.map((pollutant) => (
          <View key={`desc-${pollutant.name}`} style={styles.pollutantDescriptionContainer}>
            <Text style={styles.pollutantDescriptionTitle}>{pollutant.name}</Text>
            <Text style={styles.pollutantDescriptionText}>{pollutant.description}</Text>
          </View>
        ))}
        
        {/* Close button at the bottom */}
        <TouchableOpacity 
          onPress={handleClose}
          style={styles.bottomCloseButton}
          activeOpacity={0.7}
        >
          <Text style={styles.bottomCloseButtonText}>Close</Text>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 24,
  },
  handleContainer: {
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    zIndex: 10,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
  },
  handleActive: {
    backgroundColor: '#9CA3AF',
    width: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  closeButton: {
    padding: 2,
    zIndex: 20,
  },
  closeButtonInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  aqiPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  aqiValueContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  aqiValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  aqiLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  aqiInfoContainer: {
    flex: 1,
  },
  aqiCategory: {
    fontSize: 16,
    fontWeight: '600',
  },
  updated: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  healthContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  healthTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  healthText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 8,
  },
  pollutantsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  pollutantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pollutantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pollutantIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  pollutantName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  pollutantValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  pollutantUnit: {
    fontSize: 12,
    color: '#6B7280',
  },
  pollutantDescriptionContainer: {
    marginTop: 12,
    marginBottom: 4,
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  pollutantDescriptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  pollutantDescriptionText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  bottomCloseButton: {
    marginTop: 16,
    backgroundColor: '#4F46E5',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  bottomCloseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 