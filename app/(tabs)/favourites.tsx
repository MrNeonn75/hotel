import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  LinearTransition,
  FadeOut,
  FadeIn,
} from 'react-native-reanimated';

import { useTheme } from '@/constants/theme';
import { useFavoritesStore } from '@/store/favoritesStore';
import { hotelService } from '@/services/hotelService';
import { Hotel } from '@/types/hotel';
import { HotelCard } from '@/components/hotel/HotelCard';
import { useTranslation } from 'react-i18next';

export default function FavouritesScreen() {
  const router = useRouter();
  const { colors, fonts, radius, spacing } = useTheme();
  const { t } = useTranslation();

  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(favoriteIds.length > 0);

  useEffect(() => {
    let isMounted = true;
    if (favoriteIds.length === 0) {
      return;
    }

    hotelService
      .getHotelsByIds(favoriteIds)
      .then((data) => {
        if (isMounted) {
          setHotels(data);
          setLoading(false);
        }
      })
      .catch((e) => {
        console.error('Error fetching favorite hotels', e);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [favoriteIds]);

  // Siyahıdan dərhal çıxarılması üçün aktiv favoriteIds ilə filter
  const displayedHotels = hotels.filter((h) => favoriteIds.includes(h.id));

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md }]}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text, fontFamily: fonts.extraBold }]}>
            {t('favourites.title', 'Favoritlərim')}
          </Text>
          <View
            style={[
              styles.counterBadge,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.pill,
              },
            ]}>
            <Text style={[styles.counterText, { color: colors.primary, fontFamily: fonts.bold }]}>
              {displayedHotels.length}
            </Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : displayedHotels.length === 0 ? (
        // Empty state
        <View style={styles.emptyContainer}>
          <View
            style={[
              styles.emptyIconCircle,
              { backgroundColor: colors.accent + '15' },
            ]}>
            <Ionicons name="heart-outline" size={56} color={colors.accent} />
          </View>

          <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: fonts.bold }]}>
            {t('favourites.emptyTitle', 'Hələ favorit otel yoxdur')}
          </Text>

          <Text
            style={[
              styles.emptySubtitle,
              { color: colors.textSecondary, fontFamily: fonts.regular },
            ]}>
            {t('favourites.emptySubtitle', 'Bəyəndiyiniz otelləri ürək ikonuna basaraq favoritlərinizə əlavə edə bilərsiniz.')}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('favourites.exploreHotels', 'Otellərə bax')}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(tabs)' as any);
            }}
            style={({ pressed }) => [
              styles.exploreButton,
              {
                backgroundColor: colors.primary,
                borderRadius: radius.button,
                opacity: pressed ? 0.9 : 1,
              },
            ]}>
            <Ionicons name="bed-outline" size={18} color="#FFFFFF" />
            <Text style={[styles.exploreBtnText, { fontFamily: fonts.bold }]}>
              {t('favourites.exploreHotels', 'Otellərə bax')}
            </Text>
          </Pressable>
        </View>
      ) : (
        // Favorites list with Reanimated Layout Animations
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
          ]}>
          {displayedHotels.map((hotel) => (
            <Animated.View
              key={hotel.id}
              layout={LinearTransition.springify().damping(16).stiffness(200)}
              entering={FadeIn.duration(250)}
              exiting={FadeOut.duration(250)}
              style={styles.cardWrapper}>
              <HotelCard hotel={hotel} />
            </Animated.View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 28,
  },
  counterBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    minWidth: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: {
    fontSize: 14,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyIconCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 14,
    marginTop: 10,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  listContent: {
    paddingTop: 8,
    gap: 16,
  },
  cardWrapper: {
    width: '100%',
  },
});
