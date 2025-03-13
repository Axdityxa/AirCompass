import React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import PermissionHandler from '@/components/PermissionHandler';
import { usePermissions } from '@/contexts/permissions-context';

export default function PermissionsScreen() {
  const router = useRouter();
  const { setSkipPermissionsFlow } = usePermissions();

  const handlePermissionsGranted = () => {
    // Navigate to the authentication screen after permissions are handled
    router.replace('/auth/sign-in');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Logo at the top */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('@/assets/images/icon.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>AirCompass</Text>
        <Text style={styles.subtitle}>Your personal air quality guide</Text>
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
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    tintColor: '#1e88e5', // Blue color for the logo
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e88e5',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#546e7a',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
}); 