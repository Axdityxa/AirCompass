import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LaunchScreen() {
  const router = useRouter();

  const handleContinue = async () => {
    try {
      // Set flag indicating user has started the app
      await AsyncStorage.setItem('hasStartedApp', 'true');
      
      // Navigate to the permissions screen
      router.push('/permissions');
    } catch (error) {
      console.error('Error setting app started flag:', error);
      // Navigate anyway in case of error
      router.push('/permissions');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={styles.content}>
        <Image 
          source={require('../public/emily.png')} 
          style={styles.image}
          resizeMode="contain"
        />
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>AIRCOMPASS</Text>
          <Text style={styles.subtitle}>
            Know your Air,{'\n'}
            Breathe with Care.
          </Text>
        </View>
        
        <Pressable 
          style={styles.button}
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#b3c7ff', // Light purple/blue background
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: '15%',
    paddingHorizontal: 24,
  },
  image: {
    width: '120%',
    height: '70%',
    marginBottom: 20,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1e88e5', // Blue color for AIRCOMPASS
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    textAlign: 'center',
    color: '#424242',
    lineHeight: 28,
  },
  button: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
  },
}); 