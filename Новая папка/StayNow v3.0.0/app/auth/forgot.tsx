import React, { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Mail } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Button, Card, Input, ScreenHeader, StayNowLogo } from '@/components/ui';
import {
  ForgotPasswordFormData,
  forgotPasswordSchema,
} from '@/features/auth/schemas';
import { authApi } from '@/services/authApi';
import { colors, radius, spacing, typography } from '@/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [generalError, setGeneralError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    Keyboard.dismiss();
    setGeneralError(null);
    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await authApi.forgotPassword(data.email);
      setSubmittedEmail(data.email);
      setIsSuccess(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setGeneralError('Xəta baş verdi. Zəhmət olmasa bir az sonra yenidən cəhd edin.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
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
          <Text style={styles.title}>Şifrəni Bərpa Edin</Text>
          <Text style={styles.subtitle}>
            Hesabınızın e-poçt ünvanını daxil edin, sizə şifrəni yeniləmək üçün keçid göndərəcəyik
          </Text>
        </View>

        {isSuccess ? (
          <Card style={styles.successCard}>
            <View style={styles.successIconCircle}>
              <CheckCircle2 size={36} color={colors.savings} />
            </View>
            <Text style={styles.successTitle}>Bərpa Linki Göndərildi</Text>
            <Text style={styles.successDesc}>
              <Text style={styles.emailHighlight}>{submittedEmail}</Text> ünvanına təlimat göndərildi. Zəhmət olmasa gələnlər qutusunu (və spam qovluğunu) yoxlayın.
            </Text>
            <Button
              title="Daxil olmağa qayıt"
              variant="primary"
              onPress={() =>
                router.replace({
                  pathname: '/auth/login',
                  params: returnTo ? { returnTo } : {},
                })
              }
              style={styles.backToLoginBtn}
            />
          </Card>
        ) : (
          <View style={styles.form}>
            {generalError && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{generalError}</Text>
              </View>
            )}

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="E-poçt ünvanı"
                  placeholder="nümunə@staynow.az"
                  value={value}
                  onChangeText={(text) => {
                    setGeneralError(null);
                    onChange(text);
                  }}
                  onBlur={onBlur}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={() => handleSubmit(onSubmit)()}
                  leftIcon={<Mail size={18} color={colors.textSecondary} />}
                  error={errors.email?.message}
                />
              )}
            />

            <Button
              title="Bərpa linki göndər"
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
              onPress={handleSubmit(onSubmit)}
              style={styles.submitBtn}
            />
          </View>
        )}

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Şifrəni xatırladınız?</Text>
          <Pressable
            onPress={() =>
              router.replace({
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
  form: {
    width: '100%',
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
  submitBtn: {
    height: 54,
    marginTop: spacing.sm,
  },
  successCard: {
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.savingsTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
  },
  successDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  emailHighlight: {
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  backToLoginBtn: {
    height: 54,
    width: '100%',
    marginTop: spacing.sm,
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