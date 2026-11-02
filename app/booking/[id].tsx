import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';

import { useTheme } from '@/constants/theme';
import { hotelService } from '@/services/hotelService';
import { Hotel } from '@/types/hotel';
import { useAppStore } from '@/store';
import { useHistoryStore } from '@/store/historyStore';
import { formatPrice, formatDate, nightsBetween, calculateStayPrice } from '@/utils/format';

// Zod Validation Schema
const phoneRegex = /^(\+994|0)?\s?(50|51|55|70|77|99|10)\s?[0-9]{3}\s?[0-9]{2}\s?[0-9]{2}$|^(\+994)[0-9]{9}$/;

const bookingSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Ad ən azı 2 hərfdən ibarət olmalıdır')
    .max(50, 'Ad çox uzundur'),
  lastName: z
    .string()
    .min(2, 'Soyad ən azı 2 hərfdən ibarət olmalıdır')
    .max(50, 'Soyad çox uzundur'),
  phone: z
    .string()
    .min(9, 'Telefon nömrəsi daxil edin')
    .regex(phoneRegex, 'Düzgün nömrə daxil edin (məs: +994501234567)'),
  email: z
    .string()
    .min(1, 'E-poçt daxil edin')
    .email('Düzgün e-poçt ünvanı daxil edin'),
  specialRequests: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function BookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, fonts, radius, spacing, shadows } = useTheme();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile and Bookings store
  const profile = useAppStore((state) => state.profile);
  const setProfile = useAppStore((state) => state.setProfile);
  const addBooking = useHistoryStore((state) => state.addBooking);

  // Dates state
  const [checkInDate, setCheckInDate] = useState<Date>(() => new Date());
  const [checkOutDate, setCheckOutDate] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  });

  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

  // Steppers state
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  // Success state
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingId, setBookingId] = useState('');

  // Success check animation
  const checkScale = useSharedValue(0);
  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '+994',
      email: '',
      specialRequests: '',
    },
  });

  // Auto-fill from profile store
  useEffect(() => {
    if (profile) {
      if (profile.firstName) setValue('firstName', profile.firstName);
      if (profile.lastName) setValue('lastName', profile.lastName);
      if (profile.phone) setValue('phone', profile.phone);
      if (profile.email) setValue('email', profile.email);
    }
  }, [profile, setValue]);

  // Load hotel
  useEffect(() => {
    let isMounted = true;
    if (id) {
      hotelService.getHotelById(id).then((data) => {
        if (isMounted) {
          setHotel(data || null);
          setLoading(false);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Handle Date changes
  const onCheckInChange = (_: DateTimePickerEvent, selectedDate?: Date) => {
    setShowCheckInPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setCheckInDate(selectedDate);
      // Ensure checkOutDate is after checkInDate
      if (selectedDate >= checkOutDate) {
        const nextDay = new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000);
        setCheckOutDate(nextDay);
      }
    }
  };

  const onCheckOutChange = (_: DateTimePickerEvent, selectedDate?: Date) => {
    setShowCheckOutPicker(Platform.OS === 'ios');
    if (selectedDate) {
      if (selectedDate <= checkInDate) {
        const nextDay = new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000);
        setCheckOutDate(nextDay);
      } else {
        setCheckOutDate(selectedDate);
      }
    }
  };

  const nights = nightsBetween(checkInDate, checkOutDate);
  const discountedPrice = hotel?.discountedPrice || 0;
  const standardPrice = hotel?.standardPrice || 0;

  const pricing = calculateStayPrice(standardPrice, discountedPrice, nights, checkInDate);
  const serviceFee = 0;
  const finalTotal = pricing.totalPrice + serviceFee;

  // Form submit
  const onSubmit = async (data: BookingFormData) => {
    if (!hotel) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const generatedId = `SN-${Date.now().toString().slice(-6)}`;
    setBookingId(generatedId);

    // Save to profile store
    await setProfile({
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email,
    });

    // Save booking to history store
    await addBooking({
      id: generatedId,
      hotelId: hotel.id,
      hotel: {
        id: hotel.id,
        name: hotel.name,
        city: hotel.city,
        address: hotel.address,
        image: hotel.images[0],
        rating: hotel.rating,
        discountedPrice: hotel.discountedPrice,
      },
      checkInDate: checkInDate.toISOString(),
      checkOutDate: checkOutDate.toISOString(),
      nightsCount: nights,
      adultsCount: adults,
      childrenCount: children,
      totalPrice: finalTotal,
      specialRequests: data.specialRequests,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      guestName: `${data.firstName} ${data.lastName}`,
      guestEmail: data.email,
      guestPhone: data.phone,
    });

    setIsSuccess(true);
    checkScale.value = withSequence(
      withSpring(1.2, { damping: 10, stiffness: 300 }),
      withSpring(1, { damping: 12, stiffness: 250 })
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!hotel) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text, fontFamily: fonts.bold }]}>
          Otel tapılmadı
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={[styles.actionButton, { backgroundColor: colors.primary, borderRadius: radius.button }]}>
          <Text style={[styles.actionButtonText, { fontFamily: fonts.semiBold }]}>Geri qayıt</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  // UĞUR EKRANI
  if (isSuccess) {
    return (
      <SafeAreaView style={[styles.successContainer, { backgroundColor: colors.background }]}>
        <View style={styles.successCardWrapper}>
          <Animated.View style={[styles.successCheckCircle, { backgroundColor: colors.success + '15' }, checkAnimatedStyle]}>
            <Ionicons name="checkmark-circle" size={80} color={colors.success} />
          </Animated.View>

          <Text style={[styles.successTitle, { color: colors.text, fontFamily: fonts.extraBold }]}>
            Rezervasiya Təsdiqləndi!
          </Text>

          <Text style={[styles.bookingIdText, { color: colors.primary, fontFamily: fonts.bold }]}>
            Nömrə: #{bookingId}
          </Text>

          {/* Xülasə kartı */}
          <View style={[styles.summaryBox, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.card }, shadows.card]}>
            <Text style={[styles.summaryHotelName, { color: colors.text, fontFamily: fonts.bold }]}>
              {hotel.name}
            </Text>
            <Text style={[styles.summaryDates, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
              {formatDate(checkInDate)} — {formatDate(checkOutDate)} ({nights} gecə)
            </Text>
            <Text style={[styles.summaryGuests, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
              {adults} böyük{children > 0 ? `, ${children} uşaq` : ''}
            </Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.textSecondary, fontFamily: fonts.medium }]}>
                Ödənilən məbləğ:
              </Text>
              <Text style={[styles.totalValue, { color: colors.primary, fontFamily: fonts.extraBold }]}>
                {formatPrice(finalTotal)}
              </Text>
            </View>
          </View>

          {/* Düymələr */}
          <View style={styles.successButtons}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tarixçəyə bax"
              onPress={() => router.replace('/(tabs)/history' as any)}
              style={[
                styles.successPrimaryBtn,
                { backgroundColor: colors.primary, borderRadius: radius.button },
              ]}>
              <Ionicons name="time-outline" size={18} color="#FFFFFF" />
              <Text style={[styles.btnTextWhite, { fontFamily: fonts.bold }]}>
                Tarixçəyə bax
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ana səhifəyə qayıt"
              onPress={() => router.replace('/(tabs)' as any)}
              style={[
                styles.successSecondaryBtn,
                { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.button },
              ]}>
              <Ionicons name="home-outline" size={18} color={colors.text} />
              <Text style={[styles.btnTextDark, { color: colors.text, fontFamily: fonts.semiBold }]}>
                Ana səhifəyə qayıt
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Modal Header */}
      <View style={[styles.modalHeader, { borderBottomColor: colors.border, paddingHorizontal: spacing.lg }]}>
        <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
        <View style={styles.modalHeaderRow}>
          <Text style={[styles.modalTitle, { color: colors.text, fontFamily: fonts.bold }]}>
            Rezervasiya Forması
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Formu bağla"
            onPress={() => router.back()}
            hitSlop={8}
            style={[styles.closeIconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="close" size={20} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.formContent, { paddingBottom: 110 + insets.bottom }]}>
        {/* 1) Otel Xülasəsi (Kiçik kart) */}
        <View
          style={[
            styles.hotelSummaryCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.card,
            },
            shadows.card,
          ]}>
          <Image
            source={{ uri: hotel.images[0] }}
            style={[styles.hotelThumbnail, { borderRadius: radius.button }]}
            contentFit="cover"
          />
          <View style={styles.hotelInfoRight}>
            <Text numberOfLines={1} style={[styles.hotelMiniName, { color: colors.text, fontFamily: fonts.bold }]}>
              {hotel.name}
            </Text>
            <View style={styles.miniAddressRow}>
              <Ionicons name="location-outline" size={13} color={colors.textSecondary} />
              <Text numberOfLines={1} style={[styles.miniAddress, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                {hotel.address}
              </Text>
            </View>
            <View style={styles.miniPriceRow}>
              <Text style={[styles.miniPrice, { color: colors.primary, fontFamily: fonts.extraBold }]}>
                {formatPrice(hotel.discountedPrice)}
              </Text>
              <Text style={[styles.miniPerNight, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                / gecə
              </Text>
            </View>
          </View>
        </View>

        {/* 2) Tarixlər (Giriş & Çıxış) */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: colors.text, fontFamily: fonts.bold }]}>
            Tarixlər
          </Text>
          <View style={styles.datesRow}>
            {/* Giriş */}
            <Pressable
              onPress={() => setShowCheckInPicker(true)}
              style={[
                styles.dateCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.card,
                },
              ]}>
              <Ionicons name="calendar-outline" size={18} color={colors.primary} />
              <View>
                <Text style={[styles.dateLabel, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                  Giriş tarixi
                </Text>
                <Text style={[styles.dateValue, { color: colors.text, fontFamily: fonts.bold }]}>
                  {formatDate(checkInDate)}
                </Text>
              </View>
            </Pressable>

            {/* Çıxış */}
            <Pressable
              onPress={() => setShowCheckOutPicker(true)}
              style={[
                styles.dateCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.card,
                },
              ]}>
              <Ionicons name="calendar" size={18} color={colors.accent} />
              <View>
                <Text style={[styles.dateLabel, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                  Çıxış tarixi
                </Text>
                <Text style={[styles.dateValue, { color: colors.text, fontFamily: fonts.bold }]}>
                  {formatDate(checkOutDate)}
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Date Pickers */}
          {showCheckInPicker && (
            <DateTimePicker
              value={checkInDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={new Date()}
              onChange={onCheckInChange}
            />
          )}

          {showCheckOutPicker && (
            <DateTimePicker
              value={checkOutDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000)}
              onChange={onCheckOutChange}
            />
          )}
        </View>

        {/* 3) Qonaq sayı Stepper-lər */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: colors.text, fontFamily: fonts.bold }]}>
            Qonaq sayı
          </Text>
          <View
            style={[
              styles.steppersContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.card,
              },
            ]}>
            {/* Böyük */}
            <View style={styles.stepperRow}>
              <View>
                <Text style={[styles.stepperTitle, { color: colors.text, fontFamily: fonts.semiBold }]}>
                  Böyüklər
                </Text>
                <Text style={[styles.stepperSubtitle, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                  13+ yaş
                </Text>
              </View>
              <View style={styles.stepperControls}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setAdults(Math.max(1, adults - 1));
                  }}
                  disabled={adults <= 1}
                  style={[
                    styles.stepperBtn,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      opacity: adults <= 1 ? 0.4 : 1,
                    },
                  ]}>
                  <Ionicons name="remove" size={16} color={colors.text} />
                </Pressable>
                <Text style={[styles.stepperCount, { color: colors.text, fontFamily: fonts.bold }]}>
                  {adults}
                </Text>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setAdults(adults + 1);
                  }}
                  style={[styles.stepperBtn, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Ionicons name="add" size={16} color={colors.text} />
                </Pressable>
              </View>
            </View>

            <View style={[styles.stepperDivider, { backgroundColor: colors.border }]} />

            {/* Uşaq */}
            <View style={styles.stepperRow}>
              <View>
                <Text style={[styles.stepperTitle, { color: colors.text, fontFamily: fonts.semiBold }]}>
                  Uşaqlar
                </Text>
                <Text style={[styles.stepperSubtitle, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                  0 - 12 yaş
                </Text>
              </View>
              <View style={styles.stepperControls}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setChildren(Math.max(0, children - 1));
                  }}
                  disabled={children <= 0}
                  style={[
                    styles.stepperBtn,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      opacity: children <= 0 ? 0.4 : 1,
                    },
                  ]}>
                  <Ionicons name="remove" size={16} color={colors.text} />
                </Pressable>
                <Text style={[styles.stepperCount, { color: colors.text, fontFamily: fonts.bold }]}>
                  {children}
                </Text>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setChildren(children + 1);
                  }}
                  style={[styles.stepperBtn, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Ionicons name="add" size={16} color={colors.text} />
                </Pressable>
              </View>
            </View>
          </View>
        </View>

        {/* 4) Şəxsi məlumatlar */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: colors.text, fontFamily: fonts.bold }]}>
            Şəxsi məlumatlar
          </Text>

          {/* Ad & Soyad */}
          <View style={styles.inputsRow}>
            <View style={styles.inputFlex}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontFamily: fonts.medium }]}>
                Ad
              </Text>
              <Controller
                control={control}
                name="firstName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.surface,
                        borderColor: errors.firstName ? colors.accent : colors.border,
                        color: colors.text,
                        borderRadius: radius.button,
                        fontFamily: fonts.regular,
                      },
                    ]}
                    placeholder="Adınız"
                    placeholderTextColor={colors.textSecondary}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.firstName && (
                <Text style={[styles.errorText, { color: colors.accent, fontFamily: fonts.regular }]}>
                  {errors.firstName.message}
                </Text>
              )}
            </View>

            <View style={styles.inputFlex}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary, fontFamily: fonts.medium }]}>
                Soyad
              </Text>
              <Controller
                control={control}
                name="lastName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.surface,
                        borderColor: errors.lastName ? colors.accent : colors.border,
                        color: colors.text,
                        borderRadius: radius.button,
                        fontFamily: fonts.regular,
                      },
                    ]}
                    placeholder="Soyadınız"
                    placeholderTextColor={colors.textSecondary}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.lastName && (
                <Text style={[styles.errorText, { color: colors.accent, fontFamily: fonts.regular }]}>
                  {errors.lastName.message}
                </Text>
              )}
            </View>
          </View>

          {/* Telefon */}
          <View style={styles.singleInputContainer}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary, fontFamily: fonts.medium }]}>
              Telefon (+994)
            </Text>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surface,
                      borderColor: errors.phone ? colors.accent : colors.border,
                      color: colors.text,
                      borderRadius: radius.button,
                      fontFamily: fonts.regular,
                    },
                  ]}
                  placeholder="+994 50 123 45 67"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="phone-pad"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.phone && (
              <Text style={[styles.errorText, { color: colors.accent, fontFamily: fonts.regular }]}>
                {errors.phone.message}
              </Text>
            )}
          </View>

          {/* Email */}
          <View style={styles.singleInputContainer}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary, fontFamily: fonts.medium }]}>
              E-poçt
            </Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.surface,
                      borderColor: errors.email ? colors.accent : colors.border,
                      color: colors.text,
                      borderRadius: radius.button,
                      fontFamily: fonts.regular,
                    },
                  ]}
                  placeholder="nümunə@mail.com"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.email && (
              <Text style={[styles.errorText, { color: colors.accent, fontFamily: fonts.regular }]}>
                {errors.email.message}
              </Text>
            )}
          </View>
        </View>

        {/* 5) Xüsusi istəklər (Çoxsətirli, ixtiyari) */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: colors.text, fontFamily: fonts.bold }]}>
            Xüsusi istəklər (ixtiyari)
          </Text>
          <Controller
            control={control}
            name="specialRequests"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                    borderRadius: radius.card,
                    fontFamily: fonts.regular,
                  },
                ]}
                placeholder="Məs: Yuxarı mərtəbə, sakit otaq, gec giriş..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
              />
            )}
          />
        </View>

        {/* 6) Qiymət xülasəsi */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: colors.text, fontFamily: fonts.bold }]}>
            Qiymət xülasəsi
          </Text>
          <View
            style={[
              styles.priceSummaryCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.card,
              },
            ]}>
            {pricing.isTodayDiscountApplied ? (
              <>
                {/* 1-ci gecə (Bu gecə, endirimli) */}
                <View style={styles.priceSummaryRow}>
                  <Text style={[styles.priceSummaryLabel, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                    {nights === 1 ? '1 gecə (Bu gecə, endirimli)' : '1-ci gecə (Bu gecə, endirimli)'}
                  </Text>
                  <Text style={[styles.priceSummaryVal, { color: colors.text, fontFamily: fonts.medium }]}>
                    {formatPrice(pricing.firstNightPrice)}
                  </Text>
                </View>

                {/* Növbəti gecələr (Standart qiymət) */}
                {pricing.remainingNightsCount > 0 && (
                  <View style={styles.priceSummaryRow}>
                    <Text style={[styles.priceSummaryLabel, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                      Növbəti {pricing.remainingNightsCount} gecə ({formatPrice(standardPrice)} / gecə)
                    </Text>
                    <Text style={[styles.priceSummaryVal, { color: colors.text, fontFamily: fonts.medium }]}>
                      {formatPrice(pricing.remainingNightsPrice)}
                    </Text>
                  </View>
                )}

                {/* Bu gecə üçün qənaət */}
                {pricing.discountAmount > 0 && (
                  <View style={styles.priceSummaryRow}>
                    <Text style={[styles.priceSummaryLabel, { color: colors.success, fontFamily: fonts.regular }]}>
                      Qənaətiniz (Bu gecə üçün endirim)
                    </Text>
                    <Text style={[styles.priceSummaryVal, { color: colors.success, fontFamily: fonts.medium }]}>
                      -{formatPrice(pricing.discountAmount)}
                    </Text>
                  </View>
                )}
              </>
            ) : (
              /* Gələcək tarix: standart qiymət */
              <View style={styles.priceSummaryRow}>
                <Text style={[styles.priceSummaryLabel, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                  {nights} gecə × {formatPrice(standardPrice)}
                </Text>
                <Text style={[styles.priceSummaryVal, { color: colors.text, fontFamily: fonts.medium }]}>
                  {formatPrice(pricing.totalPrice)}
                </Text>
              </View>
            )}

            <View style={styles.priceSummaryRow}>
              <Text style={[styles.priceSummaryLabel, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                Xidmət haqqı
              </Text>
              <Text style={[styles.priceSummaryVal, { color: colors.success, fontFamily: fonts.medium }]}>
                0 ₼ (Pulsuz)
              </Text>
            </View>

            {/* Qeyd: Endirim yalnız bu gün üçün keçərlidir */}
            {nights > 1 && pricing.isTodayDiscountApplied && (
              <View style={[styles.discountNoteBox, { backgroundColor: colors.primary + '10' }]}>
                <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
                <Text style={[styles.discountNoteText, { color: colors.textSecondary, fontFamily: fonts.medium }]}>
                  Xüsusi endirim yalnız ilk gecəyə (bu gecəyə) aiddir. Digər gecələr standart tariflə hesablanıb.
                </Text>
              </View>
            )}

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.finalTotalRow}>
              <Text style={[styles.finalTotalLabel, { color: colors.text, fontFamily: fonts.bold }]}>
                Yekun məbləğ
              </Text>
              <Text style={[styles.finalTotalVal, { color: colors.primary, fontFamily: fonts.extraBold }]}>
                {formatPrice(finalTotal)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 7) Sabit Alt Düymə: Rezervasiyanı təsdiqlə */}
      <View
        style={[
          styles.stickyBottomBar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            paddingBottom: Math.max(insets.bottom, 14),
          },
          shadows.card,
        ]}>
        <View style={styles.stickyPriceInfo}>
          <Text style={[styles.stickyTotalLabel, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
            Yekun:
          </Text>
          <Text style={[styles.stickyTotalValue, { color: colors.primary, fontFamily: fonts.extraBold }]}>
            {formatPrice(finalTotal)}
          </Text>
        </View>

        <Pressable
          onPress={handleSubmit(onSubmit)}
          style={({ pressed }) => [
            styles.confirmButton,
            {
              backgroundColor: colors.accent,
              borderRadius: radius.button,
              opacity: pressed ? 0.9 : 1,
            },
          ]}>
          <Text style={[styles.confirmButtonText, { fontFamily: fonts.bold }]}>
            Rezervasiyanı təsdiqlə
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 10,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  modalHeader: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  modalHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 18,
  },
  closeIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContent: {
    padding: 16,
    gap: 18,
  },
  hotelSummaryCard: {
    flexDirection: 'row',
    padding: 10,
    borderWidth: 1,
    gap: 12,
    alignItems: 'center',
  },
  hotelThumbnail: {
    width: 72,
    height: 72,
  },
  hotelInfoRight: {
    flex: 1,
    gap: 3,
  },
  hotelMiniName: {
    fontSize: 15,
  },
  miniAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniAddress: {
    fontSize: 12,
    flex: 1,
  },
  miniPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  miniPrice: {
    fontSize: 16,
  },
  miniPerNight: {
    fontSize: 11,
  },
  section: {
    gap: 8,
  },
  sectionHeading: {
    fontSize: 16,
    marginBottom: 2,
  },
  datesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderWidth: 1,
  },
  dateLabel: {
    fontSize: 11,
  },
  dateValue: {
    fontSize: 14,
    marginTop: 2,
  },
  steppersContainer: {
    borderWidth: 1,
    padding: 14,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperTitle: {
    fontSize: 15,
  },
  stepperSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperCount: {
    fontSize: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  stepperDivider: {
    height: 1,
    marginVertical: 12,
  },
  inputsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputFlex: {
    flex: 1,
  },
  singleInputContainer: {
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  input: {
    height: 48,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  textArea: {
    minHeight: 80,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
  },
  errorText: {
    fontSize: 11,
    marginTop: 3,
  },
  priceSummaryCard: {
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  priceSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceSummaryLabel: {
    fontSize: 13,
  },
  priceSummaryVal: {
    fontSize: 13,
  },
  discountNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  discountNoteText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  finalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  finalTotalLabel: {
    fontSize: 16,
  },
  finalTotalVal: {
    fontSize: 20,
  },
  stickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 14,
  },
  stickyPriceInfo: {},
  stickyTotalLabel: {
    fontSize: 11,
  },
  stickyTotalValue: {
    fontSize: 20,
  },
  confirmButton: {
    flex: 1,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successCardWrapper: {
    width: '100%',
    alignItems: 'center',
    gap: 14,
  },
  successCheckCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  successTitle: {
    fontSize: 24,
    textAlign: 'center',
  },
  bookingIdText: {
    fontSize: 16,
    letterSpacing: 1,
  },
  summaryBox: {
    width: '100%',
    borderWidth: 1,
    padding: 18,
    gap: 6,
    marginTop: 8,
  },
  summaryHotelName: {
    fontSize: 17,
  },
  summaryDates: {
    fontSize: 13,
  },
  summaryGuests: {
    fontSize: 13,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 14,
  },
  totalValue: {
    fontSize: 20,
  },
  successButtons: {
    width: '100%',
    gap: 10,
    marginTop: 12,
  },
  successPrimaryBtn: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnTextWhite: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  successSecondaryBtn: {
    height: 52,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnTextDark: {
    fontSize: 15,
  },
});
