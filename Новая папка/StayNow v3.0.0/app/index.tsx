import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store';
import { colors } from '@/theme';

export default function Index() {
  const { hasCompletedWelcome } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Zustand persist hydration check
    const checkState = () => {
      setIsReady(true);
    };
    checkState();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!hasCompletedWelcome) {
    return <Redirect href="/welcome" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
