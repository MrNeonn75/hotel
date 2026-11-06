import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors, radius } from '@/theme';

export type IconButtonVariant = 'default' | 'primary' | 'ghost' | 'surface';

export interface IconButtonProps {
  icon: React.ReactNode;
  variant?: IconButtonVariant;
  size?: number;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'default',
  size = 40,
  disabled = false,
  onPress,
  style,
  accessibilityLabel,
}) => {
  const hitSlopValue = Math.max(0, Math.ceil((44 - size) / 2));

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={{
        top: hitSlopValue,
        bottom: hitSlopValue,
        left: hitSlopValue,
        right: hitSlopValue,
      }}
      style={({ pressed }) => [
        styles.base,
        { width: size, height: size, borderRadius: size / 2 },
        styles[variant],
        pressed && !disabled && styles[`${variant}Pressed` as keyof typeof styles],
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  default: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  defaultPressed: {
    backgroundColor: colors.surfaceHighlight,
    borderColor: colors.borderLight,
  },
  surface: {
    backgroundColor: colors.surface,
  },
  surfacePressed: {
    backgroundColor: colors.surfaceHighlight,
  },
  primary: {
    backgroundColor: colors.brand,
  },
  primaryPressed: {
    backgroundColor: colors.brandPressed,
  },
  ghost: {
    backgroundColor: colors.transparent,
  },
  ghostPressed: {
    backgroundColor: colors.surfaceAlt,
  },
  disabled: {
    backgroundColor: colors.disabled,
    borderColor: colors.disabled,
    opacity: 0.6,
  },
});
