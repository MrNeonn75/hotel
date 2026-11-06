import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Car,
  Coffee,
  Dumbbell,
  Sparkles,
  Utensils,
  Waves,
  Wifi,
  Wind,
  X,
} from 'lucide-react-native';
import {
  Button,
  Card,
  Checkbox,
  Chip,
  Divider,
  IconButton,
  Input,
  SectionHeading,
} from '@/components/ui';
import {
  getActiveFilterCount,
  initialFilterState,
  useFilterStore,
} from '@/store/filterStore';
import { hotelsApi } from '@/services/hotelsApi';
import { AmenityKey, FilterState, HotelCategory } from '@/types/hotel';
import { colors, radius, spacing, typography } from '@/theme';
import { az } from '@/i18n/az';

const AMENITY_ITEMS: { key: AmenityKey; label: string; icon: React.ReactNode }[] = [
  { key: 'wifi', label: 'Pulsuz Wi-Fi', icon: <Wifi size={18} color={colors.primary} /> },
  { key: 'breakfast', label: 'Səhər yeməyi', icon: <Coffee size={18} color={colors.primary} /> },
  { key: 'pool', label: 'Hovuz', icon: <Waves size={18} color={colors.primary} /> },
  { key: 'parking', label: 'Parkinq yeri', icon: <Car size={18} color={colors.primary} /> },
  { key: 'gym', label: 'Fitnes / Trenajor zalı', icon: <Dumbbell size={18} color={colors.primary} /> },
  { key: 'spa', label: 'SPA və Masaj', icon: <Sparkles size={18} color={colors.primary} /> },
  { key: 'ac', label: 'Kondisioner', icon: <Wind size={18} color={colors.primary} /> },
  { key: 'restaurant', label: 'Restoran', icon: <Utensils size={18} color={colors.primary} /> },
];

const RATING_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: 'Hamısı' },
  { value: 7, label: '7+' },
  { value: 8, label: '8+' },
  { value: 9, label: '9+' },
];

const CATEGORY_OPTIONS: HotelCategory[] = ['Butik', 'Biznes', 'Lüks', 'Büdcə'];

