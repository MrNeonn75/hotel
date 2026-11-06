import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import { useTheme } from '@/hooks/useTheme';
import { useSearchStore } from '@/store/searchStore';
import { getHotelById } from '@/services/hotelService';
import { Hotel } from '@/types/hotel';
import { formatReviewCount } from '@/utils/format';
import { getAmenityInfo } from '@/constants/amenities';

import { ImageCarousel } from '@/components/hotel/ImageCarousel';
import { HotelMiniMap } from '@/components/hotel/HotelMiniMap';
import { BookingBar } from '@/components/hotel/BookingBar';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Divider } from '@/components/ui/Divider';

export default function HotelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, typography, radius, isDark } = useTheme();

  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const { checkIn, checkOut } = useSearchStore();

  const {
    data: hotel,
    isLoading,
    isError,
    refetch,
  } = useQuery<Hotel | null>({
    queryKey: ['hotel', id, checkIn, checkOut],
    queryFn: () => getHotelById(id as string, checkIn, checkOut),
    enabled: Boolean(id),
  });

  const renderStars = (count: number) => {
    return '★'.repeat(Math.max(1, Math.min(5, count)));
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Skeleton width="100%" height={340} borderRadius={0} />
        <View style={{ padding: 20 }}>
          <Skeleton width="80%" height={32} borderRadius={8} style={{ marginBottom: 12 }} />
          <Skeleton width="50%" height={18} borderRadius={6} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={80} borderRadius={12} style={{ marginBottom: 20 }} />
          <Skeleton width="100%" height={140} borderRadius={12} />
        </View>
      </View>
    );
  }

  if (isError || !hotel) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <EmptyState
          icon="alert-circle-outline"
          title="Otel tapılmadı"
          description="Axtardığınız otel mövcud deyil və ya sistemdə xəta baş verdi."
          actionTitle="Geri qayıt"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. Şəkillər Karuseli (Hündürlük 340) */}
        <ImageCarousel images={hotel.images} hotelName={hotel.name} />

        {/* 2. Məzmun Kartı (Şəkil üzərinə 24px çıxan yuvarlaq fon) */}
        <View
          style={[
            styles.contentCard,
            {
              backgroundColor: colors.background,
              borderTopLeftRadius: radius.sheetTop,
              borderTopRightRadius: radius.sheetTop,
            },
          ]}
        >
          {/* Otel Adı və Ulduzlar */}
          <Text style={[typography.display, { color: colors.text, fontSize: 26, lineHeight: 32 }]}>
            {hotel.name}
          </Text>

          <View style={styles.starsRow}>
            <Text style={{ color: colors.star, fontSize: 15, fontWeight: '700' }}>
              {renderStars(hotel.starRating)}
            </Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginLeft: 6 }]}>
              · {hotel.neighborhood}, {hotel.city}
            </Text>
          </View>

          {/* Reytinq xal çipi + reviewLabel + rəy sayı */}
          <View style={styles.ratingRow}>
            <View style={[styles.scoreBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.scoreText}>{hotel.rating.toFixed(1)}</Text>
            </View>
            <Text style={[typography.heading, { color: colors.text, fontSize: 16 }]}>
              {hotel.reviewLabel}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 6 }]}>
              · {formatReviewCount(hotel.reviewCount)}
            </Text>
          </View>

          {/* Pill-lər (dealLabel / urgency / freeCancellation) */}
          <View style={styles.pillsWrap}>
            {hotel.dealLabel && (
              <View style={[styles.pillItem, { backgroundColor: colors.primaryTint }]}>
                <Ionicons name="sparkles" size={13} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={[typography.micro, { color: colors.primary, fontWeight: '700' }]}>
                  {hotel.dealLabel}
                </Text>
              </View>
            )}

            {hotel.roomsLeft !== null && hotel.roomsLeft <= 5 && (
              <View style={[styles.pillItem, { backgroundColor: isDark ? 'rgba(255,107,112,0.2)' : '#FDE8E8' }]}>
                <Ionicons name="flame" size={13} color={colors.urgency} style={{ marginRight: 4 }} />
                <Text style={[typography.micro, { color: colors.urgency, fontWeight: '700' }]}>
                  Yalnız {hotel.roomsLeft} otaq qalıb
                </Text>
              </View>
            )}

            {hotel.freeCancellation && (
              <View style={[styles.pillItem, { backgroundColor: isDark ? 'rgba(52,211,153,0.2)' : '#E8F7F0' }]}>
                <Ionicons name="checkmark-circle" size={13} color={colors.savings} style={{ marginRight: 4 }} />
                <Text style={[typography.micro, { color: colors.savings, fontWeight: '700' }]}>
                  Pulsuz ləğv
                </Text>
              </View>
            )}
          </View>

          <Divider spacing={20} />

          {/* "Niyə bu otel?" Bölməsi */}
          <View
            style={[
              styles.taglineCard,
              {
                backgroundColor: colors.primaryTint,
                borderColor: colors.primary,
                borderRadius: radius.card,
              },
            ]}
          >
            <View style={styles.taglineHeader}>
              <Ionicons name="bulb" size={18} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={[typography.heading, { color: colors.primary, fontSize: 16 }]}>
                Niyə bu otel?
              </Text>
            </View>
            <Text
              style={[
                typography.body,
                { color: colors.text, marginTop: 6, lineHeight: 22, fontWeight: '600' },
              ]}
            >
              "{hotel.tagline}"
            </Text>
          </View>

          <Divider spacing={20} />

          {/* "Otel haqqında" Bölməsi */}
          <View style={styles.section}>
            <Text style={[typography.heading, { color: colors.text, marginBottom: 8 }]}>
              Otel haqqında
            </Text>
            <Text
              style={[
                typography.body,
                { color: colors.textSecondary, lineHeight: 22 },
              ]}
              numberOfLines={isDescriptionExpanded ? undefined : 4}
            >
              {hotel.description}
            </Text>

            <Pressable
              onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              style={styles.expandBtn}
              hitSlop={8}
            >
              <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
                {isDescriptionExpanded ? 'Daha az göstər' : 'Daha çox oxu...'}
              </Text>
              <Ionicons
                name={isDescriptionExpanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={colors.primary}
                style={{ marginLeft: 4 }}
              />
            </Pressable>
          </View>

          <Divider spacing={20} />

          {/* "Üstünlüklər və xidmətlər" Bölməsi */}
          <View style={styles.section}>
            <Text style={[typography.heading, { color: colors.text, marginBottom: 14 }]}>
              Üstünlüklər və xidmətlər
            </Text>

            {/* Xidmətlər: 2 sütunlu grid */}
            <View style={styles.amenitiesGrid}>
              {hotel.amenities.map((amenityKey) => {
                const info = getAmenityInfo(amenityKey);
                return (
                  <View key={amenityKey} style={styles.amenityGridItem}>
                    <View
                      style={[
                        styles.amenityIconBox,
                        {
                          backgroundColor: colors.surfaceAlt,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Ionicons name={info.icon} size={18} color={colors.primary} />
                    </View>
                    <Text
                      style={[
                        typography.caption,
                        { color: colors.text, flex: 1, fontWeight: '600' },
                      ]}
                      numberOfLines={1}
                    >
                      {info.label}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Üstünlüklər siyahısı */}
            <View style={styles.advantagesList}>
              {hotel.advantages.map((adv, idx) => (
                <View key={idx} style={styles.advantageItem}>
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={colors.savings}
                    style={{ marginRight: 8, marginTop: 2 }}
                  />
                  <Text
                    style={[
                      typography.body,
                      { color: colors.text, flex: 1, fontSize: 14, lineHeight: 20 },
                    ]}
                  >
                    {adv}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <Divider spacing={20} />

          {/* "Ünvan" Bölməsi (Mini Xəritə) */}
          <View style={styles.section}>
            <Text style={[typography.heading, { color: colors.text, marginBottom: 4 }]}>
              Ünvan və Məkan
            </Text>
            <HotelMiniMap hotel={hotel} />
          </View>

          <Divider spacing={20} />

          {/* "Bilməli olduğunuz qaydalar" Bölməsi */}
          <View style={styles.section}>
            <Text style={[typography.heading, { color: colors.text, marginBottom: 14 }]}>
              Bilməli olduğunuz qaydalar
            </Text>

            {/* Giriş / Çıxış vaxtları kartı */}
            <View
              style={[
                styles.checkTimesRow,
                {
                  backgroundColor: colors.surfaceAlt,
                  borderColor: colors.border,
                  borderRadius: radius.card,
                },
              ]}
            >
              <View style={styles.checkTimeItem}>
                <Ionicons name="log-in-outline" size={20} color={colors.primary} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={[typography.micro, { color: colors.textSecondary }]}>
                    Giriş (Check-in)
                  </Text>
                  <Text style={[typography.heading, { color: colors.text, fontSize: 16 }]}>
                    {hotel.checkInTime}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.checkDivider,
                  { backgroundColor: colors.border },
                ]}
              />

              <View style={styles.checkTimeItem}>
                <Ionicons name="log-out-outline" size={20} color={colors.primary} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={[typography.micro, { color: colors.textSecondary }]}>
                    Çıxış (Check-out)
                  </Text>
                  <Text style={[typography.heading, { color: colors.text, fontSize: 16 }]}>
                    {hotel.checkOutTime}
                  </Text>
                </View>
              </View>
            </View>

            {/* Qaydalar siyahısı */}
            <View style={styles.rulesList}>
              {hotel.rules.map((rule, idx) => (
                <View key={idx} style={styles.ruleItem}>
                  <Ionicons
                    name="information-circle-outline"
                    size={16}
                    color={colors.textSecondary}
                    style={{ marginRight: 8, marginTop: 2 }}
                  />
                  <Text
                    style={[
                      typography.caption,
                      { color: colors.textSecondary, flex: 1, lineHeight: 18 },
                    ]}
                  >
                    {rule}
                  </Text>
                </View>
              ))}
            </View>

            {/* "Vacib məlumatlar" Xəbərdarlıq Kartı */}
            {hotel.importantInfo && hotel.importantInfo.length > 0 && (
              <View
                style={[
                  styles.importantCard,
                  {
                    backgroundColor: colors.surfaceAlt,
                    borderLeftColor: colors.star,
                    borderRadius: radius.card,
                  },
                ]}
              >
                <View style={styles.importantHeader}>
                  <Ionicons name="alert-circle" size={18} color={colors.star} style={{ marginRight: 6 }} />
                  <Text style={[typography.heading, { color: colors.text, fontSize: 15 }]}>
                    Vacib məlumatlar
                  </Text>
                </View>
                {hotel.importantInfo.map((info, idx) => (
                  <Text
                    key={idx}
                    style={[
                      typography.caption,
                      { color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
                    ]}
                  >
                    • {info}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* 3. STICKY ALT PANEL (BookingBar) */}
      <BookingBar hotel={hotel} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  scrollContent: {
    paddingBottom: 130, // 120px-dən artıq ki, sticky alt panel örtməsin
  },
  contentCard: {
    marginTop: -24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  scoreBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  scoreText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  pillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  taglineCard: {
    padding: 16,
    borderWidth: 1,
  },
  taglineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {},
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  amenityGridItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  amenityIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: 10,
  },
  advantagesList: {
    marginTop: 8,
    gap: 8,
  },
  advantageItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkTimesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 16,
    borderWidth: 1,
  },
  checkTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  checkDivider: {
    width: 1,
    height: 36,
  },
  rulesList: {
    marginTop: 12,
    gap: 8,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  importantCard: {
    marginTop: 16,
    padding: 16,
    borderLeftWidth: 4,
  },
  importantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
});