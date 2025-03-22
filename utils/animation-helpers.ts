import { Animated, Easing } from 'react-native';

/**
 * Animation utility functions for creating smooth transitions in the app
 */

/**
 * Creates a pulsing animation for drawing attention to elements
 * @param animatedValue The Animated.Value to animate
 * @param minValue Minimum scale value
 * @param maxValue Maximum scale value
 * @param duration Duration of one pulse cycle in ms
 * @returns Function to start the animation
 */
export function createPulseAnimation(
  animatedValue: Animated.Value,
  minValue = 0.95,
  maxValue = 1.05,
  duration = 1000
): () => void {
  return () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: maxValue,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: minValue,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };
}

/**
 * Creates a slide in animation from a direction
 * @param animatedValue The Animated.Value to animate
 * @param fromValue Initial value (e.g., -100 for left)
 * @param toValue Final value (usually 0)
 * @param duration Animation duration in ms
 * @returns Function to start the animation
 */
export function createSlideAnimation(
  animatedValue: Animated.Value,
  fromValue: number,
  toValue: number,
  duration = 300
): () => void {
  return () => {
    animatedValue.setValue(fromValue);
    Animated.timing(animatedValue, {
      toValue,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };
}

/**
 * Creates a fade animation for elements
 * @param animatedValue The Animated.Value to animate
 * @param fromValue Initial opacity value
 * @param toValue Final opacity value
 * @param duration Animation duration in ms
 * @returns Function to start the animation
 */
export function createFadeAnimation(
  animatedValue: Animated.Value,
  fromValue: number,
  toValue: number,
  duration = 300
): () => void {
  return () => {
    animatedValue.setValue(fromValue);
    Animated.timing(animatedValue, {
      toValue,
      duration,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  };
}

/**
 * Creates a progress animation for progress bars
 * @param animatedValue The Animated.Value to animate
 * @param toValue Target value (0-1)
 * @param duration Animation duration in ms
 * @returns Function to start the animation
 */
export function createProgressAnimation(
  animatedValue: Animated.Value,
  toValue: number,
  duration = 500
): () => void {
  return () => {
    Animated.timing(animatedValue, {
      toValue,
      duration,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false, // Width animations can't use native driver
    }).start();
  };
}

/**
 * Creates a bounce animation for elements
 * @param animatedValue The Animated.Value to animate
 * @param value Target value to bounce to
 * @param duration Animation duration in ms
 * @returns Function to start the animation
 */
export function createBounceAnimation(
  animatedValue: Animated.Value,
  value = 1.2,
  duration = 300
): () => Promise<void> {
  return () => {
    return new Promise((resolve) => {
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: value,
          duration: duration / 2,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: duration / 2,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => resolve());
    });
  };
}

/**
 * Creates a flip animation for cards
 * @param frontAnimatedValue Front side animated value
 * @param backAnimatedValue Back side animated value
 * @param duration Animation duration in ms
 * @returns Object with functions to flip to front and back
 */
export function createFlipAnimation(
  frontAnimatedValue: Animated.Value,
  backAnimatedValue: Animated.Value,
  duration = 500
): {
  flipToFront: () => void;
  flipToBack: () => void;
} {
  return {
    flipToFront: () => {
      Animated.parallel([
        Animated.timing(frontAnimatedValue, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(backAnimatedValue, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    },
    flipToBack: () => {
      Animated.parallel([
        Animated.timing(frontAnimatedValue, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(backAnimatedValue, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    },
  };
} 