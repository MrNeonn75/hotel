import React, { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Minus, Plus, X } from 'lucide-react-native';
import { Button, Card, Divider, IconButton } from '@/components/ui';
import { useSearchStore } from '@/store';
import { colors, radius, spacing, typography } from '@/theme';

export interface GuestsRoomsPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm?: (guests: { adults: number; children: number; rooms: number }) => void;
}

export const GuestsRoomsPickerSheet: React.FC<GuestsRoomsPickerSheetProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  const insets = useSafeAreaInsets();
  const { guests, setGuests } = useSearchStore();

  const [adults, setAdults] = useState(guests.adults);
  const [children, setChildren] = useState(guests.children);
  const [rooms, setRooms] = useState(guests.rooms);

  const handleConfirm = () => {
    const newGuests = { adults, children, rooms };
    setGuests(newGuests);
    onConfirm?.(newGuests);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Qonaqlar və otaqlar</Text>
          <IconButton
            icon={<X size={22} color={colors.text} />}
            variant="ghost"
            size={40}
            onPress={onClose}
          />
        </View>

        <View style={styles.content}>
          <Card style={styles.card}>
            {/* Adults Stepper */}
            <StepperRow
              title="Böyüklər"
              subtitle="18 yaş və yuxarı"
              value={adults}
              minValue={1}
              maxValue={10}
              onDecrement={() => setAdults((prev) => Math.max(1, prev - 1))}
              onIncrement={() => setAdults((prev) => Math.min(10, prev + 1))}
            />

            <Divider marginVertical="md" />

            {/* Children Stepper */}
            <StepperRow
              title="Uşaqlar"
              subtitle="0 — 17 yaş"
              value={children}
              minValue={0}
              maxValue={6}
              onDecrement={() => setChildren((prev) => Math.max(0, prev - 1))}
              onIncrement={() => setChildren((prev) => Math.min(6, prev + 1))}
            />

            <Divider marginVertical="md" />

            {/* Rooms Stepper */}
            <StepperRow
              title="Otaq sayı"
              subtitle="Rezervasiya olunacaq otaqlar"
              value={rooms}
              minValue={1}
              maxValue={5}
              onDecrement={() => setRooms((prev) => Math.max(1, prev - 1))}
              onIncrement={() => setRooms((prev) => Math.min(5, prev + 1))}
            />
          </Card>
        </View>

        {/* Bottom Confirm Button */}
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: insets.bottom + spacing.md },
          ]}
        >
          <Button
            title={`Təsdiq (${adults + children} qonaq, ${rooms} otaq)`}
            variant="primary"
            onPress={handleConfirm}
          />
        </View>
      </View>
    </Modal>
  );
};

interface StepperRowProps {
  title: string;
  subtitle: string;
  value: number;
  minValue: number;
  maxValue: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

const StepperRow: React.FC<StepperRowProps> = ({
  title,
  subtitle,
  value,
  minValue,
  maxValue,
  onIncrement,
  onDecrement,
}) => {
  const isMin = value <= minValue;
  const isMax = value >= maxValue;

  return (
    <View style={styles.stepperRow}>
      <View style={styles.stepperTextContainer}>
        <Text style={styles.stepperTitle}>{title}</Text>
        <Text style={styles.stepperSubtitle}>{subtitle}</Text>
      </View>

      <View style={styles.controlsRow}>
        <Pressable
          onPress={onDecrement}
          disabled={isMin}
          style={[styles.stepperBtn, isMin && styles.stepperBtnDisabled]}
        >
          <Minus
            size={18}
            color={isMin ? colors.disabledText : colors.text}
          />
        </Pressable>

        <Text style={styles.stepperValue}>{value}</Text>

        <Pressable
          onPress={onIncrement}
          disabled={isMax}
          style={[styles.stepperBtn, isMax && styles.stepperBtnDisabled]}
        >
          <Plus
            size={18}
            color={isMax ? colors.disabledText : colors.text}
          />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  card: {
    padding: spacing.xl,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  stepperTextContainer: {
    flex: 1,
  },
  stepperTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  stepperSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepperBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnDisabled: {
    opacity: 0.35,
    borderColor: colors.disabled,
  },
  stepperValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    width: 24,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

