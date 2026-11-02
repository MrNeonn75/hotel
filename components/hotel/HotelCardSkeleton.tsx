import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/constants/theme';

export function HotelCardSkeleton() {
  const { colors, radius, spacing } = useTheme();
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.75, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const placeholderBg = colors.border;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderRadius: radius.card,
          borderColor: colors.border,
        },
      ]}>
      {/* Image skeleton */}
      <Animated.View
        style={[
          styles.imageSkeleton,
          { backgroundColor: placeholderBg },
          animatedStyle,
        ]}
      />

      <View style={[styles.content, { padding: spacing.lg }]}>
        {/* Title skeleton */}
        <Animated.View
          style={[
            styles.titleSkeleton,
            { backgroundColor: placeholderBg, borderRadius: 6 },
            animatedStyle,
          ]}
        />

        {/* Address skeleton */}
        <Animated.View
          style={[
            styles.addressSkeleton,
            { backgroundColor: placeholderBg, borderRadius: 4, marginTop: spacing.xs },
            animatedStyle,
          ]}
        />

        {/* Amenities chips skeleton */}
        <View style={[styles.chipsRow, { marginTop: spacing.md }]}>
          <Animated.View
            style={[
              styles.chipSkeleton,
              { backgroundColor: placeholderBg, borderRadius: radius.pill },
              animatedStyle,
            ]}
          />
          <Animated.View
            style={[
              styles.chipSkeleton,
              { backgroundColor: placeholderBg, borderRadius: radius.pill },
              animatedStyle,
            ]}
          />
          <Animated.View
            style={[
              styles.chipSkeleton,
              { backgroundColor: placeholderBg, borderRadius: radius.pill },
              animatedStyle,
            ]}
          />
        </View>

        {/* Price skeleton */}
        <View style={[styles.priceRow, { marginTop: spacing.md }]}>
          <Animated.View
            style={[
              styles.priceOldSkeleton,
              { backgroundColor: placeholderBg, borderRadius: 4 },
              animatedStyle,
            ]}
          />
          <Animated.View
            style={[
              styles.priceCurrentSkeleton,
              { backgroundColor: placeholderBg, borderRadius: 6 },
              animatedStyle,
            ]}
          />
        </View>
      </View>
    </View>
  );
}

export function HotelListSkeleton() {
  return (
    <View style={styles.list}>
      <HotelCardSkeleton />
      <HotelCardSkeleton />
      <HotelCardSkeleton />
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageSkeleton: {
    width: '100%',
    height: 200,
  },
  content: {},
  titleSkeleton: {
    width: '75%',
    height: 20,
  },
  addressSkeleton: {
    width: '50%',
    height: 14,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chipSkeleton: {
    width: 65,
    height: 24,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  priceOldSkeleton: {
    width: 50,
    height: 16,
  },
  priceCurrentSkeleton: {
    width: 90,
    height: 24,
  },
});

