import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Lock, Shield, ShieldCheck } from 'lucide-react-native';
import { Badge, Card, Divider, ScreenHeader } from '@/components/ui';
import { colors, radius, spacing, typography } from '@/theme';
import { az } from '@/i18n/az';

export default function TermsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader
          title={az.terms.title}
          subtitle={az.terms.subtitle}
          onBack={() => router.back()}
        />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero badge card */}
        <Card style={styles.badgeCard}>
          <View style={styles.badgeIcon}>
            <ShieldCheck size={28} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.badgeRow}>
              <Text style={styles.badgeTitle}>Hüquqi Təminat və Məxfilik</Text>
              <Badge label="Yeniləndi: Mart 2026" variant="neutral" size="sm" />
            </View>
            <Text style={styles.badgeDesc}>
              StayNow tətbiqindən istifadə etməklə siz aşağıdakı xidmət şərtlərini və fərdi
              məlumatların qorunması qaydalarını qəbul etmiş olursunuz.
            </Text>
          </View>
        </Card>

        {/* Section 1: General */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionNumber}>1. Ümumi Müddəalar</Text>
          <Text style={styles.paragraph}>
            1.1. StayNow mobil platforması istifadəçilərə lüks və butik otellərdə son dəqiqə
            otaqlarını eksklüziv qiymətlərlə axtarmaq, seçmək və onlayn rezerv etmək imkanı verir.
          </Text>
          <Text style={styles.paragraph}>
            1.2. Tətbiqdəki bütün xidmətlər Azərbaycan Respublikasının qüvvədə olan qanunvericiliyinə
            tam uyğun olaraq tənzimlənir.
          </Text>
        </Card>

        {/* Section 2: Booking and Payment */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionNumber}>2. Rezervasiya və Ödəniş Qaydaları</Text>
          <Text style={styles.paragraph}>
            2.1. Tətbiqdə göstərilən bütün tariflər milli valyuta olan Azərbaycan Manatı (AZN) ilə
            hesablanır və bütün dövlət vergiləri (ƏDV daxil) qiymətə daxildir.
          </Text>
          <Text style={styles.paragraph}>
            2.2. Ödəniş yalnız lisenziyalı bankın təhlükəsiz şlüzü vasitəsilə qəbul edilir. İstifadəçinin
            bank kartı məlumatları heç bir halda StayNow serverlərində qeydə alınmır və saxlanılmır.
          </Text>
          <Text style={styles.paragraph}>
            2.3. Ödəniş təsdiqləndikdən sonra unikal rezervasiya kodu (məsələn: BK-8924) generasiya edilir
            və elektron poçt ünvanınıza göndərilir.
          </Text>
        </Card>

        {/* Section 3: Cancellation */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionNumber}>3. Ləğvetmə və Geri Qaytarılma Siyasəti</Text>
          <Text style={styles.paragraph}>
            3.1. İstifadəçi tərəfindən otel qaydalarında göstərilən vaxta qədər ləğv edilən rezervasiyalar
            üçün ödənilmiş məbləğ 100% həcmində geri qaytarılır.
          </Text>
          <Text style={styles.paragraph}>
            3.2. Geri qaytarılan məbləğ istifadəçinin bankının daxili qaydalarından asılı olaraq 1-3 iş günü
            ərzində ödəniş aparılmış karta mədaxil olunur.
          </Text>
        </Card>

        {/* Section 4: Privacy */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeaderWithIcon}>
            <Lock size={18} color={colors.primary} />
            <Text style={styles.sectionNumber}>4. Fərdi Məlumatların Məxfiliyi</Text>
          </View>
          <Text style={styles.paragraph}>
            4.1. Qonağın adı, soyadı, əlaqə nömrəsi və e-poçt ünvanı yalnız rezervasiyanın rəsmiləşdirilməsi
            və otelə çatdırılması məqsədilə toplanır.
          </Text>
          <Text style={styles.paragraph}>
            4.2. StayNow istifadəçi məlumatlarını heç bir üçüncü tərəfə reklam və ya marketinq məqsədilə
            təqdim etmir.
          </Text>
          <Text style={styles.paragraph}>
            4.3. İstifadəçi istənilən vaxt profil ayarlarından saxlanılmış məlumatları sıfırlamaq və ya
            hesabını birdəfəlik silmək hüququna malikdir.
          </Text>
        </Card>

        {/* Section 5: Hotel Rules */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionNumber}>5. Otel Qaydaları və Məsuliyyət</Text>
          <Text style={styles.paragraph}>
            5.1. Qonaq otelə daxil olarkən şəxsiyyətini təsdiq edən sənədi və rezervasiya kodunu təqdim
            etməlidir.
          </Text>
          <Text style={styles.paragraph}>
            5.2. Otel daxilində qonaqlama qaydaları (siqaret çəkmə qadağası, ev heyvanları siyasəti və s.)
            hər bir otelin öz daxili reqlamentinə əsasən tənzimlənir.
          </Text>
        </Card>

        {/* Footer Contact */}
        <View style={styles.footerInfo}>
          <Text style={styles.footerCompany}>StayNow Technologies MMC</Text>
          <Text style={styles.footerAddress}>Bakı şəhəri, Səbail rayonu, Nizami küçəsi 45</Text>
          <Text style={styles.footerContact}>Dəstək: support@staynow.az | +994 12 599 00 00</Text>
        </View>
      </ScrollView>
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
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  badgeTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  badgeDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  sectionCard: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
    borderRadius: radius.xl,
  },
  cardHeaderWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sectionNumber: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: 2,
  },
  paragraph: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  footerInfo: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: 4,
  },
  footerCompany: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.textSecondary,
  },
  footerAddress: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  footerContact: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    marginTop: 2,
  },
});

