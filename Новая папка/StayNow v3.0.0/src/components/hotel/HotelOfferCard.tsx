import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Heart, Star } from 'lucide-react-native';
import { Badge } from '@/components/ui';
import { useFavoritesStore } from '@/store';
import { Hotel } from '@/types/hotel';
import { colors, radius, shadows, spacing, typography } from '@/theme';

export interface HotelOfferCardProps {
  hotel: Hotel;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onFavoritePress?: (hotel: Hotel) => void;
}

export const HotelOfferCard: React.FC<HotelOfferCardProps> = React.memo(({
  hotel,
  style,
  onPress,
  onFavoritePress,
}) => {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const favorited = isFavorite(hotel.id);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1.35,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    if (onFavoritePress) {
      onFavoritePress(hotel);
    } else {
      toggleFavorite(hotel.id);
    }
  };

  const handleCardPress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/hotel/${hotel.id}` as any);
    }
  };

  const mainImage = hotel.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';

  return (
    <Pressable
      onPress={handleCardPress}
      accessibilityRole="button"
      accessibilityLabel={`${hotel.name}, ${hotel.district}, bir gecəsi ${hotel.discountedPrice} manat`}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
        style,
      ]}
    >
      {/* 190px Image Banner */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: mainImage }}
          style={styles.image}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200}
        />

        {/* Top Left: Offer Badge */}
        <View style={styles.badgeTopLeft}>
          <Badge
            label={`${hotel.discountPercent}% QƏNAƏT`}
            variant="savings"
            size="md"
            style={styles.savingsBadge}
            textStyle={styles.savingsBadgeText}
          />
        </View>

        {/* Top Right: Circular 34px Heart Button */}
        <Animated.View
          style={[
            styles.heartWrapper,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Pressable
            onPress={handleFavoritePress}
            hitSlop={10}
            style={styles.heartBtn}
            accessibilityRole="button"
            accessibilityLabel={favorited ? 'Seçilmişlərdən çıxar' : 'Seçilmişlərə əlavə et'}
          >
            <Heart
              size={18}
              color={favorited ? colors.primary : colors.white}
              fill={favorited ? colors.primary : 'transparent'}
            />
          </Pressable>
        </Animated.View>
      </View>

      {/* Card Content */}
      <View style={styles.body}>
        {/* Category & Rating Row */}
        <View style={styles.metaRow}>
          <Text style={styles.categoryText}>{hotel.category.toUpperCase()}</Text>
          <View style={styles.ratingBadge}>
            <Star size={13} color={colors.star} fill={colors.star} />
            <Text style={styles.ratingText}>
              {hotel.rating.toFixed(1)}
              <Text style={styles.reviewCountText}> ({hotel.reviewCount})</Text>
            </Text>
          </View>
        </View>

        {/* Hotel Name */}
        <Text style={styles.hotelName} numberOfLines={1}>
          {hotel.name}
        </Text>

        {/* Address */}
        <Text style={styles.addressText} numberOfLines={1}>
          {hotel.address}, {hotel.district}
        </Text>

        {/* Footer: Cancellation / Perks on left, Price on right */}
        <View style={styles.footerRow}>
          <View style={styles.perkContainer}>
            <Text style={styles.perkText}>Pulsuz ləğvetmə</Text>
            <Text style={styles.stayDurationText}>1 gecə qalma</Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.standardPrice}>
              {hotel.standardPrice} ₼
            </Text>
            <View style={styles.discountedRow}>
              <Text style={styles.discountedPrice}>
                {hotel.discountedPrice}
              </Text>
              <Text style={styles.currencyText}> ₼</Text>
              <Text style={styles.perNightText}> / gecə</Text>
            </View>
            <Text style={styles.taxNoteText}>vergilər daxil</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
});

HotelOfferCard.displayName = 'HotelOfferCard';

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardPressed: {
    backgroundColor: colors.surfaceHighlight,
    opacity: 0.96,
  },
  imageContainer: {
    width: '100%',
    height: 190,
    position: 'relative',
    backgroundColor: colors.surfaceHighlight,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeTopLeft: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
  },
  savingsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(12, 45, 32, 0.94)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  savingsBadgeText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.4,
  },
  heartWrapper: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  heartBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(15, 14, 23, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  body: {
    padding: spacing.md + 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  reviewCountText: {
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.regular,
  },
  hotelName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: 2,
  },
  addressText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  perkContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  perkText: {
    fontSize: typography.fontSize.xs,
    color: colors.savings,
    fontWeight: typography.fontWeight.medium,
  },
  stayDurationText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  standardPrice: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
    marginBottom: 1,
  },
  discountedRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  discountedPrice: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.extraBold,
    color: colors.text,
  },
  currencyText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  perNightText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  taxNoteText: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
  },
});

