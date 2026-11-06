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

import { useTheme } from '@/hooks/useTheme';
import { useFavoritesStore } from '@/store/favoritesStore';
import { Hotel } from '@/types/hotel';
import { formatPrice } from '@/utils/format';

export interface SelectedHotelCardProps {
  hotel: Hotel;
  onClose: () => void;
}

export const SelectedHotelCard: React.FC<SelectedHotelCardProps> = ({
  hotel,
  onClose,
}) => {
  const router = useRouter();
  const { colors, typography, radius, shadows, isDark } = useTheme();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const favorite = isFavorite(hotel.id);

  const heartScale = useRef(new Animated.Value(1)).current;

  const handleFavoritePress = (e: any) => {
    e?.stopPropagation?.();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

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

  const handleCardPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/hotel/${hotel.id}` as any);
  };

  const renderStars = (count: number) => {
    return '★'.repeat(Math.max(1, Math.min(5, count)));
  };

  return (
    <Pressable
      onPress={handleCardPress}
      style={[
        styles.card,
        shadows.card,
        {
          backgroundColor: isDark ? colors.surfaceAlt : '#FFFFFF',
          borderColor: colors.border,
          borderRadius: radius.card,
        },
      ]}
    >
      {/* 90x90 Şəkil */}
      <Image
        source={{ uri: hotel.images[0] }}
        style={[styles.image, { borderRadius: radius.card - 4 }]}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />

      {/* Məlumatlar */}
      <View style={styles.details}>
        {/* Ad və Bağla (X) */}
        <View style={styles.titleRow}>
          <Text
            style={[typography.heading, { color: colors.text, fontSize: 16, flex: 1 }]}
            numberOfLines={1}
          >
            {hotel.name}
          </Text>

          <Pressable
            onPress={(e) => {
              e?.stopPropagation?.();
              onClose();
            }}
            hitSlop={8}
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Ulduzlar və Məhəllə */}
        <Text style={{ color: colors.star, fontSize: 12, marginTop: 1, fontWeight: '700' }}>
          {renderStars(hotel.starRating)}{' '}
          <Text style={{ color: colors.textSecondary, fontWeight: '400' }}>
            · {hotel.neighborhood}
          </Text>
        </Text>

        {/* Xal çipi + reviewLabel */}
        <View style={styles.ratingRow}>
          <View style={[styles.scoreBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.scoreText}>{hotel.rating.toFixed(1)}</Text>
          </View>
          <Text style={[typography.caption, { color: colors.text, fontWeight: '700' }]}>
            {hotel.reviewLabel}
          </Text>
        </View>

        {/* Qiymət və Favorit Düyməsi */}
        <View style={styles.footerRow}>
          <View style={styles.priceRow}>
            {hotel.discountPercent > 0 && (
              <Text style={[styles.oldPrice, { color: colors.textSecondary }]}>
                {formatPrice(hotel.standardPrice)}
              </Text>
            )}
            <Text style={[typography.heading, { color: colors.text, fontSize: 17 }]}>
              {formatPrice(hotel.discountedPrice)}
            </Text>
            <Text style={[typography.micro, { color: colors.textSecondary, marginLeft: 3 }]}>
              /gecə
            </Text>
          </View>

          <Pressable
            onPress={handleFavoritePress}
            hitSlop={8}
            style={[
              styles.heartBtn,
              {
                backgroundColor: favorite ? colors.primaryTint : colors.surfaceAlt,
                borderColor: favorite ? colors.primary : colors.border,
              },
            ]}
          >
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Ionicons
                name={favorite ? 'heart' : 'heart-outline'}
                size={18}
                color={favorite ? colors.primary : colors.text}
              />
            </Animated.View>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 12,
    borderWidth: 1,
    width: '100%',
  },
  image: {
    width: 90,
    height: 90,
  },
  details: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeBtn: {
    padding: 2,
    marginLeft: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  scoreBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 5,
    marginRight: 6,
  },
  scoreText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  oldPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    marginRight: 5,
  },
  heartBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});

export default SelectedHotelCard;