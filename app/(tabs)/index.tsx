import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  RefreshControl,
  Pressable,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/constants/theme';
import { Hotel } from '@/types/hotel';
import { hotelService } from '@/services/hotelService';
import { HotelCard } from '@/components/hotel/HotelCard';
import { HotelCardSkeleton } from '@/components/hotel/HotelCardSkeleton';
import { useTranslation } from 'react-i18next';

const ESTIMATED_ITEM_HEIGHT = 356;
const SEPARATOR_HEIGHT = 16;

type FilterKey = 'all' | 'cheapest' | 'topRated' | 'discounted' | 'breakfast' | 'pool';

interface FilterOption {
  id: FilterKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const FILTER_OPTIONS: FilterOption[] = [
  { id: 'all', label: 'Hamısı', icon: 'sparkles-outline' },
  { id: 'cheapest', label: 'Ən ucuz', icon: 'pricetag-outline' },
  { id: 'topRated', label: 'Ən yüksək reytinq', icon: 'star-outline' },
  { id: 'discounted', label: 'Endirimli', icon: 'trending-down-outline' },
  { id: 'breakfast', label: 'Səhər yeməyi', icon: 'cafe-outline' },
  { id: 'pool', label: 'Hovuz', icon: 'water-outline' },
];

export default function HomeScreen() {
  const { colors, fonts, radius, spacing, shadows } = useTheme();
  const { t } = useTranslation();

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchHotels = useCallback(async () => {
    setRefreshing(true);
    setError(null);

    try {
      const data = await hotelService.getHotels();
      setHotels(data);
    } catch {
      setError('Otelləri yükləmək mümkün olmadı.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    hotelService
      .getHotels()
      .then((data) => {
        if (isMounted) {
          setHotels(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Otelləri yükləmək mümkün olmadı.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const onRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetchHotels();
  };

  const handleFilterSelect = (filterId: FilterKey) => {
    Haptics.selectionAsync();
    setActiveFilter(filterId);
  };

  const handleClearFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveFilter('all');
    setSearchQuery('');
  };

  // Filter and sort list
  const filteredAndSortedHotels = useMemo(() => {
    let result = [...hotels];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.city.toLowerCase().includes(q) ||
          h.address.toLowerCase().includes(q)
      );
    }

    // Category / Sorting filter
    switch (activeFilter) {
      case 'cheapest':
        result.sort((a, b) => a.discountedPrice - b.discountedPrice);
        break;
      case 'topRated':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'discounted':
        result.sort((a, b) => b.discountPercent - a.discountPercent);
        break;
      case 'breakfast':
        result = result.filter((h) => h.amenities.includes('breakfast'));
        break;
      case 'pool':
        result = result.filter((h) => h.amenities.includes('pool'));
        break;
      case 'all':
      default:
        break;
    }

    return result;
  }, [hotels, activeFilter, searchQuery]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Greeting & Title */}
      <View style={styles.titleWrapper}>
        <Text
          style={[
            styles.greetingText,
            {
              color: colors.textSecondary,
              fontFamily: fonts.medium,
            },
          ]}>
          {t('home.greeting', 'Salam 👋')}
        </Text>
        <Text
          style={[
            styles.mainTitle,
            {
              color: colors.text,
              fontFamily: fonts.extraBold,
              marginTop: 2,
            },
          ]}>
          {t('home.title', 'Bu gecə hara?')}
        </Text>
      </View>

      {/* Interactive Search Bar */}
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.card,
          },
          shadows.soft,
        ]}>
        <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
        <TextInput
          accessibilityLabel="Otel axtarışı"
          style={[
            styles.searchInput,
            {
              color: colors.text,
              fontFamily: fonts.medium,
            },
          ]}
          placeholder={t('home.searchPlaceholder', 'Şəhər, otel və ya ərazi axtar...')}
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
        {searchQuery.length > 0 && Platform.OS !== 'ios' && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Axtarışı təmizlə"
            onPress={() => setSearchQuery('')}
            hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {/* Horizontal Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChipsScroll}
        style={styles.filterScrollView}>
        {FILTER_OPTIONS.map((item) => {
          const isSelected = activeFilter === item.id;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`Filtr: ${item.label}`}
              onPress={() => handleFilterSelect(item.id)}
              style={({ pressed }) => [
                styles.filterChip,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderRadius: radius.pill,
                  opacity: pressed ? 0.8 : 1,
                },
                isSelected ? shadows.soft : null,
              ]}>
              <Ionicons
                name={item.icon}
                size={15}
                color={isSelected ? '#FFFFFF' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color: isSelected ? '#FFFFFF' : colors.text,
                    fontFamily: isSelected ? fonts.bold : fonts.medium,
                  },
                ]}>
                {t('home.filters.' + item.id, item.label)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Results Count & Clear Row */}
      <View style={styles.resultsInfoRow}>
        <Text
          style={[
            styles.resultsCountText,
            { color: colors.textSecondary, fontFamily: fonts.semiBold },
          ]}>
          {filteredAndSortedHotels.length} {t('home.hotelsFound', 'otel tapıldı')}
        </Text>

        {(activeFilter !== 'all' || searchQuery.length > 0) && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Filtrləri sıfırla"
            onPress={handleClearFilters}
            style={({ pressed }) => [
              styles.clearFiltersBtn,
              { opacity: pressed ? 0.7 : 1 },
            ]}>
            <Ionicons name="refresh-outline" size={14} color={colors.primary} />
            <Text
              style={[
                styles.clearFiltersText,
                { color: colors.primary, fontFamily: fonts.semiBold },
              ]}>
              {t('home.clearFilter', 'Sıfırla')}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );

  const keyExtractor = useCallback((item: Hotel) => item.id, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ESTIMATED_ITEM_HEIGHT,
      offset: (ESTIMATED_ITEM_HEIGHT + SEPARATOR_HEIGHT) * index,
      index,
    }),
    []
  );

  const renderSeparator = useCallback(
    () => <View style={{ height: SEPARATOR_HEIGHT }} />,
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: Hotel }) => <HotelCard hotel={item} />,
    []
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top']}>
      {loading && !refreshing ? (
        // Skeleton Loading State with Header
        <View style={styles.scrollContent}>
          {renderHeader()}
          <View style={styles.skeletonList}>
            <HotelCardSkeleton />
            <HotelCardSkeleton />
            <HotelCardSkeleton />
          </View>
        </View>
      ) : error ? (
        // Error State
        <View style={styles.scrollContent}>
          {renderHeader()}
          <View
            style={[
              styles.errorCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.card,
              },
            ]}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.accent} />
            <Text
              style={[
                styles.errorTitle,
                { color: colors.text, fontFamily: fonts.bold },
              ]}>
              Xəta baş verdi
            </Text>
            <Text
              style={[
                styles.errorMessage,
                { color: colors.textSecondary, fontFamily: fonts.regular },
              ]}>
              {error}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Yenidən cəhd et"
              onPress={() => fetchHotels()}
              style={({ pressed }) => [
                styles.retryButton,
                {
                  backgroundColor: colors.primary,
                  borderRadius: radius.button,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}>
              <Ionicons name="refresh" size={18} color="#FFFFFF" />
              <Text style={[styles.retryText, { fontFamily: fonts.semiBold }]}>
                {t('errors.retry', 'Yenidən cəhd et')}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        // Hotels FlatList
        <FlatList
          data={filteredAndSortedHotels}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ItemSeparatorComponent={renderSeparator}
          ListHeaderComponent={renderHeader}
          getItemLayout={getItemLayout}
          maxToRenderPerBatch={5}
          windowSize={7}
          initialNumToRender={4}
          removeClippedSubviews={Platform.OS !== 'web'}
          contentContainerStyle={[
            styles.listContainer,
            { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View
              style={[
                styles.emptyContainer,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.card,
                },
              ]}>
              <Ionicons name="search" size={48} color={colors.textSecondary} />
              <Text
                style={[
                  styles.emptyTitle,
                  { color: colors.text, fontFamily: fonts.bold },
                ]}>
                {t('home.noHotelsFound', 'Otel tapılmadı')}
              </Text>
              <Text
                style={[
                  styles.emptySubtitle,
                  { color: colors.textSecondary, fontFamily: fonts.regular },
                ]}>
                {t('home.emptySubtitle', 'Axtarışınıza və ya seçilmiş filtrə uyğun otel tapılmadı.')}
              </Text>
              {(activeFilter !== 'all' || searchQuery.length > 0) && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Filtrləri təmizlə"
                  onPress={handleClearFilters}
                  style={[
                    styles.resetFilterBtn,
                    { backgroundColor: colors.primary, borderRadius: radius.button },
                  ]}>
                  <Text style={[styles.resetFilterText, { fontFamily: fonts.semiBold }]}>
                    {t('home.clearFilter', 'Filtrləri sıfırla')}
                  </Text>
                </Pressable>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    flex: 1,
  },
  listContainer: {},
  headerContainer: {
    paddingTop: 10,
    marginBottom: 16,
  },
  titleWrapper: {
    marginBottom: 14,
  },
  greetingText: {
    fontSize: 14,
  },
  mainTitle: {
    fontSize: 28,
    letterSpacing: -0.5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderWidth: 1,
    gap: 10,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  filterScrollView: {
    marginHorizontal: -16,
    marginBottom: 12,
  },
  filterChipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
  },
  resultsInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginTop: 4,
  },
  resultsCountText: {
    fontSize: 13,
  },
  clearFiltersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  clearFiltersText: {
    fontSize: 13,
  },
  skeletonList: {
    gap: 16,
    paddingBottom: 24,
  },
  errorCard: {
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 10,
  },
  errorTitle: {
    fontSize: 18,
    marginTop: 6,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  emptyContainer: {
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 16,
  },
  emptyTitle: {
    fontSize: 18,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  resetFilterBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 10,
  },
  resetFilterText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});
