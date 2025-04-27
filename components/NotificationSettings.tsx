import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Pressable,
  Modal,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NotificationSettings as NotificationSettingsType, useNotifications } from '@/contexts/notification-context';

type TimePickerMode = 'start' | 'end';

export default function NotificationSettings() {
  const { 
    hasPermission, 
    settings, 
    updateSettings, 
    requestPermission, 
    sendTestNotification 
  } = useNotifications();
  
  const [localSettings, setLocalSettings] = useState<NotificationSettingsType | null>(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerMode, setTimePickerMode] = useState<TimePickerMode>('start');
  const [loading, setLoading] = useState(false);
  
  // Initialize local settings from context
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);
  
  // Handle permission request
  const handleRequestPermission = async () => {
    setLoading(true);
    const granted = await requestPermission();
    setLoading(false);
    
    if (!granted) {
      Alert.alert(
        'Permission Required',
        'Please enable notifications for this app in your device settings to receive air quality alerts.',
        [{ text: 'OK' }]
      );
    }
  };
  
  // Handle settings toggle
  const handleToggle = async (key: keyof NotificationSettingsType, value: boolean) => {
    if (!localSettings) return;
    
    // Update local state immediately for responsive UI
    setLocalSettings(prev => {
      if (!prev) return prev;
      return { ...prev, [key]: value };
    });
    
    // Save to persistent storage
    await updateSettings({ [key]: value });
  };
  
  // Handle quiet hours toggle
  const handleQuietHoursToggle = async (value: boolean) => {
    if (!localSettings) return;
    
    // Update local state
    setLocalSettings(prev => {
      if (!prev) return prev;
      return { 
        ...prev, 
        quietHours: { 
          ...prev.quietHours, 
          enabled: value 
        } 
      };
    });
    
    // Save to persistent storage
    await updateSettings({ 
      quietHours: { 
        ...localSettings.quietHours, 
        enabled: value 
      } 
    });
  };
  
  // Handle frequency selection
  const handleFrequencySelect = async (frequency: 'low' | 'normal' | 'high') => {
    if (!localSettings) return;
    
    // Update local state
    setLocalSettings(prev => {
      if (!prev) return prev;
      return { ...prev, frequency };
    });
    
    // Save to persistent storage
    await updateSettings({ frequency });
  };
  
  // Handle time selection for quiet hours
  const handleTimeSelect = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    
    if (!selectedDate || !localSettings) return;
    
    const hours = selectedDate.getHours().toString().padStart(2, '0');
    const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    // Update local state
    setLocalSettings(prev => {
      if (!prev) return prev;
      return { 
        ...prev, 
        quietHours: { 
          ...prev.quietHours, 
          [timePickerMode]: timeString 
        } 
      };
    });
    
    // Save to persistent storage
    updateSettings({ 
      quietHours: { 
        ...localSettings.quietHours, 
        [timePickerMode]: timeString 
      } 
    });
  };
  
  // Open time picker
  const openTimePicker = (mode: TimePickerMode) => {
    setTimePickerMode(mode);
    setShowTimePicker(true);
  };
  
  // Handle test notification
  const handleTestNotification = async () => {
    if (!hasPermission) {
      Alert.alert(
        'Permission Required',
        'Please enable notifications to send test notifications.',
        [{ text: 'Request Permission', onPress: handleRequestPermission }, { text: 'Cancel' }]
      );
      return;
    }
    
    const sent = await sendTestNotification();
    
    if (sent) {
      Alert.alert('Success', 'Test notification sent successfully!');
    } else {
      Alert.alert('Error', 'Failed to send test notification. Please try again.');
    }
  };
  
  if (!localSettings) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      {/* Permission Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.permissionContainer}>
          <View style={styles.permissionTextContainer}>
            <Text style={styles.permissionTitle}>
              {hasPermission ? 'Notifications are enabled' : 'Enable notifications'}
            </Text>
            <Text style={styles.permissionDescription}>
              {hasPermission 
                ? 'You will receive alerts about air quality changes based on your preferences.' 
                : 'Allow notifications to receive alerts about air quality changes.'
              }
            </Text>
          </View>
          {!hasPermission && (
            <TouchableOpacity 
              style={styles.permissionButton}
              onPress={handleRequestPermission}
              disabled={loading}
            >
              <Text style={styles.permissionButtonText}>
                {loading ? 'Requesting...' : 'Enable'}
              </Text>
            </TouchableOpacity>
          )}
          {hasPermission && (
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          )}
        </View>
      </View>
      
      {/* Alert Types Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alert Types</Text>
        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>AQI Threshold Alerts</Text>
            <Text style={styles.settingDescription}>
              Notify when air quality exceeds your preferred threshold
            </Text>
          </View>
          <Switch
            trackColor={{ false: '#E5E7EB', true: '#C7D2FE' }}
            thumbColor={localSettings.aqiAlerts ? '#6366F1' : '#F9FAFB'}
            ios_backgroundColor="#E5E7EB"
            onValueChange={(value) => handleToggle('aqiAlerts', value)}
            value={localSettings.aqiAlerts}
            disabled={!hasPermission}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Daily Summaries</Text>
            <Text style={styles.settingDescription}>
              Receive a daily summary of air quality in your area
            </Text>
          </View>
          <Switch
            trackColor={{ false: '#E5E7EB', true: '#C7D2FE' }}
            thumbColor={localSettings.dailySummaries ? '#6366F1' : '#F9FAFB'}
            ios_backgroundColor="#E5E7EB"
            onValueChange={(value) => handleToggle('dailySummaries', value)}
            value={localSettings.dailySummaries}
            disabled={!hasPermission}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Health-Based Alerts</Text>
            <Text style={styles.settingDescription}>
              Get alerts based on your health conditions
            </Text>
          </View>
          <Switch
            trackColor={{ false: '#E5E7EB', true: '#C7D2FE' }}
            thumbColor={localSettings.healthAlerts ? '#6366F1' : '#F9FAFB'}
            ios_backgroundColor="#E5E7EB"
            onValueChange={(value) => handleToggle('healthAlerts', value)}
            value={localSettings.healthAlerts}
            disabled={!hasPermission}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Location Alerts</Text>
            <Text style={styles.settingDescription}>
              Alerts for your saved locations
            </Text>
          </View>
          <Switch
            trackColor={{ false: '#E5E7EB', true: '#C7D2FE' }}
            thumbColor={localSettings.locationAlerts ? '#6366F1' : '#F9FAFB'}
            ios_backgroundColor="#E5E7EB"
            onValueChange={(value) => handleToggle('locationAlerts', value)}
            value={localSettings.locationAlerts}
            disabled={!hasPermission}
          />
        </View>
      </View>
      
      {/* Notification Frequency */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Frequency</Text>
        <Text style={styles.settingDescription}>
          How often would you like to receive notifications?
        </Text>
        
        <View style={styles.frequencyContainer}>
          <Pressable
            style={[
              styles.frequencyOption,
              localSettings.frequency === 'low' && styles.selectedFrequency
            ]}
            onPress={() => handleFrequencySelect('low')}
            disabled={!hasPermission}
          >
            <Text 
              style={[
                styles.frequencyText,
                localSettings.frequency === 'low' && styles.selectedFrequencyText
              ]}
            >
              Low
            </Text>
            <Text style={styles.frequencyDetail}>
              ~1-2 per day
            </Text>
          </Pressable>
          
          <Pressable
            style={[
              styles.frequencyOption,
              localSettings.frequency === 'normal' && styles.selectedFrequency
            ]}
            onPress={() => handleFrequencySelect('normal')}
            disabled={!hasPermission}
          >
            <Text 
              style={[
                styles.frequencyText,
                localSettings.frequency === 'normal' && styles.selectedFrequencyText
              ]}
            >
              Normal
            </Text>
            <Text style={styles.frequencyDetail}>
              ~4 per day
            </Text>
          </Pressable>
          
          <Pressable
            style={[
              styles.frequencyOption,
              localSettings.frequency === 'high' && styles.selectedFrequency
            ]}
            onPress={() => handleFrequencySelect('high')}
            disabled={!hasPermission}
          >
            <Text 
              style={[
                styles.frequencyText,
                localSettings.frequency === 'high' && styles.selectedFrequencyText
              ]}
            >
              High
            </Text>
            <Text style={styles.frequencyDetail}>
              ~12 per day
            </Text>
          </Pressable>
        </View>
      </View>
      
      {/* Quiet Hours */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quiet Hours</Text>
          <Switch
            trackColor={{ false: '#E5E7EB', true: '#C7D2FE' }}
            thumbColor={localSettings.quietHours.enabled ? '#6366F1' : '#F9FAFB'}
            ios_backgroundColor="#E5E7EB"
            onValueChange={handleQuietHoursToggle}
            value={localSettings.quietHours.enabled}
            disabled={!hasPermission}
          />
        </View>
        
        <Text style={styles.settingDescription}>
          Don't send notifications during these hours
        </Text>
        
        <View style={[
          styles.quietHoursContainer,
          !localSettings.quietHours.enabled && styles.disabledContainer
        ]}>
          <Pressable 
            style={styles.timeSelector}
            onPress={() => openTimePicker('start')}
            disabled={!hasPermission || !localSettings.quietHours.enabled}
          >
            <Text style={styles.timeSelectorLabel}>From</Text>
            <View style={styles.timeDisplay}>
              <Text style={styles.timeText}>{localSettings.quietHours.start}</Text>
              <Ionicons name="time-outline" size={20} color="#6B7280" />
            </View>
          </Pressable>
          
          <Pressable 
            style={styles.timeSelector}
            onPress={() => openTimePicker('end')}
            disabled={!hasPermission || !localSettings.quietHours.enabled}
          >
            <Text style={styles.timeSelectorLabel}>To</Text>
            <View style={styles.timeDisplay}>
              <Text style={styles.timeText}>{localSettings.quietHours.end}</Text>
              <Ionicons name="time-outline" size={20} color="#6B7280" />
            </View>
          </Pressable>
        </View>
      </View>
      
      {/* Test Notification */}
      <TouchableOpacity 
        style={styles.testButton}
        onPress={handleTestNotification}
        disabled={!hasPermission}
      >
        <Text style={styles.testButtonText}>Send Test Notification</Text>
      </TouchableOpacity>
      
      {/* Time Picker Modal */}
      {showTimePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleTimeSelect}
        />
      )}
      
      {showTimePicker && Platform.OS === 'ios' && (
        <Modal
          transparent={true}
          visible={showTimePicker}
          animationType="slide"
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Time</Text>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Ionicons name="close" size={24} color="#111827" />
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={new Date()}
                mode="time"
                is24Hour={true}
                display="spinner"
                onChange={handleTimeSelect}
                style={{ width: '100%' }}
              />
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  permissionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  permissionTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  permissionDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  permissionButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  frequencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  frequencyOption: {
    width: '31%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  selectedFrequency: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  frequencyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  selectedFrequencyText: {
    color: '#4F46E5',
  },
  frequencyDetail: {
    fontSize: 12,
    color: '#6B7280',
  },
  quietHoursContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  disabledContainer: {
    opacity: 0.5,
  },
  timeSelector: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  timeSelectorLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  timeDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  testButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    width: '80%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
}); 