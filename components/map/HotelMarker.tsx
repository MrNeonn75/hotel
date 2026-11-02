import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Hotel } from '@/types/hotel';
import { useTheme } from '@/constants/theme';
import { formatPrice } from '@/utils/format';

interface HotelMarkerProps {
  hotel: Hotel;
  isSelected: boolean;
}

export const HotelMarker: React.FC<HotelMarkerProps> = ({ hotel, isSelected }) => {
  const { colors, fonts, radius, shadows } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.pill,
          {
            backgroundColor: isSelected ? colors.accent : colors.primary,
            borderRadius: radius.pill,
            transform: [{ scale: isSelected ? 1.15 : 1 }],
          },
          shadows.soft,
        ]}>
        <Text
          style={[
            styles.priceText,
            {
              fontFamily: fonts.bold,
            },
          ]}>
          {formatPrice(hotel.discountedPrice)}
        </Text>
      </View>
      {/* Downward triangle pointer */}
      <View
        style={[
          styles.arrow,
          {
            borderTopColor: isSelected ? colors.accent : colors.primary,
          },
        ]}
      />
    </View>
  );
};

export default HotelMarker;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  arrow: {
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

