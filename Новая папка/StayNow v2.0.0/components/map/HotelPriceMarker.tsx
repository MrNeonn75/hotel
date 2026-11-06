import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { formatPrice } from '@/utils/format';

export interface HotelPriceMarkerProps {
  price: number;
  isSelected?: boolean;
}

export const HotelPriceMarker: React.FC<HotelPriceMarkerProps> = ({
  price,
  isSelected = false,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.pill,
          {
            backgroundColor: isSelected
              ? colors.primary
              : isDark
              ? colors.surfaceAlt
              : '#FFFFFF',
            borderColor: isSelected
              ? colors.primaryPressed
              : isDark
              ? colors.border
              : 'rgba(0, 0, 0, 0.08)',
            transform: [{ scale: isSelected ? 1.15 : 1 }],
          },
        ]}
      >
        <Text
          style={[
            styles.priceText,
            {
              color: isSelected ? '#FFFFFF' : colors.text,
              fontWeight: isSelected ? '800' : '700',
            },
          ]}
        >
          {formatPrice(price)}
        </Text>
      </View>

      {/* Pointer triangle */}
      <View
        style={[
          styles.triangle,
          {
            borderTopColor: isSelected
              ? colors.primary
              : isDark
              ? colors.surfaceAlt
              : '#FFFFFF',
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 4,
  },
  priceText: {
    fontSize: 13,
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    alignSelf: 'center',
    marginTop: -1,
  },
});

export default HotelPriceMarker;