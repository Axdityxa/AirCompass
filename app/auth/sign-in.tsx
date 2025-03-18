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
import Colors from '@/constants/Colors';
import { isValidEmail } from '@/utils/validation';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { signIn, googleSignIn, isLoading } = useAuth();

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

    return isValid;
  };

  const handleSignIn = async () => {
    if (!validateInputs()) return;

    const { error } = await signIn(email, password);
    if (error) {
      Alert.alert('Sign In Failed', error.message || 'Please check your credentials and try again');
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      await googleSignIn();
    } catch (error) {
      Alert.alert('Google Sign In Failed', 'An error occurred during Google sign in');
      console.error('Google sign in error:', error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ title: 'Sign In', headerShown: false }} />
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
          <Text style={styles.welcomeText}>Welcome back 👋</Text>
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
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, passwordError ? styles.inputError : null]}
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

          <TouchableOpacity style={styles.forgotPasswordContainer}>
            <Link href="/auth/forgot-password" asChild>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </Link>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signInButton}
            onPress={handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signInButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.orContainer}>
            <View style={styles.divider} />
            <Text style={styles.orText}>OR LOG IN WITH</Text>
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
                <Text style={styles.googleButtonText}>Sign in with Google</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an account? </Text>
          <Link href="/auth/sign-up" asChild>
            <Text style={styles.signUpLink}>Sign up</Text>
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
    marginBottom: 16,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
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
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#6366F1',
    fontSize: 14,
  },
  signInButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  signInButtonText: {
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
    backgroundColor: '#E5E7EB',
  },
  orText: {
    marginHorizontal: 8,
    color: '#6B7280',
    fontSize: 12,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  signUpText: {
    color: '#6B7280',
    fontSize: 14,
  },
  signUpLink: {
    color: '#6366F1',
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginTop: 5,
    fontSize: 12,
  },
}); 