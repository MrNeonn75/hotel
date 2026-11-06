import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Compass,
  Heart,
  Map,
  Ticket,
  UserRound,
} from 'lucide-react-native';
import { colors, radius, typography } from '@/theme';
import { az } from '@/i18n/az';

export interface CustomTabBarProps {
  state: {
    index: number;
    routes: Array<{
      key: string;
      name: string;
      params?: Record<string, any>;
    }>;
  };
  descriptors: Record<
    string,
    {
      options?: {
        tabBarAccessibilityLabel?: string;
        [key: string]: any;
      };
    }
  >;
  emitter?: {
    emit: (options: any) => any;
  };
  navigation?: {
    emit: (event: { type: string; target: string; canPreventDefault?: boolean }) => {
      defaultPrevented: boolean;
    };
    navigate: (name: string, params?: any) => void;
  };
  navigateToTab?: (routeKey: string) => void;
  insets?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export const CustomTabBar: React.FC<CustomTabBarProps> = ({
  state,
  descriptors,
  navigation,
  navigateToTab,
  insets: propInsets,
}) => {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = propInsets ?? safeAreaInsets;

  const getTabIcon = (routeName: string, isFocused: boolean) => {
    const color = isFocused ? colors.primary : colors.textSecondary;
    const size = 22;

    switch (routeName) {
      case 'index':
      case 'discover':
        return <Compass size={size} color={color} strokeWidth={isFocused ? 2.3 : 1.8} />;
      case 'map':
        return <Map size={size} color={color} strokeWidth={isFocused ? 2.3 : 1.8} />;
      case 'favorites':
        return <Heart size={size} color={color} strokeWidth={isFocused ? 2.3 : 1.8} />;
      case 'trips':
        return <Ticket size={size} color={color} strokeWidth={isFocused ? 2.3 : 1.8} />;
      case 'account':
        return <UserRound size={size} color={color} strokeWidth={isFocused ? 2.3 : 1.8} />;
      default:
        return <Compass size={size} color={color} />;
    }
  };

  const getTabLabel = (routeName: string) => {
    switch (routeName) {
      case 'index':
      case 'discover':
        return az.tabs.discover;
      case 'map':
        return az.tabs.map;
      case 'favorites':
        return az.tabs.favorites;
      case 'trips':
        return az.tabs.trips;
      case 'account':
        return az.tabs.account;
      default:
        return routeName;
    }
  };

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 16 : 8),
          height: 80 + Math.max(insets.bottom - 10, 0),
        },
      ]}
    >
      <View style={styles.tabsRow}>
        {state.routes.map((route, index) => {
          const descriptor = descriptors[route.key];
          const options = descriptor?.options ?? {};
          const isFocused = state.index === index;

          const onPress = () => {
            if (navigateToTab) {
              navigateToTab(route.key);
            } else if (navigation) {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              style={styles.tabItem}
            >
              {/* 52x30 Pill behind active icon (Figma exact) */}
              <View style={[styles.pill, isFocused && styles.activePill]}>
                {getTabIcon(route.name, isFocused)}
              </View>

              {/* Label */}
              <Text
                style={[
                  styles.tabLabel,
                  isFocused ? styles.activeTabLabel : styles.inactiveTabLabel,
                ]}
                numberOfLines={1}
                maxFontSizeMultiplier={1.3}
              >
                {getTabLabel(route.name)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: colors.surfaceAlt,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    justifyContent: 'center',
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 64,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  pill: {
    width: 52,
    height: 30,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.transparent,
  },
  activePill: {
    backgroundColor: colors.primaryTint,
  },
  tabLabel: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  activeTabLabel: {
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  inactiveTabLabel: {
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
});
