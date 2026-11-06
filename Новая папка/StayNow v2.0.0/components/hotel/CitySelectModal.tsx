import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { ModalSheet } from '@/components/common/ModalSheet';
import { useTheme } from '@/hooks/useTheme';
import { useSearchStore } from '@/store/searchStore';
import { getCities, CityItem } from '@/services/hotelService';

export interface CitySelectModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CitySelectModal: React.FC<CitySelectModalProps> = ({
  visible,
  onClose,
}) => {
  const { colors, typography, radius } = useTheme();
  const { city, setCity } = useSearchStore();

  const { data: cities = [] } = useQuery<CityItem[]>({
    queryKey: ['cities'],
    queryFn: () => getCities(),
    staleTime: 1000 * 60 * 15, // 15 dəqiqə keşlə
  });

  const handleSelectCity = (cityName: string) => {
    setCity(cityName);
    onClose();
  };

  return (
    <ModalSheet
      visible={visible}
      onClose={onClose}
      title="Şəhər seçin"
      subtitle="Rezervasiya etmək istədiyiniz məkanı seçin"
    >
      <View style={styles.list}>
        {cities.map((c) => {
          const isSelected = city.toLowerCase() === c.name.toLowerCase();
          const hotelCountLabel = `${c.hotelCount} otel`;

          return (
            <Pressable
              key={c.name}
              onPress={() => handleSelectCity(c.name)}
              style={({ pressed }) => [
                styles.cityItem,
                {
                  backgroundColor: isSelected
                    ? colors.primaryTint
                    : pressed
                    ? colors.surfaceAlt
                    : 'transparent',
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderRadius: radius.card,
                },
              ]}
            >
              <View
                style={[
                  styles.cityIconBox,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surfaceAlt,
                  },
                ]}
              >
                <Ionicons
                  name="location"
                  size={20}
                  color={isSelected ? '#FFFFFF' : colors.primary}
                />
              </View>

              <View style={styles.cityTextContainer}>
                <View style={styles.cityNameRow}>
                  <Text
                    style={[
                      typography.heading,
                      { color: isSelected ? colors.primary : colors.text, fontSize: 16 },
                    ]}
                  >
                    {c.name}
                  </Text>
                  <Text style={[typography.micro, { color: colors.textSecondary }]}>
                    {hotelCountLabel}
                  </Text>
                </View>
                {c.description ? (
                  <Text
                    style={[
                      typography.caption,
                      { color: colors.textSecondary, marginTop: 2 },
                    ]}
                    numberOfLines={1}
                  >
                    {c.description}
                  </Text>
                ) : null}
              </View>

              {isSelected && (
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={colors.primary}
                  style={styles.checkIcon}
                />
              )}
            </Pressable>
          );
        })}
      </View>
    </ModalSheet>
  );
};

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1.5,
  },
  cityIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cityTextContainer: {
    flex: 1,
  },
  cityNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  checkIcon: {
    marginLeft: 8,
  },
});

export default CitySelectModal;
