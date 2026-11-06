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
import { Clock, Mail, MessageSquare, Phone, User as UserIcon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  Button,
  Card,
  Chip,
  Divider,
  Input,
  ScreenHeader,
  Toggle,
} from '@/components/ui';
import { CheckoutProgressBar } from '@/components/checkout/CheckoutProgressBar';
import { formatAzPhoneNumber } from '@/features/auth/schemas';
import { GuestInfoFormData, guestInfoSchema } from '@/features/checkout/schemas';
import { useAuthStore, useBookingsStore, useProfileStore } from '@/store';
import { formatDateRange, formatNights } from '@/utils/format';
import { colors, radius, spacing, typography } from '@/theme';

const ARRIVAL_TIMES = [
  '14:00 — 16:00',
  '16:00 — 18:00',
  '18:00 — 20:00',
  '20:00 — 22:00',
  '22:00-dan sonra',
  'Dəqiq deyil',
];

export default function CheckoutGuestScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { bookingDraft, setBookingDraft } = useBookingsStore();
  const { user, isAuthenticated } = useAuthStore();
  const { guestInfo, saveGuestInfo } = useProfileStore();

  const [selectedArrivalTime, setSelectedArrivalTime] = useState<string>(
    ARRIVAL_TIMES[0]
  );
  const [saveToProfile, setSaveToProfile] = useState<boolean>(true);

  // Field focus refs
  const lastNameRef = useRef<any>(null);
  const emailRef = useRef<any>(null);
  const phoneRef = useRef<any>(null);
  const specialRequestsRef = useRef<any>(null);

  // Initial values priority: authStore.user -> profileStore.guestInfo -> default
  const defaultFirstName = user?.firstName || guestInfo?.firstName || '';
  const defaultLastName = user?.lastName || guestInfo?.lastName || '';
  const defaultEmail = user?.email || guestInfo?.email || '';
  const defaultPhone = user?.phone || guestInfo?.phone || '+994 ';

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<GuestInfoFormData>({
    resolver: zodResolver(guestInfoSchema),
    defaultValues: {
      firstName: defaultFirstName,
      lastName: defaultLastName,
      email: defaultEmail,
      phone: defaultPhone,
      specialRequests: guestInfo?.specialRequests || '',
      estimatedArrivalTime: ARRIVAL_TIMES[0],
      saveToProfile: true,
    },
  });

  const specialRequestsText = watch('specialRequests') || '';

  const onSubmit = (data: GuestInfoFormData) => {
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (saveToProfile) {
      saveGuestInfo({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        specialRequests: data.specialRequests,
      });
    }

    // Attach guest info to bookingDraft
    if (bookingDraft) {
      setBookingDraft({
        ...bookingDraft,
        guestInfo: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          specialRequests: data.specialRequests,
          estimatedArrivalTime: selectedArrivalTime,
        },
      });
    }

    router.push('/checkout/payment');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader
          title="Qonaq Məlumatları"
          onBack={() => router.back()}
        />
        <CheckoutProgressBar currentStep={1} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Reservation summary banner if bookingDraft exists */}
        {bookingDraft && (
          <Card style={styles.draftSummaryCard}>
            <Text style={styles.draftHotelName}>{bookingDraft.hotelName}</Text>
            <Text style={styles.draftRoomName}>{bookingDraft.room.name}</Text>
            <Text style={styles.draftDates}>
              {formatDateRange(bookingDraft.checkInDate, bookingDraft.checkOutDate)} ({formatNights(bookingDraft.nights)})
            </Text>
          </Card>
        )}

        <Text style={styles.sectionTitle}>Əsas Qonaq</Text>
        <Text style={styles.sectionSubtitle}>
          Oteldə qeydiyyat zamanı şəxsiyyəti təsdiq edən sənədlə uyğun olmalıdır.
        </Text>

        {/* Guest Form */}
        <View style={styles.form}>
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Controller
                control={control}
                name="firstName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Ad"
                    placeholder="Adınız"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    returnKeyType="next"
                    onSubmitEditing={() => lastNameRef.current?.focus()}
                    leftIcon={<UserIcon size={18} color={colors.textSecondary} />}
                    error={errors.firstName?.message}
                  />
                )}
              />
            </View>

            <View style={styles.flex1}>
              <Controller
                control={control}
                name="lastName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    ref={lastNameRef}
                    label="Soyad"
                    placeholder="Soyadınız"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef.current?.focus()}
                    error={errors.lastName?.message}
                  />
                )}
              />
            </View>
          </View>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                ref={emailRef}
                label="E-poçt ünvanı"
                placeholder="Rezervasiya qəbzi bura göndəriləcək"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
                leftIcon={<Mail size={18} color={colors.textSecondary} />}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                ref={phoneRef}
                label="Əlaqə nömrəsi"
                placeholder="+994 50 123 45 67"
                value={value}
                onChangeText={(text) => onChange(formatAzPhoneNumber(text))}
                onBlur={onBlur}
                keyboardType="phone-pad"
                returnKeyType="next"
                onSubmitEditing={() => specialRequestsRef.current?.focus()}
                leftIcon={<Phone size={18} color={colors.textSecondary} />}
                error={errors.phone?.message}
              />
            )}
          />

          {/* Gəliş vaxtı seçimi */}
          <View style={styles.arrivalSection}>
            <View style={styles.arrivalTitleRow}>
              <Clock size={16} color={colors.primary} />
              <Text style={styles.fieldLabel}>Təxmini gəliş vaxtı (ixtiyari)</Text>
            </View>
            <View style={styles.arrivalChipsRow}>
              {ARRIVAL_TIMES.map((timeOption) => {
                const isSelected = selectedArrivalTime === timeOption;
                return (
                  <Chip
                    key={timeOption}
                    label={timeOption}
                    selected={isSelected}
                    onPress={() => setSelectedArrivalTime(timeOption)}
                  />
                );
              })}
            </View>
          </View>

          {/* Xüsusi istək */}
          <View style={styles.specialRequestsWrapper}>
            <View style={styles.specialRequestsHeader}>
              <View style={styles.arrivalTitleRow}>
                <MessageSquare size={16} color={colors.primary} />
                <Text style={styles.fieldLabel}>Xüsusi istək (ixtiyari)</Text>
              </View>
              <Text style={styles.charCounter}>
                {specialRequestsText.length} / 200
              </Text>
            </View>

            <Controller
              control={control}
              name="specialRequests"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  ref={specialRequestsRef}
                  placeholder="Məsələn: Yüksək mərtəbə, sakit otaq və s."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={3}
                  maxLength={200}
                  inputStyle={styles.multilineInput}
                  containerStyle={{ marginBottom: 0 }}
                  error={errors.specialRequests?.message}
                />
              )}
            />
          </View>

          {/* Save to Profile Toggle */}
          <View style={styles.saveToggleCard}>
            <View style={styles.saveToggleTextCol}>
              <Text style={styles.saveToggleTitle}>
                Növbəti rezervasiya üçün yadda saxla
              </Text>
              <Text style={styles.saveToggleSub}>
                Növbəti dəfə məlumatlar avtomatik doldurulacaq
              </Text>
            </View>
            <Toggle
              value={saveToProfile}
              onValueChange={setSaveToProfile}
            />
          </View>

          <Button
            title="Ödənişə davam et"
            variant="primary"
            onPress={handleSubmit(onSubmit)}
            style={styles.continueBtn}
          />
        </View>
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
  draftSummaryCard: {
    padding: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  draftHotelName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  draftRoomName: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  draftDates: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.lg,
  },
  form: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flex1: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  arrivalSection: {
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  arrivalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  arrivalChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  specialRequestsWrapper: {
    marginBottom: spacing.lg,
  },
  specialRequestsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  charCounter: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  multilineInput: {
    height: 74,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  saveToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  saveToggleTextCol: {
    flex: 1,
    marginRight: spacing.md,
  },
  saveToggleTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  saveToggleSub: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  continueBtn: {
    height: 54, // 54px button as requested
    marginTop: spacing.xs,
  },
});