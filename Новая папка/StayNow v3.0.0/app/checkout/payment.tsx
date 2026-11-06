import React, { useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import {
  CreditCard,
  LockKeyhole,
  LogIn,
  Moon,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserPlus,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  Button,
  Card,
  Divider,
  Input,
  ScreenHeader,
  Toast,
} from '@/components/ui';
import { CheckoutProgressBar } from '@/components/checkout/CheckoutProgressBar';
import {
  formatCardExpiry,
  formatCardNumber,
  PaymentCardFormData,
  paymentCardSchema,
} from '@/features/checkout/schemas';
import { useAuthStore, useBookingsStore } from '@/store';
import { Booking } from '@/types/hotel';
import { formatDate, formatNights, formatPrice } from '@/utils/format';
import { colors, radius, shadows, spacing, typography } from '@/theme';

export default function CheckoutPaymentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { bookingDraft, addBooking, setBookingDraft } = useBookingsStore();
  const { user, isAuthenticated } = useAuthStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Card input refs
  const expiryRef = useRef<any>(null);
  const cvcRef = useRef<any>(null);
  const cardholderRef = useRef<any>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentCardFormData>({
    resolver: zodResolver(paymentCardSchema),
    defaultValues: {
      cardNumber: '',
      expiry: '',
      cvc: '',
      cardholderName: user ? `${user.firstName} ${user.lastName}`.toUpperCase() : '',
    },
  });

  // Fallback demo draft if page accessed directly
  const draft = bookingDraft ?? {
    hotelId: 'bulevard-house',
    hotelName: 'Bulevard House',
    hotelImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
    hotelAddress: 'Neftçilər prospekti 45, Səbail',
    room: {
      id: 'bh-deluxe-sea',
      name: 'Deluxe Dəniz Mənzərəli Otaq',
      capacity: 2,
      bedType: '1 King Size',
      breakfastPolicy: 'Səhər yeməyi daxildir',
      price: 135,
      image: '',
      features: [],
    },
    checkInDate: '2026-11-14',
    checkOutDate: '2026-11-16',
    nights: 2,
    guests: { adults: 2, children: 0, rooms: 1 },
    nightlyPrice: 135,
    basePrice: 270,
    taxes: 49,
    serviceFee: 14,
    totalPrice: 333,
    savings: 110,
    guestInfo: {
      firstName: user?.firstName || 'Elşən',
      lastName: user?.lastName || 'Məmmədov',
      email: user?.email || 'elshan@staynow.az',
      phone: user?.phone || '+994 50 123 45 67',
    },
  };

  const onPay = async (cardData: PaymentCardFormData) => {
    Keyboard.dismiss();
    setErrorMessage(null);

    // Simulated failure if CVC is "000"
    if (cardData.cvc === '000') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMessage('Bank əməliyyatı rədd etdi: Kart balansı yetərli deyil və ya məlumatlar yanlışdır.');
      return;
    }

    setIsProcessing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Simulate mock payment processing delay (1.5 seconds)
    setTimeout(() => {
      setIsProcessing(false);

      // Generate random unique booking code (e.g. SN-842915)
      const bookingCode = `SN-${Math.floor(100000 + Math.random() * 900000)}`;

      const newBooking: Booking = {
        id: `bk-${Date.now()}`,
        hotelId: draft.hotelId,
        hotelName: draft.hotelName,
        hotelImage: draft.hotelImage,
        hotelAddress: draft.hotelAddress,
        roomType: draft.room.name,
        checkInDate: draft.checkInDate,
        checkOutDate: draft.checkOutDate,
        nights: draft.nights,
        guests: draft.guests,
        guestInfo: draft.guestInfo || {
          firstName: user?.firstName || 'Qonaq',
          lastName: user?.lastName || 'İstifadəçi',
          email: user?.email || '',
          phone: user?.phone || '',
        },
        totalPrice: draft.totalPrice,
        status: 'confirmed',
        bookingCode,
        createdAt: new Date().toISOString(),
      };

      // Add to store and clear draft
      addBooking(newBooking);
      setBookingDraft(null);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Navigate to confirmation with stack replace
      router.replace({
        pathname: '/checkout/confirmation',
        params: { bookingId: newBooking.id },
      });
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader
          title="Rezervasiya və Ödəniş"
          onBack={() => router.back()}
        />
        <CheckoutProgressBar currentStep={2} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Error Toast / Banner if transaction fails */}
        {errorMessage && (
          <View style={styles.errorCard}>
            <ShieldAlert size={20} color={colors.urgency} />
            <Text style={styles.errorCardText}>{errorMessage}</Text>
          </View>
        )}

        {/* 1. Rezervasiya Xülasəsi Kartı (Figma node 6:10295) */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Image
              source={{ uri: draft.hotelImage }}
              style={styles.summaryHotelImg}
              contentFit="cover"
              cachePolicy="memory-disk"
              transition={150}
            />
            <View style={styles.summaryHotelInfo}>
              <Text style={styles.summaryHotelName} numberOfLines={1}>
                {draft.hotelName}
              </Text>
              <Text style={styles.summaryHotelAddress} numberOfLines={1}>
                {draft.hotelAddress}
              </Text>
              <Text style={styles.summaryRoomType} numberOfLines={1}>
                {draft.room.name}
              </Text>
            </View>
          </View>

          <Divider marginVertical="sm" />

          {/* Dates & Nights Timeline */}
          <View style={styles.datesTimeline}>
            <View style={styles.dateCol}>
              <Text style={styles.dateColLabel}>GİRİŞ</Text>
              <Text style={styles.dateColVal}>
                {formatDate(draft.checkInDate, 'short')}
              </Text>
              <Text style={styles.dateTimeText}>14:00-dan</Text>
            </View>

            <View style={styles.moonPill}>
              <Moon size={12} color={colors.primary} />
              <Text style={styles.moonPillText}>{formatNights(draft.nights)}</Text>
            </View>

            <View style={[styles.dateCol, { alignItems: 'flex-end' }]}>
              <Text style={styles.dateColLabel}>ÇIXIŞ</Text>
              <Text style={styles.dateColVal}>
                {formatDate(draft.checkOutDate, 'short')}
              </Text>
              <Text style={styles.dateTimeText}>12:00-dək</Text>
            </View>
          </View>
        </Card>

        {/* 2. Authentication Requirement Block (Figma node 10:45) */}
        {!isAuthenticated && (
          <Card style={styles.authRequirementCard}>
            <View style={styles.authReqIcon}>
              <LockKeyhole size={24} color={colors.brand} />
            </View>
            <Text style={styles.authReqTitle}>Giriş Tələb Olunur</Text>
            <Text style={styles.authReqDesc}>
              Rezervasiyanı tamamlamaq və rəsmi təsdiq qəbzini almaq üçün hesabınıza daxil olun və ya qeydiyyatdan keçin.
            </Text>

            <View style={styles.authReqBtnRow}>
              <Button
                title="Daxil ol"
                variant="primary"
                icon={<LogIn size={16} color={colors.white} />}
                onPress={() =>
                  router.push({
                    pathname: '/auth/login',
                    params: { returnTo: '/checkout/payment' },
                  })
                }
                style={styles.authReqBtn}
              />
              <Button
                title="Qeydiyyat"
                variant="secondary"
                icon={<UserPlus size={16} color={colors.text} />}
                onPress={() =>
                  router.push({
                    pathname: '/auth/signup',
                    params: { returnTo: '/checkout/payment' },
                  })
                }
                style={styles.authReqBtn}
              />
            </View>
          </Card>
        )}

        {/* 3. Kart Məlumatları Sahəsi (MOCK / DEMO) */}
        <View style={styles.cardSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Ödəniş Kartı</Text>
            <View style={styles.demoBadge}>
              <Text style={styles.demoBadgeText}>Demo Rejim</Text>
            </View>
          </View>

          <Controller
            control={control}
            name="cardNumber"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Kartın nömrəsi"
                placeholder="0000 0000 0000 0000"
                value={value}
                onChangeText={(text) => onChange(formatCardNumber(text))}
                onBlur={onBlur}
                keyboardType="numeric"
                returnKeyType="next"
                onSubmitEditing={() => expiryRef.current?.focus()}
                leftIcon={<CreditCard size={18} color={colors.textSecondary} />}
                error={errors.cardNumber?.message}
              />
            )}
          />

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Controller
                control={control}
                name="expiry"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    ref={expiryRef}
                    label="Son istifadə"
                    placeholder="AA/İİ"
                    value={value}
                    onChangeText={(text) => onChange(formatCardExpiry(text))}
                    onBlur={onBlur}
                    keyboardType="numeric"
                    returnKeyType="next"
                    onSubmitEditing={() => cvcRef.current?.focus()}
                    error={errors.expiry?.message}
                  />
                )}
              />
            </View>

            <View style={styles.flex1}>
              <Controller
                control={control}
                name="cvc"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    ref={cvcRef}
                    label="CVC / CVV"
                    placeholder="123"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="numeric"
                    maxLength={3}
                    secureTextEntry
                    returnKeyType="next"
                    onSubmitEditing={() => cardholderRef.current?.focus()}
                    error={errors.cvc?.message}
                  />
                )}
              />
            </View>
          </View>

          <Controller
            control={control}
            name="cardholderName"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                ref={cardholderRef}
                label="Kart sahibinin adı"
                placeholder="AD SOYAD"
                value={value}
                onChangeText={(text) => onChange(text.toUpperCase())}
                onBlur={onBlur}
                autoCapitalize="characters"
                returnKeyType="done"
                onSubmitEditing={() => handleSubmit(onPay)()}
                error={errors.cardholderName?.message}
              />
            )}
          />

          <Text style={styles.demoNoticeText}>
            🔒 Test rejimi aktivdir. Real kart məlumatları heç bir yerdə saxlanılmır və heç bir vəsait çıxılmır. (Uğursuz əməliyyat testi üçün CVC koduna 000 yazın).
          </Text>
        </View>

        <Divider marginVertical="md" />

        {/* 4. Qiymət Dökümü */}
        <Card style={styles.pricingCard}>
          <Text style={styles.pricingTitle}>Qiymət dökümü</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceRowLabel}>
              {formatPrice(draft.nightlyPrice)} × {formatNights(draft.nights)}
            </Text>
            <Text style={styles.priceRowVal}>{formatPrice(draft.basePrice)}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceRowLabel}>Vergilər (18% ƏDV)</Text>
            <Text style={styles.priceRowVal}>{formatPrice(draft.taxes)}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceRowLabel}>Xidmət haqqı (5%)</Text>
            <Text style={styles.priceRowVal}>{formatPrice(draft.serviceFee)}</Text>
          </View>

          <Divider marginVertical="sm" />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Cəmi məbləğ</Text>
            <Text style={styles.totalVal}>{formatPrice(draft.totalPrice)}</Text>
          </View>
        </Card>

        {/* 5. Ləğv Şərtləri Kartı */}
        <View style={styles.cancellationCard}>
          <ShieldCheck size={20} color={colors.savings} />
          <View style={styles.cancellationTextCol}>
            <Text style={styles.cancellationTitle}>Pulsuz Ləğvetmə</Text>
            <Text style={styles.cancellationDesc}>
              Girişə 24 saat qalmışadək rezervasiyanı heç bir cərimə olmadan pulsuz ləğv edə bilərsiniz.
            </Text>
          </View>
        </View>

        {/* 6. Razılıq Mətni */}
        <Text style={styles.agreementNotice}>
          "Ödə və rezerv et" düyməsinə basmaqla StayNow İstifadəçi Qaydaları, Məxfilik Siyasəti və Otelin Qayda-qanunları ilə razılaşdığınızı təsdiq edirsiniz.
        </Text>

        {/* 7. Action Button */}
        <Button
          title={isAuthenticated ? `Ödə və rezerv et (${formatPrice(draft.totalPrice)})` : 'Giriş Tələb Olunur'}
          variant="primary"
          icon={<LockKeyhole size={18} color={colors.white} />}
          loading={isProcessing}
          disabled={!isAuthenticated || isProcessing}
          onPress={handleSubmit(onPay)}
          style={styles.payButton}
        />

        <Text style={styles.securityFooterText}>
          Təhlükəsiz 256-bit SSL şifrələmə · Ani təsdiq
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.urgencyTint,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.urgency,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorCardText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    color: colors.urgency,
    fontWeight: typography.fontWeight.medium,
  },
  summaryCard: {
    padding: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  summaryHotelImg: {
    width: 78,
    height: 82,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceHighlight,
  },
  summaryHotelInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  summaryHotelName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  summaryHotelAddress: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  summaryRoomType: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
    marginTop: 4,
  },
  datesTimeline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  dateCol: {
    flex: 1,
  },
  dateColLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  dateColVal: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: 2,
  },
  dateTimeText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  moonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  moonPillText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  authRequirementCard: {
    padding: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.primaryTint,
    borderWidth: 1,
    borderColor: colors.brand,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
  },
  authReqIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  authReqTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
  },
  authReqDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  authReqBtnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.sm,
  },
  authReqBtn: {
    flex: 1,
    height: 44,
  },
  cardSection: {
    marginBottom: spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  demoBadge: {
    backgroundColor: colors.surfaceHighlight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  demoBadgeText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flex1: {
    flex: 1,
  },
  demoNoticeText: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16,
    marginTop: spacing.xs,
  },
  pricingCard: {
    padding: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  pricingTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceRowLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  priceRowVal: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  totalVal: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.brand,
  },
  cancellationCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  cancellationTextCol: {
    flex: 1,
  },
  cancellationTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  cancellationDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  agreementNotice: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: spacing.lg,
  },
  payButton: {
    height: 54, // 54px button as requested
    marginBottom: spacing.xs,
  },
  securityFooterText: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
});