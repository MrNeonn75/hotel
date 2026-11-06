import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Star, ThumbsUp } from 'lucide-react-native';
import {
  Badge,
  Card,
  Chip,
  Divider,
  EmptyState,
  ScreenHeader,
  Skeleton,
} from '@/components/ui';
import { useHotelQuery, useHotelReviewsQuery } from '@/services/queries';
import { colors, radius, spacing, typography } from '@/theme';

export default function HotelReviewsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const hotelId = Array.isArray(id) ? id[0] : id ?? 'bulevard-house';

  const { data: hotel } = useHotelQuery(hotelId);
  const { data: reviews, isLoading } = useHotelReviewsQuery(hotelId);

  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | null>(null);

  const filteredReviews = useMemo(() => {
    if (!reviews) return [];
    if (selectedRatingFilter === null) return reviews;
    return reviews.filter((r) => Math.floor(r.rating) === selectedRatingFilter);
  }, [reviews, selectedRatingFilter]);

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title="Qonaq Rəyləri" onBack={() => router.back()} />
        <View style={styles.content}>
          <Skeleton width="100%" height={160} borderRadius={radius.lg} />
          <Skeleton width="100%" height={120} borderRadius={radius.lg} style={{ marginTop: spacing.md }} />
          <Skeleton width="100%" height={120} borderRadius={radius.lg} style={{ marginTop: spacing.md }} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader
          title="Qonaq Rəyləri"
          subtitle={hotel?.name}
          onBack={() => router.back()}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Math.max(insets.bottom, 24) + spacing.xl },
        ]}
      >
        {/* Rating Hero Card */}
        <Card style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroScoreCol}>
              <View style={styles.scoreRow}>
                <Text style={styles.heroScoreText}>{hotel?.rating ?? '4.8'}</Text>
                <Star size={24} color={colors.star} fill={colors.star} />
              </View>
              <Text style={styles.heroRatingLabel}>Əla təcrübə</Text>
            </View>

            <View style={styles.heroDivider} />

            <View style={styles.heroMetaCol}>
              <Text style={styles.totalReviewsNumber}>
                {hotel?.reviewCount ?? reviews?.length ?? 0}
              </Text>
              <Text style={styles.totalReviewsSub}>
                Təsdiqlənmiş qonaq rəyi əsasında
              </Text>
            </View>
          </View>

          <Divider marginVertical="md" />

          {/* Sub-ratings breakdown */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Təmizlik</Text>
              <Text style={styles.metricValue}>9.6</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Xidmət</Text>
              <Text style={styles.metricValue}>9.4</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Məkan</Text>
              <Text style={styles.metricValue}>9.8</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Rahatlıq</Text>
              <Text style={styles.metricValue}>9.5</Text>
            </View>
          </View>
        </Card>

        {/* Rating Filters */}
        <View style={styles.filterRow}>
          <Chip
            label="Hamısı"
            selected={selectedRatingFilter === null}
            onPress={() => setSelectedRatingFilter(null)}
          />
          <Chip
            label="5 ★"
            selected={selectedRatingFilter === 5}
            onPress={() => setSelectedRatingFilter(selectedRatingFilter === 5 ? null : 5)}
          />
          <Chip
            label="4 ★"
            selected={selectedRatingFilter === 4}
            onPress={() => setSelectedRatingFilter(selectedRatingFilter === 4 ? null : 4)}
          />
          <Chip
            label="3 ★"
            selected={selectedRatingFilter === 3}
            onPress={() => setSelectedRatingFilter(selectedRatingFilter === 3 ? null : 3)}
          />
        </View>

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <EmptyState
            title="Rəy tapılmadı"
            description="Seçilmiş reytinq filtrinə uyğun qonaq rəyi yoxdur."
            actionTitle="Filtrləri sıfırla"
            onActionPress={() => setSelectedRatingFilter(null)}
          />
        ) : (
          <View style={styles.reviewsList}>
            {filteredReviews.map((rev) => {
              const initials = rev.userName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();

              return (
                <Card key={rev.id} style={styles.reviewCard}>
                  {/* Review Header */}
                  <View style={styles.reviewHeader}>
                    <View style={styles.userRow}>
                      <View style={styles.avatarCircle}>
                        <Text style={styles.avatarInitials}>{initials}</Text>
                      </View>
                      <View>
                        <Text style={styles.userName}>{rev.userName}</Text>
                        <Text style={styles.userMeta}>
                          {rev.userCountry} · {rev.date}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.ratingBadge}>
                      <Star size={12} color={colors.star} fill={colors.star} />
                      <Text style={styles.ratingBadgeText}>{rev.rating}</Text>
                    </View>
                  </View>

                  {/* Room type tag if present */}
                  {rev.roomType && (
                    <View style={styles.roomTypeTag}>
                      <Text style={styles.roomTypeText}>{rev.roomType}</Text>
                    </View>
                  )}

                  {/* Comment */}
                  <Text style={styles.commentText}>{rev.comment}</Text>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  heroCard: {
    padding: spacing.lg,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroScoreCol: {
    flex: 1,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  heroScoreText: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  heroRatingLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    marginTop: 2,
  },
  heroDivider: {
    width: 1,
    height: 48,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
  },
  heroMetaCol: {
    flex: 1,
  },
  totalReviewsNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  totalReviewsSub: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  reviewsList: {
    gap: spacing.md,
  },
  reviewCard: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarInitials: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  userName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
  },
  userMeta: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ratingBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  roomTypeTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.xs,
  },
  roomTypeText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  commentText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
});
