import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowRight,
  Bell,
  Clock3,
  Compass,
  ConciergeBell,
  Dumbbell,
  Heart,
  LockKeyhole,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Wifi,
} from 'lucide-react-native';
import {
  AppBottomSheet,
  AppBottomSheetRef,
  AppIcon,
  Badge,
  Button,
  Card,
  Checkbox,
  Chip,
  Divider,
  EmptyState,
  IconButton,
  Input,
  ListRow,
  PriceLine,
  ScreenHeader,
  SectionHeading,
  Skeleton,
  StayNowLogo,
  Toast,
  Toggle,
} from '@/components/ui';
import { colors, radius, spacing, typography } from '@/theme';

export default function UiKitScreen() {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<AppBottomSheetRef>(null);

  // Interactive component states
  const [btnLoading, setBtnLoading] = useState(false);
  const [selectedChip, setSelectedChip] = useState<'baku' | 'ganja' | 'gabala'>('baku');
  const [checkbox1, setCheckbox1] = useState(true);
  const [checkbox2, setCheckbox2] = useState(false);
  const [toggle1, setToggle1] = useState(true);
  const [toggle2, setToggle2] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpenBottomSheet = () => {
    bottomSheetRef.current?.present();
  };

  const handleCloseBottomSheet = () => {
    bottomSheetRef.current?.dismiss();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader
        title="StayNow UI Kit"
        showBack={false}
        rightElement={
          <IconButton
            icon={<Bell size={20} color={colors.text} />}
            variant="ghost"
            onPress={() => alert('Bildirişlər')}
          />
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + spacing['3xl'] },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Section: Logos & Identity */}
          <SectionHeading title="1. Logo & Brend Nişanları" />
          <Card style={styles.cardSection}>
            <View style={styles.logoRow}>
              <View style={styles.logoItem}>
                <Text style={styles.tokenLabel}>StayNowLogo</Text>
                <StayNowLogo size={36} showWordmark={true} />
              </View>
              <View style={styles.logoItem}>
                <Text style={styles.tokenLabel}>AppIcon (64px)</Text>
                <AppIcon size={64} borderRadius={16} />
              </View>
            </View>
          </Card>

          <Divider marginVertical="lg" />

          {/* Section: Theme Colors Token Palette */}
          <SectionHeading title="2. Tema Rəngləri (Dark Theme)" />
          <Card style={styles.cardSection}>
            <View style={styles.paletteGrid}>
              <PaletteItem name="brand" color={colors.brand} label="#806AEC" />
              <PaletteItem name="brandPressed" color={colors.brandPressed} label="#6A55D6" />
              <PaletteItem name="primary" color={colors.primary} label="#9B88F2" />
              <PaletteItem name="primaryTint" color={colors.primaryTint} label="#241F3D" />
              <PaletteItem name="background" color={colors.background} label="#0F0E17" bordered />
              <PaletteItem name="surfaceAlt" color={colors.surfaceAlt} label="#1A1926" />
              <PaletteItem name="savings" color={colors.savings} label="#34D399" />
              <PaletteItem name="urgency" color={colors.urgency} label="#FF6B70" />
              <PaletteItem name="star" color={colors.star} label="#FFC24D" />
              <PaletteItem name="border" color={colors.border} label="#2B2A3A" />
            </View>
          </Card>

          <Divider marginVertical="lg" />

          {/* Section: Buttons */}
          <SectionHeading title="3. Düymələr (54px hündürlük)" />
          <View style={styles.buttonStack}>
            <Button
              title="Əsas Rezervasiya (Primary CTA)"
              variant="primary"
              icon={<Sparkles size={18} color={colors.white} />}
              onPress={() => alert('Primary düymə basıldı')}
            />
            <Button
              title="İkincili Düymə (Secondary)"
              variant="secondary"
              onPress={() => alert('Secondary düymə basıldı')}
            />
            <Button
              title="Ghost Düymə (Ətraflı)"
              variant="ghost"
              icon={<ArrowRight size={18} color={colors.primary} />}
              iconPosition="right"
              onPress={() => alert('Ghost düymə basıldı')}
            />
            <Button
              title="Yüklənir vəziyyəti"
              variant="primary"
              loading={btnLoading}
              onPress={() => {
                setBtnLoading(true);
                setTimeout(() => setBtnLoading(false), 2000);
              }}
            />
            <Button
              title="Qeyri-aktiv Düymə (Disabled)"
              variant="primary"
              disabled={true}
            />
          </View>

          <Divider marginVertical="lg" />

          {/* Section: Icon Buttons */}
          <SectionHeading title="4. İkon Düymələri (IconButton 40px)" />
          <View style={styles.iconButtonRow}>
            <IconButton
              icon={<Heart size={20} color={colors.text} />}
              variant="default"
              onPress={() => alert('Default')}
            />
            <IconButton
              icon={<Compass size={20} color={colors.white} />}
              variant="primary"
              onPress={() => alert('Primary')}
            />
            <IconButton
              icon={<MapPin size={20} color={colors.primary} />}
              variant="surface"
              onPress={() => alert('Surface')}
            />
            <IconButton
              icon={<Search size={20} color={colors.textSecondary} />}
              variant="ghost"
              onPress={() => alert('Ghost')}
            />
            <IconButton
              icon={<LockKeyhole size={20} color={colors.disabledText} />}
              disabled
            />
          </View>

          <Divider marginVertical="lg" />

          {/* Section: Chips / FilterChips */}
          <SectionHeading title="5. Chip və Filtrlər (Chip / FilterChip)" />
          <View style={styles.chipRow}>
            <Chip
              label="Bakı"
              selected={selectedChip === 'baku'}
              icon={<MapPin size={14} color={selectedChip === 'baku' ? colors.primary : colors.textSecondary} />}
              count={28}
              onPress={() => setSelectedChip('baku')}
            />
            <Chip
              label="Gəncə"
              selected={selectedChip === 'ganja'}
              icon={<Compass size={14} color={selectedChip === 'ganja' ? colors.primary : colors.textSecondary} />}
              count={12}
              onPress={() => setSelectedChip('ganja')}
            />
            <Chip
              label="Qəbələ"
              selected={selectedChip === 'gabala'}
              icon={<Heart size={14} color={selectedChip === 'gabala' ? colors.primary : colors.textSecondary} />}
              count={8}
              onPress={() => setSelectedChip('gabala')}
            />
            <Chip label="Deaktiv" disabled />
          </View>

          <Divider marginVertical="lg" />

          {/* Section: Badges */}
          <SectionHeading title="6. Nişanlar (Badges)" />
          <View style={styles.badgeRow}>
            <Badge
              label="30% Qənaət"
              variant="savings"
              icon={<Tag size={12} color={colors.savings} />}
            />
            <Badge
              label="Son 2 Otaq!"
              variant="offer"
              icon={<Clock3 size={12} color={colors.urgency} />}
            />
            <Badge
              label="4.9 Əla"
              variant="rating"
              icon={<Star size={12} color={colors.star} fill={colors.star} />}
            />
            <Badge label="Populyar" variant="primary" />
            <Badge label="Standart" variant="neutral" />
          </View>

          <Divider marginVertical="lg" />

          {/* Section: PriceLine */}
          <SectionHeading title="7. Qiymət Sətri (PriceLine)" />
          <Card style={styles.cardSection}>
            <PriceLine
              price={145}
              originalPrice={210}
              currency="₼"
              period="/ gecə"
              discountBadge="31% endirim"
              subtitle="Vergilər və rüsumlar daxil"
              size="lg"
            />
            <Divider marginVertical="md" />
            <PriceLine
              price={85}
              currency="₼"
              period="/ gecə"
              size="md"
              align="right"
              subtitle="Qeydiyyat zamanı ödəniş"
            />
          </Card>

          <Divider marginVertical="lg" />

          {/* Section: Inputs / Fields */}
          <SectionHeading title="8. Giriş Sahələri (Input / Field)" />
          <Input
            label="Otel və ya şəhər axtarışı"
            placeholder="Məsələn: Nizami küçəsi, Bakı..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<Search size={18} color={colors.textSecondary} />}
          />
          <Input
            label="Qonaq adı və soyadı"
            placeholder="Adınızı daxil edin"
            value={inputValue}
            onChangeText={setInputValue}
            helperText="Şəxsiyyət vəsiqəsində olduğu kimi yazın"
          />
          <Input
            label="Elektron poçt ünvanı (Xəta nümunəsi)"
            value="yanlis_email"
            error="Zəhmət olmasa düzgün email daxil edin"
          />
          <Input
            label="Qeyri-aktiv sahə"
            value="Dəyişdirilə bilməz"
            disabled
          />

          <Divider marginVertical="lg" />

          {/* Section: Checkbox & Toggle */}
          <SectionHeading title="9. Seçim və Açarlar (Checkbox & Toggle)" />
          <Card style={styles.cardSection}>
            <Checkbox
              label="Səhər yeməyi daxil edilsin"
              description="Hər səhər açıq bufet xidməti (+₼ 20/gecə)"
              checked={checkbox1}
              onValueChange={setCheckbox1}
            />
            <Divider marginVertical="sm" />
            <Checkbox
              label="Pulsuz ləğvetmə təminatı"
              description="Girişə 24 saat qalmış tam geri qaytarılma"
              checked={checkbox2}
              onValueChange={setCheckbox2}
            />
            <Divider marginVertical="md" />
            <Toggle
              label="Son dəqiqə bildirişləri"
              description="Yaxınlığınızdakı ən böyük endirimlər barədə xəbər verin"
              value={toggle1}
              onValueChange={setToggle1}
            />
            <Divider marginVertical="sm" />
            <Toggle
              label="Gecə rejimi bildirişləri"
              value={toggle2}
              onValueChange={setToggle2}
            />
          </Card>

          <Divider marginVertical="lg" />

          {/* Section: ListRow */}
          <SectionHeading title="10. Siyahı Sətirləri (ListRow)" />
          <View style={styles.listStack}>
            <ListRow
              title="Pulsuz Wi-Fi və Yüksək Sürət"
              description="Bütün otaqlarda və ictimai sahələrdə aktivdir"
              icon={<Wifi size={20} color={colors.primary} />}
              onPress={() => alert('Wi-Fi')}
            />
            <ListRow
              title="Fitnes və Trenajor Zalı"
              description="24/7 saat açıqdır, müasir avadanlıqlar"
              icon={<Dumbbell size={20} color={colors.primary} />}
              onPress={() => alert('Fitnes')}
            />
            <ListRow
              title="24/7 Konsyerj və Qeydiyyat"
              description="İstənilən vaxt daxil olma və baqaj saxlama"
              icon={<ConciergeBell size={20} color={colors.primary} />}
              onPress={() => alert('Konsyerj')}
            />
            <ListRow
              title="Təhlükəsiz Ödəniş Sistemi"
              description="256-bit SSL şifrələmə ilə qorunur"
              icon={<ShieldCheck size={20} color={colors.savings} />}
              showChevron={false}
            />
          </View>

          <Divider marginVertical="lg" />

          {/* Section: Toast */}
          <SectionHeading title="11. Bildirişlər (Toast)" />
          <View style={styles.toastStack}>
            <Toast type="success" message="Rezervasiyanız uğurla təsdiqləndi!" />
            <Toast type="error" message="Seçilmiş tarixlərdə boş otaq qalmayıb." />
            <Toast type="info" message="Giriş vaxtı: Bu gün saat 14:00-dan etibarən." />
          </View>

          <Divider marginVertical="lg" />

          {/* Section: Skeletons */}
          <SectionHeading title="12. Yüklənmə İllüstrasiyası (Skeleton)" />
          <Card style={styles.cardSection}>
            <Skeleton height={140} borderRadius={radius.lg} style={styles.mbSm} />
            <Skeleton width="70%" height={22} style={styles.mbXs} />
            <Skeleton width="45%" height={16} style={styles.mbSm} />
            <View style={styles.skeletonRow}>
              <Skeleton width={80} height={28} borderRadius={radius.pill} />
              <Skeleton width={100} height={28} borderRadius={radius.pill} />
            </View>
          </Card>

          <Divider marginVertical="lg" />

          {/* Section: BottomSheet Demo */}
          <SectionHeading title="13. Aşağı Panel (BottomSheet wrapper)" />
          <Button
            title="Aşağı Paneli Aç (Bottom Sheet)"
            variant="secondary"
            icon={<Tag size={18} color={colors.text} />}
            onPress={handleOpenBottomSheet}
          />

          <Divider marginVertical="lg" />

          {/* Section: EmptyState */}
          <SectionHeading title="14. Boş Vəziyyət (EmptyState)" />
          <Card style={styles.cardSection}>
            <EmptyState
              icon={<Compass size={32} color={colors.primary} />}
              title="Axtarışa uyğun otel tapılmadı"
              description="Filtrləri dəyişdirərək və ya başqa tarixlər seçərək yenidən yoxlayın."
              actionTitle="Filtrləri sıfırla"
              onActionPress={() => alert('Filtrlər sıfırlandı')}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Reusable Bottom Sheet Modal */}
      <AppBottomSheet
        ref={bottomSheetRef}
        title="Otaq və Qonaq Seçimi"
        snapPoints={['55%']}
        onClose={handleCloseBottomSheet}
      >
        <View style={styles.sheetInner}>
          <Text style={styles.sheetSubtitle}>
            Rezervasiya etmək istədiyiniz otaq parametrini seçin:
          </Text>

          <ListRow
            title="1 Otaq, 2 Böyük qonaq"
            description="Standart iki nəfərlik lüks otaq"
            icon={<MapPin size={20} color={colors.primary} />}
            onPress={() => handleCloseBottomSheet()}
            style={styles.mbSm}
          />
          <ListRow
            title="Ailəvi Otaq"
            description="2 Otaq, 2 Böyük + 2 Uşaq"
            icon={<Sparkles size={20} color={colors.primary} />}
            onPress={() => handleCloseBottomSheet()}
            style={styles.mbSm}
          />

          <Button
            title="Seçimi Təsdiqlə"
            variant="primary"
            style={styles.sheetConfirmBtn}
            onPress={handleCloseBottomSheet}
          />
        </View>
      </AppBottomSheet>
    </View>
  );
}

const PaletteItem: React.FC<{
  name: string;
  color: string;
  label: string;
  bordered?: boolean;
}> = ({ name, color, label, bordered }) => (
  <View style={styles.paletteItem}>
    <View
      style={[
        styles.paletteBox,
        { backgroundColor: color },
        bordered && styles.paletteBoxBordered,
      ]}
    />
    <Text style={styles.paletteName}>{name}</Text>
    <Text style={styles.paletteLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  cardSection: {
    marginVertical: spacing.xs,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
  },
  logoItem: {
    alignItems: 'center',
  },
  tokenLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  paletteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  paletteItem: {
    width: '45%',
    alignItems: 'center',
    backgroundColor: colors.surfaceHighlight,
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  paletteBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
  paletteBoxBordered: {
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  paletteName: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  paletteLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  buttonStack: {
    gap: spacing.md,
    marginVertical: spacing.xs,
  },
  iconButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  listStack: {
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  toastStack: {
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  mbXs: {
    marginBottom: spacing.xs,
  },
  mbSm: {
    marginBottom: spacing.sm,
  },
  sheetInner: {
    paddingVertical: spacing.md,
  },
  sheetSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  sheetConfirmBtn: {
    marginTop: spacing.lg,
  },
});
