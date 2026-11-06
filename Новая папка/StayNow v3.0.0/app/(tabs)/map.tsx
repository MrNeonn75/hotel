import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import {
  AlertTriangle,
  Filter,
  LocateFixed,
  MapPin,
  RotateCw,
  Search,
  SlidersHorizontal,
} from 'lucide-react-native';
import {
  Button,
  Card,
  Chip,
  IconButton,
  ScreenHeader,
  Toast,
} from '@/components/ui';
import { HotelPricePin, MapSelectedHotelCard } from '@/components/hotel';
import {
  DateRangePickerSheet,
  GuestsRoomsPickerSheet,
  LocationSearchSheet,
} from '@/components/search';
import { GOOGLE_MAPS_API_KEY } from '@/config/maps';
import { darkMapStyle } from '@/config/mapStyle';
import { getActiveFilterCount, useFilterStore } from '@/store/filterStore';
import { useSearchStore } from '@/store';
import { useHotelsQuery } from '@/services/queries';
import { Hotel } from '@/types/hotel';
import { formatDateRange } from '@/utils/format';
import { az } from '@/i18n/az';
import { colors, radius, shadows, spacing, typography } from '@/theme';

// Central Baku Coordinates
const BAKU_INITIAL_REGION: Region = {
  latitude: 40.3705,
  longitude: 49.843,
  latitudeDelta: 0.055,
  longitudeDelta: 0.055,
};

