import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

export interface RatingProps {
  score: number;
  reviewsCount?: number;
  showText?: boolean;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

export const Rating: React.FC<RatingProps> = ({
  score,
  reviewsCount,
  showText = false,
  size = 'md',
  style,
}) => {
  const { colors, typography, radius } = useTheme();

  const getRatingLabel = (val: number) => {
    if (val >= 9.5) return 'Müstəsna';
    if (val >= 9.0) return 'Mükəmməl';
    if (val >= 8.5) return 'Çox yaxşı';
    if (val >= 8.0) return 'Yaxşı';
    return 'Məqbul';
  };

  const isSm = size === 'sm';

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.pill,
          {
            backgroundColor: colors.star,
            borderRadius: radius.pill,
            paddingVertical: isSm ? 2 : 3,
            paddingHorizontal: isSm ? 6 : 8,
          },
        ]}
      >
        <Ionicons name="star" size={isSm ? 10 : 12} color="#FFFFFF" style={styles.starIcon} />
        <Text style={[styles.scoreText, { fontSize: isSm ? 11 : 12 }]}>
          {score.toFixed(1)}
        </Text>
      </View>
      {showText && (
        <View style={styles.labelContainer}>
          <Text style={[typography.caption, { color: colors.text, fontWeight: '700' }]}>
            {getRatingLabel(score)}
          </Text>
          {typeof reviewsCount === 'number' && (
            <Text style={[typography.micro, { color: colors.textSecondary }]}>
              {' '}({reviewsCount})
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: 3,
  },
  scoreText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
  },
});

export default Rating;