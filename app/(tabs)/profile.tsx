import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { useTheme } from '@/constants/theme';
import { useProfileStore, PreferredLanguage, PreferredTheme } from '@/store/profileStore';
import i18n from '@/i18n';

// Zod Validation Schema
const phoneRegex = /^(\+994|0)?\s?(50|51|55|70|77|99|10)\s?[0-9]{3}\s?[0-9]{2}\s?[0-9]{2}$|^(\+994)[0-9]{9}$/;

const profileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .refine((val) => val.length === 0 || val.length >= 2, {
      message: 'Ad ən azı 2 hərfdən ibarət olmalıdır',
    }),
  lastName: z
    .string()
    .trim()
    .refine((val) => val.length === 0 || val.length >= 2, {
      message: 'Soyad ən azı 2 hərfdən ibarət olmalıdır',
    }),
  phone: z
    .string()
    .trim()
    .refine((val) => val.length === 0 || val === '+994' || phoneRegex.test(val), {
      message: 'Düzgün nömrə daxil edin (məs: +994501234567)',
    }),
  email: z
    .string()
    .trim()
    .refine((val) => val.length === 0 || z.string().email().safeParse(val).success, {
      message: 'Düzgün e-poçt ünvanı daxil edin',
    }),
  birthDate: z.string().trim().optional(),
  nationality: z.string().trim().optional(),
  documentNumber: z.string().trim().optional(),
  city: z.string().trim().optional(),
  address: z.string().trim().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileScreen() {
  const { colors, fonts, radius, spacing, shadows, isDark } = useTheme();
  const profile = useProfileStore((state) => state.profile);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const clearProfile = useProfileStore((state) => state.clearProfile);

  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phone: profile.phone || '',
      email: profile.email || '',
      birthDate: profile.birthDate || '',
      nationality: profile.nationality || 'Azərbaycan',
      documentNumber: profile.documentNumber || '',
      city: profile.city || 'Bakı',
      address: profile.address || '',
    },
  });

  // Sync form when profile changes externally (e.g. after booking)
  useEffect(() => {
    if (!isEditing) {
      reset({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        email: profile.email || '',
        birthDate: profile.birthDate || '',
        nationality: profile.nationality || 'Azərbaycan',
        documentNumber: profile.documentNumber || '',
        city: profile.city || 'Bakı',
        address: profile.address || '',
      });
    }
  }, [profile, reset, isEditing]);

  // Mask document number for security
  const getMaskedDocument = (doc?: string) => {
    if (!doc || doc.trim().length === 0) return 'Qeyd edilməyib';
    const trimmed = doc.trim();
    if (trimmed.length <= 4) return '•••• ' + trimmed;
    const prefix = trimmed.slice(0, 3);
    const suffix = trimmed.slice(-2);
    return `${prefix} •••• ••${suffix}`;
  };

  // Get user initials for avatar
  const getInitials = () => {
    const f = profile.firstName?.trim() || '';
    const l = profile.lastName?.trim() || '';
    if (f && l) {
      return (f[0] + l[0]).toUpperCase();
    }
    if (f) return f.slice(0, 2).toUpperCase();
    if (l) return l.slice(0, 2).toUpperCase();
    return null;
  };

  const handleStartEditing = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    reset({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      phone: profile.phone || '',
      email: profile.email || '',
      birthDate: profile.birthDate || '',
      nationality: profile.nationality || 'Azərbaycan',
      documentNumber: profile.documentNumber || '',
      city: profile.city || 'Bakı',
      address: profile.address || '',
    });
    setIsEditing(false);
  };

  const onSubmit = (data: ProfileFormData) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateProfile({
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      phone: data.phone || '',
      email: data.email || '',
      birthDate: data.birthDate || '',
      nationality: data.nationality || '',
      documentNumber: data.documentNumber || '',
      city: data.city || '',
      address: data.address || '',
    });
    setIsEditing(false);
    setSaveSuccessMessage(true);
    setTimeout(() => {
      setSaveSuccessMessage(false);
    }, 3000);
  };

  const handleLanguageChange = (lang: PreferredLanguage) => {
    Haptics.selectionAsync();
    updateProfile({ preferredLanguage: lang });
    i18n.changeLanguage(lang.toLowerCase());
  };

  const handleThemeChange = (theme: PreferredTheme) => {
    Haptics.selectionAsync();
    updateProfile({ preferredTheme: theme });
  };

  const handleClearAll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Məlumatları sil',
      'Bütün şəxsi profil məlumatlarınız silinəcək və tətbiq ilkin vəziyyətinə qayıdacaq. Davam etmək istəyirsiniz?',
      [
        { text: 'İmtina', style: 'cancel' },
        {
          text: 'Bəli, sil',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            clearProfile();
            reset({
              firstName: '',
              lastName: '',
              phone: '',
              email: '',
              birthDate: '',
              nationality: 'Azərbaycan',
              documentNumber: '',
              city: 'Bakı',
              address: '',
            });
            setIsEditing(false);
          },
        },
      ]
    );
  };

  const fullName =
    `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Qonaq İstifadəçi';
  const initials = getInitials();
  const currentLang = profile.preferredLanguage || 'AZ';
  const currentTheme = profile.preferredTheme || 'system';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header Bar */}
      <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingVertical: spacing.md }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text, fontFamily: fonts.extraBold }]}>
            Profil
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
            Hesab və tətbiq ayarları
          </Text>
        </View>

        {!isEditing ? (
          <Pressable
            accessibilityLabel="Profili redaktə et"
            accessibilityRole="button"
            onPress={handleStartEditing}
            style={({ pressed }) => [
              styles.editBtn,
              {
                backgroundColor: isDark ? colors.surface : colors.primary + '15',
                borderColor: colors.primary,
                opacity: pressed ? 0.75 : 1,
              },
            ]}>
            <Ionicons name="pencil" size={16} color={colors.primary} />
            <Text style={[styles.editBtnText, { color: colors.primary, fontFamily: fonts.bold }]}>
              Redaktə et
            </Text>
          </Pressable>
        ) : (
          <View style={styles.editActionRow}>
            <Pressable
              accessibilityLabel="Redaktəni ləğv et"
              accessibilityRole="button"
              onPress={handleCancelEditing}
              style={({ pressed }) => [
                styles.cancelBtn,
                { opacity: pressed ? 0.7 : 1 },
              ]}>
              <Text style={[styles.cancelBtnText, { color: colors.textSecondary, fontFamily: fonts.medium }]}>
                Ləğv et
              </Text>
            </Pressable>

            <Pressable
              accessibilityLabel="Dəyişiklikləri yadda saxla"
              accessibilityRole="button"
              onPress={handleSubmit(onSubmit)}
              style={({ pressed }) => [
                styles.saveBtn,
                { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
              ]}>
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              <Text style={[styles.saveBtnText, { fontFamily: fonts.bold }]}>
                Yadda saxla
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing.lg }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Success Toast Banner */}
        {saveSuccessMessage && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={[
              styles.successBanner,
              { backgroundColor: colors.success + '20', borderColor: colors.success },
            ]}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={[styles.successBannerText, { color: colors.success, fontFamily: fonts.semiBold }]}>
              Məlumatlar uğurla yadda saxlanıldı!
            </Text>
          </Animated.View>
        )}

        {/* User Card */}
        <View
          style={[
            styles.userCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.card,
            },
            shadows.card,
          ]}>
          <View
            style={[
              styles.avatarContainer,
              { backgroundColor: colors.primary, borderRadius: radius.pill },
            ]}>
            {initials ? (
              <Text style={[styles.avatarInitials, { fontFamily: fonts.extraBold }]}>
                {initials}
              </Text>
            ) : (
              <Ionicons name="person" size={38} color="#FFFFFF" />
            )}
          </View>

          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text, fontFamily: fonts.bold }]} numberOfLines={1}>
              {fullName}
            </Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary, fontFamily: fonts.regular }]} numberOfLines={1}>
              {profile.email || 'E-poçt daxil edilməyib'}
            </Text>

            <View style={styles.userStatusRow}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      profile.firstName && profile.phone
                        ? colors.success + '20'
                        : colors.warning + '20',
                  },
                ]}>
                <Ionicons
                  name={profile.firstName && profile.phone ? 'checkmark-circle' : 'alert-circle'}
                  size={14}
                  color={profile.firstName && profile.phone ? colors.success : colors.warning}
                />
                <Text
                  style={[
                    styles.statusBadgeText,
                    {
                      color: profile.firstName && profile.phone ? colors.success : colors.warning,
                      fontFamily: fonts.semiBold,
                    },
                  ]}>
                  {profile.firstName && profile.phone ? 'Məlumatlar aktivdir' : 'Məlumatlar tam deyil'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Info Note */}
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: isDark ? colors.surface : colors.primary + '10',
              borderColor: colors.primary + '30',
              borderRadius: radius.button,
            },
          ]}>
          <Ionicons name="information-circle" size={22} color={colors.primary} />
          <Text
            style={[
              styles.infoCardText,
              { color: isDark ? colors.text : colors.primaryDark, fontFamily: fonts.medium },
            ]}>
            Bu məlumatlar növbəti rezervasiyalarda avtomatik doldurulacaq.
          </Text>
        </View>

        {/* SECTION 1: Personal Info */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.card,
            },
            shadows.soft,
          ]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBg, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="person-outline" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.bold }]}>
              Şəxsi məlumatlar
            </Text>
          </View>

          {/* Ad */}
          <View style={styles.fieldItem}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: fonts.medium }]}>
              Ad
            </Text>
            {isEditing ? (
              <Controller
                control={control}
                name="firstName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          color: colors.text,
                          backgroundColor: colors.background,
                          borderColor: errors.firstName ? colors.accent : colors.border,
                          fontFamily: fonts.medium,
                          borderRadius: radius.button,
                        },
                      ]}
                      placeholder="Adınızı daxil edin"
                      placeholderTextColor={colors.textSecondary}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                    {errors.firstName && (
                      <Text style={[styles.errorText, { color: colors.accent, fontFamily: fonts.regular }]}>
                        {errors.firstName.message}
                      </Text>
                    )}
                  </View>
                )}
              />
            ) : (
              <Text style={[styles.fieldValue, { color: profile.firstName ? colors.text : colors.textSecondary, fontFamily: fonts.semiBold }]}>
                {profile.firstName || 'Qeyd edilməyib'}
              </Text>
            )}
          </View>

          {/* Soyad */}
          <View style={styles.fieldItem}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: fonts.medium }]}>
              Soyad
            </Text>
            {isEditing ? (
              <Controller
                control={control}
                name="lastName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          color: colors.text,
                          backgroundColor: colors.background,
                          borderColor: errors.lastName ? colors.accent : colors.border,
                          fontFamily: fonts.medium,
                          borderRadius: radius.button,
                        },
                      ]}
                      placeholder="Soyadınızı daxil edin"
                      placeholderTextColor={colors.textSecondary}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                    {errors.lastName && (
                      <Text style={[styles.errorText, { color: colors.accent, fontFamily: fonts.regular }]}>
                        {errors.lastName.message}
                      </Text>
                    )}
                  </View>
                )}
              />
            ) : (
              <Text style={[styles.fieldValue, { color: profile.lastName ? colors.text : colors.textSecondary, fontFamily: fonts.semiBold }]}>
                {profile.lastName || 'Qeyd edilməyib'}
              </Text>
            )}
          </View>

          {/* Doğum tarixi */}
          <View style={styles.fieldItem}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: fonts.medium }]}>
              Doğum tarixi
            </Text>
            {isEditing ? (
              <Controller
                control={control}
                name="birthDate"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        fontFamily: fonts.medium,
                        borderRadius: radius.button,
                      },
                    ]}
                    placeholder="GG.AA.İİİİ (məs: 15.06.1992)"
                    placeholderTextColor={colors.textSecondary}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            ) : (
              <Text style={[styles.fieldValue, { color: profile.birthDate ? colors.text : colors.textSecondary, fontFamily: fonts.semiBold }]}>
                {profile.birthDate || 'Qeyd edilməyib'}
              </Text>
            )}
          </View>

          {/* Vətəndaşlıq */}
          <View style={styles.fieldItemLast}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: fonts.medium }]}>
              Vətəndaşlıq
            </Text>
            {isEditing ? (
              <Controller
                control={control}
                name="nationality"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        fontFamily: fonts.medium,
                        borderRadius: radius.button,
                      },
                    ]}
                    placeholder="Azərbaycan"
                    placeholderTextColor={colors.textSecondary}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            ) : (
              <Text style={[styles.fieldValue, { color: profile.nationality ? colors.text : colors.textSecondary, fontFamily: fonts.semiBold }]}>
                {profile.nationality || 'Azərbaycan'}
              </Text>
            )}
          </View>
        </View>

        {/* SECTION 2: Contact Info */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.card,
            },
            shadows.soft,
          ]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBg, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="call-outline" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.bold }]}>
              Əlaqə məlumatları
            </Text>
          </View>

          {/* Telefon */}
          <View style={styles.fieldItem}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: fonts.medium }]}>
              Telefon nömrəsi
            </Text>
            {isEditing ? (
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          color: colors.text,
                          backgroundColor: colors.background,
                          borderColor: errors.phone ? colors.accent : colors.border,
                          fontFamily: fonts.medium,
                          borderRadius: radius.button,
                        },
                      ]}
                      placeholder="+994501234567"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="phone-pad"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                    {errors.phone && (
                      <Text style={[styles.errorText, { color: colors.accent, fontFamily: fonts.regular }]}>
                        {errors.phone.message}
                      </Text>
                    )}
                  </View>
                )}
              />
            ) : (
              <Text style={[styles.fieldValue, { color: profile.phone ? colors.text : colors.textSecondary, fontFamily: fonts.semiBold }]}>
                {profile.phone || 'Qeyd edilməyib'}
              </Text>
            )}
          </View>

          {/* E-poçt */}
          <View style={styles.fieldItem}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: fonts.medium }]}>
              E-poçt ünvanı
            </Text>
            {isEditing ? (
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          color: colors.text,
                          backgroundColor: colors.background,
                          borderColor: errors.email ? colors.accent : colors.border,
                          fontFamily: fonts.medium,
                          borderRadius: radius.button,
                        },
                      ]}
                      placeholder="ad@nümunə.az"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                    {errors.email && (
                      <Text style={[styles.errorText, { color: colors.accent, fontFamily: fonts.regular }]}>
                        {errors.email.message}
                      </Text>
                    )}
                  </View>
                )}
              />
            ) : (
              <Text style={[styles.fieldValue, { color: profile.email ? colors.text : colors.textSecondary, fontFamily: fonts.semiBold }]}>
                {profile.email || 'Qeyd edilməyib'}
              </Text>
            )}
          </View>

          {/* Şəhər */}
          <View style={styles.fieldItem}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: fonts.medium }]}>
              Şəhər
            </Text>
            {isEditing ? (
              <Controller
                control={control}
                name="city"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        fontFamily: fonts.medium,
                        borderRadius: radius.button,
                      },
                    ]}
                    placeholder="Bakı"
                    placeholderTextColor={colors.textSecondary}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            ) : (
              <Text style={[styles.fieldValue, { color: profile.city ? colors.text : colors.textSecondary, fontFamily: fonts.semiBold }]}>
                {profile.city || 'Bakı'}
              </Text>
            )}
          </View>

          {/* Ünvan */}
          <View style={styles.fieldItemLast}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: fonts.medium }]}>
              Ünvan
            </Text>
            {isEditing ? (
              <Controller
                control={control}
                name="address"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        fontFamily: fonts.medium,
                        borderRadius: radius.button,
                      },
                    ]}
                    placeholder="Küçə və mənzil nömrəsi"
                    placeholderTextColor={colors.textSecondary}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            ) : (
              <Text style={[styles.fieldValue, { color: profile.address ? colors.text : colors.textSecondary, fontFamily: fonts.semiBold }]}>
                {profile.address || 'Qeyd edilməyib'}
              </Text>
            )}
          </View>
        </View>

        {/* SECTION 3: Document Info */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.card,
            },
            shadows.soft,
          ]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBg, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="card-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.sectionTitleCol}>
              <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.bold }]}>
                Sənəd məlumatları
              </Text>
              <Text style={[styles.sectionSubtext, { color: colors.textSecondary, fontFamily: fonts.regular }]}>
                Təhlükəsiz maskalanmış şəkildə saxlanılır
              </Text>
            </View>
          </View>

          {/* Sənəd Nömrəsi */}
          <View style={styles.fieldItemLast}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: fonts.medium }]}>
              Sənəd / Pasport nömrəsi
            </Text>
            {isEditing ? (
              <Controller
                control={control}
                name="documentNumber"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                        fontFamily: fonts.medium,
                        borderRadius: radius.button,
                      },
                    ]}
                    placeholder="Məs: AZE 12345678"
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="characters"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
            ) : (
              <View style={styles.maskedRow}>
                <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
                <Text style={[styles.fieldValueMasked, { color: profile.documentNumber ? colors.text : colors.textSecondary, fontFamily: fonts.semiBold }]}>
                  {getMaskedDocument(profile.documentNumber)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* SECTION 4: App Settings */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderRadius: radius.card,
            },
            shadows.soft,
          ]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconBg, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="settings-outline" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: fonts.bold }]}>
              Tətbiq ayarları
            </Text>
          </View>

          {/* Dil Seçimi */}
          <View style={styles.fieldItem}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: fonts.medium }]}>
              Tətbiq dili
            </Text>
            <View style={[styles.segmentContainer, { backgroundColor: colors.background, borderRadius: radius.button }]}>
              {(['AZ', 'EN', 'RU'] as PreferredLanguage[]).map((lang) => {
                const isSelected = currentLang === lang;
                return (
                  <Pressable
                    key={lang}
                    accessibilityRole="button"
                    accessibilityLabel={`Dil seçimi: ${lang}`}
                    onPress={() => handleLanguageChange(lang)}
                    style={[
                      styles.segmentBtn,
                      isSelected && {
                        backgroundColor: colors.primary,
                        borderRadius: radius.button - 3,
                        ...shadows.soft,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.segmentBtnText,
                        {
                          color: isSelected ? '#FFFFFF' : colors.textSecondary,
                          fontFamily: isSelected ? fonts.bold : fonts.medium,
                        },
                      ]}>
                      {lang === 'AZ' ? 'Azərbaycan' : lang === 'EN' ? 'English' : 'Русский'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Tema Seçimi */}
          <View style={styles.fieldItemLast}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary, fontFamily: fonts.medium }]}>
              Görünüş rejimi
            </Text>
            <View style={[styles.segmentContainer, { backgroundColor: colors.background, borderRadius: radius.button }]}>
              {(
                [
                  { id: 'system', label: 'Sistem', icon: 'contrast-outline' },
                  { id: 'light', label: 'Açıq', icon: 'sunny-outline' },
                  { id: 'dark', label: 'Tünd', icon: 'moon-outline' },
                ] as const
              ).map((item) => {
                const isSelected = currentTheme === item.id;
                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Tema seçimi: ${item.label}`}
                    onPress={() => handleThemeChange(item.id)}
                    style={[
                      styles.segmentBtnWithIcon,
                      isSelected && {
                        backgroundColor: colors.primary,
                        borderRadius: radius.button - 3,
                        ...shadows.soft,
                      },
                    ]}>
                    <Ionicons
                      name={item.icon as any}
                      size={15}
                      color={isSelected ? '#FFFFFF' : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.segmentBtnText,
                        {
                          color: isSelected ? '#FFFFFF' : colors.textSecondary,
                          fontFamily: isSelected ? fonts.bold : fonts.medium,
                          marginLeft: 4,
                        },
                      ]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* Clear All Profile Data Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Bütün məlumatlarımı sil"
          onPress={handleClearAll}
          style={({ pressed }) => [
            styles.clearBtn,
            {
              backgroundColor: colors.accent + '15',
              borderColor: colors.accent,
              borderRadius: radius.button,
              opacity: pressed ? 0.75 : 1,
            },
          ]}>
          <Ionicons name="trash-outline" size={18} color={colors.accent} />
          <Text style={[styles.clearBtnText, { color: colors.accent, fontFamily: fonts.bold }]}>
            Bütün məlumatlarımı sil
          </Text>
        </Pressable>

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 28,
    lineHeight: 34,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  editBtnText: {
    fontSize: 13,
  },
  editActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cancelBtnText: {
    fontSize: 14,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  successBannerText: {
    fontSize: 14,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 68,
    height: 68,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 24,
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 18,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    marginBottom: 8,
  },
  userStatusRow: {
    flexDirection: 'row',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontSize: 11,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  infoCardText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  sectionCard: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#00000010',
  },
  sectionIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitleCol: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
  },
  sectionSubtext: {
    fontSize: 12,
    marginTop: 1,
  },
  fieldItem: {
    marginBottom: 14,
  },
  fieldItemLast: {
    marginBottom: 0,
  },
  fieldLabel: {
    fontSize: 12,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: 15,
  },
  fieldValueMasked: {
    fontSize: 15,
    letterSpacing: 1,
  },
  maskedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 15,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  segmentContainer: {
    flexDirection: 'row',
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnWithIcon: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnText: {
    fontSize: 13,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1,
    marginTop: 8,
  },
  clearBtnText: {
    fontSize: 15,
  },
});
