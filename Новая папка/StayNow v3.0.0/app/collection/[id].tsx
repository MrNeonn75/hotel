import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import {
  Badge,
  EmptyState,
  IconButton,
  Skeleton,
} from '@/components/ui';
import { HotelOfferCard } from '@/components/hotel';
import {
  useCollectionQuery,
  useHotelsByCollectionQuery,
} from '@/services/queries';
import { colors, radius, spacing, typography } from '@/theme';

export default function CollectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const collectionId = Array.isArray(id) ? id[0] : id ?? 'col-sea-view';

  const { data: collection, isLoading: colLoading } =
    useCollectionQuery(collectionId);
  const { data: hotels, isLoading: hotelsLoading } =
    useHotelsByCollectionQuery(collectionId);

  const isLoading = colLoading || hotelsLoading;

  return (
    <View style={styles.container}>
      {/* 1. Hero Image Header (220px) */}
      <View style={styles.heroContainer}>
        {collection?.image && (
          <Image
            source={{ uri: collection.image }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={300}
          />
        )}

        {/* Reading scrim gradient */}
        <LinearGradient
          colors={[
            'rgba(15, 14, 23, 0.4)',
            'rgba(15, 14, 23, 0.7)',
            colors.background,
          ]}
          locations={[0, 0.55, 0.98]}
          style={StyleSheet.absoluteFill}
        />

        {/* Floating Back Button */}
        <View style={[styles.backBtnWrapper, { top: insets.top + spacing.sm }]}>
          <IconButton
            icon={<ArrowLeft size={22} color={colors.white} />}
            variant="surface"
            size={40}
            onPress={() => router.back()}
          />
        </View>

        {/* Title and subtitle in hero bottom */}
        <View style={styles.heroBottomContent}>
          {collection && (
            <Badge
              label={`${collection.hotelCount} Otel`}
              variant="primary"
              size="sm"
              style={styles.heroBadge}
            />
          )}
          <Text style={styles.heroTitle}>
            {collection?.title ?? 'Kolleksiya'}
          </Text>
          {collection?.subtitle && (
            <Text style={styles.heroSubtitle}>{collection.subtitle}</Text>
          )}
        </View>
      </View>

      {/* 2. Hotel List */}
      {isLoading ? (
        <View style={styles.skeletonList}>
          <Skeleton height={260} borderRadius={radius.xl} />
          <Skeleton height={260} borderRadius={radius.xl} />
        </View>
      ) : !hotels || hotels.length === 0 ? (
        <EmptyState
          title="Kolleksiyada otel yoxdur"
          description="Bu kolleksiyaya aid otellər tezliklə əlavə olunacaq."
          actionTitle="Bütün otellərə bax"
          onActionPress={() => router.push('/search/results')}
        />
      ) : (
        <FlatList
          data={hotels}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <HotelOfferCard hotel={item} />}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroContainer: {
    height: 230,
    width: '100%',
    position: 'relative',
    justifyContent: 'flex-end',
  },
  backBtnWrapper: {
    position: 'absolute',
    left: spacing.lg,
    zIndex: 10,
  },
  heroBottomContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    zIndex: 5,
  },
  heroBadge: {
    marginBottom: spacing.xs,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: typography.fontWeight.extraBold,
    color: colors.white,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  skeletonList: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
});
