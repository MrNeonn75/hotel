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
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Button, IconButton, Input, ScreenHeader, StayNowLogo } from '@/components/ui';
import { LoginFormData, loginSchema } from '@/features/auth/schemas';
import { useAuthStore } from '@/store';
import { colors, radius, spacing, typography } from '@/theme';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();

  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordRef = useRef<any>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    Keyboard.dismiss();
    setAuthError(null);
    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const res = await login(data.email, data.password);
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
      setAuthError(res.error || 'E-poçt və ya şifrə yanlışdır.');
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
        {/* Brand Logo & Heading */}
        <View style={styles.brandHeader}>
          <StayNowLogo size={36} />
          <Text style={styles.title}>StayNow-a Daxil Olun</Text>
          <Text style={styles.subtitle}>
            Rezervasiyalarınızı idarə etmək və xüsusi qiymətlərdən yararlanmaq üçün daxil olun
          </Text>
        </View>

        {/* Global Error Banner if any */}
        {authError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{authError}</Text>
          </View>
        )}

        {/* Form Fields */}
        <View style={styles.form}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="E-poçt ünvanı"
                placeholder="nümunə@staynow.az"
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
                onSubmitEditing={() => passwordRef.current?.focus()}
                leftIcon={<Mail size={18} color={colors.textSecondary} />}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                ref={passwordRef}
                label="Şifrə"
                placeholder="Şifrənizi daxil edin"
                value={value}
                onChangeText={(text) => {
                  setAuthError(null);
                  onChange(text);
                }}
                onBlur={onBlur}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={() => handleSubmit(onSubmit)()}
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

          {/* Forgot Password Link */}
          <Pressable
            style={styles.forgotBtn}
            onPress={() =>
              router.push({
                pathname: '/auth/forgot',
                params: returnTo ? { returnTo } : {},
              })
            }
          >
            <Text style={styles.forgotText}>Şifrəni unutmusunuz?</Text>
          </Pressable>

          {/* Submit Button (54px height) */}
          <Button
            title="Daxil ol"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
            onPress={handleSubmit(onSubmit)}
            style={styles.submitBtn}
          />
        </View>

        {/* Bottom Switch to Sign Up */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Hesabınız yoxdur?</Text>
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/auth/signup',
                params: returnTo ? { returnTo } : {},
              })
            }
          >
            <Text style={styles.footerLink}>Qeydiyyatdan keçin</Text>
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: -spacing.xs,
    marginBottom: spacing.lg,
    paddingVertical: 4,
  },
  forgotText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  submitBtn: {
    height: 54, // 54px button as requested
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
