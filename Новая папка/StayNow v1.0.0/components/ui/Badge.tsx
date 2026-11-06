import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export type BadgeVariant = 'savings' | 'urgency' | 'primary' | 'neutral';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  style,
}) => {
  const { colors, typography, radius, isDark } = useTheme();

  const getColors = () => {
    switch (variant) {
      case 'savings':
        return {
          bg: isDark ? 'rgba(52, 211, 153, 0.2)' : '#E8F7F0',
          text: colors.savings,
        };
      case 'urgency':
        return {
          bg: isDark ? 'rgba(255, 107, 112, 0.2)' : '#FDE8E8',
          text: colors.urgency,
        };
      case 'neutral':
        return {
          bg: colors.surfaceAlt,
          text: colors.textSecondary,
        };
      case 'primary':
      default:
        return {
          bg: colors.primaryTint,
          text: colors.primary,
        };
    }
  };

  const { bg, text } = getColors();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bg,
          borderRadius: radius.pill,
          paddingVertical: isSm ? 2 : 4,
          paddingHorizontal: isSm ? 8 : 10,
        },
        style,
      ]}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text
        style={[
          typography.micro,
          {
            color: text,
            fontSize: isSm ? 10 : 11,
            fontWeight: '700',
            letterSpacing: 0.3,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
});

export default Badge;