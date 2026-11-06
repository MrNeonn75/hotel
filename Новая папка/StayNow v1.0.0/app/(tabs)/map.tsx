import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';

import { useTheme } from '@/hooks/useTheme';
import { getHotels } from '@/services/hotelService';
import { Hotel } from '@/types/hotel';
import { darkMapStyle, lightMapStyle } from '@/constants/mapStyle';

import { HotelPriceMarker } from '@/components/map/HotelPriceMarker';
import { SelectedHotelCard } from '@/components/map/SelectedHotelCard';

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { colors, typography, radius, shadows, isDark } = useTheme();
  const params = useLocalSearchParams<{ hotelId?: string }>();

  const mapRef = useRef<MapView>(null);

  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [dismissedBanner, setDismissedBanner] = useState(false);

  // Fetch hotels
  const { data: hotels = [] } = useQuery<Hotel[]>({
    queryKey: ['hotels'],
    queryFn: () => getHotels(),
  });

  // Check location permission on mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          setHasLocationPermission(true);
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setUserLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        } else {
          setHasLocationPermission(false);
        }
      } catch (err) {
        setHasLocationPermission(false);
      }
    })();
  }, []);

  // Request location permission
  const requestLocation = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setHasLocationPermission(true);
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const coords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setUserLocation(coords);
        mapRef.current?.animateToRegion(
          {
            ...coords,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          },
          800
        );
      } else {
        setHasLocationPermission(false);
      }
    } catch (err) {
      setHasLocationPermission(false);
    }
  };

  // Center on user location
  const handleMyLocationPress = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!hasLocationPermission) {
      await requestLocation();
      return;
    }

    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setUserLocation(coords);
      mapRef.current?.animateToRegion(
        {
          ...coords,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        700
      );
    } catch {
      // fallback
    }
  };

  // Focus hotel from route params (e.g. from detail screen mini map)
  useEffect(() => {
    if (params.hotelId && hotels.length > 0) {
      const target = hotels.find((h) => h.id === params.hotelId);
      if (target) {
        setSelectedHotel(target);
        mapRef.current?.animateToRegion(
          {
            latitude: target.latitude - 0.003, // offset slightly to fit card below
            longitude: target.longitude,
            latitudeDelta: 0.012,
            longitudeDelta: 0.012,
          },
          800
        );
      }
    }
  }, [params.hotelId, hotels]);

  // Initial fit to all hotels if no route param
  const handleMapReady = () => {
    if (!params.hotelId && hotels.length > 0) {
      const coords = hotels.map((h) => ({
        latitude: h.latitude,
        longitude: h.longitude,
      }));
      mapRef.current?.fitToCoordinates(coords, {
        edgePadding: { top: 90, right: 50, bottom: 120, left: 50 },
        animated: true,
      });
    }
  };

  const handleMarkerPress = (hotel: Hotel) => {
    Haptics.selectionAsync();
    setSelectedHotel(hotel);

    // Pan slightly above center so bottom card doesn't obscure the marker
    mapRef.current?.animateToRegion(
      {
        latitude: hotel.latitude - 0.003,
        longitude: hotel.longitude,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      },
      400
    );
  };

  const handleMapPress = () => {
    if (selectedHotel) {
      setSelectedHotel(null);
    }
  };

  // Initial region (Baku center)
  const initialRegion = {
    latitude: 40.3725,
    longitude: 49.8532,
    latitudeDelta: 0.06,
    longitudeDelta: 0.06,
  };

  return (
    <View style={styles.container}>
      {/* ═══ GOOGLE MAP ═══ */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        customMapStyle={isDark ? darkMapStyle : lightMapStyle}
        showsUserLocation={Boolean(hasLocationPermission)}
        showsMyLocationButton={false}
        showsCompass={false}
        onMapReady={handleMapReady}
        onPress={handleMapPress}
      >
        {hotels.map((hotel) => {
          const isSelected = selectedHotel?.id === hotel.id;
          return (
            <Marker
              key={hotel.id}
              coordinate={{
                latitude: hotel.latitude,
                longitude: hotel.longitude,
              }}
              onPress={() => handleMarkerPress(hotel)}
              tracksViewChanges={false}
              zIndex={isSelected ? 99 : 1}
            >
              <HotelPriceMarker
                price={hotel.discountedPrice}
                isSelected={isSelected}
              />
            </Marker>
          );
        })}
      </MapView>

      {/* ═══ YER İCAZƏSİ BANNERİ ═══ */}
      {hasLocationPermission === false && !dismissedBanner && (
        <SafeAreaView edges={['top']} style={styles.topBannerWrapper}>
          <View
            style={[
              styles.permissionBanner,
              shadows.soft,
              {
                backgroundColor: isDark ? colors.surfaceAlt : '#FFFFFF',
                borderColor: colors.border,
                borderRadius: radius.card,
              },
            ]}
          >
            <Ionicons name="location-outline" size={20} color={colors.primary} />
            <Text
              style={[
                typography.caption,
                { color: colors.text, flex: 1, marginHorizontal: 8, fontWeight: '600' },
              ]}
              numberOfLines={1}
            >
              Məkan təyini üçün icazə verin
            </Text>

            <Pressable
              onPress={() => Linking.openSettings()}
              style={[styles.settingsBtn, { backgroundColor: colors.primaryTint }]}
            >
              <Text style={[typography.micro, { color: colors.primary, fontWeight: '700' }]}>
                Ayarlar
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setDismissedBanner(true)}
              hitSlop={8}
              style={{ marginLeft: 6 }}
            >
              <Ionicons name="close" size={16} color={colors.textSecondary} />
            </Pressable>
          </View>
        </SafeAreaView>
      )}

      {/* ═══ MƏNİM YERİM DÜYMƏSİ ═══ */}
      <Pressable
        onPress={handleMyLocationPress}
        style={({ pressed }) => [
          styles.myLocationBtn,
          shadows.card,
          {
            bottom: selectedHotel ? 160 : 24,
            backgroundColor: isDark ? colors.surfaceAlt : '#FFFFFF',
            borderColor: colors.border,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Ionicons name="locate" size={22} color={colors.primary} />
      </Pressable>

      {/* ═══ SEÇİLMİŞ OTEL KARTI (BOTTOM CARD) ═══ */}
      {selectedHotel && (
        <View style={styles.bottomCardContainer}>
          <SelectedHotelCard
            hotel={selectedHotel}
            onClose={() => setSelectedHotel(null)}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  topBannerWrapper: {
    position: 'absolute',
    top: 10,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  permissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  settingsBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  myLocationBtn: {
    position: 'absolute',
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    zIndex: 10,
  },
  bottomCardContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    zIndex: 20,
  },
});