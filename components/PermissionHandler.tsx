import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Alert } from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';

interface PermissionHandlerProps {
  onPermissionsGranted: () => void;
}

export default function PermissionHandler({ onPermissionsGranted }: PermissionHandlerProps) {
  const [locationPermissionRequested, setLocationPermissionRequested] = useState(false);
  const [notificationPermissionRequested, setNotificationPermissionRequested] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(true);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const router = useRouter();

  const requestLocationPermission = async () => {
    setShowLocationModal(false);
    
    const { status } = await Location.requestForegroundPermissionsAsync();
    setLocationPermissionRequested(true);
    
    if (status === 'granted') {
      // Show notification permission modal after location is granted
      setShowNotificationModal(true);
    } else {
      // If location permission is denied, still show notification permission
      setShowNotificationModal(true);
      Alert.alert(
        "Location Permission Required",
        "To provide accurate air quality data, we need your location. You can enable it in your device settings.",
        [{ text: "OK" }]
      );
    }
  };

  const requestNotificationPermission = async () => {
    setShowNotificationModal(false);
    
    const { status } = await Notifications.requestPermissionsAsync();
    setNotificationPermissionRequested(true);
    
    if (status !== 'granted') {
      Alert.alert(
        "Notification Permission",
        "You won't receive air quality alerts. You can enable notifications in your device settings.",
        [{ text: "OK" }]
      );
    }
    
    // Continue to the main app regardless of notification permission
    onPermissionsGranted();
  };

  const skipNotifications = () => {
    setShowNotificationModal(false);
    onPermissionsGranted();
  };

  return (
    <>
      {/* Location Permission Modal */}
      <Modal
        visible={showLocationModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Permission Needed</Text>
            <Text style={styles.modalText}>
              To provide you with air quality around you, allow the app to access location.
            </Text>
            <View style={styles.buttonContainer}>
              <Pressable 
                style={[styles.button, styles.cancelButton]} 
                onPress={() => {
                  setShowLocationModal(false);
                  router.replace('/(tabs)');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={[styles.button, styles.allowButton]} 
                onPress={requestLocationPermission}
              >
                <Text style={styles.allowButtonText}>Allow</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Notification Permission Modal */}
      <Modal
        visible={showNotificationModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Permission Needed</Text>
            <Text style={styles.modalText}>
              Enable Smart Alerts to stay informed! Get notified instantly when the Air Quality Index(AQI) reaches your selected category.
            </Text>
            <View style={styles.buttonContainer}>
              <Pressable 
                style={[styles.button, styles.cancelButton]} 
                onPress={skipNotifications}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={[styles.button, styles.allowButton]} 
                onPress={requestNotificationPermission}
              >
                <Text style={styles.allowButtonText}>Allow</Text>
              </Pressable>
            </View>
          </View>
        </View>
        <View style={styles.bottomButtonsContainer}>
          <Pressable 
            style={styles.getAlertsButton}
            onPress={requestNotificationPermission}
          >
            <Text style={styles.getAlertsButtonText}>Get Smart Alerts</Text>
          </Pressable>
          <Pressable 
            onPress={skipNotifications}
          >
            <Text style={styles.notNowText}>Not now</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  allowButton: {
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '500',
  },
  allowButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '500',
  },
  bottomButtonsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  getAlertsButton: {
    backgroundColor: '#8c9eff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    width: '80%',
    alignItems: 'center',
    marginBottom: 16,
  },
  getAlertsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  notNowText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
}); 