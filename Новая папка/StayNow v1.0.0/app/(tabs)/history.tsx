import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';

import { useTheme } from '@/hooks/useTheme';
import { useHistoryStore, Booking } from '@/store/historyStore';
import { bookingService } from '@/services/bookingService';
import { useQuery } from '@tanstack/react-query';
import {
  formatPrice,
  formatDateRange,
  formatGuests,
  toISODateString,
} from '@/utils/format';

import { ModalSheet } from '@/components/common/ModalSheet';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';

type HistoryTab = 'upcoming' | 'past' | 'cancelled';

export default function HistoryScreen() {
  const router = useRouter();
  const { colors, typography, radius, isDark } = useTheme();
  const { bookings, cancelBooking, addBooking } = useHistoryStore();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<HistoryTab>('upcoming');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const todayIso = toISODateString(new Date());

  // Serverdən rezervasiyaları gətir
  const {
    data: serverBookings,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<Booking[]>({
    queryKey: ['bookings'],
    queryFn: async () => {
      if (process.env.EXPO_PUBLIC_USE_MOCK === '1') {
        return bookings;
      }
      try {
        const res = await bookingService.getBookings();
        if (Array.isArray(res)) {
          const mapped: Booking[] = res.map((b) => ({
            id: b.id,
            bookingNumber: b.reference,
            hotelId: b.hotelId || (b.hotel as any)?.id || '',
            hotelName:
              (b.hotel as any)?.name || b.hotelSnapshot?.name || 'Otel',
            hotelImage:
              b.hotelSnapshot?.image || (b.hotel as any)?.images?.[0] || '',
            neighborhood: (b.hotel as any)?.neighborhood || '',
            city: (b.hotel as any)?.city || 'Bakı',
            starRating: (b.hotel as any)?.starRating || 4,
            checkIn: b.checkIn,
            checkOut: b.checkOut,
            nights: b.nights,
            guests: {
              adults: b.adults,
              children: b.children,
            },
            totalPrice: b.totalPrice,
            guestName: `${b.firstName} ${b.lastName}`.trim(),
            guestPhone: b.phone,
            guestEmail: b.email,
            specialRequests: b.specialRequests || undefined,
            status: b.status,
            createdAt: b.createdAt,
          }));
          return mapped;
        }
        return bookings;
      } catch {
        return bookings;
      }
    },
  });

  const effectiveBookings = serverBookings ?? bookings;

  // Filter bookings according to segment
  const filteredBookings = useMemo(() => {
    switch (activeTab) {
      case 'cancelled':
        return effectiveBookings.filter((b) => b.status === 'cancelled');
      case 'past':
        return effectiveBookings.filter(
          (b) =>
            b.status === 'completed' ||
            (b.status === 'confirmed' && b.checkOut < todayIso)
        );
      case 'upcoming':
      default:
        return effectiveBookings.filter(
          (b) => b.status === 'confirmed' && b.checkOut >= todayIso
        );
    }
  }, [effectiveBookings, activeTab, todayIso]);

  const handleTabChange = (tab: HistoryTab) => {
    Haptics.selectionAsync();
    setActiveTab(tab);
  };

  const handleOpenBookingDetail = (booking: Booking) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedBooking(booking);
  };

  const handleCancelBooking = (booking: Booking) => {
    Alert.alert(
      t('history.cancelConfirmTitle', 'Rezervasiyanı ləğv et'),
      `${booking.hotelName} - ${t(
        'history.cancelConfirmMessage',
        'Bu rezervasiyanı ləğv etmək istədiyinizdən əminsiniz?'
      )}`,
      [
        { text: t('history.cancelConfirmNo', 'Xeyr, saxla'), style: 'cancel' },
        {
          text: t('history.cancelConfirmYes', 'Bəli, ləğv et'),
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setSelectedBooking(null);

            if (process.env.EXPO_PUBLIC_USE_MOCK === '1') {
              cancelBooking(booking.id);
              return;
            }

            try {
              await bookingService.cancelBooking(booking.id);
              cancelBooking(booking.id);
              refetch();
              Alert.alert('Uğurlu', 'Rezervasiya uğurla ləğv edildi.');
            } catch (err: any) {
              const message =
                err?.code === 'CANCELLATION_NOT_ALLOWED'
                  ? 'Rezervasiyanı yalnız giriş vaxtına ən azı 24 saat qalana qədər ləğv etmək mümkündür.'
                  : err?.message || 'Rezervasiya ləğv edilərkən xəta baş verdi.';
              Alert.alert('Ləğvetmə xətası', message);
            }
          },
        },
      ]
    );
  };

  const renderStars = (count: number) => {
    return '★'.repeat(Math.max(1, Math.min(5, count)));
  };

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'cancelled':
        return {
          bg: isDark ? 'rgba(255,255,255,0.1)' : '#F3F4F6',
          text: colors.textSecondary,
          label: t('history.cancelled', 'Ləğv edilib'),
        };
      case 'completed':
        return {
          bg: colors.primaryTint,
          text: colors.primary,
          label: t('booking.successTitle', 'Tamamlandı'),
        };
      case 'confirmed':
      default:
        return {
          bg: isDark ? 'rgba(52,211,153,0.2)' : '#E8F7F0',
          text: colors.savings,
          label: t('history.confirmed', 'Təsdiqlənib'),
        };
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={[typography.display, { color: colors.text, fontSize: 26 }]}>
        {t('history.title', 'Rezervasiyalarım')}
      </Text>

      {/* Segment Bar */}
      <View
        style={[
          styles.segmentContainer,
          {
            backgroundColor: colors.surfaceAlt,
            borderRadius: radius.pill,
            borderColor: colors.border,
          },
        ]}
      >
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'upcoming' }}
          onPress={() => handleTabChange('upcoming')}
          style={[
            styles.segmentBtn,
            activeTab === 'upcoming' && [
              styles.activeSegmentBtn,
              { backgroundColor: isDark ? colors.background : '#FFFFFF' },
            ],
          ]}
        >
          <Text
            style={[
              typography.caption,
              {
                color: activeTab === 'upcoming' ? colors.primary : colors.textSecondary,
                fontWeight: activeTab === 'upcoming' ? '700' : '500',
              },
            ]}
          >
            {t('history.tabs.upcoming', 'Gələcək')}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'past' }}
          onPress={() => handleTabChange('past')}
          style={[
            styles.segmentBtn,
            activeTab === 'past' && [
              styles.activeSegmentBtn,
              { backgroundColor: isDark ? colors.background : '#FFFFFF' },
            ],
          ]}
        >
          <Text
            style={[
              typography.caption,
              {
                color: activeTab === 'past' ? colors.primary : colors.textSecondary,
                fontWeight: activeTab === 'past' ? '700' : '500',
              },
            ]}
          >
            {t('history.tabs.past', 'Keçmiş')}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'cancelled' }}
          onPress={() => handleTabChange('cancelled')}
          style={[
            styles.segmentBtn,
            activeTab === 'cancelled' && [
              styles.activeSegmentBtn,
              { backgroundColor: isDark ? colors.background : '#FFFFFF' },
            ],
          ]}
        >
          <Text
            style={[
              typography.caption,
              {
                color: activeTab === 'cancelled' ? colors.primary : colors.textSecondary,
                fontWeight: activeTab === 'cancelled' ? '700' : '500',
              },
            ]}
          >
            {t('history.tabs.cancelled', 'Ləğv edilmiş')}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      {renderHeader()}

      {filteredBookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconBox, { backgroundColor: colors.surfaceAlt }]}>
            <Ionicons
              name={
                activeTab === 'cancelled'
                  ? 'close-circle-outline'
                  : activeTab === 'past'
                  ? 'time-outline'
                  : 'calendar-outline'
              }
              size={48}
              color={colors.primary}
            />
          </View>

          <Text style={[typography.title, { color: colors.text, marginTop: 18, textAlign: 'center' }]}>
            {activeTab === 'cancelled'
              ? t('history.tabs.cancelled', 'Ləğv edilmiş rezervasiya yoxdur')
              : activeTab === 'past'
              ? t('history.emptyTitle', 'Keçmiş rezervasiya yoxdur')
              : t('history.emptyTitle', 'Hələ heç bir rezervasiyanız yoxdur')}
          </Text>

          <Text
            style={[
              typography.body,
              {
                color: colors.textSecondary,
                textAlign: 'center',
                marginTop: 6,
                paddingHorizontal: 32,
                lineHeight: 22,
              },
            ]}
          >
            {activeTab === 'upcoming'
              ? t('history.emptySubtitle', 'Bu gün üçün endirimli otelləri kəşf edin və ilk rezervasiyanızı edin.')
              : 'Tamamlanmış və ya ləğv olunmuş rezervasiyalarınız burada əks olunacaq.'}
          </Text>

          {activeTab === 'upcoming' && (
            <Button
              title={t('favourites.exploreHotels', 'Otellərə bax')}
              onPress={() => router.push('/(tabs)' as any)}
              style={styles.browseBtn}
            />
          )}
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={true}
          refreshing={isRefetching}
          onRefresh={refetch}
          renderItem={({ item }) => {
            const badge = getStatusBadge(item.status);

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${item.hotelName} rezervasiyası`}
                onPress={() => handleOpenBookingDetail(item)}
                style={({ pressed }) => [
                  styles.ticketCard,
                  {
                    backgroundColor: isDark ? colors.surfaceAlt : '#FFFFFF',
                    borderColor: colors.border,
                    borderRadius: radius.card,
                    opacity: pressed ? 0.92 : 1,
                  },
                ]}
              >
                {/* 88x88 Şəkil */}
                <Image
                  source={{ uri: item.hotelImage }}
                  style={[styles.ticketImage, { borderRadius: radius.card - 4 }]}
                  contentFit="cover"
                  transition={200}
                  cachePolicy="memory-disk"
                />

                {/* Detallar */}
                <View style={styles.ticketDetails}>
                  <View style={styles.ticketHeaderRow}>
                    <Text
                      style={[
                        typography.heading,
                        { color: colors.text, fontSize: 16, flex: 1 },
                      ]}
                      numberOfLines={1}
                    >
                      {item.hotelName}
                    </Text>

                    {/* Status badge */}
                    <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                      <Text
                        style={[
                          typography.micro,
                          { color: badge.text, fontWeight: '700' },
                        ]}
                      >
                        {badge.label}
                      </Text>
                    </View>
                  </View>

                  {/* Ulduzlar və Qonşuluq */}
                  <Text style={{ color: colors.star, fontSize: 12, marginTop: 1, fontWeight: '700' }}>
                    {renderStars(item.starRating)}{' '}
                    <Text style={{ color: colors.textSecondary, fontWeight: '400' }}>
                      · {item.neighborhood}
                    </Text>
                  </Text>

                  {/* Tarixlər */}
                  <View style={styles.ticketDateRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={13}
                      color={colors.textSecondary}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[
                        typography.caption,
                        { color: colors.textSecondary, fontSize: 12 },
                      ]}
                    >
                      {formatDateRange(item.checkIn, item.checkOut)} ({item.nights} {t('booking.nights', 'gecə')})
                    </Text>
                  </View>

                  {/* Qiymət və Rezervasiya nömrəsi */}
                  <View style={styles.ticketFooterRow}>
                    <Text
                      style={[
                        typography.micro,
                        { color: colors.textSecondary, fontWeight: '600' },
                      ]}
                    >
                      № {item.bookingNumber}
                    </Text>

                    <Text
                      style={[
                        typography.heading,
                        { color: colors.text, fontSize: 16, fontWeight: '800' },
                      ]}
                    >
                      {formatPrice(item.totalPrice)}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      )}

      {/* ═══ REZERVASİYA DETALI MODALI (MODALSHEET) ═══ */}
      {selectedBooking && (
        <ModalSheet
          visible={Boolean(selectedBooking)}
          onClose={() => setSelectedBooking(null)}
          title={t('booking.stayDetails', 'Rezervasiya detalları')}
          subtitle={`№ ${selectedBooking.bookingNumber}`}
          footer={
            <View style={styles.modalFooterActions}>
              <Button
                title={t('history.viewHotel', 'Otelə bax')}
                variant="secondary"
                onPress={() => {
                  const hotelId = selectedBooking.hotelId;
                  setSelectedBooking(null);
                  router.push(`/hotel/${hotelId}` as any);
                }}
                style={{ flex: 1, marginRight: 8 }}
              />

              {selectedBooking.status === 'confirmed' &&
                selectedBooking.checkOut >= todayIso && (
                  <Button
                    title={t('history.cancel', 'Ləğv et')}
                    variant="ghost"
                    onPress={() => handleCancelBooking(selectedBooking)}
                    style={{ flex: 1 }}
                    textStyle={{ color: colors.urgency }}
                  />
                )}
            </View>
          }
        >
          <View style={styles.modalContent}>
            {/* Otel Məlumatı */}
            <View style={styles.modalHotelRow}>
              <Image
                source={{ uri: selectedBooking.hotelImage }}
                style={[styles.modalHotelImage, { borderRadius: radius.card - 4 }]}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[typography.heading, { color: colors.text, fontSize: 17 }]}>
                  {selectedBooking.hotelName}
                </Text>
                <Text style={{ color: colors.star, fontSize: 12, marginTop: 2, fontWeight: '700' }}>
                  {renderStars(selectedBooking.starRating)} · {selectedBooking.neighborhood}
                </Text>
                <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                  {selectedBooking.city}
                </Text>
              </View>
            </View>

            <Divider spacing={16} />

            {/* Tarixlər və Qonaq */}
            <View style={styles.modalInfoRow}>
              <Text style={[typography.body, { color: colors.textSecondary }]}>
                {t('booking.dates', 'Tarixlər')}:
              </Text>
              <Text style={[typography.body, { color: colors.text, fontWeight: '700' }]}>
                {formatDateRange(selectedBooking.checkIn, selectedBooking.checkOut)} ({selectedBooking.nights} {t('booking.nights', 'gecə')})
              </Text>
            </View>

            <View style={[styles.modalInfoRow, { marginTop: 8 }]}>
              <Text style={[typography.body, { color: colors.textSecondary }]}>
                {t('booking.guests', 'Qonaqlar')}:
              </Text>
              <Text style={[typography.body, { color: colors.text, fontWeight: '700' }]}>
                {formatGuests(selectedBooking.guests.adults, selectedBooking.guests.children)}
              </Text>
            </View>

            <View style={[styles.modalInfoRow, { marginTop: 8 }]}>
              <Text style={[typography.body, { color: colors.textSecondary }]}>
                {t('booking.personalInfo', 'Qonaq adı')}:
              </Text>
              <Text style={[typography.body, { color: colors.text, fontWeight: '700' }]}>
                {selectedBooking.guestName}
              </Text>
            </View>

            <View style={[styles.modalInfoRow, { marginTop: 8 }]}>
              <Text style={[typography.body, { color: colors.textSecondary }]}>
                {t('profile.fields.phone', 'Əlaqə nömrəsi')}:
              </Text>
              <Text style={[typography.body, { color: colors.text, fontWeight: '700' }]}>
                {selectedBooking.guestPhone}
              </Text>
            </View>

            <View style={[styles.modalInfoRow, { marginTop: 8 }]}>
              <Text style={[typography.body, { color: colors.textSecondary }]}>Status:</Text>
              <Text
                style={[
                  typography.body,
                  {
                    color:
                      selectedBooking.status === 'confirmed'
                        ? colors.savings
                        : selectedBooking.status === 'cancelled'
                        ? colors.urgency
                        : colors.textSecondary,
                    fontWeight: '800',
                  },
                ]}
              >
                {selectedBooking.status === 'confirmed'
                  ? t('history.confirmed', 'Təsdiqlənib')
                  : selectedBooking.status === 'cancelled'
                  ? t('history.cancelled', 'Ləğv edilib')
                  : t('booking.successTitle', 'Tamamlandı')}
              </Text>
            </View>

            <Divider spacing={16} />

            {/* Yekun məbləğ */}
            <View style={styles.modalInfoRow}>
              <Text style={[typography.heading, { color: colors.text, fontSize: 18 }]}>
                {t('booking.finalTotal', 'Yekun məbləğ')}:
              </Text>
              <Text style={[typography.title, { color: colors.primary, fontSize: 22 }]}>
                {formatPrice(selectedBooking.totalPrice)}
              </Text>
            </View>

            <Text style={[typography.micro, { color: colors.textSecondary, marginTop: 4, textAlign: 'right' }]}>
              {t('booking.payAtHotel', 'Ödəniş otelə çatanda edilir')}
            </Text>
          </View>
        </ModalSheet>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  segmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 3,
    marginTop: 14,
    borderWidth: 1,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    minHeight: 44,
  },
  activeSegmentBtn: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  ticketCard: {
    flexDirection: 'row',
    padding: 12,
    borderWidth: 1,
  },
  ticketImage: {
    width: 88,
    height: 88,
  },
  ticketDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  ticketHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  ticketDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ticketFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  emptyIconBox: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  browseBtn: {
    marginTop: 24,
    minWidth: 180,
  },
  modalContent: {
    paddingBottom: 8,
  },
  modalHotelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalHotelImage: {
    width: 72,
    height: 72,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalFooterActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
