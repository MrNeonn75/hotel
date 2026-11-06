import React, { useState } from 'react';
import {
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
  ChevronRight,
  Heart,
  HelpCircle,
  Info,
  LogIn,
  LogOut,
  Phone,
  Settings,
  ShieldCheck,
  Ticket,
  UserPlus,
  UserRound,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import {
  Badge,
  Button,
  Card,
  Divider,
  ListRow,
  StayNowLogo,
  Toast,
} from '@/components/ui';
import { useAuthStore } from '@/store';
import { colors, radius, spacing, typography } from '@/theme';
import { az } from '@/i18n/az';

export default function AccountTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, logout } = useAuthStore();

  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogoutPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setIsLogoutModalVisible(true);
  };

  const handleConfirmLogout = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setIsLogoutModalVisible(false);
    await logout();
    showToast('Hesabdan çıxış edildi');
  };

  const userInitial = user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) + spacing.xs }]}>
        <Text style={styles.headerTitle}>{az.account.title}</Text>
        <Text style={styles.headerSubtitle}>
          {isAuthenticated
            ? 'Profil idarəetməsi və fərdi tənzimləmələr'
            : 'Xüsusi üstünlüklər və idarəetmə mərkəzi'}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 90 }, // accommodate tab bar
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. TOP SECTION: AUTHENTICATED PROFILE OR AUTH PROMPT */}
        {isAuthenticated && user ? (
          <Card style={styles.profileCard}>
            <Pressable
              style={styles.profileRow}
              onPress={() => router.push('/account/profile')}
            >
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarLetter}>{userInitial}</Text>
              </View>

              <View style={styles.profileTextCol}>
                <Text style={styles.profileName} numberOfLines={1}>
                  {user.firstName} {user.lastName}
                </Text>
                <Text style={styles.profileEmail} numberOfLines={1}>
                  {user.email}
                </Text>
                {user.phone ? (
                  <View style={styles.phoneRow}>
                    <Phone size={12} color={colors.textMuted} />
                    <Text style={styles.profilePhone}>{user.phone}</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.profileEditArrow}>
                <ChevronRight size={20} color={colors.textSecondary} />
              </View>
            </Pressable>
          </Card>
        ) : (
          <Card style={styles.authPromptCard}>
            <View style={styles.logoWrap}>
              <StayNowLogo size={34} />
            </View>
            <Text style={styles.authPromptTitle}>{az.account.loginPromptTitle}</Text>
            <Text style={styles.authPromptDesc}>{az.account.loginPromptDesc}</Text>

            <View style={styles.authButtonsRow}>
              <Button
                title={az.account.login}
                variant="primary"
                icon={<LogIn size={18} color={colors.text} />}
                onPress={() =>
                  router.push({
                    pathname: '/auth/login',
                    params: { returnTo: '/(tabs)/account' },
                  })
                }
                style={styles.authBtn}
              />
              <Button
                title={az.account.signup}
                variant="secondary"
                icon={<UserPlus size={18} color={colors.text} />}
                onPress={() =>
                  router.push({
                    pathname: '/auth/signup',
                    params: { returnTo: '/(tabs)/account' },
                  })
                }
                style={styles.authBtn}
              />
            </View>
          </Card>
        )}

        {/* 2. HESAB QRUPU (Yalnız giriş edilibsə) */}
        {isAuthenticated && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>{az.account.sectionAccount}</Text>
            <Card style={styles.groupCard}>
              <ListRow
                title={az.account.profile}
                description={az.account.profileDesc}
                icon={<UserRound size={20} color={colors.primary} />}
                onPress={() => router.push('/account/profile')}
              />
              <Divider />
              <ListRow
                title={az.account.trips}
                description={az.account.tripsDesc}
                icon={<Ticket size={20} color={colors.primary} />}
                onPress={() => router.push('/(tabs)/trips')}
              />
              <Divider />
              <ListRow
                title={az.account.favorites}
                description={az.account.favoritesDesc}
                icon={<Heart size={20} color={colors.primary} />}
                onPress={() => router.push('/(tabs)/favorites')}
              />
            </Card>
          </View>
        )}

        {/* 3. TƏTBİQ QRUPU */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>{az.account.sectionApp}</Text>
          <Card style={styles.groupCard}>
            <ListRow
              title={az.account.settings}
              description={az.account.settingsDesc}
              icon={<Settings size={20} color={colors.primary} />}
              onPress={() => router.push('/account/settings')}
            />
            <Divider />
            <ListRow
              title={az.account.support}
              description={az.account.supportDesc}
              icon={<HelpCircle size={20} color={colors.primary} />}
              onPress={() => router.push('/account/support')}
            />
          </Card>
        </View>

        {/* 4. HAQQINDA QRUPU */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>{az.account.sectionAbout}</Text>
          <Card style={styles.groupCard}>
            <ListRow
              title={az.account.terms}
              description={az.account.termsDesc}
              icon={<ShieldCheck size={20} color={colors.primary} />}
              onPress={() => router.push('/account/terms')}
            />
            <Divider />
            <ListRow
              title={az.account.version}
              description="StayNow Mobil Platforması"
              icon={<Info size={20} color={colors.textSecondary} />}
              rightElement={<Badge label="v3.0.0" variant="neutral" />}
              showChevron={false}
            />
          </Card>
        </View>

        {/* 5. ÇIXIŞ (Yalnız giriş edilibsə) */}
        {isAuthenticated && (
          <View style={styles.logoutSection}>
            <Card style={styles.logoutCard}>
              <ListRow
                title={az.account.logout}
                titleStyle={{ color: colors.urgency, fontWeight: typography.fontWeight.semibold }}
                icon={<LogOut size={20} color={colors.urgency} />}
                showChevron={false}
                onPress={handleLogoutPress}
              />
            </Card>
          </View>
        )}
      </ScrollView>

      {/* ÇIXIŞ TƏSDİQ MODALI */}
      <Modal
        visible={isLogoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsLogoutModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsLogoutModalVisible(false)}
        >
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.logoutModalIconCircle}>
              <LogOut size={26} color={colors.urgency} />
            </View>

            <Text style={styles.modalTitle}>{az.account.logoutConfirmTitle}</Text>
            <Text style={styles.modalDesc}>{az.account.logoutConfirmMessage}</Text>

            <View style={styles.modalActionsRow}>
              <Button
                title={az.common.cancel}
                variant="secondary"
                onPress={() => setIsLogoutModalVisible(false)}
                style={styles.modalBtn}
              />
              <Button
                title={az.account.logout}
                variant="secondary"
                onPress={handleConfirmLogout}
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
        <View style={[styles.toastContainer, { bottom: insets.bottom + 85 }]}>
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
  // Profile hero card
  profileCard: {
    padding: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: colors.primaryTint,
  },
  avatarLetter: {
    fontSize: 22,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  profileTextCol: {
    flex: 1,
  },
  profileName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  profileEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  profilePhone: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  profileEditArrow: {
    paddingLeft: spacing.sm,
  },
  // Auth prompt card
  authPromptCard: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoWrap: {
    marginBottom: spacing.md,
  },
  authPromptTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  authPromptDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  authButtonsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.md,
  },
  authBtn: {
    flex: 1,
    height: 50,
  },
  // Sections
  section: {
    gap: spacing.xs,
  },
  sectionHeading: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingLeft: spacing.xs,
    marginBottom: 4,
  },
  groupCard: {
    padding: 0,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  logoutSection: {
    marginTop: spacing.xs,
  },
  logoutCard: {
    padding: 0,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  // Modal
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
  logoutModalIconCircle: {
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
