import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ModalSheet } from '@/components/common/ModalSheet';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { useTheme } from '@/hooks/useTheme';
import { useSearchStore } from '@/store/searchStore';
import { SortOption, AmenityKey } from '@/types/hotel';
import { AMENITY_LIST } from '@/constants/amenities';

export type FilterSection = 'all' | 'sort' | 'price' | 'star' | 'amenities' | 'deals';

export interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  activeSection?: FilterSection;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  activeSection = 'all',
}) => {
  const { colors, typography, spacing } = useTheme();
  const { sort, filters, setSort, setFilters, resetFilters } = useSearchStore();

  const [localSort, setLocalSort] = useState<SortOption>(sort);
  const [selectedStars, setSelectedStars] = useState<number[]>(filters.starRatings || []);
  const [selectedAmenities, setSelectedAmenities] = useState<AmenityKey[]>(filters.amenities || []);
  const [priceRange, setPriceRange] = useState<[number | undefined, number | undefined]>([
    filters.minPrice,
    filters.maxPrice,
  ]);
  const [freeCancellation, setFreeCancellation] = useState<boolean>(filters.freeCancellationOnly);
  const [dealsOnly, setDealsOnly] = useState<boolean>(filters.dealsOnly);

  React.useEffect(() => {
    if (visible) {
      setLocalSort(sort);
      setSelectedStars(filters.starRatings || []);
      setSelectedAmenities(filters.amenities || []);
      setPriceRange([filters.minPrice, filters.maxPrice]);
      setFreeCancellation(filters.freeCancellationOnly);
      setDealsOnly(filters.dealsOnly);
    }
  }, [visible, sort, filters]);

  const toggleStar = (star: number) => {
    if (selectedStars.includes(star)) {
      setSelectedStars(selectedStars.filter((s) => s !== star));
    } else {
      setSelectedStars([...selectedStars, star]);
    }
  };

  const toggleAmenity = (key: AmenityKey) => {
    if (selectedAmenities.includes(key)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== key));
    } else {
      setSelectedAmenities([...selectedAmenities, key]);
    }
  };

  const handleApply = () => {
    setSort(localSort);
    setFilters({
      starRatings: selectedStars,
      amenities: selectedAmenities,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      freeCancellationOnly: freeCancellation,
      dealsOnly: dealsOnly,
    });
    onClose();
  };

  const handleReset = () => {
    resetFilters();
    setLocalSort('recommended');
    setSelectedStars([]);
    setSelectedAmenities([]);
    setPriceRange([undefined, undefined]);
    setFreeCancellation(false);
    setDealsOnly(false);
  };

  const SORT_OPTIONS: { key: SortOption; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'recommended', label: 'Tövsiyə olunan', icon: 'sparkles-outline' },
    { key: 'price_asc', label: 'Əvvəlcə ən ucuz', icon: 'arrow-down-outline' },
    { key: 'price_desc', label: 'Əvvəlcə ən baha', icon: 'arrow-up-outline' },
    { key: 'rating_desc', label: 'Ən yüksək reytinq', icon: 'star-outline' },
    { key: 'discount_desc', label: 'Ən böyük endirim', icon: 'flame-outline' },
  ];

  const PRICE_TIERS: { label: string; range: [number | undefined, number | undefined] }[] = [
    { label: 'Bütün qiymətlər', range: [undefined, undefined] },
    { label: '< 150 ₼', range: [undefined, 150] },
    { label: '150 - 250 ₼', range: [150, 250] },
    { label: '250 - 350 ₼', range: [250, 350] },
    { label: '> 350 ₼', range: [350, undefined] },
  ];

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      title="Filtr və Sıralama"
      subtitle="Zövqünüzə uyğun otelləri tapın"
      footer={
        <View style={styles.footerRow}>
          <Button
            title="Sıfırla"
            variant="ghost"
            onPress={handleReset}
            style={{ flex: 1, marginRight: 8 }}
          />
          <Button
            title="Tətbiq et"
            variant="primary"
            onPress={handleApply}
            style={{ flex: 2 }}
          />
        </View>
      }
    >
      {/* 1. Sıralama Bölməsi */}
      <View style={styles.section}>
        <Text style={[typography.heading, { color: colors.text, marginBottom: 12 }]}>
          Sıralama
        </Text>
        <View style={styles.sortList}>
          {SORT_OPTIONS.map((opt) => {
            const isSelected = localSort === opt.key;
            return (
              <Pressable
                key={opt.key}
                onPress={() => setLocalSort(opt.key)}
                style={[
                  styles.sortItem,
                  {
                    backgroundColor: isSelected ? colors.primaryTint : colors.surfaceAlt,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name={opt.icon}
                  size={18}
                  color={isSelected ? colors.primary : colors.textSecondary}
                  style={{ marginRight: 10 }}
                />
                <Text
                  style={[
                    typography.body,
                    {
                      color: isSelected ? colors.primary : colors.text,
                      fontWeight: isSelected ? '700' : '500',
                      flex: 1,
                    },
                  ]}
                >
                  {opt.label}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 2. Qiymət Aralığı */}
      <View style={styles.section}>
        <Text style={[typography.heading, { color: colors.text, marginBottom: 12 }]}>
          Qiymət (gecəlik)
        </Text>
        <View style={styles.wrapList}>
          {PRICE_TIERS.map((tier, idx) => {
            const isSelected =
              priceRange[0] === tier.range[0] && priceRange[1] === tier.range[1];
            return (
              <Chip
                key={idx}
                label={tier.label}
                selected={isSelected}
                onPress={() => setPriceRange(tier.range)}
              />
            );
          })}
        </View>
      </View>

      {/* 3. Ulduz Dərəcəsi */}
      <View style={styles.section}>
        <Text style={[typography.heading, { color: colors.text, marginBottom: 12 }]}>
          Ulduz dərəcəsi
        </Text>
        <View style={styles.wrapList}>
          {[5, 4, 3].map((star) => {
            const isSelected = selectedStars.includes(star);
            return (
              <Chip
                key={star}
                label={`${'★'.repeat(star)} (${star} ulduz)`}
                selected={isSelected}
                onPress={() => toggleStar(star)}
              />
            );
          })}
        </View>
      </View>

      {/* 4. Xüsusi Seçimlər */}
      <View style={styles.section}>
        <Text style={[typography.heading, { color: colors.text, marginBottom: 12 }]}>
          Xüsusi imtiyazlar
        </Text>

        <View
          style={[
            styles.switchRow,
            { borderColor: colors.border, backgroundColor: colors.surfaceAlt },
          ]}
        >
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={[typography.body, { color: colors.text, fontWeight: '700' }]}>
              Bu gecənin xüsusi təklifləri
            </Text>
            <Text style={[typography.micro, { color: colors.textSecondary, marginTop: 2 }]}>
              Yalnız ən yüksək endirimli və günün təklifi olan otellər
            </Text>
          </View>
          <Switch
            value={dealsOnly}
            onValueChange={setDealsOnly}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View
          style={[
            styles.switchRow,
            { borderColor: colors.border, backgroundColor: colors.surfaceAlt, marginTop: 10 },
          ]}
        >
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={[typography.body, { color: colors.text, fontWeight: '700' }]}>
              Pulsuz ləğvetmə
            </Text>
            <Text style={[typography.micro, { color: colors.textSecondary, marginTop: 2 }]}>
              Son ana qədər cəriməsiz ləğv edilə bilən rezervasiyalar
            </Text>
          </View>
          <Switch
            value={freeCancellation}
            onValueChange={setFreeCancellation}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* 5. Xidmətlər (Amenities) */}
      <View style={styles.section}>
        <Text style={[typography.heading, { color: colors.text, marginBottom: 12 }]}>
          Xidmətlər və şərait
        </Text>
        <View style={styles.wrapList}>
          {AMENITY_LIST.map((amenity) => {
            const isSelected = selectedAmenities.includes(amenity.key);
            return (
              <Chip
                key={amenity.key}
                label={amenity.shortLabel}
                icon={
                  <Ionicons
                    name={amenity.icon}
                    size={14}
                    color={isSelected ? colors.primary : colors.textSecondary}
                  />
                }
                selected={isSelected}
                onPress={() => toggleAmenity(amenity.key)}
              />
            );
          })}
        </View>
      </View>
    </ModalSheet>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sortList: {
    gap: 8,
  },
  sortItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  wrapList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default FilterModal;