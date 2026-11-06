import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
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
import {
  ChevronDown,
  ChevronUp,
  Headset,
  HelpCircle,
  Mail,
  MessageSquare,
  Phone,
  Send,
  Ticket,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  Button,
  Card,
  Chip,
  Divider,
  Input,
  ScreenHeader,
  Toast,
} from '@/components/ui';
import { colors, radius, spacing, typography } from '@/theme';
import { az } from '@/i18n/az';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'Rezervasiyanı necə ləğv edə bilərəm və ödəniş nə vaxt qaytarılır?',
    answer:
      'Səfərlər tabında aktiv rezervasiyanızı seçərək "Rezervasiyanı ləğv et" düyməsinə toxuna bilərsiniz. Pulsuz ləğv siyasətinə uyğun olaraq ödənişiniz 1-3 iş günü ərzində bank kartınıza 100% geri qaytarılır.',
  },
  {
    question: 'Giriş (check-in) və çıxış (check-out) saatları necədir?',
    answer:
      'Standart giriş vaxtı 14:00-dan başlayır, çıxış isə saat 12:00-dəkdir. Erkən giriş və ya gec çıxış üçün rezervasiya zamanı xüsusi istək qeyd edə və ya otellə birbaşa əlaqə saxlaya bilərsiniz.',
  },
  {
    question: 'Ödənişin təhlükəsizliyinə necə zəmanət verilir?',
    answer:
      'Bütün onlayn əməliyyatlar beynəlxalq 3D Secure və 256-bit SSL şifrələmə protokolları ilə qorunur. Kart məlumatlarınız tətbiqdə saxlanılmır və birbaşa lisenziyalı bank şlüzü tərəfindən icra edilir.',
  },
  {
    question: 'Otelə çatdıqda hansı sənədlər tələb olunur?',
    answer:
      'Qonağın şəxsiyyət vəsiqəsi (və ya xarici pasportu) və StayNow tətbiqindəki təsdiq kodu (məsələn BK-8924) qeydiyyat şöbəsinə təqdim edilməlidir.',
  },
  {
    question: 'Rezervasiya təsdiq kodunu haradan tapa bilərəm?',
    answer:
      'Rezervasiya tamamlandıqdan sonra kod dərhal ekranda əks olunur, e-poçt ünvanınıza göndərilir və həmçinin "Səfərlər" tabında daimi olaraq qalır.',
  },
  {
    question: 'Qiymətə bütün vergilər və səhər yeməyi daxildirmi?',
    answer:
      'Bəli, StayNow-da göstərilən bütün qiymətlərə ƏDV və şəhər vergiləri daxildir. Səhər yeməyinin daxil olub-olmaması seçdiyiniz otaq təklifinin kartında aydın göstərilir.',
  },
  {
    question: 'Uşaqlarla səyahət zamanı əlavə çarpayı təmin edilirmi?',
    answer:
      'Rezervasiya zamanı uşaq sayını və xüsusi istəklər qrafasında uşaq çarpayısı ehtiyacını qeyd edə bilərsiniz. Əksər otellər 6 yaşa qədər uşaqlar üçün ödənişsiz əlavə yer təklif edir.',
  },
  {
    question: '24/7 müştəri xidmətləri ilə necə əlaqə saxlaya bilərəm?',
    answer:
      'Dəstək komandamız həftənin 7 günü 24 saat xidmətinizdədir. Qaynar xətt (+994 12 599 00 00), e-poçt və ya aşağıdakı kömək forması vasitəsilə bizə yaza bilərsiniz.',
  },
];

const SUBJECTS = [
  'Ləğv və geri qaytarma',
  'Giriş (Check-in) sualı',
  'Ödəniş və faktura',
  'Otaq dəyişikliyi',
  'Digər müraciət',
];

