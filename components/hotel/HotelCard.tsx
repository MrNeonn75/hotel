import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  GestureResponderEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { Hotel } from '@/types/hotel';
import { useTheme } from '@/constants/theme';
import { getAmenity } from '@/constants/amenities';
import { formatPrice } from '@/utils/format';
import { useFavoritesStore } from '@/store/favoritesStore';

interface HotelCardProps {
  hotel: Hotel;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const HotelCardComponent: React.FC<HotelCardProps> = ({ hotel }) => {
  const router = useRouter();
  const { colors, fonts, radius, spacing, shadows } = useTheme();

  const isFavorite = useFavoritesStore((state) => state.isFavorite(hotel.id));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, {
      damping: 15,
      stiffness: 300,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
  };

  const handleCardPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/hotel/${hotel.id}` as any);
  };

  const handleFavoritePress = (e: GestureResponderEvent) => {
    e.stopPropagation?.();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleFavorite(hotel.id);
  };

  const visibleAmenities = hotel.amenities.slice(0, 4);
  const remainingAmenitiesCount = Math.max(0, hotel.amenities.length - 4);

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`${hotel.name}, ${hotel.city}, ${formatPrice(hotel.discountedPrice)}`}
      onPress={handleCardPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.cardContainer,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.card,
          borderColor: colors.border,
        },
        shadows.card,
        animatedStyle,
      ]}>
      {/* Hotel Image Container */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: hotel.images[0] }}
          style={styles.image}
          contentFit="cover"
          transition={250}
          cachePolicy="memory-disk"
        />

        {/* Top-Left: Discount Badge */}
        <View style={[styles.discountBadge, { backgroundColor: colors.accent, borderRadius: radius.pill }]}>
          <Text style={[styles.discountText, { fontFamily: fonts.bold }]}>
            -{hotel.discountPercent}%
          </Text>
        </View>

        {/* Top-Right: Favorite Button */}
        <Pressable
          onPress={handleFavoritePress}
          hitSlop={8}
          style={({ pressed }) => [
            styles.favoriteButton,
            {
              backgroundColor: 'rgba(18, 18, 43, 0.45)',
              transform: [{ scale: pressed ? 0.9 : 1 }],
            },
          ]}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavorite ? colors.accent : '#FFFFFF'}
          />
        </Pressable>

        {/* Bottom-Left: Rating Pill */}
        <View style={[styles.ratingPill, { borderRadius: radius.pill }]}>
          <Ionicons name="star" size={13} color="#FBBF24" />
          <Text style={[styles.ratingText, { fontFamily: fonts.bold }]}>
            {hotel.rating.toFixed(1)}
          </Text>
          <Text style={[styles.ratingCountText, { fontFamily: fonts.regular }]}>
            ({hotel.reviewCount})
          </Text>
        </View>
      </View>

      {/* Hotel Information */}
      <View style={[styles.content, { padding: spacing.lg }]}>
        {/* Hotel Name */}
        <Text
          numberOfLines={1}
          style={[
            styles.name,
            {
              color: colors.text,
              fontFamily: fonts.bold,
            },
          ]}>
          {hotel.name}
        </Text>

        {/* Address */}
        <View style={[styles.addressRow, { marginTop: spacing.xs }]}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <Text
            numberOfLines={1}
            style={[
              styles.addressText,
              {
                color: colors.textSecondary,
                fontFamily: fonts.regular,
              },
            ]}>
            {hotel.address}
          </Text>
        </View>

        {/* Amenities Row */}
        <View style={[styles.amenitiesContainer, { marginTop: spacing.md }]}>
          {visibleAmenities.map((amenityKey) => {
            const amenity = getAmenity(amenityKey);
            return (
              <View
                key={amenityKey}
                style={[
                  styles.amenityChip,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    borderRadius: radius.pill,
                  },
                ]}>
                <Ionicons
                  name={amenity.icon}
                  size={12}
                  color={colors.textSecondary}
                />
                <Text
                  style={[
                    styles.amenityText,
                    {
                      color: colors.textSecondary,
                      fontFamily: fonts.medium,
                    },
                  ]}>
                  {amenity.label}
                </Text>
              </View>
            );
          })}

          {remainingAmenitiesCount > 0 && (
            <View
              style={[
                styles.amenityChip,
                styles.plusChip,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  borderRadius: radius.pill,
                },
              ]}>
              <Text
                style={[
                  styles.amenityText,
                  {
                    color: colors.textSecondary,
                    fontFamily: fonts.bold,
                  },
                ]}>
                +{remainingAmenitiesCount}
              </Text>
            </View>
          )}
        </View>

        {/* Price Row */}
        <View style={[styles.priceRow, { marginTop: spacing.md }]}>
          <View style={styles.priceGroup}>
            <Text
              style={[
                styles.standardPrice,
                {
                  color: colors.textSecondary,
                  fontFamily: fonts.regular,
                },
              ]}>
              {formatPrice(hotel.standardPrice)}
            </Text>
            <Text
              style={[
                styles.discountedPrice,
                {
                  color: colors.primary,
                  fontFamily: fonts.extraBold,
                },
              ]}>
              {formatPrice(hotel.discountedPrice)}
            </Text>
            <Text
              style={[
                styles.perNightText,
                {
                  color: colors.textSecondary,
                  fontFamily: fonts.regular,
                },
              ]}>
              / gecə
            </Text>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
};

export const HotelCard = React.memo(HotelCardComponent);
HotelCard.displayName = 'HotelCard';
export default HotelCard;

const styles = StyleSheet.create({
  cardContainer: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    height: 200,
    position: 'relative',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    zIndex: 2,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    backdropFilter: 'blur(10px)',
  },
  ratingPill: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(18, 18, 43, 0.72)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 2,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  ratingCountText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
  },
  content: {},
  name: {
    fontSize: 17,
    lineHeight: 22,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressText: {
    fontSize: 13,
    flex: 1,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
  },
  plusChip: {
    paddingHorizontal: 7,
  },
  amenityText: {
    fontSize: 11,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  priceGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  standardPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    fontSize: 20,
    lineHeight: 24,
  },
  perNightText: {
    fontSize: 13,
  },
});

