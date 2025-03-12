import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/auth-context';

export default function AuthLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#F5F7FA' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up" />
        <Stack.Screen name="forgot-password" />
      </Stack>
    </AuthProvider>
  );
} 