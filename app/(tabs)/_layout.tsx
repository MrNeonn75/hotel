import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Platform, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/constants/theme';

export default function TabLayout() {
  const { colors, fonts } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const handleTabPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          height: Platform.OS === 'ios' ? 88 : 64 + insets.bottom,
          paddingBottom: Platform.OS === 'ios' ? 28 : Math.max(insets.bottom, 8),
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.medium,
          fontSize: 12,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home', 'Ana səhifə'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size || 24}
              color={color}
            />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: t('tabs.map', 'Xəritə'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'map' : 'map-outline'}
              size={size || 24}
              color={color}
            />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tabs.Screen
        name="favourites"
        options={{
          title: t('tabs.favourites', 'Favoritlər'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'heart' : 'heart-outline'}
              size={size || 24}
              color={color}
            />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: t('tabs.history', 'Tarixçə'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'time' : 'time-outline'}
              size={size || 24}
              color={color}
            />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile', 'Profil'),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={size || 24}
              color={color}
            />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
    </Tabs>
  );
}
