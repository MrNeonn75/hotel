import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/constants/theme';
import { hotelService } from '@/services/hotelService';
import { Hotel } from '@/types/hotel';
import { FullMapView } from '@/components/map/FullMapView';
import { SelectedHotelCard } from '@/components/map/SelectedHotelCard';

export default function MapScreen() {
  const { hotelId } = useLocalSearchParams<{ hotelId?: string }>();
  const insets = useSafeAreaInsets();
  const { colors, fonts, radius, isDark, shadows } = useTheme();

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  // User Location State
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObjectCoords | null>(null);

  const mapRef = useRef<any>(null);

  // Request location permission helper
  const requestLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setLocationPermission(granted);

      if (granted) {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLocation(currentLocation.coords);
        return currentLocation.coords;
      }
    } catch (e) {
      console.log('Location permission error', e);
      setLocationPermission(false);
    }
    return null;
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!isMounted) return;
        const granted = status === 'granted';
        setLocationPermission(granted);

        if (granted) {
          const currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          if (isMounted) {
            setUserLocation(currentLocation.coords);
          }
        }
      } catch (e) {
        console.log('Location permission error', e);
        if (isMounted) {
          setLocationPermission(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // Load hotels
  useEffect(() => {
    let isMounted = true;
    hotelService
      .getHotels()
      .then((data) => {
        if (isMounted) {
          setHotels(data);
          setLoading(false);

          // If navigated with hotelId parameter, select that hotel immediately
          if (hotelId) {
            const found = data.find((h) => h.id === hotelId);
            if (found) {
              setSelectedHotel(found);
            }
          }
        }
      })
      .catch((e) => {
        console.error('Failed to load hotels on map', e);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [hotelId]);

  // Animate to user location
  const handleCenterOnUser = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      let coords = userLocation;
      if (!coords) {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        coords = pos.coords;
        setUserLocation(coords);
      }

      if (coords && mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.012,
            longitudeDelta: 0.012,
          },
          600
        );
      }
    } catch {
      requestLocation();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading ? (
        <SafeAreaView style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary, fontFamily: fonts.medium }]}>
            Xəritə yüklənir...
          </Text>
        </SafeAreaView>
      ) : (
        <>
          {/* Full-screen Google Map */}
          <FullMapView
            mapRef={mapRef}
            hotels={hotels}
            selectedHotel={selectedHotel}
            onSelectHotel={setSelectedHotel}
            showsUserLocation={locationPermission === true}
            isDark={isDark}
            initialFocusHotelId={hotelId}
          />

          {/* Top Location Permission Banner (if denied) */}
          {locationPermission === false && (
            <SafeAreaView
              edges={['top']}
              style={[
                styles.permissionBanner,
                {
                  top: insets.top + 10,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.card,
                },
                shadows.soft,
              ]}>
              <View style={styles.bannerLeft}>
                <Ionicons name="location-outline" size={20} color={colors.warning} />
                <Text
                  style={[
                    styles.bannerText,
                    { color: colors.text, fontFamily: fonts.medium },
                  ]}>
                  Yeriniz üçün icazə verin
                </Text>
              </View>

              <Pressable
                onPress={() => Linking.openSettings()}
                style={[
                  styles.settingsBtn,
                  { backgroundColor: colors.primary, borderRadius: radius.pill },
                ]}>
                <Text style={[styles.settingsBtnText, { fontFamily: fonts.bold }]}>
                  Ayarlar
                </Text>
              </Pressable>
            </SafeAreaView>
          )}

          {/* Floating "Mənim yerim" Button (Bottom Right) */}
          {locationPermission === true && (
            <Pressable
              onPress={handleCenterOnUser}
              style={({ pressed }) => [
                styles.myLocationBtn,
                {
                  bottom: selectedHotel ? 130 : 30,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: 26,
                  opacity: pressed ? 0.85 : 1,
                },
                shadows.card,
              ]}>
              <Ionicons name="navigate" size={22} color={colors.primary} />
            </Pressable>
          )}

          {/* Selected Hotel Popup Card (Bottom) */}
          {selectedHotel && (
            <SelectedHotelCard
              hotel={selectedHotel}
              onClose={() => setSelectedHotel(null)}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
  },
  permissionBanner: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    elevation: 6,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  bannerText: {
    fontSize: 13,
  },
  settingsBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  settingsBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  myLocationBtn: {
    position: 'absolute',
    right: 16,
    width: 52,
    height: 52,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    elevation: 8,
  },
});
