import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  message: string;
  type?: ToastType;
  visible?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  visible = true,
  style,
}) => {
  const { colors, typography, radius, shadows, isDark } = useTheme();

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={20} color={colors.savings} />;
      case 'error':
        return <Ionicons name="alert-circle" size={20} color={colors.urgency} />;
      case 'info':
      default:
        return <Ionicons name="information-circle" size={20} color={colors.primary} />;
    }
  };

  return (
    <View
      style={[
        styles.container,
        shadows.card,
        {
          borderRadius: radius.card,
          backgroundColor: isDark ? colors.surfaceAlt : colors.background,
          borderColor: colors.border,
          borderWidth: StyleSheet.hairlineWidth,
        },
        style,
      ]}
    >
      <View style={styles.icon}>{getIcon()}</View>
      <Text style={[typography.body, { color: colors.text, flex: 1, fontSize: 14 }]}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 16,
  },
  icon: {
    marginRight: 10,
  },
});

export default Toast;