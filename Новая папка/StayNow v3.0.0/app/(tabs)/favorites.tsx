import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CalendarDays,
  Compass,
  Heart,
  MapPin,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  Button,
  Card,
  Chip,
  EmptyState,
  IconButton,
  ScreenHeader,
  Skeleton,
  Toast,
} from '@/components/ui';
import { HotelOfferCard } from '@/components/hotel';
import {
  DateRangePickerSheet,
  GuestsRoomsPickerSheet,
} from '@/components/search';
import { useHotelsQuery } from '@/services/queries';
import { useFavoritesStore, useSearchStore } from '@/store';
import { Hotel } from '@/types/hotel';
import { formatDateRange, formatNights } from '@/utils/format';
import { colors, radius, spacing, typography } from '@/theme';

export default function FavoritesTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: allHotels, isLoading, refetch } = useHotelsQuery();
  const { favoriteIds, removeFavorite, addFavorite } = useFavoritesStore();
  const { checkInDate, checkOutDate, guests, setDates, setGuests } = useSearchStore();

  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isGuestsPickerVisible, setIsGuestsPickerVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRemovedHotel, setLastRemovedHotel] = useState<Hotel | null>(null);

  // Get favorite hotels from query
  const favoriteHotels = useMemo(() => {
    if (!allHotels) return [];
    return allHotels.filter((hotel) => favoriteIds.includes(hotel.id));
  }, [allHotels, favoriteIds]);

  // Extract unique districts from favorites for dynamic chips
  const dynamicDistricts = useMemo(() => {
    const districts = new Set<string>();
    favoriteHotels.forEach((h) => {
      if (h.district) districts.add(h.district);
    });
    return Array.from(districts);
  }, [favoriteHotels]);

  // Filter by selected district
  const filteredHotels = useMemo(() => {
    if (!selectedDistrict) return favoriteHotels;
    return favoriteHotels.filter((h) => h.district === selectedDistrict);
  }, [favoriteHotels, selectedDistrict]);

  const stayNights = useMemo(() => {
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  }, [checkInDate, checkOutDate]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleRemoveFavorite = (hotel: Hotel) => {
    Haptics.selectionAsync();
    removeFavorite(hotel.id);
    setLastRemovedHotel(hotel);
  };

  const handleUndoRemove = () => {
    if (lastRemovedHotel) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addFavorite(lastRemovedHotel.id);
      setLastRemovedHotel(null);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Seçilmişlər</Text>
        </View>
        <View style={styles.content}>
          <Skeleton width="100%" height={64} borderRadius={radius.lg} />
          <Skeleton width="100%" height={260} borderRadius={radius.lg} style={{ marginTop: spacing.md }} />
          <Skeleton width="100%" height={260} borderRadius={radius.lg} style={{ marginTop: spacing.md }} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Header (Figma node 6:10480) */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.xs }]}>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>Seçilmişlər</Text>
          <Text style={styles.headerSubtitle}>
            {favoriteHotels.length > 0
              ? `${favoriteHotels.length} otel saxlanılıb`
              : 'Yadda saxladığınız və bəyəndiyiniz otellər'}
          </Text>
        </View>
        <View style={styles.headerHeartCircle}>
          <Heart size={20} color={colors.brand} fill={colors.brand} />
        </View>
      </View>

      {favoriteHotels.length === 0 ? (
        <EmptyState
          icon={<Heart size={40} color={colors.primary} />}
          title="Seçilmiş oteliniz yoxdur"
          description="Bəyəndiyiniz otelləri ürək işarəsinə toxunaraq bura əlavə edə bilərsiniz."
          actionTitle="Otelləri kəşf et"
          onActionPress={() => router.push('/(tabs)')}
        />
      ) : (
        <FlatList
          data={filteredHotels}
          keyExtractor={(item) => item.id}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 110 + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <View style={styles.listHeader}>
              {/* Dynamic District Chips */}
              <View style={styles.districtChipsRow}>
                <Chip
                  label="Hamısı"
                  selected={selectedDistrict === null}
                  onPress={() => setSelectedDistrict(null)}
                />
                {dynamicDistricts.map((district) => (
                  <Chip
                    key={district}
                    label={district}
                    icon={<MapPin size={12} color={selectedDistrict === district ? colors.primary : colors.textSecondary} />}
                    selected={selectedDistrict === district}
                    onPress={() =>
                      setSelectedDistrict(selectedDistrict === district ? null : district)
                    }
                  />
                ))}
              </View>

              {/* Saved Stay Dates Card */}
              <Card style={styles.stayDatesCard}>
                <View style={styles.stayDatesLeft}>
                  <View style={styles.calendarIconCircle}>
                    <CalendarDays size={18} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.stayDatesLabel}>QALMA TARİXİ VƏ QONAQLAR</Text>
                    <Text style={styles.stayDatesValue}>
                      {formatDateRange(checkInDate, checkOutDate)} ({formatNights(stayNights)}) · {guests.adults} böyük
                    </Text>
                  </View>
                </View>

                <Pressable
                  style={styles.changeDatesBtn}
                  onPress={() => setIsDatePickerVisible(true)}
                >
                  <Text style={styles.changeDatesText}>Dəyiş</Text>
                </Pressable>
              </Card>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.hotelCardWrapper}>
              <HotelOfferCard
                hotel={item}
                onPress={() => router.push(`/hotel/${item.id}` as any)}
                onFavoritePress={() => handleRemoveFavorite(item)}
              />
            </View>
          )}
          ListFooterComponent={
            <Text style={styles.footerDisclaimer}>
              Qiymətlər seçilmiş tarixlər üçün etibarlıdır və bütün vergi və bələdiyyə rüsumları daxildir.
            </Text>
          }
        />
      )}

      {/* Undo Toast */}
      {lastRemovedHotel && (
        <View style={styles.undoToastContainer}>
          <View style={styles.undoToastCard}>
            <Text style={styles.undoToastText} numberOfLines={1}>
              {lastRemovedHotel.name} favoritlərdən çıxarıldı
            </Text>
            <Pressable style={styles.undoBtn} onPress={handleUndoRemove}>
              <RotateCcw size={14} color={colors.primary} />
              <Text style={styles.undoBtnText}>Geri al</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Date & Guests Sheets */}
      <DateRangePickerSheet
        visible={isDatePickerVisible}
        onClose={() => setIsDatePickerVisible(false)}
        onConfirm={(start, end) => {
          setDates(start, end);
          setIsDatePickerVisible(false);
        }}
      />

      <GuestsRoomsPickerSheet
        visible={isGuestsPickerVisible}
        onClose={() => setIsGuestsPickerVisible(false)}
        onConfirm={(newGuests) => {
          setGuests(newGuests);
          setIsGuestsPickerVisible(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerHeartCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryTint,
    borderWidth: 1,
    borderColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  listHeader: {
    marginBottom: spacing.md,
  },
  districtChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  stayDatesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stayDatesLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  calendarIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stayDatesLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  stayDatesValue: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: 2,
  },
  changeDatesBtn: {
    backgroundColor: colors.primaryTint,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.brand,
  },
  changeDatesText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  hotelCardWrapper: {
    marginBottom: spacing.md,
  },
  footerDisclaimer: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  undoToastContainer: {
    position: 'absolute',
    bottom: 95,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 99,
  },
  undoToastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceHighlight,
    borderRadius: radius.lg,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  undoToastText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    color: colors.text,
    marginRight: spacing.sm,
  },
  undoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryTint,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.brand,
  },
  undoBtnText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
});