export default function FiltersModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const filterStore = useFilterStore();

  // Local draft state so changes are only applied when user confirms
  const [draft, setDraft] = useState<FilterState>({
    priceRange: [filterStore.priceRange[0], filterStore.priceRange[1]],
    minRating: filterStore.minRating,
    amenities: [...filterStore.amenities],
    categories: [...filterStore.categories],
    tonightOnly: filterStore.tonightOnly,
    sortBy: filterStore.sortBy,
  });

  const [matchingCount, setMatchingCount] = useState<number>(12);

  // Live count matching hotels whenever draft changes
  useEffect(() => {
    let isCurrent = true;
    hotelsApi
      .countMatchingHotels({
        minPrice: draft.priceRange[0],
        maxPrice: draft.priceRange[1],
        minRating: draft.minRating,
        amenities: draft.amenities,
        categories: draft.categories,
        tonightOnly: draft.tonightOnly,
      })
      .then((count) => {
        if (isCurrent) setMatchingCount(count);
      });

    return () => {
      isCurrent = false;
    };
  }, [draft]);

  const activeCount = getActiveFilterCount(draft);

  const handleReset = () => {
    setDraft({ ...initialFilterState });
  };

  const handleApply = () => {
    filterStore.setFilterState(draft);
    router.back();
  };

  const toggleAmenity = (key: AmenityKey) => {
    setDraft((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(key)
        ? prev.amenities.filter((a) => a !== key)
        : [...prev.amenities, key],
    }));
  };

  const toggleCategory = (cat: HotelCategory) => {
    setDraft((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  // Quick price preset handler
  const setQuickPrice = (min: number, max: number) => {
    setDraft((prev) => ({ ...prev, priceRange: [min, max] }));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon={<X size={22} color={colors.text} />}
          variant="ghost"
          size={40}
          onPress={() => router.back()}
        />
        <Text style={styles.headerTitle}>{az.filters.title}</Text>
        <Pressable onPress={handleReset} hitSlop={10}>
          <Text style={styles.resetText}>{az.common.reset}</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 95 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Price Range Section */}
        <SectionHeading title={az.filters.priceRange} />
        <Text style={styles.sectionSubtitle}>
          1 gecə üçün qiymət aralığı (bütün vergilər daxildir)
        </Text>

        <View style={styles.priceInputsRow}>
          <View style={styles.priceInputBox}>
            <Text style={styles.priceInputLabel}>Minimum</Text>
            <View style={styles.priceInputInner}>
              <Text style={styles.currencyPrefix}>₼</Text>
              <Text style={styles.priceInputValue}>{draft.priceRange[0]}</Text>
            </View>
          </View>

          <View style={styles.priceDash} />

          <View style={styles.priceInputBox}>
            <Text style={styles.priceInputLabel}>Maksimum</Text>
            <View style={styles.priceInputInner}>
              <Text style={styles.currencyPrefix}>₼</Text>
              <Text style={styles.priceInputValue}>{draft.priceRange[1]}</Text>
            </View>
          </View>
        </View>

        {/* Visual Range Slider Bar with adjustable presets */}
        <View style={styles.sliderTrackWrapper}>
          <View style={styles.sliderTrack}>
            <View
              style={[
                styles.sliderHighlight,
                {
                  left: `${((draft.priceRange[0] - 50) / 550) * 100}%`,
                  right: `${100 - ((draft.priceRange[1] - 50) / 550) * 100}%`,
                },
              ]}
            />
          </View>
          <View
            style={[
              styles.sliderThumb,
              { left: `${((draft.priceRange[0] - 50) / 550) * 88}%` },
            ]}
          />
          <View
            style={[
              styles.sliderThumb,
              { left: `${((draft.priceRange[1] - 50) / 550) * 88 + 8}%` },
            ]}
          />
        </View>

        {/* Quick price chips */}
        <View style={styles.quickPriceChips}>
          <Chip
            label="Hamısı"
            selected={draft.priceRange[0] === 50 && draft.priceRange[1] === 600}
            onPress={() => setQuickPrice(50, 600)}
          />
          <Chip
            label="< 150 ₼"
            selected={draft.priceRange[0] === 50 && draft.priceRange[1] === 150}
            onPress={() => setQuickPrice(50, 150)}
          />
          <Chip
            label="150 — 300 ₼"
            selected={draft.priceRange[0] === 150 && draft.priceRange[1] === 300}
            onPress={() => setQuickPrice(150, 300)}
          />
          <Chip
            label="300 ₼ +"
            selected={draft.priceRange[0] === 300 && draft.priceRange[1] === 600}
            onPress={() => setQuickPrice(300, 600)}
          />
        </View>

        <Divider marginVertical="lg" />

        {/* 2. Guest Rating Section */}
        <SectionHeading title={az.filters.rating} />
        <Text style={styles.sectionSubtitle}>
          Qonaqların real rəyləri əsasında minimum qiymətləndirmə
        </Text>
        <View style={styles.chipRow}>
          {RATING_OPTIONS.map((opt, i) => (
            <Chip
              key={i}
              label={opt.label}
              selected={draft.minRating === opt.value}
              onPress={() => setDraft((p) => ({ ...p, minRating: opt.value }))}
            />
          ))}
        </View>

        <Divider marginVertical="lg" />

        {/* 3. Amenities Section */}
        <SectionHeading title={az.filters.amenities} />
        <Card style={styles.checkboxCard}>
          {AMENITY_ITEMS.map((item, index) => (
            <React.Fragment key={item.key}>
              <View style={styles.amenityRow}>
                <View style={styles.amenityIconCol}>{item.icon}</View>
                <View style={styles.amenityCheckboxCol}>
                  <Checkbox
                    label={item.label}
                    checked={draft.amenities.includes(item.key)}
                    onValueChange={() => toggleAmenity(item.key)}
                  />
                </View>
              </View>
              {index < AMENITY_ITEMS.length - 1 && <Divider marginVertical="xs" />}
            </React.Fragment>
          ))}
        </Card>

        <Divider marginVertical="lg" />

        {/* 4. Hotel Style / Category Section */}
        <SectionHeading title="Otel Üslubu" />
        <View style={styles.chipRow}>
          {CATEGORY_OPTIONS.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              selected={draft.categories.includes(cat)}
              onPress={() => toggleCategory(cat)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom + spacing.md },
        ]}
      >
        <View style={styles.bottomInfoRow}>
          <Text style={styles.activeFilterCountText}>
            {activeCount > 0 ? `${activeCount} aktiv filtr` : 'Filtr tətbiq edilməyib'}
          </Text>
        </View>

        <Button
          title={`Nəticələri göstər (${matchingCount})`}
          variant="primary"
          onPress={handleApply}
        />
      </View>
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
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  resetText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.primary,
    paddingHorizontal: spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  priceInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  priceInputBox: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  priceInputLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  priceInputInner: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  currencyPrefix: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  priceInputValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  priceDash: {
    width: 14,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  sliderTrackWrapper: {
    height: 30,
    justifyContent: 'center',
    position: 'relative',
    marginVertical: spacing.xs,
  },
  sliderTrack: {
    height: 6,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: radius.pill,
    position: 'relative',
  },
  sliderHighlight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: colors.brand,
    borderRadius: radius.pill,
  },
  sliderThumb: {
    position: 'absolute',
    top: 3,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.brand,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  quickPriceChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  checkboxCard: {
    padding: spacing.md,
  },
  amenityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  amenityIconCol: {
    marginRight: spacing.sm,
  },
  amenityCheckboxCol: {
    flex: 1,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  bottomInfoRow: {
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  activeFilterCountText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
});
