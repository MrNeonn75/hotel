import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { Hotel } from '@/types/hotel';

export interface HotelMiniMapProps {
  hotel: Hotel;
}

export const HotelMiniMap: React.FC<HotelMiniMapProps> = ({ hotel }) => {
  const router = useRouter();
  const { colors, typography, radius } = useTheme();

  const handleOpenDirections = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${hotel.latitude},${hotel.longitude}`;
    Linking.openURL(url);
  };

  const handleOpenMapTab = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/(tabs)/map',
      params: { hotelId: hotel.id },
    } as any);
  };

  return (
    <View style={styles.container}>
      {/* Web Map Card */}
      <Pressable
        onPress={handleOpenMapTab}
        style={[
          styles.mapWrapper,
          {
            borderRadius: radius.card,
            borderColor: colors.border,
            backgroundColor: colors.surfaceAlt,
          },
        ]}
      >
        <View style={styles.content}>
          <View style={[styles.pinBox, { backgroundColor: colors.primary }]}>
            <Ionicons name="location" size={24} color="#FFFFFF" />
          </View>
          <Text style={[typography.heading, { color: colors.text, marginTop: 8 }]}>
            {hotel.neighborhood}, {hotel.city}
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
            Xəritədə baxmaq üçün toxunun
          </Text>
        </View>

        <View style={styles.mapTapOverlay}>
          <Ionicons name="expand" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.mapTapText}>Böyük xəritədə bax</Text>
        </View>
      </Pressable>

      {/* Yol tarifi və ünvan xətti */}
      <View style={styles.addressRow}>
        <View style={styles.addressTextContainer}>
          <Ionicons
            name="location-outline"
            size={18}
            color={colors.primary}
            style={{ marginRight: 6, marginTop: 2 }}
          />
          <Text style={[typography.caption, { color: colors.text, flex: 1 }]}>
            {hotel.address}
          </Text>
        </View>

        <Pressable
          onPress={handleOpenDirections}
          style={[
            styles.directionsBtn,
            {
              backgroundColor: colors.primaryTint,
              borderColor: colors.primary,
              borderRadius: radius.pill,
            },
          ]}
        >
          <Ionicons name="navigate" size={14} color={colors.primary} style={{ marginRight: 4 }} />
          <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
            Yol tarifi
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  mapWrapper: {
    height: 160,
    width: '100%',
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  mapTapOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  mapTapText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 8,
  },
  addressTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
});

export default HotelMiniMap;