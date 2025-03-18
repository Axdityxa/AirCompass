import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Link, Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/auth-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isValidEmail } from '@/utils/validation';
import Colors from '@/constants/Colors';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const { signUp, googleSignIn, isLoading } = useAuth();

  const validateInputs = () => {
    let isValid = true;

    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    return isValid;
  };

  const handleSignUp = async () => {
    if (!validateInputs()) return;

    const { error } = await signUp(email, password);
    
    if (error) {
      Alert.alert('Sign Up Failed', error.message || 'Please check your information and try again');
    } else {
      Alert.alert(
        'Account Created',
        'Please check your email for a confirmation link',
        [{ text: 'OK', onPress: () => router.replace('/auth/sign-in') }]
      );
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      await googleSignIn();
    } catch (error) {
      Alert.alert('Google Sign Up Failed', 'An error occurred during Google sign up');
      console.error('Google sign up error:', error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ title: 'Sign Up', headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.logoContainer}>
          <Image 
            source={require('@/assets/images/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.welcomeText}>Create an account</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, emailError ? styles.inputError : null]}
              placeholder="Enter email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.passwordContainer, passwordError ? styles.inputError : null]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={[styles.passwordContainer, confirmPasswordError ? styles.inputError : null]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
            {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
          </View>

          <TouchableOpacity
            style={styles.signUpButton}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signUpButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <View style={styles.orContainer}>
            <View style={styles.divider} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <ActivityIndicator color="#4285F4" />
            ) : (
              <View style={styles.googleButtonContent}>
                <Image
                  source={require('@/assets/images/google-icon.png')}
                  style={styles.googleIcon}
                />
                <Text style={styles.googleButtonText}>Sign up with Google</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Already have an account? </Text>
          <Link href="/auth/sign-in" asChild>
            <Text style={styles.signInLink}>Sign in</Text>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logo: {
    width: 80,
    height: 80,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 40,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputError: {
    borderColor: 'red',
    borderWidth: 1,
  },
  errorText: {
    color: 'red',
    marginTop: 5,
    fontSize: 12,
  },
  signUpButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDD',
  },
  orText: {
    marginHorizontal: 10,
    color: '#666',
    fontWeight: '500',
  },
  googleButton: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    marginBottom: 16,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  googleButtonText: {
    color: '#4285F4',
    fontSize: 16,
    fontWeight: '500',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signInText: {
    fontSize: 16,
    color: '#333',
  },
  signInLink: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: 'bold',
  },
}); 