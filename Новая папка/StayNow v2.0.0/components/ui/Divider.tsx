import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface DividerProps {
  vertical?: boolean;
  spacing?: number;
  style?: StyleProp<ViewStyle>;
}

export const Divider: React.FC<DividerProps> = ({
  vertical = false,
  spacing = 0,
  style,
}) => {
  const { colors } = useTheme();

  if (vertical) {
    return (
      <View
        style={[
          {
            width: StyleSheet.hairlineWidth,
            backgroundColor: colors.border,
            marginHorizontal: spacing,
            alignSelf: 'stretch',
          },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        {
          height: StyleSheet.hairlineWidth,
          backgroundColor: colors.border,
          marginVertical: spacing,
          width: '100%',
        },
        style,
      ]}
    />
  );
};

export default Divider;