export default function SupportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Accordion state
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  // Help Request form state
  const [bookingCode, setBookingCode] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleFaq = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setExpandedFaqIndex((prev) => (prev === index ? null : index));
  };

  const handleCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    Linking.openURL('tel:+994125990000').catch(() => {
      showToast('Zəng açmaq mümkün olmadı: +994 12 599 00 00');
    });
  };

  const handleEmail = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    Linking.openURL('mailto:support@staynow.az?subject=StayNow%20Müştəri%20Dəstəyi').catch(() => {
      showToast('E-poçt müştərisi tapılmadı: support@staynow.az');
    });
  };

  const handleSubmitRequest = () => {
    if (!message.trim()) {
      setErrorMessage('Zəhmət olmasa müraciət mesajınızı daxil edin');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    // Mock API dispatch
    setTimeout(() => {
      setIsSubmitting(false);
      setMessage('');
      setBookingCode('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      showToast(az.support.requestSent);
    }, 800);
  };

  return (
    <View style={styles.container}>
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader
          title={az.support.title}
          subtitle={az.support.subtitle}
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
          {/* 1. HERO SUPPORT CARD */}
          <Card style={styles.heroCard}>
            <View style={styles.heroIconCircle}>
              <Headset size={32} color={colors.primary} />
            </View>
            <Text style={styles.heroTitle}>24/7 Müştəri Xidmətləri</Text>
            <Text style={styles.heroSubtitle}>
              Sualınız, xüsusi istəyiniz və ya təcili rezervasiya probleminiz var?
              Dəstək komandamız gecə-gündüz yanınızdadır.
            </Text>

            <View style={styles.contactButtonsRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.contactBtn,
                  pressed && styles.contactBtnPressed,
                ]}
                onPress={handleCall}
              >
                <View style={styles.contactBtnIcon}>
                  <Phone size={18} color={colors.white} />
                </View>
                <Text style={styles.contactBtnTitle}>{az.support.callUs}</Text>
                <Text style={styles.contactBtnSub}>+994 12 599 00 00</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.contactBtn,
                  pressed && styles.contactBtnPressed,
                ]}
                onPress={handleEmail}
              >
                <View style={styles.contactBtnIcon}>
                  <Mail size={18} color={colors.white} />
                </View>
                <Text style={styles.contactBtnTitle}>{az.support.emailUs}</Text>
                <Text style={styles.contactBtnSub}>support@staynow.az</Text>
              </Pressable>
            </View>
          </Card>

          {/* 2. TEZ-TEZ VERİLƏN SUALLAR (FAQ ACCORDION) */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <HelpCircle size={18} color={colors.primary} />
              <Text style={styles.sectionHeading}>{az.support.faq}</Text>
            </View>

            <Card style={styles.faqCard}>
              {FAQS.map((faq, index) => {
                const isExpanded = expandedFaqIndex === index;
                const isLast = index === FAQS.length - 1;

                return (
                  <View key={index}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.faqHeader,
                        pressed && styles.faqHeaderPressed,
                      ]}
                      onPress={() => toggleFaq(index)}
                    >
                      <Text style={styles.faqQuestion}>{faq.question}</Text>
                      {isExpanded ? (
                        <ChevronUp size={20} color={colors.primary} />
                      ) : (
                        <ChevronDown size={20} color={colors.textSecondary} />
                      )}
                    </Pressable>

                    {isExpanded && (
                      <View style={styles.faqAnswerContainer}>
                        <Text style={styles.faqAnswer}>{faq.answer}</Text>
                      </View>
                    )}

                    {!isLast && <Divider />}
                  </View>
                );
              })}
            </Card>
          </View>

          {/* 3. REZERVASİYA KODU İLƏ KÖMƏK FORMASI */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <MessageSquare size={18} color={colors.primary} />
              <Text style={styles.sectionHeading}>{az.support.requestHelp}</Text>
            </View>

            <Card style={styles.formCard}>
              <Input
                label={az.support.bookingCode}
                placeholder="Məsələn: BK-8924"
                value={bookingCode}
                onChangeText={setBookingCode}
                autoCapitalize="characters"
                leftIcon={<Ticket size={18} color={colors.textSecondary} />}
              />

              <View style={styles.subjectBlock}>
                <Text style={styles.subjectLabel}>{az.support.subject}</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.subjectChipsRow}
                >
                  {SUBJECTS.map((subj) => (
                    <Chip
                      key={subj}
                      label={subj}
                      selected={selectedSubject === subj}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                        setSelectedSubject(subj);
                      }}
                    />
                  ))}
                </ScrollView>
              </View>

              <View style={styles.messageBlock}>
                <Text style={styles.subjectLabel}>{az.support.message}</Text>
                <TextInput
                  style={[
                    styles.messageInput,
                    errorMessage ? styles.messageInputError : null,
                  ]}
                  placeholder={az.support.messagePlaceholder}
                  placeholderTextColor={colors.textMuted}
                  value={message}
                  onChangeText={(val) => {
                    setMessage(val);
                    if (errorMessage) setErrorMessage('');
                  }}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                {errorMessage ? (
                  <Text style={styles.errorText}>{errorMessage}</Text>
                ) : null}
              </View>

              <Button
                title={isSubmitting ? 'Göndərilir...' : az.support.submitRequest}
                variant="primary"
                icon={
                  isSubmitting ? (
                    <ActivityIndicator size="small" color={colors.text} />
                  ) : (
                    <Send size={18} color={colors.text} />
                  )
                }
                disabled={isSubmitting}
                onPress={handleSubmitRequest}
                style={styles.submitBtn}
              />
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
    gap: spacing.xl,
  },
  heroCard: {
    padding: spacing.xl,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  heroIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  heroSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  contactButtonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  contactBtn: {
    flex: 1,
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.md,
    alignItems: 'center',
  },
  contactBtnPressed: {
    backgroundColor: colors.surface,
  },
  contactBtnIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  contactBtnTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  contactBtnSub: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    marginTop: 2,
  },
  // Section headings
  section: {
    gap: spacing.xs,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingLeft: spacing.xs,
    marginBottom: 2,
  },
  sectionHeading: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  // FAQ accordion
  faqCard: {
    padding: 0,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  faqHeaderPressed: {
    backgroundColor: colors.surfaceHighlight,
  },
  faqQuestion: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    paddingRight: spacing.sm,
    lineHeight: 22,
  },
  faqAnswerContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    paddingTop: spacing.xs,
  },
  faqAnswer: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  // Form card
  formCard: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    borderRadius: radius.xl,
  },
  subjectBlock: {
    gap: spacing.xs,
  },
  subjectLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  subjectChipsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  messageBlock: {
    gap: spacing.xs,
  },
  messageInput: {
    minHeight: 100,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text,
  },
  messageInputError: {
    borderColor: colors.urgency,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.urgency,
    marginTop: 2,
  },
  submitBtn: {
    height: 52,
    marginTop: spacing.xs,
  },
  toastContainer: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
  },
});
