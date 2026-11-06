import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/hooks/useTheme';
import { useFavoritesStore } from '@/store/favoritesStore';
import { getHotelsByIds } from '@/services/hotelService';
import { favoriteService } from '@/services/favoriteService';
import { Hotel } from '@/types/hotel';

import { HotelCard } from '@/components/hotel/HotelCard';
import { HotelCardSkeleton } from '@/components/hotel/HotelCardSkeleton';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export default function FavouritesScreen() {
  const router = useRouter();
  const { colors, typography } = useTheme();
  const { favorites } = useFavoritesStore();
  const { t } = useTranslation();

  const {
    data: favoriteHotels = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery<Hotel[]>({
    queryKey: ['favoriteHotels', favorites],
    queryFn: async () => {
      if (process.env.EXPO_PUBLIC_USE_MOCK === '1') {
        return getHotelsByIds(favorites);
      }
      try {
        const serverList = await favoriteService.getFavorites();
        if (serverList && serverList.length > 0) {
          return serverList;
        }
        if (favorites.length > 0) {
          return await getHotelsByIds(favorites);
        }
        return [];
      } catch {
        return await getHotelsByIds(favorites);
      }
    },
  });

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={[typography.display, { color: colors.text, fontSize: 26 }]}>
        {t('favourites.title', 'Favoritlərim')}
      </Text>
      <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
        {favoriteHotels.length === 1
          ? `1 ${t('home.hotelsFound', 'otel tapıldı')}`
          : `${favoriteHotels.length} ${t('home.hotelsFound', 'otel tapıldı')}`}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      {isLoading ? (
        <View style={{ paddingTop: 16 }}>
          {renderHeader()}
          <HotelCardSkeleton />
          <HotelCardSkeleton />
        </View>
      ) : isError ? (
        <View style={styles.emptyContainer}>
          {renderHeader()}
          <View style={styles.emptyContent}>
            <EmptyState
              icon="alert-circle-outline"
              title="Xəta baş verdi"
              description="Favoritlər siyahısı yüklənərkən problem yarandı."
              actionTitle="Yenidən yoxla"
              onAction={() => refetch()}
            />
          </View>
        </View>
      ) : favoriteHotels.length === 0 ? (
        <View style={styles.emptyContainer}>
          {renderHeader()}
          <View style={styles.emptyContent}>
            {/* Böyük ürək illustrasiyası (primaryTint dairə içində) */}
            <View style={[styles.heartCircle, { backgroundColor: colors.primaryTint }]}>
              <Ionicons name="heart" size={54} color={colors.primary} />
            </View>

            <Text
              style={[
                typography.title,
                { color: colors.text, textAlign: 'center', marginTop: 20 },
              ]}
            >
              {t('favourites.emptyTitle', 'Hələ favorit otel yoxdur')}
            </Text>

            <Text
              style={[
                typography.body,
                {
                  color: colors.textSecondary,
                  textAlign: 'center',
                  marginTop: 8,
                  paddingHorizontal: 24,
                  lineHeight: 22,
                },
              ]}
            >
              {t(
                'favourites.emptySubtitle',
                'Bəyəndiyiniz otellərdəki ürək ikonuna basaraq onları bu siyahıda saxlaya bilərsiniz.'
              )}
            </Text>

            <Button
              title={t('favourites.exploreHotels', 'Otellərə bax')}
              onPress={() => router.push('/(tabs)' as any)}
              style={styles.browseBtn}
            />
          </View>
        </View>
      ) : (
        <FlatList
          data={favoriteHotels}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <HotelCard hotel={item} />}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          windowSize={5}
          removeClippedSubviews={true}
          refreshing={isRefetching}
          onRefresh={refetch}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  listContent: {
    paddingBottom: 32,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  heartCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  browseBtn: {
    marginTop: 28,
    minWidth: 180,
  },
});
