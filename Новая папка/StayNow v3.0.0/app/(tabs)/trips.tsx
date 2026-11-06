import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import {
  ArrowRight,
  BadgeCheck,
  Calendar,
  ChevronRight,
  Headset,
  MapPin,
  Navigation,
  RotateCw,
  Ticket,
  UserRound,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  Badge,
  Button,
  Card,
  Divider,
  EmptyState,
} from '@/components/ui';
import { useAuthStore, useBookingsStore } from '@/store';
import { Booking } from '@/types/hotel';
import { formatDate, formatNights, formatPrice } from '@/utils/format';
import { colors, radius, shadows, spacing, typography } from '@/theme';

export default function TripsTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { isAuthenticated, user } = useAuthStore();
  const { bookings } = useBookingsStore();

  const [activeSegment, setActiveSegment] = useState<'upcoming' | 'past'>('upcoming');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Split bookings
  const upcomingBookings = useMemo(() => {
    return bookings.filter((b) => b.status === 'confirmed');
  }, [bookings]);

  const pastBookings = useMemo(() => {
    return bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled');
  }, [bookings]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleOpenNavigation = (booking: Booking) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const query = encodeURIComponent(`${booking.hotelName}, ${booking.hotelAddress}`);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
      default: `https://www.google.com/maps/search/?api=1&query=${query}`,
    });
    Linking.openURL(url!).catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    });
  };

  const userInitial = user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'Q';

  return (
    <View style={styles.container}>
      {/* Header (Figma node 6:10572) */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.xs }]}>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>Səfərlərim</Text>
          <Text style={styles.headerSubtitle}>
            Rezervasiyalarınız və səfər tarixçəniz
          </Text>
        </View>

        {/* User Avatar Circle -> navigates to Account tab */}
        <Pressable
          style={styles.avatarCircle}
          onPress={() => router.push('/(tabs)/account')}
        >
          <Text style={styles.avatarInitial}>{userInitial}</Text>
        </Pressable>
      </View>

      {/* If not authenticated: Show Auth Prompt */}
      {!isAuthenticated ? (
        <ScrollView contentContainerStyle={styles.authScroll}>
          <Card style={styles.authPromptCard}>
            <View style={styles.authPromptIconCircle}>
              <Ticket size={32} color={colors.primary} />
            </View>
            <Text style={styles.authPromptTitle}>Rezervasiyalarınıza Baxın</Text>
            <Text style={styles.authPromptDesc}>
              Aktiv və keçmiş otel rezervasiyalarınızı görmək, qəbzləri yükləmək və səfərləri idarə etmək üçün hesabınıza daxil olun.
            </Text>

            <View style={styles.authBtnRow}>
              <Button
                title="Daxil ol"
                variant="primary"
                onPress={() =>
                  router.push({
                    pathname: '/auth/login',
                    params: { returnTo: '/(tabs)/trips' },
                  })
                }
                style={styles.authBtn}
              />
              <Button
                title="Qeydiyyat"
                variant="secondary"
                onPress={() =>
                  router.push({
                    pathname: '/auth/signup',
                    params: { returnTo: '/(tabs)/trips' },
                  })
                }
                style={styles.authBtn}
              />
            </View>
          </Card>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 110 + insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {/* Segment Control ("Gələcək" / "Keçmiş") */}
          <View style={styles.segmentContainer}>
            <Pressable
              style={[
                styles.segmentBtn,
                activeSegment === 'upcoming' && styles.segmentBtnActive,
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setActiveSegment('upcoming');
              }}
            >
              <Text
                style={[
                  styles.segmentText,
                  activeSegment === 'upcoming' && styles.segmentTextActive,
                ]}
              >
                Gələcək ({upcomingBookings.length})
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.segmentBtn,
                activeSegment === 'past' && styles.segmentBtnActive,
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setActiveSegment('past');
              }}
            >
              <Text
                style={[
                  styles.segmentText,
                  activeSegment === 'past' && styles.segmentTextActive,
                ]}
              >
                Keçmiş ({pastBookings.length})
              </Text>
            </Pressable>
          </View>

          {/* UPCOMING LIST */}
          {activeSegment === 'upcoming' && (
            <View style={styles.listSection}>
              {upcomingBookings.length === 0 ? (
                <EmptyState
                  icon={<Ticket size={36} color={colors.primary} />}
                  title="Aktiv səfəriniz yoxdur"
                  description="Bu gecə üçün ən yaxşı son dəqiqə otelləri kəşf edin və bron edin."
                  actionTitle="Otelləri kəşf et"
                  onActionPress={() => router.push('/(tabs)')}
                />
              ) : (
                upcomingBookings.map((booking) => (
                  <Card key={booking.id} style={styles.upcomingCard}>
                    {/* Hotel Image with Status Badge */}
                    <View style={styles.upcomingImgWrapper}>
                      <Image
                        source={{ uri: booking.hotelImage }}
                        style={styles.upcomingImg}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        transition={150}
                      />
                      <View style={styles.upcomingStatusBadge}>
                        <BadgeCheck size={14} color={colors.white} />
                        <Text style={styles.upcomingStatusText}>Təsdiqləndi</Text>
                      </View>
                    </View>

                    {/* Booking Details */}
                    <View style={styles.upcomingDetails}>
                      <Text style={styles.upcomingHotelName}>{booking.hotelName}</Text>
                      <Text style={styles.upcomingRoomType}>{booking.roomType}</Text>

                      <View style={styles.datesRow}>
                        <Calendar size={14} color={colors.primary} />
                        <Text style={styles.datesText}>
                          {formatDate(booking.checkInDate, 'short')} — {formatDate(booking.checkOutDate, 'short')} ({formatNights(booking.nights)})
                        </Text>
                      </View>

                      <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Ödənilən məbləğ</Text>
                        <View style={styles.priceValRow}>
                          <Text style={styles.priceValue}>{formatPrice(booking.totalPrice)}</Text>
                          <Badge label="Ödənilib" variant="savings" />
                        </View>
                      </View>

                      <Divider marginVertical="sm" />

                      <View style={styles.codeRow}>
                        <Text style={styles.codeLabel}>KOD: {booking.bookingCode}</Text>
                      </View>

                      {/* Main CTA */}
                      <Button
                        title="Rezervasiya detalları"
                        variant="primary"
                        onPress={() => router.push(`/trip/${booking.id}` as any)}
                        style={styles.detailsBtn}
                      />

                      {/* Quick Actions */}
                      <View style={styles.quickActionsRow}>
                        <Pressable
                          style={styles.quickActionBtn}
                          onPress={() => handleOpenNavigation(booking)}
                        >
                          <Navigation size={14} color={colors.primary} />
                          <Text style={styles.quickActionText}>İstiqamət</Text>
                        </Pressable>

                        <Pressable
                          style={styles.quickActionBtn}
                          onPress={() => router.push('/account/support')}
                        >
                          <Headset size={14} color={colors.primary} />
                          <Text style={styles.quickActionText}>Dəstək</Text>
                        </Pressable>
                      </View>
                    </View>
                  </Card>
                ))
              )}
            </View>
          )}

          {/* PAST LIST */}
          {activeSegment === 'past' && (
            <View style={styles.listSection}>
              {pastBookings.length === 0 ? (
                <EmptyState
                  icon={<Ticket size={36} color={colors.textSecondary} />}
                  title="Keçmiş səfəriniz yoxdur"
                  description="Tamamlanan və ya ləğv edilən səfərlər burada qeyd olunacaq."
                />
              ) : (
                pastBookings.map((booking) => {
                  const isCancelled = booking.status === 'cancelled';
                  return (
                    <Card
                      key={booking.id}
                      style={styles.pastCard}
                      onPress={() => router.push(`/trip/${booking.id}` as any)}
                    >
                      <Image
                        source={{ uri: booking.hotelImage }}
                        style={styles.pastImg}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                        transition={150}
                      />
                      <View style={styles.pastInfoCol}>
                        <View style={styles.pastBadgeRow}>
                          <Badge
                            label={isCancelled ? 'Ləğv edilib' : 'Tamamlandı'}
                            variant={isCancelled ? 'urgency' : 'primary'}
                          />
                        </View>
                        <Text style={styles.pastHotelName} numberOfLines={1}>
                          {booking.hotelName}
                        </Text>
                        <Text style={styles.pastDates}>
                          {formatDate(booking.checkInDate, 'short')} · {formatPrice(booking.totalPrice)}
                        </Text>

                        {/* Rebook Button */}
                        <Pressable
                          style={styles.rebookBtn}
                          onPress={() => router.push(`/hotel/${booking.hotelId}` as any)}
                        >
                          <RotateCw size={13} color={colors.primary} />
                          <Text style={styles.rebookBtnText}>Yenidən rezerv et</Text>
                        </Pressable>
                      </View>
                    </Card>
                  );
                })
              )}
            </View>
          )}

          {/* Bottom Account Shortcut Card */}
          <Card
            style={styles.accountShortcutCard}
            onPress={() => router.push('/(tabs)/account')}
          >
            <View style={styles.accountShortcutLeft}>
              <View style={styles.accountIconCircle}>
                <UserRound size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.accountGuestName}>
                  {user ? `${user.firstName} ${user.lastName}` : 'Hesabım'}
                </Text>
                <Text style={styles.accountSubtitle}>Hesab və profil tənzimləmələri</Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textSecondary} />
          </Card>
        </ScrollView>
      )}
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
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  authScroll: {
    padding: spacing.lg,
  },
  authPromptCard: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  authPromptIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  authPromptTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
  },
  authPromptDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  authBtnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.md,
  },
  authBtn: {
    flex: 1,
    height: 50,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    padding: 4,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  segmentBtnActive: {
    backgroundColor: colors.primaryTint,
    borderWidth: 1,
    borderColor: colors.brand,
  },
  segmentText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  listSection: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  upcomingCard: {
    padding: 0,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  upcomingImgWrapper: {
    width: '100%',
    height: 168,
    position: 'relative',
    backgroundColor: colors.surfaceHighlight,
  },
  upcomingImg: {
    width: '100%',
    height: '100%',
  },
  upcomingStatusBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.savings,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  upcomingStatusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  upcomingDetails: {
    padding: spacing.lg,
  },
  upcomingHotelName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  upcomingRoomType: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  datesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  datesText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  priceLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  priceValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  priceValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  codeLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  detailsBtn: {
    height: 50,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surfaceHighlight,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  pastCard: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  pastImg: {
    width: 88,
    height: 104,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceHighlight,
  },
  pastInfoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  pastBadgeRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  pastHotelName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  pastDates: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  rebookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryTint,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.brand,
  },
  rebookBtnText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  accountShortcutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  accountShortcutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  accountIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountGuestName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  accountSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});