import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

import { Hotel } from '@/types/hotel';
import { useTheme } from '@/constants/theme';
import { formatPrice } from '@/utils/format';

interface SelectedHotelCardProps {
  hotel: Hotel;
  onClose: () => void;
}

export const SelectedHotelCard: React.FC<SelectedHotelCardProps> = ({
  hotel,
  onClose,
}) => {
  const router = useRouter();
  const { colors, fonts, radius, shadows } = useTheme();

  const handleCardPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/hotel/${hotel.id}` as any);
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(250)}
      exiting={FadeOutDown.duration(200)}
      style={[
        styles.cardContainer,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.card,
        },
        shadows.card,
      ]}>
      <Pressable onPress={handleCardPress} style={styles.contentRow}>
        {/* Hotel Thumbnail */}
        <Image
          source={{ uri: hotel.images[0] }}
          style={[styles.thumbnail, { borderRadius: radius.button }]}
          contentFit="cover"
          transition={150}
        />

        {/* Info Column */}
        <View style={styles.infoCol}>
          {/* Top row: Name & Close button */}
          <View style={styles.nameRow}>
            <Text
              numberOfLines={1}
              style={[styles.nameText, { color: colors.text, fontFamily: fonts.bold }]}>
              {hotel.name}
            </Text>
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                onClose();
              }}
              hitSlop={8}
              style={styles.closeBtn}>
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color="#FBBF24" />
            <Text style={[styles.ratingText, { color: colors.text, fontFamily: fonts.bold }]}>
              {hotel.rating.toFixed(1)}
            </Text>
            <Text style={[styles.ratingCount, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
              ({hotel.reviewCount} rəy)
            </Text>
          </View>

          {/* Price & Action Row */}
          <View style={styles.bottomRow}>
            <View style={styles.priceGroup}>
              <Text
                style={[
                  styles.oldPrice,
                  { color: colors.textSecondary, fontFamily: fonts.regular },
                ]}>
                {formatPrice(hotel.standardPrice)}
              </Text>
              <Text
                style={[
                  styles.currentPrice,
                  { color: colors.primary, fontFamily: fonts.extraBold },
                ]}>
                {formatPrice(hotel.discountedPrice)}
              </Text>
              <Text
                style={[
                  styles.perNight,
                  { color: colors.textSecondary, fontFamily: fonts.regular },
                ]}>
                / gecə
              </Text>
            </View>

            <View
              style={[
                styles.arrowBadge,
                { backgroundColor: colors.primary, borderRadius: radius.pill },
              ]}>
              <Ionicons name="chevron-forward" size={15} color="#FFFFFF" />
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default SelectedHotelCard;

const styles = StyleSheet.create({
  cardContainer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 25,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  contentRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  thumbnail: {
    width: 84,
    height: 84,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'space-between',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameText: {
    fontSize: 15,
    flex: 1,
    marginRight: 6,
  },
  closeBtn: {
    padding: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: 2,
  },
  ratingText: {
    fontSize: 12,
  },
  ratingCount: {
    fontSize: 11,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  priceGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  oldPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    fontSize: 17,
  },
  perNight: {
    fontSize: 11,
  },
  arrowBadge: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

