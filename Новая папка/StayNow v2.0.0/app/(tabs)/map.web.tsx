import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';

import { useTheme } from '@/hooks/useTheme';
import { getHotels } from '@/services/hotelService';
import { Hotel } from '@/types/hotel';
import { SelectedHotelCard } from '@/components/map/SelectedHotelCard';
import { HotelPriceMarker } from '@/components/map/HotelPriceMarker';

export default function MapWebScreen() {
  const router = useRouter();
  const { colors, typography, radius } = useTheme();
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  const { data: hotels = [] } = useQuery<Hotel[]>({
    queryKey: ['hotels'],
    queryFn: () => getHotels(),
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[typography.title, { color: colors.text }]}>Otellər Xəritəsi</Text>
        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4 }]}>
          Xəritə görünüşü mobil tətbiqdə (Android / iOS) tam interaktiv işləyir.
        </Text>
      </View>

      <FlatList
        data={hotels}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setSelectedHotel(item)}
            style={{ marginBottom: 12 }}
          >
            <SelectedHotelCard
              hotel={item}
              onClose={() => setSelectedHotel(null)}
            />
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  list: {
    padding: 16,
  },
});