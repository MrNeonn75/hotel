import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadows, typography } from '@/theme';

export interface HotelPricePinProps {
  price: number;
  isSelected?: boolean;
}

export const HotelPricePin: React.FC<HotelPricePinProps> = ({
  price,
  isSelected = false,
}) => {
  return (
    <View style={[styles.wrapper, isSelected && styles.wrapperSelected]}>
      <View style={[styles.pinBody, isSelected && styles.pinBodySelected]}>
        <Text style={[styles.priceText, isSelected && styles.priceTextSelected]}>
          {price} ₼
        </Text>
      </View>
      {/* Little downward arrow / pointer */}
      <View style={[styles.pointer, isSelected && styles.pointerSelected]} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapperSelected: {
    transform: [{ scale: 1.15 }],
    zIndex: 999,
  },
  pinBody: {
    height: 38,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  pinBodySelected: {
    backgroundColor: colors.brand,
    borderColor: colors.white,
    ...shadows.lg,
  },
  priceText: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  priceTextSelected: {
    color: colors.white,
    fontWeight: typography.fontWeight.extraBold,
  },
  pointer: {
    width: 8,
    height: 5,
    backgroundColor: colors.surfaceAlt,
    transform: [{ rotate: '45deg' }],
    marginTop: -3,
    borderBottomRightRadius: 2,
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: colors.borderLight,
  },
  pointerSelected: {
    backgroundColor: colors.brand,
    borderColor: colors.white,
  },
});

