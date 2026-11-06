import React, { useState } from 'react';
import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bell,
  Check,
  Coins,
  Database,
  ExternalLink,
  Globe,
  MapPin,
  Trash2,
  UserX,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  Badge,
  Button,
  Card,
  Divider,
  ListRow,
  ScreenHeader,
  Toast,
  Toggle,
} from '@/components/ui';
import { useAuthStore, useFavoritesStore, useProfileStore } from '@/store';
import { colors, radius, spacing, typography } from '@/theme';
import { az } from '@/i18n/az';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, logout } = useAuthStore();
  const { resetAutofill } = useProfileStore();
  const { clearFavorites } = useFavoritesStore();

  // Notification toggles
  const [bookingReminders, setBookingReminders] = useState(true);
  const [specialOffers, setSpecialOffers] = useState(true);
  const [priceDrops, setPriceDrops] = useState(false);

  // Modals & toast
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenSettings = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      await Linking.openSettings();
    } catch {
      showToast('Sistem ayarlarını açmaq mümkün olmadı');
    }
  };

  const handleClearCache = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    showToast(az.settings.cacheCleared);
  };

  const handleConfirmDeleteAccount = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    setIsDeleteModalVisible(false);

    // Mock delete account: logout, clear profile & favorites
    await logout();
    resetAutofill();
    clearFavorites();

    showToast(az.settings.deleteSuccess);
    setTimeout(() => {
      router.replace('/(tabs)');
    }, 800);
  };

  return (
    <View style={styles.container}>
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader
          title={az.settings.title}
          subtitle={az.settings.subtitle}
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
        {/* 1. DİL SEÇİMİ */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Globe size={18} color={colors.primary} />
            <Text style={styles.sectionHeading}>{az.settings.language}</Text>
          </View>

          <Card style={styles.cardGroup}>
            <View style={styles.optionRowActive}>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Azərbaycan dili</Text>
                <Text style={styles.optionSub}>Cari tətbiq dili</Text>
              </View>
              <View style={styles.checkCircle}>
                <Check size={16} color={colors.white} />
              </View>
            </View>

            <Divider />

            <View style={styles.optionRowDisabled}>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitleDisabled}>English</Text>
                <Text style={styles.optionSubDisabled}>İngilis dili</Text>
              </View>
              <Badge label={az.settings.soon} variant="neutral" />
            </View>

            <Divider />

            <View style={styles.optionRowDisabled}>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitleDisabled}>Русский</Text>
                <Text style={styles.optionSubDisabled}>Rus dili</Text>
              </View>
              <Badge label={az.settings.soon} variant="neutral" />
            </View>
          </Card>
        </View>

        {/* 2. VALYUTA SEÇİMİ */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Coins size={18} color={colors.primary} />
            <Text style={styles.sectionHeading}>{az.settings.currency}</Text>
          </View>

          <Card style={styles.cardGroup}>
            <View style={styles.optionRowActive}>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>AZN (₼)</Text>
                <Text style={styles.optionSub}>Azərbaycan manatı</Text>
              </View>
              <View style={styles.checkCircle}>
                <Check size={16} color={colors.white} />
              </View>
            </View>

            <Divider />

            <View style={styles.optionRowDisabled}>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitleDisabled}>USD ($)</Text>
                <Text style={styles.optionSubDisabled}>ABŞ dolları</Text>
              </View>
              <Badge label={az.settings.soon} variant="neutral" />
            </View>

            <Divider />

            <View style={styles.optionRowDisabled}>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitleDisabled}>EUR (€)</Text>
                <Text style={styles.optionSubDisabled}>Avro</Text>
              </View>
              <Badge label={az.settings.soon} variant="neutral" />
            </View>
          </Card>
        </View>

        {/* 3. BİLDİRİŞLƏR */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Bell size={18} color={colors.primary} />
            <Text style={styles.sectionHeading}>{az.settings.notifications}</Text>
          </View>

          <Card style={styles.togglesCard}>
            <Toggle
              label={az.settings.bookingReminders}
              description={az.settings.bookingRemindersDesc}
              value={bookingReminders}
              onValueChange={setBookingReminders}
            />

            <Divider marginVertical="sm" />

            <Toggle
              label={az.settings.specialOffers}
              description={az.settings.specialOffersDesc}
              value={specialOffers}
              onValueChange={setSpecialOffers}
            />

            <Divider marginVertical="sm" />

            <Toggle
              label="Qiymət enməsi bildirişləri"
              description="Baxdığınız və ya seçilmiş otellərdə qiymət düşdükdə bildiriş alın"
              value={priceDrops}
              onValueChange={setPriceDrops}
            />
          </Card>
        </View>

        {/* 4. MƏKAN İCAZƏSİ */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <MapPin size={18} color={colors.primary} />
            <Text style={styles.sectionHeading}>{az.settings.locationAccess}</Text>
          </View>

          <Card style={styles.cardGroup}>
            <ListRow
              title={az.settings.locationAccess}
              description={az.settings.locationAccessDesc}
              icon={<MapPin size={20} color={colors.savings} />}
              rightElement={
                <View style={styles.locationBadgeRow}>
                  <Badge label="Aktiv" variant="savings" />
                  <ExternalLink size={16} color={colors.textSecondary} style={{ marginLeft: 6 }} />
                </View>
              }
              showChevron={false}
              onPress={handleOpenSettings}
            />
          </Card>
        </View>

        {/* 5. KEŞ VƏ YADDAŞ */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Database size={18} color={colors.primary} />
            <Text style={styles.sectionHeading}>Yaddaş və Keş</Text>
          </View>

          <Card style={styles.cardGroup}>
            <ListRow
              title={az.settings.cache}
              description="Müvəqqəti foto və məlumat keşini təmizləyin (12.4 MB)"
              icon={<Database size={20} color={colors.textSecondary} />}
              rightElement={<Badge label="Təmizlə" variant="primary" />}
              showChevron={false}
              onPress={handleClearCache}
            />
          </Card>
        </View>

        {/* 6. HESABI SİL (Yalnız giriş edilibsə) */}
        {isAuthenticated && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <UserX size={18} color={colors.urgency} />
              <Text style={[styles.sectionHeading, { color: colors.urgency }]}>
                {az.settings.deleteAccount}
              </Text>
            </View>

            <Card style={styles.cardGroup}>
              <ListRow
                title={az.settings.deleteAccount}
                description={az.settings.deleteAccountDesc}
                icon={<Trash2 size={20} color={colors.urgency} />}
                titleStyle={{ color: colors.urgency }}
                onPress={() => setIsDeleteModalVisible(true)}
              />
            </Card>
          </View>
        )}
      </ScrollView>

      {/* HESABI SİLMƏ TƏSDİQ MODALI */}
      <Modal
        visible={isDeleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsDeleteModalVisible(false)}
        >
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.deleteModalIconCircle}>
              <Trash2 size={28} color={colors.urgency} />
            </View>

            <Text style={styles.modalTitle}>{az.settings.deleteConfirmTitle}</Text>
            <Text style={styles.modalDesc}>{az.settings.deleteConfirmMessage}</Text>

            <View style={styles.modalActionsRow}>
              <Button
                title={az.common.cancel}
                variant="secondary"
                onPress={() => setIsDeleteModalVisible(false)}
                style={styles.modalBtn}
              />
              <Button
                title="Hesabı sil"
                variant="secondary"
                onPress={handleConfirmDeleteAccount}
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
    gap: spacing.xl,
  },
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
  cardGroup: {
    padding: 0,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  togglesCard: {
    padding: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
  },
  optionRowActive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(128, 106, 236, 0.08)',
  },
  optionRowDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    opacity: 0.6,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  optionSub: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    marginTop: 2,
  },
  optionTitleDisabled: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  optionSubDisabled: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  deleteModalIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
