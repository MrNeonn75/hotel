import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

export interface ChipProps {
  label: string;
  selected?: boolean;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  count?: number | string;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  icon,
  rightIcon,
  count,
  disabled = false,
  onPress,
  style,
  textStyle,
}) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.base,
        selected ? styles.selected : styles.unselected,
        pressed && !disabled && (selected ? styles.selectedPressed : styles.unselectedPressed),
        disabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.content}>
        {icon && <View style={styles.iconLeft}>{icon}</View>}
        <Text
          style={[
            styles.label,
            selected ? styles.labelSelected : styles.labelUnselected,
            disabled && styles.labelDisabled,
            textStyle,
          ]}
        >
          {label}
        </Text>
        {count !== undefined && (
          <View style={[styles.countBadge, selected && styles.countBadgeSelected]}>
            <Text style={[styles.countText, selected && styles.countTextSelected]}>
              {count}
            </Text>
          </View>
        )}
        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>
    </Pressable>
  );
};

export const FilterChip = Chip;

const styles = StyleSheet.create({
  base: {
    height: 38,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unselected: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
  },
  unselectedPressed: {
    backgroundColor: colors.surfaceHighlight,
    borderColor: colors.borderLight,
  },
  selected: {
    backgroundColor: colors.primaryTint,
    borderColor: colors.primary,
  },
  selectedPressed: {
    backgroundColor: colors.border,
    borderColor: colors.primary,
  },
  disabled: {
    backgroundColor: colors.disabled,
    borderColor: colors.disabled,
    opacity: 0.6,
  },
  iconLeft: {
    marginRight: spacing.xs,
  },
  iconRight: {
    marginLeft: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  labelUnselected: {
    color: colors.textSecondary,
  },
  labelSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
  labelDisabled: {
    color: colors.disabledText,
  },
  countBadge: {
    marginLeft: spacing.xs,
    backgroundColor: colors.border,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 1,
    borderRadius: radius.pill,
  },
  countBadgeSelected: {
    backgroundColor: colors.primary,
  },
  countText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.semiBold,
  },
  countTextSelected: {
    color: colors.background,
  },
});

