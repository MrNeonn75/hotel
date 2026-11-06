import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/hooks/useTheme';
import { HT_CATEGORIES, HTCategoryType } from '@/constants/theme';

export interface HTCategoryFilterProps {
  selectedCategory: string | null; // null or 'ALL' or specific category
  onSelectCategory: (category: string | null) => void;
}

export const HTCategoryFilter: React.FC<HTCategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const { colors, typography, radius } = useTheme();

  const categories: { key: string; label: string; icon: any }[] = [
    { key: 'ALL', label: 'Hamısı', icon: 'grid-outline' },
    { key: 'LUXE', label: 'Luxe', icon: 'diamond-outline' },
    { key: 'HIP', label: 'Hip', icon: 'sparkles-outline' },
    { key: 'SOLID', label: 'Solid', icon: 'shield-checkmark-outline' },
    { key: 'CHARMING', label: 'Charming', icon: 'rose-outline' },
    { key: 'BASIC', label: 'Basic', icon: 'bed-outline' },
    { key: 'CRASHPAD', label: 'Crashpad', icon: 'moon-outline' },
  ];

  const handleSelect = (key: string) => {
    Haptics.selectionAsync();
    onSelectCategory(key === 'ALL' ? null : key);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((cat) => {
          const isSelected =
            cat.key === 'ALL'
              ? !selectedCategory || selectedCategory === 'ALL'
              : selectedCategory === cat.key;

          const meta = HT_CATEGORIES[cat.key as HTCategoryType];

          return (
            <Pressable
              key={cat.key}
              onPress={() => handleSelect(cat.key)}
              style={({ pressed }) => [
                styles.categoryPill,
                {
                  backgroundColor: isSelected
                    ? colors.primary
                    : colors.surfaceAlt,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderRadius: radius.pill,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                },
              ]}
            >
              <Ionicons
                name={cat.icon}
                size={14}
                color={isSelected ? '#FFFFFF' : colors.textSecondary}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  typography.caption,
                  {
                    color: isSelected ? '#FFFFFF' : colors.text,
                    fontWeight: isSelected ? '700' : '600',
                    fontSize: 13,
                  },
                ]}
              >
                {cat.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
});

