import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, CircleCheck, Coffee, Sparkles, User, Users } from 'lucide-react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import {
  Badge,
  Button,
  Card,
  Divider,
  EmptyState,
  PriceLine,
  ScreenHeader,
  Skeleton,
} from '@/components/ui';
import { useHotelQuery } from '@/services/queries';
import { useBookingsStore } from '@/store';
import { Room } from '@/types/hotel';
import { formatPrice } from '@/utils/format';
import { colors, radius, spacing, typography } from '@/theme';

export default function HotelRoomsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const hotelId = Array.isArray(id) ? id[0] : id ?? 'bulevard-house';

  const { data: hotel, isLoading } = useHotelQuery(hotelId);
  const { selectedRooms, setSelectedRoom } = useBookingsStore();

  const currentSelectedRoomId = selectedRooms[hotelId] ?? hotel?.rooms[0]?.id;

  const handleSelectRoom = (roomId: string) => {
    Haptics.selectionAsync();
    setSelectedRoom(hotelId, roomId);
    router.back();
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title="Otaqlar" onBack={() => router.back()} />
        <View style={styles.content}>
          <Skeleton width="100%" height={220} borderRadius={radius.lg} />
          <Skeleton width="100%" height={220} borderRadius={radius.lg} style={{ marginTop: spacing.md }} />
        </View>
      </View>
    );
  }

  if (!hotel) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader title="Otaqlar" onBack={() => router.back()} />
        <EmptyState
          title="Otel tapılmadı"
          description="Otaqları görmək üçün otel məlumatı mövcud deyil."
          actionTitle="Geri"
          onActionPress={() => router.back()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ paddingTop: insets.top }}>
        <ScreenHeader
          title="Otaqlar"
          subtitle={hotel.name}
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
        <Text style={styles.headerNotice}>
          Qalma müddətiniz üçün uyğun olan otaq tipini seçin
        </Text>

        <View style={styles.roomList}>
          {hotel.rooms.map((room) => {
            const isSelected = room.id === currentSelectedRoomId;

            return (
              <Card
                key={room.id}
                style={[
                  styles.roomCard,
                  isSelected && styles.roomCardSelected,
                ]}
              >
                {/* Room Photo */}
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: room.image }}
                    style={styles.roomImage}
                    contentFit="cover"
                    transition={150}
                  />
                  {isSelected && (
                    <View style={styles.selectedBadge}>
                      <CircleCheck size={14} color={colors.white} />
                      <Text style={styles.selectedBadgeText}>Seçilib</Text>
                    </View>
                  )}
                </View>

                {/* Details */}
                <View style={styles.detailsContainer}>
                  <Text style={styles.roomTitle}>{room.name}</Text>

                  {/* Meta Chips */}
                  <View style={styles.metaRow}>
                    <View style={styles.metaChip}>
                      <Users size={12} color={colors.primary} />
                      <Text style={styles.metaChipText}>{room.capacity} qonaq</Text>
                    </View>
                    <View style={styles.metaChip}>
                      <Text style={styles.metaChipText}>{room.bedType}</Text>
                    </View>
                  </View>

                  {/* Breakfast Policy */}
                  <View style={styles.policyRow}>
                    <Coffee size={13} color={colors.savings} />
                    <Text style={styles.policyText}>{room.breakfastPolicy}</Text>
                  </View>

                  {/* Features List */}
                  {room.features && room.features.length > 0 && (
                    <View style={styles.featuresRow}>
                      {room.features.map((feat, idx) => (
                        <View key={idx} style={styles.featureItem}>
                          <Check size={12} color={colors.primary} />
                          <Text style={styles.featureText}>{feat}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <Divider marginVertical="md" />

                  {/* Pricing and Action */}
                  <View style={styles.actionRow}>
                    <View>
                      <PriceLine
                        price={room.price}
                        originalPrice={room.originalPrice}
                        period="/ gecə"
                      />
                      <Text style={styles.taxSub}>Bütün vergilər daxildir</Text>
                    </View>

                    <Button
                      title={isSelected ? 'Seçilib' : 'Seç'}
                      variant={isSelected ? 'secondary' : 'primary'}
                      fullWidth={false}
                      disabled={isSelected}
                      onPress={() => handleSelectRoom(room.id)}
                      style={styles.selectButton}
                    />
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
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
  headerNotice: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  roomList: {
    gap: spacing.lg,
  },
  roomCard: {
    padding: 0,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  roomCardSelected: {
    borderColor: colors.brand,
  },
  imageContainer: {
    width: '100%',
    height: 175,
    position: 'relative',
    backgroundColor: colors.surfaceHighlight,
  },
  roomImage: {
    width: '100%',
    height: '100%',
  },
  selectedBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.brand,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  selectedBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  detailsContainer: {
    padding: spacing.lg,
  },
  roomTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  metaChip: {
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
  metaChipText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  policyText: {
    fontSize: typography.fontSize.xs,
    color: colors.savings,
    fontWeight: typography.fontWeight.medium,
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featureText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taxSub: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  selectButton: {
    paddingHorizontal: spacing.xl,
  },
});
