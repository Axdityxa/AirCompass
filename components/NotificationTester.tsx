import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/auth-context';
import { sendBackgroundDataNotification, sendVisiblePushNotification } from '@/utils/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NotificationTester() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { user } = useAuth();
  
  const sendTestVisibleNotification = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      // Get the user's push token
      const tokenString = await AsyncStorage.getItem('expoPushToken');
      if (!tokenString) {
        setResult('No push token found. Please ensure notifications are enabled.');
        setLoading(false);
        return;
      }
      
      const token = JSON.parse(tokenString);
      
      // Send visible notification
      const success = await sendVisiblePushNotification(
        token,
        'Test Notification',
        'This is a visible test notification from AirCompass',
        { type: 'test', userId: user?.id }
      );
      
      setResult(success 
        ? 'Visible notification sent successfully. Check your notification tray.' 
        : 'Failed to send visible notification.'
      );
    } catch (error) {
      console.error('Error sending test notification:', error);
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };
  
  const sendTestBackgroundNotification = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      // Get the user's push token
      const tokenString = await AsyncStorage.getItem('expoPushToken');
      if (!tokenString) {
        setResult('No push token found. Please ensure notifications are enabled.');
        setLoading(false);
        return;
      }
      
      const token = JSON.parse(tokenString);
      
      // Send data-only background notification
      const success = await sendBackgroundDataNotification(
        token,
        { 
          type: 'aqi_check',
          testData: 'This should trigger the background task but not appear in notifications',
          timestamp: Date.now()
        }
      );
      
      setResult(success 
        ? 'Background notification sent successfully. Check logs for task execution.' 
        : 'Failed to send background notification.'
      );
    } catch (error) {
      console.error('Error sending background notification:', error);
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notification Testing</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={sendTestVisibleNotification}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Test Visible Notification</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.secondaryButton]}
        onPress={sendTestBackgroundNotification}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Test Background Task Notification</Text>
      </TouchableOpacity>
      
      {loading && <ActivityIndicator style={styles.loader} size="small" color="#1e88e5" />}
      
      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>{result}</Text>
        </View>
      )}
      
      <Text style={styles.note}>
        Note: Background task notifications won't appear in the notification tray.
        Check logs to see if the task executed.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#1e88e5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  secondaryButton: {
    backgroundColor: '#009688',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 16,
  },
  resultContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  resultText: {
    color: '#0d47a1',
  },
  note: {
    marginTop: 16,
    fontSize: 12,
    fontStyle: 'italic',
    color: '#666',
  },
}); 