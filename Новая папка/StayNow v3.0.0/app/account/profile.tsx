import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Calendar,
  Globe,
  Info,
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  Save,
  User as UserIcon,
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
import { formatAzPhoneNumber } from '@/features/auth/schemas';
import { useAuthStore, useProfileStore } from '@/store';
import { colors, radius, spacing, typography } from '@/theme';
import { az } from '@/i18n/az';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuthStore();
  const { guestInfo, saveGuestInfo, resetAutofill } = useProfileStore();

  // State initialized with profileStore (or fallback to authStore.user)
  const [firstName, setFirstName] = useState(guestInfo.firstName || user?.firstName || '');
  const [lastName, setLastName] = useState(guestInfo.lastName || user?.lastName || '');
  const [email, setEmail] = useState(guestInfo.email || user?.email || '');
  const [phone, setPhone] = useState(guestInfo.phone || user?.phone || '+994 ');
  const [country, setCountry] = useState(guestInfo.country || 'Azərbaycan');
  const [birthDate, setBirthDate] = useState(guestInfo.birthDate || '');
  const [address, setAddress] = useState(guestInfo.address || '');

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isResetModalVisible, setIsResetModalVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Determine if form values changed compared to stored profile
  const isDirty = useMemo(() => {
    return (
      firstName !== (guestInfo.firstName || '') ||
      lastName !== (guestInfo.lastName || '') ||
      email !== (guestInfo.email || '') ||
      phone !== (guestInfo.phone || '') ||
      country !== (guestInfo.country || 'Azərbaycan') ||
      birthDate !== (guestInfo.birthDate || '') ||
      address !== (guestInfo.address || '')
    );
  }, [firstName, lastName, email, phone, country, birthDate, address, guestInfo]);

  const handlePhoneChange = (text: string) => {
    const formatted = formatAzPhoneNumber(text);
    setPhone(formatted);
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'Adınızı daxil edin';
    } else if (firstName.trim().length < 2) {
      newErrors.firstName = 'Ad ən azı 2 simvol olmalıdır';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Soyadınızı daxil edin';
    } else if (lastName.trim().length < 2) {
      newErrors.lastName = 'Soyad ən azı 2 simvol olmalıdır';
    }

    if (!email.trim()) {
      newErrors.email = 'E-poçt ünvanınızı daxil edin';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Düzgün e-poçt ünvanı daxil edin';
    }

    const digits = phone.replace(/\D/g, '');
    if (!digits.startsWith('994') || digits.length !== 12) {
      newErrors.phone = 'Düzgün mobil nömrə daxil edin (+994 50 000 00 00)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    // Save to profileStore so checkout forms autofill seamlessly
    saveGuestInfo({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      country: country.trim(),
      birthDate: birthDate.trim(),
      address: address.trim(),
    });

    // Also sync to authStore if logged in
    if (user) {
      updateUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });
    }

    showToast(az.profile.savedSuccess);
  };

  const handleConfirmReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    resetAutofill();

    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('+994 ');
    setCountry('Azərbaycan');
    setBirthDate('');
    setAddress('');
    setErrors({});

    setIsResetModalVisible(false);
    showToast(az.profile.resetSuccess);
  };

  return (
    <View style={styles.container}>
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader
          title={az.profile.title}
          subtitle={az.profile.subtitle}
          onBack={() => router.back()}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 24) + spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Info Banner */}
          <Card style={styles.infoBanner}>
            <View style={styles.infoBannerIcon}>
              <Info size={20} color={colors.primary} />
            </View>
            <Text style={styles.infoBannerText}>
              Buradakı məlumatlar növbəti hotel rezervasiyalarında qonaq anketini
              avtomatik dolduracaq və vaxtınıza qənaət edəcək.
            </Text>
          </Card>

          {/* Form Fields Card */}
          <Card style={styles.formCard}>
            <Text style={styles.sectionTitle}>Əsas Qonaq Məlumatları</Text>

            <View style={styles.nameRow}>
              <View style={{ flex: 1 }}>
                <Input
                  label={az.profile.firstName}
                  placeholder="Adınız"
                  value={firstName}
                  onChangeText={(val) => {
                    setFirstName(val);
                    if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: '' }));
                  }}
                  error={errors.firstName}
                  leftIcon={<UserIcon size={18} color={colors.textSecondary} />}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Input
                  label={az.profile.lastName}
                  placeholder="Soyadınız"
                  value={lastName}
                  onChangeText={(val) => {
                    setLastName(val);
                    if (errors.lastName) setErrors((prev) => ({ ...prev, lastName: '' }));
                  }}
                  error={errors.lastName}
                  leftIcon={<UserIcon size={18} color={colors.textSecondary} />}
                />
              </View>
            </View>

            <Input
              label={az.profile.email}
              placeholder="adiniz@example.com"
              value={email}
              onChangeText={(val) => {
                setEmail(val);
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
              }}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={18} color={colors.textSecondary} />}
            />

            <Input
              label={az.profile.phone}
              placeholder="+994 50 000 00 00"
              value={phone}
              onChangeText={handlePhoneChange}
              error={errors.phone}
              keyboardType="phone-pad"
              leftIcon={<Phone size={18} color={colors.textSecondary} />}
            />

            <Divider marginVertical="md" />

            <Text style={styles.sectionTitle}>Əlavə Rezervasiya Məlumatları</Text>

            <Input
              label={az.profile.country}
              placeholder="Ölkə / Milliyyət"
              value={country}
              onChangeText={setCountry}
              leftIcon={<Globe size={18} color={colors.textSecondary} />}
            />

            <Input
              label={`${az.profile.birthDate} (ixtiyari)`}
              placeholder="GG.AA.İİİİ (məs. 15.05.1995)"
              value={birthDate}
              onChangeText={setBirthDate}
              leftIcon={<Calendar size={18} color={colors.textSecondary} />}
            />

            <Input
              label={`${az.profile.address} (ixtiyari)`}
              placeholder="Şəhər, rayon, küçə"
              value={address}
              onChangeText={setAddress}
              leftIcon={<MapPin size={18} color={colors.textSecondary} />}
            />
          </Card>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <Button
              title={az.profile.saveChanges}
              variant="primary"
              icon={<Save size={18} color={colors.text} />}
              onPress={handleSave}
              disabled={!isDirty}
              style={styles.saveBtn}
            />

            <Button
              title={az.profile.resetAutofill}
              variant="secondary"
              icon={<RotateCcw size={16} color={colors.urgency} />}
              textStyle={{ color: colors.urgency }}
              onPress={() => setIsResetModalVisible(true)}
              style={styles.resetBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* SIFIRLAMA TƏSDİQ MODALI */}
      <Modal
        visible={isResetModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsResetModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsResetModalVisible(false)}
        >
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.resetModalIconCircle}>
              <RotateCcw size={26} color={colors.urgency} />
            </View>

            <Text style={styles.modalTitle}>{az.profile.resetConfirmTitle}</Text>
            <Text style={styles.modalDesc}>{az.profile.resetConfirmMessage}</Text>

            <View style={styles.modalActionsRow}>
              <Button
                title={az.common.cancel}
                variant="secondary"
                onPress={() => setIsResetModalVisible(false)}
                style={styles.modalBtn}
              />
              <Button
                title="Sıfırla"
                variant="secondary"
                onPress={handleConfirmReset}
                style={[
                  styles.modalBtn,
                  { borderColor: colors.urgency, backgroundColor: colors.urgencyTint },
                ]}
                textStyle={{ color: colors.urgency }}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* TOAST BİLDİRİŞİ */}
      {toastMessage && (
        <View style={[styles.toastContainer, { bottom: Math.max(insets.bottom, 24) }]}>
          <Toast message={toastMessage} type="success" />
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
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryTint,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    gap: spacing.md,
  },
  infoBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBannerText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  nameRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionsContainer: {
    gap: spacing.md,
  },
  saveBtn: {
    height: 52,
  },
  resetBtn: {
    height: 50,
    borderColor: colors.border,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
  },
  resetModalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.urgencyTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  modalDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    height: 48,
  },
  toastContainer: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
  },
});
