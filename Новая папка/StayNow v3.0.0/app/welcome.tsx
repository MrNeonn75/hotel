import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  MapPin,
} from 'lucide-react-native';
import {
  Button,
  Card,
  Divider,
  StayNowLogo,
} from '@/components/ui';
import {
  DateRangePickerSheet,
  LocationSearchSheet,
} from '@/components/search';
import { useAuthStore, useSearchStore } from '@/store';
import { formatDateRange } from '@/utils/format';
import { colors, radius, spacing, typography } from '@/theme';
import { az } from '@/i18n/az';

// Baku night cityscape hero image
const BAKU_HERO_IMAGE =
  'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1400&q=85';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setHasCompletedWelcome } = useAuthStore();
  const { location, checkInDate, checkOutDate } = useSearchStore();

  const [locationSheetVisible, setLocationSheetVisible] = useState(false);
  const [dateSheetVisible, setDateSheetVisible] = useState(false);

  // Entrance animation: fade + slide from bottom
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(45)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 750,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleProceed = () => {
    setHasCompletedWelcome(true);
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      {/* Fullscreen Baku hero photo */}
      <Image
        source={{ uri: BAKU_HERO_IMAGE }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        priority="high"
        cachePolicy="memory-disk"
      />

      {/* Reading scrim: dark gradient overlay */}
      <LinearGradient
        colors={[
          'rgba(15, 14, 23, 0.45)',
          'rgba(15, 14, 23, 0.75)',
          colors.background,
        ]}
        locations={[0, 0.45, 0.82]}
        style={StyleSheet.absoluteFill}
      />

      {/* Top Bar with Logo */}
      <View style={[styles.topHeader, { paddingTop: insets.top + spacing.lg }]}>
        <StayNowLogo size={38} showWordmark={true} />
      </View>

      {/* Animated Bottom Content */}
      <Animated.View
        style={[
          styles.bottomContainer,
          {
            paddingBottom: insets.bottom + spacing.xl,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Title & Tagline */}
        <View style={styles.textWrapper}>
          <Text style={styles.tagline}>BAKU ESCAPE</Text>
          <Text style={styles.mainHeading}>Bu gecə üçün lüks otellər</Text>
          <Text style={styles.description}>
            Son dəqiqə otelləri 45%-dək xüsusi qənaətlə rezerv edin.
          </Text>
        </View>

        {/* Search Card */}
        <Card style={styles.searchCard}>
          {/* Location field */}
          <Pressable
            onPress={() => setLocationSheetVisible(true)}
            style={({ pressed }) => [
              styles.fieldRow,
              pressed && styles.fieldRowPressed,
            ]}
          >
            <View style={styles.fieldIconCircle}>
              <MapPin size={18} color={colors.primary} />
            </View>
            <View style={styles.fieldTextCol}>
              <Text style={styles.fieldLabel}>Şəhər və ya məkan</Text>
              <Text style={styles.fieldValue} numberOfLines={1}>
                {location}
              </Text>
            </View>
            <ChevronDown size={18} color={colors.textSecondary} />
          </Pressable>

          <Divider marginVertical="sm" />

          {/* Date field */}
          <Pressable
            onPress={() => setDateSheetVisible(true)}
            style={({ pressed }) => [
              styles.fieldRow,
              pressed && styles.fieldRowPressed,
            ]}
          >
            <View style={styles.fieldIconCircle}>
              <Calendar size={18} color={colors.primary} />
            </View>
            <View style={styles.fieldTextCol}>
              <Text style={styles.fieldLabel}>Qalmaq tarixləri</Text>
              <View style={styles.dateValueRow}>
                <View style={styles.tonightPill}>
                  <Text style={styles.tonightPillText}>Bu gün</Text>
                </View>
                <Text style={styles.fieldValue}>
                  {formatDateRange(checkInDate, checkOutDate)}
                </Text>
              </View>
            </View>
            <ChevronDown size={18} color={colors.textSecondary} />
          </Pressable>
        </Card>

        {/* CTA Button */}
        <Button
          title="Otelləri Kəşf Et"
          variant="primary"
          icon={<ArrowRight size={20} color={colors.white} />}
          iconPosition="right"
          onPress={handleProceed}
          style={styles.ctaBtn}
        />
      </Animated.View>

      {/* Sheets */}
      <LocationSearchSheet
        visible={locationSheetVisible}
        onClose={() => setLocationSheetVisible(false)}
      />

      <DateRangePickerSheet
        visible={dateSheetVisible}
        onClose={() => setDateSheetVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
  },
  topHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  bottomContainer: {
    paddingHorizontal: spacing.lg,
    zIndex: 10,
  },
  textWrapper: {
    marginBottom: spacing.lg,
  },
  tagline: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  mainHeading: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: typography.fontWeight.extraBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.md,
  },
  searchCard: {
    padding: spacing.md,
    backgroundColor: 'rgba(26, 25, 38, 0.92)',
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  fieldRowPressed: {
    opacity: 0.7,
  },
  fieldIconCircle: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  fieldTextCol: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  dateValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tonightPill: {
    backgroundColor: colors.primaryTint,
    paddingHorizontal: spacing.xs + 3,
    paddingVertical: 1,
    borderRadius: radius.xs,
  },
  tonightPillText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  ctaBtn: {
    marginTop: spacing.xs,
  },
});
