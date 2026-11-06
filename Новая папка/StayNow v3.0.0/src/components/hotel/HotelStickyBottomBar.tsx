import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Button } from '@/components/ui';
import { formatPrice } from '@/utils/format';
import { colors, radius, shadows, spacing, typography } from '@/theme';

interface HotelStickyBottomBarProps {
  visible: boolean;
  totalPrice: number;
  nightsCount: number;
  onBook: () => void;
  bottomInset?: number;
}

export const HotelStickyBottomBar: React.FC<HotelStickyBottomBarProps> = ({
  visible,
  totalPrice,
  nightsCount,
  onBook,
  bottomInset = 0,
}) => {
  const translateY = useSharedValue(120);

  useEffect(() => {
    translateY.value = withTiming(visible ? 0 : 120, { duration: 240 });
  }, [visible, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        styles.container,
        { paddingBottom: Math.max(bottomInset, spacing.md) },
        animatedStyle,
      ]}
    >
      <View style={styles.content}>
        <View style={styles.priceCol}>
          <Text style={styles.priceValue}>{formatPrice(totalPrice)}</Text>
          <Text style={styles.priceSub}>
            {nightsCount > 1 ? `${nightsCount} gecə üçün cəmi` : '1 gecəlik cəmi'}
          </Text>
        </View>

        <Button
          title="Rezerv et"
          variant="primary"
          fullWidth={false}
          onPress={onBook}
          style={styles.bookButton}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surfaceAlt,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    zIndex: 90,
    ...shadows.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceCol: {
    flex: 1,
    justifyContent: 'center',
  },
  priceValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  priceSub: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  bookButton: {
    paddingHorizontal: spacing.xl,
  },
});

