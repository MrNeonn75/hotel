import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react-native';
import { colors, radius, shadows, spacing, typography } from '@/theme';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  type?: ToastType;
  message: string;
  style?: StyleProp<ViewStyle>;
}

export const Toast: React.FC<ToastProps> = ({
  type = 'info',
  message,
  style,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} color={colors.savings} />;
      case 'error':
        return <AlertCircle size={18} color={colors.urgency} />;
      case 'info':
      default:
        return <Info size={18} color={colors.primary} />;
    }
  };

  return (
    <View style={[styles.container, styles[type], style]}>
      <View style={styles.iconContainer}>{getIcon()}</View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  message: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
  success: {
    borderLeftWidth: 4,
    borderLeftColor: colors.savings,
  },
  error: {
    borderLeftWidth: 4,
    borderLeftColor: colors.urgency,
  },
  info: {
    borderLeftWidth: 4,
    borderLeftColor: colors.brand,
  },
});

