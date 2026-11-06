import React, { useState } from 'react';
import {
  BackHandler,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Copy,
  Headset,
  MapPin,
  Navigation,
  Ticket,
  X,
} from 'lucide-react-native';
import {
  Button,
  Card,
  Divider,
  IconButton,
  StayNowLogo,
  Toast,
} from '@/components/ui';
import { CheckoutProgressBar } from '@/components/checkout/CheckoutProgressBar';
import { useBookingsStore } from '@/store';
import { formatDate, formatNights, formatPrice } from '@/utils/format';
import { colors, radius, shadows, spacing, typography } from '@/theme';

export default function CheckoutConfirmationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();

  const { getBookingById, bookings } = useBookingsStore();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Get confirmed booking or fallback to most recent booking
  const booking = bookingId
    ? getBookingById(bookingId)
    : bookings.length > 0
    ? bookings[0]
    : null;

  // Prevent back navigation into checkout
  React.useEffect(() => {
    const onBackPress = () => {
      router.replace('/(tabs)');
      return true;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [router]);

  const handleCopyCode = async () => {
    if (!booking) return;
    await Clipboard.setStringAsync(booking.bookingCode);
    Haptics.selectionAsync();
    setToastMessage('Təsdiq kodu kopyalandı!');
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleOpenNavigation = () => {
    if (!booking) return;
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

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      {/* Top Header with Logo and Close (X) */}
      <View
        style={[
          styles.topHeader,
          { paddingTop: Math.max(insets.top, 16) },
        ]}
      >
        <StayNowLogo size={34} />
        <IconButton
          icon={<X size={20} color={colors.text} />}
          variant="ghost"
          size={40}
          onPress={handleClose}
          accessibilityLabel="Bağla"
        />
      </View>

      <CheckoutProgressBar currentStep={3} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Uğur Möhürü (80px Success Seal) */}
        <View style={styles.sealWrapper}>
          <View style={styles.sealCircleOuter}>
            <View style={styles.sealCircleInner}>
              <Text style={styles.sealLetter}>S</Text>
              <View style={styles.sealCheckCircle}>
                <Check size={16} color={colors.white} strokeWidth={3} />
              </View>
            </View>
          </View>

          <Text style={styles.successTitle}>Rezervasiyanız Təsdiqləndi!</Text>
          <Text style={styles.successSubtitle}>
            Təşəkkür edirik! Rezervasiya qəbzi və təfərrüatları{' '}
            <Text style={styles.emailHighlight}>
              {booking?.guestInfo.email || 'e-poçt ünvanınıza'}
            </Text>{' '}
            göndərildi.
          </Text>
        </View>

        {/* 2. Rezervasiya Qəbzi Kartı (Figma node 6:10396) */}
        {booking && (
          <Card style={styles.receiptCard}>
            <View style={styles.receiptHeaderRow}>
              <Image
                source={{ uri: booking.hotelImage }}
                style={styles.receiptImg}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={150}
              />
              <View style={styles.receiptInfoCol}>
                <View style={styles.hotelTitleRow}>
                  <Text style={styles.hotelName} numberOfLines={1}>
                    {booking.hotelName}
                  </Text>
                  <BadgeCheck size={18} color={colors.savings} />
                </View>
                <Text style={styles.roomType} numberOfLines={1}>
                  {booking.roomType}
                </Text>
                <Text style={styles.guestCountText}>
                  {booking.guests.adults} böyük · {formatNights(booking.nights)}
                </Text>
              </View>
            </View>

            <Divider marginVertical="sm" />

            {/* Check-in -> Check-out timeline */}
            <View style={styles.stayTimeline}>
              <View style={styles.stayDateBlock}>
                <Text style={styles.stayDateLabel}>GİRİŞ</Text>
                <Text style={styles.stayDateVal}>
                  {formatDate(booking.checkInDate, 'short')}
                </Text>
                <Text style={styles.stayTimeText}>14:00-dan</Text>
              </View>

              <View style={styles.timelineArrowCircle}>
                <ArrowRight size={14} color={colors.primary} />
              </View>

              <View style={[styles.stayDateBlock, { alignItems: 'flex-end' }]}>
                <Text style={styles.stayDateLabel}>ÇIXIŞ</Text>
                <Text style={styles.stayDateVal}>
                  {formatDate(booking.checkOutDate, 'short')}
                </Text>
                <Text style={styles.stayTimeText}>12:00-dək</Text>
              </View>
            </View>

            <Divider marginVertical="sm" />

            {/* Booking Code with Copy Button */}
            <View style={styles.codeRow}>
              <View>
                <Text style={styles.codeLabel}>REZERVASIYA KODU</Text>
                <Text style={styles.codeValue}>{booking.bookingCode}</Text>
              </View>

              <Pressable
                style={styles.copyBtn}
                onPress={handleCopyCode}
              >
                <Copy size={15} color={colors.primary} />
                <Text style={styles.copyBtnText}>Kopyala</Text>
              </Pressable>
            </View>

            <Divider marginVertical="sm" />

            {/* Paid Total */}
            <View style={styles.paidRow}>
              <View>
                <Text style={styles.paidLabel}>Ödənilən Məbləğ</Text>
                <Text style={styles.taxInclusiveText}>Bütün vergilər daxildir</Text>
              </View>
              <Text style={styles.paidValue}>{formatPrice(booking.totalPrice)}</Text>
            </View>
          </Card>
        )}

        {/* 3. Məkan və Giriş Xatırlatması */}
        {booking && (
          <View style={styles.locationCard}>
            <MapPin size={18} color={colors.primary} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationAddress}>{booking.hotelAddress}</Text>
              <Text style={styles.locationNotice}>
                Giriş zamanı şəxsiyyəti təsdiq edən sənədi və rezervasiya kodunu təqdim edin.
              </Text>
            </View>
          </View>
        )}

        {/* 4. Əsas Fəaliyyət Düymələri */}
        <View style={styles.actionsContainer}>
          <Button
            title="İstiqamət al (Xəritə)"
            variant="primary"
            icon={<Navigation size={18} color={colors.white} />}
            onPress={handleOpenNavigation}
            style={styles.actionBtn}
          />

          <Button
            title="Səfərlərimə bax"
            variant="secondary"
            icon={<Ticket size={18} color={colors.text} />}
            onPress={() => router.replace('/(tabs)/trips')}
            style={styles.actionBtn}
          />
        </View>

        {/* 5. Müştəri Dəstəyi Keçidi */}
        <Pressable
          style={styles.supportLink}
          onPress={() => router.push('/account/support')}
        >
          <Headset size={16} color={colors.primary} />
          <Text style={styles.supportLinkText}>Kömək lazımdır? Dəstək xidmətinə yazın</Text>
        </Pressable>
      </ScrollView>

      {/* Copy Toast */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <Toast
            message={toastMessage}
            type="success"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  sealWrapper: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  sealCircleOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryTint,
    borderWidth: 2,
    borderColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  sealCircleInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  sealLetter: {
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  sealCheckCircle: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.savings,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  emailHighlight: {
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  receiptCard: {
    padding: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  receiptHeaderRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  receiptImg: {
    width: 78,
    height: 78,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceHighlight,
  },
  receiptInfoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  hotelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hotelName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  roomType: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  guestCountText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
    marginTop: 4,
  },
  stayTimeline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  stayDateBlock: {
    flex: 1,
  },
  stayDateLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  stayDateVal: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: 2,
  },
  stayTimeText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  timelineArrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  codeValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.brand,
    letterSpacing: 1,
    marginTop: 2,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryTint,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.brand,
  },
  copyBtnText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  paidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paidLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  taxInclusiveText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  paidValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.savings,
  },
  locationCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  locationInfo: {
    flex: 1,
  },
  locationAddress: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  locationNotice: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  actionsContainer: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionBtn: {
    height: 54, // 54px button as requested
  },
  supportLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
  },
  supportLinkText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  toastContainer: {
    position: 'absolute',
    bottom: 40,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 999,
  },
});