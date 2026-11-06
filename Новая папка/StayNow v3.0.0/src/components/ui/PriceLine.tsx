import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

export interface PriceLineProps {
  price: number | string;
  originalPrice?: number | string;
  currency?: string;
  period?: string;
  subtitle?: string;
  discountBadge?: string;
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
  priceStyle?: StyleProp<TextStyle>;
}

export const PriceLine: React.FC<PriceLineProps> = ({
  price,
  originalPrice,
  currency = '₼',
  period = '/ gecə',
  subtitle,
  discountBadge,
  size = 'md',
  align = 'left',
  style,
  priceStyle,
}) => {
  const isRight = align === 'right';

  return (
    <View style={[styles.container, isRight && styles.alignRight, style]}>
      {/* Top row with original price and discount badge if present */}
      {(originalPrice || discountBadge) && (
        <View style={[styles.topRow, isRight && styles.topRowRight]}>
          {originalPrice && (
            <Text style={styles.originalPrice}>
              {currency} {originalPrice}
            </Text>
          )}
          {discountBadge && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discountBadge}</Text>
            </View>
          )}
        </View>
      )}

      {/* Main price line */}
      <View style={[styles.priceRow, isRight && styles.priceRowRight]}>
        <Text style={[styles.currency, styles[`currency_${size}` as keyof typeof styles]]}>
          {currency}
        </Text>
        <Text
          style={[
            styles.price,
            styles[`price_${size}` as keyof typeof styles],
            priceStyle,
          ]}
        >
          {price}
        </Text>
        {period && (
          <Text style={[styles.period, styles[`period_${size}` as keyof typeof styles]]}>
            {' '}{period}
          </Text>
        )}
      </View>

      {/* Subtitle (e.g. vergilər daxil) */}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    gap: spacing.xs,
  },
  topRowRight: {
    justifyContent: 'flex-end',
  },
  originalPrice: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: colors.savingsTint,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 1,
    borderRadius: radius.xs,
  },
  discountText: {
    fontSize: typography.fontSize.xs,
    color: colors.savings,
    fontWeight: typography.fontWeight.bold,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceRowRight: {
    justifyContent: 'flex-end',
  },
  currency: {
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginRight: 2,
  },
  currency_sm: {
    fontSize: typography.fontSize.sm,
  },
  currency_md: {
    fontSize: typography.fontSize.base,
  },
  currency_lg: {
    fontSize: typography.fontSize.xl,
  },
  price: {
    fontWeight: typography.fontWeight.extraBold,
    color: colors.text,
  },
  price_sm: {
    fontSize: typography.fontSize.base,
  },
  price_md: {
    fontSize: typography.fontSize['2xl'],
  },
  price_lg: {
    fontSize: typography.fontSize['3xl'],
  },
  period: {
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.regular,
  },
  period_sm: {
    fontSize: typography.fontSize.xs,
  },
  period_md: {
    fontSize: typography.fontSize.sm,
  },
  period_lg: {
    fontSize: typography.fontSize.base,
  },
  subtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

