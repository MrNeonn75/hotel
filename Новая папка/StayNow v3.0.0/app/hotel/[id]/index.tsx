import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CalendarDays,
  ChevronRight,
  CircleCheck,
  Clock3,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react-native';
import { Image } from 'expo-image';
import {
  Badge,
  Button,
  Card,
  Divider,
  EmptyState,
  IconButton,
  ScreenHeader,
  Skeleton,
} from '@/components/ui';
import {
  AmenitiesSheet,
  getAmenityIcon,
  HotelImageCarousel,
  HotelStickyBottomBar,
} from '@/components/hotel';
import {
  DateRangePickerSheet,
  GuestsRoomsPickerSheet,
} from '@/components/search';
import { calculateBookingPricing } from '@/config/pricing';
import { useHotelQuery } from '@/services/queries';
import { useBookingsStore, useSearchStore } from '@/store';
import { Hotel, Room } from '@/types/hotel';
import { formatDateRange, formatNights, formatPrice, nights } from '@/utils/format';
import { colors, radius, shadows, spacing, typography } from '@/theme';

export default function HotelDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const hotelId = Array.isArray(id) ? id[0] : id ?? 'bulevard-house';

  const { data: hotel, isLoading, isError } = useHotelQuery(hotelId);
  const searchStore = useSearchStore();
  const { selectedRooms, setBookingDraft } = useBookingsStore();

  // Local UI States
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isAmenitiesSheetVisible, setIsAmenitiesSheetVisible] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [isGuestsPickerVisible, setIsGuestsPickerVisible] = useState(false);
  const [isScrolledDown, setIsScrolledDown] = useState(false);

  // Selected Room
  const selectedRoomId = selectedRooms[hotelId];
  const activeRoom: Room | undefined = useMemo(() => {
    if (!hotel || !hotel.rooms || hotel.rooms.length === 0) return undefined;
    if (selectedRoomId) {
      const found = hotel.rooms.find((r) => r.id === selectedRoomId);
      if (found) return found;
    }
    return hotel.rooms[0];
  }, [hotel, selectedRoomId]);

  // Pricing calculations
  const stayNights = useMemo(() => {
    return nights(searchStore.checkInDate, searchStore.checkOutDate);
  }, [searchStore.checkInDate, searchStore.checkOutDate]);

  const pricing = useMemo(() => {
    const nightly = activeRoom?.price ?? hotel?.discountedPrice ?? 135;
    const original = activeRoom?.originalPrice ?? hotel?.standardPrice ?? 190;
    return calculateBookingPricing(nightly, stayNights, original);
  }, [activeRoom, hotel, stayNights]);

  // Scroll handler for sticky bottom bar & solid header transition
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    setIsScrolledDown(offsetY > 320);
  };

  // Booking action
  const handleBookNow = () => {
    if (!hotel || !activeRoom) return;

    setBookingDraft({
      hotelId: hotel.id,
      hotelName: hotel.name,
      hotelImage: hotel.images[0] ?? '',
      hotelAddress: `${hotel.address}, ${hotel.district}`,
      room: activeRoom,
      checkInDate: searchStore.checkInDate,
      checkOutDate: searchStore.checkOutDate,
      nights: stayNights,
      guests: searchStore.guests,
      nightlyPrice: pricing.nightlyPrice,
      basePrice: pricing.basePrice,
      taxes: pricing.taxes,
      serviceFee: pricing.serviceFee,
      totalPrice: pricing.totalPrice,
      savings: pricing.savings,
    });

    router.push('/checkout/guest');
  };

  // 1. Loading Skeleton State
  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Skeleton width="100%" height={310} borderRadius={0} />
        <View style={styles.skeletonBody}>
          <Skeleton width="30%" height={24} borderRadius={radius.sm} />
          <Skeleton width="80%" height={32} borderRadius={radius.sm} style={{ marginTop: spacing.sm }} />
          <Skeleton width="60%" height={20} borderRadius={radius.sm} style={{ marginTop: spacing.xs }} />
          <Divider marginVertical="lg" />
          <Skeleton width="100%" height={120} borderRadius={radius.lg} />
          <Divider marginVertical="lg" />
          <Skeleton width="100%" height={80} borderRadius={radius.lg} />
        </View>
      </View>
    );
  }

  // 2. Hotel Not Found State
  if (isError || !hotel) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <EmptyState
          title="Otel Tapılmadı"
          description="Axtardığınız otel mövcud deyil və ya sistemdən silinib."
          actionTitle="Axtarışa qayıt"
          onActionPress={() => router.replace('/(tabs)')}
        />
      </View>
    );
  }

  // 4 main amenities to display
  const mainAmenities = hotel.amenities.slice(0, 4);

  return (
    <View style={styles.container}>
      {/* Dynamic Header on Scroll */}
      {isScrolledDown && (
        <View style={[styles.solidHeader, { paddingTop: insets.top + spacing.xs }]}>
          <ScreenHeader
            title={hotel.name}
            subtitle={hotel.category}
            onBack={() => router.back()}
          />
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 110 + insets.bottom }}
      >
        {/* YUXARI HİSSƏ: Foto Qalereya Karuseli (310px) */}
        <HotelImageCarousel
          hotelId={hotel.id}
          hotelName={hotel.name}
          hotelAddress={hotel.address}
          images={hotel.images}
          topInset={insets.top}
          onBack={() => router.back()}
        />

        <View style={styles.content}>
          {/* MƏLUMAT BÖLMƏSİ 1: Kateqoriya, Qiymət Qənaəti, Ad, Reyting, Ünvan, Təsvir */}
          <View style={styles.sectionHeaderRow}>
            <Badge label={hotel.category} variant="primary" />
            {hotel.discountPercent > 0 && (
              <Badge label={`-${hotel.discountPercent}% Qənaət`} variant="savings" />
            )}
          </View>

          <Text style={styles.hotelTitle}>{hotel.name}</Text>

          {/* Rating Row (links to reviews) */}
          <Pressable
            style={styles.ratingRow}
            onPress={() => router.push({ pathname: '/hotel/[id]/reviews', params: { id: hotel.id } })}
          >
            <View style={styles.starBadge}>
              <Star size={13} color={colors.star} fill={colors.star} />
              <Text style={styles.ratingScore}>{hotel.rating}</Text>
            </View>
            <Text style={styles.ratingLabel}>Əla</Text>
            <Text style={styles.bulletDot}>·</Text>
            <Text style={styles.reviewCountLink}>{hotel.reviewCount} rəy</Text>
            <ChevronRight size={15} color={colors.primary} />
          </Pressable>

          {/* Address Row (links to map) */}
          <Pressable
            style={styles.addressRow}
            onPress={() => router.push('/(tabs)/map')}
          >
            <MapPin size={16} color={colors.primary} />
            <Text style={styles.addressText} numberOfLines={1}>
              {hotel.address}, {hotel.district}, {hotel.city}
            </Text>
            <ChevronRight size={14} color={colors.textSecondary} />
          </Pressable>

          {/* Editorial Description */}
          <View style={styles.descContainer}>
            <Text
              style={styles.descText}
              numberOfLines={isDescriptionExpanded ? undefined : 3}
            >
              {hotel.description}
            </Text>
            <Pressable
              onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              style={styles.readMoreBtn}
            >
              <Text style={styles.readMoreText}>
                {isDescriptionExpanded ? 'Daha az göstər' : 'Daha çox oxu'}
              </Text>
            </Pressable>
          </View>

          <Divider marginVertical="lg" />

          {/* MƏLUMAT BÖLMƏSİ 2: Olanaqlar (4 əsas ikon + "Hamısı" düyməsi) */}
          <View style={styles.amenitiesSection}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionHeading}>Olanaqlar və xidmətlər</Text>
              <Pressable onPress={() => setIsAmenitiesSheetVisible(true)}>
                <Text style={styles.seeAllText}>Hamısı</Text>
              </Pressable>
            </View>

            <View style={styles.amenityIconsGrid}>
              {mainAmenities.map((amenityKey) => {
                const label =
                  amenityKey === 'wifi'
                    ? 'Pulsuz Wi-Fi'
                    : amenityKey === 'breakfast'
                    ? 'Səhər yeməyi'
                    : amenityKey === 'gym'
                    ? 'Trenajor zalı'
                    : amenityKey === 'reception24'
                    ? '24/7 Qəbul'
                    : amenityKey;

                return (
                  <View key={amenityKey} style={styles.amenityItem}>
                    <View style={styles.amenityIconCircle}>
                      {getAmenityIcon(amenityKey, 20, colors.primary)}
                    </View>
                    <Text style={styles.amenityItemLabel} numberOfLines={1}>
                      {label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          <Divider marginVertical="lg" />

          {/* MƏLUMAT BÖLMƏSİ 4: Otaq Seçimi */}
          <View style={styles.roomSection}>
            <Text style={styles.sectionHeading}>Otaq seçimi</Text>

            {/* Date & Guests Chips */}
            <View style={styles.chipsRow}>
              <Pressable
                style={styles.filterChip}
                onPress={() => setIsDatePickerVisible(true)}
              >
                <CalendarDays size={14} color={colors.primary} />
                <Text style={styles.chipText}>
                  {formatDateRange(searchStore.checkInDate, searchStore.checkOutDate)} ({formatNights(stayNights)})
                </Text>
              </Pressable>

              <Pressable
                style={styles.filterChip}
                onPress={() => setIsGuestsPickerVisible(true)}
              >
                <Users size={14} color={colors.primary} />
                <Text style={styles.chipText}>
                  {searchStore.guests.adults} böyük · {searchStore.guests.rooms} otaq
                </Text>
              </Pressable>
            </View>

            {/* Selected Room Card */}
            {activeRoom && (
              <Card style={styles.selectedRoomCard}>
                <View style={styles.roomHeaderRow}>
                  <Image
                    source={{ uri: activeRoom.image }}
                    style={styles.roomImage}
                    contentFit="cover"
                    transition={150}
                  />
                  <View style={styles.roomInfoCol}>
                    <View style={styles.roomTitleRow}>
                      <Text style={styles.roomName} numberOfLines={2}>
                        {activeRoom.name}
                      </Text>
                      <CircleCheck size={20} color={colors.brand} />
                    </View>
                    <Text style={styles.roomBedType}>{activeRoom.bedType}</Text>
                    <Text style={styles.roomAvailability}>Son 2 otaq qalıb</Text>
                  </View>
                </View>

                <Divider marginVertical="sm" />

                <View style={styles.roomFooterRow}>
                  <Text style={styles.roomPolicy}>{activeRoom.breakfastPolicy}</Text>
                  <Pressable
                    style={styles.changeRoomBtn}
                    onPress={() =>
                      router.push({
                        pathname: '/hotel/[id]/rooms',
                        params: { id: hotel.id },
                      })
                    }
                  >
                    <Text style={styles.changeRoomText}>Otağı dəyiş</Text>
                    <ChevronRight size={14} color={colors.primary} />
                  </Pressable>
                </View>
              </Card>
            )}
          </View>

          <Divider marginVertical="lg" />

          {/* MƏLUMAT BÖLMƏSİ 5: Şəffaf Qiymət Cədvəli */}
          <View style={styles.pricingSection}>
            <Text style={styles.sectionHeading}>Şəffaf qiymət</Text>

            <View style={styles.pricingBreakdown}>
              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>
                  {formatPrice(pricing.nightlyPrice)} × {formatNights(pricing.nights)}
                </Text>
                <Text style={styles.pricingVal}>{formatPrice(pricing.basePrice)}</Text>
              </View>

              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Vergilər və rüsumlar (18% ƏDV)</Text>
                <Text style={styles.pricingVal}>{formatPrice(pricing.taxes)}</Text>
              </View>

              <View style={styles.pricingRow}>
                <Text style={styles.pricingLabel}>Xidmət haqqı (5%)</Text>
                <Text style={styles.pricingVal}>{formatPrice(pricing.serviceFee)}</Text>
              </View>

              <Divider marginVertical="sm" />

              <View style={styles.totalRow}>
                <View>
                  <Text style={styles.totalLabel}>Ümumi məbləğ</Text>
                  <Text style={styles.taxInclusiveNote}>{hotel.taxNote}</Text>
                </View>
                <Text style={styles.totalVal}>{formatPrice(pricing.totalPrice)}</Text>
              </View>

              {pricing.savings > 0 && (
                <View style={styles.savingsBox}>
                  <Text style={styles.savingsText}>
                    Bu rezervasiyada {formatPrice(pricing.savings)} qənaət edirsiniz!
                  </Text>
                </View>
              )}
            </View>
          </View>

          <Divider marginVertical="lg" />

          {/* MƏLUMAT BÖLMƏSİ 6: Qalma Qaydaları (shield-check və clock-3) */}
          <View style={styles.rulesSection}>
            <Text style={styles.sectionHeading}>Qalma qaydaları</Text>

            <View style={styles.ruleRow}>
              <View style={styles.ruleIconCircle}>
                <ShieldCheck size={20} color={colors.primary} />
              </View>
              <View style={styles.ruleTextCol}>
                <Text style={styles.ruleTitle}>Ləğvetmə siyasəti</Text>
                <Text style={styles.ruleSubtitle}>{hotel.cancellationPolicy}</Text>
              </View>
            </View>

            <View style={styles.ruleRow}>
              <View style={styles.ruleIconCircle}>
                <Clock3 size={20} color={colors.primary} />
              </View>
              <View style={styles.ruleTextCol}>
                <Text style={styles.ruleTitle}>Giriş və çıxış saatları</Text>
                <Text style={styles.ruleSubtitle}>
                  Giriş: {hotel.checkInTime}-dan etibarən · Çıxış: {hotel.checkOutTime}-dək
                </Text>
              </View>
            </View>
          </View>

          <Divider marginVertical="lg" />

          {/* MƏLUMAT BÖLMƏSİ 7: Rezervasiya Aksiyası & Qeydlər */}
          <View style={styles.bookingActionSection}>
            <Button
              title="Rezerv et"
              variant="primary"
              onPress={handleBookNow}
            />

            <View style={styles.guaranteeRow}>
              <LockKeyhole size={14} color={colors.savings} />
              <Text style={styles.guaranteeText}>
                Təhlükəsiz 256-bit SSL ödəniş · Oteldə ödəniş imkanı
              </Text>
            </View>

            <Text style={styles.conceptNotice}>
              StayNow Bakının ən yaxşı otellərində son dəqiqə lüks qalma təcrübəsini ən sərfəli şərtlərlə təqdim edir. Bütün qiymətlərə vergilər daxildir.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <HotelStickyBottomBar
        visible={isScrolledDown}
        totalPrice={pricing.totalPrice}
        nightsCount={pricing.nights}
        onBook={handleBookNow}
        bottomInset={insets.bottom}
      />

      {/* Bottom Sheets */}
      <AmenitiesSheet
        visible={isAmenitiesSheetVisible}
        onClose={() => setIsAmenitiesSheetVisible(false)}
        amenities={hotel.amenities}
        hotelName={hotel.name}
      />

      <DateRangePickerSheet
        visible={isDatePickerVisible}
        onClose={() => setIsDatePickerVisible(false)}
        onConfirm={(start, end) => {
          searchStore.setDates(start, end);
          setIsDatePickerVisible(false);
        }}
      />

      <GuestsRoomsPickerSheet
        visible={isGuestsPickerVisible}
        onClose={() => setIsGuestsPickerVisible(false)}
        onConfirm={(newGuests) => {
          searchStore.setGuests(newGuests);
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
  skeletonBody: {
    padding: spacing.lg,
  },
  solidHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surfaceAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 50,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  hotelTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  starBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ratingScore: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  ratingLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  bulletDot: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  reviewCountLink: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  addressText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  descContainer: {
    marginTop: spacing.xs,
  },
  descText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  readMoreBtn: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  readMoreText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  amenitiesSection: {
    gap: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeading: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  seeAllText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  amenityIconsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amenityItem: {
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  amenityIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amenityItemLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  roomSection: {
    gap: spacing.md,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  selectedRoomCard: {
    padding: spacing.md,
  },
  roomHeaderRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  roomImage: {
    width: 78,
    height: 76,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceHighlight,
  },
  roomInfoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  roomTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roomName: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginRight: spacing.xs,
  },
  roomBedType: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  roomAvailability: {
    fontSize: typography.fontSize.xs,
    color: colors.urgency,
    fontWeight: typography.fontWeight.medium,
    marginTop: 4,
  },
  roomFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roomPolicy: {
    fontSize: typography.fontSize.xs,
    color: colors.savings,
    fontWeight: typography.fontWeight.medium,
  },
  changeRoomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  changeRoomText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  pricingSection: {
    gap: spacing.md,
  },
  pricingBreakdown: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pricingLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  pricingVal: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  taxInclusiveNote: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  totalVal: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.brand,
  },
  savingsBox: {
    backgroundColor: colors.savingsTint,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  savingsText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.savings,
    textAlign: 'center',
  },
  rulesSection: {
    gap: spacing.md,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  ruleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleTextCol: {
    flex: 1,
  },
  ruleTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  ruleSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  bookingActionSection: {
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  guaranteeText: {
    fontSize: typography.fontSize.xs,
    color: colors.savings,
    fontWeight: typography.fontWeight.medium,
  },
  conceptNotice: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing.sm,
  },
});
