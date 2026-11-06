import React from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, X } from 'lucide-react-native';
import { Divider, IconButton } from '@/components/ui';
import { useFilterStore } from '@/store';
import { SortOption } from '@/types/hotel';
import { colors, radius, spacing, typography } from '@/theme';

export interface SortBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectSort?: (sort: SortOption) => void;
}

interface SortItem {
  key: SortOption;
  label: string;
}

export const SORT_OPTIONS: SortItem[] = [
  { key: 'recommended', label: 'Tövsiyə olunan' },
  { key: 'price_low', label: 'Qiymət (ucuzdan bahaya)' },
  { key: 'price_high', label: 'Qiymət (bahadan ucuza)' },
  { key: 'rating', label: 'Ən yüksək reytinq' },
  { key: 'distance', label: 'Mərkəzə yaxın' },
  { key: 'discount', label: 'Ən böyük endirim' },
];

export const SortBottomSheet: React.FC<SortBottomSheetProps> = ({
  visible,
  onClose,
  onSelectSort,
}) => {
  const insets = useSafeAreaInsets();
  const { sortBy, setSortBy } = useFilterStore();

  const handleSelect = (key: SortOption) => {
    setSortBy(key);
    onSelectSort?.(key);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTouchable} onPress={onClose} />

        <View
          style={[
            styles.sheetContainer,
            { paddingBottom: insets.bottom + spacing.lg },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Çeşidləmə</Text>
            <IconButton
              icon={<X size={20} color={colors.text} />}
              variant="ghost"
              size={36}
              onPress={onClose}
            />
          </View>

          <Divider marginVertical="sm" />

          {/* Options */}
          <View style={styles.optionsList}>
            {SORT_OPTIONS.map((item) => {
              const isSelected = sortBy === item.key;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => handleSelect(item.key)}
                  style={({ pressed }) => [
                    styles.optionRow,
                    pressed && styles.optionRowPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionLabel,
                      isSelected && styles.optionLabelSelected,
                    ]}
                  >
                    {item.label}
                  </Text>

                  {/* Custom Radio Circle */}
                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && styles.radioCircleSelected,
                    ]}
                  >
                    {isSelected && (
                      <View style={styles.radioInnerCircle} />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  backdropTouchable: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: colors.surfaceAlt,
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  optionsList: {
    paddingHorizontal: spacing.lg,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  optionRowPressed: {
    opacity: 0.7,
  },
  optionLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  optionLabelSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioInnerCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
});

