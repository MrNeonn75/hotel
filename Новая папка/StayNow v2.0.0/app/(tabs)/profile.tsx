import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';

import { useTheme } from '@/hooks/useTheme';
import {
  useProfileStore,
  AppLanguage,
  ThemeMode,
} from '@/store/profileStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useHistoryStore } from '@/store/historyStore';
import { profileService } from '@/services/profileService';
import { ModalSheet } from '@/components/common/ModalSheet';
import { FloatingInput } from '@/components/ui/FloatingInput';
import { Button } from '@/components/ui/Button';

// Validation Schemas
const personalSchema = z.object({
  firstName: z.string().min(2, 'Ad ən azı 2 hərfdən ibarət olmalıdır'),
  lastName: z.string().min(2, 'Soyad ən azı 2 hərfdən ibarət olmalıdır'),
  birthDate: z.string().optional(),
  nationality: z.string().optional(),
});

const contactSchema = z.object({
  phone: z
    .string()
    .min(9, 'Düzgün əlaqə nömrəsi daxil edin (məs. +994 50 123 45 67)'),
  email: z.string().email('Düzgün email ünvanı daxil edin'),
  city: z.string().optional(),
  address: z.string().optional(),
});

const documentSchema = z.object({
  documentNumber: z
    .string()
    .min(5, 'Sənəd nömrəsi ən azı 5 simvol olmalıdır'),
});

type PersonalFormData = z.infer<typeof personalSchema>;
type ContactFormData = z.infer<typeof contactSchema>;
type DocumentFormData = z.infer<typeof documentSchema>;

function maskDocument(doc?: string, maskedDoc?: string): string {
  if (maskedDoc && maskedDoc.trim().length > 0) return maskedDoc;
  if (!doc || doc.trim().length === 0) return 'Əlavə edilməyib';
  const clean = doc.trim();
  if (clean.length <= 4) return '•••• ' + clean;
  const start = clean.slice(0, 3);
  const end = clean.slice(-4);
  return `${start} •••• ${end}`;
}

