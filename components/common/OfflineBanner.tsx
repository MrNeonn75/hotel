import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Network from 'expo-network';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  useEffect(() => {
    let isMounted = true;

    const checkStatus = async () => {
      try {
        if (Platform.OS === 'web') {
          if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
            if (isMounted) setIsOffline(!navigator.onLine);
          }
        } else {
          const state = await Network.getNetworkStateAsync();
          if (isMounted) {
            setIsOffline(state.isConnected === false || state.isInternetReachable === false);
          }
        }
      } catch {
        // Ignore network check errors
      }
    };

    checkStatus();

    // Web event listeners
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handleOnline = () => isMounted && setIsOffline(false);
      const handleOffline = () => isMounted && setIsOffline(true);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        isMounted = false;
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    // Interval check for native
    const interval = setInterval(checkStatus, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <Animated.View
      entering={FadeInUp.duration(250)}
      exiting={FadeOutUp.duration(250)}
      style={[styles.container, { paddingTop: Math.max(insets.top, 8) + 4 }]}>
      <View style={styles.content}>
        <Ionicons name="cloud-offline-outline" size={18} color="#FFFFFF" />
        <Text style={styles.text}>
          {t('offline.banner', 'İnternet bağlantısı yoxdur. Oflayn rejimdəsiniz.')}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 99999,
    backgroundColor: '#EF4444',
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default OfflineBanner;

