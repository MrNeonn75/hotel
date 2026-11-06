import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Hotel } from '@/types/hotel';
import { useTheme } from '@/hooks/useTheme';
import { useFavoritesStore } from '@/store/favoritesStore';
import { formatPrice, formatReviewCount } from '@/utils/format';
import { getAmenityInfo } from '@/constants/amenities';
import { getHotelCategory } from '@/constants/theme';

export interface HotelCardProps {
  hotel: Hotel;
  onPress?: () => void;
}

export const HotelCard: React.FC<HotelCardProps> = React.memo(({ hotel, onPress }) => {
  const router = useRouter();
  const { colors, typography, radius, isDark } = useTheme();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const favorite = isFavorite(hotel.id);

  // Card scale animation on press
  const scale = useRef(new Animated.Value(1)).current;
  // Heart pop animation
  const heartScale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 60,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handleCardPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) {
      onPress();
    } else {
      router.push(`/hotel/${hotel.id}` as any);
    }
  };

  const handleFavoritePress = (e: any) => {
    e?.stopPropagation?.();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Heart bounce animation
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.35,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    toggleFavorite(hotel.id);
  };

  // Ulduz simvolları (məs. 4 ulduz -> "★★★★")
  const renderStars = (count: number) => {
    return '★'.repeat(Math.max(1, Math.min(5, count)));
  };

  // İlk 4 xidmət + qalan sayı
  const visibleAmenities = hotel.amenities.slice(0, 4);
  const remainingAmenitiesCount = Math.max(0, hotel.amenities.length - 4);
  const htCategoryMeta = getHotelCategory(hotel);

  return (
    <Animated.View style={[{ transform: [{ scale }] }, styles.container]}>
      <Pressable
        onPress={handleCardPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pressable}
      >
        {/* Şəkil Konteyneri */}
        <View style={[styles.imageContainer, { borderRadius: radius.image }]}>
          <Image
            source={{ uri: hotel.images[0] }}
            style={styles.image}
            contentFit="cover"
            transition={300}
            cachePolicy="memory-disk"
          />

          {/* Yuxarı Sol: HotelTonight Category Pill + Deal / Endirim badge */}
          <View style={styles.badgeTopLeft}>
            {/* HT Category Badge */}
            <View
              style={[
                styles.htCatBadge,
                { backgroundColor: htCategoryMeta.badgeBg },
              ]}
            >
              <Text
                style={[
                  styles.htCatBadgeText,
                  { color: htCategoryMeta.badgeText },
                ]}
              >
                {htCategoryMeta.label.toUpperCase()}
              </Text>
            </View>

            {hotel.dealLabel ? (
              <View style={[styles.dealPill, { backgroundColor: colors.primary }]}>
                <Ionicons name="sparkles" size={11} color="#FFFFFF" style={{ marginRight: 3 }} />
                <Text style={styles.dealPillText}>{hotel.dealLabel}</Text>
              </View>
            ) : hotel.discountPercent > 0 ? (
              <View style={[styles.dealPill, { backgroundColor: colors.savings }]}>
                <Text style={styles.dealPillText}>-{hotel.discountPercent}%</Text>
              </View>
            ) : null}
          </View>

          {/* Yuxarı Sağ: Yarı-şəffaf Favorit ürək düyməsi */}
          <Pressable
            onPress={handleFavoritePress}
            hitSlop={10}
            style={({ pressed }) => [
              styles.favoriteButton,
              {
                backgroundColor: isDark
                  ? 'rgba(15, 14, 23, 0.75)'
                  : 'rgba(255, 255, 255, 0.85)',
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Ionicons
                name={favorite ? 'heart' : 'heart-outline'}
                size={22}
                color={favorite ? colors.urgency : isDark ? '#FFFFFF' : '#17171F'}
              />
            </Animated.View>
          </Pressable>

          {/* Şəklin altında dot indikator */}
          <View style={styles.dotsContainer}>
            {hotel.images.slice(0, 6).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === 0
                    ? [styles.activeDot, { backgroundColor: '#FFFFFF' }]
                    : styles.inactiveDot,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Şəklin altındakı məlumat bloku: SOL və SAĞ sütun */}
        <View style={styles.infoRow}>
          {/* SOL SÜTUN */}
          <View style={styles.leftCol}>
            <Text
              style={[typography.heading, { color: colors.text, fontSize: 18 }]}
              numberOfLines={1}
            >
              {hotel.name}
            </Text>

            <View style={styles.starsRow}>
              <Text style={{ color: colors.star, fontSize: 13, fontWeight: '700' }}>
                {renderStars(hotel.starRating)}
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
                · {hotel.neighborhood}
              </Text>
            </View>

            {/* Reytinq xal çipi + reviewLabel */}
            <View style={styles.ratingRow}>
              <View style={[styles.scoreBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.scoreText}>{hotel.rating.toFixed(1)}</Text>
              </View>
              <Text style={[typography.caption, { color: colors.text, fontWeight: '700' }]}>
                {hotel.reviewLabel}
              </Text>
              <Text style={[typography.micro, { color: colors.textSecondary, marginLeft: 4 }]}>
                ({formatReviewCount(hotel.reviewCount)})
              </Text>
            </View>
          </View>

          {/* SAĞ SÜTUN (Qiymət bloku) */}
          <View style={styles.rightCol}>
            {hotel.discountPercent > 0 && (
              <View style={styles.discountRow}>
                <Text style={[styles.strikethroughPrice, { color: colors.textSecondary }]}>
                  {formatPrice(hotel.standardPrice)}
                </Text>
                <Text style={[styles.savingsBadge, { color: colors.savings }]}>
                  -{hotel.discountPercent}%
                </Text>
              </View>
            )}

            <View style={styles.priceRow}>
              <Text
                style={[
                  typography.display,
                  {
                    color: colors.text,
                    fontSize: 22,
                    lineHeight: 26,
                    fontWeight: '800',
                  },
                ]}
              >
                {formatPrice(hotel.discountedPrice)}
              </Text>
            </View>

            <Text style={[typography.caption, { color: colors.textSecondary, fontSize: 12 }]}>
              /gecə
            </Text>
            <Text style={[typography.micro, { color: colors.textSecondary, fontSize: 10, marginTop: 1 }]}>
              vergilər daxil
            </Text>
          </View>
        </View>

        {/* Təcililik / Pulsuz ləğv sətri */}
        {(hotel.roomsLeft !== null || hotel.freeCancellation) && (
          <View style={styles.statusRow}>
            {hotel.roomsLeft !== null && hotel.roomsLeft <= 5 && (
              <View style={styles.statusItem}>
                <Ionicons name="flame" size={14} color={colors.urgency} style={{ marginRight: 4 }} />
                <Text style={[typography.caption, { color: colors.urgency, fontWeight: '700' }]}>
                  Yalnız {hotel.roomsLeft} otaq qalıb
                </Text>
              </View>
            )}

            {hotel.freeCancellation && (
              <View style={[styles.statusItem, { marginLeft: hotel.roomsLeft ? 12 : 0 }]}>
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={colors.savings}
                  style={{ marginRight: 4 }}
                />
                <Text style={[typography.caption, { color: colors.savings, fontWeight: '600' }]}>
                  Pulsuz ləğv
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Xidmətlər İkonları Sırası */}
        <View style={styles.amenitiesContainer}>
          {visibleAmenities.map((amenityKey) => {
            const info = getAmenityInfo(amenityKey);
            return (
              <View
                key={amenityKey}
                style={[
                  styles.amenityChip,
                  {
                    backgroundColor: colors.surfaceAlt,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  name={info.icon}
                  size={13}
                  color={colors.textSecondary}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    typography.micro,
                    { color: colors.textSecondary, fontSize: 11 },
                  ]}
                >
                  {info.shortLabel}
                </Text>
              </View>
            );
          })}

          {remainingAmenitiesCount > 0 && (
            <View
              style={[
                styles.amenityChip,
                {
                  backgroundColor: colors.surfaceAlt,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  typography.micro,
                  { color: colors.textSecondary, fontSize: 11, fontWeight: '700' },
                ]}
              >
                +{remainingAmenitiesCount}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  pressable: {
    width: '100%',
  },
  imageContainer: {
    width: '100%',
    height: 236,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#E8E8EF',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeTopLeft: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  htCatBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  htCatBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  dealPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  dealPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  activeDot: {
    width: 16,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 12,
  },
  leftCol: {
    flex: 1,
    paddingRight: 10,
  },
  rightCol: {
    alignItems: 'flex-end',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  scoreBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
  },
  scoreText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  strikethroughPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    marginRight: 4,
  },
  savingsBadge: {
    fontSize: 11,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amenitiesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 6,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
});

export default HotelCard;