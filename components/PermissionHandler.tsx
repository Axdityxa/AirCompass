import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Alert } from 'react-native';
import { usePermissions } from '@/contexts/permissions-context';

interface PermissionHandlerProps {
  onPermissionsGranted: () => void;
}

export default function PermissionHandler({ onPermissionsGranted }: PermissionHandlerProps) {
  const [showLocationModal, setShowLocationModal] = useState(true);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  
  const { 
    requestLocationPermission, 
    requestNotificationPermission,
    setSkipPermissionsFlow
  } = usePermissions();

  const handleLocationPermission = async () => {
    setShowLocationModal(false);
    
    const granted = await requestLocationPermission();
    
    if (granted) {
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

  const handleNotificationPermission = async () => {
    setShowNotificationModal(false);
    
    const granted = await requestNotificationPermission();
    
    if (!granted) {
      Alert.alert(
        "Notification Permission",
        "You won't receive air quality alerts. You can enable notifications in your device settings.",
        [{ text: "OK", onPress: () => completePermissionsFlow() }]
      );
    } else {
      // Continue to the next screen after permissions are handled
      completePermissionsFlow();
    }
  };

  const skipNotifications = () => {
    setShowNotificationModal(false);
    // Continue to the next screen even if notifications are skipped
    completePermissionsFlow();
  };

  const skipLocationPermission = () => {
    setShowLocationModal(false);
    // Show notification permission even if location is skipped
    setShowNotificationModal(true);
  };

  const completePermissionsFlow = async () => {
    // Mark permissions flow as completed
    await setSkipPermissionsFlow(true);
    // Navigate to the next screen
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
            <Text style={styles.modalTitle}>Location Permission</Text>
            <Text style={styles.modalText}>
              To provide you with air quality information around you, we need access to your location.
            </Text>
            <View style={styles.buttonContainer}>
              <Pressable 
                style={[styles.button, styles.cancelButton]} 
                onPress={skipLocationPermission}
              >
                <Text style={styles.cancelButtonText}>Skip</Text>
              </Pressable>
              <Pressable 
                style={[styles.button, styles.allowButton]} 
                onPress={handleLocationPermission}
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
            <Text style={styles.modalTitle}>Notification Permission</Text>
            <Text style={styles.modalText}>
              Enable Smart Alerts to stay informed! Get notified instantly when the Air Quality Index (AQI) reaches your selected category.
            </Text>
            <View style={styles.buttonContainer}>
              <Pressable 
                style={[styles.button, styles.cancelButton]} 
                onPress={skipNotifications}
              >
                <Text style={styles.cancelButtonText}>Skip</Text>
              </Pressable>
              <Pressable 
                style={[styles.button, styles.allowButton]} 
                onPress={handleNotificationPermission}
              >
                <Text style={styles.allowButtonText}>Allow</Text>
              </Pressable>
            </View>
          </View>
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
}); 