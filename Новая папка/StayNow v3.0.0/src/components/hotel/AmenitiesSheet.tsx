import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Car,
  Check,
  CircleCheck,
  Coffee,
  ConciergeBell,
  Dumbbell,
  PawPrint,
  Plane,
  Sparkles,
  Utensils,
  Waves,
  Wifi,
  Wind,
  Wine,
  X,
} from 'lucide-react-native';
import { Divider, IconButton } from '@/components/ui';
import { AMENITIES } from '@/constants/amenities';
import { AmenityKey } from '@/types/hotel';
import { colors, radius, spacing, typography } from '@/theme';

interface AmenitiesSheetProps {
  visible: boolean;
  onClose: () => void;
  amenities: AmenityKey[];
  hotelName: string;
}

export const getAmenityIcon = (
  key: AmenityKey,
  size: number = 20,
  color: string = colors.primary
) => {
  switch (key) {
    case 'wifi':
      return <Wifi size={size} color={color} />;
    case 'breakfast':
      return <Coffee size={size} color={color} />;
    case 'parking':
      return <Car size={size} color={color} />;
    case 'gym':
      return <Dumbbell size={size} color={color} />;
    case 'pool':
      return <Waves size={size} color={color} />;
    case 'spa':
      return <Sparkles size={size} color={color} />;
    case 'ac':
      return <Wind size={size} color={color} />;
    case 'restaurant':
      return <Utensils size={size} color={color} />;
    case 'reception24':
      return <ConciergeBell size={size} color={color} />;
    case 'bar':
      return <Wine size={size} color={color} />;
    case 'airportShuttle':
      return <Plane size={size} color={color} />;
    case 'petFriendly':
      return <PawPrint size={size} color={color} />;
    default:
      return <Check size={size} color={color} />;
  }
};

export const AmenitiesSheet: React.FC<AmenitiesSheetProps> = ({
  visible,
  onClose,
  amenities,
  hotelName,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View
          style={[
            styles.sheetContainer,
            { paddingBottom: Math.max(insets.bottom, spacing.lg) },
          ]}
        >
          {/* Handle bar */}
          <View style={styles.handleContainer}>
            <View style={styles.handleBar} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.title}>Olanaqlar və Xidmətlər</Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {hotelName}
              </Text>
            </View>
            <IconButton
              icon={<X size={20} color={colors.text} />}
              variant="ghost"
              size={36}
              onPress={onClose}
              accessibilityLabel="Bağla"
            />
          </View>

          <Divider marginVertical="sm" />

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionNotice}>
              Bu oteldə qonaqlar üçün təqdim edilən bütün imkanlar və xidmətlər
            </Text>

            <View style={styles.grid}>
              {amenities.map((key) => {
                const def = AMENITIES[key];
                const label = def?.label ?? key;
                return (
                  <View key={key} style={styles.amenityCard}>
                    <View style={styles.iconCircle}>
                      {getAmenityIcon(key, 22, colors.primary)}
                    </View>
                    <View style={styles.labelContainer}>
                      <Text style={styles.amenityLabel}>{label}</Text>
                      <Text style={styles.amenityStatus}>Daxildir</Text>
                    </View>
                    <CircleCheck size={18} color={colors.savings} />
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheetContainer: {
    backgroundColor: colors.surfaceAlt,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
  headerTitleContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  sectionNotice: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  grid: {
    gap: spacing.sm,
  },
  amenityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    flex: 1,
  },
  amenityLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text,
  },
  amenityStatus: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
