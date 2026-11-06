import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ArrowRight, Star } from 'lucide-react-native';
import { Hotel } from '@/types/hotel';
import { colors, radius, shadows, spacing, typography } from '@/theme';

export interface MapSelectedHotelCardProps {
  hotel: Hotel;
  onPress?: () => void;
}

export const MapSelectedHotelCard: React.FC<MapSelectedHotelCardProps> = ({
  hotel,
  onPress,
}) => {
  const router = useRouter();

  const handleCardPress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/hotel/${hotel.id}` as any);
    }
  };

  const imageUri = hotel.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80';

  return (
    <View style={styles.container}>
      <Pressable
        onPress={handleCardPress}
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
      >
        {/* 98x102 Image */}
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          contentFit="cover"
          cachePolicy="memory-disk"
          transition={200}
        />

        {/* Content info */}
        <View style={styles.infoCol}>
          {/* Category & Rating */}
          <View style={styles.metaRow}>
            <Text style={styles.categoryText}>{hotel.category.toUpperCase()}</Text>
            <View style={styles.ratingRow}>
              <Star size={12} color={colors.star} fill={colors.star} />
              <Text style={styles.ratingText}>{hotel.rating.toFixed(1)}</Text>
            </View>
          </View>

          {/* Name */}
          <Text style={styles.nameText} numberOfLines={1}>
            {hotel.name}
          </Text>

          {/* Address */}
          <Text style={styles.addressText} numberOfLines={1}>
            {hotel.district} · {hotel.address}
          </Text>

          {/* Price row */}
          <View style={styles.priceRow}>
            <View style={styles.priceTextRow}>
              {hotel.standardPrice > hotel.discountedPrice && (
                <Text style={styles.oldPrice}>{hotel.standardPrice} ₼</Text>
              )}
              <Text style={styles.currentPrice}>{hotel.discountedPrice} ₼</Text>
              <Text style={styles.perNight}> / gecə</Text>
            </View>

            {/* 32px circular Arrow button */}
            <View style={styles.arrowCircle}>
              <ArrowRight size={16} color={colors.white} strokeWidth={2.5} />
            </View>
          </View>
        </View>
      </Pressable>

      {/* Note under card */}
      <Text style={styles.mapDisclaimer}>
        ⚡ Qiymətlər bu gecə üçün keçərlidir və bütün vergilər daxildir
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.xl,
    padding: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.lg,
  },
  cardPressed: {
    backgroundColor: colors.surfaceHighlight,
    opacity: 0.95,
  },
  image: {
    width: 98,
    height: 102,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceHighlight,
  },
  infoCol: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'space-between',
    height: 102,
    paddingVertical: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  nameText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: 2,
  },
  addressText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  priceTextRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  oldPrice: {
    fontSize: 11,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.extraBold,
    color: colors.text,
  },
  perNight: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapDisclaimer: {
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 2,
  },
});

