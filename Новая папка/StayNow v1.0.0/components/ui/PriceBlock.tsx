import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface PriceBlockProps {
  price: number;
  originalPrice?: number;
  currency?: string;
  suffix?: string;
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'right';
  style?: StyleProp<ViewStyle>;
}

export const PriceBlock: React.FC<PriceBlockProps> = ({
  price,
  originalPrice,
  currency = '₼',
  suffix = 'gecə',
  size = 'md',
  align = 'left',
  style,
}) => {
  const { colors, typography } = useTheme();

  const isLg = size === 'lg';
  const isSm = size === 'sm';

  const priceFontSize = isLg ? 26 : isSm ? 18 : 22;

  const hasDiscount = originalPrice && originalPrice > price;

  return (
    <View
      style={[
        styles.container,
        align === 'right' && { alignItems: 'flex-end' },
        style,
      ]}
    >
      <View style={styles.priceRow}>
        {hasDiscount && (
          <Text
            style={[
              typography.caption,
              styles.strikethrough,
              { color: colors.textSecondary, marginRight: 6 },
            ]}
          >
            {originalPrice} {currency}
          </Text>
        )}
        <Text
          style={[
            typography.display,
            {
              fontSize: priceFontSize,
              lineHeight: priceFontSize + 4,
              color: hasDiscount ? colors.urgency : colors.text,
            },
          ]}
        >
          {price} {currency}
        </Text>
        {suffix && (
          <Text
            style={[
              typography.caption,
              {
                color: colors.textSecondary,
                marginLeft: 4,
                alignSelf: 'flex-end',
                marginBottom: 2,
              },
            ]}
          >
            /{suffix}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
});

export default PriceBlock;