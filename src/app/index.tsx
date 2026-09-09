import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/tokens';
import { useAuth } from '@/hooks/useAuth';

export default function IndexScreen() {
  const router = useRouter();
  const { isLoading, isAuthenticated, isRecoveryFlow } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (isRecoveryFlow) {
      router.replace('/(auth)/change-password');
    } else if (isAuthenticated) {
      router.replace('/(app)/home');
    } else {
      router.replace('/(auth)/sign-in');
    }
  }, [isLoading, isAuthenticated, isRecoveryFlow, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.screenLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
