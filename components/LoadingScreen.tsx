import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  // Animation values
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  // Set up animations on component mount
  useEffect(() => {
    // Rotation animation
    rotation.value = withRepeat(
      withTiming(360, { duration: 2000, easing: Easing.linear }),
      -1, // -1 for infinite repeats
      false
    );

    // Pulse animation
    scale.value = withRepeat(
      withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true // reverse when complete
    );
  }, []);

  // Define animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: scale.value }
      ],
    };
  });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Animated.View style={[styles.logoContainer, animatedStyle]}>
        <Image 
          source={require('@/assets/images/cloud.png')} 
          style={styles.logo}
        />
      </Animated.View>
      <ActivityIndicator size="large" color="#1e88e5" style={styles.spinner} />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  logoContainer: {
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
  },
  spinner: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
}); 