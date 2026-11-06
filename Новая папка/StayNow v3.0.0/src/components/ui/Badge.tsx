import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

export type BadgeVariant = 'offer' | 'savings' | 'rating' | 'primary' | 'neutral' | 'urgency';

export interface BadgeProps {
  label: string | number;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  icon,
  size = 'md',
  style,
  textStyle,
}) => {
  return (
    <View style={[styles.base, styles[size], styles[variant], style]}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text
        style={[
          styles.text,
          styles[`text_${size}` as keyof typeof styles],
          styles[`text_${variant}` as keyof typeof styles],
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.xs + 2,
    paddingHorizontal: spacing.xs + 3,
    paddingVertical: 2,
  },
  sm: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  md: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontWeight: typography.fontWeight.bold,
  },
  text_sm: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
  },
  text_md: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
  },
  // Variant styles
  offer: {
    backgroundColor: colors.urgencyTint,
  },
  text_offer: {
    color: colors.urgency,
  },
  savings: {
    backgroundColor: colors.savingsTint,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.25)',
  },
  text_savings: {
    color: colors.savings,
  },
  rating: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text_rating: {
    color: colors.star,
  },
  primary: {
    backgroundColor: colors.primaryTint,
  },
  text_primary: {
    color: colors.primary,
  },
  neutral: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text_neutral: {
    color: colors.textSecondary,
  },
  urgency: {
    backgroundColor: colors.urgencyTint,
  },
  text_urgency: {
    color: colors.urgency,
  },
});

