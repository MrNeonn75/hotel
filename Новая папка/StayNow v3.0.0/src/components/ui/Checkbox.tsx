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
import { Check } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '@/theme';

export interface CheckboxProps {
  checked: boolean;
  onValueChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onValueChange,
  label,
  description,
  disabled = false,
  style,
  labelStyle,
}) => {
  const handlePress = () => {
    if (!disabled) {
      onValueChange(!checked);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      style={({ pressed }) => [
        styles.container,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <View
        style={[
          styles.box,
          checked ? styles.boxChecked : styles.boxUnchecked,
          disabled && styles.boxDisabled,
        ]}
      >
        {checked && <Check size={14} color={colors.white} strokeWidth={3} />}
      </View>

      {label ? (
        <View style={styles.textContainer}>
          <Text style={[styles.label, labelStyle]}>{label}</Text>
          {description ? <Text style={styles.description}>{description}</Text> : null}
        </View>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: radius.xs + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  boxUnchecked: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
  },
  boxChecked: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  boxDisabled: {
    backgroundColor: colors.disabled,
    borderColor: colors.disabled,
  },
  textContainer: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  label: {
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
  description: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

