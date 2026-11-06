import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AlertCircle,
  ArrowUpDown,
  Filter,
  Map,
  MapPin,
  Search,
  SlidersHorizontal,
} from 'lucide-react-native';
import {
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  IconButton,
  ScreenHeader,
  Skeleton,
} from '@/components/ui';
import { HotelOfferCard } from '@/components/hotel';
import {
  DateRangePickerSheet,
  GuestsRoomsPickerSheet,
  LocationSearchSheet,
  SORT_OPTIONS,
  SortBottomSheet,
} from '@/components/search';
import {
  getActiveFilterCount,
  useFilterStore,
} from '@/store/filterStore';
import { useSearchStore } from '@/store';
import { hotelsApi, PaginatedHotelsResponse } from '@/services/hotelsApi';
import { Hotel } from '@/types/hotel';
import { formatDateRange } from '@/utils/format';
import { colors, radius, spacing, typography } from '@/theme';
import { az } from '@/i18n/az';

export default function SearchResultsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList<Hotel>>(null);

  const searchStore = useSearchStore();
  const filterStore = useFilterStore();

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [data, setData] = useState<PaginatedHotelsResponse | null>(null);

  // Sheets
  const [locationSheetVisible, setLocationSheetVisible] = useState(false);
  const [dateSheetVisible, setDateSheetVisible] = useState(false);
  const [guestsSheetVisible, setGuestsSheetVisible] = useState(false);
  const [sortSheetVisible, setSortSheetVisible] = useState(false);

  const activeFilterCount = getActiveFilterCount(filterStore);

  const fetchHotels = () => {
    setLoading(true);
    setHasError(false);
    setPage(1);

    hotelsApi
      .searchHotelsPaginated(
        {
          query: searchStore.location,
          categories: filterStore.categories,
          minPrice: filterStore.priceRange[0],
          maxPrice: filterStore.priceRange[1],
          minRating: filterStore.minRating,
          amenities: filterStore.amenities,
          tonightOnly: filterStore.tonightOnly,
          sortBy: filterStore.sortBy,
        },
        1,
        6
      )
      .then((res) => {
        setData(res);
        setLoading(false);
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      })
      .catch(() => {
        setHasError(true);
        setLoading(false);
      });
  };

  // Fetch hotels whenever search/filter params change
  useEffect(() => {
    fetchHotels();
  }, [
    searchStore.location,
    searchStore.checkInDate,
    searchStore.checkOutDate,
    filterStore.categories,
    filterStore.priceRange,
    filterStore.minRating,
    filterStore.amenities,
    filterStore.tonightOnly,
    filterStore.sortBy,
  ]);

  // Load more pagination
  const handleLoadMore = async () => {
    if (!data?.hasMore || loadingMore || loading) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const res = await hotelsApi.searchHotelsPaginated(
        {
          query: searchStore.location,
          categories: filterStore.categories,
          minPrice: filterStore.priceRange[0],
          maxPrice: filterStore.priceRange[1],
          minRating: filterStore.minRating,
          amenities: filterStore.amenities,
          tonightOnly: filterStore.tonightOnly,
          sortBy: filterStore.sortBy,
        },
        nextPage,
        6
      );

      setData((prev) =>
        prev
          ? {
              ...res,
              hotels: [...prev.hotels, ...res.hotels.slice(prev.hotels.length)],
            }
          : res
      );
      setPage(nextPage);
    } finally {
      setLoadingMore(false);
    }
  };

  const currentSortLabel =
    SORT_OPTIONS.find((s) => s.key === filterStore.sortBy)?.label ?? 'Tövsiyə olunan';

  const totalGuests = searchStore.guests.adults + searchStore.guests.children;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 1. ScreenHeader */}
      <ScreenHeader
        title={az.search.resultsTitle}
        showBack={true}
        onBack={() => router.back()}
      />

      {/* 2. Search Summary Card */}
      <View style={styles.summaryCardWrapper}>
        <Card
          onPress={() => setLocationSheetVisible(true)}
          style={styles.summaryCard}
        >
          <View style={styles.summaryIconCol}>
            <Search size={18} color={colors.primary} />
          </View>

          <View style={styles.summaryTextCol}>
            <Text style={styles.summaryLocation} numberOfLines={1}>
              {searchStore.location}
            </Text>
            <Text style={styles.summaryDetails}>
              {formatDateRange(searchStore.checkInDate, searchStore.checkOutDate)} · {totalGuests} qonaq, {searchStore.guests.rooms} otaq
            </Text>
          </View>

          <IconButton
            icon={<SlidersHorizontal size={18} color={colors.textSecondary} />}
            variant="ghost"
            size={36}
            onPress={() => router.push('/filters')}
          />
        </Card>
      </View>

      {/* 3. Toolbar Row (Filters chip, Sort chip, Map shortcut) */}
      <View style={styles.toolbarRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.toolbarScroll}
        >
          {/* Filters Chip with active count badge */}
          <Chip
            label={az.filters.title}
            selected={activeFilterCount > 0}
            count={activeFilterCount > 0 ? activeFilterCount : undefined}
            icon={<Filter size={14} color={activeFilterCount > 0 ? colors.primary : colors.textSecondary} />}
            onPress={() => router.push('/filters')}
          />

          {/* Sort Chip */}
          <Chip
            label={currentSortLabel}
            selected={filterStore.sortBy !== 'recommended'}
            icon={<ArrowUpDown size={14} color={colors.primary} />}
            onPress={() => setSortSheetVisible(true)}
          />

          {/* Map Shortcut button */}
          <Chip
            label="Xəritə"
            icon={<Map size={14} color={colors.primary} />}
            onPress={() => router.push('/(tabs)/map')}
          />
        </ScrollView>
      </View>

      {/* 4. Results Count Header */}
      <View style={styles.resultsMetaHeader}>
        <Text style={styles.resultsCountText}>
          {data ? `${data.total} otel tapıldı` : 'Otellər axtarılır...'}
        </Text>
        <Text style={styles.resultsRadiusText}>Bakı mərkəzi · 15 km</Text>
      </View>

      {/* 5. Main Content: Skeleton, EmptyState, or FlatList */}
      {loading ? (
        <View style={styles.skeletonList}>
          <Skeleton height={270} borderRadius={radius.xl} />
          <Skeleton height={270} borderRadius={radius.xl} />
        </View>
      ) : hasError ? (
        <EmptyState
          icon={<AlertCircle size={32} color={colors.urgency} />}
          title="Məlumatlar yüklənmədi"
          description="Axtarış nəticələrini əldə etmək mümkün olmadı. İnternet bağlantısını yoxlayıb yenidən cəhd edin."
          actionTitle="Yenidən cəhd et"
          onActionPress={fetchHotels}
          style={styles.emptyContainer}
        />
      ) : !data || data.hotels.length === 0 ? (
        <EmptyState
          icon={<Search size={32} color={colors.primary} />}
          title="Uyğun otel tapılmadı"
          description="Axtarış filtrlərini dəyişərək və ya sıfırlayaraq yenidən cəhd edin."
          actionTitle="Filtrləri təmizlə"
          onActionPress={() => filterStore.resetFilters()}
          style={styles.emptyContainer}
        />
      ) : (
        <FlatList
          ref={flatListRef}
          data={data.hotels}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <HotelOfferCard hotel={item} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + spacing['2xl'] },
          ]}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <View style={styles.footerContainer}>
              {loadingMore && (
                <ActivityIndicator
                  size="small"
                  color={colors.primary}
                  style={styles.loadingMoreSpinner}
                />
              )}

              {/* View on Map Button */}
              <Button
                title="Xəritədə göstər"
                variant="secondary"
                icon={<Map size={18} color={colors.text} />}
                onPress={() => router.push('/(tabs)/map')}
                style={styles.mapBtn}
              />

              {/* Disclaimer from Figma */}
              <Text style={styles.disclaimerText}>
                Bütün qiymətlər bu gecə üçün keçərlidir və vergilər, bələdiyyə rüsumları daxildir.
              </Text>
            </View>
          }
        />
      )}

      {/* Sheets */}
      <LocationSearchSheet
        visible={locationSheetVisible}
        onClose={() => setLocationSheetVisible(false)}
      />

      <DateRangePickerSheet
        visible={dateSheetVisible}
        onClose={() => setDateSheetVisible(false)}
      />

      <GuestsRoomsPickerSheet
        visible={guestsSheetVisible}
        onClose={() => setGuestsSheetVisible(false)}
      />

      <SortBottomSheet
        visible={sortSheetVisible}
        onClose={() => setSortSheetVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  summaryCardWrapper: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  summaryIconCol: {
    marginRight: spacing.sm,
  },
  summaryTextCol: {
    flex: 1,
  },
  summaryLocation: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  summaryDetails: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  toolbarRow: {
    paddingVertical: spacing.sm,
  },
  toolbarScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  resultsMetaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  resultsCountText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  resultsRadiusText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  skeletonList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  footerContainer: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  loadingMoreSpinner: {
    marginBottom: spacing.md,
  },
  mapBtn: {
    marginBottom: spacing.md,
  },
  disclaimerText: {
    fontSize: 11,
    color: colors.disabledText,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: spacing.lg,
  },
});
