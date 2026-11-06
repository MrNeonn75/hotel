import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Calendar,
  ChevronDown,
  Clock3,
  LocateFixed,
  MapPin,
  Search,
  Users,
} from 'lucide-react-native';
import {
  Button,
  Card,
  Divider,
  SectionHeading,
  Skeleton,
  StayNowLogo,
} from '@/components/ui';
import { HotelOfferCard } from '@/components/hotel';
import {
  DateRangePickerSheet,
  GuestsRoomsPickerSheet,
  LocationSearchSheet,
} from '@/components/search';
import { useCollectionsQuery, useTonightOffersQuery } from '@/services/queries';
import { useAuthStore, useSearchStore } from '@/store';
import { formatDateRange } from '@/utils/format';
import { colors, radius, shadows, spacing, typography } from '@/theme';
import { az } from '@/i18n/az';

export default function DiscoverTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const {
    location,
    checkInDate,
    checkOutDate,
    guests,
  } = useSearchStore();

  const {
    data: tonightOffers,
    isLoading: offersLoading,
    refetch: refetchOffers,
  } = useTonightOffersQuery();

  const {
    data: collections,
    isLoading: collectionsLoading,
    refetch: refetchCollections,
  } = useCollectionsQuery();

  const [refreshing, setRefreshing] = useState(false);
  const [locationSheetVisible, setLocationSheetVisible] = useState(false);
  const [dateSheetVisible, setDateSheetVisible] = useState(false);
  const [guestsSheetVisible, setGuestsSheetVisible] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchOffers(), refetchCollections()]);
    setRefreshing(false);
  };

  const handleSearchSubmit = () => {
    router.push('/search/results');
  };

  const totalGuests = guests.adults + guests.children;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 1. Brand Header */}
      <View style={styles.brandHeader}>
        <StayNowLogo size={32} showWordmark={true} />

        <Pressable
          onPress={() => setLocationSheetVisible(true)}
          style={({ pressed }) => [
            styles.headerLocationPill,
            pressed && styles.pillPressed,
          ]}
        >
          <MapPin size={15} color={colors.primary} />
          <Text style={styles.headerLocationText} numberOfLines={1}>
            {location.split(',')[0]}
          </Text>
          <ChevronDown size={14} color={colors.textSecondary} />
        </Pressable>
      </View>

      <FlatList
        data={tonightOffers ?? []}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.brand]}
          />
        }
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* 2. Welcome Greeting & Big Title */}
            <View style={styles.heroSection}>
              <Text style={styles.greetingText}>
                Salam, {user ? user.firstName : 'qonaq'} 👋
              </Text>
              <Text style={styles.heroTitle}>Bu gecə hara gedirik?</Text>
            </View>

            {/* 3. Stay Search Card */}
            <Card style={styles.searchCard}>
              {/* Location Row with Locate Fixed */}
              <View style={styles.searchRow}>
                <Pressable
                  onPress={() => setLocationSheetVisible(true)}
                  style={styles.searchRowMain}
                >
                  <MapPin size={18} color={colors.primary} />
                  <View style={styles.searchTextCol}>
                    <Text style={styles.fieldLabel}>Məkan</Text>
                    <Text style={styles.fieldValue} numberOfLines={1}>
                      {location}
                    </Text>
                  </View>
                </Pressable>

                <Pressable
                  onPress={() => setLocationSheetVisible(true)}
                  style={styles.locateBtn}
                >
                  <LocateFixed size={18} color={colors.primary} />
                </Pressable>
              </View>

              <Divider marginVertical="sm" />

              {/* Date & Guest Row */}
              <View style={styles.splitRow}>
                {/* Date Picker trigger */}
                <Pressable
                  onPress={() => setDateSheetVisible(true)}
                  style={styles.splitHalf}
                >
                  <Calendar size={18} color={colors.primary} />
                  <View style={styles.searchTextCol}>
                    <Text style={styles.fieldLabel}>Tarixlər</Text>
                    <Text style={styles.fieldSubValue} numberOfLines={1}>
                      {formatDateRange(checkInDate, checkOutDate)}
                    </Text>
                  </View>
                </Pressable>

                <View style={styles.verticalSep} />

                {/* Guest Picker trigger */}
                <Pressable
                  onPress={() => setGuestsSheetVisible(true)}
                  style={styles.splitHalf}
                >
                  <Users size={18} color={colors.primary} />
                  <View style={styles.searchTextCol}>
                    <Text style={styles.fieldLabel}>Qonaqlar</Text>
                    <Text style={styles.fieldSubValue} numberOfLines={1}>
                      {totalGuests} nəfər, {guests.rooms} otaq
                    </Text>
                  </View>
                </Pressable>
              </View>

              {/* Search CTA Button */}
              <Button
                title="Axtar"
                variant="primary"
                icon={<Search size={18} color={colors.white} />}
                onPress={handleSearchSubmit}
                style={styles.searchSubmitBtn}
              />

              {/* Notice beneath search card */}
              <Text style={styles.searchNotice}>
                ⚡ Bu gün saat 12:00-dan etibarən ən yaxşı son dəqiqə endirimləri aktivdir.
              </Text>
            </Card>

            {/* 4. Tonight Deals Section */}
            <View style={styles.tonightHeaderRow}>
              <SectionHeading
                title={az.home.tonightDeals}
                actionText={az.common.all}
                onActionPress={() => router.push('/search/results')}
              />
              <View style={styles.urgencyNotice}>
                <Clock3 size={14} color={colors.urgency} />
                <Text style={styles.urgencyText}>
                  Qiymətlər və boş yerlər sürətlə tükənir
                </Text>
              </View>
            </View>

            {/* Skeletons while loading */}
            {offersLoading && (
              <View style={styles.skeletonContainer}>
                <Skeleton height={260} borderRadius={radius.xl} style={styles.mbSm} />
                <Skeleton height={260} borderRadius={radius.xl} />
              </View>
            )}
          </>
        }
        renderItem={({ item }) => <HotelOfferCard hotel={item} />}
        ListFooterComponent={
          <>
            {/* 5. Collections Section */}
            <SectionHeading
              title={az.home.popularCollections}
              style={styles.collectionsHeading}
            />

            {collectionsLoading ? (
              <View style={styles.collectionGrid}>
                <Skeleton height={110} borderRadius={radius.lg} style={styles.halfWidth} />
                <Skeleton height={110} borderRadius={radius.lg} style={styles.halfWidth} />
              </View>
            ) : (
              <View style={styles.collectionGrid}>
                {collections?.map((col) => (
                  <Pressable
                    key={col.id}
                    onPress={() => router.push(`/collection/${col.id}` as any)}
                    style={({ pressed }) => [
                      styles.collectionCard,
                      pressed && styles.collectionCardPressed,
                    ]}
                  >
                    <Image
                      source={{ uri: col.image }}
                      style={StyleSheet.absoluteFill}
                      contentFit="cover"
                      transition={250}
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(15, 14, 23, 0.9)']}
                      locations={[0.2, 0.95]}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={styles.collectionInfo}>
                      <Text style={styles.collectionTitle} numberOfLines={1}>
                        {col.title}
                      </Text>
                      <Text style={styles.collectionCount}>
                        {col.hotelCount} otel
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}

            {/* 6. Concept Notice (Figma) */}
            <View style={styles.conceptNoticeBox}>
              <Text style={styles.conceptNoticeText}>
                StayNow — Azərbaycanda son dəqiqə otel rezervasiyası xidmətidir.
                Qiymətlər və boş yerlər hər gün yenilənir.
              </Text>
            </View>
          </>
        }
      />

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  headerLocationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    gap: 4,
  },
  pillPressed: {
    backgroundColor: colors.surfaceHighlight,
  },
  headerLocationText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    maxWidth: 120,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  heroSection: {
    marginVertical: spacing.md,
  },
  greetingText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: typography.fontWeight.extraBold,
    color: colors.text,
    letterSpacing: -0.5,
  },
  searchCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  searchRowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchTextCol: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  fieldLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  fieldSubValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text,
  },
  locateBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  splitHalf: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  verticalSep: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  searchSubmitBtn: {
    marginTop: spacing.md,
  },
  searchNotice: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  tonightHeaderRow: {
    marginBottom: spacing.xs,
  },
  urgencyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs,
  },
  urgencyText: {
    fontSize: typography.fontSize.xs,
    color: colors.urgency,
    fontWeight: typography.fontWeight.medium,
  },
  skeletonContainer: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  mbSm: {
    marginBottom: spacing.sm,
  },
  collectionsHeading: {
    marginTop: spacing.lg,
  },
  collectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  collectionCard: {
    width: '47.5%',
    height: 110,
    borderRadius: radius.lg,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: colors.border,
  },
  collectionCardPressed: {
    opacity: 0.9,
  },
  collectionInfo: {
    padding: spacing.sm,
  },
  collectionTitle: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  collectionCount: {
    fontSize: 10,
    color: colors.primary,
    marginTop: 2,
  },
  halfWidth: {
    width: '47.5%',
  },
  conceptNoticeBox: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  conceptNoticeText: {
    fontSize: 11,
    color: colors.disabledText,
    textAlign: 'center',
    lineHeight: 16,
  },
});
