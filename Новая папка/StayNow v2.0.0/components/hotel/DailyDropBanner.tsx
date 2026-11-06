import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { useDailyDropStore } from '@/store/dailyDropStore';
import { HOTELS } from '@/data/hotels';
import { useTheme } from '@/hooks/useTheme';
import { HT_CATEGORIES } from '@/constants/theme';
import { formatPrice } from '@/utils/format';

export const DailyDropBanner: React.FC = () => {
  const router = useRouter();
  const { colors, typography, radius } = useTheme();

  const {
    isUnlocked,
    mysteryHotelId,
    specialPrice,
    originalPrice,
    discountPercent,
    unlockDailyDrop,
    getSecondsRemaining,
  } = useDailyDropStore();

  const [secondsLeft, setSecondsLeft] = useState(getSecondsRemaining());
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const unlockScale = useRef(new Animated.Value(1)).current;

  const mysteryHotel = HOTELS.find((h) => h.id === mysteryHotelId) || HOTELS[0];
  const categoryMeta = HT_CATEGORIES.LUXE;

  // Timer interval for countdown
  useEffect(() => {
    if (!isUnlocked) return;

    setSecondsLeft(getSecondsRemaining());

    const interval = setInterval(() => {
      const remaining = getSecondsRemaining();
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isUnlocked, getSecondsRemaining]);

  // Subtle pulsing animation on locked state
  useEffect(() => {
    if (isUnlocked) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [isUnlocked, pulseAnim]);

  const handleUnlock = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.sequence([
      Animated.timing(unlockScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(unlockScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
    unlockDailyDrop();
  };

  const handleOpenHotel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/hotel/${mysteryHotel.id}` as any);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ═══ 1. UNLOCKED STATE (15-MINUTE COUNTDOWN DEPOSIT) ═══
  if (isUnlocked && secondsLeft > 0) {
    return (
      <View style={[styles.container, { borderRadius: radius.card }]}>
        <LinearGradient
          colors={['#1B1924', '#2D1B4E', '#1B1924']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradientCard, { borderRadius: radius.card }]}
        >
          {/* Header Row: Daily Drop + Live Countdown */}
          <View style={styles.unlockedHeader}>
            <View style={styles.dropTagRow}>
              <View style={styles.fireCircle}>
                <Ionicons name="flame" size={14} color="#FFFFFF" />
              </View>
              <Text style={styles.dropTagText}>DAILY DROP · GÜNÜN TƏKLİFİ</Text>
            </View>

            {/* Countdown Clock */}
            <View style={styles.countdownBadge}>
              <Ionicons name="timer-outline" size={14} color="#FF5A5F" style={{ marginRight: 4 }} />
              <Text style={styles.countdownText}>{formatTimer(secondsLeft)}</Text>
            </View>
          </View>

          {/* Hotel Info Row */}
          <Pressable onPress={handleOpenHotel} style={styles.hotelPreviewRow}>
            <Image
              source={{ uri: mysteryHotel.images[0] }}
              style={styles.hotelThumb}
              contentFit="cover"
              cachePolicy="memory-disk"
            />

            <View style={styles.hotelPreviewInfo}>
              <View style={styles.badgeRow}>
                <View style={[styles.catBadge, { backgroundColor: categoryMeta.badgeBg }]}>
                  <Text style={[styles.catBadgeText, { color: categoryMeta.badgeText }]}>
                    {categoryMeta.label}
                  </Text>
                </View>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeText}>-{discountPercent}%</Text>
                </View>
              </View>

              <Text style={styles.hotelName} numberOfLines={1}>
                {mysteryHotel.name}
              </Text>

              <Text style={styles.hotelLocation}>
                {mysteryHotel.neighborhood} · {mysteryHotel.rating.toFixed(1)} Əla
              </Text>

              {/* Price */}
              <View style={styles.priceRow}>
                <Text style={styles.oldPrice}>{formatPrice(originalPrice)}</Text>
                <Text style={styles.specialPrice}>{formatPrice(specialPrice)}</Text>
                <Text style={styles.perNight}>/gecə</Text>
              </View>
            </View>
          </Pressable>

          {/* Action Button */}
          <Pressable onPress={handleOpenHotel} style={styles.viewDealBtn}>
            <Text style={styles.viewDealBtnText}>Xüsusi qiymətlə rezerv et</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </Pressable>
        </LinearGradient>
      </View>
    );
  }

  // ═══ 2. EXPIRED STATE ═══
  if (isUnlocked && secondsLeft <= 0) {
    return (
      <View style={[styles.container, { borderRadius: radius.card }]}>
        <View style={[styles.expiredCard, { borderRadius: radius.card, backgroundColor: colors.surfaceAlt }]}>
          <Ionicons name="hourglass-outline" size={24} color={colors.textSecondary} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={[typography.heading, { color: colors.text, fontSize: 15 }]}>
              Bu günün Daily Drop təklifi bitdi
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
              Növbəti gizli endirim sabah səhər saat 10:00-da açılacaq.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // ═══ 3. LOCKED MYSTERY STATE (HotelTonight Signature) ═══
  return (
    <Animated.View
      style={[
        styles.container,
        { borderRadius: radius.card, transform: [{ scale: unlockScale }] },
      ]}
    >
      <Pressable onPress={handleUnlock} style={styles.pressableWrap}>
        <LinearGradient
          colors={['#592391', '#806AEC', '#4A154B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradientCard, { borderRadius: radius.card }]}
        >
          <View style={styles.lockedContent}>
            {/* Left animated lock icon */}
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <View style={styles.lockCircle}>
                <Ionicons name="lock-closed" size={22} color="#FFFFFF" />
              </View>
            </Animated.View>

            {/* Middle text */}
            <View style={styles.lockedTextCol}>
              <View style={styles.dropTagRow}>
                <Text style={styles.lockedPreTitle}>HOTELTONIGHT</Text>
                <View style={styles.exclusivePill}>
                  <Text style={styles.exclusivePillText}>-50% QƏDƏR</Text>
                </View>
              </View>
              <Text style={styles.lockedTitle}>Daily Drop · Günün Təklifi</Text>
              <Text style={styles.lockedSubtitle}>
                Yalnız sizin üçün seçilmiş 5★ lüks otel. 15 dəqiqəlik eksklüziv qiymət.
              </Text>
            </View>

            {/* Right action button */}
            <View style={styles.unlockPillBtn}>
              <Text style={styles.unlockPillText}>Aç</Text>
              <Ionicons name="sparkles" size={14} color="#592391" style={{ marginLeft: 3 }} />
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 12,
    overflow: 'hidden',
    shadowColor: '#592391',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  pressableWrap: {
    width: '100%',
  },
  gradientCard: {
    padding: 16,
  },
  lockedContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lockCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  lockedTextCol: {
    flex: 1,
    paddingRight: 8,
  },
  dropTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  lockedPreTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 1,
  },
  exclusivePill: {
    backgroundColor: '#FF5A5F',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: 6,
  },
  exclusivePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  lockedTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  lockedSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.82)',
    marginTop: 2,
    lineHeight: 16,
  },
  unlockPillBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  unlockPillText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#592391',
  },
  // Unlocked styles
  unlockedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  fireCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF5A5F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  dropTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 90, 95, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF5A5F',
  },
  countdownText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FF5A5F',
    fontVariant: ['tabular-nums'],
  },
  hotelPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 10,
    borderRadius: 14,
    marginBottom: 12,
  },
  hotelThumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
    marginRight: 12,
  },
  hotelPreviewInfo: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  catBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  catBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  discountBadge: {
    backgroundColor: '#00C48C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  hotelName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  hotelLocation: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  oldPrice: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  specialPrice: {
    fontSize: 17,
    fontWeight: '800',
    color: '#00C48C',
  },
  perNight: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 2,
  },
  viewDealBtn: {
    backgroundColor: '#806AEC',
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewDealBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  expiredCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
});

