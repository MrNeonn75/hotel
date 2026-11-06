import React, { useEffect, useState } from 'react';
import {
  Animated,
  AppState,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Network from 'expo-network';
import { WifiOff } from 'lucide-react-native';
import { colors, spacing, typography } from '@/theme';

export const OfflineBanner: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [isOffline, setIsOffline] = useState(false);
  const slideAnim = useState(new Animated.Value(-60))[0];

  useEffect(() => {
    let isMounted = true;

    const checkNetwork = async () => {
      try {
        const state = await Network.getNetworkStateAsync();
        if (isMounted) {
          const offline = state.isConnected === false || state.isInternetReachable === false;
          setIsOffline(offline);
        }
      } catch {
        // Fallback: assume connected
      }
    };

    checkNetwork();

    // Check periodically & on app foreground
    const interval = setInterval(checkNetwork, 6000);
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        checkNetwork();
      }
    });

    return () => {
      isMounted = false;
      clearInterval(interval);
      sub.remove();
    };
  }, []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOffline ? 0 : -60,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOffline, slideAnim]);

  if (!isOffline) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 8) + 4,
          transform: [{ translateY: slideAnim }],
        },
      ]}
      accessibilityRole="alert"
      accessibilityLabel="İnternet bağlantısı yoxdur. Oflayn rejimdəsiniz."
    >
      <View style={styles.content}>
        <WifiOff size={16} color={colors.white} />
        <Text style={styles.text} maxFontSizeMultiplier={1.3}>
          İnternet bağlantısı yoxdur. Oflayn rejimdəsiniz.
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    backgroundColor: colors.urgency,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
    elevation: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  text: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});

