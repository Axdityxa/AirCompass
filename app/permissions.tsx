import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import PermissionHandler from '../components/PermissionHandler';

export default function PermissionsScreen() {
  const router = useRouter();

  const handlePermissionsGranted = () => {
    // Navigate to the main app after permissions are handled
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Logo at the top */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/images/icon.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      
      {/* Permission handler component */}
      <PermissionHandler onPermissionsGranted={handlePermissionsGranted} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8eaf6', // Light blue/gray background
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 80,
  },
  logo: {
    width: 100,
    height: 100,
    tintColor: '#1e88e5', // Blue color for the logo
  },
}); 