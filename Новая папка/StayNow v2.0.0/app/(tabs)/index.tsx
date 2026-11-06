import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/hooks/useTheme';
import { useSearchStore } from '@/store/searchStore';
import { fetchHotelsPage } from '@/services/hotelService';
import { Hotel } from '@/types/hotel';
import {
  formatDateRange,
  formatGuests,
  toISODateString,
  nightsBetween,
  parseLocalDate,
} from '@/utils/format';

import { HotelCard } from '@/components/hotel/HotelCard';
import { HotelCardSkeleton } from '@/components/hotel/HotelCardSkeleton';
import { CitySelectModal } from '@/components/hotel/CitySelectModal';
import { DateGuestModal } from '@/components/hotel/DateGuestModal';
import { FilterModal, FilterSection } from '@/components/hotel/FilterModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { DailyDropBanner } from '@/components/hotel/DailyDropBanner';
import { HTCategoryFilter } from '@/components/hotel/HTCategoryFilter';
import { getHotelCategory } from '@/constants/theme';

export default function HomeScreen() {
  const { colors, typography, radius, shadows, isDark } = useTheme();
  const { t } = useTranslation();
  const {
    city,
    checkIn,
    checkOut,
    guests,
    sort,
    filters,
    setDates,
    resetFilters,
  } = useSearchStore();

  // Scroll position for sticky header shadow
  const [isScrolled, setIsScrolled] = useState(false);

  // Modals state
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [dateGuestModalVisible, setDateGuestModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilterSection, setActiveFilterSection] = useState<FilterSection>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // TanStack Infinite Query for hotels
  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: [
      'hotels',
      city,
      checkIn,
      checkOut,
      guests.adults,
      guests.children,
      sort,
      filters,
    ],
    queryFn: ({ pageParam = 1 }) =>
      fetchHotelsPage(
        {
          city,
          checkIn,
          checkOut,
          guests: guests.adults + guests.children,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          amenities: filters.amenities,
          starRatings: filters.starRatings,
          minRating: filters.minRating,
          freeCancellationOnly: filters.freeCancellationOnly,
          dealsOnly: filters.dealsOnly,
          sortBy: sort,
        },
        pageParam as number,
        10
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
  });

  const hotels = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) || [];
  }, [data]);

  const filteredHotels = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'ALL') return hotels;
    return hotels.filter((h) => {
      const cat = getHotelCategory(h);
      return cat.key === selectedCategory;
    });
  }, [hotels, selectedCategory]);

  const totalHotels = data?.pages?.[0]?.total ?? hotels.length;

  // Calculate nights
  const totalNights = useMemo(() => {
    return nightsBetween(checkIn, checkOut);
  }, [checkIn, checkOut]);

  // Sürətli tarix çiplərinin təyin olunması
  const now = new Date();
  const todayIso = toISODateString(now);
  const tomorrowIso = toISODateString(new Date(now.getTime() + 86400000));
  const dayAfterTomorrowIso = toISODateString(new Date(now.getTime() + 2 * 86400000));

  // Növbəti həftə sonu (Cümə - Bazar)
  const getWeekendDates = () => {
    const d = new Date(now);
    const day = d.getDay(); // 0 Bazar, 5 Cümə, 6 Şənbə
    const diffToFriday = (5 - day + 7) % 7 || 7;
    const friday = new Date(d.getTime() + diffToFriday * 86400000);
    const sunday = new Date(friday.getTime() + 2 * 86400000);
    return {
      start: toISODateString(friday),
      end: toISODateString(sunday),
    };
  };

  const weekend = useMemo(() => getWeekendDates(), []);

  // Quick chips active state checks
  const isTonight = checkIn === todayIso && checkOut === tomorrowIso;
  const isTomorrow = checkIn === tomorrowIso && checkOut === dayAfterTomorrowIso;
  const isWeekend = checkIn === weekend.start && checkOut === weekend.end;

  const handleQuickDate = (type: 'tonight' | 'tomorrow' | 'weekend' | 'custom') => {
    Haptics.selectionAsync();
    if (type === 'tonight') {
      setDates(todayIso, tomorrowIso);
    } else if (type === 'tomorrow') {
      setDates(tomorrowIso, dayAfterTomorrowIso);
    } else if (type === 'weekend') {
      setDates(weekend.start, weekend.end);
    } else {
      setDateGuestModalVisible(true);
    }
  };

  // Aktiv filtr sayğacları
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (sort !== 'recommended') count += 1;
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) count += 1;
    if (filters.starRatings && filters.starRatings.length > 0) count += 1;
    if (filters.amenities && filters.amenities.length > 0) count += 1;
    if (filters.dealsOnly) count += 1;
    if (filters.freeCancellationOnly) count += 1;
    return count;
  }, [sort, filters]);

  const openFilterModal = (section: FilterSection = 'all') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveFilterSection(section);
    setFilterModalVisible(true);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY > 10 && !isScrolled) {
      setIsScrolled(true);
    } else if (offsetY <= 10 && isScrolled) {
      setIsScrolled(false);
    }
  };

  // Header list component
  const renderListHeader = () => (
    <View>
      <DailyDropBanner />
      <View style={styles.listHeaderContainer}>
        <Text style={[typography.title, { color: colors.text }]}>
          {t('home.tonightOffers', 'Bu gecə üçün ən yaxşı təkliflər')}
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
          {isLoading
            ? 'Təkliflər axtarılır...'
            : `${filteredHotels.length} ${t('home.hotelsFound', 'otel tapıldı')} · ${city}`}
        </Text>
      </View>
    </View>
  );

  const renderHotelItem = useCallback(
    ({ item }: { item: Hotel }) => <HotelCard hotel={item} />,
    []
  );

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      {/* ═══ ÜST HİSSƏ (STICKY) ═══ */}
      <View
        style={[
          styles.stickyHeader,
          {
            backgroundColor: isDark ? colors.background : '#FFFFFF',
            borderBottomColor: colors.border,
            borderBottomWidth: isScrolled ? StyleSheet.hairlineWidth : 0,
          },
          isScrolled && shadows.soft,
        ]}
      >
        {/* Sol Üst: "Hara gedirik?" və Şəhər seçimi */}
        <View style={styles.cityRow}>
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              setCityModalVisible(true);
            }}
            hitSlop={8}
            style={styles.citySelector}
          >
            <Text style={[typography.micro, { color: colors.textSecondary }]}>
              Hara gedirik?
            </Text>
            <View style={styles.cityNameWithArrow}>
              <Text style={[typography.heading, { color: colors.text, fontSize: 20 }]}>
                {city}
              </Text>
              <Ionicons
                name="chevron-down"
                size={18}
                color={colors.primary}
                style={{ marginLeft: 4, marginTop: 2 }}
              />
            </View>
          </Pressable>

          {/* Sağ üst: Aktiv filtrləri açan düymə */}
          <Pressable
            onPress={() => openFilterModal('all')}
            hitSlop={8}
            style={[
              styles.filterPillBtn,
              {
                backgroundColor: activeFiltersCount > 0 ? colors.primaryTint : colors.surfaceAlt,
                borderColor: activeFiltersCount > 0 ? colors.primary : colors.border,
              },
            ]}
          >
            <Ionicons
              name="options-outline"
              size={18}
              color={activeFiltersCount > 0 ? colors.primary : colors.text}
            />
            {activeFiltersCount > 0 && (
              <View style={[styles.filterBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Axtarış Xülasə Pill-i */}
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            setDateGuestModalVisible(true);
          }}
          style={({ pressed }) => [
            styles.summaryPill,
            {
              backgroundColor: pressed ? colors.border : colors.surfaceAlt,
              borderColor: colors.border,
              borderRadius: radius.pill,
            },
          ]}
        >
          <View style={[styles.pillIconBox, { backgroundColor: colors.primaryTint }]}>
            <Ionicons name="calendar" size={16} color={colors.primary} />
          </View>
          <Text
            style={[
              typography.caption,
              { color: colors.text, fontWeight: '700', flex: 1 },
            ]}
            numberOfLines={1}
          >
            {formatDateRange(checkIn, checkOut)} · {totalNights} gecə ·{' '}
            {formatGuests(guests.adults, guests.children)}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </Pressable>

        {/* Sürətli Tarix Çipləri */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickChipsContent}
          style={styles.quickChipsScrollView}
        >
          <Pressable
            onPress={() => handleQuickDate('tonight')}
            style={[
              styles.quickChip,
              {
                backgroundColor: isTonight ? colors.primaryTint : 'transparent',
                borderColor: isTonight ? colors.primary : colors.border,
                borderRadius: radius.pill,
              },
            ]}
          >
            <Text
              style={[
                typography.caption,
                {
                  color: isTonight ? colors.primary : colors.textSecondary,
                  fontWeight: isTonight ? '700' : '500',
                },
              ]}
            >
              {t('home.quickDates.tonight', 'Bu gecə')}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleQuickDate('tomorrow')}
            style={[
              styles.quickChip,
              {
                backgroundColor: isTomorrow ? colors.primaryTint : 'transparent',
                borderColor: isTomorrow ? colors.primary : colors.border,
                borderRadius: radius.pill,
              },
            ]}
          >
            <Text
              style={[
                typography.caption,
                {
                  color: isTomorrow ? colors.primary : colors.textSecondary,
                  fontWeight: isTomorrow ? '700' : '500',
                },
              ]}
            >
              {t('home.quickDates.tomorrow', 'Sabah')}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleQuickDate('weekend')}
            style={[
              styles.quickChip,
              {
                backgroundColor: isWeekend ? colors.primaryTint : 'transparent',
                borderColor: isWeekend ? colors.primary : colors.border,
                borderRadius: radius.pill,
              },
            ]}
          >
            <Text
              style={[
                typography.caption,
                {
                  color: isWeekend ? colors.primary : colors.textSecondary,
                  fontWeight: isWeekend ? '700' : '500',
                },
              ]}
            >
              {t('home.quickDates.weekend', 'Həftə sonu')}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => handleQuickDate('custom')}
            style={[
              styles.quickChip,
              {
                backgroundColor: !isTonight && !isTomorrow && !isWeekend
                  ? colors.primaryTint
                  : 'transparent',
                borderColor: !isTonight && !isTomorrow && !isWeekend
                  ? colors.primary
                  : colors.border,
                borderRadius: radius.pill,
              },
            ]}
          >
            <Ionicons
              name="calendar-outline"
              size={13}
              color={
                !isTonight && !isTomorrow && !isWeekend
                  ? colors.primary
                  : colors.textSecondary
              }
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                typography.caption,
                {
                  color: !isTonight && !isTomorrow && !isWeekend
                    ? colors.primary
                    : colors.textSecondary,
                  fontWeight: !isTonight && !isTomorrow && !isWeekend
                    ? '700'
                    : '500',
                },
              ]}
            >
              {t('home.quickDates.selectDate', 'Tarix seç')}
            </Text>
          </Pressable>
        </ScrollView>

        {/* HotelTonight Kateqoriyaları (Luxe, Hip, Solid, Basic, Charming...) */}
        <HTCategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Filtr Çipləri Sırası */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterChipsContent}
          style={styles.filterChipsScrollView}
        >
          {/* Sırala */}
          <Pressable
            onPress={() => openFilterModal('sort')}
            style={[
              styles.filterChip,
              {
                backgroundColor: sort !== 'recommended' ? colors.primaryTint : colors.surfaceAlt,
                borderColor: sort !== 'recommended' ? colors.primary : colors.border,
                borderRadius: radius.pill,
              },
            ]}
          >
            <Ionicons
              name="swap-vertical"
              size={14}
              color={sort !== 'recommended' ? colors.primary : colors.textSecondary}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                typography.caption,
                {
                  color: sort !== 'recommended' ? colors.primary : colors.text,
                  fontWeight: sort !== 'recommended' ? '700' : '500',
                },
              ]}
            >
              {t('home.filterLabels.sort', 'Sırala')}
            </Text>
          </Pressable>

          {/* Qiymət */}
          <Pressable
            onPress={() => openFilterModal('price')}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  filters.minPrice !== undefined || filters.maxPrice !== undefined
                    ? colors.primaryTint
                    : colors.surfaceAlt,
                borderColor:
                  filters.minPrice !== undefined || filters.maxPrice !== undefined
                    ? colors.primary
                    : colors.border,
                borderRadius: radius.pill,
              },
            ]}
          >
            <Text
              style={[
                typography.caption,
                {
                  color:
                    filters.minPrice !== undefined || filters.maxPrice !== undefined
                      ? colors.primary
                      : colors.text,
                  fontWeight:
                    filters.minPrice !== undefined || filters.maxPrice !== undefined
                      ? '700'
                      : '500',
                },
              ]}
            >
              {t('home.filterLabels.price', 'Qiymət')}
            </Text>
          </Pressable>

          {/* Ulduz */}
          <Pressable
            onPress={() => openFilterModal('star')}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  filters.starRatings && filters.starRatings.length > 0
                    ? colors.primaryTint
                    : colors.surfaceAlt,
                borderColor:
                  filters.starRatings && filters.starRatings.length > 0
                    ? colors.primary
                    : colors.border,
                borderRadius: radius.pill,
              },
            ]}
          >
            <Text
              style={[
                typography.caption,
                {
                  color:
                    filters.starRatings && filters.starRatings.length > 0
                      ? colors.primary
                      : colors.text,
                  fontWeight:
                    filters.starRatings && filters.starRatings.length > 0
                      ? '700'
                      : '500',
                },
              ]}
            >
              {t('home.filterLabels.stars', 'Ulduz')}
            </Text>
            {filters.starRatings && filters.starRatings.length > 0 && (
              <View style={[styles.microBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.microBadgeText}>{filters.starRatings.length}</Text>
              </View>
            )}
          </Pressable>

          {/* Xidmətlər */}
          <Pressable
            onPress={() => openFilterModal('amenities')}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  filters.amenities && filters.amenities.length > 0
                    ? colors.primaryTint
                    : colors.surfaceAlt,
                borderColor:
                  filters.amenities && filters.amenities.length > 0
                    ? colors.primary
                    : colors.border,
                borderRadius: radius.pill,
              },
            ]}
          >
            <Text
              style={[
                typography.caption,
                {
                  color:
                    filters.amenities && filters.amenities.length > 0
                      ? colors.primary
                      : colors.text,
                  fontWeight:
                    filters.amenities && filters.amenities.length > 0
                      ? '700'
                      : '500',
                },
              ]}
            >
              {t('home.filterLabels.amenities', 'Xidmətlər')}
            </Text>
            {filters.amenities && filters.amenities.length > 0 && (
              <View style={[styles.microBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.microBadgeText}>{filters.amenities.length}</Text>
              </View>
            )}
          </Pressable>

          {/* Endirimli */}
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              useSearchStore.getState().setFilters({ dealsOnly: !filters.dealsOnly });
            }}
            style={[
              styles.filterChip,
              {
                backgroundColor: filters.dealsOnly ? colors.primaryTint : colors.surfaceAlt,
                borderColor: filters.dealsOnly ? colors.primary : colors.border,
                borderRadius: radius.pill,
              },
            ]}
          >
            <Ionicons
              name="flame"
              size={13}
              color={filters.dealsOnly ? colors.urgency : colors.textSecondary}
              style={{ marginRight: 3 }}
            />
            <Text
              style={[
                typography.caption,
                {
                  color: filters.dealsOnly ? colors.primary : colors.text,
                  fontWeight: filters.dealsOnly ? '700' : '500',
                },
              ]}
            >
              {t('home.filterLabels.discounted', 'Endirimli')}
            </Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* ═══ SİYAHI (FLATLIST) ═══ */}
      {isLoading ? (
        <ScrollView contentContainerStyle={styles.loadingContainer}>
          {renderListHeader()}
          <HotelCardSkeleton />
          <HotelCardSkeleton />
          <HotelCardSkeleton />
        </ScrollView>
      ) : isError ? (
        <View style={styles.centerContainer}>
          <EmptyState
            icon="alert-circle-outline"
            title="Xəta baş verdi"
            description="Otellər siyahısı yüklənərkən problem yarandı. Zəhmət olmasa yenidən cəhd edin."
            actionTitle="Yenidən yoxla"
            onAction={() => refetch()}
          />
        </View>
      ) : filteredHotels.length === 0 ? (
        <View style={styles.centerContainer}>
          <EmptyState
            icon="search-outline"
            title="Heç bir otel tapılmadı"
            description="Seçilmiş kateqoriya və ya filtr parametrlərinə uyğun otel tapılmadı. Filtrləri sıfırlayaraq yenidən yoxlayın."
            actionTitle="Filtrləri təmizlə"
            onAction={() => {
              setSelectedCategory(null);
              resetFilters();
            }}
          />
        </View>
      ) : (
        <FlatList
          data={filteredHotels}
          keyExtractor={(item) => item.id}
          renderItem={renderHotelItem}
          ListHeaderComponent={renderListHeader}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={{ paddingVertical: 16 }}>
                <HotelCardSkeleton />
              </View>
            ) : undefined
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          windowSize={5}
          removeClippedSubviews={true}
          refreshing={isRefetching}
          onRefresh={refetch}
        />
      )}

      {/* ═══ MODALLAR ═══ */}
      <CitySelectModal
        visible={cityModalVisible}
        onClose={() => setCityModalVisible(false)}
      />

      <DateGuestModal
        visible={dateGuestModalVisible}
        onClose={() => setDateGuestModalVisible(false)}
      />

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        activeSection={activeFilterSection}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  stickyHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    zIndex: 10,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  citySelector: {
    flex: 1,
  },
  cityNameWithArrow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterPillBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  summaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  pillIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  quickChipsScrollView: {
    marginBottom: 8,
  },
  quickChipsContent: {
    gap: 8,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1.5,
  },
  filterChipsScrollView: {},
  filterChipsContent: {
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderWidth: 1,
  },
  microBadge: {
    marginLeft: 5,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  microBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  listHeaderContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  listContent: {
    paddingBottom: 32,
  },
  loadingContainer: {
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});