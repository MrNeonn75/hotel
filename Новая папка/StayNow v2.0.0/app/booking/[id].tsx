import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';

import { useTheme } from '@/hooks/useTheme';
import { useSearchStore } from '@/store/searchStore';
import { useProfileStore } from '@/store/profileStore';
import { useHistoryStore, Booking } from '@/store/historyStore';
import { getHotelById } from '@/services/hotelService';
import { bookingService, BookingItemResponse } from '@/services/bookingService';
import { profileService } from '@/services/profileService';
import { Hotel } from '@/types/hotel';
import {
  formatPrice,
  formatDateRange,
  formatDateShort,
  formatGuests,
  nightsBetween,
} from '@/utils/format';

import { FloatingInput } from '@/components/ui/FloatingInput';
import { Button } from '@/components/ui/Button';
import { SlideToBook } from '@/components/booking/SlideToBook';
import { Divider } from '@/components/ui/Divider';
import { Skeleton } from '@/components/ui/Skeleton';
import { DateGuestModal } from '@/components/hotel/DateGuestModal';

// Validation Schema
const bookingSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Ad ən azı 2 hərfdən ibarət olmalıdır'),
  lastName: z
    .string()
    .min(2, 'Soyad ən azı 2 hərfdən ibarət olmalıdır'),
  phone: z
    .string()
    .min(9, 'Düzgün əlaqə nömrəsi daxil edin (məs. +994 50 123 45 67)'),
  email: z
    .string()
    .email('Düzgün email ünvanı daxil edin'),
  specialRequests: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function BookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, typography, radius, isDark } = useTheme();

  const { checkIn, checkOut, guests } = useSearchStore();
  const { profile, setProfile } = useProfileStore();
  const { addBooking } = useHistoryStore();

  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  // Forma açılanda expo-crypto ilə təzə və sabit UUID yaradılır
  const idempotencyKeyRef = useRef(Crypto.randomUUID());

  // Success screen check animation
  const checkScale = useRef(new Animated.Value(0)).current;

  // Query hotel
  const {
    data: hotel,
    isLoading,
    isError,
  } = useQuery<Hotel | null>({
    queryKey: ['hotel', id],
    queryFn: () => getHotelById(id as string, checkIn, checkOut),
    enabled: Boolean(id),
  });

  // Profil məlumatlarını Profil API-dən gətir və doldur
  const { data: serverProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileService.getProfile(),
    staleTime: 1000 * 60 * 5,
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phone: profile.phone || '',
      email: profile.email || '',
      specialRequests: '',
    },
  });

  // Auto-fill from local profile or server profile
  useEffect(() => {
    const fName = profile.firstName || serverProfile?.firstName;
    const lName = profile.lastName || serverProfile?.lastName;
    const ph = profile.phone || serverProfile?.phone;
    const em = profile.email || serverProfile?.email;

    if (fName) setValue('firstName', fName);
    if (lName) setValue('lastName', lName);
    if (ph) setValue('phone', ph);
    if (em) setValue('email', em);
  }, [profile, serverProfile, setValue]);

  // Price calculations
  const nights = nightsBetween(checkIn, checkOut);
  const discountedPricePerNight = hotel ? hotel.discountedPrice : 0;
  const standardPricePerNight = hotel ? hotel.standardPrice : 0;

  const totalDiscountedPrice = nights * discountedPricePerNight;
  const totalStandardPrice = nights * standardPricePerNight;
  const totalSavings = totalStandardPrice - totalDiscountedPrice;

  const onSubmit = async (formData: BookingFormData) => {
    if (!hotel) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsSubmitting(true);

    // Save profile locally and sync to server profile in background
    setProfile({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      email: formData.email,
    });
    profileService
      .updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
      })
      .catch(() => {});

    try {
      let bookingResponse: BookingItemResponse;

      if (process.env.EXPO_PUBLIC_USE_MOCK === '1') {
        bookingResponse = {
          id: `booking-${Date.now()}`,
          reference: `HT-${Math.floor(100000 + Math.random() * 900000)}`,
          hotelId: hotel.id,
          checkIn,
          checkOut,
          nights,
          adults: guests.adults,
          children: guests.children,
          pricePerNight: discountedPricePerNight,
          discountAmount: totalSavings,
          totalPrice: totalDiscountedPrice,
          currency: 'AZN',
          status: 'confirmed',
          paymentStatus: 'pending_at_hotel',
          createdAt: new Date().toISOString(),
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email,
          specialRequests: formData.specialRequests,
        };
      } else {
        bookingResponse = await bookingService.createBooking(
          {
            hotelId: hotel.id,
            checkIn,
            checkOut,
            adults: guests.adults,
            children: guests.children,
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim(),
            specialRequests: formData.specialRequests?.trim() || undefined,
          },
          idempotencyKeyRef.current
        );
      }

      // Qiymət və nömrə (reference) YALNIZ serverdən gələn cavabdan ekranda göstərilir
      const newBooking: Booking = {
        id: bookingResponse.id,
        bookingNumber: bookingResponse.reference,
        hotelId: hotel.id,
        hotelName:
          (bookingResponse.hotel as any)?.name ||
          bookingResponse.hotelSnapshot?.name ||
          hotel.name,
        hotelImage:
          bookingResponse.hotelSnapshot?.image ||
          hotel.images[0],
        neighborhood:
          (bookingResponse.hotel as any)?.neighborhood ||
          hotel.neighborhood,
        city:
          (bookingResponse.hotel as any)?.city ||
          hotel.city,
        starRating:
          (bookingResponse.hotel as any)?.starRating ||
          hotel.starRating,
        checkIn: bookingResponse.checkIn,
        checkOut: bookingResponse.checkOut,
        nights: bookingResponse.nights,
        guests: {
          adults: bookingResponse.adults,
          children: bookingResponse.children,
        },
        totalPrice: bookingResponse.totalPrice, // Yalnız serverdən gələn məbləğ!
        guestName: `${bookingResponse.firstName} ${bookingResponse.lastName}`,
        guestPhone: bookingResponse.phone,
        guestEmail: bookingResponse.email,
        specialRequests: bookingResponse.specialRequests || undefined,
        status: bookingResponse.status,
        createdAt: bookingResponse.createdAt,
      };

      // Save to history store
      addBooking(newBooking);

      setIsSubmitting(false);
      setCreatedBooking(newBooking);

      // Play success check bounce
      Animated.spring(checkScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } catch (err: any) {
      setIsSubmitting(false);
      const isNoAvailability =
        err?.code === 'NO_AVAILABILITY' ||
        err?.message?.includes('otaq qalmayıb') ||
        err?.message?.includes('availability');

      const message = isNoAvailability
        ? 'Təəssüf ki, seçilmiş tarixlər üçün bu oteldə boş otaq qalmayıb.'
        : err?.message || 'Rezervasiya zamanı xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.';

      Alert.alert('Rezervasiya xətası', message);
    }
  };

  const renderStars = (count: number) => {
    return '★'.repeat(Math.max(1, Math.min(5, count)));
  };

  // ═══ UĞUR EKRANI (FULLSCREEN) ═══
  if (createdBooking) {
    return (
      <View style={[styles.successContainer, { backgroundColor: colors.primary }]}>
        <Stack.Screen options={{ headerShown: false }} />

        <ScrollView
          contentContainerStyle={[
            styles.successScroll,
            { paddingTop: insets.top + 30, paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Animasiyalı Ağ Checkmark */}
          <Animated.View
            style={[
              styles.successCircle,
              {
                transform: [{ scale: checkScale }],
              },
            ]}
          >
            <Ionicons name="checkmark" size={48} color={colors.primary} />
          </Animated.View>

          <Text style={[typography.display, styles.successTitle]}>
            Rezervasiya təsdiqləndi!
          </Text>

          <Text style={[typography.body, styles.successSubtitle]}>
            Təbrik edirik! Oteliniz bu gecə üçün hazırdır.
          </Text>

          {/* Rezervasiya nömrəsi pilli */}
          <View style={styles.bookingNumberPill}>
            <Text style={styles.bookingNumberText}>
              Rezervasiya № {createdBooking.bookingNumber}
            </Text>
          </View>

          {/* Xülasə Kartı */}
          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: isDark ? colors.surfaceAlt : '#FFFFFF',
                borderRadius: radius.card + 4,
              },
            ]}
          >
            <Text
              style={[
                typography.heading,
                { color: colors.text, fontSize: 18, marginBottom: 4 },
              ]}
              numberOfLines={1}
            >
              {createdBooking.hotelName}
            </Text>

            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              {createdBooking.neighborhood}, {createdBooking.city}
            </Text>

            <Divider spacing={14} />

            <View style={styles.summaryItemRow}>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                Tarix:
              </Text>
              <Text style={[typography.caption, { color: colors.text, fontWeight: '700' }]}>
                {formatDateRange(createdBooking.checkIn, createdBooking.checkOut)} ({createdBooking.nights} gecə)
              </Text>
            </View>

            <View style={[styles.summaryItemRow, { marginTop: 8 }]}>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                Qonaqlar:
              </Text>
              <Text style={[typography.caption, { color: colors.text, fontWeight: '700' }]}>
                {formatGuests(createdBooking.guests.adults, createdBooking.guests.children)}
              </Text>
            </View>

            <View style={[styles.summaryItemRow, { marginTop: 8 }]}>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                Qonaq adı:
              </Text>
              <Text style={[typography.caption, { color: colors.text, fontWeight: '700' }]}>
                {createdBooking.guestName}
              </Text>
            </View>

            <Divider spacing={14} />

            <View style={styles.summaryItemRow}>
              <Text style={[typography.heading, { color: colors.text, fontSize: 16 }]}>
                Yekun məbləğ:
              </Text>
              <Text style={[typography.title, { color: colors.primary, fontSize: 20 }]}>
                {formatPrice(createdBooking.totalPrice)}
              </Text>
            </View>

            <Text style={[typography.micro, { color: colors.textSecondary, marginTop: 4, textAlign: 'right' }]}>
              Ödəniş otelə çatanda ediləcək
            </Text>
          </View>

          {/* Fəaliyyət Düymələri */}
          <View style={styles.successActions}>
            <Button
              title="Tarixçəyə bax"
              onPress={() => router.replace('/(tabs)/history' as any)}
              style={styles.historyBtn}
              textStyle={{ color: colors.primary, fontWeight: '800' }}
            />

            <Pressable
              onPress={() => router.replace('/(tabs)' as any)}
              style={styles.homeBtn}
              hitSlop={8}
            >
              <Text style={[typography.body, styles.homeBtnText]}>
                Ana səhifəyə qayıt
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ═══ YÜKLƏNMƏ / XƏTA ═══
  if (isLoading || !hotel) {
    return (
      <View style={[styles.container, { backgroundColor: colors.surfaceAlt }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ padding: 20, paddingTop: insets.top + 20 }}>
          <Skeleton width={120} height={20} borderRadius={6} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={100} borderRadius={16} style={{ marginBottom: 16 }} />
          <Skeleton width="100%" height={140} borderRadius={16} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.surfaceAlt }]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* Üst Başlıq və Geri Düyməsi */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top + 8,
            backgroundColor: isDark ? colors.background : '#FFFFFF',
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            router.back();
          }}
          hitSlop={12}
          style={[styles.backCircleBtn, { backgroundColor: colors.surfaceAlt }]}
        >
          <Ionicons name="close" size={20} color={colors.text} />
        </Pressable>

        <Text style={[typography.heading, { color: colors.text, fontSize: 18 }]}>
          Rezervasiyanı tamamla
        </Text>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. Otel Xülasəsi Kartı */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? colors.background : '#FFFFFF',
              borderColor: colors.border,
              borderRadius: radius.card,
            },
          ]}
        >
          <Image
            source={{ uri: hotel.images[0] }}
            style={[styles.hotelThumbnail, { borderRadius: radius.card - 4 }]}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
          <View style={styles.hotelInfo}>
            <Text
              style={[typography.heading, { color: colors.text, fontSize: 16 }]}
              numberOfLines={2}
            >
              {hotel.name}
            </Text>
            <Text style={{ color: colors.star, fontSize: 12, marginTop: 2, fontWeight: '700' }}>
              {renderStars(hotel.starRating)}
            </Text>
            <Text
              style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}
              numberOfLines={1}
            >
              {hotel.address}
            </Text>
          </View>
        </View>

        {/* 2. "Qalma detalları" Kartı */}
        <View
          style={[
            styles.card,
            styles.columnCard,
            {
              backgroundColor: isDark ? colors.background : '#FFFFFF',
              borderColor: colors.border,
              borderRadius: radius.card,
            },
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <Text style={[typography.heading, { color: colors.text, fontSize: 16 }]}>
              Qalma detalları
            </Text>
            <Pressable
              onPress={() => setDateModalVisible(true)}
              hitSlop={8}
            >
              <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
                Dəyişdir
              </Text>
            </Pressable>
          </View>

          {/* Tarixlər qutusu */}
          <Pressable
            onPress={() => setDateModalVisible(true)}
            style={styles.datesBoxRow}
          >
            {/* Check-in */}
            <View
              style={[
                styles.dateBox,
                { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
              ]}
            >
              <Text style={[typography.micro, { color: colors.textSecondary }]}>
                Giriş (Check-in)
              </Text>
              <Text style={[typography.heading, { color: colors.text, fontSize: 15, marginTop: 2 }]}>
                {formatDateShort(checkIn)}
              </Text>
              <Text style={[typography.micro, { color: colors.textSecondary, marginTop: 2 }]}>
                saat {hotel.checkInTime}
              </Text>
            </View>

            <Ionicons
              name="arrow-forward"
              size={18}
              color={colors.textSecondary}
              style={{ marginHorizontal: 8 }}
            />

            {/* Check-out */}
            <View
              style={[
                styles.dateBox,
                { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
              ]}
            >
              <Text style={[typography.micro, { color: colors.textSecondary }]}>
                Çıxış (Check-out)
              </Text>
              <Text style={[typography.heading, { color: colors.text, fontSize: 15, marginTop: 2 }]}>
                {formatDateShort(checkOut)}
              </Text>
              <Text style={[typography.micro, { color: colors.textSecondary, marginTop: 2 }]}>
                saat {hotel.checkOutTime}
              </Text>
            </View>
          </Pressable>

          {/* Gecə və qonaq xülasəsi */}
          <View style={[styles.detailSummaryRow, { borderTopColor: colors.border }]}>
            <View style={styles.detailItem}>
              <Ionicons name="moon-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={[typography.caption, { color: colors.text, fontWeight: '600' }]}>
                {nights} gecə
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="people-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={[typography.caption, { color: colors.text, fontWeight: '600' }]}>
                {formatGuests(guests.adults, guests.children)}
              </Text>
            </View>
          </View>
        </View>

        {/* 3. "Qonaq məlumatları" Kartı */}
        <View
          style={[
            styles.card,
            styles.columnCard,
            {
              backgroundColor: isDark ? colors.background : '#FFFFFF',
              borderColor: colors.border,
              borderRadius: radius.card,
            },
          ]}
        >
          <Text style={[typography.heading, { color: colors.text, fontSize: 16, marginBottom: 14 }]}>
            Qonaq məlumatları
          </Text>

          {/* Ad */}
          <Controller
            control={control}
            name="firstName"
            render={({ field: { onChange, onBlur, value } }) => (
              <FloatingInput
                label="Ad"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.firstName?.message}
                autoCapitalize="words"
              />
            )}
          />

          {/* Soyad */}
          <Controller
            control={control}
            name="lastName"
            render={({ field: { onChange, onBlur, value } }) => (
              <FloatingInput
                label="Soyad"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.lastName?.message}
                autoCapitalize="words"
              />
            )}
          />

          {/* Telefon */}
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <FloatingInput
                label="Əlaqə nömrəsi (+994)"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.phone?.message}
                keyboardType="phone-pad"
              />
            )}
          />

          {/* Email */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <FloatingInput
                label="Email ünvanı"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
          />

          {/* Xüsusi istəklər */}
          <Controller
            control={control}
            name="specialRequests"
            render={({ field: { onChange, onBlur, value } }) => (
              <FloatingInput
                label="Xüsusi istəklər (ixtiyari)"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
              />
            )}
          />
        </View>

        {/* 4. "Qiymət detalları" Kartı */}
        <View
          style={[
            styles.card,
            styles.columnCard,
            {
              backgroundColor: isDark ? colors.background : '#FFFFFF',
              borderColor: colors.border,
              borderRadius: radius.card,
            },
          ]}
        >
          <Text style={[typography.heading, { color: colors.text, fontSize: 16, marginBottom: 14 }]}>
            Qiymət detalları
          </Text>

          {/* Gecəlik qiymət sətri */}
          <View style={styles.priceDetailRow}>
            <Text style={[typography.body, { color: colors.textSecondary }]}>
              {nights} gecə × {hotel.discountedPrice} ₼
            </Text>
            <Text style={[typography.body, { color: colors.text, fontWeight: '600' }]}>
              {formatPrice(totalDiscountedPrice)}
            </Text>
          </View>

          {/* Endirim sətri */}
          {totalSavings > 0 && (
            <View style={[styles.priceDetailRow, { marginTop: 8 }]}>
              <Text style={[typography.body, { color: colors.savings }]}>
                Endirim ({hotel.discountPercent}%)
              </Text>
              <Text style={[typography.body, { color: colors.savings, fontWeight: '700' }]}>
                -{formatPrice(totalSavings)}
              </Text>
            </View>
          )}

          {/* Xidmət haqqı */}
          <View style={[styles.priceDetailRow, { marginTop: 8 }]}>
            <Text style={[typography.body, { color: colors.textSecondary }]}>
              Xidmət haqqı
            </Text>
            <Text style={[typography.body, { color: colors.savings, fontWeight: '600' }]}>
              0 ₼ (Pulsuz)
            </Text>
          </View>

          <Divider spacing={14} />

          {/* Yekun məbləğ */}
          <View style={styles.priceDetailRow}>
            <Text style={[typography.heading, { color: colors.text, fontSize: 18 }]}>
              Yekun məbləğ
            </Text>
            <Text
              style={[
                typography.display,
                { color: colors.primary, fontSize: 24, lineHeight: 28 },
              ]}
            >
              {formatPrice(totalDiscountedPrice)}
            </Text>
          </View>

          {/* Qeyd */}
          <View
            style={[
              styles.paymentNoticeBox,
              { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
            ]}
          >
            <Ionicons
              name="cash-outline"
              size={18}
              color={colors.primary}
              style={{ marginRight: 8, marginTop: 2 }}
            />
            <Text
              style={[
                typography.caption,
                { color: colors.text, flex: 1, lineHeight: 18 },
              ]}
            >
              Ödəniş otelə çatanda edilir. Hələlik onlayn ödəniş və kart tələb olunmur.
            </Text>
          </View>
        </View>

        {/* 5. "Ləğv şərtləri" Kartı */}
        <View
          style={[
            styles.card,
            styles.columnCard,
            {
              backgroundColor: isDark ? colors.background : '#FFFFFF',
              borderColor: colors.border,
              borderRadius: radius.card,
            },
          ]}
        >
          <Text style={[typography.heading, { color: colors.text, fontSize: 16, marginBottom: 10 }]}>
            Ləğv şərtləri
          </Text>

          {hotel.freeCancellation ? (
            <View
              style={[
                styles.cancellationNotice,
                {
                  backgroundColor: isDark ? 'rgba(52,211,153,0.15)' : '#E8F7F0',
                  borderColor: colors.savings,
                },
              ]}
            >
              <Ionicons
                name="shield-checkmark"
                size={20}
                color={colors.savings}
                style={{ marginRight: 10, marginTop: 2 }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    typography.body,
                    { color: colors.savings, fontWeight: '700', fontSize: 14 },
                  ]}
                >
                  Pulsuz ləğvetmə
                </Text>
                <Text
                  style={[
                    typography.caption,
                    { color: colors.text, marginTop: 2, lineHeight: 18 },
                  ]}
                >
                  Giriş gününədək bu rezervasiyanı heç bir cərimə olmadan ləğv edə bilərsiniz.
                </Text>
              </View>
            </View>
          ) : (
            <View
              style={[
                styles.cancellationNotice,
                { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
              ]}
            >
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color={colors.textSecondary}
                style={{ marginRight: 10, marginTop: 2 }}
              />
              <Text
                style={[
                  typography.caption,
                  { color: colors.textSecondary, flex: 1, lineHeight: 18 },
                ]}
              >
                Xüsusi endirimli tarif olduğu üçün bu rezervasiya ləğv edilə bilməz.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 6. Sticky Alt Panel */}
      <View
        style={[
          styles.bottomStickyBar,
          {
            backgroundColor: isDark ? colors.background : '#FFFFFF',
            borderTopColor: colors.border,
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        <View style={styles.bottomPriceCol}>
          <Text style={[typography.micro, { color: colors.textSecondary }]}>
            Yekun məbləğ
          </Text>
          <Text
            style={[
              typography.title,
              { color: colors.text, fontWeight: '800', fontSize: 22, marginTop: 1 },
            ]}
          >
            {formatPrice(totalDiscountedPrice)}
          </Text>
          <Text style={[typography.micro, { color: colors.textSecondary, fontSize: 10 }]}>
            {nights} gecə üçün
          </Text>
        </View>

        <View style={{ flex: 1, marginLeft: 16 }}>
          <SlideToBook
            title="Sürüşdürərək təsdiqlə"
            isLoading={isSubmitting}
            onComplete={handleSubmit(onSubmit)}
          />
        </View>
      </View>

      {/* Tarix / Qonaq Modalı */}
      <DateGuestModal
        visible={dateModalVisible}
        onClose={() => setDateModalVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    zIndex: 10,
  },
  backCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 130,
    gap: 14,
  },
  card: {
    padding: 16,
    borderWidth: 1,
  },
  columnCard: {
    flexDirection: 'column',
  },
  hotelThumbnail: {
    width: 80,
    height: 80,
    marginRight: 14,
  },
  hotelInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  datesBoxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateBox: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  detailSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentNoticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 14,
  },
  cancellationNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  bottomStickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    zIndex: 100,
  },
  bottomPriceCol: {
    marginRight: 12,
  },
  submitBtn: {
    flex: 1,
    maxWidth: 220,
  },

  // Success screen styles
  successContainer: {
    flex: 1,
  },
  successScroll: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  successCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  successTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    textAlign: 'center',
    fontWeight: '800',
  },
  successSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    marginTop: 6,
    fontSize: 15,
  },
  bookingNumberPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 14,
  },
  bookingNumberText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  summaryCard: {
    width: '100%',
    padding: 20,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  successActions: {
    width: '100%',
    marginTop: 28,
    gap: 12,
  },
  historyBtn: {
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  homeBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  homeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});