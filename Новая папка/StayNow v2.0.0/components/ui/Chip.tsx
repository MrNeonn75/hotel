import React, { useRef } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
  StyleProp,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  badgeCount?: number;
  style?: StyleProp<ViewStyle>;
  haptic?: boolean;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  icon,
  badgeCount,
  style,
  haptic = true,
}) => {
  const { colors, typography, radius } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 60,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePress = () => {
    if (haptic) {
      Haptics.selectionAsync();
    }
    onPress?.();
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.container,
          {
            borderRadius: radius.pill,
            backgroundColor: selected ? colors.primaryTint : 'transparent',
            borderColor: selected ? colors.primary : colors.border,
            borderWidth: 1.5,
          },
        ]}
      >
        {icon && <View style={styles.icon}>{icon}</View>}
        <Text
          style={[
            typography.caption,
            {
              color: selected ? colors.primary : colors.textSecondary,
              fontWeight: selected ? '700' : '500',
            },
          ]}
        >
          {label}
        </Text>
        {typeof badgeCount === 'number' && badgeCount > 0 && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: selected ? colors.primary : colors.textSecondary,
              },
            ]}
          >
            <Text style={styles.badgeText}>{badgeCount}</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  icon: {
    marginRight: 6,
  },
  badge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});

export default Chip;