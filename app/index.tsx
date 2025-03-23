import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

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
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.title}>AirCompass</Text>
          <Text style={styles.subtitle}>
            Know your Air,{'\n'}
            Breathe with Care.
          </Text>
        </View>

        <Pressable
          style={styles.button}
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color="white" style={styles.buttonIcon} />
        </Pressable>
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFC7B3', // #FFEFEF
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: '10%',
    paddingHorizontal: 24,
  },
  image: {
    width: '120%',
    height: '55%',
    marginBottom: 0,
  },
  textContainer: {
    alignItems: 'center',
    marginTop: -40,
    marginBottom: 60,
  },
  welcomeText: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 10,
    textAlign: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#1a365d',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    textAlign: 'center',
    color: '#424242',
    lineHeight: 28,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 60,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#4c6ef5',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 8,
  }
}); 