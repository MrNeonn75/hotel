import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from '@/components/ui/Skeleton';
import { useTheme } from '@/hooks/useTheme';

export const HotelCardSkeleton: React.FC = () => {
  const { radius, spacing } = useTheme();

  return (
    <View style={[styles.card, { marginBottom: 28 }]}>
      {/* Image Skeleton */}
      <Skeleton
        width="100%"
        height={230}
        borderRadius={radius.image}
        style={{ marginBottom: spacing.md }}
      />

      {/* Row 1: Title and Price */}
      <View style={styles.contentRow}>
        <View style={styles.leftCol}>
          <Skeleton width="75%" height={22} borderRadius={6} style={{ marginBottom: 6 }} />
          <Skeleton width="45%" height={14} borderRadius={4} style={{ marginBottom: 8 }} />
          <View style={styles.ratingRow}>
            <Skeleton width={38} height={22} borderRadius={6} style={{ marginRight: 8 }} />
            <Skeleton width={110} height={14} borderRadius={4} />
          </View>
        </View>

        <View style={styles.rightCol}>
          <Skeleton width={60} height={14} borderRadius={4} style={{ marginBottom: 4 }} />
          <Skeleton width={80} height={24} borderRadius={6} style={{ marginBottom: 4 }} />
          <Skeleton width={50} height={12} borderRadius={4} />
        </View>
      </View>

      {/* Amenities row */}
      <View style={[styles.amenitiesRow, { marginTop: spacing.md }]}>
        <Skeleton width={65} height={16} borderRadius={4} style={{ marginRight: 10 }} />
        <Skeleton width={75} height={16} borderRadius={4} style={{ marginRight: 10 }} />
        <Skeleton width={60} height={16} borderRadius={4} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 16,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftCol: {
    flex: 1,
    paddingRight: 12,
  },
  rightCol: {
    alignItems: 'flex-end',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amenitiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default HotelCardSkeleton;