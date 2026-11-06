import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
  Platform,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
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

  const region = {
    latitude: hotel.latitude,
    longitude: hotel.longitude,
    latitudeDelta: 0.008,
    longitudeDelta: 0.008,
  };

  return (
    <View style={styles.container}>
      {/* Mini Xəritə */}
      <Pressable
        onPress={handleOpenMapTab}
        style={[
          styles.mapWrapper,
          {
            borderRadius: radius.card,
            borderColor: colors.border,
          },
        ]}
      >
        {Platform.OS === 'web' ? (
          <View style={[styles.webMapFallback, { backgroundColor: colors.surfaceAlt }]}>
            <Ionicons name="map" size={36} color={colors.primary} />
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 6 }]}>
              Xəritəyə baxmaq üçün toxunun
            </Text>
          </View>
        ) : (
          <MapView
            style={styles.map}
            initialRegion={region}
            scrollEnabled={false}
            zoomEnabled={false}
            rotateEnabled={false}
            pitchEnabled={false}
          >
            <Marker
              coordinate={{
                latitude: hotel.latitude,
                longitude: hotel.longitude,
              }}
              title={hotel.name}
            >
              <View style={[styles.markerPin, { backgroundColor: colors.primary }]}>
                <Ionicons name="bed" size={14} color="#FFFFFF" />
              </View>
            </Marker>
          </MapView>
        )}

        {/* Xəritə üzərində "Böyütmək üçün toxunun" overlay çipi */}
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
  },
  map: {
    width: '100%',
    height: '100%',
  },
  webMapFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
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