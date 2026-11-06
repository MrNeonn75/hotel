import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, spacing } from '@/theme';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  marginVertical?: keyof typeof spacing;
  marginHorizontal?: keyof typeof spacing;
  style?: StyleProp<ViewStyle>;
  color?: string;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  marginVertical,
  marginHorizontal,
  style,
  color = colors.border,
}) => {
  const isHorizontal = orientation === 'horizontal';

  return (
    <View
      style={[
        isHorizontal ? styles.horizontal : styles.vertical,
        { backgroundColor: color },
        marginVertical && { marginVertical: spacing[marginVertical] },
        marginHorizontal && { marginHorizontal: spacing[marginHorizontal] },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  horizontal: {
    width: '100%',
    height: 1,
  },
  vertical: {
    height: '100%',
    width: 1,
  },
});

