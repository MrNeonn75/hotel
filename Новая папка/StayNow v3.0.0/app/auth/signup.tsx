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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail, Phone, User as UserIcon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Button, Checkbox, Input, ScreenHeader, StayNowLogo } from '@/components/ui';
import {
  formatAzPhoneNumber,
  SignupFormData,
  signupSchema,
} from '@/features/auth/schemas';
import { useAuthStore } from '@/store';
import { colors, radius, spacing, typography } from '@/theme';

export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();

  const { signup } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field focus refs
  const lastNameRef = useRef<any>(null);
  const emailRef = useRef<any>(null);
  const phoneRef = useRef<any>(null);
  const passwordRef = useRef<any>(null);
  const confirmPasswordRef = useRef<any>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '+994 ',
      password: '',
      confirmPassword: '',
      termsAccepted: false,
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    Keyboard.dismiss();
    setAuthError(null);
    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const res = await signup({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      password: data.password,
    });
    setIsSubmitting(false);

    if (res.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (returnTo) {
        router.replace(returnTo as any);
      } else {
        router.replace('/(tabs)/account');
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setAuthError(res.error || 'Qeydiyyat zamanı xəta baş verdi.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
        <ScreenHeader
          title=""
          onBack={() => router.back()}
        />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandHeader}>
          <StayNowLogo size={36} />
          <Text style={styles.title}>Yeni Hesab Yaradın</Text>
          <Text style={styles.subtitle}>
            Bakının lüks otellərində ən yaxşı son dəqiqə təkliflərindən yararlanın
          </Text>
        </View>

        {authError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{authError}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Controller
                control={control}
                name="firstName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Ad"
                    placeholder="Əli"
                    value={value}
                    onChangeText={(text) => {
                      setAuthError(null);
                      onChange(text);
                    }}
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
                    placeholder="Məmmədov"
                    value={value}
                    onChangeText={(text) => {
                      setAuthError(null);
                      onChange(text);
                    }}
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
                placeholder="eli@staynow.az"
                value={value}
                onChangeText={(text) => {
                  setAuthError(null);
                  onChange(text);
                }}
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
                label="Mobil telefon"
                placeholder="+994 50 123 45 67"
                value={value}
                onChangeText={(text) => {
                  setAuthError(null);
                  const formatted = formatAzPhoneNumber(text);
                  onChange(formatted);
                }}
                onBlur={onBlur}
                keyboardType="phone-pad"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                leftIcon={<Phone size={18} color={colors.textSecondary} />}
                error={errors.phone?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                ref={passwordRef}
                label="Şifrə (min. 8 simvol)"
                placeholder="Şifrə təyin edin"
                value={value}
                onChangeText={(text) => {
                  setAuthError(null);
                  onChange(text);
                }}
                onBlur={onBlur}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                leftIcon={<Lock size={18} color={colors.textSecondary} />}
                rightIcon={
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={8}
                  >
                    {showPassword ? (
                      <EyeOff size={18} color={colors.textSecondary} />
                    ) : (
                      <Eye size={18} color={colors.textSecondary} />
                    )}
                  </Pressable>
                }
                error={errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                ref={confirmPasswordRef}
                label="Şifrənin təkrarı"
                placeholder="Şifrəni təkrar daxil edin"
                value={value}
                onChangeText={(text) => {
                  setAuthError(null);
                  onChange(text);
                }}
                onBlur={onBlur}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={() => handleSubmit(onSubmit)()}
                leftIcon={<Lock size={18} color={colors.textSecondary} />}
                rightIcon={
                  <Pressable
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    hitSlop={8}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} color={colors.textSecondary} />
                    ) : (
                      <Eye size={18} color={colors.textSecondary} />
                    )}
                  </Pressable>
                }
                error={errors.confirmPassword?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="termsAccepted"
            render={({ field: { onChange, value } }) => (
              <View style={styles.termsWrapper}>
                <Checkbox
                  checked={value}
                  onValueChange={onChange}
                  label="İstifadəçi Qaydaları və Məxfilik Siyasəti ilə razıyam"
                />
                {errors.termsAccepted?.message && (
                  <Text style={styles.termsError}>
                    {errors.termsAccepted.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Button
            title="Qeydiyyatdan keç"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
            onPress={handleSubmit(onSubmit)}
            style={styles.submitBtn}
          />
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Artıq hesabınız var?</Text>
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/auth/login',
                params: returnTo ? { returnTo } : {},
              })
            }
          >
            <Text style={styles.footerLink}>Daxil olun</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerWrapper: {
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 20,
    paddingHorizontal: spacing.md,
  },
  errorBanner: {
    backgroundColor: colors.urgencyTint,
    borderWidth: 1,
    borderColor: colors.urgency,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorBannerText: {
    fontSize: typography.fontSize.xs,
    color: colors.urgency,
    textAlign: 'center',
    fontWeight: typography.fontWeight.medium,
  },
  form: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flex1: {
    flex: 1,
  },
  termsWrapper: {
    marginBottom: spacing.lg,
    marginTop: spacing.xs,
  },
  termsError: {
    fontSize: typography.fontSize.xs,
    color: colors.urgency,
    marginTop: spacing.xs,
    marginLeft: 32,
  },
  submitBtn: {
    height: 54,
    marginTop: spacing.xs,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing['2xl'],
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  footerLink: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
});