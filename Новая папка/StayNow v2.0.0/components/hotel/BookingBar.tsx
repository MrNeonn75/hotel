import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/hooks/useTheme';
import { useFavoritesStore } from '@/store/favoritesStore';
import { formatPrice } from '@/utils/format';
import { Hotel } from '@/types/hotel';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';

export interface BookingBarProps {
  hotel: Hotel;
}

export const BookingBar: React.FC<BookingBarProps> = ({ hotel }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography, radius, isDark } = useTheme();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const favorite = isFavorite(hotel.id);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const heartScale = useRef(new Animated.Value(1)).current;

  const handleFavoritePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Spring animation
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

    const willBeFavorite = !favorite;
    toggleFavorite(hotel.id);

    setToastMessage(
      willBeFavorite
        ? 'Favoritlərə əlavə olundu'
        : 'Favoritlərdən çıxarıldı'
    );

    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleBookNow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/booking/${hotel.id}` as any);
  };

  return (
    <>
      {/* Toast Alert */}
      {toastMessage && (
        <View style={[styles.toastWrapper, { bottom: 90 + Math.max(insets.bottom, 12) }]}>
          <Toast
            message={toastMessage}
            type="success"
            visible={Boolean(toastMessage)}
          />
        </View>
      )}

      {/* Sticky Bottom Bar */}
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark ? colors.surfaceAlt : colors.background,
            borderTopColor: colors.border,
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        {/* Sol tərəf: Qiymət məlumatı */}
        <View style={styles.priceContainer}>
          {hotel.discountPercent > 0 && (
            <View style={styles.oldPriceRow}>
              <Text style={[styles.strikethroughPrice, { color: colors.textSecondary }]}>
                {formatPrice(hotel.standardPrice)}
              </Text>
              <Text style={[styles.discountTag, { color: colors.savings }]}>
                -{hotel.discountPercent}%
              </Text>
            </View>
          )}

          <View style={styles.newPriceRow}>
            <Text
              style={[
                typography.title,
                {
                  color: colors.text,
                  fontWeight: '800',
                  fontSize: 22,
                  lineHeight: 26,
                },
              ]}
            >
              {formatPrice(hotel.discountedPrice)}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>
              /gecə
            </Text>
          </View>

          <Text style={[typography.micro, { color: colors.textSecondary, fontSize: 10 }]}>
            vergilər daxil
          </Text>
        </View>

        {/* Sağ tərəf: Ürək düyməsi + Rezervasiya et */}
        <View style={styles.actionsContainer}>
          <Pressable
            onPress={handleFavoritePress}
            style={[
              styles.heartBtn,
              {
                borderRadius: radius.button,
                borderColor: favorite ? colors.primary : colors.border,
                backgroundColor: favorite ? colors.primaryTint : 'transparent',
              },
            ]}
          >
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <Ionicons
                name={favorite ? 'heart' : 'heart-outline'}
                size={24}
                color={favorite ? colors.primary : colors.text}
              />
            </Animated.View>
          </Pressable>

          <Button
            title="Rezervasiya et"
            onPress={handleBookNow}
            style={styles.bookBtn}
          />
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 999,
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    zIndex: 100,
  },
  priceContainer: {
    marginRight: 12,
  },
  oldPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },
  strikethroughPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  discountTag: {
    fontSize: 11,
    fontWeight: '700',
  },
  newPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  actionsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  heartBtn: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  bookBtn: {
    flex: 1,
    maxWidth: 200,
  },
});

export default BookingBar;