export default function ProfileScreen() {
  const { colors, typography, radius, isDark } = useTheme();
  const { t, i18n } = useTranslation();

  const { profile, setProfile, setLanguage, setThemeMode, clearProfile } =
    useProfileStore();
  const clearFavorites = useFavoritesStore((s) => s.clearFavorites);
  const clearHistory = useHistoryStore((s) => s.clearHistory);

  // Profil məlumatlarını serverdən gətir və yerli store-a sinxronlaşdır
  const { data: serverProfile, refetch: refetchProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      if (process.env.EXPO_PUBLIC_USE_MOCK === '1') return null;
      try {
        return await profileService.getProfile();
      } catch {
        return null;
      }
    },
  });

  useEffect(() => {
    if (serverProfile) {
      setProfile({
        firstName: serverProfile.firstName || profile.firstName,
        lastName: serverProfile.lastName || profile.lastName,
        phone: serverProfile.phone || profile.phone,
        email: serverProfile.email || profile.email,
        birthDate: serverProfile.birthDate || profile.birthDate,
        nationality: serverProfile.nationality || profile.nationality,
        maskedDocumentNumber: serverProfile.maskedDocumentNumber || undefined,
        city: serverProfile.city || profile.city,
        address: serverProfile.address || profile.address,
        preferredLanguage: (serverProfile.preferredLanguage as any) || profile.preferredLanguage,
      });
    }
  }, [serverProfile]);

  // Modals state
  const [activeModal, setActiveModal] = useState<
    | 'personal'
    | 'contact'
    | 'document'
    | 'language'
    | 'theme'
    | 'privacy'
    | 'about'
    | null
  >(null);

  // Forms
  const personalForm = useForm<PersonalFormData>({
    resolver: zodResolver(personalSchema),
    defaultValues: {
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      birthDate: profile.birthDate || '',
      nationality: profile.nationality || 'Azərbaycan',
    },
  });

  const contactForm = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      phone: profile.phone || '',
      email: profile.email || '',
      city: profile.city || 'Bakı',
      address: profile.address || '',
    },
  });

  const documentForm = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      documentNumber: profile.documentNumber || '',
    },
  });

  const openPersonalModal = () => {
    personalForm.reset({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      birthDate: profile.birthDate || '',
      nationality: profile.nationality || 'Azərbaycan',
    });
    Haptics.selectionAsync();
    setActiveModal('personal');
  };

  const openContactModal = () => {
    contactForm.reset({
      phone: profile.phone || '',
      email: profile.email || '',
      city: profile.city || 'Bakı',
      address: profile.address || '',
    });
    Haptics.selectionAsync();
    setActiveModal('contact');
  };

  const openDocumentModal = () => {
    documentForm.reset({
      documentNumber: profile.documentNumber || '',
    });
    Haptics.selectionAsync();
    setActiveModal('document');
  };

  const onSavePersonal = async (data: PersonalFormData) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setProfile(data);
    setActiveModal(null);

    if (process.env.EXPO_PUBLIC_USE_MOCK !== '1') {
      try {
        await profileService.updateProfile({
          firstName: data.firstName,
          lastName: data.lastName,
          birthDate: data.birthDate || null,
          nationality: data.nationality || null,
        });
        refetchProfile();
      } catch (err: any) {
        Alert.alert('Xəta', err?.message || 'Məlumat saxlanılarkən xəta baş verdi.');
      }
    }
  };

  const onSaveContact = async (data: ContactFormData) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setProfile(data);
    setActiveModal(null);

    if (process.env.EXPO_PUBLIC_USE_MOCK !== '1') {
      try {
        await profileService.updateProfile({
          phone: data.phone,
          email: data.email,
          city: data.city || null,
          address: data.address || null,
        });
        refetchProfile();
      } catch (err: any) {
        Alert.alert('Xəta', err?.message || 'Əlaqə məlumatları saxlanılarkən xəta baş verdi.');
      }
    }
  };

  const onSaveDocument = async (data: DocumentFormData) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setProfile(data);
    setActiveModal(null);

    if (process.env.EXPO_PUBLIC_USE_MOCK !== '1') {
      try {
        const updated = await profileService.updateProfile({
          documentNumber: data.documentNumber,
        });
        if (updated?.maskedDocumentNumber) {
          setProfile({ maskedDocumentNumber: updated.maskedDocumentNumber });
        }
        refetchProfile();
      } catch (err: any) {
        Alert.alert('Xəta', err?.message || 'Sənəd nömrəsi saxlanılarkən xəta baş verdi.');
      }
    }
  };

  const handleLanguageSelect = (lang: AppLanguage) => {
    Haptics.selectionAsync();
    setLanguage(lang);
    i18n.changeLanguage(lang);
    setActiveModal(null);

    if (process.env.EXPO_PUBLIC_USE_MOCK !== '1') {
      profileService.updateProfile({ preferredLanguage: lang }).catch(() => {});
    }
  };

  const handleThemeSelect = (mode: ThemeMode) => {
    Haptics.selectionAsync();
    setThemeMode(mode);
    setActiveModal(null);
  };

  const handleDeleteAllData = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      t('profile.clearConfirmTitle', 'Bütün məlumatlar silinsin?'),
      t(
        'profile.clearConfirmMessage',
        'Bütün profil məlumatlarınız, favoritləriniz və rezervasiya tarixçəniz cihazdan tamamilə silinəcək. Bu əməliyyat geri qaytarıla bilməz.'
      ),
      [
        {
          text: t('profile.clearConfirmNo', 'Ləğv et'),
          style: 'cancel',
        },
        {
          text: t('profile.clearConfirmYes', 'Bəli, hamısını sil'),
          style: 'destructive',
          onPress: async () => {
            if (process.env.EXPO_PUBLIC_USE_MOCK !== '1') {
              try {
                await profileService.deleteProfile();
              } catch {
                // Ignore API delete failure
              }
            }
            clearProfile();
            clearFavorites?.();
            clearHistory?.();
            refetchProfile();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  };

  // Avatar initials
  const initials =
    (profile.firstName?.[0] || '') + (profile.lastName?.[0] || '');
  const hasProfileName = Boolean(profile.firstName || profile.lastName);
  const fullName = hasProfileName
    ? `${profile.firstName} ${profile.lastName}`.trim()
    : t('profile.noInfo', 'Məlumatlarınızı əlavə edin');

  const languageLabels: Record<AppLanguage, string> = {
    az: 'Azərbaycan dili',
    en: 'English',
    ru: 'Русский',
  };

  const themeLabels: Record<ThemeMode, string> = {
    system: t('profile.themes.system', 'Sistem (avtomatik)'),
    light: t('profile.themes.light', 'Açıq rejim'),
    dark: t('profile.themes.dark', 'Tünd rejim'),
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Title */}
        <Text
          accessibilityRole="header"
          style={[typography.display, { color: colors.text, marginBottom: 20 }]}
        >
          {t('profile.title', 'Profil')}
        </Text>

        {/* User Card / Avatar Header */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Profil detallarını redaktə et"
          onPress={openPersonalModal}
          style={({ pressed }) => [
            styles.userCard,
            {
              backgroundColor: isDark ? colors.surfaceAlt : '#FFFFFF',
              borderColor: colors.border,
              borderRadius: radius.card,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <View
            style={[
              styles.avatarCircle,
              { backgroundColor: colors.primary },
            ]}
          >
            {initials ? (
              <Text style={styles.avatarInitials}>{initials.toUpperCase()}</Text>
            ) : (
              <Ionicons name="person" size={28} color="#FFFFFF" />
            )}
          </View>

          <View style={styles.userInfo}>
            <Text
              style={[
                typography.heading,
                { color: colors.text, fontWeight: '700' },
              ]}
              numberOfLines={1}
            >
              {fullName}
            </Text>
            <Text
              style={[
                typography.caption,
                { color: colors.textSecondary, marginTop: 2 },
              ]}
              numberOfLines={1}
            >
              {profile.email ||
                profile.phone ||
                t('profile.subtitle', 'Hesab və tətbiq ayarları')}
            </Text>
          </View>

          <View
            style={[
              styles.editPill,
              { backgroundColor: colors.primaryTint },
            ]}
          >
            <Ionicons name="create-outline" size={16} color={colors.primary} />
          </View>
        </Pressable>

        {/* Auto-fill Notice Banner */}
        <View
          style={[
            styles.noticeCard,
            {
              backgroundColor: colors.primaryTint,
              borderRadius: radius.card - 2,
            },
          ]}
        >
          <Ionicons
            name="sparkles"
            size={18}
            color={colors.primary}
            style={{ marginTop: 2 }}
          />
          <Text
            style={[
              typography.caption,
              { color: colors.primary, flex: 1, lineHeight: 18, fontWeight: '600' },
            ]}
          >
            {t(
              'profile.infoNote',
              'Bu məlumatlar növbəti rezervasiyalarda avtomatik doldurulacaq.'
            )}
          </Text>
        </View>

        {/* HotelTonight Perks / VIP Status Card */}
        <View style={[styles.htPerksCard, { borderRadius: radius.card }]}>
          <LinearGradient
            colors={['#592391', '#806AEC', '#4A154B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.htPerksGradient, { borderRadius: radius.card }]}
          >
            <View style={styles.htPerksTopRow}>
              <View style={styles.htPerksBadge}>
                <Ionicons name="sparkles" size={13} color="#FFA000" style={{ marginRight: 4 }} />
                <Text style={styles.htPerksBadgeText}>HOTELTONIGHT PERKS · LEVEL 1</Text>
              </View>
              <Text style={styles.htPerksSavingsText}>180 ₼ QƏNAƏT</Text>
            </View>

            <Text style={styles.htPerksHeadline}>
              Daha 2 gecə rezerv edin və Level 2-yə yüksəlin
            </Text>

            {/* Progress Bar */}
            <View style={styles.htPerksProgressTrack}>
              <View style={[styles.htPerksProgressBar, { width: '60%' }]} />
            </View>

            <View style={styles.htPerksBottomRow}>
              <Text style={styles.htPerksSubtext}>
                Level 2 üstünlükləri: Əlavə 5% endirim & erkən giriş imkanı
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Group 1: Hesab Məlumatları */}
        <Text
          style={[
            typography.micro,
            {
              color: colors.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              marginTop: 20,
              marginBottom: 8,
              marginLeft: 4,
            },
          ]}
        >
          {t('profile.personalInfo', 'Hesab Məlumatları')}
        </Text>

        <View
          style={[
            styles.groupedCard,
            {
              backgroundColor: isDark ? colors.surfaceAlt : '#FFFFFF',
              borderColor: colors.border,
              borderRadius: radius.card,
            },
          ]}
        >
          {/* Şəxsi məlumatlar */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Şəxsi məlumatlar"
            onPress={openPersonalModal}
            style={({ pressed }) => [
              styles.menuRow,
              pressed && { backgroundColor: colors.primaryTint },
            ]}
          >
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: colors.primaryTint },
              ]}
            >
              <Ionicons name="person-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={[typography.body, { color: colors.text, fontWeight: '600' }]}>
                {t('profile.sections.personal', 'Şəxsi məlumatlar')}
              </Text>
              <Text
                style={[typography.caption, { color: colors.textSecondary, marginTop: 1 }]}
              >
                {hasProfileName
                  ? `${profile.firstName} ${profile.lastName}`
                  : t('profile.notSet', 'Qeyd edilməyib')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </Pressable>

          <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />

          {/* Əlaqə məlumatları */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Əlaqə məlumatları"
            onPress={openContactModal}
            style={({ pressed }) => [
              styles.menuRow,
              pressed && { backgroundColor: colors.primaryTint },
            ]}
          >
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: colors.primaryTint },
              ]}
            >
              <Ionicons name="call-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={[typography.body, { color: colors.text, fontWeight: '600' }]}>
                {t('profile.sections.contact', 'Əlaqə məlumatları')}
              </Text>
              <Text
                style={[typography.caption, { color: colors.textSecondary, marginTop: 1 }]}
              >
                {profile.phone || profile.email || t('profile.notSet', 'Qeyd edilməyib')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </Pressable>

          <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />

          {/* Sənəd məlumatları */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sənəd məlumatları"
            onPress={openDocumentModal}
            style={({ pressed }) => [
              styles.menuRow,
              pressed && { backgroundColor: colors.primaryTint },
            ]}
          >
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: colors.primaryTint },
              ]}
            >
              <Ionicons name="card-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={[typography.body, { color: colors.text, fontWeight: '600' }]}>
                {t('profile.sections.document', 'Sənəd məlumatları')}
              </Text>
              <Text
                style={[
                  typography.caption,
                  {
                    color: colors.textSecondary,
                    marginTop: 1,
                    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
                  },
                ]}
              >
                {maskDocument(profile.documentNumber, profile.maskedDocumentNumber)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Group 2: Tətbiq Ayarları */}
        <Text
          style={[
            typography.micro,
            {
              color: colors.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              marginTop: 22,
              marginBottom: 8,
              marginLeft: 4,
            },
          ]}
        >
          {t('profile.appSettings', 'Tətbiq Ayarları')}
        </Text>

        <View
          style={[
            styles.groupedCard,
            {
              backgroundColor: isDark ? colors.surfaceAlt : '#FFFFFF',
              borderColor: colors.border,
              borderRadius: radius.card,
            },
          ]}
        >
          {/* Dil */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Dil seçimi"
            onPress={() => {
              Haptics.selectionAsync();
              setActiveModal('language');
            }}
            style={({ pressed }) => [
              styles.menuRow,
              pressed && { backgroundColor: colors.primaryTint },
            ]}
          >
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: colors.primaryTint },
              ]}
            >
              <Ionicons name="globe-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={[typography.body, { color: colors.text, fontWeight: '600' }]}>
                {t('profile.sections.language', 'Dil')}
              </Text>
              <Text
                style={[typography.caption, { color: colors.textSecondary, marginTop: 1 }]}
              >
                {languageLabels[profile.preferredLanguage || 'az']}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </Pressable>

          <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />

          {/* Görünüş */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Görünüş rejimi"
            onPress={() => {
              Haptics.selectionAsync();
              setActiveModal('theme');
            }}
            style={({ pressed }) => [
              styles.menuRow,
              pressed && { backgroundColor: colors.primaryTint },
            ]}
          >
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: colors.primaryTint },
              ]}
            >
              <Ionicons
                name={isDark ? 'moon-outline' : 'sunny-outline'}
                size={18}
                color={colors.primary}
              />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={[typography.body, { color: colors.text, fontWeight: '600' }]}>
                {t('profile.sections.theme', 'Görünüş')}
              </Text>
              <Text
                style={[typography.caption, { color: colors.textSecondary, marginTop: 1 }]}
              >
                {themeLabels[profile.themeMode || 'system']}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Group 3: Dəstək və Hüquqi */}
        <Text
          style={[
            typography.micro,
            {
              color: colors.textSecondary,
              textTransform: 'uppercase',
              letterSpacing: 0.8,
              marginTop: 22,
              marginBottom: 8,
              marginLeft: 4,
            },
          ]}
        >
          {t('profile.sections.about', 'Dəstək və Hüquqi')}
        </Text>

        <View
          style={[
            styles.groupedCard,
            {
              backgroundColor: isDark ? colors.surfaceAlt : '#FFFFFF',
              borderColor: colors.border,
              borderRadius: radius.card,
            },
          ]}
        >
          {/* Məxfilik və Şərtlər */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Məxfilik və şərtlər"
            onPress={() => {
              Haptics.selectionAsync();
              setActiveModal('privacy');
            }}
            style={({ pressed }) => [
              styles.menuRow,
              pressed && { backgroundColor: colors.primaryTint },
            ]}
          >
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: colors.primaryTint },
              ]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={18}
                color={colors.primary}
              />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={[typography.body, { color: colors.text, fontWeight: '600' }]}>
                {t('profile.sections.privacy', 'Məxfilik və şərtlər')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </Pressable>

          <View style={[styles.rowDivider, { backgroundColor: colors.border }]} />

          {/* Haqqında */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Haqqında"
            onPress={() => {
              Haptics.selectionAsync();
              setActiveModal('about');
            }}
            style={({ pressed }) => [
              styles.menuRow,
              pressed && { backgroundColor: colors.primaryTint },
            ]}
          >
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: colors.primaryTint },
              ]}
            >
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={colors.primary}
              />
            </View>
            <View style={styles.menuTextCol}>
              <Text style={[typography.body, { color: colors.text, fontWeight: '600' }]}>
                {t('profile.sections.about', 'Haqqında')}
              </Text>
              <Text
                style={[typography.caption, { color: colors.textSecondary, marginTop: 1 }]}
              >
                StayNow v1.0.0
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Bütün məlumatlarımı sil */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Bütün məlumatlarımı sil"
          onPress={handleDeleteAllData}
          style={({ pressed }) => [
            styles.dangerBtn,
            {
              backgroundColor: isDark ? 'rgba(229, 72, 77, 0.12)' : '#FFF0F0',
              borderColor: isDark ? 'rgba(229, 72, 77, 0.3)' : '#FFD5D6',
              borderRadius: radius.card,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Ionicons name="trash-outline" size={18} color={colors.urgency} />
          <Text
            style={[
              typography.body,
              { color: colors.urgency, fontWeight: '700', marginLeft: 8 },
            ]}
          >
            {t('profile.sections.clearAll', 'Bütün məlumatlarımı sil')}
          </Text>
        </Pressable>
      </ScrollView>

      {/* 1. Şəxsi Məlumatlar Sheet */}
      <ModalSheet
        visible={activeModal === 'personal'}
        onClose={() => setActiveModal(null)}
        title={t('profile.sections.personal', 'Şəxsi məlumatlar')}
        subtitle={t('profile.infoNote', 'Bu məlumatlar növbəti rezervasiyalarda avtomatik doldurulacaq.')}
      >
        <Controller
          control={personalForm.control}
          name="firstName"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <FloatingInput
              label={t('profile.fields.firstName', 'Ad')}
              value={value}
              onChangeText={onChange}
              error={error?.message}
              autoCapitalize="words"
            />
          )}
        />

        <Controller
          control={personalForm.control}
          name="lastName"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <FloatingInput
              label={t('profile.fields.lastName', 'Soyad')}
              value={value}
              onChangeText={onChange}
              error={error?.message}
              autoCapitalize="words"
            />
          )}
        />

        <Controller
          control={personalForm.control}
          name="birthDate"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <FloatingInput
              label={t('profile.fields.birthDate', 'Doğum tarixi (İİİİ-AA-GG)')}
              value={value}
              onChangeText={onChange}
              error={error?.message}
              placeholder="1995-06-15"
            />
          )}
        />

        <Controller
          control={personalForm.control}
          name="nationality"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <FloatingInput
              label={t('profile.fields.nationality', 'Vətəndaşlıq')}
              value={value}
              onChangeText={onChange}
              error={error?.message}
            />
          )}
        />

        <Button
          title={t('profile.save', 'Yadda saxla')}
          onPress={personalForm.handleSubmit(onSavePersonal)}
          style={{ marginTop: 8 }}
        />
      </ModalSheet>

      {/* 2. Əlaqə Məlumatları Sheet */}
      <ModalSheet
        visible={activeModal === 'contact'}
        onClose={() => setActiveModal(null)}
        title={t('profile.sections.contact', 'Əlaqə məlumatları')}
        subtitle={t('profile.infoNote', 'Bu məlumatlar növbəti rezervasiyalarda avtomatik doldurulacaq.')}
      >
        <Controller
          control={contactForm.control}
          name="phone"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <FloatingInput
              label={t('profile.fields.phone', 'Telefon (+994)')}
              value={value}
              onChangeText={onChange}
              error={error?.message}
              keyboardType="phone-pad"
            />
          )}
        />

        <Controller
          control={contactForm.control}
          name="email"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <FloatingInput
              label={t('profile.fields.email', 'Email')}
              value={value}
              onChangeText={onChange}
              error={error?.message}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />

        <Controller
          control={contactForm.control}
          name="city"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <FloatingInput
              label={t('profile.fields.city', 'Şəhər')}
              value={value}
              onChangeText={onChange}
              error={error?.message}
            />
          )}
        />

        <Controller
          control={contactForm.control}
          name="address"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <FloatingInput
              label={t('profile.fields.address', 'Ünvan')}
              value={value}
              onChangeText={onChange}
              error={error?.message}
              multiline
            />
          )}
        />

        <Button
          title={t('profile.save', 'Yadda saxla')}
          onPress={contactForm.handleSubmit(onSaveContact)}
          style={{ marginTop: 8 }}
        />
      </ModalSheet>

      {/* 3. Sənəd Məlumatları Sheet */}
      <ModalSheet
        visible={activeModal === 'document'}
        onClose={() => setActiveModal(null)}
        title={t('profile.sections.document', 'Sənəd məlumatları')}
        subtitle="Otelə giriş zamanı şəxsiyyəti təsdiq etmək üçün istifadə olunur."
      >
        <Controller
          control={documentForm.control}
          name="documentNumber"
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <FloatingInput
              label={t('profile.fields.documentNumber', 'Sənəd nömrəsi (Fin / Seriya)')}
              value={value}
              onChangeText={onChange}
              error={error?.message}
              autoCapitalize="characters"
            />
          )}
        />

        <Text
          style={[
            typography.micro,
            { color: colors.textSecondary, marginBottom: 16, lineHeight: 16 },
          ]}
        >
          🔒 Sənəd nömrəniz təhlükəsiz şəkildə cihazınızda saxlanılır və yalnız rezervasiya təsdiqi zamanı otelə ötürülür.
        </Text>

        <Button
          title={t('profile.save', 'Yadda saxla')}
          onPress={documentForm.handleSubmit(onSaveDocument)}
        />
      </ModalSheet>

      {/* 4. Dil Seçimi Sheet */}
      <ModalSheet
        visible={activeModal === 'language'}
        onClose={() => setActiveModal(null)}
        title={t('profile.sections.language', 'Tətbiq dili')}
      >
        {(['az', 'en', 'ru'] as AppLanguage[]).map((lang) => {
          const isSelected = profile.preferredLanguage === lang;
          return (
            <Pressable
              key={lang}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              onPress={() => handleLanguageSelect(lang)}
              style={({ pressed }) => [
                styles.pickerOptionRow,
                {
                  backgroundColor: isSelected
                    ? colors.primaryTint
                    : isDark
                    ? colors.surfaceAlt
                    : '#FFFFFF',
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderRadius: radius.card - 4,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text
                style={[
                  typography.body,
                  {
                    color: isSelected ? colors.primary : colors.text,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {languageLabels[lang]}
              </Text>
              {isSelected && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.primary}
                />
              )}
            </Pressable>
          );
        })}
      </ModalSheet>

      {/* 5. Görünüş (Tema) Sheet */}
      <ModalSheet
        visible={activeModal === 'theme'}
        onClose={() => setActiveModal(null)}
        title={t('profile.sections.theme', 'Görünüş')}
      >
        {(['system', 'light', 'dark'] as ThemeMode[]).map((mode) => {
          const isSelected = (profile.themeMode || 'system') === mode;
          return (
            <Pressable
              key={mode}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              onPress={() => handleThemeSelect(mode)}
              style={({ pressed }) => [
                styles.pickerOptionRow,
                {
                  backgroundColor: isSelected
                    ? colors.primaryTint
                    : isDark
                    ? colors.surfaceAlt
                    : '#FFFFFF',
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderRadius: radius.card - 4,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text
                style={[
                  typography.body,
                  {
                    color: isSelected ? colors.primary : colors.text,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
              >
                {themeLabels[mode]}
              </Text>
              {isSelected && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.primary}
                />
              )}
            </Pressable>
          );
        })}
      </ModalSheet>

      {/* 6. Məxfilik və Şərtlər Sheet */}
      <ModalSheet
        visible={activeModal === 'privacy'}
        onClose={() => setActiveModal(null)}
        title={t('profile.sections.privacy', 'Məxfilik və şərtlər')}
      >
        <ScrollView style={{ maxHeight: 380 }}>
          <Text
            style={[
              typography.heading,
              { color: colors.text, marginBottom: 8, fontSize: 16 },
            ]}
          >
            1. Məlumatların Qorunması
          </Text>
          <Text
            style={[
              typography.body,
              { color: colors.textSecondary, marginBottom: 16, fontSize: 14, lineHeight: 20 },
            ]}
          >
            StayNow tətbiqində daxil etdiyiniz bütün fərdi məlumatlar (ad, telefon, email, sənəd nömrəsi) cihazınızın şifrələnmiş lokal yaddaşında saxlanılır və yalnız sizin icazənizlə otel rezervasiyasını təsdiq etmək üçün ötürülür.
          </Text>

          <Text
            style={[
              typography.heading,
              { color: colors.text, marginBottom: 8, fontSize: 16 },
            ]}
          >
            2. Rezervasiya və Ödəniş Qaydaları
          </Text>
          <Text
            style={[
              typography.body,
              { color: colors.textSecondary, marginBottom: 16, fontSize: 14, lineHeight: 20 },
            ]}
          >
            Rezervasiyalar üçün ödəniş bilavasitə otelə çatdıqda həyata keçirilir. Əlavə xidmət haqqı tutulmur.
          </Text>

          <Text
            style={[
              typography.heading,
              { color: colors.text, marginBottom: 8, fontSize: 16 },
            ]}
          >
            3. Ləğvetmə Şərtləri
          </Text>
          <Text
            style={[
              typography.body,
              { color: colors.textSecondary, marginBottom: 16, fontSize: 14, lineHeight: 20 },
            ]}
          >
            Pulsuz ləğvetmə seçimi olan otellər üçün rezervasiyanı giriş gününə ən azı 24 saat qalmış heç bir cərimə tətbiq edilmədən ləğv edə bilərsiniz.
          </Text>
        </ScrollView>
      </ModalSheet>

      {/* 7. Haqqında Sheet */}
      <ModalSheet
        visible={activeModal === 'about'}
        onClose={() => setActiveModal(null)}
        title={t('profile.sections.about', 'HotelTonight Haqqında')}
      >
        <View style={{ alignItems: 'center', paddingVertical: 16 }}>
          <View
            style={[
              styles.avatarCircle,
              {
                backgroundColor: '#592391',
                width: 72,
                height: 72,
                borderRadius: 36,
                marginBottom: 12,
              },
            ]}
          >
            <Text style={[styles.avatarInitials, { fontSize: 28 }]}>HT</Text>
          </View>
          <Text style={[typography.title, { color: colors.text, fontWeight: '800' }]}>
            HotelTonight
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
            Versiya 2.0.0 (HotelTonight Experience)
          </Text>
          <Text
            style={[
              typography.body,
              {
                color: colors.textSecondary,
                textAlign: 'center',
                marginTop: 16,
                lineHeight: 22,
                paddingHorizontal: 8,
              },
            ]}
          >
            HotelTonight bu gecə və son dəqiqə otel təkliflərini ən rahat və sərfəli şəkildə tapıb rezervasiya etmək üçün qlobal butik otel platformasıdır.
          </Text>
        </View>
      </ModalSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  editPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    marginTop: 14,
  },
  htPerksCard: {
    marginTop: 14,
    overflow: 'hidden',
    shadowColor: '#592391',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  htPerksGradient: {
    padding: 16,
  },
  htPerksTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  htPerksBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  htPerksBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  htPerksSavingsText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00C48C',
    letterSpacing: 0.5,
  },
  htPerksHeadline: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  htPerksProgressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    overflow: 'hidden',
    marginBottom: 8,
  },
  htPerksProgressBar: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#00C48C',
  },
  htPerksBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  htPerksSubtext: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  groupedCard: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 58,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuTextCol: {
    flex: 1,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 66,
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderWidth: 1,
    marginTop: 24,
    marginBottom: 20,
    minHeight: 52,
  },
  pickerOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    marginBottom: 10,
  },
});
