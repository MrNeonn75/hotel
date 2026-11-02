import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/constants/theme';
import { useHistoryStore } from '@/store/historyStore';
import { formatDate, formatPrice } from '@/utils/format';
import { BookingHistoryItem } from '@/types';
import { useTranslation } from 'react-i18next';

export default function HistoryScreen() {
  const router = useRouter();
  const { colors, fonts, radius, spacing, shadows } = useTheme();
  const { t } = useTranslation();

  const bookings = useHistoryStore((state) => state.bookings);
  const cancelBooking = useHistoryStore((state) => state.cancelBooking);

  // Ən yeni rezervasiyalar yuxarıda
  const sortedBookings = [...bookings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleCancel = (booking: BookingHistoryItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      t('history.cancelConfirmTitle', 'Rezervasiyanı ləğv et'),
      t('history.cancelConfirmMessage', 'Rezervasiyanı ləğv etmək istədiyinizdən əminsiniz?'),
      [
        {
          text: t('profile.cancel', 'Xeyr'),
          style: 'cancel',
        },
        {
          text: t('history.cancel', 'Ləğv et'),
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            cancelBooking(booking.id);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md }]}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text, fontFamily: fonts.extraBold }]}>
            {t('history.title', 'Tarixçə')}
          </Text>
          <View
            style={[
              styles.counterBadge,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.pill,
              },
            ]}>
            <Text style={[styles.counterText, { color: colors.primary, fontFamily: fonts.bold }]}>
              {sortedBookings.length}
            </Text>
          </View>
        </View>
      </View>

      {sortedBookings.length === 0 ? (
        // Empty State
        <View style={styles.emptyContainer}>
          <View
            style={[
              styles.emptyIconCircle,
              { backgroundColor: colors.primary + '15' },
            ]}>
            <Ionicons name="receipt-outline" size={54} color={colors.primary} />
          </View>

          <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: fonts.bold }]}>
            {t('history.emptyTitle', 'Rezervasiya tarixçəniz boşdur')}
          </Text>

          <Text
            style={[
              styles.emptySubtitle,
              { color: colors.textSecondary, fontFamily: fonts.regular },
            ]}>
            {t('history.emptySubtitle', 'Hələ heç bir otel rezerv etməmisiniz. Bu gecə üçün ən yaxşı təklifləri kəşf edin.')}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('favourites.exploreHotels', 'Otellərə bax')}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(tabs)' as any);
            }}
            style={({ pressed }) => [
              styles.exploreButton,
              {
                backgroundColor: colors.primary,
                borderRadius: radius.button,
                opacity: pressed ? 0.9 : 1,
              },
            ]}>
            <Ionicons name="bed-outline" size={18} color="#FFFFFF" />
            <Text style={[styles.exploreBtnText, { fontFamily: fonts.bold }]}>
              Otelləri kəşf et
            </Text>
          </Pressable>
        </View>
      ) : (
        // Bookings List
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContent,
            { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
          ]}>
          {sortedBookings.map((item) => {
            const isConfirmed = item.status === 'confirmed';

            return (
              <Pressable
                key={item.id}
                onPress={() => router.push(`/hotel/${item.hotelId}` as any)}
                style={[
                  styles.bookingCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderRadius: radius.card,
                  },
                  shadows.card,
                ]}>
                {/* Main Card Content */}
                <View style={styles.cardHeaderRow}>
                  {/* Hotel Thumbnail */}
                  <Image
                    source={{ uri: item.hotel.image }}
                    style={[styles.hotelThumbnail, { borderRadius: radius.button }]}
                    contentFit="cover"
                  />

                  {/* Info details */}
                  <View style={styles.infoCol}>
                    {/* Top Row: Name + Status badge */}
                    <View style={styles.topInfoRow}>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.hotelName,
                          { color: colors.text, fontFamily: fonts.bold },
                        ]}>
                        {item.hotel.name}
                      </Text>

                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: isConfirmed
                              ? colors.success + '18'
                              : colors.border,
                            borderRadius: radius.pill,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.statusText,
                            {
                              color: isConfirmed
                                ? colors.success
                                : colors.textSecondary,
                              fontFamily: fonts.semiBold,
                            },
                          ]}>
                          {isConfirmed ? t('history.confirmed', 'Təsdiqlənib') : t('history.cancelled', 'Ləğv edilib')}
                        </Text>
                      </View>
                    </View>

                    {/* Booking number */}
                    <Text
                      style={[
                        styles.bookingNumber,
                        { color: colors.textSecondary, fontFamily: fonts.regular },
                      ]}>
                      № {item.id}
                    </Text>

                    {/* Dates */}
                    <View style={styles.detailRow}>
                      <Ionicons
                        name="calendar-outline"
                        size={13}
                        color={colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.detailText,
                          { color: colors.textSecondary, fontFamily: fonts.medium },
                        ]}>
                        {formatDate(item.checkInDate)} — {formatDate(item.checkOutDate)} ({item.nightsCount} gecə)
                      </Text>
                    </View>

                    {/* Guests */}
                    <View style={styles.detailRow}>
                      <Ionicons
                        name="people-outline"
                        size={13}
                        color={colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.detailText,
                          { color: colors.textSecondary, fontFamily: fonts.medium },
                        ]}>
                        {item.adultsCount} böyük{item.childrenCount > 0 ? `, ${item.childrenCount} uşaq` : ''}
                      </Text>
                    </View>

                    {/* Price */}
                    <View style={styles.priceRow}>
                      <Text
                        style={[
                          styles.priceLabel,
                          { color: colors.textSecondary, fontFamily: fonts.regular },
                        ]}>
                        Yekun:
                      </Text>
                      <Text
                        style={[
                          styles.priceValue,
                          { color: colors.primary, fontFamily: fonts.extraBold },
                        ]}>
                        {formatPrice(item.totalPrice)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Cancel button if confirmed */}
                {isConfirmed && (
                  <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation?.();
                        handleCancel(item);
                      }}
                      style={({ pressed }) => [
                        styles.cancelButton,
                        {
                          borderColor: colors.accent,
                          borderRadius: radius.button,
                          opacity: pressed ? 0.75 : 1,
                        },
                      ]}>
                      <Ionicons name="close-circle-outline" size={15} color={colors.accent} />
                      <Text
                        style={[
                          styles.cancelBtnText,
                          { color: colors.accent, fontFamily: fonts.semiBold },
                        ]}>
                        {t('history.cancel', 'Ləğv et')}
                      </Text>
                    </Pressable>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 28,
  },
  counterBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    minWidth: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyIconCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 14,
    marginTop: 10,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  listContent: {
    paddingTop: 8,
    gap: 14,
  },
  bookingCard: {
    borderWidth: 1,
    padding: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  hotelThumbnail: {
    width: 80,
    height: 80,
  },
  infoCol: {
    flex: 1,
    gap: 4,
  },
  topInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  hotelName: {
    fontSize: 15,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 11,
  },
  bookingNumber: {
    fontSize: 11,
    marginTop: -2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  detailText: {
    fontSize: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 2,
  },
  priceLabel: {
    fontSize: 12,
  },
  priceValue: {
    fontSize: 16,
  },
  cardFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 12,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 12,
  },
});