export default function MapTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const searchStore = useSearchStore();
  const filterStore = useFilterStore();
  const { data: allHotels, isLoading } = useHotelsQuery();

  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [hasMovedRegion, setHasMovedRegion] = useState(false);
  const [locatingUser, setLocatingUser] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [forceShowMap, setForceShowMap] = useState(false);

  // Sheets
  const [locationSheetVisible, setLocationSheetVisible] = useState(false);
  const [dateSheetVisible, setDateSheetVisible] = useState(false);
  const [guestsSheetVisible, setGuestsSheetVisible] = useState(false);

  // Animation for bottom card
  const cardSlideAnim = useRef(new Animated.Value(180)).current;

  const isMapsKeyConfigured = useMemo(() => {
    return (
      GOOGLE_MAPS_API_KEY &&
      GOOGLE_MAPS_API_KEY.trim() !== '' &&
      GOOGLE_MAPS_API_KEY !== 'BURAYA_API_ACARINI_YAZ'
    );
  }, []);

  const activeFilterCount = getActiveFilterCount(filterStore);

  // Filter hotels based on active filters in store
  const filteredHotels = useMemo(() => {
    if (!allHotels) return [];
    return allHotels.filter((hotel) => {
      // Category filter
      if (
        filterStore.categories.length > 0 &&
        !filterStore.categories.includes(hotel.category)
      ) {
        return false;
      }
      // Price range
      if (
        hotel.discountedPrice < filterStore.priceRange[0] ||
        hotel.discountedPrice > filterStore.priceRange[1]
      ) {
        return false;
      }
      // Rating filter
      if (filterStore.minRating !== null) {
        const threshold =
          filterStore.minRating > 5
            ? filterStore.minRating / 2
            : filterStore.minRating;
        if (hotel.rating < threshold) return false;
      }
      // Amenities filter
      if (
        filterStore.amenities.length > 0 &&
        !filterStore.amenities.every((a) => hotel.amenities.includes(a))
      ) {
        return false;
      }
      // Tonight only
      if (filterStore.tonightOnly && !hotel.isTonightOffer) {
        return false;
      }
      return true;
    });
  }, [allHotels, filterStore]);

  // Fit to coordinates on initial load or filter change
  useEffect(() => {
    if (filteredHotels.length > 0 && mapRef.current) {
      const coords = filteredHotels.map((h) => h.coordinates);
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 180, right: 50, bottom: 220, left: 50 },
        animated: true,
      });
    }
  }, [filteredHotels]);

  // Animate selected hotel card
  useEffect(() => {
    if (selectedHotel) {
      Animated.spring(cardSlideAnim, {
        toValue: 0,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(cardSlideAnim, {
        toValue: 180,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedHotel, cardSlideAnim]);

  const handleMarkerPress = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    mapRef.current?.animateToRegion(
      {
        latitude: hotel.coordinates.latitude - 0.005,
        longitude: hotel.coordinates.longitude,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      },
      300
    );
  };

  const handleMapPress = () => {
    if (selectedHotel) {
      setSelectedHotel(null);
    }
  };

  const handleRegionChangeComplete = () => {
    setHasMovedRegion(true);
  };

  const handleSearchThisArea = () => {
    setHasMovedRegion(false);
    // Refresh or re-fit
    if (filteredHotels.length > 0) {
      mapRef.current?.fitToCoordinates(
        filteredHotels.map((h) => h.coordinates),
        {
          edgePadding: { top: 160, right: 40, bottom: 200, left: 40 },
          animated: true,
        }
      );
    }
  };

  const handleLocateUser = async () => {
    try {
      setLocatingUser(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showToast('Məkan icazəsi verilmədi. Tənzimləmələrdən aktivləşdirin.');
        setLocatingUser(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (position && mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          },
          500
        );
      }
    } catch {
      showToast('Cari koordinatlar əldə edilmədi.');
    } finally {
      setLocatingUser(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const totalGuests = searchStore.guests.adults + searchStore.guests.children;

  return (
    <View style={styles.container}>
      {/* 1. Header (fixed on top) */}
      <View style={[styles.headerOverlay, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Xəritə</Text>
          <Pressable
            onPress={() => router.push('/search/results')}
            hitSlop={8}
            style={styles.headerActionBtn}
          >
            <Text style={styles.headerActionText}>Siyahı</Text>
          </Pressable>
        </View>

        {/* Search Summary Card */}
        <Card
          onPress={() => setLocationSheetVisible(true)}
          style={styles.summaryCard}
        >
          <View style={styles.summaryIcon}>
            <Search size={16} color={colors.primary} />
          </View>
          <View style={styles.summaryTextWrapper}>
            <Text style={styles.summaryLocation} numberOfLines={1}>
              {searchStore.location}
            </Text>
            <Text style={styles.summaryDates}>
              {formatDateRange(searchStore.checkInDate, searchStore.checkOutDate)} · {totalGuests} qonaq, {searchStore.guests.rooms} otaq
            </Text>
          </View>
          <IconButton
            icon={<SlidersHorizontal size={16} color={colors.textSecondary} />}
            variant="ghost"
            size={32}
            onPress={() => router.push('/filters')}
          />
        </Card>

        {/* Floating action row: "Bu ərazidə axtar" and "Filtrlər" */}
        <View style={styles.floatingChipsRow}>
          {hasMovedRegion && (
            <Chip
              label="Bu ərazidə axtar"
              icon={<RotateCw size={13} color={colors.primary} />}
              selected={true}
              onPress={handleSearchThisArea}
              style={styles.floatingChip}
            />
          )}

          <Chip
            label={az.filters.title}
            selected={activeFilterCount > 0}
            count={activeFilterCount > 0 ? activeFilterCount : undefined}
            icon={<Filter size={13} color={activeFilterCount > 0 ? colors.primary : colors.textSecondary} />}
            onPress={() => router.push('/filters')}
            style={styles.floatingChip}
          />
        </View>
      </View>

      {/* 2. Map Canvas or Fallback UI */}
      {!isMapsKeyConfigured && !forceShowMap ? (
        <View style={styles.fallbackContainer}>
          <Card style={styles.fallbackCard}>
            <View style={styles.warningCircle}>
              <AlertTriangle size={36} color={colors.urgency} />
            </View>
            <Text style={styles.fallbackTitle}>Google Maps Açarı Əlavə Olunmayıb</Text>
            <Text style={styles.fallbackDesc}>
              Xəritənin tam işləməsi üçün Google Maps API açarınızı{' '}
              <Text style={styles.codeHighlight}>src/config/maps.ts</Text> faylındakı{' '}
              <Text style={styles.codeHighlight}>GOOGLE_MAPS_API_KEY</Text> sahəsinə yazın.
            </Text>
            <Button
              title="Xəritəni Yenə də Göstər"
              variant="secondary"
              onPress={() => setForceShowMap(true)}
              style={styles.fallbackBtn}
            />
            <Button
              title="Siyahı Görünüşünə Keç"
              variant="primary"
              onPress={() => router.push('/search/results')}
            />
          </Card>
        </View>
      ) : (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFill}
          initialRegion={BAKU_INITIAL_REGION}
          customMapStyle={darkMapStyle}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={false}
          onPress={handleMapPress}
          onRegionChangeComplete={handleRegionChangeComplete}
        >
          {filteredHotels.map((hotel) => {
            const isSelected = selectedHotel?.id === hotel.id;
            return (
              <Marker
                key={hotel.id}
                coordinate={hotel.coordinates}
                onPress={() => handleMarkerPress(hotel)}
                tracksViewChanges={false}
                zIndex={isSelected ? 999 : 1}
              >
                <HotelPricePin
                  price={hotel.discountedPrice}
                  isSelected={isSelected}
                />
              </Marker>
            );
          })}
        </MapView>
      )}

      {/* 3. Floating User Location Button (44px circular) */}
      <View style={[styles.locateBtnWrapper, { bottom: selectedHotel ? 190 : 24 }]}>
        <Pressable
          onPress={handleLocateUser}
          disabled={locatingUser}
          style={({ pressed }) => [
            styles.locateCircleBtn,
            pressed && styles.locateCirclePressed,
          ]}
        >
          {locatingUser ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <LocateFixed size={20} color={colors.primary} />
          )}
        </Pressable>
      </View>

      {/* 4. Selected Hotel Bottom Floating Card */}
      {selectedHotel && (
        <Animated.View
          style={[
            styles.selectedCardWrapper,
            { transform: [{ translateY: cardSlideAnim }] },
          ]}
        >
          <MapSelectedHotelCard hotel={selectedHotel} />
        </Animated.View>
      )}

      {/* Toast message if any */}
      {toastMessage && (
        <View style={[styles.toastContainer, { top: insets.top + 130 }]}>
          <Toast type="info" message={toastMessage} />
        </View>
      )}

      {/* Search Sheets */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    position: 'relative',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  headerActionBtn: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerActionText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
    backgroundColor: 'rgba(26, 25, 38, 0.94)',
    borderColor: colors.borderLight,
    ...shadows.md,
  },
  summaryIcon: {
    marginRight: spacing.sm,
  },
  summaryTextWrapper: {
    flex: 1,
  },
  summaryLocation: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  summaryDates: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  floatingChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  floatingChip: {
    backgroundColor: 'rgba(26, 25, 38, 0.92)',
    ...shadows.md,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  fallbackCard: {
    padding: spacing.xl,
    alignItems: 'center',
    textAlign: 'center',
  },
  warningCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.urgencyTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  fallbackTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  fallbackDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  codeHighlight: {
    color: colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: typography.fontWeight.bold,
  },
  fallbackBtn: {
    marginBottom: spacing.sm,
    width: '100%',
  },
  locateBtnWrapper: {
    position: 'absolute',
    right: spacing.lg,
    zIndex: 10,
  },
  locateCircleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  locateCirclePressed: {
    backgroundColor: colors.surfaceHighlight,
  },
  selectedCardWrapper: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  toastContainer: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 30,
  },
});
