import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { Hotel } from '@/types/hotel';
import { useTheme } from '@/constants/theme';
import { formatPrice } from '@/utils/format';
import { useFavoritesStore } from '@/store/favoritesStore';

interface BookingBarProps {
  hotel: Hotel;
  onToast?: (message: string) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const BookingBar: React.FC<BookingBarProps> = ({ hotel, onToast }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, fonts, radius } = useTheme();

  const isFavorite = useFavoritesStore((state) => state.isFavorite(hotel.id));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const heartScale = useSharedValue(1);

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const handleFavoritePress = async () => {
    // Spring animasiya
    heartScale.value = withSequence(
      withSpring(1.25, { damping: 10, stiffness: 350 }),
      withSpring(1, { damping: 12, stiffness: 250 })
    );

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const willBeFavorite = !isFavorite;
    await toggleFavorite(hotel.id);

    if (willBeFavorite) {
      onToast?.('Favoritlərə əlavə olundu');
    } else {
      onToast?.('Favoritlərdən çıxarıldı');
    }
  };

  const handleBookingPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/booking/${hotel.id}` as any);
  };

  return (
    <View
      style={[
        styles.barContainer,
        {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, 14),
        },
      ]}>
      {/* Price block */}
      <View style={styles.priceContainer}>
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
        <View style={styles.currentPriceRow}>
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
            / bu gecə
          </Text>
        </View>
      </View>

      {/* Action buttons */}
      <View style={styles.actionsContainer}>
        {/* Book Now Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Rezervasiya et"
          onPress={handleBookingPress}
          style={({ pressed }) => [
            styles.bookButton,
            {
              backgroundColor: colors.accent,
              borderRadius: radius.button,
              opacity: pressed ? 0.9 : 1,
            },
          ]}>
          <Text style={[styles.bookButtonText, { fontFamily: fonts.bold }]}>
            Rezervasiya et
          </Text>
        </Pressable>

        {/* 52x52 Square Heart Button */}
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? 'Favoritlərdən çıxar' : 'Favoritlərə əlavə et'}
          onPress={handleFavoritePress}
          style={[
            styles.heartButton,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              borderRadius: radius.button,
            },
            heartAnimatedStyle,
          ]}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? colors.accent : colors.textSecondary}
          />
        </AnimatedPressable>
      </View>
    </View>
  );
};

export default BookingBar;

const styles = StyleSheet.create({
  barContainer: {
    borderTopWidth: 1,
    paddingTop: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  priceContainer: {
    marginRight: 14,
  },
  standardPrice: {
    fontSize: 13,
    textDecorationLine: 'line-through',
  },
  currentPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  discountedPrice: {
    fontSize: 22,
    lineHeight: 26,
  },
  perNightText: {
    fontSize: 12,
  },
  actionsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bookButton: {
    flex: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  heartButton: {
    width: 52,
    height: 52,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

