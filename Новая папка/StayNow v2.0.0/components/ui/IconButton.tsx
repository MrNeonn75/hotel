import React, { useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  Animated,
  ViewStyle,
  StyleProp,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';

export type IconButtonVariant = 'surface' | 'overlay' | 'primary' | 'ghost';

export interface IconButtonProps {
  icon: React.ReactNode;
  onPress?: () => void;
  variant?: IconButtonVariant;
  size?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  haptic?: boolean;
  hitSlop?: number;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  variant = 'surface',
  size = 42,
  disabled = false,
  style,
  haptic = true,
  hitSlop = 8,
}) => {
  const { colors, isDark } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.92,
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
    if (disabled) return;
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  const getBackgroundColor = (pressed: boolean) => {
    if (variant === 'overlay') {
      return pressed
        ? 'rgba(0, 0, 0, 0.65)'
        : isDark
        ? 'rgba(30, 30, 45, 0.75)'
        : 'rgba(255, 255, 255, 0.9)';
    }
    if (variant === 'primary') {
      return pressed ? colors.primaryPressed : colors.primary;
    }
    if (variant === 'ghost') {
      return pressed ? colors.surfaceAlt : 'transparent';
    }
    // surface
    return pressed ? colors.border : colors.surfaceAlt;
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        hitSlop={hitSlop}
        style={({ pressed }) => [
          styles.base,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: getBackgroundColor(pressed),
            borderColor:
              variant === 'overlay'
                ? isDark
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(0,0,0,0.06)'
                : variant === 'surface'
                ? colors.border
                : 'transparent',
            borderWidth: variant === 'ghost' ? 0 : StyleSheet.hairlineWidth,
            opacity: disabled ? 0.4 : 1,
          },
        ]}
      >
        {icon}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default IconButton;