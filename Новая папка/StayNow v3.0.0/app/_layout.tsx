import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OfflineBanner } from '@/components/ui';
import { useAuthStore } from '@/store';
import { colors } from '@/theme';

// İlkin yükləmədə ekran yanıb-sönməsin deyə splash screen-i saxlayırıq
SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 dəqiqə cache
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    useAuthStore.getState().hydrateAuth();

    // Fallback: Hətta auth geciksə belə splash screen mütləq gizlənsin
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isHydrated]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <BottomSheetModalProvider>
            <StatusBar style="light" />
            <OfflineBanner />
            <View style={styles.container}>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: {
                    backgroundColor: colors.background,
                  },
                  animation: 'slide_from_right',
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="welcome" options={{ headerShown: false, animation: 'fade' }} />
                <Stack.Screen name="filters" options={{ presentation: 'modal', headerShown: false }} />
                <Stack.Screen name="auth/login" options={{ presentation: 'modal', headerShown: false }} />
                <Stack.Screen name="auth/signup" options={{ presentation: 'modal', headerShown: false }} />
                <Stack.Screen name="auth/forgot" options={{ presentation: 'modal', headerShown: false }} />
                <Stack.Screen name="checkout/guest" options={{ headerShown: false }} />
                <Stack.Screen name="checkout/payment" options={{ headerShown: false }} />
                <Stack.Screen
                  name="checkout/confirmation"
                  options={{ headerShown: false, gestureEnabled: false }}
                />
                <Stack.Screen name="trip/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="account/profile" options={{ headerShown: false }} />
                <Stack.Screen name="account/settings" options={{ headerShown: false }} />
                <Stack.Screen name="account/support" options={{ headerShown: false }} />
                <Stack.Screen name="account/terms" options={{ headerShown: false }} />
                <Stack.Screen name="dev/ui-kit" options={{ headerShown: false }} />
              </Stack>
            </View>
          </BottomSheetModalProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});